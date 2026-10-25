// @pca:start
// @id(frontend.ui.modal)
// @kind(component)
// @limit(lines: 90)
// @contract(props: abierto: boolean, titulo: string, onCerrar: () => void, children: ReactNode)
// @relates(docs.reglas_ui)
// @desc(Ventana modal accesible con cierre por escape y fondo bloqueado)
// @pca:end
import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const modalVariants = cva(
  "relative flex max-h-[85vh] w-full flex-col overflow-hidden rounded-xl bg-white shadow-xl",
  {
    variants: {
      tamano: {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
      },
    },
    defaultVariants: {
      tamano: "md",
    },
  }
);

export interface ModalProps extends VariantProps<typeof modalVariants> {
  abierto: boolean;
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({
  abierto,
  titulo,
  onCerrar,
  children,
  tamano,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!abierto) return;
    const manejarEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    document.addEventListener("keydown", manejarEscape);
    return () => document.removeEventListener("keydown", manejarEscape);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-inverted/60 p-4"
      onClick={onCerrar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
        className={cn(modalVariants({ tamano }), className)}
      >
        <div className="flex items-center justify-between border-b border-tertiary/10 bg-neutral px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-tertiary">{titulo}</h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="text-tertiary transition-colors hover:text-secondary"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
