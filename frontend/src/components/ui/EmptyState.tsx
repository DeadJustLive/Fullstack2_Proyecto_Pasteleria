// Estado vacio centrado con titulo, descripcion y accion opcional.
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
  className?: string;
}

export function EmptyState({ titulo, descripcion, accion, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-4 py-10 text-center", className)}>
      <p className="font-display text-lg font-semibold text-tertiary">{titulo}</p>
      {descripcion && <p className="font-body text-ink/70">{descripcion}</p>}
      {accion}
    </div>
  );
}
