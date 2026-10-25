/**
 * testSecurityAndIdempotency.ts
 * 
 * Script de automatización para probar la robustez de las Edge Functions:
 * 1. Idempotencia: Evitar que un "doble click" o error de red cobre dos veces.
 * 2. Seguridad Webhook: Prevenir ataques donde un hacker falsifique una notificación de pago.
 * 
 * Ejecución:
 * deno run --allow-net --allow-env testSecurityAndIdempotency.ts
 */

import { config } from "https://deno.land/std@0.168.0/dotenv/mod.ts";

const logger = {
  info: (msg: string) => console.log(`\x1b[34m[INFO]\x1b[0m ${msg}`),
  success: (msg: string) => console.log(`\x1b[32m[ÉXITO]\x1b[0m ${msg}`),
  error: (msg: string) => console.error(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  warning: (msg: string) => console.warn(`\x1b[33m[ADVERTENCIA]\x1b[0m ${msg}`),
  divider: () => console.log(`\x1b[90m${'-'.repeat(50)}\x1b[0m`)
};

async function runTests() {
  logger.divider();
  logger.info("Iniciando Test de Seguridad e Idempotencia...");
  
  await config({ export: true, path: "./.env.local" });

  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_KEY") || Deno.env.get("ANON_KEY");
  if (!ANON_KEY) {
    logger.error("No encontré SUPABASE_ANON_KEY en tu .env.local.");
    logger.info("Por favor, agrega SUPABASE_ANON_KEY=\"tu_anon_key_de_supabase_start\" a tu .env.local");
    Deno.exit(1);
  }

  const BASE_URL = "http://127.0.0.1:54321/functions/v1";
  const IDEMPOTENCY_KEY = `test_idem_${Date.now()}`;

  try {
    // ========================================================
    // TEST 1: IDEMPOTENCIA (Cobro inicial)
    // ========================================================
    logger.info(`Test 1.1: Ejecutando primer intento de cobro con IdempotencyKey: ${IDEMPOTENCY_KEY}`);
    
    const requestBody = {
      idempotencyKey: IDEMPOTENCY_KEY,
      amount: 5000,
      email: "juanperez123@gmail.com",
      subject: "Prevención de cobros dobles",
      urlReturn: "https://localhost:3000/callback"
    };

    const req1 = await fetch(`${BASE_URL}/create-payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const res1 = await req1.json();
    if (!res1.success) {
      console.error("Respuesta del servidor:", res1);
      throw new Error("Fallo al crear el pago original.");
    }
    logger.success("Pago 1 procesado correctamente en Supabase y enviado a Flow.");

    // ========================================================
    // TEST 2: IDEMPOTENCIA (El temido Doble Click)
    // ========================================================
    logger.info("Test 1.2: Simulando 'Doble Click' (Enviando exactamente la misma petición)...");
    
    const req2 = await fetch(`${BASE_URL}/create-payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const res2 = await req2.json();
    
    // Si la idempotencia funciona, no debería cobrar de nuevo, 
    // debería devolver la misma URL y un status de éxito o advertencia.
    if (res2.success && res2.checkoutUrl === res1.checkoutUrl) {
      logger.success("¡Idempotencia Exitosa! Supabase detectó el doble click y no generó un pago duplicado. Devolvió la misma URL.");
    } else {
      logger.error("Fallo de Idempotencia: El sistema permitió crear un segundo cobro.");
      console.log(res2);
    }
    logger.divider();

    // ========================================================
    // TEST 3: SEGURIDAD (Webhook Falso / Ataque Hacker)
    // ========================================================
    logger.info("Test 2: Simulando un ataque hacker (Webhook Falso)...");
    logger.info("Enviando notificación de 'Pago Exitoso' falsa al servidor...");

    const fakeWebhookBody = new URLSearchParams();
    fakeWebhookBody.append("token", "hacker_token_falso_123");

    const hackReq = await fetch(`${BASE_URL}/payment-webhook`, {
      method: 'POST',
      headers: {
        // Los webhooks de Flow usan form-urlencoded
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: fakeWebhookBody.toString()
    });

    // Como el token no existe realmente en Flow, nuestro servidor 
    // fallará al consultar /payment/getStatus y deberá rechazarlo.
    if (!hackReq.ok) {
      logger.success(`¡Seguridad Exitosa! El servidor rechazó correctamente la inyección falsa (Status: ${hackReq.status}). Tu sistema es seguro.`);
    } else {
      logger.error("¡Brecha de Seguridad! El servidor aceptó un webhook falso con status 200 OK.");
    }

  } catch (error: any) {
    logger.error("Error crítico durante las pruebas locales:");
    console.error(error);
  }
}

if (import.meta.main) {
  runTests();
}
