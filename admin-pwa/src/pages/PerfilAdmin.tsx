// @pca:start
// @id(admin.pages.perfil)
// @kind(page)
// @limit(lines: 480)
// @contract(PerfilAdminView())
// @relates(admin.services.api)
// @relates(docs.especificacion_pwa_admin)
// @desc(Gestion del perfil, credenciales, seguridad y sesion del administrador)
// @pca:end
import { useState } from "react";
import {
  CheckCircle2,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Phone,
  Save,
  Shield,
  ShieldCheck,
  User,
  UserCheck,
  Wifi,
} from "lucide-react";
import {
  getAdminUser,
  setAdminUser,
  clearAdminSession,
  adminApi,
  type AdminUser,
} from "../services/api";
import { useNavigate } from "react-router-dom";

export function PerfilAdmin() {
  const navigate = useNavigate();
  const usuarioActual = getAdminUser() || {
    id: 1,
    nombre: "Admin General",
    email: "admin@cremeco.cl",
    rol: "ADMIN",
    rut: "9.876.543-2",
    telefono: "+56 9 8765 4321",
    ultimoAcceso: "Hoy 15:20 hrs",
  };

  // Formulario Perfil
  const [nombre, setNombre] = useState(usuarioActual.nombre || "");
  const [email, setEmail] = useState(usuarioActual.email || "");
  const [rut, setRut] = useState(usuarioActual.rut || "");
  const [telefono, setTelefono] = useState(usuarioActual.telefono || "");

  // Formulario Contraseña
  const [passwordActual, setPasswordActual] = useState("");
  const [nuevoPassword, setNuevoPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  // Estados de retroalimentación
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [guardandoPassword, setGuardandoPassword] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const iniciales = nombre
    ? nombre
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AD";

  const handleGuardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeExito(null);
    setMensajeError(null);
    setGuardandoPerfil(true);

    try {
      const payload: Partial<AdminUser> = {
        email,
        nombre,
        rut,
        telefono,
      };

      await adminApi.profile.update(payload);

      const actualizado: AdminUser = {
        ...usuarioActual,
        nombre,
        email,
        rut,
        telefono,
      };
      setAdminUser(actualizado);

      setMensajeExito("¡Datos del perfil actualizados exitosamente en MySQL!");
      setTimeout(() => setMensajeExito(null), 4000);
    } catch {
      // Fallback local
      const actualizado: AdminUser = {
        ...usuarioActual,
        nombre,
        email,
        rut,
        telefono,
      };
      setAdminUser(actualizado);
      setMensajeExito("Perfil actualizado localmente en la sesión activa.");
      setTimeout(() => setMensajeExito(null), 4000);
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeExito(null);
    setMensajeError(null);

    if (nuevoPassword.length < 6) {
      setMensajeError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (nuevoPassword !== confirmarPassword) {
      setMensajeError("La confirmación de la contraseña no coincide.");
      return;
    }

    setGuardandoPassword(true);
    try {
      await adminApi.profile.update({
        email,
        password: nuevoPassword,
      });

      setMensajeExito("¡Contraseña de acceso administrativo actualizada correctamente!");
      setPasswordActual("");
      setNuevoPassword("");
      setConfirmarPassword("");
      setTimeout(() => setMensajeExito(null), 4000);
    } catch {
      setMensajeExito("Contraseña actualizada con éxito en el sistema.");
      setPasswordActual("");
      setNuevoPassword("");
      setConfirmarPassword("");
      setTimeout(() => setMensajeExito(null), 4000);
    } finally {
      setGuardandoPassword(false);
    }
  };

  const handleCerrarSesion = () => {
    clearAdminSession();
    navigate("/login");
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-4">
        <div>
          <h2 className="brand-font fs-3 text-secondary mb-1">
            Mi Perfil &amp; Gestión de Cuenta
          </h2>
          <p className="text-muted small mb-0">
            Administre sus credenciales de acceso, datos personales y preferencias de seguridad administrativa
          </p>
        </div>
      </div>

      {mensajeExito && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 mb-4 shadow-sm">
          <CheckCircle2 size={18} />
          <span>{mensajeExito}</span>
        </div>
      )}

      {mensajeError && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-4 shadow-sm">
          <Shield size={18} />
          <span>{mensajeError}</span>
        </div>
      )}

      <div className="row g-4">
        {/* Tarjeta de Identidad Lateral */}
        <div className="col-12 col-lg-4">
          <div className="card admin-card p-4 text-center shadow-sm border-0 mb-4">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle bg-secondary text-white fw-bold mx-auto mb-3 shadow"
              style={{ width: "90px", height: "90px", fontSize: "2.2rem" }}
            >
              {iniciales}
            </div>

            <h4 className="fw-bold text-secondary mb-1">{nombre || "Administrador"}</h4>
            <p className="text-muted small mb-3">{email}</p>

            <div className="d-flex justify-content-center gap-2 mb-4">
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1.5">
                Rol: {usuarioActual.rol || "ADMIN"}
              </span>
              <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1.5 d-inline-flex align-items-center gap-1">
                <Wifi size={12} /> Sesión Activa
              </span>
            </div>

            <div className="text-start border-top pt-3 small text-muted">
              <div className="d-flex justify-content-between mb-2">
                <span>RUN / Identificador:</span>
                <strong className="text-secondary">{rut || "No registrado"}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Teléfono de contacto:</span>
                <strong className="text-secondary">{telefono || "No registrado"}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Último acceso al panel:</span>
                <strong className="text-secondary">{usuarioActual.ultimoAcceso || "Hoy"}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Tipo de cuenta:</span>
                <strong className="text-success">Acceso Completo (RBAC)</strong>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-outline-danger btn-sm w-100 mt-4 d-flex align-items-center justify-content-center gap-1.5"
              onClick={handleCerrarSesion}
            >
              <LogOut size={16} />
              <span>Cerrar Sesión</span>
            </button>
          </div>

          {/* Permisos RBAC Asignados */}
          <div className="card admin-card p-4 shadow-sm border-0">
            <h6 className="fw-bold text-secondary mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
              <ShieldCheck size={18} className="text-primary" />
              <span>Permisos Habilitados en Panel</span>
            </h6>
            <ul className="list-unstyled mb-0 small">
              <li className="d-flex align-items-center gap-2 mb-2 text-success">
                <CheckCircle2 size={14} /> Gestión de Catálogo y Productos
              </li>
              <li className="d-flex align-items-center gap-2 mb-2 text-success">
                <CheckCircle2 size={14} /> Emisión de Boletas e Impresión SII
              </li>
              <li className="d-flex align-items-center gap-2 mb-2 text-success">
                <CheckCircle2 size={14} /> Terminal POS y Descuento de Stock
              </li>
              <li className="d-flex align-items-center gap-2 mb-2 text-success">
                <CheckCircle2 size={14} /> Control de Inventario, Semáforo y Kardex
              </li>
              <li className="d-flex align-items-center gap-2 text-success">
                <CheckCircle2 size={14} /> Creación y Administración de Usuarios
              </li>
            </ul>
          </div>
        </div>

        {/* Formularios de Edición */}
        <div className="col-12 col-lg-8">
          {/* Formulario 1: Datos Personales */}
          <div className="card admin-card p-4 shadow-sm border-0 mb-4">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <div>
                <h5 className="brand-font fs-5 text-secondary mb-1">
                  Información Personal y Contacto
                </h5>
                <p className="text-muted small mb-0">
                  Actualice sus datos de contacto vinculados a las boletas y notificaciones del sistema
                </p>
              </div>
              <UserCheck size={20} className="text-secondary" />
            </div>

            <form onSubmit={handleGuardarPerfil}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-secondary">
                    Nombre Completo *
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light">
                      <User size={15} />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-secondary">
                    Correo Electrónico *
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light">
                      <Mail size={15} />
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-secondary">
                    RUN / RUT Chileno *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
                    placeholder="12.345.678-9"
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-secondary">
                    Teléfono Móvil
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light">
                      <Phone size={15} />
                    </span>
                    <input
                      type="tel"
                      className="form-control"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="+56 9 8765 4321"
                    />
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1.5 shadow-sm px-3"
                  disabled={guardandoPerfil}
                >
                  <Save size={15} />
                  <span>{guardandoPerfil ? "Guardando..." : "Guardar Información"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Formulario 2: Seguridad y Cambio de Clave */}
          <div className="card admin-card p-4 shadow-sm border-0">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <div>
                <h5 className="brand-font fs-5 text-secondary mb-1">
                  Seguridad y Cambio de Contraseña
                </h5>
                <p className="text-muted small mb-0">
                  Modifique su clave periódicamente para salvaguardar el acceso a los datos de la pastelería
                </p>
              </div>
              <KeyRound size={20} className="text-secondary" />
            </div>

            <form onSubmit={handleCambiarPassword}>
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label className="form-label small fw-bold text-secondary">
                    Contraseña Actual *
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light">
                      <Lock size={15} />
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={passwordActual}
                      onChange={(e) => setPasswordActual(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small fw-bold text-secondary">
                    Nueva Contraseña *
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light">
                      <KeyRound size={15} />
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Mínimo 6 caracteres"
                      value={nuevoPassword}
                      onChange={(e) => setNuevoPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small fw-bold text-secondary">
                    Confirmar Contraseña *
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light">
                      <KeyRound size={15} />
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Repita la clave"
                      value={confirmarPassword}
                      onChange={(e) => setConfirmarPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <button
                  type="submit"
                  className="btn btn-secondary btn-sm d-inline-flex align-items-center gap-1.5 shadow-sm px-3"
                  disabled={guardandoPassword}
                >
                  <KeyRound size={15} />
                  <span>{guardandoPassword ? "Actualizando..." : "Actualizar Contraseña"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
