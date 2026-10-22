// @pca:start
// @id(frontend.ui.badge)
// @kind(component)
// @limit(lines: 40)
// @contract(props: tipo: BadgeTipo + HTMLAttributes)
// @relates(docs.reglas_ui)
// @desc(Etiqueta flotante sobre la foto del producto)
// @pca:end
import { cva, type VariantProps } from "class-variance-authority";
import type { BadgeTipo } from "@/types/product";
import { cn } from "@/lib/utils";

// Medidas alineadas con `.badge` del snapshot (catalogo.css):
// gap .3rem · font-size .72rem · letter-spacing .04em · padding .25rem .7rem.
const badgeVariants = cva(
  "absolute left-3 top-3 z-10 inline-flex items-center gap-[0.3rem] rounded-full px-[0.7rem] py-[0.25rem] text-[0.72rem] font-bold uppercase tracking-[0.04em] shadow-[0_2px_4px_rgba(93,64,55,0.1)]",
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
