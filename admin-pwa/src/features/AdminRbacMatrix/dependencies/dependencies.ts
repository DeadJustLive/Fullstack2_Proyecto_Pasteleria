/**
 * Module Dependencies Gateway
 *
 * Import Gateway ("Aduana") for: AdminRbacMatrix
 * Created: 2026-10-31
 *
 * Único punto de entrada para librerías externas, componentes globales o servicios.
 * Ningún archivo en implementation/ o components/ puede importar del exterior sin pasar por aquí.
 */

export type {
  RbacSecurityLevel,
  IAdminRbacMatrixProps,
  IAdminRbacMatrixEvents,
  AdminRbacMatrixContract,
} from "../interfaces/IAdminRbacMatrix";

// === Iconos Autorizados ===
export { KeyRound, Lock, ShieldCheck } from "lucide-react";
