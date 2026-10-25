import { ISubscriptionGateway, PaymentGatewayConfig } from "../types.ts";
import { PaymentGatewayError } from "../errors.ts";
import { FlowCore } from "./flow.core.ts";

export class FlowSubscriptions extends FlowCore implements ISubscriptionGateway {
  constructor(config: PaymentGatewayConfig) {
    super(config);
  }

  public async createPlan(planId: string, name: string, amount: number, interval: number): Promise<any> {
    try {
      const flowParams = {
        apiKey: this.config.apiKey,
        planId: planId,
        name: name,
        amount: amount,
        interval: interval, // 1 = diario, 2 = semanal, 3 = mensual, 4 = anual, etc (revisar doc Flow)
        currency: 'CLP'
      };
      
      const signature = await this.generateSignature(flowParams);
      const bodyParams = this.buildFormData(flowParams, signature);
      
      const response = await this.executeHttpRequest('/plans/create', bodyParams);
      return response;
    } catch (error: any) {
      throw new PaymentGatewayError(
        `Fallo al crear plan de suscripción en Flow: ${error.message}`, 
        this.providerName
      );
    }
  }

  public async createSubscription(planId: string, customerId: string, email: string, urlReturn: string): Promise<any> {
    try {
      const flowParams = {
        apiKey: this.config.apiKey,
        planId: planId,
        customerId: customerId,
        customerEmail: email,
        urlReturn: urlReturn,
      };
      
      const signature = await this.generateSignature(flowParams);
      const bodyParams = this.buildFormData(flowParams, signature);
      
      const response = await this.executeHttpRequest('/subscription/create', bodyParams);
      return response;
    } catch (error: any) {
      throw new PaymentGatewayError(
        `Fallo al crear suscripción en Flow: ${error.message}`, 
        this.providerName
      );
    }
  }

  public async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const flowParams = {
        apiKey: this.config.apiKey,
        subscriptionId: subscriptionId,
        atPeriodEnd: 0 // 1 para fin de periodo, 0 para inmediato
      };
      
      const signature = await this.generateSignature(flowParams);
      const bodyParams = this.buildFormData(flowParams, signature);
      
      await this.executeHttpRequest('/subscription/cancel', bodyParams);
      return true;
    } catch (error: any) {
      throw new PaymentGatewayError(
        `Fallo al cancelar suscripción en Flow: ${error.message}`, 
        this.providerName
      );
    }
  }
}
