// @pca:start
// @id(admin.pages.usuarios)
// @kind(page)
// @limit(lines: 300)
// @contract(UsuariosAdminView())
// @relates(admin.lib.validators)
// @relates(docs.especificacion_pwa_admin)
// @desc(Gestion de usuarios, roles RBAC y consulta de historial de compras)
// @pca:end
import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, UserPlus, CheckCircle2, AlertCircle, RefreshCw, Shield, Eye, Edit3, ShoppingBag } from "lucide-react";
import { adminApi, type AdminUser, type OrderAdmin } from "../services/api";
import { NuevoUsuarioModal } from "../components/NuevoUsuarioModal";
import { FichaUsuarioModal } from "../components/FichaUsuarioModal";
import { EditarUsuarioModal } from "../components/EditarUsuarioModal";
import { HistorialComprasModal } from "../components/HistorialComprasModal";
import { BoletaModal } from "../components/BoletaModal";
import { MatrizPermisos } from "../components/MatrizPermisos";

export function Usuarios() {
  const [usuarios, setUsuarios] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [tabActivo, setTabActivo] = useState<"usuarios" | "matriz">("usuarios");
  const [notificacion, setNotificacion] = useState<{ tipo: "success" | "warning"; mensaje: string } | null>(null);

  // Estados de Modales
  const [modalNuevoOpen, setModalNuevoOpen] = useState(false);
  const [usuarioParaFicha, setUsuarioParaFicha] = useState<AdminUser | null>(null);
  const [usuarioParaEditar, setUsuarioParaEditar] = useState<AdminUser | null>(null);
  const [usuarioParaHistorial, setUsuarioParaHistorial] = useState<AdminUser | null>(null);
  const [ordenParaBoleta, setOrdenParaBoleta] = useState<OrderAdmin | null>(null);

  const cargarUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.users.list();
      setUsuarios(data);
    } catch {
      setNotificacion({ tipo: "warning", mensaje: "Carga en modo local offline resiliente." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const mostrarNotif = (tipo: "success" | "warning", mensaje: string) => {
    setNotificacion({ tipo, mensaje });
    setTimeout(() => setNotificacion(null), 3500);
  };

  const usuariosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return usuarios.filter((u) => {
      const matchTexto =
        !q ||
        u.nombre.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.rut && u.rut.toLowerCase().includes(q));
      const matchRol = !filtroRol || u.rol.toUpperCase() === filtroRol.toUpperCase();
      return matchTexto && matchRol;
    });
  }, [usuarios, busqueda, filtroRol]);

  const getRoleBadgeClass = (rol: string) => {
    switch (rol?.toUpperCase()) {
      case "ADMIN":
      case "ADMIN_GENERAL":
        return "bg-danger-subtle text-danger border-danger-subtle";
      case "PASTELERO":
      case "JEFE_COCINA":
        return "bg-warning-subtle text-warning-emphasis border-warning-subtle";
      case "REPARTIDOR":
        return "bg-success-subtle text-success border-success-subtle";
      default:
        return "bg-primary-subtle text-primary border-primary-subtle";
    }
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="brand-font fs-3 text-secondary mb-1">Usuarios &amp; Control de Acceso (RBAC)</h2>
          <p className="text-muted small mb-0">Administración de cuentas, roles del sistema e historial de compras con boletas DSY1104.</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button type="button" className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1 shadow-sm" onClick={cargarUsuarios} disabled={loading}>
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Sincronizar</span>
          </button>
          <button type="button" className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1 shadow-sm" onClick={() => setModalNuevoOpen(true)}>
            <UserPlus size={15} />
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {notificacion && (
        <div className={`alert ${notificacion.tipo === "success" ? "alert-success" : "alert-warning"} alert-dismissible fade show d-flex align-items-center gap-2 py-2 mb-3`}>
          {notificacion.tipo === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <div className="small fw-semibold">{notificacion.mensaje}</div>
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setNotificacion(null)} />
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-pills bg-white border p-1 rounded-pill small mb-4 d-inline-flex">
        <li className="nav-item">
          <button type="button" onClick={() => setTabActivo("usuarios")} className={`nav-link rounded-pill py-1.5 px-3 fw-bold ${tabActivo === "usuarios" ? "active bg-secondary text-white" : "text-secondary"}`}>
            Usuarios Registrados ({usuarios.length})
          </button>
        </li>
        <li className="nav-item">
          <button type="button" onClick={() => setTabActivo("matriz")} className={`nav-link rounded-pill py-1.5 px-3 fw-bold ${tabActivo === "matriz" ? "active bg-secondary text-white" : "text-secondary"}`}>
            Matriz de Permisos RBAC
          </button>
        </li>
      </ul>

      {tabActivo === "usuarios" ? (
        <>
          <div className="card admin-card p-3 mb-4">
            <div className="row g-2 align-items-center">
              <div className="col-12 col-md-8">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted"><Search size={16} /></span>
                  <input type="text" className="form-control border-start-0 bg-light" placeholder="Buscar usuario por nombre, correo o RUN..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                </div>
              </div>
              <div className="col-12 col-md-4">
                <select className="form-select bg-light" value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
                  <option value="">Todos los roles</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="PASTELERO">PASTELERO</option>
                  <option value="REPARTIDOR">REPARTIDOR</option>
                  <option value="CLIENTE">CLIENTE</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card admin-card overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover admin-table align-middle mb-0">
                <thead>
                  <tr>
                    <th className="ps-4">ID</th>
                    <th>Usuario</th>
                    <th>RUN Chileno</th>
                    <th>Rol Asignado</th>
                    <th>Estado</th>
                    <th className="text-end pe-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-4 text-muted small">No se encontraron usuarios coincidentes.</td></tr>
                  ) : (
                    usuariosFiltrados.map((u) => (
                      <tr key={u.id}>
                        <td className="ps-4 fw-bold text-muted small">#{u.id}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2.5">
                            <div className="d-flex align-items-center justify-content-center rounded-circle bg-secondary text-white fw-bold small flex-shrink-0" style={{ width: "36px", height: "36px" }}>
                              {u.nombre.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="fw-bold text-secondary">{u.nombre}</div>
                              <div className="text-muted small">{u.email}</div>
                              {u.telefono && <div className="text-muted small" style={{ fontSize: "0.75rem" }}>{u.telefono}</div>}
                            </div>
                          </div>
                        </td>
                        <td><span className="font-monospace small text-secondary">{u.rut || "Sin RUN"}</span></td>
                        <td>
                          <span className={`badge border ${getRoleBadgeClass(u.rol)} px-2.5 py-1 d-inline-flex align-items-center gap-1`}>
                            <Shield size={12} />
                            {u.rol}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${u.estado === "Inactivo" ? "bg-secondary" : "bg-success"} px-2 py-1`}>
                            {u.estado || "Activo"}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <div className="d-inline-flex gap-1">
                            <button type="button" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1" title="Ver Ficha" onClick={() => setUsuarioParaFicha(u)}>
                              <Eye size={13} /><span className="d-none d-md-inline">Ficha</span>
                            </button>
                            <button type="button" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1" title="Editar Perfil" onClick={() => setUsuarioParaEditar(u)}>
                              <Edit3 size={13} /><span className="d-none d-md-inline">Editar</span>
                            </button>
                            <button type="button" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1" title="Historial Compras" onClick={() => setUsuarioParaHistorial(u)}>
                              <ShoppingBag size={13} /><span className="d-none d-md-inline">Compras</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <MatrizPermisos />
      )}

      {/* Modales */}
      <NuevoUsuarioModal
        isOpen={modalNuevoOpen}
        onClose={() => setModalNuevoOpen(false)}
        onCreated={(nuevo) => {
          setUsuarios((prev) => [nuevo, ...prev]);
          mostrarNotif("success", `Usuario "${nuevo.nombre}" creado exitosamente.`);
        }}
      />

      <FichaUsuarioModal
        usuario={usuarioParaFicha}
        onClose={() => setUsuarioParaFicha(null)}
        onVerHistorial={(u) => setUsuarioParaHistorial(u)}
      />

      <EditarUsuarioModal
        usuario={usuarioParaEditar}
        onClose={() => setUsuarioParaEditar(null)}
        onUpdated={(actualizado) => {
          setUsuarios((prev) => prev.map((u) => (u.id === actualizado.id ? { ...u, ...actualizado } : u)));
          mostrarNotif("success", `Usuario "${actualizado.nombre}" actualizado.`);
        }}
      />

      <HistorialComprasModal
        usuario={usuarioParaHistorial}
        onClose={() => setUsuarioParaHistorial(null)}
        onVerBoleta={(orden) => setOrdenParaBoleta(orden)}
      />

      <BoletaModal
        orden={ordenParaBoleta}
        onClose={() => setOrdenParaBoleta(null)}
      />
    </div>
  );
}
