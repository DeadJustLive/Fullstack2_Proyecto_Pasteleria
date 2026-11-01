// @pca:start
// @id(admin.feature.boletasii.interface)
// @kind(interface)
// @limit(lines: 150)
// @contract(SiiComplianceState, IAdminBoletaSiiProps, IAdminBoletaSiiEvents, AdminBoletaSiiContract)
// @desc(Contrato público de datos y eventos para el módulo FIDA AdminBoletaSii)
// @pca:end

/**
 * FIDA - Interface Layer (I)
 *
 * Contract for: AdminBoletaSii
 * Created: 2026-10-31
 *
 * Define estrictamente qué datos entran (Props) y qué eventos salen (Events).
 * ⚠️ Nivel de Impacto FIDA: ALTO (+60 pts) — Cambios aquí disparan el WAL documental.
 */

export type SiiComplianceState = "compliant" | "Empty" | "warning";

export interface IAdminBoletaSiiProps {
  totalOrders: number;
  totalGrossAmount: number;
  totalIvaAmount: number;
  taxRatePercent?: number;
}

export interface IAdminBoletaSiiEvents {
  onSelectCompliantFilter?: (state: SiiComplianceState) => void;
}

export type AdminBoletaSiiContract = IAdminBoletaSiiProps & IAdminBoletaSiiEvents;
