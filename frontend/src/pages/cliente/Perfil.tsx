// @pca:start
// @id(frontend.pages.cliente.perfil)
// @kind(component)
// @limit(lines: 380)
// @contract(sin props: consulta contexto de sesion o estado local)
// @relates(frontend.domain.perfilSidebar)
// @relates(frontend.domain.estadoPedidoBadge)
// @relates(frontend.ui.button)
// @relates(frontend.ui.buttonLink)
// @relates(frontend.ui.modal)
// @desc(Vista de perfil de cliente con datos personales, direcciones y acceso a pedidos)
// @pca:end
import { useState } from "react";
import { User } from "lucide-react";
import { PerfilSidebar } from "@/components/domain/PerfilSidebar";
import { EstadoPedidoBadge } from "@/components/domain/EstadoPedidoBadge";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/auth";

export function Perfil() {
  const { usuario, logueado, login } = useAuth();
  const [emailLogin, setEmailLogin] = useState("");

  // Estados editables de datos personales
  const [datosPersonales, setDatosPersonales] = useState({
    nombre: usuario?.nombre || "María González Pérez",
    email: usuario?.email || "maria.gonzalez@email.com",
    telefono: "+56 9 1234 5678",
    registro: "15 de Octubre, 2025",
  });

  // Estados editables de direccion
  const [direccion, setDireccion] = useState({
    calle: "Av. Providencia 1234, Depto 501",
    comuna: "Providencia",
    region: "Región Metropolitana",
    codigoPostal: "7500000",
  });

  // Modales
  const [modalDatosAbierto, setModalDatosAbierto] = useState(false);
  const [modalDireccionAbierto, setModalDireccionAbierto] = useState(false);

  // Formularios temporales para edicion
  const [formDatos, setFormDatos] = useState(datosPersonales);
  const [formDireccion, setFormDireccion] = useState(direccion);

  const guardarDatos = (e: React.FormEvent) => {
    e.preventDefault();
    setDatosPersonales(formDatos);
    setModalDatosAbierto(false);
  };

  const guardarDireccion = (e: React.FormEvent) => {
    e.preventDefault();
    setDireccion(formDireccion);
    setModalDireccionAbierto(false);
  };

  if (!logueado) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/30 text-secondary">
          <User size={36} />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-2xl font-bold text-tertiary">
            Mi Perfil
          </h1>
          <p className="font-body text-sm text-ink/75">
            Inicia sesión con tu cuenta para revisar tus datos personales, direcciones y pedidos.
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
          Mi Cuenta
        </span>
        <h1 className="mt-2 font-display text-3xl font-bold text-neutral sm:text-4xl">
          Mi Perfil
        </h1>
        <p className="mt-2 max-w-2xl font-body text-sm text-neutral/80 sm:text-base">
          Gestiona tu información personal, revisa tus pedidos y sigue el estado de tus tortas.
        </p>
      </header>

      {/* Grid Principal: Sidebar + Contenido */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <PerfilSidebar tabActiva="datos" />

        <div className="flex flex-col gap-6">
          {/* 1. Informacion Personal */}
          <Card className="flex flex-col gap-6 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-tertiary/10 pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-tertiary">Información Personal</h2>
                <p className="font-body text-xs text-ink/70">Datos de tu cuenta y contacto</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormDatos(datosPersonales);
                  setModalDatosAbierto(true);
                }}
              >
                Editar Datos
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-neutral/40 p-4">
                <span className="font-body text-xs font-semibold uppercase tracking-wider text-secondary">
                  Nombre Completo
                </span>
                <p className="mt-1 font-body text-base font-medium text-ink">{datosPersonales.nombre}</p>
              </div>
              <div className="rounded-xl bg-neutral/40 p-4">
                <span className="font-body text-xs font-semibold uppercase tracking-wider text-secondary">
                  Correo Electrónico
                </span>
                <p className="mt-1 font-body text-base font-medium text-ink">{datosPersonales.email}</p>
              </div>
              <div className="rounded-xl bg-neutral/40 p-4">
                <span className="font-body text-xs font-semibold uppercase tracking-wider text-secondary">
                  Teléfono
                </span>
                <p className="mt-1 font-body text-base font-medium text-ink">{datosPersonales.telefono}</p>
              </div>
              <div className="rounded-xl bg-neutral/40 p-4">
                <span className="font-body text-xs font-semibold uppercase tracking-wider text-secondary">
                  Fecha de Registro
                </span>
                <p className="mt-1 font-body text-base font-medium text-ink">{datosPersonales.registro}</p>
              </div>
            </div>
          </Card>

          {/* 2. Direccion de Entrega */}
          <Card className="flex flex-col gap-6 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-tertiary/10 pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-tertiary">Dirección de Entrega</h2>
                <p className="font-body text-xs text-ink/70">Dirección principal para tus pedidos</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormDireccion(direccion);
                  setModalDireccionAbierto(true);
                }}
              >
                Editar Dirección
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-neutral/40 p-4">
                <span className="font-body text-xs font-semibold uppercase tracking-wider text-secondary">
                  Calle y Número
                </span>
                <p className="mt-1 font-body text-base font-medium text-ink">{direccion.calle}</p>
              </div>
              <div className="rounded-xl bg-neutral/40 p-4">
                <span className="font-body text-xs font-semibold uppercase tracking-wider text-secondary">
                  Comuna
                </span>
                <p className="mt-1 font-body text-base font-medium text-ink">{direccion.comuna}</p>
              </div>
              <div className="rounded-xl bg-neutral/40 p-4">
                <span className="font-body text-xs font-semibold uppercase tracking-wider text-secondary">
                  Región
                </span>
                <p className="mt-1 font-body text-base font-medium text-ink">{direccion.region}</p>
              </div>
              <div className="rounded-xl bg-neutral/40 p-4">
                <span className="font-body text-xs font-semibold uppercase tracking-wider text-secondary">
                  Código Postal
                </span>
                <p className="mt-1 font-body text-base font-medium text-ink">{direccion.codigoPostal}</p>
              </div>
            </div>
          </Card>

          {/* 3. Ultimos Pedidos */}
          <Card className="flex flex-col gap-6 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-tertiary/10 pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-tertiary">Últimos Pedidos</h2>
                <p className="font-body text-xs text-ink/70">Acceso rápido a tus pedidos recientes</p>
              </div>
              <ButtonLink to="/perfil/seguimiento" variant="outline" size="sm">
                Ver Todos
              </ButtonLink>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 rounded-xl border border-tertiary/10 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=400&auto=format&fit=crop"
                    alt="Torta de Chocolate con Frutillas"
                    className="h-18 w-18 shrink-0 rounded-xl object-cover"
                  />
                  <div className="flex flex-col gap-1">
                    <span className="font-display text-base font-bold text-tertiary sm:text-lg">
                      Torta de Chocolate con Frutillas
                    </span>
                    <span className="font-body text-xs text-ink/70">
                      Pedido #CC-2025-001234 • 25 de Octubre, 2025
                    </span>
                    <div className="mt-1">
                      <EstadoPedidoBadge estado="En preparación" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-tertiary/10 pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                  <span className="font-display text-xl font-bold text-secondary">$45.000</span>
                  <ButtonLink to="/perfil/seguimiento" variant="ghost" size="sm">
                    Seguir Pedido
                  </ButtonLink>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal Editar Datos */}
      <Modal abierto={modalDatosAbierto} onCerrar={() => setModalDatosAbierto(false)} titulo="Editar Datos Personales">
        <form onSubmit={guardarDatos} className="flex flex-col gap-4">
          <div>
            <label className="font-body text-xs font-semibold text-tertiary">Nombre Completo</label>
            <Input
              value={formDatos.nombre}
              onChange={(e) => setFormDatos({ ...formDatos, nombre: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="font-body text-xs font-semibold text-tertiary">Correo Electrónico</label>
            <Input
              type="email"
              value={formDatos.email}
              onChange={(e) => setFormDatos({ ...formDatos, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="font-body text-xs font-semibold text-tertiary">Teléfono</label>
            <Input
              value={formDatos.telefono}
              onChange={(e) => setFormDatos({ ...formDatos, telefono: e.target.value })}
              required
            />
          </div>
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setModalDatosAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar Direccion */}
      <Modal abierto={modalDireccionAbierto} onCerrar={() => setModalDireccionAbierto(false)} titulo="Editar Dirección de Entrega">
        <form onSubmit={guardarDireccion} className="flex flex-col gap-4">
          <div>
            <label className="font-body text-xs font-semibold text-tertiary">Calle y Número</label>
            <Input
              value={formDireccion.calle}
              onChange={(e) => setFormDireccion({ ...formDireccion, calle: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-body text-xs font-semibold text-tertiary">Comuna</label>
              <Input
                value={formDireccion.comuna}
                onChange={(e) => setFormDireccion({ ...formDireccion, comuna: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="font-body text-xs font-semibold text-tertiary">Región</label>
              <Input
                value={formDireccion.region}
                onChange={(e) => setFormDireccion({ ...formDireccion, region: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label className="font-body text-xs font-semibold text-tertiary">Código Postal</label>
            <Input
              value={formDireccion.codigoPostal}
              onChange={(e) => setFormDireccion({ ...formDireccion, codigoPostal: e.target.value })}
              required
            />
          </div>
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setModalDireccionAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
