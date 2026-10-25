// @pca:start
// @id(frontend.pages.cliente.perfilSeguimiento)
// @kind(component)
// @limit(lines: 360)
// @contract(sin props: consulta pedido mock o parametros de ruta)
// @relates(frontend.domain.perfilSidebar)
// @relates(frontend.domain.lineaTiempoPedido)
// @relates(frontend.domain.estadoPedidoBadge)
// @relates(frontend.ui.button)
// @relates(frontend.ui.buttonLink)
// @relates(frontend.ui.modal)
// @desc(Vista de seguimiento de pedido dentro del perfil con timeline e info de recogida)
// @pca:end
import { useState } from "react";
import { Calendar, Clock, ShoppingBag, User } from "lucide-react";
import { PerfilSidebar } from "@/components/domain/PerfilSidebar";
import { EstadoPedidoBadge } from "@/components/domain/EstadoPedidoBadge";
import { LineaTiempoPedido, type HitoPedido } from "@/components/domain/LineaTiempoPedido";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/auth";
import { formatPrecio } from "@/lib/utils";

const HITOS_SEGUIMIENTO: HitoPedido[] = [
  {
    id: "recibido",
    titulo: "Pedido Recibido",
    fechaHora: "25 Oct 2025 - 14:30",
    descripcion: "Tu pedido ha sido recibido y confirmado correctamente.",
    estado: "completado",
  },
  {
    id: "pago",
    titulo: "Pago Confirmado",
    fechaHora: "25 Oct 2025 - 14:32",
    descripcion: "Pago procesado exitosamente mediante Webpay.",
    estado: "completado",
  },
  {
    id: "preparacion",
    titulo: "En Preparación",
    fechaHora: "26 Oct 2025 - 09:15",
    descripcion: "Nuestros maestros pasteleros están horneando y decorando tu torta con ingredientes frescos.",
    estado: "activo",
  },
  {
    id: "listo",
    titulo: "Listo para Retirar / En Camino",
    fechaHora: "Pendiente",
    descripcion: "Tu pedido estará empaquetado en caja térmica y listo para el retiro en pastelería.",
    estado: "pendiente",
  },
  {
    id: "entregado",
    titulo: "Entregado",
    fechaHora: "Pendiente",
    descripcion: "Pedido entregado exitosamente al cliente.",
    estado: "pendiente",
  },
];

