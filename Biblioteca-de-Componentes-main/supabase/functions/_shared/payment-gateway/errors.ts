/**
 * errors.ts
 * 
 * Centraliza los errores posibles dentro del proceso de pagos.
 * Esto es crucial para la robustez (resiliencia): permite que las Edge Functions usen 
 * try/catch específicos y tomen decisiones (reintentar, abortar, alertar) según el tipo de fallo, 
 * en lugar de simplemente caerse por un error genérico ("Internal Server Error").
 */

export class PaymentGatewayError extends Error {
  public statusCode: number;
  public provider: string;

  constructor(message: string, provider: string, statusCode: number = 500) {
    super(message);
    this.name = 'PaymentGatewayError';
    this.provider = provider;
    this.statusCode = statusCode;
  }
}

export class SignatureValidationError extends PaymentGatewayError {
  constructor(provider: string) {
    super('La firma del webhook no es válida.', provider, 401);
    this.name = 'SignatureValidationError';
  }
}

export class DuplicateIdempotencyError extends PaymentGatewayError {
  constructor(provider: string) {
    super('Intento de pago duplicado detectado (Idempotency Key existosa previa).', provider, 409);
    this.name = 'DuplicateIdempotencyError';
  }
}
