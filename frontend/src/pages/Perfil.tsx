// @pca:start
// @id(frontend.pages.cliente.perfil)
// @kind(component)
// @limit(lines: 620)
// @contract(sin props: consulta contexto de sesion o estado local)
// @relates(frontend.domain.perfilSidebar)
// @relates(frontend.domain.estadoPedidoBadge)
// @relates(frontend.ui.button)
// @relates(frontend.ui.buttonLink)
// @relates(frontend.ui.modal)
// @desc(Vista de perfil de cliente con datos personales, direcciones y acceso a pedidos)
// @pca:end
import { useEffect, useState } from "react";
import { User, Package, CheckCircle, AlertCircle } from "lucide-react";
import { PerfilSidebar } from "@/components/domain/PerfilSidebar";
import { EstadoPedidoBadge } from "@/components/domain/EstadoPedidoBadge";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/auth";
import { api, type OrderResponse } from "@/services/api";
import { formatPrecio } from "@/lib/utils";
import { formatearRut, validarRut } from "@/lib/validators/rut.validator";

export function Perfil() {
  const { usuario, logueado, login } = useAuth();
  const [emailLogin, setEmailLogin] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);

  // Estados editables de datos personales
  const [datosPersonales, setDatosPersonales] = useState({
    nombre: usuario?.nombre || "Camila Silva Tapia",
    email: usuario?.email || "cliente@cremeco.cl",
    telefono: "+56 9 8765 4321",
    rut: "18.432.198-7",
    registro: "15 de Octubre, 2025",
  });

  // Estados editables de dirección
  const [direccion, setDireccion] = useState({
    calle: "Av. Providencia 1234",
    departamento: "Depto 501",
    comuna: "Providencia",
    region: "Región Metropolitana",
    codigoPostal: "7500000",
  });

  // Pedidos del usuario
  const [pedidos, setPedidos] = useState<OrderResponse[]>([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);

  // Modales
  const [modalDatosAbierto, setModalDatosAbierto] = useState(false);
  const [modalDireccionAbierto, setModalDireccionAbierto] = useState(false);

  // Formularios temporales para edición
  const [formDatos, setFormDatos] = useState(datosPersonales);
  const [formDireccion, setFormDireccion] = useState(direccion);
  const [errorRut, setErrorRut] = useState<string | null>(null);

  // Cargar datos reales al iniciar o cambiar usuario
  useEffect(() => {
    if (!usuario?.email) return;

    // Actualizar datos base del contexto
    setDatosPersonales((prev) => ({
      ...prev,
      nombre: usuario.nombre || prev.nombre,
      email: usuario.email,
    }));

    // Cargar perfil ampliado desde API / storage
    const cargarPerfil = async () => {
      try {
        const perfil = await api.auth.getProfile(usuario.email);
        if (perfil) {
          setDatosPersonales({
            nombre: perfil.nombre ? `${perfil.nombre} ${perfil.apellidos || ""}`.trim() : usuario.nombre,
            email: perfil.email || usuario.email,
            telefono: perfil.telefono || "+56 9 8765 4321",
            rut: perfil.rut || "18.432.198-7",
            registro: perfil.createdAt ? new Date(perfil.createdAt).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" }) : "15 de Octubre, 2025",
          });

          setDireccion({
            calle: perfil.calle || "Av. Providencia 1234",
            departamento: perfil.departamento || "Depto 501",
            comuna: perfil.comuna || "Providencia",
            region: perfil.region || "Región Metropolitana",
            codigoPostal: "7500000",
          });
        }
      } catch {
        // Fallback local en caso de microservicio desconectado
        const localKey = `cremeco_perfil_${usuario.email}`;
        const raw = localStorage.getItem(localKey);
        if (raw) {
          try {
            const data = JSON.parse(raw);
            if (data.datosPersonales) setDatosPersonales(data.datosPersonales);
            if (data.direccion) setDireccion(data.direccion);
          } catch {
            // Ignorar error de parseo
          }
        }
      }
    };

    // Cargar pedidos reales
    const cargarPedidos = async () => {
      setCargandoPedidos(true);
      try {
        const list = await api.order.getByUser(usuario.email || usuario.id || "");
        setPedidos(list);
      } catch {
        // Fallback a lista vacía o pedidos locales
        setPedidos([]);
      } finally {
        setCargandoPedidos(false);
      }
    };

    cargarPerfil();
    cargarPedidos();
  }, [usuario]);

  const guardarDatos = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorRut(null);

    if (formDatos.rut && !validarRut(formDatos.rut)) {
      setErrorRut("El RUN/RUT ingresado no es válido según algoritmo Módulo 11.");
      return;
    }

    setGuardando(true);
    try {
      await api.auth.updateProfile({
        email: formDatos.email,
        nombre: formDatos.nombre,
        telefono: formDatos.telefono,
        rut: formDatos.rut,
      });

      setDatosPersonales(formDatos);
      const localKey = `cremeco_perfil_${formDatos.email}`;
      localStorage.setItem(localKey, JSON.stringify({ datosPersonales: formDatos, direccion }));
      setModalDatosAbierto(false);
      setFeedbackMsg({ tipo: "exito", texto: "Tus datos personales fueron actualizados correctamente." });
    } catch {
      // Guardado local resiliente
      setDatosPersonales(formDatos);
      const localKey = `cremeco_perfil_${formDatos.email}`;
      localStorage.setItem(localKey, JSON.stringify({ datosPersonales: formDatos, direccion }));
      setModalDatosAbierto(false);
      setFeedbackMsg({ tipo: "exito", texto: "Datos actualizados localmente (modo offline)." });
    } finally {
      setGuardando(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const guardarDireccion = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await api.auth.updateProfile({
        email: datosPersonales.email,
        calle: formDireccion.calle,
        departamento: formDireccion.departamento,
        comuna: formDireccion.comuna,
        region: formDireccion.region,
      });

      setDireccion(formDireccion);
      const localKey = `cremeco_perfil_${datosPersonales.email}`;
      localStorage.setItem(localKey, JSON.stringify({ datosPersonales, direccion: formDireccion }));
      setModalDireccionAbierto(false);
      setFeedbackMsg({ tipo: "exito", texto: "Tu dirección de entrega fue guardada correctamente." });
    } catch {
      setDireccion(formDireccion);
      const localKey = `cremeco_perfil_${datosPersonales.email}`;
      localStorage.setItem(localKey, JSON.stringify({ datosPersonales, direccion: formDireccion }));
      setModalDireccionAbierto(false);
      setFeedbackMsg({ tipo: "exito", texto: "Dirección guardada localmente (modo offline)." });
    } finally {
      setGuardando(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
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
          <div className="flex flex-col gap-2 text-center text-xs text-ink/70">
            <button
              type="button"
              onClick={() => login("cliente@cremeco.cl")}
              className="font-body text-secondary hover:underline cursor-pointer"
            >
              Iniciar sesión demo: <strong>Camila Silva (cliente@cremeco.cl)</strong>
            </button>
            <button
              type="button"
              onClick={() => login("maria.gonzalez@email.com")}
              className="font-body text-secondary hover:underline cursor-pointer"
            >
              Iniciar sesión demo: <strong>María González (maria.gonzalez@email.com)</strong>
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

      {/* Alerta de feedback */}
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
        <PerfilSidebar tabActiva="datos" />

        <div className="flex flex-col gap-6">
          {/* 1. Información Personal */}
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
                  setErrorRut(null);
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
                  RUN / RUT Chileno
                </span>
                <p className="mt-1 font-body text-base font-medium text-ink">{datosPersonales.rut || "No registrado"}</p>
              </div>
              <div className="rounded-xl bg-neutral/40 p-4">
                <span className="font-body text-xs font-semibold uppercase tracking-wider text-secondary">
                  Teléfono
                </span>
                <p className="mt-1 font-body text-base font-medium text-ink">{datosPersonales.telefono}</p>
              </div>
              <div className="rounded-xl bg-neutral/40 p-4 sm:col-span-2">
                <span className="font-body text-xs font-semibold uppercase tracking-wider text-secondary">
                  Fecha de Registro
                </span>
                <p className="mt-1 font-body text-base font-medium text-ink">{datosPersonales.registro}</p>
              </div>
            </div>
          </Card>

          {/* 2. Dirección de Entrega */}
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
                <p className="mt-1 font-body text-base font-medium text-ink">
                  {direccion.calle} {direccion.departamento ? `(${direccion.departamento})` : ""}
                </p>
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

          {/* 3. Últimos Pedidos */}
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

            {cargandoPedidos ? (
              <div className="flex items-center justify-center py-8 text-ink/60">
                <p className="font-body text-sm animate-pulse">Cargando tus pedidos...</p>
              </div>
            ) : pedidos.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-8 text-center text-ink/75">
                <Package size={36} className="text-secondary/60" />
                <p className="font-body text-sm">Aún no registras pedidos asociados a tu cuenta.</p>
                <ButtonLink to="/catalogo" variant="outline" size="sm">
                  Explorar Catálogo
                </ButtonLink>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {pedidos.map((pedido) => {
                  const primerItem = pedido.items && pedido.items.length > 0 ? pedido.items[0] : null;
                  const nombreItem = primerItem?.nombre || primerItem?.productoNombre || "Pedido de Pastelería Artesanal";
                  const imagenItem = primerItem?.imagen || "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=400&auto=format&fit=crop";
                  const fechaFormateada = new Date(pedido.fecha).toLocaleDateString("es-CL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });
                  const trackingLimpio = pedido.trackingCode.replace("#", "");

                  return (
                    <div
                      key={pedido.id || pedido.trackingCode}
                      className="flex flex-col gap-4 rounded-xl border border-tertiary/10 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between transition-hover hover:border-tertiary/30"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={imagenItem}
                          alt={nombreItem}
                          className="h-18 w-18 shrink-0 rounded-xl object-cover shadow-xs"
                        />
                        <div className="flex flex-col gap-1">
                          <span className="font-display text-base font-bold text-tertiary sm:text-lg">
                            {nombreItem}
                          </span>
                          <span className="font-body text-xs text-ink/70">
                            Pedido #{trackingLimpio} • {fechaFormateada}
                            {pedido.tipoEntrega && (
                              <span className="ml-2 font-semibold text-secondary">
                                • {pedido.tipoEntrega === "RETIRO" ? "Retiro en local" : "Despacho a domicilio"}
                              </span>
                            )}
                          </span>
                          <div className="mt-1">
                            <EstadoPedidoBadge estado={pedido.estado} />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 border-t border-tertiary/10 pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                        <span className="font-display text-xl font-bold text-secondary">
                          {formatPrecio(pedido.total)}
                        </span>
                        <ButtonLink to={`/perfil/seguimiento/${trackingLimpio}`} variant="ghost" size="sm">
                          Seguir Pedido
                        </ButtonLink>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
            <label className="font-body text-xs font-semibold text-tertiary">RUN / RUT Chileno</label>
            <Input
              value={formDatos.rut}
              onChange={(e) => {
                const formateado = formatearRut(e.target.value);
                setFormDatos({ ...formDatos, rut: formateado });
                setErrorRut(null);
              }}
              placeholder="18.432.198-7"
            />
            {errorRut && <p className="mt-1 text-xs text-red-600">{errorRut}</p>}
          </div>
          <div>
            <label className="font-body text-xs font-semibold text-tertiary">Teléfono de Contacto</label>
            <Input
              value={formDatos.telefono}
              onChange={(e) => setFormDatos({ ...formDatos, telefono: e.target.value })}
              placeholder="+56 9 8765 4321"
              required
            />
          </div>
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setModalDatosAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar Dirección */}
      <Modal abierto={modalDireccionAbierto} onCerrar={() => setModalDireccionAbierto(false)} titulo="Editar Dirección de Entrega">
        <form onSubmit={guardarDireccion} className="flex flex-col gap-4">
          <div>
            <label className="font-body text-xs font-semibold text-tertiary">Calle y Número</label>
            <Input
              value={formDireccion.calle}
              onChange={(e) => setFormDireccion({ ...formDireccion, calle: e.target.value })}
              placeholder="Ej: Av. Providencia 1234"
              required
            />
          </div>
          <div>
            <label className="font-body text-xs font-semibold text-tertiary">Departamento / Casa / Oficina</label>
            <Input
              value={formDireccion.departamento}
              onChange={(e) => setFormDireccion({ ...formDireccion, departamento: e.target.value })}
              placeholder="Ej: Depto 501, Torre B"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-body text-xs font-semibold text-tertiary">Comuna</label>
              <Input
                value={formDireccion.comuna}
                onChange={(e) => setFormDireccion({ ...formDireccion, comuna: e.target.value })}
                placeholder="Ej: Providencia"
                required
              />
            </div>
            <div>
              <label className="font-body text-xs font-semibold text-tertiary">Región</label>
              <Input
                value={formDireccion.region}
                onChange={(e) => setFormDireccion({ ...formDireccion, region: e.target.value })}
                placeholder="Ej: Región Metropolitana"
                required
              />
            </div>
          </div>
          <div>
            <label className="font-body text-xs font-semibold text-tertiary">Código Postal</label>
            <Input
              value={formDireccion.codigoPostal}
              onChange={(e) => setFormDireccion({ ...formDireccion, codigoPostal: e.target.value })}
              placeholder="7500000"
            />
          </div>
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setModalDireccionAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
