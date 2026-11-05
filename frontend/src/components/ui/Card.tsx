// Panel reutilizable con borde, fondo y sombra del design system.
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-xl border border-tertiary/10 bg-white shadow-sm",
  {
    variants: {
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-10",
      },
    },
    defaultVariants: {
      padding: "md",
    },
  }
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({ className, padding, ...props }: CardProps) {
  return <div className={cn(cardVariants({ padding }), className)} {...props} />;
}
