/**
 * Module Public Contract
 *
 * Contract for: CheckoutSummary
 * Created: 2026-10-31
 *
 * Define estrictamente qué datos entran (Props) y qué eventos salen (Events).
 */

export interface ICheckoutSummaryProps {
  totalAmount: number;
  itemCount: number;
  deliveryMethod: "despacho" | "retiro";
  paymentMethod: "flow" | "transferencia" | "mercadolibre";
}

export type CheckoutSummaryContract = ICheckoutSummaryProps;
