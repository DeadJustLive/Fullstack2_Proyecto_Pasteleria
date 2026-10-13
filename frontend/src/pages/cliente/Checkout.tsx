import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { PageHero } from "@/components/ui/PageHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { OrderSummary } from "@/components/domain/OrderSummary";
import { useCart } from "@/context/cart";
import { formatPrecio } from "@/lib/utils";

type MetodoPago = "tarjeta" | "transferencia" | "efectivo";

const LABEL_METODO: Record<MetodoPago, string> = {
  tarjeta: "Tarjeta de crédito o débito",
  transferencia: "Transferencia bancaria",
  efectivo: "Pago contra entrega",
};

export function Checkout() {
  const { items, cupon, subtotal, descuento, envio, total, vaciar } = useCart();
  const navigate = useNavigate();
  const [metodo, setMetodo] = useState<MetodoPago>("tarjeta");
  const [datos, setDatos] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    comuna: "",
  });

  const actualizar =
    (campo: keyof typeof datos) => (e: ChangeEvent<HTMLInputElement>) =>
      setDatos((prev) => ({ ...prev, [campo]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    vaciar();
    navigate("/confirmacion");
  };

  if (items.length === 0) {
    return (
      <EmptyState
        titulo="No hay productos en tu carrito"
        descripcion="Agrega productos antes de continuar con el pago."
        accion={<Button onClick={() => navigate("/catalogo")}>Ir al catálogo</Button>}
        className="py-20"
      />
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Pago seguro"
        titulo="Finalizar compra"
        descripcion="Completa tus datos de facturación y envío."
        className="mb-8 space-y-1"
      />

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[1fr_minmax(260px,330px)]"
      >
        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 text-left">Datos de facturación</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nombre completo"
                required
                value={datos.nombre}
                onChange={actualizar("nombre")}
              />
              <Input
                label="Correo electrónico"
                type="email"
                required
                value={datos.email}
                onChange={actualizar("email")}
              />
              <Input
                label="Teléfono"
                required
                value={datos.telefono}
                onChange={actualizar("telefono")}
              />
              <Input
                label="Comuna"
                required
                value={datos.comuna}
                onChange={actualizar("comuna")}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Dirección de entrega"
                  required
                  value={datos.direccion}
                  onChange={actualizar("direccion")}
                />
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-left">Método de pago</h2>
            <div className="flex flex-col gap-3">
              {(Object.keys(LABEL_METODO) as MetodoPago[]).map((m) => (
                <label
                  key={m}
                  className="flex cursor-pointer items-center gap-3 font-body text-ink"
                >
                  <input
                    type="radio"
                    name="metodo"
                    className="h-4 w-4 accent-secondary"
                    checked={metodo === m}
                    onChange={() => setMetodo(m)}
                  />
                  {LABEL_METODO[m]}
                </label>
              ))}
            </div>

            {metodo === "tarjeta" ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    label="Número de tarjeta"
                    placeholder="1234 5678 9012 3456"
                    inputMode="numeric"
                    required
                  />
                </div>
                <Input label="Vencimiento" placeholder="MM/AA" required />
                <Input
                  label="CVV"
                  placeholder="123"
                  inputMode="numeric"
                  required
                />
              </div>
            ) : (
              <p className="mt-4 rounded bg-neutral p-3 font-body text-sm text-secondary">
                {metodo === "transferencia"
                  ? "Te enviaremos los datos bancarios al confirmar la compra."
                  : "Paga al recibir tu pedido en la puerta."}
              </p>
            )}
          </Card>
        </div>

        <aside className="lg:sticky lg:top-6">
          <Card>
            <h2 className="mb-4 text-left">Resumen de tu compra</h2>

            <ul className="mb-2 space-y-2">
              {items.map((i) => (
                <li
                  key={i.producto.id}
                  className="flex justify-between gap-3 font-body text-sm"
                >
                  <span className="min-w-0 truncate text-ink/80">
                    {i.producto.nombre} x{i.cantidad}
                  </span>
                  <span className="shrink-0 font-semibold text-tertiary">
                    {formatPrecio(i.producto.precio * i.cantidad)}
                  </span>
                </li>
              ))}
            </ul>

            <OrderSummary
              subtotal={subtotal}
              descuento={descuento}
              cupon={cupon}
              envio={envio}
              total={total}
            />

            <Button type="submit" variant="secondary" className="mt-6 w-full">
              Confirmar compra
            </Button>
            <Link
              to="/carrito"
              className="mt-3 block text-center font-body text-sm font-semibold text-secondary hover:underline"
            >
              ← Volver al carrito
            </Link>
          </Card>
        </aside>
      </form>
    </>
  );
}
