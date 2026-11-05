/**
 * Module Dependencies Gateway
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
