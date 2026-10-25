// Pill con el estado de un pedido, usando los tonos del badge de estado.
import { EstadoBadge, type EstadoBadgeProps } from "@/components/ui/Badge";
import { LABEL_ESTADO } from "@/data/pedidos";
import type { EstadoPedido } from "@/types/pedido";

const TONO_ESTADO: Record<EstadoPedido, NonNullable<EstadoBadgeProps["tono"]>> = {
  recibido: "info",
  preparacion: "warning",
  listo: "primary",
  camino: "info",
  entregado: "neutral",
};

export function PillEstadoPedido({ estado }: { estado: EstadoPedido }) {
  return <EstadoBadge tono={TONO_ESTADO[estado]}>{LABEL_ESTADO[estado]}</EstadoBadge>;
}
