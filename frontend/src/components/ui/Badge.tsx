import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import type { BadgeTipo } from "@/types/product";
import { cn } from "@/lib/utils";

// Etiqueta de producto: se coloca sobre la imagen de la tarjeta.
const badgeVariants = cva(
  "absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.72rem] font-bold uppercase tracking-wider shadow-[0_2px_4px_rgba(93,64,55,0.1)]",
  {
    variants: {
      tipo: {
        premium: "bg-primary text-tertiary",
        temporada: "bg-[#FFDBD0] text-tertiary",
        vendido: "bg-[#FFD9DF] text-tertiary",
        personalizable: "bg-neutral text-secondary",
      } satisfies Record<BadgeTipo, string>,
    },
    defaultVariants: {
      tipo: "premium",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tipo, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tipo }), className)} {...props} />;
}

// Etiqueta de estado para tablas y paneles del admin (stock, pedidos, roles).
const estadoBadgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-0.5 font-body text-xs font-bold uppercase tracking-wide",
  {
    variants: {
      tono: {
        success: "bg-[#d4edda] text-[#155724]",
        warning: "bg-[#fff3cd] text-[#856404]",
        danger: "bg-[#f8d7da] text-[#d9534f]",
        info: "bg-[#cce5ff] text-[#004085]",
        neutral: "bg-tertiary/10 text-tertiary",
        primary: "bg-primary text-tertiary",
      },
    },
    defaultVariants: {
      tono: "neutral",
    },
  }
);

export interface EstadoBadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof estadoBadgeVariants> {}

export function EstadoBadge({ className, tono, ...props }: EstadoBadgeProps) {
  return <span className={cn(estadoBadgeVariants({ tono }), className)} {...props} />;
}
