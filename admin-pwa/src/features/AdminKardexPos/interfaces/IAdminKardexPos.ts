/**
 * Module Public Contract
 *
 * Contract for: AdminKardexPos
 * Created: 2026-10-31
 *
 * Define estrictamente qué datos entran (Props) y qué eventos salen (Events).
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
