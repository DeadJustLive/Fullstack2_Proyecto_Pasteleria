// @pca:start
// @id(admin.feature.kardexpos.interface)
// @kind(interface)
// @limit(lines: 150)
// @contract(KardexSyncState, IAdminKardexPosProps, IAdminKardexPosEvents, AdminKardexPosContract)
// @desc(Contrato público de datos y eventos para el módulo FIDA AdminKardexPos)
// @pca:end

/**
 * FIDA - Interface Layer (I)
 *
 * Contract for: AdminKardexPos
 * Created: 2026-10-31
 *
 * Define estrictamente qué datos entran (Props) y qué eventos salen (Events).
 * ⚠️ Nivel de Impacto FIDA: ALTO (+60 pts) — Cambios aquí disparan el WAL documental.
 */

export type KardexSyncState = "synced" | "pending";

export interface IAdminKardexPosProps {
  totalMovements: number;
  posMovementsCount: number;
  mermasCount: number;
  lastMovementDate?: string;
}

export interface IAdminKardexPosEvents {
  onOpenAdjustmentModal?: () => void;
}

export type AdminKardexPosContract = IAdminKardexPosProps & IAdminKardexPosEvents;
