// @pca:start
// @id(admin.feature.kardexpos.dependencies)
// @kind(dependencies)
// @limit(lines: 120)
// @contract(gateway: external imports and adapters for AdminKardexPos)
// @relates(admin.feature.kardexpos.interface)
// @desc(Aduana de importaciones externas y adaptadores del módulo AdminKardexPos)
// @pca:end

/**
 * FIDA - Dependencies Layer (D)
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
