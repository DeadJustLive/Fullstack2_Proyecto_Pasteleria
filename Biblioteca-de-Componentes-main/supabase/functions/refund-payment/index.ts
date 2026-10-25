import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PaymentGatewayFactory, GatewayProvider, PaymentGatewayError } from "../_shared/payment-gateway/index.ts";

// CORS: Misma restricción que en create-payment (ver comentario allá)
const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || 'https://tudominio.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { paymentId, amount, reason } = await req.json();

    if (!paymentId || !amount) {
      return new Response(JSON.stringify({ error: "Faltan parámetros requeridos" }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 1. Inicializar cliente Supabase para buscar el pago original
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: payment, error: dbError } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (dbError || !payment) {
      return new Response(JSON.stringify({ error: "Pago no encontrado" }), { 
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    if (payment.status !== 'completed') {
      return new Response(JSON.stringify({ error: "Solo se pueden reembolsar pagos completados" }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 2. Instanciar la pasarela
    const provider: GatewayProvider = payment.provider as GatewayProvider;
    const gateway = PaymentGatewayFactory.create(provider);

    // 3. Crear reembolso en la pasarela
    const refundRequest = {
      refundOrderId: `ref_${crypto.randomUUID()}`,
      originalOrderId: payment.id,
      originalGatewayTransactionId: payment.gateway_transaction_id,
      amount: amount,
      receiverEmail: payment.user_email,
      urlCallBack: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook?provider=${provider}&action=refund`
    };

    const response = await gateway.refundPayment(refundRequest);

    // 4. Registrar en base de datos si fue exitoso (estado 'refunded' o guardar el refund en otra tabla)
    // Para simplificar, si fue instantáneo lo marcamos como 'refunded', o lo dejamos en 'completed' 
    // y esperamos el webhook de callback de reembolso.
    
    return new Response(JSON.stringify({ success: true, status: response.status }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    // Logueamos el error real en el servidor, pero al cliente le enviamos un mensaje seguro
    console.error("Error en refund-payment:", error);
    const statusCode = error instanceof PaymentGatewayError ? error.statusCode : 500;
    const clientMessage = error instanceof PaymentGatewayError 
      ? error.message 
      : 'Error interno del servidor. Intente nuevamente.';
    return new Response(JSON.stringify({ error: clientMessage }), { 
      status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
