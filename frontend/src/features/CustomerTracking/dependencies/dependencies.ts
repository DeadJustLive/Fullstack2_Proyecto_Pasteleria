// @pca:start
// @id(feature.customertracking.dependencies)
// @kind(dependencies)
// @limit(lines: 120)
// @contract(gateway: external imports and adapters for CustomerTracking)
// @relates(feature.customertracking.interface)
// @desc(Aduana de importaciones externas y adaptadores del módulo CustomerTracking)
// @pca:end

/**
 * FIDA - Dependencies Layer (D)
 *
 * Import Gateway ("Aduana") for: CustomerTracking
 * Created: 2026-10-31
 *
 * Único punto de entrada para librerías externas, componentes globales o servicios.
 * Ningún archivo en implementation/ o components/ puede importar del exterior sin pasar por aquí.
 */

export type {
  ICustomerTrackingProps,
  CustomerTrackingContract,
} from "../interfaces/ICustomerTracking";

// === Iconos Autorizados ===
export { Snowflake, ShieldAlert } from "lucide-react";
