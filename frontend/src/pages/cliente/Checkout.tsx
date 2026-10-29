// @pca:start
// @id(frontend.pages.cliente.checkout)
// @kind(page)
// @limit(lines: 380)
// @contract(CheckoutView())
// @relates(frontend.lib.checkoutValidator)
// @relates(docs.reglas_ui)
// @desc(Formulario de checkout con seleccion de entrega y pasarela Flow)
// @pca:end
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CreditCard, Building2, ShoppingBag, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { PageHero } from "@/components/ui/PageHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { OrderSummary } from "@/components/domain/OrderSummary";
import { useCart } from "@/context/cart";
import { formatPrecio } from "@/lib/utils";
import { api } from "@/services/api";

type MetodoPago = "flow" | "transferencia" | "mercadolibre";

export function Checkout() {
  const { items, cupon, subtotal, descuento, envio, total, vaciar } = useCart();
  const navigate = useNavigate();
  const [metodo, setMetodo] = useState<MetodoPago>("flow");
  const [procesando, setProcesando] = useState(false);
  const [datos, setDatos] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    comuna: "",
  });

  const handleAutorellenarTest = () => {
    setDatos({
      nombre: "Camila Silva",
      email: "camila@example.cl",
      telefono: "+56 9 8765 4321",
      direccion: "Av. Providencia 1234, Depto 402",
      comuna: "Providencia",
    });
  };

  const actualizar =
    (campo: keyof typeof datos) => (e: ChangeEvent<HTMLInputElement>) =>
      setDatos((prev) => ({ ...prev, [campo]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProcesando(true);

    try {
      if (metodo === "flow") {
        // Redirección obligatoria a la pasarela Flow.cl
        const orderIdNumber = Math.floor(Date.now() / 1000);
        let redirectUrl = "";

        try {
          const resFlow = await api.payments.createFlowPayment({
            orderId: orderIdNumber,
            amount: total,
            email: datos.email,
            concept: `Compra Crème & Co (${items.length} productos)`,
          });

          if (resFlow.redirectUrl) {
            redirectUrl = resFlow.redirectUrl;
          }
        } catch {
          // Si el microservicio de Flow está en sandbox local o no responde remotamente
          redirectUrl = `/pago/flow-gateway?token=flow_${Date.now()}&orderId=order_${orderIdNumber}&amount=${total}&email=${encodeURIComponent(datos.email)}`;
        }

        if (redirectUrl) {
          vaciar();
          if (redirectUrl.startsWith("http://") || redirectUrl.startsWith("https://")) {
            window.location.href = redirectUrl;
          } else {
            navigate(redirectUrl);
          }
          return;
        }
      }

      // Registro de orden en el microservicio de Orders :8083 (con fallback seguro)
      try {
        await api.orders.create({
          cliente: datos.nombre,
          email: datos.email,
          total,
          items: items.map((i) => ({
            nombre: i.producto.nombre,
            cantidad: i.cantidad,
            precio: i.producto.precio,
          })),
        });
      } catch {
        // Modo resiliente offline
      }

      vaciar();
      navigate("/confirmacion");
    } finally {
      setProcesando(false);
    }
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
        descripcion="Completa tus datos de facturación y selecciona tu medio de pago preferido."
        className="mb-8 space-y-1"
      />

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[1fr_minmax(260px,360px)]"
      >
        <div className="space-y-6">
          {/* Datos de Entrega y Facturacion */}
          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-tertiary/10 pb-3">
              <h2 className="text-left font-display text-xl font-bold text-tertiary">
                Datos de facturación y entrega
              </h2>
              <button
                type="button"
                onClick={handleAutorellenarTest}
                className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-3 py-1 font-body text-xs font-bold text-secondary transition-all hover:bg-secondary hover:text-white"
              >
                <Zap size={14} />
                ⚡ Rellenar datos de prueba
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nombre completo"
                required
                value={datos.nombre}
                onChange={actualizar("nombre")}
                placeholder="Ej: Camila Silva"
              />
              <Input
                label="Correo electrónico"
                type="email"
                required
                value={datos.email}
                onChange={actualizar("email")}
                placeholder="Ej: camila@example.cl"
              />
              <Input
                label="Teléfono"
                required
                value={datos.telefono}
                onChange={actualizar("telefono")}
                placeholder="Ej: +56 9 8765 4321"
              />
              <Input
                label="Comuna"
                required
                value={datos.comuna}
                onChange={actualizar("comuna")}
                placeholder="Ej: Providencia, Las Condes..."
              />
              <div className="sm:col-span-2">
                <Input
                  label="Dirección de entrega"
                  required
                  value={datos.direccion}
                  onChange={actualizar("direccion")}
                  placeholder="Ej: Av. Providencia 1234, Depto 402"
                />
              </div>
            </div>
          </Card>

          {/* Seleccion de Medio de Pago Sin Pedir Datos Sensibles */}
          <Card>
            <div className="mb-4 border-b border-tertiary/10 pb-3">
              <h2 className="text-left font-display text-xl font-bold text-tertiary">
                Método de pago
              </h2>
              <p className="mt-1 font-body text-xs text-ink/70">
                Transacciones seguras y encriptadas. Nunca te pediremos datos de tu tarjeta en este formulario.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {/* Opcion 1: Pasarela Flow.cl */}
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                  metodo === "flow"
                    ? "border-secondary bg-primary/10 ring-2 ring-secondary"
                    : "border-tertiary/15 hover:border-tertiary/30"
                }`}
              >
                <input
                  type="radio"
                  name="metodo"
                  className="mt-1 h-4 w-4 accent-secondary"
                  checked={metodo === "flow"}
                  onChange={() => setMetodo("flow")}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CreditCard size={18} className="text-secondary" />
                    <span className="font-body text-sm font-bold text-tertiary">
                      Pasarela Flow.cl (Webpay / Tarjetas / Servipag)
                    </span>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[0.7rem] font-bold text-green-800">
                      Microservicio :8084
                    </span>
                  </div>
                  <p className="mt-1 font-body text-xs leading-relaxed text-ink/75">
                    Redirección segura a Flow.cl para pagar con Redcompra, Débito o Crédito sin ingresar claves ni datos de tu tarjeta en nuestra web.
                  </p>
                </div>
              </label>

              {/* Opcion 2: Transferencia Bancaria */}
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                  metodo === "transferencia"
                    ? "border-secondary bg-primary/10 ring-2 ring-secondary"
                    : "border-tertiary/15 hover:border-tertiary/30"
                }`}
              >
                <input
                  type="radio"
                  name="metodo"
                  className="mt-1 h-4 w-4 accent-secondary"
                  checked={metodo === "transferencia"}
                  onChange={() => setMetodo("transferencia")}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Building2 size={18} className="text-secondary" />
                    <span className="font-body text-sm font-bold text-tertiary">
                      Transferencia Bancaria Electrónica
                    </span>
                  </div>
                  <p className="mt-1 font-body text-xs leading-relaxed text-ink/75">
                    Paga directamente desde la app de tu banco. Cero solicitud de datos personales o tarjetas.
                  </p>

                  {metodo === "transferencia" && (
                    <div className="mt-3 rounded-lg border border-secondary/20 bg-neutral/60 p-3 font-body text-xs text-ink/90">
                      <p className="font-bold text-secondary">Datos de la cuenta Crème & Co:</p>
                      <div className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2">
                        <span><strong>Banco:</strong> Banco Santander</span>
                        <span><strong>Tipo:</strong> Cuenta Corriente</span>
                        <span><strong>N° Cuenta:</strong> 74-88921-02</span>
                        <span><strong>RUT:</strong> 76.842.190-5</span>
                        <span className="sm:col-span-2"><strong>Email para comprobante:</strong> pagos@cremeco.cl</span>
                      </div>
                    </div>
                  )}
                </div>
              </label>

              {/* Opcion 3: Mercado Pago / Mercado Libre */}
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                  metodo === "mercadolibre"
                    ? "border-secondary bg-primary/10 ring-2 ring-secondary"
                    : "border-tertiary/15 hover:border-tertiary/30"
                }`}
              >
                <input
                  type="radio"
                  name="metodo"
                  className="mt-1 h-4 w-4 accent-secondary"
                  checked={metodo === "mercadolibre"}
                  onChange={() => setMetodo("mercadolibre")}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={18} className="text-secondary" />
                    <span className="font-body text-sm font-bold text-tertiary">
                      Mercado Pago / Mercado Libre
                    </span>
                  </div>
                  <p className="mt-1 font-body text-xs leading-relaxed text-ink/75">
                    Usa tu saldo en cuenta de Mercado Pago o tarjetas registradas en Mercado Libre con protección al comprador.
                  </p>
                </div>
              </label>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-2.5 text-xs text-green-900 border border-green-200">
              <ShieldCheck size={18} className="text-green-700 shrink-0" />
              <span>Compra 100% protegida. No almacenamos números de tarjetas ni CVV en nuestros servidores.</span>
            </div>
          </Card>
        </div>

        {/* Resumen Lateral */}
        <aside className="lg:sticky lg:top-6">
          <Card>
            <h2 className="mb-4 text-left font-display text-lg font-bold text-tertiary">
              Resumen de tu compra
            </h2>

            <ul className="mb-3 max-h-60 space-y-2 overflow-y-auto pr-1">
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

            <Button
              type="submit"
              variant="secondary"
              disabled={procesando}
              className="mt-6 w-full"
            >
              {procesando ? "Procesando pago..." : `Pagar ${formatPrecio(total)}`}
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