export function PerfilSeguimiento() {
  const { logueado, login } = useAuth();
  const [emailLogin, setEmailLogin] = useState("");
  const [recogedor, setRecogedor] = useState({
    nombre: "Juan Pablo Martínez",
    rut: "12.345.678-9",
    telefono: "+56 9 8765 4321",
  });

  const [modalRecogedorAbierto, setModalRecogedorAbierto] = useState(false);
  const [formRecogedor, setFormRecogedor] = useState(recogedor);

  const guardarRecogedor = (e: React.FormEvent) => {
    e.preventDefault();
    setRecogedor(formRecogedor);
    setModalRecogedorAbierto(false);
  };

  const inicialesRecogedor = recogedor.nombre
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
              login(emailLogin || "maria.gonzalez@email.com");
            }}
            className="flex flex-col gap-3"
          >
            <div>
              <label className="font-body text-xs font-semibold text-tertiary">Correo Electrónico</label>
              <Input
                type="email"
                placeholder="maria.gonzalez@email.com"
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
              onClick={() => login("maria.gonzalez@email.com")}
              className="font-body text-xs text-secondary hover:underline cursor-pointer"
            >
              Iniciar sesión demo (María González)
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

      {/* Grid Principal: Sidebar + Contenido */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <PerfilSidebar tabActiva="seguimiento" />

        <div className="flex flex-col gap-6">
          {/* 1. Cabecera del Pedido y Recogedor */}
          <Card className="flex flex-col gap-6 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-tertiary/10 pb-6">
              <div className="flex flex-col gap-2">
                <span className="font-display text-2xl font-bold text-tertiary">
                  Pedido #CC-2025-001234
                </span>
                <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-ink/75">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={16} className="text-secondary" />
                    Realizado: 25 de Octubre, 2025 - 14:30
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={16} className="text-secondary" />
                    Entrega estimada: 27 de Octubre, 2025
                  </span>
                </div>
              </div>
              <EstadoPedidoBadge estado="En preparación" className="text-sm px-3.5 py-1" />
            </div>

            {/* Tarjeta de quien recoge */}
            <div className="flex flex-col gap-4 rounded-xl border border-secondary/20 bg-gradient-to-r from-primary/20 via-neutral/70 to-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary font-display font-bold text-tertiary shadow-sm">
                  {inicialesRecogedor || "JP"}
                </div>
                <div className="flex flex-col">
                  <span className="font-body text-xs font-semibold uppercase tracking-wider text-secondary">
                    Persona que recogerá el pedido
                  </span>
                  <span className="font-body text-base font-bold text-tertiary">
                    {recogedor.nombre}
                  </span>
                  <span className="font-body text-xs text-ink/70">
                    RUT: {recogedor.rut} • Tel: {recogedor.telefono}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormRecogedor(recogedor);
                  setModalRecogedorAbierto(true);
                }}
              >
                Cambiar Recogedor
              </Button>
            </div>
          </Card>

          {/* 2. Linea de Tiempo de Estados */}
          <Card className="flex flex-col gap-6 p-6 sm:p-8">
            <div className="border-b border-tertiary/10 pb-4">
              <h2 className="font-display text-xl font-bold text-tertiary">Estado del Pedido</h2>
              <p className="font-body text-xs text-ink/70">Seguimiento detallado paso a paso</p>
            </div>
            <LineaTiempoPedido hitos={HITOS_SEGUIMIENTO} />
          </Card>

          {/* 3. Detalle de Productos y Resumen de Pago */}
          <Card className="flex flex-col gap-6 p-6 sm:p-8">
            <div className="border-b border-tertiary/10 pb-4">
              <h2 className="font-display text-xl font-bold text-tertiary">Detalle del Pedido</h2>
              <p className="font-body text-xs text-ink/70">Productos solicitados y resumen financiero</p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4 rounded-xl bg-neutral/30 p-4">
                <div className="flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=400&auto=format&fit=crop"
                    alt="Torta de Chocolate con Frutillas"
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="font-display text-base font-bold text-tertiary">
                      Torta de Chocolate con Frutillas
                    </span>
                    <span className="font-body text-xs text-ink/70">
                      Tamaño: 20 personas • Sabor: Chocolate • Relleno: Ganache de Frutilla
                    </span>
                    <span className="mt-1 font-body text-xs font-semibold text-secondary">
                      Cantidad: 1
                    </span>
                  </div>
                </div>
                <span className="font-display text-lg font-bold text-tertiary">
                  {formatPrecio(45000)}
                </span>
              </div>
            </div>

            {/* Desglose de totales */}
            <div className="flex flex-col gap-2 rounded-xl border border-tertiary/10 bg-neutral/20 p-4 font-body text-sm">
              <div className="flex justify-between text-ink/80">
                <span>Subtotal</span>
                <span>{formatPrecio(45000)}</span>
              </div>
              <div className="flex justify-between text-ink/80">
                <span>Envío / Retiro</span>
                <span className="font-semibold text-green-700">Gratis (Retiro en tienda)</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-tertiary/10 pt-2 font-display text-xl font-bold text-secondary">
                <span>Total</span>
                <span>{formatPrecio(45000)}</span>
              </div>
            </div>

            {/* Acciones de navegacion */}
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
            Indica quién retirará el pedido en el local. Se le solicitará su cédula de identidad al momento de la entrega.
          </p>
          <div>
            <label className="font-body text-xs font-semibold text-tertiary">Nombre Completo</label>
            <Input
              value={formRecogedor.nombre}
              onChange={(e) => setFormRecogedor({ ...formRecogedor, nombre: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="font-body text-xs font-semibold text-tertiary">RUT</label>
            <Input
              value={formRecogedor.rut}
              onChange={(e) => setFormRecogedor({ ...formRecogedor, rut: e.target.value })}
              placeholder="12.345.678-9"
              required
            />
          </div>
          <div>
            <label className="font-body text-xs font-semibold text-tertiary">Teléfono de Contacto</label>
            <Input
              value={formRecogedor.telefono}
              onChange={(e) => setFormRecogedor({ ...formRecogedor, telefono: e.target.value })}
              placeholder="+56 9 1234 5678"
              required
            />
          </div>
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setModalRecogedorAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit">Actualizar Recogedor</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
