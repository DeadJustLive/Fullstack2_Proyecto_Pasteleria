// @use(kind, contract, goodPractice, learn-error)
// @kind(service)
// @contract(in: property_id + optional ig_images/ig_media -> out: { success, ig_media_id, ig_permalink } @error: InstagramSyncException)
// @goodPractice("Supports single image posts (1 image), single video, carousel posts (2-10 items) and mixed image+video carousels via Instagram Graph API v20.0.")
// @goodPractice("Idempotency check prevents duplicate publishing. Ignores ig_media_id if post was deleted from Instagram.")
// @goodPractice("Atomic sync_log finalization via finalize_sync_log() RPC prevents DB inconsistency (BUG-038).")
// @learn-error id=INSTAGRAM-001 input='publish-to-instagram only sent property.images[0]' expected='carousel post with ALL images (max 10)' actual='only first photo appeared on Instagram' fix='Implemented Graph API carousel flow: create individual item containers with is_carousel_item=true, then create CAROUSEL container with children array, then publish. Accepts optional ig_images from frontend.' category=instagram
// @learn-error id=INSTAGRAM-004 input='publish-to-instagram with ig_media containing videos' expected='video published to Instagram with media_type=VIDEO' actual='video treated as image, causing Graph API error' fix='Added ig_media[] support: each item has {url, type}. If type=video, use media_type=VIDEO + video_url. Supports mixed carousel.' category=instagram
// @learn-error id=INSTAGRAM-005 input='Edge Function could crash between IG publish success and DB sync_log update' expected='finalize_sync_log RPC atomically updates sync_log inside SQL transaction' actual='direct table upsert left window for data inconsistency' fix='Replaced direct sync_log upsert with finalize_sync_log() RPC call in atomic transaction. On crash before RPC, reconciliation job detects stuck processing records.' category=instagram
// @learn-error id=INSTAGRAM-006 input='Idempotency check only validated success status' expected='Also block if status is processing to prevent double-clicks' actual='Multiple processing sync_logs were created concurrently' fix='Added processing status to the idempotency check and local loading state to IgButton to prevent duplicate concurrent publish requests' category=instagram
// @learn-error id=INSTAGRAM-007 input='publish-to-instagram success path had no fallback when finalize_sync_log RPC failed' expected='If RPC fails, direct upsert should update sync_log to success to prevent stuck processing records' actual='Only console.error was logged, sync_log stayed processing forever. Inconsistent with error path which had direct upsert fallback' fix='Added try/catch with direct upsert fallback after RPC failure in success path, matching the existing pattern in the error path. See BUG-050.' category=instagram
// @learn-error id=INSTAGRAM-008 input='Graph API publish error: Media ID is not available' expected='Media should be fully processed before publishing' actual='Tried to publish container immediately after creation' fix='Implemented waitForProcessing polling to ensure container status is FINISHED before calling /media_publish. See BUG-060.' category=instagram
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { InstagramSyncException } from '../_shared/exceptions.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function respond(body: object, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
}

console.log("Edge Function 'publish-to-instagram' v5 (timing + safety-net) is running...");

// ─── Safety net: auto-finaliza como 'failed' si la operación excede el límite ──
// Previene sync_logs stuck en 'processing' cuando Supabase mata la función por timeout.
// El safety net se ejecuta ANTES del timeout de Supabase (~60s), dando tiempo a
// que la finalización (RPC o fallback) se complete.
const SAFETY_TIMEOUT_MS = 50_000; // 50s — 10s antes del timeout de Supabase

async function parallelBatch<T>(items: T[], batchSize: number, fn: (item: T, index: number) => Promise<string>): Promise<string[]> {
  const results: string[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((item, batchIdx) => fn(item, i + batchIdx)));
    results.push(...batchResults);
  }
  return results;
}

