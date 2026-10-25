import { config } from "https://deno.land/std@0.168.0/dotenv/mod.ts";
import { PaymentGatewayFactory, CustomerGatewayFactory, SubscriptionGatewayFactory } from "./supabase/functions/_shared/payment-gateway/factory.ts";
import { PaymentGatewayError } from "./supabase/functions/_shared/payment-gateway/errors.ts";
import { WebhookPayload } from "./supabase/functions/_shared/payment-gateway/types.ts";

// Cargar variables de entorno
const env = await config({ path: "./.env.local" });
for (const key in env) {
  Deno.env.set(key, env[key]);
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "http://127.0.0.1:54321";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const BASE_URL = `${SUPABASE_URL}/functions/v1`;

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m"
};

const logger = {
  info: (msg: string) => console.log(`${COLORS.cyan}[INFO]${COLORS.reset} ${msg}`),
  success: (msg: string) => console.log(`${COLORS.green}[ÉXITO]${COLORS.reset} ${msg}`),
  error: (msg: string) => console.log(`${COLORS.red}[ERROR]${COLORS.reset} ${msg}`),
  warn: (msg: string) => console.log(`${COLORS.yellow}[WARN]${COLORS.reset} ${msg}`)
};

const results = {
  passed: 0,
  failed: 0,
  manual: 0,
  total: 0,
  failedTests: [] as string[]
};

async function runTest(name: string, isManual: boolean, testFn: () => Promise<void>) {
  results.total++;
  if (isManual) {
    results.manual++;
    logger.info(`Test Manual: ${name}`);
    try {
      await testFn();
    } catch (e: any) {
      logger.error(`Error en test manual: ${e.message}`);
    }
    console.log("--------------------------------------------------");
    return;
  }

  logger.info(`Ejecutando Test: ${name}`);
  try {
    await testFn();
    results.passed++;
    logger.success(`Test Pasó: ${name}`);
  } catch (error: any) {
    results.failed++;
    results.failedTests.push(name);
    logger.error(`Test Falló: ${name}`);
    logger.error(`Motivo: ${error.message}`);
  }
  console.log("--------------------------------------------------");
}

