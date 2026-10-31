// @pca:start
// @id(feature.flowpayment.interface)
// @kind(interface)
// @limit(lines: 150)
// @contract(FlowVerificationState, IFlowPaymentProps, IFlowPaymentEvents, FlowPaymentContract)
// @desc(Contrato público de datos y eventos para el módulo FIDA FlowPayment)
// @pca:end

/**
 * FIDA - Interface Layer (I)
 *
 * Contract for: FlowPayment
 * Created: 2026-10-31
 *
 * Define estrictamente qué datos entran (Props) y qué eventos salen (Events).
 * ⚠️ Nivel de Impacto FIDA: ALTO (+60 pts) — Cambios aquí disparan el WAL documental.
 */

export type FlowVerificationState = "verifying" | "verified" | "simulated" | "offline";

export interface IFlowPaymentProps {
  orderId: string;
  amount: number;
  token?: string | null;
  initialFlowOrder?: string | null;
  mode?: "receipt" | "checkout";
}

export interface IFlowPaymentEvents {
  onVerified?: (flowOrder: string, state: FlowVerificationState) => void;
}

export type FlowPaymentContract = IFlowPaymentProps & IFlowPaymentEvents;
