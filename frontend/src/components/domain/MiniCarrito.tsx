import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CantidadStepper } from "@/components/ui/CantidadStepper";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCart } from "@/context/cart";
import { formatPrecio } from "@/lib/utils";

interface MiniCarritoProps {
  abierto: boolean;
  onCerrar: () => void;
}

export function MiniCarrito({ abierto, onCerrar }: MiniCarritoProps) {
  const { items, subtotal, envio, total, cantidadTotal, cambiarCantidad, quitar } = useCart();
  const navigate = useNavigate();

  const irA = (ruta: string) => {
    onCerrar();
    navigate(ruta);
  };

  return (
    <Modal abierto={abierto} titulo={`Tu carrito (${cantidadTotal})`} onCerrar={onCerrar}>
      {items.length === 0 ? (
        <EmptyState
          titulo="Tu carrito está vacío."
          accion={
            <Button onClick={() => irA("/catalogo")}>Explorar catálogo</Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          <ul className="flex max-h-[50vh] flex-col overflow-y-auto pr-1">
            {items.map(({ producto, cantidad }) => {
              const tieneStock = typeof producto.stock === "number" && producto.stock >= 0;
              return (
                <li
                  key={producto.id}
                  className="flex items-center gap-3 border-b border-dashed border-tertiary/20 py-3 first:pt-0 last:border-b-0 last:pb-0"
                >
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="h-14 w-14 shrink-0 rounded-[10px] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-semibold text-tertiary">
                      {producto.nombre}
                    </p>
                    <p className="font-body text-xs text-secondary">
                      {formatPrecio(producto.precio)} c/u
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <CantidadStepper
                        variant="compact"
                        valor={cantidad}
                        min={1}
                        max={tieneStock ? producto.stock : undefined}
                        onCambiar={(n) => cambiarCantidad(producto.id, n)}
                      />
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="font-body text-sm font-bold text-tertiary">
                      {formatPrecio(producto.precio * cantidad)}
                    </span>
                    <button
                      type="button"
                      onClick={() => quitar(producto.id)}
                      aria-label={`Eliminar ${producto.nombre}`}
                      title="Eliminar producto"
                      className="rounded p-1 text-secondary/75 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="border-t border-dashed border-tertiary/20 pt-3">
            <div className="flex justify-between py-1 font-body">
              <span>Subtotal</span>
              <span className="font-semibold">{formatPrecio(subtotal)}</span>
            </div>
            <div className="flex justify-between py-1 font-body">
              <span>Envío a domicilio</span>
              <span className="font-semibold">{formatPrecio(envio)}</span>
            </div>
            <div className="flex justify-between pt-2 font-display text-lg font-bold text-tertiary">
              <span>Total</span>
              <span>{formatPrecio(total)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button className="w-full" onClick={() => irA("/checkout")}>
              Ir a pagar
            </Button>
            <Button variant="outline" className="w-full" onClick={() => irA("/carrito")}>
              Ver carrito
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
