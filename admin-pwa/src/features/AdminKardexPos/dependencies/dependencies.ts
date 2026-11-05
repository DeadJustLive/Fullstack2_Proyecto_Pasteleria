/**
 * Module Dependencies Gateway
 *
 * Import Gateway ("Aduana") for: AdminKardexPos
 * Created: 2026-10-31
 *
 * Único punto de entrada para librerías externas, componentes globales o servicios.
 * Ningún archivo en implementation/ o components/ puede importar del exterior sin pasar por aquí.
 */

export type {
  KardexSyncState,
  IAdminKardexPosProps,
  IAdminKardexPosEvents,
  AdminKardexPosContract,
} from "../interfaces/IAdminKardexPos";

// === Iconos Autorizados ===
export { Activity, CheckCircle2, Radio } from "lucide-react";
