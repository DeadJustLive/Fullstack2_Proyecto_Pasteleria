// @pca:start
// @id(admin.feature.kardexpos.syncBadge)
// @kind(component)
// @limit(lines: 180)
// @contract(KardexSyncBadge)
// @relates(admin.feature.kardexpos.dependencies)
// @desc(Subcomponente privado de insignia de sincronización Kardex + POS)
// @pca:end

import {
  CheckCircle2,
  Radio,
  type KardexSyncState,
} from "../dependencies/dependencies";

interface KardexSyncBadgeProps {
  state: KardexSyncState;
  lastMovementDate?: string;
}

export function KardexSyncBadge({
  state,
  lastMovementDate,
}: KardexSyncBadgeProps) {
  if (state === "synced") {
    return (
      <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1.5 px-2.5 py-1">
        <Radio size={12} />
        <span>
          Kardex + POS en línea {lastMovementDate ? `(${lastMovementDate})` : ""}
        </span>
      </span>
    );
  }

  return (
    <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle d-inline-flex align-items-center gap-1.5 px-2.5 py-1">
      <CheckCircle2 size={12} />
      <span>Trazabilidad lista</span>
    </span>
  );
}
