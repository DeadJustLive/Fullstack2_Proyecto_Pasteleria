import {
  Lock,
  ShieldCheck,
  type RbacSecurityLevel,
} from "../dependencies/dependencies";

interface RbacRoleBadgeProps {
  level: RbacSecurityLevel;
  adminUsersCount: number;
}

export function RbacRoleBadge({ level, adminUsersCount }: RbacRoleBadgeProps) {
  if (level === "enforced") {
    return (
      <span className="badge bg-primary-subtle text-primary border border-primary-subtle d-inline-flex align-items-center gap-1.5 px-2.5 py-1">
        <ShieldCheck size={13} />
        <span>RBAC JWT Activo ({adminUsersCount} Admin)</span>
      </span>
    );
  }

  return (
    <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle d-inline-flex align-items-center gap-1.5 px-2.5 py-1">
      <Lock size={13} />
      <span>Matriz RBAC en espera</span>
    </span>
  );
}
