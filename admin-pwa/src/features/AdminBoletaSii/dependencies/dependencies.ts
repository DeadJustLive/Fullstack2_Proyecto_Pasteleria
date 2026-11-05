/**
 * Module Dependencies Gateway
 *
 * Import Gateway ("Aduana") for: AdminBoletaSii
 * Created: 2026-10-31
 *
 * Único punto de entrada para librerías externas, componentes globales o servicios.
 * Ningún archivo en implementation/ o components/ puede importar del exterior sin pasar por aquí.
 */

export type {
  SiiComplianceState,
  IAdminBoletaSiiProps,
  IAdminBoletaSiiEvents,
  AdminBoletaSiiContract,
} from "../interfaces/IAdminBoletaSii";

// === Iconos Autorizados ===
export { FileCheck2, Receipt, ShieldCheck } from "lucide-react";
