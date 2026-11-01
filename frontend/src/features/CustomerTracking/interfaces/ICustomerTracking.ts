// @pca:start
// @id(feature.customertracking.interface)
// @kind(interface)
// @limit(lines: 150)
// @contract(ICustomerTrackingProps, CustomerTrackingContract)
// @desc(Contrato público de datos y eventos para el módulo FIDA CustomerTracking)
// @pca:end

/**
 * FIDA - Interface Layer (I)
 *
 * Contract for: CustomerTracking
 * Created: 2026-10-31
 *
 * Define estrictamente qué datos entran (Props) y qué eventos salen (Events).
 * ⚠️ Nivel de Impacto FIDA: ALTO (+60 pts) — Cambios aquí disparan el WAL documental.
 */

export interface ICustomerTrackingProps {
  trackingCode: string;
  orderStatus: string;
  deliveryType: "RETIRO" | "DELIVERY";
}

export type CustomerTrackingContract = ICustomerTrackingProps;
