// @pca:start
// @id(feature.checkoutsummary.dependencies)
// @kind(dependencies)
// @limit(lines: 120)
// @contract(gateway: external imports and adapters for CheckoutSummary)
// @relates(feature.checkoutsummary.interface)
// @desc(Aduana de importaciones externas y adaptadores del módulo CheckoutSummary)
// @pca:end

/**
 * FIDA - Dependencies Layer (D)
 *
 * Import Gateway ("Aduana") for: CheckoutSummary
 * Created: 2026-10-31
 *
 * Único punto de entrada para librerías externas, componentes globales o servicios.
 * Ningún archivo en implementation/ o components/ puede importar del exterior sin pasar por aquí.
 */

export type {
  ICheckoutSummaryProps,
  CheckoutSummaryContract,
} from "../interfaces/ICheckoutSummary";

// === Iconos Autorizados ===
export { ShieldCheck, Lock } from "lucide-react";

// === Utilidades del Dominio ===
export { formatPrecio } from "@/lib/utils";
