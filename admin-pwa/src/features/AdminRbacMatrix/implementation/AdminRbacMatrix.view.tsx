import {
  KeyRound,
  type AdminRbacMatrixContract,
  type IAdminRbacMatrixEvents,
  type IAdminRbacMatrixProps,
  type RbacSecurityLevel,
} from "../dependencies/dependencies";
import { RbacRoleBadge } from "../components/RbacRoleBadge";

export function AdminRbacMatrixView(props: AdminRbacMatrixContract) {
  const {
    totalUsers,
    adminUsersCount,
    staffUsersCount,
    activeTab,
  }: IAdminRbacMatrixProps = props;
  const { onToggleMatrixTab }: IAdminRbacMatrixEvents = props;

  const level: RbacSecurityLevel = totalUsers > 0 ? "enforced" : "standby";

  return (
    <div className="card admin-card p-3 mb-3 border-start border-4 border-secondary">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <KeyRound size={18} className="text-secondary" />
          <span className="fw-bold text-secondary small">
            Seguridad de Acceso &amp; Roles RBAC:
          </span>
          <RbacRoleBadge level={level} adminUsersCount={adminUsersCount} />
        </div>
        <div className="d-flex align-items-center gap-3 small text-muted flex-wrap">
          <span>
            Cuentas activas: <strong className="text-secondary">{totalUsers}</strong>
          </span>
          <span>
            Operativos (Pastelería/Reparto):{" "}
            <strong className="text-secondary">{staffUsersCount}</strong>
          </span>
          {onToggleMatrixTab && (
            <button
              type="button"
              onClick={onToggleMatrixTab}
              className="btn btn-sm btn-link p-0 text-decoration-none"
            >
              {activeTab === "matriz" ? "Ver cuentas" : "Ver matriz RBAC"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
