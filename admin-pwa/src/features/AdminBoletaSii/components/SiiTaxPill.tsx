import {
  FileCheck2,
  ShieldCheck,
  type SiiComplianceState,
} from "../dependencies/dependencies";

interface SiiTaxPillProps {
  state: SiiComplianceState;
  taxRatePercent: number;
}

export function SiiTaxPill({ state, taxRatePercent }: SiiTaxPillProps) {
  if (state === "compliant") {
    return (
      <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1.5 px-2.5 py-1">
        <ShieldCheck size={13} />
        <span>SII DTE Activo · IVA {taxRatePercent}%</span>
      </span>
    );
  }

  return (
    <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle d-inline-flex align-items-center gap-1.5 px-2.5 py-1">
      <FileCheck2 size={13} />
      <span>Sin folios en vista ({taxRatePercent}% IVA)</span>
    </span>
  );
}
