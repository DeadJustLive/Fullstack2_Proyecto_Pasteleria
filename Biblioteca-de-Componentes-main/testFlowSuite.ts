
/**
 * testFlowSuite.ts
 * 
 * Script de automatización para probar la integración con Flow.
 * Este script testea que las credenciales estén correctas y que la firma HMAC
 * se esté generando bien para todos los endpoints que implementamos.
 * 
 * Ejecución:
 * deno run --allow-net --allow-env testFlowSuite.ts
 */

import { 
  PaymentGatewayFactory, 
  CustomerGatewayFactory, 
  SubscriptionGatewayFactory 
} from "./supabase/functions/_shared/payment-gateway/factory.ts";
import { config } from "https://deno.land/std@0.168.0/dotenv/mod.ts";

// Función auxiliar para imprimir con colores en consola
const logger = {
  info: (msg: string) => console.log(`\x1b[34m[INFO]\x1b[0m ${msg}`),
  success: (msg: string) => console.log(`\x1b[32m[ÉXITO]\x1b[0m ${msg}`),
  error: (msg: string) => console.error(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  divider: () => console.log(`\x1b[90m${'-'.repeat(50)}\x1b[0m`)
};

async function runTestSuite() {
  logger.divider();
  logger.info("Iniciando Flow API Test Suite...");
  
  // 1. Cargar variables de entorno desde .env.local
  await config({ export: true, path: "./.env.local" });

  if (!Deno.env.get("FLOW_API_KEY") || !Deno.env.get("FLOW_SECRET_KEY")) {
    logger.error("No se encontraron las API Keys de Flow en .env.local");
    Deno.exit(1);
  }

  // 2. Instanciar los tres gateways a través del Factory
  const paymentGateway = PaymentGatewayFactory.create('flow');
  const customerGateway = CustomerGatewayFactory.create('flow');
  const subscriptionGateway = SubscriptionGatewayFactory.create('flow');

  logger.success("Factories inicializados correctamente.");
  logger.divider();

  // IDs ficticios para las pruebas
  const TEST_ORDER_ID = `test_order_${Date.now()}`;
  const TEST_CUSTOMER_ID = `test_customer_${Date.now()}`;
  const TEST_PLAN_ID = `plan_mensual_pro`;
  const TEST_EMAIL = "test_chile@saas.com";
  const RETURN_URL = "https://localhost:3000/callback";

  try {
    // ========================================================
    // TEST 1: Pago Simple (E-Commerce)
    // ========================================================
    logger.info("Test 1: Creando un pago simple...");
    const paymentReq = {
      idempotencyKey: crypto.randomUUID(),
      orderId: TEST_ORDER_ID,
      amount: 10000,
      email: TEST_EMAIL,
      subject: "Test Pago Simple Chile",
      urlConfirmation: RETURN_URL,
      urlReturn: RETURN_URL
    };
    const paymentRes = await paymentGateway.createPayment(paymentReq);
    logger.success(`Pago creado. Checkout URL: ${paymentRes.redirectUrl}`);
    logger.divider();

    // ========================================================
    // TEST 2: Registrar Cliente (One-Click)
    // ========================================================
    logger.info("Test 2: Generando URL de registro de tarjeta de crédito (One-Click)...");
    const registerUrl = await customerGateway.registerCard(TEST_CUSTOMER_ID, TEST_EMAIL, RETURN_URL);
    logger.success(`URL de registro generada: ${registerUrl}`);
    logger.divider();

    // ========================================================
    // TEST 3: Crear Plan de Suscripción (SaaS)
    // ========================================================
    logger.info("Test 3: Creando plan de suscripción...");
    const planRes = await subscriptionGateway.createPlan(TEST_PLAN_ID, "Plan Pro Mensual", 15000, 3);
    logger.success(`Plan creado correctamente.`);
    console.log(planRes);
    logger.divider();

    // ========================================================
    // TEST 4: Suscribir Cliente al Plan
    // ========================================================
    logger.info("Test 4: Generando URL de suscripción para el cliente...");
    const subRes = await subscriptionGateway.createSubscription(TEST_PLAN_ID, TEST_CUSTOMER_ID, TEST_EMAIL, RETURN_URL);
    logger.success(`URL de suscripción generada: ${subRes.url}?token=${subRes.token}`);
    logger.divider();

    /* 
      NOTA SOBRE CHARGE CARD Y CANCEL SUBSCRIPTION:
      Para testear `chargeCard` o `cancelSubscription`, es OBLIGATORIO que el usuario
      haya completado el flujo en el navegador usando la tarjeta de prueba de Chile:
      - Tarjeta: 4051885600446623
      - Rut: 11111111-1
      Como este es un script de backend que no tiene navegador web, no podemos 
      automatizar el ingreso de los números de la tarjeta de crédito.
    */
    logger.info("Pruebas de APIs generadoras de Tokens finalizadas con éxito.");
    logger.info("Para probar un cobro automático (chargeCard), debes abrir la URL del Test 2 en tu navegador e inscribir la tarjeta de prueba de Chile.");
    
  } catch (error: any) {
    logger.error("Fallo durante la ejecución de los tests:");
    console.error(error);
  }
}

if (import.meta.main) {
  runTestSuite();
}
