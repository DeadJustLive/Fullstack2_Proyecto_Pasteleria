import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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
  const [mensajeExitoCupon, setMensajeExitoCupon] = useState<string | null>(null);
  const [procesandoCupon, setProcesandoCupon] = useState(false);

  const handleCupon = async (e: FormEvent) => {
    e.preventDefault();
    if (!codigo.trim()) {
      setErrorCupon("Ingresa un código de descuento.");
      setMensajeExitoCupon(null);
      return;
    }

    setProcesandoCupon(true);
    setErrorCupon(null);
    setMensajeExitoCupon(null);

    try {
      const res = await aplicarCupon(codigo);
      if (res.ok) {
        setCodigo("");
        setErrorCupon(null);
        setMensajeExitoCupon(res.mensaje || "Cupón aplicado exitosamente.");
      } else {
        setErrorCupon(res.mensaje || "Cupón no válido o expirado.");
        setMensajeExitoCupon(null);
      }
    } catch {
      setErrorCupon("Error al procesar el cupón. Intenta nuevamente.");
      setMensajeExitoCupon(null);
    } finally {
      setProcesandoCupon(false);
    }
  };

  const handleQuitarCupon = () => {
    quitarCupon();
    setMensajeExitoCupon(null);
    setErrorCupon(null);
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
                const tieneStock = typeof producto.stock === "number" && producto.stock >= 0;
                const stockAlcanzado = tieneStock && cantidad >= (producto.stock ?? 0);

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
                      {tieneStock && (
                        <p className="mt-0.5 font-body text-xs text-secondary/80">
                          {stockAlcanzado ? (
                            <span className="font-semibold text-amber-700">
                              Límite de stock alcanzado ({producto.stock} disponibles)
                            </span>
                          ) : (
                            <span>Stock disponible: {producto.stock} unidades</span>
                          )}
                        </p>
                      )}
                    </div>

                    <CantidadStepper
                      valor={cantidad}
                      min={1}
                      max={tieneStock ? producto.stock : undefined}
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
                  onChange={(e) => {
                    setCodigo(e.target.value);
                    if (errorCupon) setErrorCupon(null);
                    if (mensajeExitoCupon) setMensajeExitoCupon(null);
                  }}
                  placeholder="Código de descuento"
                  aria-label="Código de descuento"
                  disabled={procesandoCupon}
                />
              </div>
              <Button
                type="submit"
                className="shrink-0 whitespace-nowrap"
                disabled={procesandoCupon || !codigo.trim()}
              >
                {procesandoCupon ? (
                  <>
                    <Loader2 size={16} className="mr-1.5 animate-spin" />
                    Validando...
                  </>
                ) : (
                  "Aplicar"
                )}
              </Button>
            </form>

            {errorCupon && (
              <div className="mb-4 flex items-center gap-1.5 font-body text-xs text-error">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorCupon}</span>
              </div>
            )}

            {mensajeExitoCupon && (
              <div className="mb-4 flex items-center gap-1.5 font-body text-xs text-green-700">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>{mensajeExitoCupon}</span>
              </div>
            )}

            <OrderSummary
              subtotal={subtotal}
              descuento={descuento}
              cupon={cupon}
              envio={envio}
              total={total}
              onQuitarCupon={handleQuitarCupon}
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
