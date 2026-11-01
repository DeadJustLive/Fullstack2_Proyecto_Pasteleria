// @pca:start
// @id(admin.feature.rbacmatrix.interface)
// @kind(interface)
// @limit(lines: 150)
// @contract(RbacSecurityLevel, IAdminRbacMatrixProps, IAdminRbacMatrixEvents, AdminRbacMatrixContract)
// @desc(Contrato público de datos y eventos para el módulo FIDA AdminRbacMatrix)
// @pca:end

/**
 * FIDA - Interface Layer (I)
 *
 * Contract for: AdminRbacMatrix
 * Created: 2026-10-31
 *
 * Define estrictamente qué datos entran (Props) y qué eventos salen (Events).
 * ⚠️ Nivel de Impacto FIDA: ALTO (+60 pts) — Cambios aquí disparan el WAL documental.
 */

export type RbacSecurityLevel = "enforced" | "standby";

export interface IAdminRbacMatrixProps {
  totalUsers: number;
  adminUsersCount: number;
  staffUsersCount: number;
  activeTab: "usuarios" | "matriz";
}

export interface IAdminRbacMatrixEvents {
  onToggleMatrixTab?: () => void;
}

export type AdminRbacMatrixContract = IAdminRbacMatrixProps & IAdminRbacMatrixEvents;
