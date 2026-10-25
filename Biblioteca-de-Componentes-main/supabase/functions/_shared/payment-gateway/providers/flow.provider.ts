/**
 * flow.provider.ts
 * 
 * Implementación concreta para pagos de la pasarela Flow.
 * Hereda de FlowCore para reutilizar la lógica de firmas criptográficas y peticiones HTTP.
 */
import { 
  IPaymentGateway, 
  PaymentGatewayConfig, 
  PaymentRequest, 
  PaymentResponse, 
  RefundRequest,
  RefundResponse,
  WebhookPayload, 
  WebhookResponse 
} from "../types.ts";
import { PaymentGatewayError, SignatureValidationError } from "../errors.ts";
import { FlowCore } from "./flow.core.ts";

export class FlowProvider extends FlowCore implements IPaymentGateway {
  constructor(config: PaymentGatewayConfig) {
    super(config);
  }

  // ==========================================
  // MÉTODOS PÚBLICOS DE PAGOS SIMPLES
  // ==========================================

  public async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const flowParams = this.mapRequestToFlowParams(request);
      const signature = await this.generateSignature(flowParams);
      const bodyParams = this.buildFormData(flowParams, signature);
      
      const response = await this.executeHttpRequest('/payment/create', bodyParams);
      
      return {
        success: true,
        redirectUrl: `${response.url}?token=${response.token}`,
        paymentToken: response.token,
      };
    } catch (error: any) {
      throw new PaymentGatewayError(
        `Fallo al crear pago en Flow: ${error.message}`, 
        this.providerName
      );
    }
  }

  public async processWebhook(payload: WebhookPayload): Promise<WebhookResponse> {
    const bodyParams = new URLSearchParams(payload.rawBody);
    const token = bodyParams.get('token') || payload.searchParams.get('token');
    
    if (!token) {
      throw new PaymentGatewayError('Webhook no contiene el token', this.providerName, 400);
    }

    try {
      const flowParams = {
        apiKey: this.config.apiKey,
        token: token
      };
      
      const signature = await this.generateSignature(flowParams);
      const url = new URL(`${this.config.apiUrl}/payment/getStatus`);
      url.searchParams.append('apiKey', this.config.apiKey);
      url.searchParams.append('token', token);
      url.searchParams.append('s', signature);

      const response = await fetch(url.toString(), { method: 'GET' });
      
      if (!response.ok) {
        throw new SignatureValidationError(this.providerName);
      }

      const data = await response.json();

      const status = data.status === 2 ? 'completed' 
                   : data.status === 3 ? 'failed' 
                   : data.status === 4 ? 'refunded' 
                   : 'pending';

      return {
        isValid: true,
        status: status,
        orderId: data.commerceOrder,
        gatewayTransactionId: data.flowOrder.toString()
      };
      
    } catch (error: any) {
      throw new PaymentGatewayError(
        `Error procesando webhook de Flow: ${error.message}`, 
        this.providerName
      );
    }
  }

  public async refundPayment(request: RefundRequest): Promise<RefundResponse> {
    try {
      const flowParams = this.mapRefundRequestToFlowParams(request);
      const signature = await this.generateSignature(flowParams);
      const bodyParams = this.buildFormData(flowParams, signature);
      
      const response = await this.executeHttpRequest('/payment/refund/create', bodyParams);
      
      return {
        success: true,
        refundToken: response.token,
        gatewayRefundOrderId: response.flowRefundOrder,
        status: response.status,
      };
    } catch (error: any) {
      throw new PaymentGatewayError(
        `Fallo al crear reembolso en Flow: ${error.message}`, 
        this.providerName
      );
    }
  }

  // ==========================================
  // MÉTODOS PRIVADOS
  // ==========================================

  private mapRequestToFlowParams(request: PaymentRequest): Record<string, string | number> {
    return {
      apiKey: this.config.apiKey,
      commerceOrder: request.orderId,
      amount: request.amount,
      email: request.email,
      subject: request.subject,
      urlConfirmation: request.urlConfirmation,
      urlReturn: request.urlReturn,
      optional: JSON.stringify({ idempotencyKey: request.idempotencyKey })
    };
  }

  private mapRefundRequestToFlowParams(request: RefundRequest): Record<string, string | number> {
    const params: Record<string, string | number> = {
      apiKey: this.config.apiKey,
      refundCommerceOrder: request.refundOrderId,
      receiverEmail: request.receiverEmail,
      amount: request.amount,
      urlCallBack: request.urlCallBack,
    };

    if (request.originalGatewayTransactionId) {
      params.flowTrxId = request.originalGatewayTransactionId;
    } else if (request.originalOrderId) {
      params.commerceTrxId = request.originalOrderId;
    } else {
      throw new PaymentGatewayError(
        'Se requiere originalOrderId o originalGatewayTransactionId para procesar un reembolso',
        this.providerName,
        400
      );
    }

    return params;
  }
}