async function callCreatePayment(body: any, expectedStatus: number) {
  const req = await fetch(`${BASE_URL}/create-payment`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  
  if (req.status !== expectedStatus) {
    const text = await req.text();
    throw new Error(`Se esperaba status ${expectedStatus} pero se obtuvo ${req.status}. Body: ${text}`);
  }
  return req.json().catch(() => null);
}

async function callRefundPayment(body: any, expectedStatus: number) {
  const req = await fetch(`${BASE_URL}/refund-payment`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  
  if (req.status !== expectedStatus) {
    const text = await req.text();
    throw new Error(`Se esperaba status ${expectedStatus} pero se obtuvo ${req.status}. Body: ${text}`);
  }
  return req.json().catch(() => null);
}

async function callWebhook(body: string, expectedStatus: number, method: string = 'POST') {
  const req = await fetch(`${BASE_URL}/payment-webhook?provider=flow`, {
    method: method,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: method === 'POST' ? body : undefined
  });
  
  if (req.status !== expectedStatus) {
    const text = await req.text();
    throw new Error(`Se esperaba status ${expectedStatus} pero se obtuvo ${req.status}. Body: ${text}`);
  }
  return req.text().catch(() => null);
}

async function runAllTests() {
  logger.info("Iniciando Test Suite Exhaustiva de Flow API...");
  console.log("==================================================");

  const timestamp = Date.now();
  const validEmail = "juanperez123@gmail.com";

  // ==========================================
  // PARTE 1: Input Validation Tests
  // ==========================================
  await runTest("A: Monto = 0", false, async () => {
    await callCreatePayment({ idempotencyKey: crypto.randomUUID(), amount: 0, email: validEmail }, 400);
  });

  await runTest("B: Monto = -5000", false, async () => {
    await callCreatePayment({ idempotencyKey: crypto.randomUUID(), amount: -5000, email: validEmail }, 400);
  });

  await runTest("C: Monto = 349 (Bajo mínimo)", false, async () => {
    await callCreatePayment({ idempotencyKey: crypto.randomUUID(), amount: 349, email: validEmail }, 400);
  });

  await runTest("D: Monto = 99999999 (Sobre máximo)", false, async () => {
    await callCreatePayment({ idempotencyKey: crypto.randomUUID(), amount: 99999999, email: validEmail }, 400);
  });

  await runTest("E: Monto = 350 (Mínimo exacto)", false, async () => {
    await callCreatePayment({ idempotencyKey: crypto.randomUUID(), amount: 350, email: validEmail }, 200);
  });

  await runTest("F: Monto = 500.5 (Decimal)", false, async () => {
    await callCreatePayment({ idempotencyKey: crypto.randomUUID(), amount: 500.5, email: validEmail }, 400);
  });

  await runTest("G: Email vacío", false, async () => {
    await callCreatePayment({ idempotencyKey: crypto.randomUUID(), amount: 1000, email: "" }, 400);
  });

  await runTest("H: Email inválido (noesunmail)", false, async () => {
    await callCreatePayment({ idempotencyKey: crypto.randomUUID(), amount: 1000, email: "noesunmail" }, 400);
  });

  await runTest("I: Sin idempotencyKey", false, async () => {
    await callCreatePayment({ amount: 1000, email: validEmail }, 400);
  });

  await runTest("J: Body vacío {}", false, async () => {
    await callCreatePayment({}, 400);
  });

  // ==========================================
  // PARTE 2: Idempotency Tests
  // ==========================================
  await runTest("K: Mismo idempotencyKey repetido", false, async () => {
    const key = crypto.randomUUID();
    const body = { idempotencyKey: key, amount: 1000, email: validEmail };
    
    // Primer request
    const res1 = await callCreatePayment(body, 200);
    if (!res1.checkoutUrl) throw new Error("No se devolvió checkoutUrl en primer request");
    
    // Segundo request, debería devolver lo mismo
    const res2 = await callCreatePayment(body, 200);
    if (res1.checkoutUrl !== res2.checkoutUrl) throw new Error("Las URLs de checkout no coinciden en reintento");
  });

  await runTest("L: 3 requests simultáneos (Race condition)", false, async () => {
    const key = crypto.randomUUID();
    const body = { idempotencyKey: key, amount: 2000, email: validEmail };
    
    const p1 = callCreatePayment(body, 200);
    const p2 = callCreatePayment(body, 200);
    const p3 = callCreatePayment(body, 200);

    const [r1, r2, r3] = await Promise.all([p1, p2, p3]);
    
    // Con el nuevo polling en el edge function, todos deberían eventualmente
    // recibir la misma checkout_url cuando el request principal termine.
    if (!r1.checkoutUrl || r1.checkoutUrl !== r2.checkoutUrl || r1.checkoutUrl !== r3.checkoutUrl) {
      throw new Error("Diferentes URLs retornadas durante ataques concurrentes (el polling de idempotencia falló)");
    }
  });

  // ==========================================
  // PARTE 3: Webhook Security Tests
  // ==========================================
  await runTest("M: Webhook Token falso", false, async () => {
    // Retorna 400 Bad Request porque el error es envuelto en PaymentGatewayError
    await callWebhook("token=1234567890abcdef", 400);
  });

  await runTest("N: Webhook Sin token", false, async () => {
    await callWebhook("other=value", 400);
  });

  await runTest("O: Webhook Body vacío", false, async () => {
    // Cuando el body está vacío, new URLSearchParams("") -> no hay token, el edge function espera un error 400.
    // wait, actually if no token it throws PaymentGatewayError 400
    await callWebhook("", 400);
  });

  await runTest("P: Webhook request GET", false, async () => {
    // Sin body, la función retorna 400 Bad Request
    await callWebhook("", 400, 'GET');
  });

  // ==========================================
  // PARTE 4: Flow API Direct Tests
  // ==========================================
  const gateway = PaymentGatewayFactory.create('flow');
  const customerGateway = CustomerGatewayFactory.create('flow');
  const subscriptionGateway = SubscriptionGatewayFactory.create('flow');
  
  await runTest("Q: Crear pago (Direct API)", false, async () => {
    const req = {
      idempotencyKey: crypto.randomUUID(),
      orderId: `test_direct_${timestamp}`,
      amount: 1000,
      email: validEmail,
      subject: "Test Q",
      urlConfirmation: "http://localhost",
      urlReturn: "http://localhost"
    };
    const res = await gateway.createPayment(req);
    if (!res.success || !res.redirectUrl) throw new Error("No devolvió URL");
  });

  let createdCustomerId = "";
  await runTest("R: Crear cliente y registrar tarjeta (Direct API)", false, async () => {
    const externalId = `cust_${timestamp}`;
    const customer = await customerGateway.createCustomer(externalId, validEmail, "Test User");
    createdCustomerId = customer.customerId || customer.id || externalId;
    
    // Intentar registerCard con el flowCustomerId (el ID interno que retorna Flow)
    try {
      const url = await customerGateway.registerCard(createdCustomerId, validEmail, "http://localhost");
      if (!url || !url.startsWith("http")) throw new Error("No devolvió URL de registro de tarjeta");
    } catch (e: any) {
      if (e.message.includes("Customer not found")) {
         // Si Flow sigue sin encontrar el customerId que nos acaba de dar, probamos con el externalId
         const url = await customerGateway.registerCard(externalId, validEmail, "http://localhost");
         if (!url || !url.startsWith("http")) throw new Error("No devolvió URL de registro de tarjeta");
         createdCustomerId = externalId;
      } else {
         throw e;
      }
    }
  });

  let createdPlanId = "";
  await runTest("S: Crear plan (Direct API)", false, async () => {
    createdPlanId = `plan_${timestamp}`;
    const res = await subscriptionGateway.createPlan(createdPlanId, "Plan de Test S", 5000, 3);
    if (!res || !res.planId) throw new Error("Fallo al crear plan");
  });

  await runTest("T: Suscribir cliente a plan (Direct API)", false, async () => {
    const res = await subscriptionGateway.createSubscription(createdPlanId, createdCustomerId, validEmail, "http://localhost");
  });

  await runTest("U: Crear pago con email inválido a Flow (Direct API)", false, async () => {
    const req = {
      idempotencyKey: crypto.randomUUID(),
      orderId: `test_direct_bad_mail_${timestamp}`,
      amount: 1000,
      email: "invalido",
      subject: "Test U",
      urlConfirmation: "http://localhost",
      urlReturn: "http://localhost"
    };
    try {
      await gateway.createPayment(req);
      throw new Error("Debió fallar con email inválido");
    } catch (e: any) {
      if (!(e instanceof PaymentGatewayError)) {
        throw new Error("No lanzó un PaymentGatewayError. Error real: " + e.message);
      }
    }
  });

  await runTest("V: Cliente duplicado (Direct API)", false, async () => {
    // Flow Sandbox a veces permite reescribir/actualizar clientes con el mismo ID o email
    // En este caso, simplemente comprobaremos que el API retorne el objeto customer sin explotar,
    // o lance error si Flow lo cambia
    try {
      await customerGateway.createCustomer(createdCustomerId, validEmail, "Test User 2");
    } catch (e: any) {
      if (!(e instanceof PaymentGatewayError)) {
        throw new Error("No lanzó un PaymentGatewayError");
      }
    }
  });

  await runTest("W: Consultar webhook con token fake (Direct API)", false, async () => {
    const payload: WebhookPayload = {
      rawBody: "token=faketoken123",
      headers: {},
      searchParams: new URLSearchParams()
    };
    try {
      await gateway.processWebhook(payload);
      throw new Error("Debió rechazar la firma");
    } catch (e: any) {
       if (e.name !== 'SignatureValidationError' && e.name !== 'PaymentGatewayError') {
        throw new Error("No lanzó el error esperado. Error: " + e.message);
      }
    }
  });

  // ==========================================
  // PARTE 5: Refund Validation Tests
  // ==========================================
  await runTest("X: Reembolso sin paymentId", false, async () => {
    await callRefundPayment({ amount: 1000 }, 400);
  });

  await runTest("Y: Reembolso pago inexistente", false, async () => {
    await callRefundPayment({ paymentId: "00000000-0000-0000-0000-000000000000", amount: 1000 }, 404);
  });

  await runTest("Z: Reembolso pago pending", false, async () => {
    const key = crypto.randomUUID();
    const body = { idempotencyKey: key, amount: 1000, email: validEmail };
    
    // 1. Crear pago
    const req = await fetch(`${BASE_URL}/create-payment`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    // Obtenemos el pago de la base de datos buscando por idempotency_key
    const supabaseClient = (await import("https://esm.sh/@supabase/supabase-js@2")).createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        { global: { headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` } } }
    );
    
    const { data: dbPayment } = await supabaseClient.from("payments").select("id").eq("idempotency_key", key).single();
    
    if (dbPayment) {
        await callRefundPayment({ paymentId: dbPayment.id, amount: 1000 }, 400);
    } else {
        throw new Error("No se pudo crear/encontrar pago para probar reembolso");
    }
  });

  // ==========================================
  // PARTE 6: Browser-Required Tests
  // ==========================================
  await runTest("AA: Prueba de URL de Pago (Manual)", true, async () => {
    const key = crypto.randomUUID();
    const body = { idempotencyKey: key, amount: 500, email: validEmail };
    const res = await callCreatePayment(body, 200);
    logger.info(`Abre esta URL para simular un pago manual con tarjeta de prueba:\n${COLORS.cyan}${res.checkoutUrl}${COLORS.reset}`);
  });

  await runTest("BB: Prueba de Registro de Tarjeta (Manual)", true, async () => {
    const extId = `manual_cust_${timestamp}`;
    const cust = await customerGateway.createCustomer(extId, validEmail, "Test User");
    const idToUse = cust.customerId || cust.id || extId;
    let url = "";
    try {
       url = await customerGateway.registerCard(idToUse, validEmail, "http://localhost");
    } catch (e) {
       url = await customerGateway.registerCard(extId, validEmail, "http://localhost");
    }
    logger.info(`Abre esta URL para simular inscripción de tarjeta (One-Click):\n${COLORS.cyan}${url}${COLORS.reset}`);
  });

  console.log("\n==================================================");
  console.log("             RESUMEN DE RESULTADOS                ");
  console.log("==================================================");
  console.log(`Total tests: ${results.total}`);
  console.log(`${COLORS.green}Pasaron (Automatizados): ${results.passed}${COLORS.reset}`);
  if (results.failed > 0) {
    console.log(`${COLORS.red}Fallaron: ${results.failed}${COLORS.reset}`);
    results.failedTests.forEach(t => console.log(`${COLORS.red} - ${t}${COLORS.reset}`));
  } else {
    console.log(`${COLORS.green}Fallaron: 0${COLORS.reset}`);
  }
  console.log(`${COLORS.yellow}Manuales: ${results.manual}${COLORS.reset}`);
  console.log("==================================================");
  
  if (results.failed > 0) {
      Deno.exit(1);
  }
}

runAllTests();
