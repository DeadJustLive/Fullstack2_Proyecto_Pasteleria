import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const pillFiltroVariants = cva(
  "shrink-0 rounded-full px-4 py-2 font-body text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  {
    variants: {
      active: {
        true: "bg-primary text-inverted shadow-sm",
        false: "border border-tertiary/30 text-tertiary hover:bg-tertiary/10",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

export interface PillFiltroProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof pillFiltroVariants> {}

export function PillFiltro({
  className,
  active,
  type = "button",
  ...props
}: PillFiltroProps) {
  return (
    <button
      type={type}
      className={cn(pillFiltroVariants({ active }), className)}
      {...props}
    />
  );
}
