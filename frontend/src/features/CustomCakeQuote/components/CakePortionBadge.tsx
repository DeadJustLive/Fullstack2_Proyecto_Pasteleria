import { CakeSlice } from "../dependencies/dependencies";

interface CakePortionBadgeProps {
  portions: number;
}

export function CakePortionBadge({ portions }: CakePortionBadgeProps) {
  const tiersLabel = portions >= 30 ? "2 Pisos Artesanales" : "1 Piso Clásico";

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2.5 py-0.5 text-[11px] font-bold text-secondary">
      <CakeSlice size={12} />
      {tiersLabel}
    </span>
  );
}
