import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Pencil,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { EstadoBadge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PillFiltro } from "@/components/ui/PillFiltro";
import { Toast, type ToastTono } from "@/components/ui/Toast";
import { useAuth } from "@/context/auth";
import {
  LABEL_ESTADO_USUARIO,
  LABEL_ROL,
  ROLES,
  TONO_ESTADO_USUARIO,
  TONO_ROL,
} from "@/data/usuarios";
import {
  contarAdministradoresActivos,
  guardarUsuarios,
  obtenerUsuarios,
  validarCambioRol,
  validarSuspension,
} from "@/lib/usuarios";
import { cn } from "@/lib/utils";
import type { EstadoUsuario, RolUsuario, UsuarioAdmin } from "@/types/usuario";

type FiltroRol = RolUsuario | "todos";
type FiltroEstado = EstadoUsuario | "todos";

interface Aviso {
  mensaje: string;
  tono: ToastTono;
}

const FILTROS_ROL: { value: FiltroRol; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "cliente", label: "Cliente" },
];

const FILTROS_ESTADO: { value: FiltroEstado; label: string }[] = [
  { value: "todos", label: "Todos los estados" },
  { value: "activo", label: "Activos" },
  { value: "suspendido", label: "Suspendidos" },
];

const AVATAR_ROL: Record<RolUsuario, string> = {
  admin: "bg-primary text-tertiary",
  editor: "bg-[#ffecd9] text-[#946a3a]",
  cliente: "bg-[#e8d5e0] text-tertiary",
};

const SELECT_CLASES =
  "h-11 w-full rounded border border-tertiary/30 bg-white px-3 font-body text-base text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30 sm:w-48";

const TH_CLASES =
  "px-4 py-3 font-body text-xs font-bold uppercase tracking-wide text-secondary";

const ACTION_BTN =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .join("");
}

