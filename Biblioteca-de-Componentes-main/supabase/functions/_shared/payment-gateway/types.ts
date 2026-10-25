/**
 * types.ts
 *
 * Módulo Universal de Pasarelas de Pago.
 * Aquí definimos las interfaces abstractas (contratos) que cualquier proveedor (Flow, Stripe, etc.) 
 * debe respetar. Esto nos garantiza que la aplicación principal nunca dependa directamente de una 
 * API de terceros, permitiendo cambiar de pasarela fácilmente en el futuro.
 */

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface PaymentGatewayConfig {
  apiKey: string;
  secretKey: string;
  apiUrl: string;
}

export interface PaymentRequest {
  /** Clave única generada por el cliente para evitar pagos duplicados (Idempotencia) */
  idempotencyKey: string;
  orderId: string;
  amount: number;
  email: string;
  subject: string;
  urlConfirmation: string;
  urlReturn: string;
}

export interface PaymentResponse {
  success: boolean;
  gatewayTransactionId?: string;
  redirectUrl?: string;
  paymentToken?: string;
  error?: string;
}

export interface WebhookPayload {
  rawBody: string;
  headers: Record<string, string>;
  searchParams: URLSearchParams;
}

export interface WebhookResponse {
  isValid: boolean;
  status: PaymentStatus;
  orderId: string;
  gatewayTransactionId: string;
}

export interface RefundRequest {
  refundOrderId: string; // ID único generado por nosotros para el reembolso
  originalOrderId?: string; // ID de la orden original en nuestra base de datos
  originalGatewayTransactionId?: string; // ID de la orden original en la pasarela
  amount: number;
  receiverEmail: string;
  urlCallBack: string;
}

export interface RefundResponse {
  success: boolean;
  refundToken?: string;
  gatewayRefundOrderId?: string;
  status?: string;
  error?: string;
}

/**
 * Interfaz universal que todas las pasarelas deben implementar.
 */
export interface IPaymentGateway {
  /** Inicializa el proveedor de pago */
  createPayment(request: PaymentRequest): Promise<PaymentResponse>;
  
  /** Procesa y valida el webhook enviado por la pasarela */
  processWebhook(payload: WebhookPayload): Promise<WebhookResponse>;

  /** Inicializa una solicitud de reembolso (Reversar orden) */
  refundPayment(request: RefundRequest): Promise<RefundResponse>;
}

// ==========================================
// INTERFACES PARA MÓDULOS OPCIONALES
// ==========================================

export interface ICustomerGateway {
  /** Crea un cliente en la pasarela de pago */
  createCustomer(customerId: string, email: string, name: string): Promise<any>;

  /** Envía a un cliente a registrar su tarjeta (One-Click) */
  registerCard(customerId: string, email: string, urlReturn: string): Promise<string>;
  
  /** Efectúa un cargo automático en una tarjeta previamente registrada */
  chargeCard(customerId: string, amount: number, orderId: string, subject: string): Promise<PaymentResponse>;
}

export interface ISubscriptionGateway {
  /** Crea un plan de cobro recurrente (ej: plan Pro mensual) */
  createPlan(planId: string, name: string, amount: number, interval: number): Promise<any>;
  
  /** Suscribe a un cliente a un plan (requiere que el cliente haya registrado su tarjeta o pague en el momento) */
  createSubscription(planId: string, customerId: string, email: string, urlReturn: string): Promise<any>;
  
  /** Cancela la suscripción de un usuario */
  cancelSubscription(subscriptionId: string): Promise<boolean>;
}
