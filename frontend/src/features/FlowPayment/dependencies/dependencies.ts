// @pca:start
// @id(feature.flowpayment.dependencies)
// @kind(dependencies)
// @limit(lines: 120)
// @contract(gateway: external imports and adapters for FlowPayment)
// @relates(feature.flowpayment.interface)
// @relates(frontend.services.api)
// @desc(Aduana de importaciones externas y adaptadores del módulo FlowPayment)
// @pca:end

/**
 * FIDA - Dependencies Layer (D)
 *
 * Import Gateway ("Aduana") for: FlowPayment
 * Created: 2026-10-31
 *
 * Único punto de entrada para librerías externas, componentes globales o servicios.
 * Ningún archivo en implementation/ o components/ puede importar del exterior sin pasar por aquí.
 */

export type {
  FlowVerificationState,
  IFlowPaymentProps,
  IFlowPaymentEvents,
  FlowPaymentContract,
} from "../interfaces/IFlowPayment";

// === Iconos Autorizados ===
export { ShieldCheck, CheckCircle2, RefreshCw } from "lucide-react";

// === Servicios y Utilidades del Dominio ===
export { api } from "@/services/api";
export { formatPrecio } from "@/lib/utils";
