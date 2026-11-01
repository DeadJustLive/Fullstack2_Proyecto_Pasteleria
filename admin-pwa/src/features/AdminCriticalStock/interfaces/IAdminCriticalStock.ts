// @pca:start
// @id(admin.feature.criticalstock.interface)
// @kind(interface)
// @limit(lines: 150)
// @contract(CriticalSeverity, IAdminCriticalStockProps, IAdminCriticalStockEvents, AdminCriticalStockContract)
// @desc(Contrato público de datos y eventos para el módulo FIDA AdminCriticalStock)
// @pca:end

/**
 * FIDA - Interface Layer (I)
 *
 * Contract for: AdminCriticalStock
 * Created: 2026-10-31
 *
 * Define estrictamente qué datos entran (Props) y qué eventos salen (Events).
 * ⚠️ Nivel de Impacto FIDA: ALTO (+60 pts) — Cambios aquí disparan el WAL documental.
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
