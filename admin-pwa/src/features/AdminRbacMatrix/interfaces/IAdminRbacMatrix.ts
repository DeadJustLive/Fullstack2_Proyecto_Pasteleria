/**
 * Module Public Contract
 *
 * Contract for: AdminRbacMatrix
 * Created: 2026-10-31
 *
 * Define estrictamente qué datos entran (Props) y qué eventos salen (Events).
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
