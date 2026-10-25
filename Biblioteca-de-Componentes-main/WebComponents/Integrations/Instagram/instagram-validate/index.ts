// @use(kind, contract, goodPractice)
// @kind(service)
// @contract(Validates Instagram connection is still active, fetches IG profile info)
// @goodPractice("Returns 204 for OPTIONS preflight. CORS headers on ALL responses including errors.")
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function respond(body: object, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
}

serve(async (req) => {
    // CORS preflight — responder rápido con 204
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
        const body = req.headers.get('content-type')?.includes('application/json') ? await req.json().catch(() => ({})) : {};
        const { token } = body;
        
        const authHeader = req.headers.get('Authorization') || (token ? `Bearer ${token}` : '');
        if (!authHeader) {
            return respond({ success: false, error: "Falta header de Authorization o token en el body" }, 401);
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

        const actualToken = token || authHeader.replace('Bearer ', '').trim();
        const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } }
        });

        const { data: { user }, error: authError } = await supabaseUser.auth.getUser(actualToken);
        if (authError || !user) {
            return respond({ success: false, error: "No autorizado: JWT inválido" }, 401);
        }

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { data: connection } = await supabaseAdmin
            .from('instagram_connections')
            .select('*')
            .eq('status', 'active')
            .maybeSingle();

        if (!connection) {
            return respond({
                success: false,
                error: "No hay cuenta de Instagram conectada. Conecta una cuenta primero.",
            });
        }

        let instagramToken = connection.access_token_encrypted;
        const encryptKey = Deno.env.get('TOKEN_ENCRYPTION_KEY');

        if (encryptKey) {
            const { data: decrypted, error: decError } = await supabaseAdmin.rpc(
                'decrypt_token',
                { p_encrypted: connection.access_token_encrypted, p_key: encryptKey }
            );
            if (!decError && decrypted) {
                instagramToken = decrypted;
            }
        }

        const igUserId = connection.ig_user_id;
        const validateUrl = `https://graph.facebook.com/v20.0/${igUserId}?fields=id,username,name,profile_picture_url&access_token=${instagramToken}`;
        const validateRes = await fetch(validateUrl);
        const validateData = await validateRes.json();

        if (!validateRes.ok || validateData.error) {
            const isAuthError = validateData.error?.code === 190;
            const newStatus = isAuthError ? 'expired' : 'refresh_failed';

            await supabaseAdmin
                .from('instagram_connections')
                .update({
                    status: newStatus,
                    last_validated_at: new Date().toISOString(),
                })
                .eq('id', connection.id);

            await supabaseAdmin
                .from('instagram_token_events')
                .insert({
                    connection_id: connection.id,
                    action: 'validation_failed',
                    status: 'failed',
                    metadata: {
                        error_code: validateData.error?.code,
                        error_message: validateData.error?.message,
                    },
                });

            return respond({
                success: false,
                error: isAuthError
                    ? 'La conexión con Instagram expiró. Reconecta tu cuenta.'
                    : `Error de Meta: ${validateData.error?.message || validateRes.statusText}`,
            }, 400);
        }

        await supabaseAdmin
            .from('instagram_connections')
            .update({
                status: 'active',
                last_validated_at: new Date().toISOString(),
            })
            .eq('id', connection.id);

        return respond({
            success: true,
            message: "Conexión con Instagram validada correctamente.",
            instagram_account: {
                id: validateData.id,
                username: validateData.username,
                name: validateData.name,
                profile_picture_url: validateData.profile_picture_url,
            },
        });

    } catch (error: any) {
        console.error(`[VALIDATE ERROR] ${error.message}`);

        return respond({
            success: false,
            error: error.message,
        }, 400);
    }
});
