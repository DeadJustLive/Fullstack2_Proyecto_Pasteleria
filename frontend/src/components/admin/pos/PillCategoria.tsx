// Pill de categoria del POS con estado activo.
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const pillVariants = cva(
  "shrink-0 rounded-full px-4 py-2 font-body font-semibold transition-colors",
  {
    variants: {
      active: {
        true: "bg-primary text-inverted",
        false: "border border-tertiary/30 text-tertiary hover:bg-tertiary/10",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

interface PillCategoriaProps extends VariantProps<typeof pillVariants> {
  label: string;
  onClick: () => void;
  className?: string;
}

export function PillCategoria({ label, onClick, active, className }: PillCategoriaProps) {
  return (
    <button type="button" onClick={onClick} className={cn(pillVariants({ active }), className)}>
      {label}
    </button>
  );
}
