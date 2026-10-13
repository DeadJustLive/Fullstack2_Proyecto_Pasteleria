import { cva, type VariantProps } from "class-variance-authority";
import type { BadgeTipo } from "@/types/product";
import { cn } from "@/lib/utils";

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
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tipo, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tipo }), className)} {...props} />;
}