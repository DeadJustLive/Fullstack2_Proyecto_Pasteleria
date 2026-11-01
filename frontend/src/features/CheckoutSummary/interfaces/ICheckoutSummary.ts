// @pca:start
// @id(feature.checkoutsummary.interface)
// @kind(interface)
// @limit(lines: 150)
// @contract(ICheckoutSummaryProps, CheckoutSummaryContract)
// @desc(Contrato público de datos y eventos para el módulo FIDA CheckoutSummary)
// @pca:end

/**
 * FIDA - Interface Layer (I)
 *
 * Contract for: CheckoutSummary
 * Created: 2026-10-31
 *
 * Define estrictamente qué datos entran (Props) y qué eventos salen (Events).
 * ⚠️ Nivel de Impacto FIDA: ALTO (+60 pts) — Cambios aquí disparan el WAL documental.
 */

export interface ICheckoutSummaryProps {
  totalAmount: number;
  itemCount: number;
  deliveryMethod: "despacho" | "retiro";
  paymentMethod: "flow" | "transferencia" | "mercadolibre";
}

export type CheckoutSummaryContract = ICheckoutSummaryProps;
