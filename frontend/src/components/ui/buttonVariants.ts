// @pca:start
// @id(frontend.ui.buttonVariants)
// @kind(service)
// @limit(lines: 60)
// @contract(cva: variant(primary|secondary|outline|ghost) x size(sm|default|lg|icon))
// @relates(docs.reglas_ui)
// @desc(Variantes compartidas por Button y ButtonLink del design system)
// @pca:end
import { cva, type VariantProps } from "class-variance-authority";

/**
 * Variantes del boton del design system.
 *
 * Vive en su propio archivo (y no dentro de `Button.tsx`) para que tanto
 * `Button` como `ButtonLink` compartan exactamente los mismos estilos sin
 * que el modulo exporte componentes y constantes a la vez (regla de React
 * Fast Refresh).
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-body font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-inverted hover:bg-secondary hover:text-white",
        secondary: "bg-secondary text-white hover:bg-tertiary",
        outline:
          "border border-tertiary text-tertiary hover:bg-tertiary hover:text-white",
        ghost: "text-tertiary hover:bg-tertiary/10",
        destructive: "bg-error text-white hover:bg-error/90",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        default: "h-11 px-5 text-base",
        lg: "h-12 px-8 text-lg",
        icon: "h-11 w-11 shrink-0 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
