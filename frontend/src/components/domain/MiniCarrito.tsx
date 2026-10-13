import { useNavigate } from "react-router-dom";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCart } from "@/context/cart";
import { formatPrecio } from "@/lib/utils";

interface MiniCarritoProps {
  abierto: boolean;
  onCerrar: () => void;
}

export function MiniCarrito({ abierto, onCerrar }: MiniCarritoProps) {
  const { items, subtotal, envio, total, cantidadTotal } = useCart();
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
          <ul className="flex flex-col">
            {items.map(({ producto, cantidad }) => (
              <li
                key={producto.id}
                className="flex items-center gap-3 border-b border-dashed border-tertiary/20 py-3 first:pt-0 last:border-b-0 last:pb-0"
              >
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="h-16 w-16 shrink-0 rounded-[10px] object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display font-semibold text-tertiary">
                    {producto.nombre}
                  </p>
                  <p className="font-body text-sm text-secondary">
                    {formatPrecio(producto.precio)} c/u · ×{cantidad}
                  </p>
                </div>
                <span className="min-w-[5.5rem] shrink-0 text-right font-body font-bold text-tertiary">
                  {formatPrecio(producto.precio * cantidad)}
                </span>
              </li>
            ))}
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
