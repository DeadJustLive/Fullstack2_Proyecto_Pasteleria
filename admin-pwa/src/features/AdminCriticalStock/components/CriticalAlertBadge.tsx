// @pca:start
// @id(admin.feature.criticalstock.alertBadge)
// @kind(component)
// @limit(lines: 180)
// @contract(CriticalAlertBadge)
// @relates(admin.feature.criticalstock.dependencies)
// @desc(Subcomponente privado de insignia de severidad de stock crítico)
// @pca:end

import {
  AlertTriangle,
  CheckCircle2,
  type CriticalSeverity,
} from "../dependencies/dependencies";

interface CriticalAlertBadgeProps {
  severity: CriticalSeverity;
  criticalCount: number;
  threshold: number;
}

export function CriticalAlertBadge({
  severity,
  criticalCount,
  threshold,
}: CriticalAlertBadgeProps) {
  if (severity === "healthy") {
    return (
      <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1.5 px-2.5 py-1">
        <CheckCircle2 size={13} />
        <span>Stock óptimo (&gt; {threshold} uds.)</span>
      </span>
    );
  }

  return (
    <span className="badge bg-danger-subtle text-danger border border-danger-subtle d-inline-flex align-items-center gap-1.5 px-2.5 py-1">
      <AlertTriangle size={13} />
      <span>
        {criticalCount} {criticalCount === 1 ? "producto crítico" : "productos críticos"} (≤ {threshold} uds.)
      </span>
    </span>
  );
}
