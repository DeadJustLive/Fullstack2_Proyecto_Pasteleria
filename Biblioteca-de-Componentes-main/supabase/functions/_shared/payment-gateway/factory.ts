/**
 * factory.ts
 * 
 * Patrón de diseño "Factory Method". Su responsabilidad única es instanciar los módulos de la pasarela
 * e inyectarles las configuraciones desde el entorno.
 * 
 * Dividido en módulos para mantener la app ligera:
 * - PaymentGatewayFactory: Para pagos tradicionales.
 * - CustomerGatewayFactory: Para tokenización de tarjetas (One-Click).
 * - SubscriptionGatewayFactory: Para planes y pagos recurrentes tipo SaaS.
 */
import { IPaymentGateway, ICustomerGateway, ISubscriptionGateway } from "./types.ts";
import { FlowProvider } from "./providers/flow.provider.ts";
import { FlowCustomers } from "./providers/flow.customers.ts";
import { FlowSubscriptions } from "./providers/flow.subscriptions.ts";

export type GatewayProvider = 'flow' | 'stripe'; 

const getFlowConfig = () => ({
  apiKey: Deno.env.get('FLOW_API_KEY') || '',
  secretKey: Deno.env.get('FLOW_SECRET_KEY') || '',
  apiUrl: Deno.env.get('FLOW_API_URL') || 'https://sandbox.flow.cl/api'
});

export class PaymentGatewayFactory {
  public static create(provider: GatewayProvider): IPaymentGateway {
    switch (provider) {
      case 'flow':
        return new FlowProvider(getFlowConfig());
      default:
        throw new Error(`Proveedor de pagos no soportado: ${provider}`);
    }
  }
}

export class CustomerGatewayFactory {
  public static create(provider: GatewayProvider): ICustomerGateway {
    switch (provider) {
      case 'flow':
        return new FlowCustomers(getFlowConfig());
      default:
        throw new Error(`Proveedor de clientes no soportado: ${provider}`);
    }
  }
}

export class SubscriptionGatewayFactory {
  public static create(provider: GatewayProvider): ISubscriptionGateway {
    switch (provider) {
      case 'flow':
        return new FlowSubscriptions(getFlowConfig());
      default:
        throw new Error(`Proveedor de suscripciones no soportado: ${provider}`);
    }
  }
}
