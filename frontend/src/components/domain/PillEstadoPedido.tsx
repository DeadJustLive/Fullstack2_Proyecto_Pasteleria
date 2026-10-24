// Pill con el estado de un pedido. Entregado se ve neutro; el resto, activo.
import { cva } from "class-variance-authority";
import { LABEL_ESTADO } from "@/data/pedidos";
import type { EstadoPedido } from "@/types/pedido";

const pillVariants = cva(
  "inline-block whitespace-nowrap rounded-full px-3 py-0.5 font-body text-xs font-bold uppercase tracking-wide",
  {
    variants: {
      fase: {
        activo: "bg-primary text-tertiary",
        entregado: "bg-tertiary/10 text-tertiary",
      },
    },
    defaultVariants: {
      fase: "activo",
    },
  }
);

export function PillEstadoPedido({ estado }: { estado: EstadoPedido }) {
  return (
    <span className={pillVariants({ fase: estado === "entregado" ? "entregado" : "activo" })}>
      {LABEL_ESTADO[estado]}
    </span>
  );
}
