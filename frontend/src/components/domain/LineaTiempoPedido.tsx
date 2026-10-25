// @pca:start
// @id(frontend.domain.lineaTiempoPedido)
// @kind(component)
// @limit(lines: 140)
// @contract(props: hitos: HitoPedido[])
// @relates(docs.reglas_ui)
// @desc(Linea de tiempo cronologica con estados completados, activo y pendientes)
// @pca:end
import { Check, Clock, Sparkles } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

export interface HitoPedido {
  id: string;
  titulo: string;
  fechaHora?: string;
  descripcion: string;
  estado: "completado" | "activo" | "pendiente";
}

const hitoMarcadorVariants = cva(
  "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all",
  {
    variants: {
      estado: {
        completado: "border-secondary bg-secondary text-white shadow-sm",
        activo: "animate-pulse border-secondary bg-primary text-tertiary shadow-md ring-4 ring-primary/40",
        pendiente: "border-tertiary/20 bg-white text-ink/40",
      },
    },
    defaultVariants: {
      estado: "pendiente",
    },
  }
);

const hitoCardVariants = cva(
  "flex flex-1 flex-col gap-1 rounded-xl p-3 transition-colors sm:p-4",
  {
    variants: {
      estado: {
        completado: "hover:bg-neutral/40",
        activo: "border border-secondary/20 bg-primary/15",
        pendiente: "hover:bg-neutral/40",
      },
    },
    defaultVariants: {
      estado: "pendiente",
    },
  }
);

const hitoTituloVariants = cva("font-body", {
  variants: {
    estado: {
      completado: "text-base font-bold text-tertiary",
      activo: "font-display text-lg font-semibold text-secondary",
      pendiente: "text-base font-bold text-ink/60",
    },
  },
  defaultVariants: {
    estado: "pendiente",
  },
});

const hitoFechaVariants = cva("rounded-full px-2.5 py-0.5 font-body text-xs", {
  variants: {
    estado: {
      completado: "bg-tertiary/10 font-medium text-tertiary",
      activo: "bg-secondary font-semibold text-white",
      pendiente: "bg-tertiary/5 font-medium text-ink/50",
    },
  },
  defaultVariants: {
    estado: "pendiente",
  },
});

export interface LineaTiempoPedidoProps {
  hitos: HitoPedido[];
  className?: string;
}

export function LineaTiempoPedido({ hitos, className }: LineaTiempoPedidoProps) {
  return (
    <div className={cn("relative flex flex-col py-2", className)}>
      <div
        className="absolute bottom-6 left-5 top-6 w-0.5 bg-gradient-to-b from-secondary via-primary/50 to-tertiary/15"
        aria-hidden="true"
      />

      <ol className="flex flex-col gap-6">
        {hitos.map((hito) => {
          const esCompletado = hito.estado === "completado";
          const esActivo = hito.estado === "activo";
          const esPendiente = hito.estado === "pendiente";

          return (
            <li key={hito.id} className="relative flex items-start gap-4 pl-1">
              <div className={hitoMarcadorVariants({ estado: hito.estado })}>
                {esCompletado && <Check size={18} strokeWidth={2.5} />}
                {esActivo && <Sparkles size={18} className="text-secondary" />}
                {esPendiente && <Clock size={16} />}
              </div>

              <div className={hitoCardVariants({ estado: hito.estado })}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className={hitoTituloVariants({ estado: hito.estado })}>
                    {hito.titulo}
                  </h3>
                  {hito.fechaHora && (
                    <span className={hitoFechaVariants({ estado: hito.estado })}>
                      {hito.fechaHora}
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    "font-body text-sm leading-relaxed",
                    esActivo ? "font-medium text-ink" : "text-ink/75"
                  )}
                >
                  {hito.descripcion}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
