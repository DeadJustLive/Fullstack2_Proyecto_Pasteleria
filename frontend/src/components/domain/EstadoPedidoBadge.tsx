// @pca:start
// @id(frontend.domain.estadoPedidoBadge)
// @kind(component)
// @limit(lines: 80)
// @contract(props: estado: string, className?: string)
// @relates(docs.reglas_ui)
// @desc(Insignia con variante de color semantico segun el estado del pedido)
// @pca:end
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const estadoPedidoBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-semibold tracking-wide",
  {
    variants: {
      variante: {
        pendiente: "border-amber-200 bg-amber-50 text-amber-800",
        preparacion: "border-amber-300 bg-amber-100 text-amber-900",
        listo: "border-sky-300 bg-sky-100 text-sky-900",
        entregado: "border-green-300 bg-green-100 text-green-900",
        cancelado: "border-red-300 bg-red-100 text-red-900",
      },
      size: {
        sm: "gap-1 px-2 py-0.5 text-[0.7rem]",
        default: "gap-1.5 px-3 py-0.5 text-xs",
        lg: "gap-2 px-3.5 py-1 text-sm",
      },
    },
    defaultVariants: {
      variante: "pendiente",
      size: "default",
    },
  }
);

export type EstadoPedidoTipo = "pendiente" | "preparacion" | "listo" | "entregado" | "cancelado";

function normalizarEstado(raw: string): EstadoPedidoTipo {
  if (!raw || typeof raw !== "string") return "pendiente";
  const norm = raw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  if (norm.includes("cancel") || norm.includes("rechaz") || norm.includes("anul") || norm.includes("fall")) return "cancelado";
  if (norm.includes("entreg") || norm.includes("exit") || norm.includes("complet") || norm.includes("finaliz")) return "entregado";
  if (norm.includes("listo") || norm.includes("camin") || norm.includes("envia") || norm.includes("despach") || norm.includes("retiro")) return "listo";
  if (norm.includes("preparac") || norm.includes("proces") || norm.includes("cocin") || norm.includes("elaborac")) return "preparacion";
  return "pendiente";
}

export interface EstadoPedidoBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof estadoPedidoBadgeVariants> {
  estado: string;
}

export function EstadoPedidoBadge({
  estado,
  variante,
  size,
  className,
  ...props
}: EstadoPedidoBadgeProps) {
  const estilo = variante ?? normalizarEstado(estado);

  return (
    <span
      className={cn(estadoPedidoBadgeVariants({ variante: estilo, size }), className)}
      {...props}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {estado}
    </span>
  );
}

