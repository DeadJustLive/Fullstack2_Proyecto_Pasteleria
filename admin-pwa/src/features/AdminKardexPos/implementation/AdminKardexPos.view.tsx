// @pca:start
// @id(admin.feature.kardexpos.view)
// @kind(view)
// @limit(lines: 260)
// @contract(AdminKardexPosView(props: AdminKardexPosContract))
// @relates(admin.feature.kardexpos.interface)
// @relates(admin.feature.kardexpos.dependencies)
// @relates(admin.feature.kardexpos.syncBadge)
// @desc(Implementación visual de estado de sincronización Kardex + POS en tiempo real)
// @pca:end

import {
  Activity,
  type AdminKardexPosContract,
  type IAdminKardexPosEvents,
  type IAdminKardexPosProps,
  type KardexSyncState,
} from "../dependencies/dependencies";
import { KardexSyncBadge } from "../components/KardexSyncBadge";

export function AdminKardexPosView(props: AdminKardexPosContract) {
  const {
    totalMovements,
    posMovementsCount,
    mermasCount,
    lastMovementDate,
  }: IAdminKardexPosProps = props;
  const { onOpenAdjustmentModal }: IAdminKardexPosEvents = props;

  const syncState: KardexSyncState = totalMovements > 0 ? "synced" : "pending";

  return (
    <div className="card admin-card p-3 mb-3 border-start border-4 border-success">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Activity size={18} className="text-success" />
          <span className="fw-bold text-secondary small">
            Sincronización Kardex + POS:
          </span>
          <KardexSyncBadge state={syncState} lastMovementDate={lastMovementDate} />
        </div>
        <div className="d-flex align-items-center gap-3 small text-muted flex-wrap">
          <span>
            Movimientos: <strong className="text-secondary">{totalMovements}</strong>
          </span>
          <span>
            Ventas POS: <strong className="text-primary">{posMovementsCount}</strong>
          </span>
          <span>
            Mermas: <strong className="text-danger">{mermasCount}</strong>
          </span>
          {onOpenAdjustmentModal && (
            <button
              type="button"
              onClick={onOpenAdjustmentModal}
              className="btn btn-sm btn-link p-0 text-decoration-none"
            >
              + Nuevo ajuste
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
