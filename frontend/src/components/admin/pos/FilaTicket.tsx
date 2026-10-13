import { CantidadStepper } from "@/components/ui/CantidadStepper";
import { formatPrecio } from "@/lib/utils";
import type { ItemTicket } from "@/types/ticket";

interface FilaTicketProps {
  item: ItemTicket;
  onCambiar: (productoId: number, delta: number) => void;
}

export function FilaTicket({ item, onCambiar }: FilaTicketProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-dashed border-tertiary/15 py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <span className="block truncate font-body font-semibold text-secondary">
          {item.producto.nombre}
        </span>
        <span className="font-body text-sm text-secondary">
          {formatPrecio(item.producto.precio)} c/u
        </span>
      </div>
      <CantidadStepper
        variant="compact"
        valor={item.cantidad}
        onCambiar={(n) => onCambiar(item.producto.id, n - item.cantidad)}
      />
    </div>
  );
}
