// @pca:start
// @id(frontend.pages.cliente.perfilSeguimiento)
// @kind(component)
// @limit(lines: 580)
// @contract(sin props: consulta pedido mock o parametros de ruta)
// @relates(frontend.domain.perfilSidebar)
// @relates(frontend.domain.lineaTiempoPedido)
// @relates(frontend.domain.estadoPedidoBadge)
// @relates(frontend.ui.button)
// @relates(frontend.ui.buttonLink)
// @relates(frontend.ui.modal)
// @desc(Vista de seguimiento de pedido dentro del perfil con timeline e info de recogida)
// @pca:end
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Clock, ShoppingBag, User, Search, CheckCircle, AlertCircle, Truck, Package } from "lucide-react";
import { PerfilSidebar } from "@/components/domain/PerfilSidebar";
import { EstadoPedidoBadge } from "@/components/domain/EstadoPedidoBadge";
import { LineaTiempoPedido, type HitoPedido } from "@/components/domain/LineaTiempoPedido";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/auth";
import { api, type OrderResponse } from "@/services/api";
import { formatPrecio } from "@/lib/utils";
import { formatearRut, validarRut } from "@/lib/validators/rut.validator";

export function PerfilSeguimiento() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { usuario, logueado, login } = useAuth();

  const [emailLogin, setEmailLogin] = useState("");
  const [codigoBusqueda, setCodigoBusqueda] = useState(id ? id.replace("#", "") : "");
  const [orden, setOrden] = useState<OrderResponse | null>(null);
  const [cargando, setCargando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);

  // Modal de persona que retira
  const [modalRecogedorAbierto, setModalRecogedorAbierto] = useState(false);
  const [formRecogedor, setFormRecogedor] = useState({
    nombre: "",
    rut: "",
    telefono: "",
  });
  const [errorRutRecogedor, setErrorRutRecogedor] = useState<string | null>(null);
  const [guardandoRecogedor, setGuardandoRecogedor] = useState(false);

  // Función para cargar orden por ID o TrackingCode
  const cargarOrden = async (codigoOId: string) => {
    setCargando(true);
    setErrorBusqueda(null);
    try {
      const data = await api.order.getByTrackingCode(codigoOId);
      setOrden(data);
      setFormRecogedor({
        nombre: data.personaRetiroNombre || data.cliente || "",
        rut: data.personaRetiroRut || data.rut || "",
        telefono: data.personaRetiroTelefono || data.telefono || "",
      });
    } catch {
      try {
        const byId = await api.order.getById(codigoOId);
        setOrden(byId);
        setFormRecogedor({
          nombre: byId.personaRetiroNombre || byId.cliente || "",
          rut: byId.personaRetiroRut || byId.rut || "",
          telefono: byId.personaRetiroTelefono || byId.telefono || "",
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : `No se encontró pedido con identificador: ${codigoOId}`;
        setErrorBusqueda(msg);
      }
    } finally {
      setCargando(false);
    }
  };

  // Carga inicial según parámetro URL o usuario
  useEffect(() => {
    if (id) {
      setCodigoBusqueda(id.replace("#", ""));
      cargarOrden(id);
    } else if (usuario?.email) {
      // Cargar el pedido más reciente del usuario
      api.order.getByUser(usuario.email).then((list) => {
        if (list && list.length > 0) {
          const rec = list[0];
          setOrden(rec);
          setCodigoBusqueda(rec.trackingCode.replace("#", ""));
          setFormRecogedor({
            nombre: rec.personaRetiroNombre || rec.cliente || "",
            rut: rec.personaRetiroRut || rec.rut || "",
            telefono: rec.personaRetiroTelefono || rec.telefono || "",
          });
        } else {
          // Cargar muestra por defecto
          cargarOrden("CC-2025-001234");
        }
      }).catch(() => {
        cargarOrden("CC-2025-001234");
      });
    } else {
      cargarOrden("CC-2025-001234");
    }
  }, [id, usuario]);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = codigoBusqueda.replace("#", "").trim();
    if (!clean) return;
    navigate(`/perfil/seguimiento/${clean}`);
    cargarOrden(clean);
  };

  const guardarRecogedor = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorRutRecogedor(null);

    if (!validarRut(formRecogedor.rut)) {
      setErrorRutRecogedor("El RUN/RUT ingresado no es válido según el algoritmo Módulo 11 (Chile).");
      return;
    }

    if (!orden) return;

    setGuardandoRecogedor(true);
    try {
      const orderIdentifier = orden.id || orden.trackingCode;
      const updated = await api.order.updatePickupPerson(orderIdentifier, {
        nombre: formRecogedor.nombre,
        rut: formRecogedor.rut,
        telefono: formRecogedor.telefono,
      });

      setOrden(updated);
      setModalRecogedorAbierto(false);
      setFeedbackMsg({ tipo: "exito", texto: "Persona autorizada para el retiro actualizada exitosamente." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al actualizar la persona que retira.";
      setFeedbackMsg({ tipo: "error", texto: msg });
    } finally {
      setGuardandoRecogedor(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  // Construir línea de tiempo dinámica según estado
  const generarHitos = (order: OrderResponse): HitoPedido[] => {
    const estado = (order.estado || "EN_PREPARACION").toUpperCase();
    const fechaBase = order.fecha
      ? new Date(order.fecha).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
      : "25 Oct 2025 - 14:30";

    const esCancelado = estado.includes("CANCEL") || estado.includes("RECHAZ");
    const esEntregado = estado.includes("ENTREG");
    const esListo = estado.includes("LISTO") || estado.includes("CAMIN") || estado.includes("RUTA") || esEntregado;
    const esPrep = estado.includes("PREPAR") || esListo;
    const esPagado = estado !== "PENDIENTE" && !esCancelado;

    return [
      {
        id: "recibido",
        titulo: "Pedido Recibido",
        fechaHora: fechaBase,
        descripcion: "Tu pedido ha sido recibido y registrado en el sistema.",
        estado: "completado",
      },
      {
        id: "pago",
        titulo: "Pago Confirmado",
        fechaHora: esPagado ? fechaBase : "Pendiente de validación",
        descripcion: esPagado ? "Pago procesado y validado exitosamente." : "Esperando confirmación de pasarela de pago.",
        estado: esPagado ? "completado" : "activo",
      },
      {
        id: "preparacion",
        titulo: "En Preparación",
        fechaHora: esPrep ? "En proceso en cocina" : "Pendiente",
        descripcion: "Nuestros maestros pasteleros están horneando y decorando tu pedido con ingredientes frescos.",
        estado: esPrep ? (esListo ? "completado" : "activo") : "pendiente",
      },
      {
        id: "listo",
        titulo: order.tipoEntrega === "DELIVERY" ? "En Camino al Domicilio" : "Listo para Retirar en Tienda",
        fechaHora: esListo ? (order.fechaEntregaEstimada || "Disponible") : "Pendiente",
        descripcion: order.tipoEntrega === "DELIVERY"
          ? "El repartidor va en ruta con cadena de frío hacia tu dirección."
          : "Tu pedido está refrigerado y listo para ser retirado en pastelería.",
        estado: esListo ? (esEntregado ? "completado" : "activo") : "pendiente",
      },
      {
        id: "entregado",
        titulo: "Entregado",
        fechaHora: esEntregado ? "Entrega confirmada" : "Pendiente",
        descripcion: esEntregado
          ? "El pedido fue entregado exitosamente al cliente o persona autorizada."
          : "Esperando entrega final.",
        estado: esEntregado ? "completado" : "pendiente",
      },
    ];
  };

  const esRetiro = !orden?.tipoEntrega || orden.tipoEntrega.toUpperCase().includes("RETIRO");

  const nombreRecogedor = orden?.personaRetiroNombre || orden?.cliente || "Juan Pablo Martínez";
  const rutRecogedor = orden?.personaRetiroRut || orden?.rut || "12.345.678-9";
  const telefonoRecogedor = orden?.personaRetiroTelefono || orden?.telefono || "+56 9 8765 4321";

  const inicialesRecogedor = nombreRecogedor
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");

  if (!logueado) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/30 text-secondary">
          <User size={36} />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-2xl font-bold text-tertiary">
            Seguimiento de Pedido
          </h1>
          <p className="font-body text-sm text-ink/75">
            Debes iniciar sesión con tu cuenta para acceder al seguimiento en tiempo real de tus pedidos.
          </p>
        </div>

        <Card className="flex w-full flex-col gap-4 p-6 text-left">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              login(emailLogin || "cliente@cremeco.cl");
            }}
            className="flex flex-col gap-3"
          >
            <div>
              <label className="font-body text-xs font-semibold text-tertiary">Correo Electrónico</label>
              <Input
                type="email"
                placeholder="cliente@cremeco.cl"
                value={emailLogin}
                onChange={(e) => setEmailLogin(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Iniciar Sesión
            </Button>
          </form>
          <div className="text-center">
            <button
              type="button"
              onClick={() => login("cliente@cremeco.cl")}
              className="font-body text-xs text-secondary hover:underline cursor-pointer"
            >
              Iniciar sesión demo (Camila Silva)
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-12">
      {/* Hero Header */}
      <header className="overflow-hidden rounded-2xl bg-gradient-to-r from-tertiary via-ink to-secondary p-8 text-neutral shadow-md sm:p-10">
        <span className="font-body text-xs font-bold uppercase tracking-widest text-primary">
          Seguimiento
        </span>
        <h1 className="mt-2 font-display text-3xl font-bold text-neutral sm:text-4xl">
          Seguimiento de Pedido
        </h1>
        <p className="mt-2 max-w-2xl font-body text-sm text-neutral/80 sm:text-base">
          Revisa el estado en tiempo real de tu pedido y quién lo recogerá en nuestra pastelería.
        </p>
      </header>

      {/* Alerta de Feedback */}
      {feedbackMsg && (
        <div
          className={`flex items-center gap-3 rounded-xl p-4 text-sm font-medium transition-all ${
            feedbackMsg.tipo === "exito"
              ? "border border-green-200 bg-green-50 text-green-900"
              : "border border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {feedbackMsg.tipo === "exito" ? <CheckCircle size={20} className="text-green-700" /> : <AlertCircle size={20} className="text-red-700" />}
          <span>{feedbackMsg.texto}</span>
        </div>
      )}

      {/* Grid Principal: Sidebar + Contenido */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <PerfilSidebar tabActiva="seguimiento" />

        <div className="flex flex-col gap-6">
          {/* Barra de Búsqueda Dinámica por Código */}
          <Card className="p-4 sm:p-6">
            <form onSubmit={handleBuscar} className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
                <input
                  type="text"
                  value={codigoBusqueda}
                  onChange={(e) => setCodigoBusqueda(e.target.value)}
                  placeholder="Buscar por código #CC-XXXX o ID..."
                  className="w-full rounded-xl border border-tertiary/20 bg-neutral/20 py-2.5 pl-10 pr-4 font-body text-sm text-ink outline-none transition-colors focus:border-secondary focus:ring-1 focus:ring-secondary"
                />
              </div>
              <Button type="submit" disabled={cargando}>
                {cargando ? "Buscando..." : "Buscar Pedido"}
              </Button>
            </form>
            {errorBusqueda && (
              <p className="mt-2 text-xs font-semibold text-red-600 flex items-center gap-1.5">
                <AlertCircle size={14} />
                {errorBusqueda}
              </p>
            )}
          </Card>

          {orden ? (
            <>
              {/* 1. Cabecera del Pedido y Recogedor */}
              <Card className="flex flex-col gap-6 p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-tertiary/10 pb-6">
                  <div className="flex flex-col gap-2">
                    <span className="font-display text-2xl font-bold text-tertiary">
                      Pedido #{orden.trackingCode.replace("#", "")}
                    </span>
                    <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-ink/75">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={16} className="text-secondary" />
                        Realizado: {new Date(orden.fecha).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={16} className="text-secondary" />
                        Entrega estimada: {orden.fechaEntregaEstimada || "27 de Octubre, 2025"}
                      </span>
                    </div>
                  </div>
                  <EstadoPedidoBadge estado={orden.estado} className="text-sm px-3.5 py-1" />
                </div>

                {/* Tarjeta de quien recoge o dirección de despacho */}
                {esRetiro ? (
                  <div className="flex flex-col gap-4 rounded-xl border border-secondary/20 bg-gradient-to-r from-primary/20 via-neutral/70 to-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary font-display font-bold text-tertiary shadow-sm">
                        {inicialesRecogedor || "JP"}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-body text-xs font-semibold uppercase tracking-wider text-secondary">
                          Persona que recogerá el pedido (Retiro en Local)
                        </span>
                        <span className="font-body text-base font-bold text-tertiary">
                          {nombreRecogedor}
                        </span>
                        <span className="font-body text-xs text-ink/70">
                          RUN: <strong>{rutRecogedor}</strong> • Tel: {telefonoRecogedor}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormRecogedor({
                          nombre: nombreRecogedor,
                          rut: rutRecogedor,
                          telefono: telefonoRecogedor,
                        });
                        setErrorRutRecogedor(null);
                        setModalRecogedorAbierto(true);
                      }}
                    >
                      Cambiar Recogedor
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 rounded-xl border border-secondary/20 bg-primary/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <Truck size={24} className="text-secondary" />
                      <div className="flex flex-col">
                        <span className="font-body text-xs font-semibold uppercase tracking-wider text-secondary">
                          Modalidad: Despacho a Domicilio
                        </span>
                        <span className="font-body text-sm font-bold text-tertiary">
                          {orden.direccion || "Av. Providencia 1234"}, {orden.comuna || "Providencia"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* 2. Línea de Tiempo de Estados */}
              <Card className="flex flex-col gap-6 p-6 sm:p-8">
                <div className="border-b border-tertiary/10 pb-4">
                  <h2 className="font-display text-xl font-bold text-tertiary">Estado del Pedido</h2>
                  <p className="font-body text-xs text-ink/70">Seguimiento detallado paso a paso</p>
                </div>
                <LineaTiempoPedido hitos={generarHitos(orden)} />
              </Card>

              {/* 3. Detalle de Productos y Resumen de Pago */}
              <Card className="flex flex-col gap-6 p-6 sm:p-8">
                <div className="border-b border-tertiary/10 pb-4">
                  <h2 className="font-display text-xl font-bold text-tertiary">Detalle del Pedido</h2>
                  <p className="font-body text-xs text-ink/70">Productos solicitados y desglose financiero</p>
                </div>

                <div className="flex flex-col gap-4">
                  {orden.items && orden.items.length > 0 ? (
                    orden.items.map((it, idx) => (
                      <div
                        key={it.id || idx}
                        className="flex items-center justify-between gap-4 rounded-xl bg-neutral/30 p-4"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={it.imagen || "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=400&auto=format&fit=crop"}
                            alt={it.nombre || it.productoNombre || "Torta"}
                            className="h-16 w-16 shrink-0 rounded-xl object-cover"
                          />
                          <div className="flex flex-col">
                            <span className="font-display text-base font-bold text-tertiary">
                              {it.nombre || it.productoNombre}
                            </span>
                            <span className="font-body text-xs text-ink/70">
                              Pastelería fresca elaborada artesanalmente
                            </span>
                            <span className="mt-1 font-body text-xs font-semibold text-secondary">
                              Cantidad: {it.cantidad}
                            </span>
                          </div>
                        </div>
                        <span className="font-display text-lg font-bold text-tertiary">
                          {formatPrecio((it.precio || it.precioUnitario || 0) * it.cantidad)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-between gap-4 rounded-xl bg-neutral/30 p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src="https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=400&auto=format&fit=crop"
                          alt="Torta"
                          className="h-16 w-16 shrink-0 rounded-xl object-cover"
                        />
                        <div className="flex flex-col">
                          <span className="font-display text-base font-bold text-tertiary">
                            Torta de Chocolate con Frutillas
                          </span>
                          <span className="font-body text-xs text-ink/70">
                            Tamaño: 20 personas • Sabor: Chocolate • Relleno: Ganache
                          </span>
                          <span className="mt-1 font-body text-xs font-semibold text-secondary">
                            Cantidad: 1
                          </span>
                        </div>
                      </div>
                      <span className="font-display text-lg font-bold text-tertiary">
                        {formatPrecio(orden.total)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Desglose de totales */}
                <div className="flex flex-col gap-2 rounded-xl border border-tertiary/10 bg-neutral/20 p-4 font-body text-sm">
                  <div className="flex justify-between text-ink/80">
                    <span>Subtotal</span>
                    <span>{formatPrecio(orden.subtotal || orden.total)}</span>
                  </div>
                  <div className="flex justify-between text-ink/80">
                    <span>Envío / Retiro</span>
                    <span className="font-semibold text-green-700">
                      {esRetiro ? "Gratis (Retiro en tienda)" : formatPrecio(orden.costoEnvio || 3990)}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-tertiary/10 pt-2 font-display text-xl font-bold text-secondary">
                    <span>Total</span>
                    <span>{formatPrecio(orden.total)}</span>
                  </div>
                </div>

                {/* Acciones de navegación */}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <ButtonLink to="/perfil" variant="outline">
                    <User size={18} />
                    Volver a mi perfil
                  </ButtonLink>
                  <ButtonLink to="/catalogo">
                    <ShoppingBag size={18} />
                    Seguir comprando
                  </ButtonLink>
                </div>
              </Card>
            </>
          ) : (
            <Card className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <Package size={48} className="text-secondary/60 animate-bounce" />
              <div className="flex flex-col gap-1">
                <h3 className="font-display text-lg font-bold text-tertiary">No hay pedido seleccionado</h3>
                <p className="font-body text-xs text-ink/70">Ingresa un código de pedido arriba para consultar su estado.</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modal Cambiar Recogedor */}
      <Modal
        abierto={modalRecogedorAbierto}
        onCerrar={() => setModalRecogedorAbierto(false)}
        titulo="Cambiar Persona que Recoge"
      >
        <form onSubmit={guardarRecogedor} className="flex flex-col gap-4">
          <p className="font-body text-xs text-ink/80">
            Indica quién retirará el pedido en el local. Se le solicitará su cédula de identidad vigente al momento de la entrega (conforme a normativa DSY1104).
          </p>
          <div>
            <label className="font-body text-xs font-semibold text-tertiary">Nombre Completo *</label>
            <Input
              value={formRecogedor.nombre}
              onChange={(e) => setFormRecogedor({ ...formRecogedor, nombre: e.target.value })}
              placeholder="Ej: Juan Pablo Martínez"
              required
            />
          </div>
          <div>
            <label className="font-body text-xs font-semibold text-tertiary">RUN / RUT Chileno (Módulo 11) *</label>
            <Input
              value={formRecogedor.rut}
              onChange={(e) => {
                const formateado = formatearRut(e.target.value);
                setFormRecogedor({ ...formRecogedor, rut: formateado });
                setErrorRutRecogedor(null);
              }}
              placeholder="12.345.678-9"
              required
            />
            {errorRutRecogedor && (
              <p className="mt-1 text-xs font-semibold text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errorRutRecogedor}
              </p>
            )}
          </div>
          <div>
            <label className="font-body text-xs font-semibold text-tertiary">Teléfono de Contacto *</label>
            <Input
              value={formRecogedor.telefono}
              onChange={(e) => setFormRecogedor({ ...formRecogedor, telefono: e.target.value })}
              placeholder="+56 9 8765 4321"
              required
            />
          </div>
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setModalRecogedorAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardandoRecogedor}>
              {guardandoRecogedor ? "Actualizando..." : "Actualizar Recogedor"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
