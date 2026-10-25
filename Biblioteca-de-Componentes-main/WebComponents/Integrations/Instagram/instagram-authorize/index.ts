import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let body: any;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Failed to parse body", detail: (e as Error).message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { propertyId, token, returnUrl } = body;

    const authHeader = req.headers.get('Authorization') || (token ? `Bearer ${token}` : '');
    const actualToken = token || authHeader.replace('Bearer ', '').trim();

    if (!actualToken) {
      return new Response(JSON.stringify({ error: "No token provided" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${actualToken}` } }
    });

    // Service role client for admin operations (storing challenges)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(actualToken);

    if (userError || !user) {
      return new Response(JSON.stringify({ 
        error: 'Unauthorized',
        details: userError?.message || "No user found",
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const appId = Deno.env.get("INSTAGRAM_APP_ID");
    const redirectUri = Deno.env.get("INSTAGRAM_REDIRECT_URI");

    if (!appId || !redirectUri) {
      return new Response(JSON.stringify({ error: "Missing Meta App configuration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const nonce = crypto.randomUUID();

    // ── CSRF Protection: Store challenge in DB ─────────────────────────
    // The challenge will be verified in instagram-callback to prevent
    // CSRF attacks where an attacker intercepts the callback.
    try {
      await supabaseAdmin.from('oauth_challenges').insert({
        user_id: user.id,
        nonce,
        metadata: {
          propertyId: propertyId || null,
          returnUrl: returnUrl || null,
        },
      });
      console.log(`[CSRF] Challenge stored for user ${user.id}`);
    } catch (challengeErr) {
      console.error('[CSRF] Failed to store challenge:', challengeErr);
      return new Response(JSON.stringify({
        error: 'Failed to initialize OAuth challenge. Please try again.',
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const state = btoa(JSON.stringify({
      propertyId,
      userId: user.id,
      nonce,
      returnUrl,
    }));

    const scopes = [
      "instagram_basic",
      "instagram_content_publish",
      "pages_show_list",
      "pages_read_engagement",
      "business_management"
    ].join(",");

    const oauthUrl = new URL("https://www.facebook.com/v20.0/dialog/oauth");
    oauthUrl.searchParams.append("client_id", appId);
    oauthUrl.searchParams.append("redirect_uri", redirectUri);
    oauthUrl.searchParams.append("response_type", "code");
    oauthUrl.searchParams.append("scope", scopes);
    oauthUrl.searchParams.append("state", state);

    return new Response(
      JSON.stringify({ url: oauthUrl.toString() }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("[instagram-authorize] Error:", error.message, error.stack);
    return new Response(JSON.stringify({
      error: "Error al iniciar autorización de Instagram",
      code: "AUTHORIZATION_ERROR",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
