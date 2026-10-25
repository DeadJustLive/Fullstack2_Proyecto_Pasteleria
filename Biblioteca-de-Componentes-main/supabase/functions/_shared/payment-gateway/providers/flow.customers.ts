import { ICustomerGateway, PaymentGatewayConfig, PaymentResponse } from "../types.ts";
import { PaymentGatewayError } from "../errors.ts";
import { FlowCore } from "./flow.core.ts";

export class FlowCustomers extends FlowCore implements ICustomerGateway {
  constructor(config: PaymentGatewayConfig) {
    super(config);
  }

  public async createCustomer(customerId: string, email: string, name: string): Promise<any> {
    try {
      const flowParams = {
        apiKey: this.config.apiKey,
        externalId: customerId,
        name: name,
        email: email,
      };
      
      const signature = await this.generateSignature(flowParams);
      const bodyParams = this.buildFormData(flowParams, signature);
      
      return await this.executeHttpRequest('/customer/create', bodyParams);
    } catch (error: any) {
      throw new PaymentGatewayError(
        `Fallo al crear el cliente en Flow: ${error.message}`, 
        this.providerName
      );
    }
  }

  public async registerCard(customerId: string, email: string, urlReturn: string): Promise<string> {
    try {
      const flowParams = {
        apiKey: this.config.apiKey,
        customerId: customerId,
        url_return: urlReturn,
        email: email,
      };
      
      const signature = await this.generateSignature(flowParams);
      const bodyParams = this.buildFormData(flowParams, signature);
      
      const response = await this.executeHttpRequest('/customer/register', bodyParams);
      
      return `${response.url}?token=${response.token}`;
    } catch (error: any) {
      throw new PaymentGatewayError(
        `Fallo al iniciar el registro de tarjeta en Flow: ${error.message}`, 
        this.providerName
      );
    }
  }

  public async chargeCard(customerId: string, amount: number, orderId: string, subject: string): Promise<PaymentResponse> {
    try {
      const flowParams = {
        apiKey: this.config.apiKey,
        commerceOrder: orderId,
        subject: subject,
        amount: amount,
        customerId: customerId,
      };
      
      const signature = await this.generateSignature(flowParams);
      const bodyParams = this.buildFormData(flowParams, signature);
      
      const response = await this.executeHttpRequest('/customer/charge', bodyParams);
      
      return {
        success: true,
        paymentToken: response.token,
      };
    } catch (error: any) {
      throw new PaymentGatewayError(
        `Fallo al generar cobro automático (One-Click) en Flow: ${error.message}`, 
        this.providerName
      );
    }
  }
}
