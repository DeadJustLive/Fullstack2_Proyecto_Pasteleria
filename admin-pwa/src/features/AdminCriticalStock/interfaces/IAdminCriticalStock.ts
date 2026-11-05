/**
 * Module Public Contract
 *
 * Contract for: AdminCriticalStock
 * Created: 2026-10-31
 *
 * Define estrictamente qué datos entran (Props) y qué eventos salen (Events).
 */

export type CriticalSeverity = "healthy" | "alert" | "critical";

export interface IAdminCriticalStockProps {
  criticalCount: number;
  totalCatalogCount: number;
  threshold?: number;
}

export interface IAdminCriticalStockEvents {
  onFocusCritical?: () => void;
}

export type AdminCriticalStockContract = IAdminCriticalStockProps & IAdminCriticalStockEvents;