// Polling function to wait for Meta to process the media container
async function waitForProcessing(creationId: string, metaToken: string): Promise<void> {
    const maxAttempts = 12; // Wait up to 36 seconds (12 * 3s)
    let attempts = 0;
    
    while (attempts < maxAttempts) {
        const res = await fetch(`https://graph.facebook.com/v20.0/${creationId}?fields=status_code&access_token=${metaToken}`);
        const data = await res.json();
        
        if (data.status_code === 'FINISHED' || data.status_code === 'PUBLISHED') {
            console.log(`[SYNC] Container ${creationId} processing finished.`);
            return;
        }
        
        if (data.status_code === 'ERROR') {
            throw new Error(`Media processing failed internally at Meta (status_code: ERROR).`);
        }
        
        console.log(`[SYNC] Container ${creationId} is ${data.status_code || 'IN_PROGRESS'}, waiting...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        attempts++;
    }
    
    throw new Error(`Timeout waiting for media container ${creationId} to process.`);
}

serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        );

    let body: any = {};
    try {
        const text = await req.text();
        if (text) {
            body = JSON.parse(text);
        }
    } catch (e) {
        return respond({ success: false, error: 'Invalid JSON body' });
    }

    const tokenFromReq = body?.token || '';
    const authHeader = req.headers.get('Authorization') || (tokenFromReq ? `Bearer ${tokenFromReq}` : '');

    const supabaseUser = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
    );

    const actualToken = tokenFromReq || (authHeader ? authHeader.replace('Bearer ', '').trim() : '');
    const syncId = crypto.randomUUID();
    const propertyId = body?.property_id;

    try {
        console.time(`[TIMING] Total execution for sync_id=${syncId}`);

        if (!propertyId) throw new Error("property_id is required");

        // Verify user
        console.time(`[TIMING] Auth check`);
        const { data: { user } } = await supabaseUser.auth.getUser(actualToken);
        if (!user) throw new Error("Unauthorized");
        console.timeEnd(`[TIMING] Auth check`);

        // ─── Fetch Property (RLS-safe) ──────────────────────────────────────
        console.time(`[TIMING] Property fetch`);
        const { data: property, error: fetchErr } = await supabaseUser
            .from('properties')
            .select('title, social_text, hashtags, images, status')
            .eq('id', propertyId)
            .single();

        if (fetchErr || !property) {
            throw new InstagramSyncException(
                "Property not found or RLS access denied",
                syncId, propertyId, false
            );
        }
        console.timeEnd(`[TIMING] Property fetch`);

        if (property.status !== 'published') {
            throw new InstagramSyncException(
                "Property must be in 'published' status to sync to Instagram",
                syncId, propertyId, false
            );
        }

        // ─── Resolve Instagram Token & Account ID ─────────────────────
        console.time(`[TIMING] Token resolution`);
        const { metaToken, igUserId, tokenSource } = await resolveUserInstagramCredentials(
            supabaseAdmin, user.id, syncId, propertyId
        );
        console.timeEnd(`[TIMING] Token resolution`);

        // ─── Idempotency Check (after token resolve, to verify IG post existence) ──
        console.time(`[TIMING] Idempotency check`);
        const { data: existing } = await supabaseAdmin
            .from('sync_logs')
            .select('id, ig_media_id, ig_permalink, status, created_at')
            .eq('property_id', propertyId)
            .in('status', ['success', 'processing'])
            .eq('platform', 'instagram')
            .order('created_at', { ascending: false })
            .limit(1);

        if (existing?.length) {
            const existingLog = existing[0];

            if (existingLog.status === 'processing') {
                const createdTime = new Date(existingLog.created_at).getTime();
                if (Date.now() - createdTime < 5 * 60 * 1000) {
                    console.log(`[IDEMPOTENCY] IG sync ${existingLog.id} is already processing. Blocking duplicate request.`);
                    return respond({
                        success: false,
                        message: 'Esta publicación ya se está procesando en Instagram.',
                        existing_sync_id: existingLog.id,
                    });
                }
                // If it's been processing for > 5 minutes, assume it's stuck/crashed and allow retry
                console.log(`[IDEMPOTENCY] IG sync ${existingLog.id} is stuck processing. Allowing retry.`);
            } else {
                // If we have an IG media ID, verify it still exists on Instagram
                if (existingLog.ig_media_id) {
                try {
                    const verifyRes = await fetch(
                        `https://graph.facebook.com/v20.0/${existingLog.ig_media_id}?fields=id&access_token=${metaToken}`
                    );
                    if (verifyRes.ok) {
                        // Post still exists → block re-publish
                        console.log(`[IDEMPOTENCY] IG media ${existingLog.ig_media_id} still exists. Blocking re-publish.`);
                        return respond({
                            success: false,
                            message: 'Esta propiedad ya fue publicada en Instagram.',
                            existing_sync_id: existingLog.id,
                            ig_permalink: existingLog.ig_permalink,
                        }, 409);
                    }
                    // Post was deleted from Instagram → allow re-publish
                    console.log(`[IDEMPOTENCY] IG media ${existingLog.ig_media_id} no longer exists. Allowing re-publish.`);
                } catch {
                    // If verification fails (network error), block to be safe
                    console.warn(`[IDEMPOTENCY] Failed to verify IG media ${existingLog.ig_media_id}. Blocking re-publish.`);
                    return respond({
                        success: false,
                        message: 'No se pudo verificar el estado en Instagram. Intenta de nuevo.',
                        existing_sync_id: existingLog.id,
                    }, 409);
                }
            } else {
                // No ig_media_id stored (legacy), block to be safe
                console.log(`[IDEMPOTENCY] Property ${propertyId} has sync_log success but no ig_media_id. Blocking.`);
                return respond({
                    success: false,
                    message: 'Esta propiedad ya fue publicada en Instagram.',
                    existing_sync_id: existingLog.id,
                    ig_permalink: existingLog.ig_permalink,
                }, 409);
            }

            }

            // If we get here, IG post was deleted or stuck → delete old sync_log to allow re-publish
            await supabaseAdmin.from('sync_logs')
                .delete()
                .eq('property_id', propertyId)
                .eq('platform', 'instagram');
            console.log(`[IDEMPOTENCY] Deleted old sync_log for property ${propertyId} to allow re-publish.`);
        }
        console.timeEnd(`[TIMING] Idempotency check`);

        // ─── Insert sync_log (processing) ───────────────────────────────────
        const caption = [
            property.social_text || property.title,
            '',
            (property.hashtags || []).join(' '),
        ].join('\n').trim();

        await supabaseAdmin.from('sync_logs').insert({
            sync_id: syncId,
            property_id: propertyId,
            platform: 'instagram',
            status: 'processing',
            social_text: property.social_text,
            hashtags: property.hashtags,
        });

        console.log(`[SYNC] Publishing "${property.title}" to Instagram (sync_id: ${syncId}, token_source: ${tokenSource})...`);

        // ─── Determine media to publish ──────────────────────────────────────
        // Use ig_media if provided (from IgMediaSelector with {url, type}),
        // fallback to ig_images (legacy image selector), fallback to all property images
        const igMedia = (body?.ig_media as { url: string; type: string }[] | undefined);
        const allImages = (body?.ig_images as string[] | undefined) || property.images || [];

        interface MediaItem { url: string; type: 'IMAGE' | 'VIDEO'; }
        const mediaItems: MediaItem[] = igMedia
            ? igMedia.slice(0, 10).map(m => ({ url: m.url, type: m.type === 'video' ? 'VIDEO' : 'IMAGE' }))
            : allImages.slice(0, 10).map(url => ({ url, type: 'IMAGE' }));

        if (!mediaItems.length) {
            throw new InstagramSyncException(
                "Property has no media. At least one image or video is required for Instagram.",
                syncId, propertyId, false
            );
        }

        let creationId: string;

        // ─── Graph API v20.0: Create media container(s) ─────────────────────
        console.time(`[TIMING] Graph API — Media container creation (${mediaItems.length} item(s))`);
        if (mediaItems.length === 1) {
            // ── Single media post (image or video) ─────────────────────────
            const item = mediaItems[0];
            const isVideo = item.type === 'VIDEO';
            const mediaBody: Record<string, unknown> = {
                caption: caption.slice(0, 2200),
                access_token: metaToken,
            };

            if (isVideo) {
                mediaBody.media_type = 'VIDEO';
                mediaBody.video_url = item.url;
            } else {
                mediaBody.image_url = item.url;
            }

            const containerRes = await fetch(
                `https://graph.facebook.com/v20.0/${igUserId}/media`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mediaBody),
            });

            const containerData = await containerRes.json();
            if (!containerRes.ok || containerData.error) {
                throw new InstagramSyncException(
                    `Graph API container error: ${containerData.error?.message || containerRes.statusText}`,
                    syncId, propertyId, true
                );
            }
            creationId = containerData.id;
            console.log(`[SYNC] Single ${isVideo ? 'video' : 'image'} container created: ${creationId}`);

        } else {
            // ── Carousel post (2-10 items, mixed image+video supported) ──────
            // Step 1: Create individual carousel item containers in parallel (batch of 5 to avoid rate limits)
            const childrenIds: string[] = await parallelBatch(mediaItems, 5, async (item, i) => {
                const isVideo = item.type === 'VIDEO';
                const itemBody: Record<string, unknown> = {
                    is_carousel_item: true,
                    access_token: metaToken,
                };

                if (isVideo) {
                    itemBody.media_type = 'VIDEO';
                    itemBody.video_url = item.url;
                } else {
                    itemBody.image_url = item.url;
                }

                const itemRes = await fetch(
                    `https://graph.facebook.com/v20.0/${igUserId}/media`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(itemBody),
                });

                const itemData = await itemRes.json();
                if (!itemRes.ok || itemData.error) {
                    throw new InstagramSyncException(
                        `Carousel item ${i + 1} (${isVideo ? 'video' : 'image'}) error: ${itemData.error?.message || itemRes.statusText}`,
                        syncId, propertyId, true
                    );
                }
                console.log(`[SYNC] Carousel item ${i + 1}/${mediaItems.length} (${isVideo ? 'video' : 'image'}) created: ${itemData.id}`);
                return itemData.id as string;
            });

            // Step 2: Create CAROUSEL container grouping all items
            const carouselRes = await fetch(
                `https://graph.facebook.com/v20.0/${igUserId}/media`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    media_type: 'CAROUSEL',
                    children: childrenIds,
                    caption: caption.slice(0, 2200),
                    access_token: metaToken,
                }),
            });

            const carouselData = await carouselRes.json();
            if (!carouselRes.ok || carouselData.error) {
                throw new InstagramSyncException(
                    `Graph API carousel container error: ${carouselData.error?.message || carouselRes.statusText}`,
                    syncId, propertyId, true
                );
            }
            creationId = carouselData.id;
            console.log(`[SYNC] Carousel container created: ${creationId} (${mediaItems.length} items)`);
        }
        console.timeEnd(`[TIMING] Graph API — Media container creation (${mediaItems.length} item(s))`);

        // ─── Graph API v20.0: Step 1.5 — Wait for Processing ────────────────
        console.time(`[TIMING] Graph API — Wait for processing`);
        await waitForProcessing(creationId, metaToken);
        console.timeEnd(`[TIMING] Graph API — Wait for processing`);

        // ─── Graph API v20.0: Step 2 — Publish Media ────────────────────────
        console.time(`[TIMING] Graph API — Media publish + permalink`);
        const publishRes = await fetch(
            `https://graph.facebook.com/v20.0/${igUserId}/media_publish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                creation_id: creationId,
                access_token: metaToken,
            }),
        });

        const publishData = await publishRes.json();

        if (!publishRes.ok || publishData.error) {
            throw new InstagramSyncException(
                `Graph API publish error: ${publishData.error?.message || publishRes.statusText}`,
                syncId, propertyId, true
            );
        }

        const igMediaId = publishData.id;
        console.log(`[SYNC] Published successfully! IG Media ID: ${igMediaId} (${mediaItems.length} item${mediaItems.length > 1 ? 's' : ''})`);

        // ─── Fetch permalink ────────────────────────────────────────────────
        let igPermalink = '';
        try {
            const permalinkRes = await fetch(
                `https://graph.facebook.com/v20.0/${igMediaId}?fields=permalink&access_token=${metaToken}`
            );
            const permalinkData = await permalinkRes.json();
            igPermalink = permalinkData.permalink || '';
        } catch { /* non-critical */ }
        console.timeEnd(`[TIMING] Graph API — Media publish + permalink`);

        // ─── Atomic finalize sync_log → success ─────────────────────────────
        // Uses finalize_sync_log RPC (SQL transaction) from BUG-038
        // to prevent data inconsistency if the function crashes between
        // IG publish success and DB update.
        const { error: finalizeError } = await supabaseAdmin.rpc('finalize_sync_log', {
            p_sync_id: syncId,
            p_status: 'success',
            p_ig_media_id: igMediaId,
            p_ig_permalink: igPermalink,
            p_error_message: null,
        });

        if (finalizeError) {
            console.error(`[CRITICAL] IG published (media_id=${igMediaId}) but RPC finalize_sync_log failed for sync_id=${syncId}: ${finalizeError.message}`);
            try {
                await supabaseAdmin.from('sync_logs').update({
                    status: 'success',
                    ig_media_id: igMediaId,
                    ig_permalink: igPermalink,
                    completed_at: new Date().toISOString()
                }).eq('sync_id', syncId);
                console.log(`[SYNC] Fallback update succeeded for sync_id=${syncId}`);
            } catch (e2) {
                console.error('[CRITICAL] Even fallback update failed for sync_id=' + syncId + ':', e2);
            }
        }

        console.timeEnd(`[TIMING] Total execution for sync_id=${syncId}`);

        return respond({
            success: true,
            message: "Publicado exitosamente en Instagram",
            ig_media_id: igMediaId,
            ig_permalink: igPermalink,
            sync_id: syncId,
            token_source: tokenSource,
        });

    } catch (error) {
        console.timeEnd(`[TIMING] Total execution for sync_id=${syncId}`);
        console.error(`[SYNC ERROR] ${error.message}`);

        const isKnown = error instanceof InstagramSyncException;
        try {
            await supabaseAdmin.rpc('finalize_sync_log', {
                p_sync_id: syncId,
                p_status: 'failed',
                p_ig_media_id: null,
                p_ig_permalink: null,
                p_error_message: error.message?.slice(0, 500),
            });
        } catch (e) {
            // Fallback: direct upsert if RPC fails (e.g. migration not applied)
            try {
                await supabaseAdmin.from('sync_logs').upsert({
                    sync_id: syncId,
                    property_id: propertyId || 'unknown',
                    platform: 'instagram',
                    status: 'failed',
                    error_message: error.message?.slice(0, 500),
                    completed_at: new Date().toISOString(),
                }, { onConflict: 'sync_id' });
            } catch (e2) {
                console.error('[SYNC ERROR] Failed to write error log (both RPC and fallback):', e2);
            }
        }

        return respond({
            success: false,
            error: isKnown ? 'Error al publicar en Instagram: ' + error.message : 'Error interno del servidor: ' + error.message,
            sync_id: syncId,
            retriable: isKnown ? error.retriable : false,
        });
    }
    } catch (globalError) {
        const err = globalError as any;
        console.error('[publish-to-instagram] Global crash:', err.message, err.stack);
        return new Response(JSON.stringify({
            success: false,
            error: 'Error interno del servidor',
            code: 'INTERNAL_ERROR',
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// Token Resolution by User
// ─────────────────────────────────────────────────────────────────────────────

interface ResolvedCredentials {
    metaToken: string;
    igUserId: string;
    tokenSource: 'oauth_db' | 'manual_secret';
}

async function resolveUserInstagramCredentials(
    supabaseAdmin: ReturnType<typeof createClient>,
    userId: string,
    syncId: string,
    propertyId: string,
): Promise<ResolvedCredentials> {
    // ── 1. Try instagram_connections table (OAuth tokens) ──────────────────
    const { data: connection } = await supabaseAdmin
        .from('instagram_connections')
        .select('id, ig_user_id, access_token_encrypted, token_decrypted_nonce, expires_at, ig_username, status')
        .eq('status', 'active')
        .maybeSingle();

    if (connection?.access_token_encrypted && connection?.ig_user_id) {
        const encryptKey = Deno.env.get('TOKEN_ENCRYPTION_KEY');

        let token = connection.access_token_encrypted;

        if (encryptKey) {
            const { data: decrypted, error: decError } = await supabaseAdmin.rpc(
                'decrypt_token',
                {
                    p_encrypted: connection.access_token_encrypted,
                    p_key: encryptKey,
                }
            );
            if (!decError && decrypted) {
                token = decrypted;
            } else {
                // Fallback: token might be plaintext (Phase 1 migration)
                console.warn(`[TOKEN] Decryption failed, using stored value as-is for @${connection.ig_username}`);
            }
        }

        // ── Auto-refresh if token expires within 5 days ─────────────────
        // Meta long-lived tokens last ~60 days. We refresh at day 55
        // (5 days before expiry) to maintain a safety buffer.
        let finalToken = token;
        if (connection.expires_at) {
            const expiresAt = new Date(connection.expires_at);
            const fiveDaysFromNow = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

            if (expiresAt <= fiveDaysFromNow) {
                console.log(`[TOKEN] Token for @${connection.ig_username} expires ${expiresAt.toISOString()}, attempting refresh...`);
                const refreshed = await refreshLongLivedToken(finalToken);

                if (refreshed) {
                    finalToken = refreshed.access_token;

                    let newEncrypted = finalToken;
                    if (encryptKey) {
                        const { data: enc } = await supabaseAdmin.rpc(
                            'encrypt_token',
                            { p_token: finalToken, p_key: encryptKey }
                        );
                        if (enc) newEncrypted = enc;
                    }

                    await supabaseAdmin.from('instagram_connections').update({
                        access_token_encrypted: newEncrypted,
                        expires_at: refreshed.expires_at,
                        last_validated_at: new Date().toISOString(),
                    }).eq('id', connection.id);

                    await supabaseAdmin.from('instagram_token_events').insert({
                        connection_id: connection.id,
                        action: 'token_refresh',
                        status: 'success',
                        metadata: {
                            expires_at: refreshed.expires_at,
                        },
                    });

                    console.log(`[TOKEN] Token refreshed successfully for @${connection.ig_username}, new expiry: ${refreshed.expires_at}`);
                } else {
                    console.warn(`[TOKEN] Refresh failed for @${connection.ig_username}, using existing token.`);
                    await supabaseAdmin.from('instagram_token_events').insert({
                        connection_id: connection.id,
                        action: 'token_refresh',
                        status: 'failed',
                        metadata: { error: 'Refresh API returned null' },
                    });
                }
            }
        }

        console.log(`[TOKEN] Using OAuth token from instagram_connections for @${connection.ig_username}`);
        return {
            metaToken: finalToken,
            igUserId: connection.ig_user_id,
            tokenSource: 'oauth_db',
        };
    }

    // ── 2. Fallback: read from Supabase Secrets ─────────────────────────────
    const metaToken = Deno.env.get('INSTAGRAM_TOKEN');
    const igUserId = Deno.env.get('INSTAGRAM_USER_ACCOUNT_ID');

    if (!metaToken || !igUserId) {
        throw new InstagramSyncException(
            "No Instagram credentials found. Connect your account via OAuth or configure INSTAGRAM_TOKEN and INSTAGRAM_USER_ACCOUNT_ID secrets.",
            syncId, propertyId, false
        );
    }

    console.log(`[TOKEN] Using manual secret INSTAGRAM_TOKEN (fallback)`);
    return {
        metaToken,
        igUserId,
        tokenSource: 'manual_secret',
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Long-Lived Token Refresh
//
// TOKEN LIFECYCLE:
//   1. OAuth code  ──►  short-lived token (expires in hours)
//   2. Exchange     ──►  long-lived token  (expires in ~60 days)
//   3. Store        ──►  instagram_connections.access_token_encrypted
//   4. Refresh      ──►  Every 55 days (5 days before expiry),
//                        exchange current long-lived token for a new one.
//                        Meta extends expiry another ~60 days from refresh date.
//
//   Timeline example:
//     Day  0: Token created, expires Day 60
//     Day 55: Refresh → new token, expires Day 115
//     Day 110: Refresh → new token, expires Day 170
//
//   IMPORTANT: Meta does NOT allow refreshing an already-expired token.
//   The 5-day buffer ensures we always refresh while the token is still valid.
//
//   Refresh endpoint: GET /oauth/access_token
//     ?grant_type=fb_exchange_token
//     &fb_exchange_token={current_long_lived_token}
//     &client_id={app_id}
//     &client_secret={app_secret}
// ─────────────────────────────────────────────────────────────────────────────

interface RefreshedToken {
    access_token: string;
    expires_at: string;
}

async function refreshLongLivedToken(currentToken: string): Promise<RefreshedToken | null> {
    try {
        const appId = Deno.env.get('INSTAGRAM_APP_ID');
        const appSecret = Deno.env.get('INSTAGRAM_APP_SECRET');

        if (!appId || !appSecret) {
            console.warn('[TOKEN] Cannot refresh: INSTAGRAM_APP_ID or INSTAGRAM_APP_SECRET missing');
            return null;
        }

        const res = await fetch(
            `https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${currentToken}`
        );

        const data = await res.json();

        if (!res.ok || data.error) {
            console.error(`[TOKEN] Refresh API error: ${data.error?.message || res.statusText}`);
            return null;
        }

        const expiresAt = data.expires_in
            ? new Date(Date.now() + data.expires_in * 1000).toISOString()
            : null;

        return {
            access_token: data.access_token,
            expires_at: expiresAt || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        };
    } catch (err) {
        console.error(`[TOKEN] Refresh exception: ${err.message}`);
        return null;
    }
}
