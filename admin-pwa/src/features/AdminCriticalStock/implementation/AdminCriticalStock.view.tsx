import {
  PackageOpen,
  type AdminCriticalStockContract,
  type CriticalSeverity,
  type IAdminCriticalStockEvents,
  type IAdminCriticalStockProps,
} from "../dependencies/dependencies";
import { CriticalAlertBadge } from "../components/CriticalAlertBadge";

export function AdminCriticalStockView(props: AdminCriticalStockContract) {
  const {
    criticalCount,
    totalCatalogCount,
    threshold = 5,
  }: IAdminCriticalStockProps = props;
  const { onFocusCritical }: IAdminCriticalStockEvents = props;

  const severity: CriticalSeverity =
    criticalCount === 0 ? "healthy" : criticalCount >= 3 ? "critical" : "alert";

  const healthyCount = Math.max(0, totalCatalogCount - criticalCount);

  return (
    <div className="card admin-card p-3 mb-3 border-start border-4 border-danger">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <PackageOpen size={18} className="text-danger" />
          <span className="fw-bold text-secondary small">
            Monitor Ejecutivo de Stock Crítico:
          </span>
          <CriticalAlertBadge
            severity={severity}
            criticalCount={criticalCount}
            threshold={threshold}
          />
        </div>
        <div className="d-flex align-items-center gap-3 small text-muted flex-wrap">
          <span>
            Abastecidos: <strong className="text-success">{healthyCount}</strong> / {totalCatalogCount}
          </span>
          {onFocusCritical && criticalCount > 0 && (
            <button
              type="button"
              onClick={onFocusCritical}
              className="btn btn-sm btn-outline-danger py-0.5 px-2"
            >
              Filtrar críticos ({criticalCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