export function Usuarios() {
  const { usuario: usuarioActual } = useAuth();
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>(() => obtenerUsuarios());
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState<FiltroRol>("todos");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [editando, setEditando] = useState<UsuarioAdmin | null>(null);
  const [rolSeleccionado, setRolSeleccionado] = useState<RolUsuario>("cliente");
  const [errorRol, setErrorRol] = useState<string | null>(null);
  const [cambiandoEstado, setCambiandoEstado] = useState<UsuarioAdmin | null>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);

  const administradoresActivos = contarAdministradoresActivos(usuarios);
  const activos = usuarios.filter((usuario) => usuario.estado === "activo").length;
  const suspendidos = usuarios.length - activos;

  const esUsuarioActual = (usuario: UsuarioAdmin) =>
    !!usuarioActual &&
    usuario.email.toLowerCase() === usuarioActual.email.toLowerCase();

  const esUltimoAdminActivo = (usuario: UsuarioAdmin) =>
    usuario.rol === "admin" &&
    usuario.estado === "activo" &&
    administradoresActivos <= 1;

  const motivoBloqueoRol = (usuario: UsuarioAdmin) => {
    if (esUsuarioActual(usuario)) return "No puedes cambiar tu propio rol.";
    if (esUltimoAdminActivo(usuario)) {
      return "No puedes cambiar el rol del último administrador activo.";
    }
    return null;
  };

  const motivoBloqueoEstado = (usuario: UsuarioAdmin) => {
    if (esUsuarioActual(usuario)) {
      return "No puedes cambiar el estado de tu propia cuenta.";
    }
    if (usuario.estado === "activo" && esUltimoAdminActivo(usuario)) {
      return "No puedes suspender al último administrador activo.";
    }
    return null;
  };

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return usuarios.filter((usuario) => {
      const coincideRol = filtroRol === "todos" || usuario.rol === filtroRol;
      const coincideEstado =
        filtroEstado === "todos" || usuario.estado === filtroEstado;
      const coincideTexto =
        !texto ||
        usuario.nombre.toLowerCase().includes(texto) ||
        usuario.email.toLowerCase().includes(texto);

      return coincideRol && coincideEstado && coincideTexto;
    });
  }, [usuarios, busqueda, filtroRol, filtroEstado]);

  const contarRol = (rol: FiltroRol) =>
    rol === "todos"
      ? usuarios.length
      : usuarios.filter((usuario) => usuario.rol === rol).length;

  const persistir = (siguientes: UsuarioAdmin[]) => {
    setUsuarios(siguientes);
    guardarUsuarios(siguientes);
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroRol("todos");
    setFiltroEstado("todos");
  };

  const abrirEditarRol = (usuario: UsuarioAdmin) => {
    setEditando(usuario);
    setRolSeleccionado(usuario.rol);
    setErrorRol(null);
  };

  const cerrarEditarRol = () => {
    setEditando(null);
    setErrorRol(null);
  };

  const guardarRol = () => {
    if (!editando) return;

    if (esUsuarioActual(editando)) {
      setErrorRol("No puedes cambiar tu propio rol.");
      return;
    }

    const error = validarCambioRol(usuarios, editando.id, rolSeleccionado);
    if (error) {
      setErrorRol(error);
      return;
    }

    persistir(
      usuarios.map((usuario) =>
        usuario.id === editando.id
          ? { ...usuario, rol: rolSeleccionado }
          : usuario
      )
    );
    setAviso({
      mensaje: `Rol de ${editando.nombre} actualizado a ${LABEL_ROL[rolSeleccionado]}.`,
      tono: "success",
    });
    cerrarEditarRol();
  };

  const confirmarCambioEstado = () => {
    if (!cambiandoEstado) return;

    const suspendiendo = cambiandoEstado.estado === "activo";

    if (suspendiendo && esUsuarioActual(cambiandoEstado)) {
      setAviso({
        mensaje: "No puedes suspender tu propia cuenta.",
        tono: "error",
      });
      setCambiandoEstado(null);
      return;
    }

    if (suspendiendo) {
      const error = validarSuspension(usuarios, cambiandoEstado.id);
      if (error) {
        setAviso({ mensaje: error, tono: "error" });
        setCambiandoEstado(null);
        return;
      }
    }

    const nuevoEstado: EstadoUsuario = suspendiendo ? "suspendido" : "activo";
    persistir(
      usuarios.map((usuario) =>
        usuario.id === cambiandoEstado.id
          ? { ...usuario, estado: nuevoEstado }
          : usuario
      )
    );
    setAviso({
      mensaje: suspendiendo
        ? `Cuenta de ${cambiandoEstado.nombre} suspendida.`
        : `Cuenta de ${cambiandoEstado.nombre} reactivada.`,
      tono: "success",
    });
    setCambiandoEstado(null);
  };

  const hayFiltros =
    busqueda.trim() !== "" || filtroRol !== "todos" || filtroEstado !== "todos";

  return (
    <div className="pb-10">
      <div className="mb-6 mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-tertiary">
            Gestión de Usuarios
          </h1>
          <p className="font-body text-ink/70">
            Administra roles, accesos y el estado de las cuentas.
          </p>
        </div>
        <p className="rounded-full bg-white px-4 py-2 font-body text-sm font-semibold text-secondary shadow-sm">
          {activos} activos · {usuarios.length} en total
        </p>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card padding="sm" className="flex items-center justify-between gap-3">
          <div>
            <p className="font-body text-xs font-bold uppercase tracking-wide text-secondary">
              Usuarios
            </p>
            <p className="font-display text-2xl font-bold text-tertiary">
              {usuarios.length}
            </p>
          </div>
          <Users size={22} className="text-tertiary/40" aria-hidden="true" />
        </Card>
        <Card padding="sm" className="flex items-center justify-between gap-3">
          <div>
            <p className="font-body text-xs font-bold uppercase tracking-wide text-secondary">
              Activos
            </p>
            <p className="font-display text-2xl font-bold text-[#155724]">
              {activos}
            </p>
          </div>
          <CheckCircle2 size={22} className="text-[#155724]/50" aria-hidden="true" />
        </Card>
        <Card padding="sm" className="flex items-center justify-between gap-3">
          <div>
            <p className="font-body text-xs font-bold uppercase tracking-wide text-secondary">
              Suspendidos
            </p>
            <p className="font-display text-2xl font-bold text-error">{suspendidos}</p>
          </div>
          <XCircle size={22} className="text-error/50" aria-hidden="true" />
        </Card>
        <Card padding="sm" className="flex items-center justify-between gap-3">
          <div>
            <p className="font-body text-xs font-bold uppercase tracking-wide text-secondary">
              Admins activos
            </p>
            <p className="font-display text-2xl font-bold text-secondary">
              {administradoresActivos}
            </p>
          </div>
          <ShieldCheck size={22} className="text-secondary/50" aria-hidden="true" />
        </Card>
      </div>

      <div className="mb-5 flex flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTROS_ROL.map(({ value, label }) => (
            <PillFiltro
              key={value}
              active={filtroRol === value}
              onClick={() => setFiltroRol(value)}
            >
              {label} ({contarRol(value)})
            </PillFiltro>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="sm:max-w-sm sm:flex-1">
            <Input
              name="busqueda"
              type="search"
              aria-label="Buscar usuarios"
              placeholder="Buscar por nombre o correo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <select
            aria-label="Filtrar por estado"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as FiltroEstado)}
            className={SELECT_CLASES}
          >
            {FILTROS_ESTADO.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {visibles.length === 0 ? (
        <EmptyState
          titulo={
            usuarios.length === 0
              ? "No hay usuarios registrados"
              : "No encontramos usuarios"
          }
          descripcion={
            usuarios.length === 0
              ? "Cuando existan cuentas aparecerán en esta tabla."
              : "Prueba con otro rol, otro estado o con otra búsqueda."
          }
          accion={
            hayFiltros ? (
              <Button variant="outline" onClick={limpiarFiltros}>
                Limpiar filtros
              </Button>
            ) : undefined
          }
          className="py-16"
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <caption className="sr-only">Usuarios del sistema</caption>
              <thead className="bg-[#f8f5f1]">
                <tr>
                  <th className={TH_CLASES}>Usuario</th>
                  <th className={TH_CLASES}>Rol</th>
                  <th className={TH_CLASES}>Estado</th>
                  <th className={`${TH_CLASES} text-right`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((usuario) => {
                  const bloqueoRol = motivoBloqueoRol(usuario);
                  const bloqueoEstado = motivoBloqueoEstado(usuario);
                  const actual = esUsuarioActual(usuario);

                  return (
                    <tr
                      key={usuario.id}
                      className="border-b border-tertiary/5 last:border-b-0 hover:bg-tertiary/5"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            aria-hidden="true"
                            className={cn(
                              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold",
                              AVATAR_ROL[usuario.rol]
                            )}
                          >
                            {iniciales(usuario.nombre)}
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="truncate font-body font-semibold text-tertiary">
                                {usuario.nombre}
                              </span>
                              {actual && (
                                <span className="rounded-full bg-primary px-2 py-0.5 font-body text-[0.65rem] font-bold uppercase tracking-wide text-tertiary">
                                  Tú
                                </span>
                              )}
                            </div>
                            <span className="block truncate font-body text-xs text-ink/60">
                              {usuario.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <EstadoBadge tono={TONO_ROL[usuario.rol]}>
                          {LABEL_ROL[usuario.rol]}
                        </EstadoBadge>
                      </td>
                      <td className="px-4 py-3">
                        <EstadoBadge tono={TONO_ESTADO_USUARIO[usuario.estado]}>
                          {LABEL_ESTADO_USUARIO[usuario.estado]}
                        </EstadoBadge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={!!bloqueoRol}
                            onClick={() => abrirEditarRol(usuario)}
                            title={bloqueoRol ?? "Editar rol"}
                            aria-label={`Editar rol de ${usuario.nombre}`}
                            className={cn(
                              ACTION_BTN,
                              "border-secondary text-secondary",
                              bloqueoRol
                                ? "cursor-not-allowed opacity-40"
                                : "hover:bg-secondary hover:text-white focus-visible:ring-secondary"
                            )}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            disabled={!!bloqueoEstado}
                            onClick={() => setCambiandoEstado(usuario)}
                            title={
                              bloqueoEstado ??
                              (usuario.estado === "activo"
                                ? "Suspender"
                                : "Reactivar")
                            }
                            aria-label={`${
                              usuario.estado === "activo"
                                ? "Suspender"
                                : "Reactivar"
                            } a ${usuario.nombre}`}
                            className={cn(
                              ACTION_BTN,
                              usuario.estado === "activo"
                                ? "border-error text-error"
                                : "border-[#155724] text-[#155724]",
                              bloqueoEstado
                                ? "cursor-not-allowed opacity-40"
                                : usuario.estado === "activo"
                                  ? "hover:bg-error hover:text-white focus-visible:ring-error"
                                  : "hover:bg-[#155724] hover:text-white focus-visible:ring-[#155724]"
                            )}
                          >
                            {usuario.estado === "activo" ? (
                              <XCircle size={16} />
                            ) : (
                              <CheckCircle2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        abierto={editando !== null}
        titulo="Editar rol"
        onCerrar={cerrarEditarRol}
      >
        {editando && (
          <div className="flex flex-col gap-4">
            <div className="rounded bg-neutral p-3">
              <p className="font-body font-semibold text-tertiary">
                {editando.nombre}
              </p>
              <p className="font-body text-sm text-ink/70">{editando.email}</p>
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 font-body text-sm font-semibold text-tertiary">
                Rol del usuario
              </legend>
              {ROLES.map(({ value, label, descripcion }) => (
                <label
                  key={value}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded border p-3 transition-colors",
                    rolSeleccionado === value
                      ? "border-secondary bg-neutral"
                      : "border-tertiary/20 hover:bg-neutral/60"
                  )}
                >
                  <input
                    type="radio"
                    name="rol"
                    value={value}
                    checked={rolSeleccionado === value}
                    onChange={() => {
                      setRolSeleccionado(value);
                      setErrorRol(null);
                    }}
                    className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-secondary"
                  />
                  <span className="min-w-0">
                    <span className="block font-body font-semibold text-tertiary">
                      {label}
                    </span>
                    <span className="block font-body text-xs text-ink/60">
                      {descripcion}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>

            {errorRol && (
              <p role="alert" className="font-body text-sm text-error">
                {errorRol}
              </p>
            )}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={cerrarEditarRol}>
                Cancelar
              </Button>
              <Button onClick={guardarRol}>Guardar rol</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        abierto={cambiandoEstado !== null}
        titulo={
          cambiandoEstado?.estado === "activo"
            ? "Suspender usuario"
            : "Reactivar usuario"
        }
        onCerrar={() => setCambiandoEstado(null)}
        size="sm"
      >
        {cambiandoEstado && (
          <div className="flex flex-col gap-4">
            <p className="font-body text-ink/80">
              {cambiandoEstado.estado === "activo" ? (
                <>
                  ¿Suspender la cuenta de{" "}
                  <strong className="text-tertiary">
                    {cambiandoEstado.nombre}
                  </strong>
                  ? No podrá acceder al sistema hasta que la reactives.
                </>
              ) : (
                <>
                  ¿Reactivar la cuenta de{" "}
                  <strong className="text-tertiary">
                    {cambiandoEstado.nombre}
                  </strong>
                  ? Volverá a tener acceso al sistema.
                </>
              )}
            </p>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setCambiandoEstado(null)}
              >
                Cancelar
              </Button>
              {cambiandoEstado.estado === "activo" ? (
                <Button
                  onClick={confirmarCambioEstado}
                  className="bg-error text-white hover:bg-error/90 focus-visible:ring-error"
                >
                  Suspender
                </Button>
              ) : (
                <Button onClick={confirmarCambioEstado}>Reactivar</Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Toast
        mensaje={aviso?.mensaje ?? null}
        tono={aviso?.tono}
        onCerrar={() => setAviso(null)}
      />
    </div>
  );
}
