import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PaymentGatewayFactory, GatewayProvider, PaymentGatewayError } from "../_shared/payment-gateway/index.ts";

// ============================================================
// CORS: Restringimos a nuestro dominio para que SOLO nuestro
// frontend pueda llamar a esta función. Si dejáramos '*',
// cualquier sitio web del mundo podría generar cobros.
// En producción, define ALLOWED_ORIGIN en tus variables de entorno.
// ============================================================
const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || 'https://tudominio.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Manejo de pre-flight requests para CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { idempotencyKey, amount, email, subject, providerName, urlReturn } = await req.json();

    // ============================================================
    // VALIDACIÓN DE INPUTS: Verificamos que los datos del cliente
    // sean razonables antes de enviarlos a Flow. Esto previene:
    // - Cobros negativos o de $0 (fraude o error del frontend)
    // - Emails inválidos que Flow rechazaría de todas formas
    // - Montos absurdamente altos por error o manipulación
    // Flow Chile exige un mínimo de CLP $350 por transacción.
    // ============================================================
    if (!idempotencyKey || !amount || !email) {
      return new Response(JSON.stringify({ error: "Faltan parámetros requeridos (idempotencyKey, amount, email)" }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    if (typeof amount !== 'number' || !Number.isInteger(amount) || amount < 350 || amount > 50000000) {
      return new Response(JSON.stringify({ error: "Monto inválido. Debe ser un entero entre 350 y 50.000.000 CLP." }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "El formato del email no es válido." }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const provider: GatewayProvider = providerName || 'flow';

    // 1. Inicializar cliente Supabase para interactuar con la DB
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // 2. Verificar Idempotencia en la Base de Datos
    const { data: existingPayment, error: dbError } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('idempotency_key', idempotencyKey)
      .single();

    if (existingPayment) {
      // Si ya existe y está pendiente, devolvemos la misma URL sin crear uno nuevo en Flow
      if (existingPayment.status === 'pending') {
        return new Response(JSON.stringify({ 
          success: true, 
          checkoutUrl: existingPayment.checkout_url,
          message: "Recuperado intento de pago previo."
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      // Si ya se pagó, avisamos
      return new Response(JSON.stringify({ error: `Este pago ya fue procesado y su estado es: ${existingPayment.status}` }), { 
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // ============================================================
    // RACE CONDITION FIX: Si dos requests con la misma
    // idempotencyKey llegan al MISMO milisegundo, ambos podrían
    // pasar el SELECT de arriba (ambos ven "no existe").
    // Solución: tu tabla DEBE tener un UNIQUE constraint en
    // la columna idempotency_key. Si el INSERT falla por
    // duplicado, lo atrapamos aquí y devolvemos el pago
    // existente en vez de crear uno nuevo.
    //
    // SQL requerido (ejecutar una sola vez en tu DB):
    // ALTER TABLE payments ADD CONSTRAINT unique_idempotency_key
    //   UNIQUE (idempotency_key);
    // ============================================================
    const orderId = crypto.randomUUID();
    
    const { error: insertError } = await supabaseClient.from('payments').insert({
      id: orderId,
      idempotency_key: idempotencyKey,
      status: 'pending',
      provider: provider,
      amount: amount,
      user_email: email,
      subject: subject || 'Compra'
    });

    // Si falló por duplicado (código 23505 de PostgreSQL), recuperamos el pago original
    if (insertError) {
      if (insertError.code === '23505') {
        let duplicatePayment;
        let retries = 10; // Hasta 5 segundos de espera (10 * 500ms)
        
        while (retries > 0) {
          const { data } = await supabaseClient
            .from('payments')
            .select('*')
            .eq('idempotency_key', idempotencyKey)
            .single();
            
          duplicatePayment = data;

          if (duplicatePayment && duplicatePayment.checkout_url) {
            return new Response(JSON.stringify({ 
              success: true, 
              checkoutUrl: duplicatePayment.checkout_url,
              message: "Recuperado intento de pago previo (race condition resuelta)."
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
          
          // El pago existe pero la petición original aún no guarda la URL de Flow
          // Esperamos 500ms antes de volver a consultar
          await new Promise(resolve => setTimeout(resolve, 500));
          retries--;
        }

        // Si pasaron los 5 segundos y la petición original aún no terminó (ej: Flow está muy lento o falló)
        return new Response(JSON.stringify({ 
          error: "El pago está en proceso, pero tardó más de lo esperado. Por favor, verifica su estado en unos momentos."
        }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      throw new Error(`Error al guardar en base de datos: ${insertError.message}`);
    }

    // 4. Instanciar la pasarela usando nuestra Factory Universal
    const gateway = PaymentGatewayFactory.create(provider);

    // 5. Llamar a la pasarela (Flow, Stripe, etc.)
    const paymentRequest = {
      idempotencyKey: idempotencyKey,
      orderId: orderId,
      amount: amount,
      email: email,
      subject: subject || 'Compra',
      urlConfirmation: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook`,
      // ============================================================
      // URL RETURN DINÁMICA: Ahora la URL de retorno viene del
      // body del request (la envía tu frontend). Si no viene,
      // usamos la variable de entorno PAYMENT_RETURN_URL como
      // fallback. Ya no está hardcodeada.
      // ============================================================
      urlReturn: urlReturn || Deno.env.get('PAYMENT_RETURN_URL') || `${Deno.env.get('SUPABASE_URL')}/payment-status`
    };

    const paymentResponse = await gateway.createPayment(paymentRequest);

    // ============================================================
    // ACTUALIZAR DB: Guardamos el token y URL que Flow nos devolvió.
    // Verificamos que la actualización fue exitosa. Si falla aquí,
    // el pago fue creado en Flow pero no tenemos registro local.
    // Aún así devolvemos la URL al usuario para que pueda pagar,
    // y logueamos el error para investigación manual.
    // ============================================================
    const { error: updateError } = await supabaseClient.from('payments').update({
      payment_token: paymentResponse.paymentToken,
      checkout_url: paymentResponse.redirectUrl
    }).eq('id', orderId);

    if (updateError) {
      console.error('ALERTA: Pago creado en Flow pero falló el UPDATE en DB:', { orderId, updateError });
    }

    // 7. Retornar éxito al cliente
    return new Response(JSON.stringify({ 
      success: true, 
      checkoutUrl: paymentResponse.redirectUrl
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    // ============================================================
    // ERRORES SEGUROS: En producción NUNCA devolvemos el mensaje
    // interno del error al cliente (podría revelar info sensible
    // como nombres de tablas, estructura de la DB, etc.).
    // Logueamos el error real en el servidor y al cliente le
    // devolvemos un mensaje genérico.
    // ============================================================
    console.error('Error en create-payment:', error);
    
    const statusCode = error instanceof PaymentGatewayError ? error.statusCode : 500;
    const clientMessage = error instanceof PaymentGatewayError 
      ? error.message  // Los errores de nuestro módulo ya están sanitizados
      : 'Error interno del servidor. Intente nuevamente.';
    
    return new Response(JSON.stringify({ error: clientMessage }), { 
      status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
