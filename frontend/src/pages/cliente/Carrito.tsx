import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { PageHero } from "@/components/ui/PageHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { CantidadStepper } from "@/components/ui/CantidadStepper";
import { OrderSummary } from "@/components/domain/OrderSummary";
import { useCart } from "@/context/cart";
import { formatPrecio } from "@/lib/utils";

export function Carrito() {
  const {
    items,
    cupon,
    cantidadTotal,
    subtotal,
    descuento,
    envio,
    total,
    quitar,
    cambiarCantidad,
    aplicarCupon,
    quitarCupon,
  } = useCart();
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState("");
  const [errorCupon, setErrorCupon] = useState<string | null>(null);

  const handleCupon = (e: FormEvent) => {
    e.preventDefault();
    if (aplicarCupon(codigo)) {
      setCodigo("");
      setErrorCupon(null);
    } else {
      setErrorCupon("Código de descuento no válido.");
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Tu selección"
        titulo="Carrito de Compras"
        descripcion="Revisa tus dulces antes de pasar al pago."
        className="carrito-hero"
      />

      <div className="grid gap-6 min-[900px]:grid-cols-[1fr_minmax(260px,330px)]">
        <Card>
          <h2 className="text-left">Tus productos ({cantidadTotal})</h2>

          {items.length === 0 ? (
            <EmptyState
              titulo="Tu carrito está vacío."
              accion={
                <Button onClick={() => navigate("/catalogo")}>
                  Explorar catálogo
                </Button>
              }
              className="py-12"
            />
          ) : (
            <ul>
              {items.map((item) => {
                const { producto, cantidad } = item;
                return (
                  <li
                    key={producto.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-dashed border-tertiary/20 py-4 first:pt-0 last:border-b-0 last:pb-0"
                  >
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="h-16 w-16 shrink-0 rounded-[10px] object-cover"
                    />
                    <div className="min-w-0 grow basis-48">
                      <p className="font-display font-semibold text-tertiary">
                        {producto.nombre}
                      </p>
                      <p className="truncate font-body text-sm text-secondary">
                        {producto.descripcion}
                      </p>
                      <p className="font-body text-sm text-secondary">
                        {formatPrecio(producto.precio)} c/u
                      </p>
                    </div>

                    <CantidadStepper
                      valor={cantidad}
                      onCambiar={(n) => cambiarCantidad(producto.id, n)}
                      editable
                    />

                    <p className="min-w-[5.5rem] text-right font-body font-bold text-tertiary">
                      {formatPrecio(producto.precio * cantidad)}
                    </p>

                    <button
                      type="button"
                      onClick={() => quitar(producto.id)}
                      className="font-body text-sm font-semibold text-secondary hover:underline"
                    >
                      Eliminar
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <aside className="min-[900px]:sticky min-[900px]:top-6">
          <Card>
            <h2 className="text-left">Resumen</h2>

            <form onSubmit={handleCupon} className="mb-5 flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <Input
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Código de descuento"
                  aria-label="Código de descuento"
                />
              </div>
              <Button type="submit" className="shrink-0 whitespace-nowrap">
                Aplicar
              </Button>
            </form>

            {errorCupon && (
              <p className="mb-4 font-body text-xs text-error">{errorCupon}</p>
            )}

            <OrderSummary
              subtotal={subtotal}
              descuento={descuento}
              cupon={cupon}
              envio={envio}
              total={total}
              onQuitarCupon={quitarCupon}
            />

            <div className="mt-6 flex flex-col gap-3">
              <Button
                onClick={() => navigate("/checkout")}
                disabled={items.length === 0}
                className="w-full"
              >
                Proceder al pago
              </Button>
              <Link
                to="/catalogo"
                className="text-center font-body text-sm font-semibold text-secondary hover:underline"
              >
                ← Seguir comprando
              </Link>
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
}
