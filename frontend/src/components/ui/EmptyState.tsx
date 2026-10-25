// Estado vacio centrado con titulo, descripcion y accion opcional.
import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const emptyStateVariants = cva("flex flex-col items-center text-center", {
  variants: {
    spacing: {
      default: "gap-4 py-10",
      compact: "gap-2 py-6",
      spacious: "gap-6 py-16",
    },
  },
  defaultVariants: {
    spacing: "default",
  },
});

export interface EmptyStateProps extends VariantProps<typeof emptyStateVariants> {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
  className?: string;
}

export function EmptyState({
  titulo,
  descripcion,
  accion,
  spacing,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(emptyStateVariants({ spacing }), className)}>
      <p className="font-display text-lg font-semibold text-tertiary">{titulo}</p>
      {descripcion && <p className="font-body text-ink/70">{descripcion}</p>}
      {accion}
    </div>
  );
}
