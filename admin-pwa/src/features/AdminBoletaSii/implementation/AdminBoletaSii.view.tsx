// @pca:start
// @id(admin.feature.boletasii.view)
// @kind(view)
// @limit(lines: 260)
// @contract(AdminBoletaSiiView(props: AdminBoletaSiiContract))
// @relates(admin.feature.boletasii.interface)
// @relates(admin.feature.boletasii.dependencies)
// @relates(admin.feature.boletasii.taxPill)
// @desc(Implementación visual principal del resumen tributario SII 19% IVA para órdenes)
// @pca:end

import {
  Receipt,
  type AdminBoletaSiiContract,
  type IAdminBoletaSiiEvents,
  type IAdminBoletaSiiProps,
  type SiiComplianceState,
} from "../dependencies/dependencies";
import { SiiTaxPill } from "../components/SiiTaxPill";

function formatClp(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function AdminBoletaSiiView(props: AdminBoletaSiiContract) {
  const {
    totalOrders,
    totalGrossAmount,
    totalIvaAmount,
    taxRatePercent = 19,
  }: IAdminBoletaSiiProps = props;
  const { onSelectCompliantFilter }: IAdminBoletaSiiEvents = props;

  const complianceState: SiiComplianceState =
    totalOrders > 0 ? "compliant" : "Empty";
  const netAmount = Math.max(0, totalGrossAmount - totalIvaAmount);

  return (
    <div className="card admin-card p-3 mb-3 border-start border-4 border-primary">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Receipt size={18} className="text-primary" />
          <span className="fw-bold text-secondary small">
            Cumplimiento Tributario SII (Boletas Electrónicas):
          </span>
          <SiiTaxPill state={complianceState} taxRatePercent={taxRatePercent} />
        </div>
        <div className="d-flex align-items-center gap-3 small text-muted flex-wrap">
          <span>
            Folios listados: <strong className="text-secondary">{totalOrders}</strong>
          </span>
          <span>
            Neto afecta: <strong className="text-secondary">{formatClp(netAmount)}</strong>
          </span>
          <span>
            IVA ({taxRatePercent}%):{" "}
            <strong className="text-primary">{formatClp(totalIvaAmount)}</strong>
          </span>
          <span>
            Total Bruto:{" "}
            <strong className="text-secondary">{formatClp(totalGrossAmount)}</strong>
          </span>
          {onSelectCompliantFilter && (
            <button
              type="button"
              className="btn btn-sm btn-link p-0 text-decoration-none"
              onClick={() => onSelectCompliantFilter(complianceState)}
            >
              Verificar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
