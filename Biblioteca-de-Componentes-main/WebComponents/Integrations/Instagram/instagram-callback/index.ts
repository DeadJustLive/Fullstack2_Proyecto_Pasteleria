import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

serve(async (req) => {
  const rawFrontend = Deno.env.get("FRONTEND_URL") ?? "http://localhost:5173";
  // Strip trailing slashes but preserve scheme:// (e.g., inmobiliaria:// stays inmobiliaria://)
  const FRONTEND_URL = rawFrontend.endsWith('://') ? rawFrontend : rawFrontend.replace(/\/+$/, '');

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const stateParam = url.searchParams.get("state");

    if (!code) {
      return smartRedirect(`${FRONTEND_URL}/configuracion?error=missing_code`);
    }

    let propertyId: string | null = null;
    let userId: string | null = null;
    let nonce: string | null = null;
    let returnUrl: string | null = null;

    if (stateParam) {
      try {
        const state = JSON.parse(atob(stateParam));
        propertyId = state.propertyId || null;
        userId = state.userId || null;
        nonce = state.nonce || null;
        returnUrl = state.returnUrl || null;
      } catch (e) {
        console.error("Failed to parse state", e);
      }
    }

    if (!userId) {
      return smartRedirect(`${FRONTEND_URL}/configuracion?error=missing_user_in_state`);
    }

    // ── CSRF Verification: Validate OAuth challenge ──────────────────────
    // The nonce was stored in oauth_challenges by instagram-authorize.
    // We verify it exists, is unused, and hasn't expired.
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    if (nonce) {
      const { data: challenge, error: challengeError } = await supabaseAdmin
        .from('oauth_challenges')
        .select('id, used, expires_at')
        .eq('user_id', userId)
        .eq('nonce', nonce)
        .maybeSingle();

      if (challengeError || !challenge) {
        console.error('[CSRF] Challenge not found:', challengeError);
        return smartRedirect(`${FRONTEND_URL}/configuracion?error=invalid_oauth_state`);
      }

      if (challenge.used) {
        console.error('[CSRF] Challenge already used — possible replay attack');
        return smartRedirect(`${FRONTEND_URL}/configuracion?error=oauth_state_reused`);
      }

      if (new Date(challenge.expires_at) < new Date()) {
        console.error('[CSRF] Challenge expired');
        return smartRedirect(`${FRONTEND_URL}/configuracion?error=oauth_state_expired`);
      }

      // Mark challenge as used (one-time)
      await supabaseAdmin
        .from('oauth_challenges')
        .update({ used: true })
        .eq('id', challenge.id);

      console.log(`[CSRF] Challenge verified for user ${userId}`);
    } else {
      console.warn('[CSRF] No nonce in state — cannot verify CSRF');
      // Still allow for backward compatibility, but log warning
    }

    const appId = Deno.env.get("INSTAGRAM_APP_ID");
    const appSecret = Deno.env.get("INSTAGRAM_APP_SECRET");
    const redirectUri = Deno.env.get("INSTAGRAM_REDIRECT_URI");

    if (!appId || !appSecret || !redirectUri) {
      throw new Error("Missing Meta App configuration");
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 1: Exchange OAuth code → short-lived access token (hours)
    // STEP 2: Exchange short-lived → long-lived access token (~60 days)
    //
    // The long-lived token is the ONLY token we store and use.
    // It will be refreshed every 55 days by publish-to-instagram or the CRON job.
    // ──────────────────────────────────────────────────────────────────────────

    const tokenResponse = await fetch("https://graph.facebook.com/v20.0/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        redirect_uri: redirectUri,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(`Token exchange failed: ${tokenData.error.message}`);
    }

    const shortLivedToken = tokenData.access_token;

    // 2. Exchange for long-lived access token
    const longLivedTokenResponse = await fetch(
      `https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`
    );
    const longLivedTokenData = await longLivedTokenResponse.json();
    const accessToken = longLivedTokenData.access_token || shortLivedToken;
    const expiresIn = longLivedTokenData.expires_in || tokenData.expires_in;
    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null;

    // 3. Get Pages and connected Instagram Business Accounts
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v20.0/me/accounts?fields=instagram_business_account{id,username,name,profile_picture_url},name,id&access_token=${accessToken}`
    );
    const pagesData = await pagesResponse.json();

    if (pagesData.error) {
      throw new Error(`Pages fetch failed: ${pagesData.error.message}`);
    }

    let igAccountId = null;
    let igUsername = null;
    let igProfilePicture = null;
    let foundPageName = null;

    console.log(`Checking ${pagesData.data?.length || 0} pages for Instagram Business Accounts...`);

    for (const page of pagesData.data || []) {
      if (page.instagram_business_account) {
        igAccountId = page.instagram_business_account.id;
        igUsername = page.instagram_business_account.username;
        igProfilePicture = page.instagram_business_account.profile_picture_url;
        foundPageName = page.name;
        console.log(`Found IG Account @${igUsername} on page "${page.name}"`);
        break;
      }
    }

    if (!igAccountId) {
      console.error("No Instagram Business Account found on any of the user's pages.");
      console.log("Pages found:", JSON.stringify(pagesData.data?.map((p: any) => ({ name: p.name, has_ig: !!p.instagram_business_account }))));
      const redirectBase = returnUrl || `${FRONTEND_URL}/configuracion`;
      return smartRedirect(`${redirectBase}?error=no_ig_account_found`);
    }

    // 4. Save to database using service role
    // (supabaseAdmin already created above for CSRF verification)
    const encryptKey = Deno.env.get("TOKEN_ENCRYPTION_KEY");

    let encryptedToken = accessToken;
    let tokenNonce = '';

    if (encryptKey) {
      try {
        const { data: encrypted, error: encError } = await supabaseAdmin.rpc('encrypt_token', {
          p_token: accessToken,
          p_key: encryptKey,
        });
        if (!encError && encrypted) {
          encryptedToken = encrypted;
          tokenNonce = encryptKey.substring(0, 8);
        }
      } catch (encErr) {
        console.warn("Token encryption failed, storing plain:", encErr);
      }
    }

    const connectionData = {
      user_id: userId,
      ig_user_id: igAccountId,
      ig_username: igUsername,
      ig_profile_picture_url: igProfilePicture,
      access_token_encrypted: encryptedToken,
      token_decrypted_nonce: tokenNonce,
      expires_at: expiresAt,
      status: 'active',
      connected_by: userId,
      last_validated_at: new Date().toISOString(),
    };



    const { data: existingConnection } = await supabaseAdmin
      .from("instagram_connections")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    let connectionId;

    if (existingConnection) {
      const { error: updateError } = await supabaseAdmin
        .from("instagram_connections")
        .update(connectionData)
        .eq('id', existingConnection.id);

      if (updateError) {
        console.error("Update error:", updateError);
        throw new Error("Failed to update Instagram connection");
      }
      connectionId = existingConnection.id;
    } else {
      const { data: newConn, error: insertError } = await supabaseAdmin
        .from("instagram_connections")
        .insert(connectionData)
        .select('id')
        .single();

      if (insertError || !newConn) {
        console.error("Insert error:", insertError);
        throw new Error("Failed to save Instagram connection");
      }
      connectionId = newConn.id;
    }

    // 5. Record token event
    try {
      await supabaseAdmin
        .from("instagram_token_events")
        .insert({
          connection_id: connectionId,
          action: 'connection_created',
          status: 'success',
          metadata: {
            ig_user_id: igAccountId,
            ig_username: igUsername,
            expires_at: expiresAt,
            connected_by: userId,
          },
        });
    } catch (eventErr) {
      console.warn("Failed to record token event:", eventErr);
    }

    const redirectBase = returnUrl || `${FRONTEND_URL}/configuracion`;
    const finalUrl = `${redirectBase}?success=true&provider=instagram&username=${igUsername}`;

    return smartRedirect(finalUrl);
  } catch (error: any) {
    console.error("Callback error:", error);
    const errorUrl = `${FRONTEND_URL}/configuracion?error=${encodeURIComponent(error.message || 'Unknown error')}`;
    return smartRedirect(errorUrl);
  }
});

/** Redirect helper that supports custom URL schemes (inmobiliaria://, etc.) */
function smartRedirect(url: string): Response {
  // Standard HTTP(S) redirect
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return Response.redirect(url, 302);
  }
  // Custom scheme: return an HTML page that redirects via JS + meta tag
  const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0;url=${url}">
<title>Redirigiendo...</title>
</head><body>
<p>Redirigiendo a la aplicación...</p>
<script>window.location.href = ${JSON.stringify(url)};</script>
</body></html>`;
  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
