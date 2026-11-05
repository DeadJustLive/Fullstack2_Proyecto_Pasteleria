/**
 * Module Dependencies Gateway
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
