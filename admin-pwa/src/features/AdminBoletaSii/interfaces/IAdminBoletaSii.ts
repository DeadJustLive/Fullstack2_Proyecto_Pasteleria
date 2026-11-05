/**
 * Module Public Contract
 *
 * Contract for: AdminBoletaSii
 * Created: 2026-10-31
 *
 * Define estrictamente qué datos entran (Props) y qué eventos salen (Events).
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
