// @pca:start
// @id(frontend.pages.cliente.checkout)
// @kind(page)
// @limit(lines: 680)
// @contract(CheckoutView())
// @relates(frontend.lib.checkoutValidator)
// @relates(docs.reglas_ui)
// @desc(Formulario de checkout con seleccion de entrega y pasarela Flow)
// @pca:end
import { useState, useId, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CreditCard,
  Building2,
  ShoppingBag,
  ShieldCheck,
  Zap,
  Truck,
  Store,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { PageHero } from "@/components/ui/PageHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { OrderSummary } from "@/components/domain/OrderSummary";
import { useCart } from "@/context/cart";
import { formatPrecio } from "@/lib/utils";
import { api } from "@/services/api";
import { REGIONES_CHILE, obtenerComunasPorRegion } from "@/lib/data/regiones-chile";
import {
  validarCheckoutForm,
  type MetodoEntrega,
  type MetodoPago,
} from "@/lib/validators/checkout.validator";

export function Checkout() {
  const { items, cupon, subtotal, descuento, envio: costoEnvioBase, vaciar } = useCart();
  const navigate = useNavigate();
  const formUid = useId();

  const [metodoEntrega, setMetodoEntrega] = useState<MetodoEntrega>("despacho");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("flow");
  const [procesando, setProcesando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const [datos, setDatos] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    rut: "",
    calle: "",
    departamento: "",
    region: "RM",
    comuna: "Providencia",
    indicaciones: "",
  });

  const comunasDisponibles = obtenerComunasPorRegion(datos.region);

  const costoEnvio = metodoEntrega === "retiro" ? 0 : costoEnvioBase;
  const totalCalculado = Math.max(0, subtotal - descuento + costoEnvio);

  const handleAutorellenarSantiago = () => {
    setMetodoEntrega("despacho");
    setDatos({
      nombre: "Camila",
      apellidos: "Silva Tapia",
      email: "camila.silva@cremeco.cl",
      telefono: "+56 9 8765 4321",
      rut: "18.432.198-7",
      calle: "Av. Providencia 1234",
      departamento: "Depto 402",
      region: "RM",
      comuna: "Providencia",
      indicaciones: "Dejar en conserjería si no respondo al citófono.",
    });
    setErrores({});
  };

  const handleAutorellenarRetiro = () => {
    setMetodoEntrega("retiro");
    setDatos((prev) => ({
      ...prev,
      nombre: "Valentina",
      apellidos: "Rojas Muñoz",
      email: "valentina.rojas@cremeco.cl",
      telefono: "+56 9 7654 3210",
      rut: "19.234.567-8",
      indicaciones: "Retiro en local a las 17:00 hrs.",
    }));
    setErrores({});
  };

  const handleChange = (campo: keyof typeof datos) => (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const val = e.target.value;
    setDatos((prev) => {
      const nuevo = { ...prev, [campo]: val };
      if (campo === "region") {
        const comunas = obtenerComunasPorRegion(val);
        nuevo.comuna = comunas.length > 0 ? comunas[0] : "";
      }
      return nuevo;
    });
    if (errores[campo]) {
      setErrores((prev) => {
        const rest = { ...prev };
        delete rest[campo];
        return rest;
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validacion = validarCheckoutForm({
      nombre: datos.nombre,
      apellidos: datos.apellidos,
      email: datos.email,
      telefono: datos.telefono,
      rut: datos.rut,
      metodoEntrega,
      calle: datos.calle,
      departamento: datos.departamento,
      region: datos.region,
      comuna: datos.comuna,
      indicaciones: datos.indicaciones,
      metodoPago,
    });

    if (!validacion.valido) {
      setErrores(validacion.errores);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setProcesando(true);

    try {
      const orderCode = `CC-${Math.floor(1000 + Math.random() * 9000)}`;
      const ordenGuardada = {
        orderId: orderCode,
        fecha: new Date().toISOString(),
        comprador: {
          nombre: `${datos.nombre} ${datos.apellidos}`.trim(),
          email: datos.email,
          telefono: datos.telefono,
          rut: datos.rut || "Sin RUT",
        },
        entrega: {
          metodo: metodoEntrega,
          direccion:
            metodoEntrega === "retiro"
              ? "Retiro en Tienda: Av. Providencia 1234, Providencia"
              : `${datos.calle}${datos.departamento ? `, ${datos.departamento}` : ""}, ${datos.comuna}, ${datos.region}`,
          indicaciones: datos.indicaciones,
        },
        items: items.map((i) => ({
          id: i.producto.id,
          nombre: i.producto.nombre,
          precio: i.producto.precio,
          cantidad: i.cantidad,
          total: i.producto.precio * i.cantidad,
        })),
        totales: {
          subtotal,
          descuento,
          envio: costoEnvio,
          total: totalCalculado,
          neto: Math.round((subtotal - descuento) / 1.19),
          iva: (subtotal - descuento) - Math.round((subtotal - descuento) / 1.19),
        },
        metodoPago,
      };

      try {
        sessionStorage.setItem("cremeco_last_order", JSON.stringify(ordenGuardada));
      } catch {
        // Fallback si sessionStorage está bloqueado
      }

      // Registro opcional en backend
      try {
        await api.orders.create({
          cliente: ordenGuardada.comprador.nombre,
          email: ordenGuardada.comprador.email,
          total: totalCalculado,
          items: items.map((i) => ({
            nombre: i.producto.nombre,
            cantidad: i.cantidad,
            precio: i.producto.precio,
          })),
        });
      } catch {
        // Modo offline resiliente
      }

      // IMPORTANTE: NO vaciar carrito aquí. Se conserva hasta éxito de pago.
      if (metodoPago === "flow") {
        navigate(
          `/pago/flow-gateway?token=flow_${Date.now()}&orderId=${encodeURIComponent(orderCode)}&amount=${totalCalculado}&email=${encodeURIComponent(datos.email)}`
        );
      } else {
        vaciar();
        navigate(`/confirmacion?orderId=${encodeURIComponent(orderCode)}&total=${totalCalculado}`);
      }
    } finally {
      setProcesando(false);
    }
  };

  if (items.length === 0) {
    return (
      <EmptyState
        titulo="No hay productos en tu carrito"
        descripcion="Agrega productos antes de continuar con el proceso de compra."
        accion={<Button onClick={() => navigate("/catalogo")}>Ir al catálogo</Button>}
        className="py-20"
      />
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Proceso de Compra DSY1104"
        titulo="Finalizar compra y despacho"
        descripcion="Ingresa tus datos de facturación, selecciona el método de entrega y abona mediante Flow Sandbox."
        className="mb-8 space-y-1"
      />

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_minmax(280px,360px)]">
        <div className="space-y-6">
          {/* Card 1: Datos del Comprador */}
          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-tertiary/10 pb-3">
              <h2 className="text-left font-display text-xl font-bold text-tertiary">
                1. Datos del comprador
              </h2>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={handleAutorellenarSantiago}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-3 py-1 font-body text-xs font-bold text-secondary transition-all hover:bg-secondary hover:text-white"
                >
                  <Zap size={13} />
                  ⚡ Datos Santiago
                </button>
                <button
                  type="button"
                  onClick={handleAutorellenarRetiro}
                  className="inline-flex items-center gap-1 rounded-full bg-tertiary/10 px-3 py-1 font-body text-xs font-bold text-tertiary transition-all hover:bg-tertiary hover:text-white"
                >
                  <Store size={13} />
                  ⚡ Retiro en tienda
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Input
                  label="Nombre(s)"
                  required
                  value={datos.nombre}
                  onChange={handleChange("nombre")}
                  placeholder="Ej: Camila"
                />
                {errores.nombre && <p className="mt-1 text-xs text-red-600">{errores.nombre}</p>}
              </div>

              <div>
                <Input
                  label="Apellidos"
                  required
                  value={datos.apellidos}
                  onChange={handleChange("apellidos")}
                  placeholder="Ej: Silva Tapia"
                />
                {errores.apellidos && <p className="mt-1 text-xs text-red-600">{errores.apellidos}</p>}
              </div>

              <div>
                <Input
                  label="Correo electrónico de facturación"
                  type="email"
                  required
                  value={datos.email}
                  onChange={handleChange("email")}
                  placeholder="camila@example.cl"
                />
                {errores.email && <p className="mt-1 text-xs text-red-600">{errores.email}</p>}
              </div>

              <div>
                <Input
                  label="Teléfono de contacto"
                  required
                  value={datos.telefono}
                  onChange={handleChange("telefono")}
                  placeholder="+56 9 8765 4321"
                />
                {errores.telefono && <p className="mt-1 text-xs text-red-600">{errores.telefono}</p>}
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="RUN / RUT Chileno (opcional)"
                  value={datos.rut}
                  onChange={handleChange("rut")}
                  placeholder="18.432.198-7"
                />
                {errores.rut && <p className="mt-1 text-xs text-red-600">{errores.rut}</p>}
              </div>
            </div>
          </Card>

          {/* Card 2: Método de Entrega y Dirección */}
          <Card>
            <div className="mb-4 border-b border-tertiary/10 pb-3">
              <h2 className="text-left font-display text-xl font-bold text-tertiary">
                2. Método de entrega
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all ${
                  metodoEntrega === "despacho"
                    ? "border-secondary bg-primary/10 ring-2 ring-secondary"
                    : "border-tertiary/15 hover:border-tertiary/30"
                }`}
              >
                <input
                  type="radio"
                  name="metodoEntrega"
                  className="mt-1 h-4 w-4 accent-secondary"
                  checked={metodoEntrega === "despacho"}
                  onChange={() => setMetodoEntrega("despacho")}
                />
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-body text-sm font-bold text-tertiary">
                      <Truck size={16} className="text-secondary" />
                      Despacho a Domicilio
                    </span>
                    <span className="font-bold text-secondary">{formatPrecio(costoEnvioBase)}</span>
                  </div>
                  <p className="mt-1 font-body text-xs text-ink/75">
                    Envío refrigerado en menos de 48 hrs a tu dirección.
                  </p>
                </div>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all ${
                  metodoEntrega === "retiro"
                    ? "border-secondary bg-primary/10 ring-2 ring-secondary"
                    : "border-tertiary/15 hover:border-tertiary/30"
                }`}
              >
                <input
                  type="radio"
                  name="metodoEntrega"
                  className="mt-1 h-4 w-4 accent-secondary"
                  checked={metodoEntrega === "retiro"}
                  onChange={() => setMetodoEntrega("retiro")}
                />
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-body text-sm font-bold text-tertiary">
                      <Store size={16} className="text-green-700" />
                      Retiro en Tienda
                    </span>
                    <span className="font-bold text-green-700">Gratis</span>
                  </div>
                  <p className="mt-1 font-body text-xs text-ink/75">
                    Obrador Providencia (Av. Providencia 1234).
                  </p>
                </div>
              </label>
            </div>

            {metodoEntrega === "retiro" ? (
              <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-900">
                <MapPin size={18} className="shrink-0 text-green-700" />
                <span>
                  <strong>Punto de retiro:</strong> Av. Providencia 1234, Providencia. Horario: Lun-Sáb de 09:00 a 19:30 hrs. Listo para retirar en 4 horas tras confirmación de pago.
                </span>
              </div>
            ) : (
              <div className="mt-4 space-y-4 border-t border-tertiary/10 pt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`${formUid}-reg`} className="mb-1 block font-body text-xs font-semibold text-tertiary">
                      Región *
                    </label>
                    <select
                      id={`${formUid}-reg`}
                      value={datos.region}
                      onChange={handleChange("region")}
                      className="w-full rounded-lg border border-tertiary/20 bg-neutral/20 p-2.5 font-body text-sm text-ink focus:border-secondary focus:outline-none"
                    >
                      {REGIONES_CHILE.map((r) => (
                        <option key={r.codigo} value={r.codigo}>
                          {r.nombre}
                        </option>
                      ))}
                    </select>
                    {errores.region && <p className="mt-1 text-xs text-red-600">{errores.region}</p>}
                  </div>

                  <div>
                    <label htmlFor={`${formUid}-com`} className="mb-1 block font-body text-xs font-semibold text-tertiary">
                      Comuna *
                    </label>
                    <select
                      id={`${formUid}-com`}
                      value={datos.comuna}
                      onChange={handleChange("comuna")}
                      className="w-full rounded-lg border border-tertiary/20 bg-neutral/20 p-2.5 font-body text-sm text-ink focus:border-secondary focus:outline-none"
                    >
                      {comunasDisponibles.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {errores.comuna && <p className="mt-1 text-xs text-red-600">{errores.comuna}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <Input
                      label="Calle y Número *"
                      value={datos.calle}
                      onChange={handleChange("calle")}
                      placeholder="Ej: Av. Providencia 1234"
                    />
                    {errores.calle && <p className="mt-1 text-xs text-red-600">{errores.calle}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <Input
                      label="Departamento / Casa / Oficina (opcional)"
                      value={datos.departamento}
                      onChange={handleChange("departamento")}
                      placeholder="Ej: Depto 402, Torre B"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={`${formUid}-ind`} className="mb-1 block font-body text-xs font-semibold text-tertiary">
                    Indicaciones de entrega (máx 250 caracteres)
                  </label>
                  <textarea
                    id={`${formUid}-ind`}
                    rows={2}
                    maxLength={250}
                    value={datos.indicaciones}
                    onChange={handleChange("indicaciones")}
                    placeholder="Ej: Dejar con conserje, timbre 4, portón gris..."
                    className="w-full rounded-lg border border-tertiary/20 bg-neutral/20 p-2.5 font-body text-sm text-ink focus:border-secondary focus:outline-none"
                  />
                  <div className="flex justify-between text-[11px] text-ink/60">
                    <span>{errores.indicaciones ? <span className="text-red-600">{errores.indicaciones}</span> : null}</span>
                    <span>{datos.indicaciones.length} / 250</span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Card 3: Método de Pago */}
          <Card>
            <div className="mb-4 border-b border-tertiary/10 pb-3">
              <h2 className="text-left font-display text-xl font-bold text-tertiary">
                3. Medio de pago
              </h2>
              <p className="mt-1 font-body text-xs text-ink/70">
                Transacciones seguras y encriptadas. Nunca te pediremos datos de tu tarjeta en este formulario.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                  metodoPago === "flow"
                    ? "border-secondary bg-primary/10 ring-2 ring-secondary"
                    : "border-tertiary/15 hover:border-tertiary/30"
                }`}
              >
                <input
                  type="radio"
                  name="metodoPago"
                  className="mt-1 h-4 w-4 accent-secondary"
                  checked={metodoPago === "flow"}
                  onChange={() => setMetodoPago("flow")}
                />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <CreditCard size={18} className="text-secondary" />
                    <span className="font-body text-sm font-bold text-tertiary">
                      Pasarela Flow.cl (Webpay / Débito / Crédito / Servipag)
                    </span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[0.7rem] font-bold text-blue-800">
                      Sandbox Chile
                    </span>
                  </div>
                  <p className="mt-1 font-body text-xs leading-relaxed text-ink/75">
                    Redirección interactiva a Flow con botones de prueba de pago aprobado y rechazado.
                  </p>
                </div>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                  metodoPago === "transferencia"
                    ? "border-secondary bg-primary/10 ring-2 ring-secondary"
                    : "border-tertiary/15 hover:border-tertiary/30"
                }`}
              >
                <input
                  type="radio"
                  name="metodoPago"
                  className="mt-1 h-4 w-4 accent-secondary"
                  checked={metodoPago === "transferencia"}
                  onChange={() => setMetodoPago("transferencia")}
                />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <Building2 size={18} className="text-secondary" />
                    <span className="font-body text-sm font-bold text-tertiary">
                      Transferencia Bancaria Electrónica
                    </span>
                  </div>
                  <p className="mt-1 font-body text-xs leading-relaxed text-ink/75">
                    Paga desde la app de tu banco y confirma tu orden.
                  </p>
                </div>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                  metodoPago === "mercadolibre"
                    ? "border-secondary bg-primary/10 ring-2 ring-secondary"
                    : "border-tertiary/15 hover:border-tertiary/30"
                }`}
              >
                <input
                  type="radio"
                  name="metodoPago"
                  className="mt-1 h-4 w-4 accent-secondary"
                  checked={metodoPago === "mercadolibre"}
                  onChange={() => setMetodoPago("mercadolibre")}
                />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={18} className="text-secondary" />
                    <span className="font-body text-sm font-bold text-tertiary">
                      Mercado Pago / Mercado Libre
                    </span>
                  </div>
                  <p className="mt-1 font-body text-xs leading-relaxed text-ink/75">
                    Usa tu saldo en cuenta o tarjetas asociadas en Mercado Pago.
                  </p>
                </div>
              </label>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-2.5 text-xs text-green-900">
              <ShieldCheck size={18} className="shrink-0 text-green-700" />
              <span>Compra 100% protegida. Tu carrito se conserva intacto hasta confirmar el pago exitoso.</span>
            </div>
          </Card>
        </div>

        {/* Resumen Lateral */}
        <aside className="lg:sticky lg:top-6">
          <Card>
            <h2 className="mb-4 text-left font-display text-lg font-bold text-tertiary">
              Resumen de tu compra
            </h2>

            <ul className="mb-3 max-h-56 space-y-2 overflow-y-auto pr-1">
              {items.map((i) => (
                <li key={i.producto.id} className="flex justify-between gap-3 font-body text-sm">
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
              envio={costoEnvio}
              total={totalCalculado}
              mostrarIva
            />

            <Button
              type="submit"
              variant="secondary"
              disabled={procesando}
              className="mt-6 w-full"
            >
              {procesando ? "Procesando..." : `Continuar a Pago (${formatPrecio(totalCalculado)})`}
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
