/**
 * Module Dependencies Gateway
 *
 * Import Gateway ("Aduana") for: AdminCriticalStock
 * Created: 2026-10-31
 *
 * Único punto de entrada para librerías externas, componentes globales o servicios.
 * Ningún archivo en implementation/ o components/ puede importar del exterior sin pasar por aquí.
 */

export type {
  CriticalSeverity,
  IAdminCriticalStockProps,
  IAdminCriticalStockEvents,
  AdminCriticalStockContract,
} from "../interfaces/IAdminCriticalStock";

// === Iconos Autorizados ===
export { AlertTriangle, CheckCircle2, PackageOpen } from "lucide-react";
