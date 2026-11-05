/**
 * Module Public Contract
 *
 * Contract for: FlowPayment
 * Created: 2026-10-31
 *
 * Define estrictamente qué datos entran (Props) y qué eventos salen (Events).
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
