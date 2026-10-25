import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PaymentGatewayFactory, WebhookPayload } from "../_shared/payment-gateway/index.ts";

serve(async (req) => {
  // Los webhooks usualmente son POST y no requieren CORS pre-flight, 
  // pero lo agregamos por si la pasarela lo requiere o para debugging.
  if (req.method === 'OPTIONS') {
    return new Response('ok');
  }

  try {
    // 1. Obtener la data raw del webhook
    // Clave: usar req.text() porque el módulo necesita el texto plano para extraer form-data o verificar firmas
    const rawBody = await req.text();
    const url = new URL(req.url);

    const payload: WebhookPayload = {
      rawBody: rawBody,
      headers: Object.fromEntries(req.headers.entries()),
      searchParams: url.searchParams
    };

    // 2. Instanciar la pasarela (podemos deducir cuál es si tenemos un parámetro en la URL, ej: ?provider=flow)
    // Para este ejemplo, forzaremos Flow.
    const providerName = url.searchParams.get('provider') as any || 'flow';
    const gateway = PaymentGatewayFactory.create(providerName);

    // 3. Procesar el Webhook mediante el módulo universal
    // Esto internamente se comunica con Flow, valida la firma, etc.
    const result = await gateway.processWebhook(payload);

    if (result.isValid) {
      // 4. Actualizar la base de datos
      // Usamos el Service Role Key porque los webhooks son peticiones de servidor a servidor (sin usuario logueado)
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { error: updateError } = await supabaseClient.from('payments').update({
        status: result.status,
        gateway_transaction_id: result.gatewayTransactionId
      }).eq('id', result.orderId);

      // ============================================================
      // LOG ESTRUCTURADO: En producción necesitas trazabilidad.
      // Este log te permite rastrear exactamente qué pasó con
      // cada notificación de pago en los logs de Supabase.
      // ============================================================
      if (updateError) {
        console.error('ALERTA WEBHOOK: Flow confirmó pago pero falló UPDATE en DB:', {
          orderId: result.orderId,
          gatewayTransactionId: result.gatewayTransactionId,
          status: result.status,
          error: updateError
        });
      } else {
        console.log(JSON.stringify({
          event: 'webhook_processed',
          orderId: result.orderId,
          status: result.status,
          gatewayTransactionId: result.gatewayTransactionId,
          timestamp: new Date().toISOString()
        }));
      }

      // 5. RESPUESTA RÁPIDA (Regla de los 15 segundos)
      // Debe ser un status 200 para que Flow no marque error.
      return new Response('OK', { status: 200 });
    } else {
      console.warn("Firma de webhook inválida detectada.");
      return new Response('Invalid Signature', { status: 401 });
    }

  } catch (error: any) {
    if (error.name === 'SignatureValidationError') {
      console.warn("Firma de webhook inválida detectada.");
      return new Response('Invalid Signature', { status: 401 });
    } else if (error.name === 'PaymentGatewayError' || error.message.includes('No token')) {
      console.warn("Error de validación en webhook:", error.message);
      return new Response('Bad Request', { status: 400 });
    }
    
    // ============================================================
    // En webhooks NO revelamos detalles del error a quien nos llamó.
    // Podría ser un atacante intentando obtener info de nuestro sistema.
    // ============================================================
    console.error("Error crítico en payment-webhook:", error);
    return new Response('Internal Server Error', { status: 500 });
  }
});
