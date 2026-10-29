// @pca:start
// @id(admin.pages.usuarios)
// @kind(page)
// @limit(lines: 300)
// @contract(UsuariosAdminView())
// @relates(admin.lib.validators)
// @relates(docs.especificacion_pwa_admin)
// @desc(Gestion de usuarios, roles RBAC y consulta de historial de compras)
// @pca:end
import { useState } from "react";
import { Check, Lock, Search, Shield } from "lucide-react";

type RolUsuario = "ADMIN_GENERAL" | "JEFE_COCINA" | "CAJERO_MOSTRADOR" | "CLIENTE";

interface UsuarioAdmin {
  id: number;
  nombre: string;
  email: string;
  rol: RolUsuario;
  ultimoAcceso: string;
  activo: boolean;
}

const USUARIOS_INICIALES: UsuarioAdmin[] = [
  { id: 1, nombre: "Anaís González", email: "anais.gonzalez@cremeco.cl", rol: "ADMIN_GENERAL", ultimoAcceso: "Hoy 14:15", activo: true },
  { id: 2, nombre: "Carlos Pastelería", email: "carlos.cocina@cremeco.cl", rol: "JEFE_COCINA", ultimoAcceso: "Hoy 11:30", activo: true },
  { id: 3, nombre: "Valentina Henríquez", email: "valentina.caja@cremeco.cl", rol: "CAJERO_MOSTRADOR", ultimoAcceso: "Ayer 19:40", activo: true },
  { id: 4, nombre: "Nicolás Retamal", email: "nicolas.cliente@gmail.com", rol: "CLIENTE", ultimoAcceso: "2026-10-22", activo: true },
];

const MATRIZ_PERMISOS = [
  { modulo: "Dashboard & Reportes", desc: "Ver recaudación diaria, tickets y rankings", roles: ["ADMIN_GENERAL", "JEFE_COCINA"] },
  { modulo: "Catálogo & Precios", desc: "Crear tortas, cambiar precios y pausar web", roles: ["ADMIN_GENERAL", "JEFE_COCINA"] },
  { modulo: "KDS Pantalla de Cocina", desc: "Avanzar estados y ver recetas de tortas", roles: ["ADMIN_GENERAL", "JEFE_COCINA"] },
  { modulo: "Control de Inventario", desc: "Ajustar existencias físicas y registrar pérdidas", roles: ["ADMIN_GENERAL", "JEFE_COCINA"] },
  { modulo: "Punto de Venta POS", desc: "Cobro de tickets en mostrador y arqueo de caja", roles: ["ADMIN_GENERAL", "CAJERO_MOSTRADOR"] },
  { modulo: "Usuarios & Roles RBAC", desc: "Designar roles, cambiar accesos y auditoría", roles: ["ADMIN_GENERAL"] },
];

export function Usuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>(USUARIOS_INICIALES);
  const [busqueda, setBusqueda] = useState("");
  const [tabActivo, setTabActivo] = useState<"usuarios" | "matriz">("usuarios");
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioAdmin | null>(null);
  const [nuevoRol, setNuevoRol] = useState<RolUsuario>("CLIENTE");

  const filtrados = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  function guardarRol() {
    if (!usuarioEditando) return;
    setUsuarios((prev) =>
      prev.map((u) => (u.id === usuarioEditando.id ? { ...u, rol: nuevoRol } : u))
    );
    setUsuarioEditando(null);
  }

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="brand-font fs-3 text-secondary mb-1">
            Usuarios &amp; Control de Acceso (RBAC)
          </h2>
          <p className="text-muted small mb-0">
            Administra cuentas de personal, asignación de roles y permisos con React + Bootstrap 5.
          </p>
        </div>

        <ul className="nav nav-pills bg-white border p-1 rounded-pill small">
          <li className="nav-item">
            <button
              type="button"
              onClick={() => setTabActivo("usuarios")}
              className={`nav-link rounded-pill py-1.5 px-3 fw-bold ${
                tabActivo === "usuarios" ? "active bg-secondary text-white" : "text-secondary"
              }`}
            >
              Usuarios Registrados
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              onClick={() => setTabActivo("matriz")}
              className={`nav-link rounded-pill py-1.5 px-3 fw-bold ${
                tabActivo === "matriz" ? "active bg-secondary text-white" : "text-secondary"
              }`}
            >
              Matriz de Permisos RBAC
            </button>
          </li>
        </ul>
      </div>

      {tabActivo === "usuarios" ? (
        <>
          <div className="card admin-card p-3 mb-4">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control border-start-0 bg-light"
                placeholder="Buscar usuario por nombre o correo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          <div className="card admin-card overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover admin-table align-middle mb-0">
                <thead>
                  <tr>
                    <th className="ps-4">Usuario</th>
                    <th>Rol Asignado</th>
                    <th>Último Acceso</th>
                    <th>Estado</th>
                    <th className="text-end pe-4">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((u) => (
                    <tr key={u.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="d-flex align-items-center justify-content-center rounded-circle bg-secondary text-white fw-bold small"
                            style={{ width: "36px", height: "36px" }}
                          >
                            {u.nombre.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-bold text-secondary">{u.nombre}</div>
                            <div className="text-muted small">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle d-inline-flex align-items-center gap-1">
                          <Shield size={12} />
                          {u.rol.replace("_", " ")}
                        </span>
                      </td>
                      <td className="small text-muted">{u.ultimoAcceso}</td>
                      <td>
                        <span className={`badge ${u.activo ? "bg-success" : "bg-secondary"}`}>
                          {u.activo ? "Activo" : "Bloqueado"}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button
                          type="button"
                          onClick={() => {
                            setUsuarioEditando(u);
                            setNuevoRol(u.rol);
                          }}
                          className="btn btn-sm btn-outline-secondary"
                        >
                          Designar Rol
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="card admin-card p-4">
          <div className="mb-3">
            <h4 className="brand-font fs-5 text-secondary mb-1">
              Matriz de Privilegios por Perfil
            </h4>
            <span className="text-muted small">
              Reglas de acceso aplicadas a endpoints en Spring Boot y vistas PWA
            </span>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-hover admin-table align-middle text-center small mb-0">
              <thead>
                <tr>
                  <th className="text-start ps-3">Módulo Funcional</th>
                  <th className="text-start">Descripción</th>
                  <th>Admin General</th>
                  <th>Jefe Cocina</th>
                  <th>Cajero Mostrador</th>
                  <th>Cliente</th>
                </tr>
              </thead>
              <tbody>
                {MATRIZ_PERMISOS.map((p) => (
                  <tr key={p.modulo}>
                    <td className="text-start ps-3 fw-bold text-secondary">{p.modulo}</td>
                    <td className="text-start text-muted">{p.desc}</td>
                    <td><Check className="text-success mx-auto" size={18} /></td>
                    <td>
                      {p.roles.includes("JEFE_COCINA") ? (
                        <Check className="text-success mx-auto" size={18} />
                      ) : (
                        <Lock className="text-muted opacity-50 mx-auto" size={14} />
                      )}
                    </td>
                    <td>
                      {p.roles.includes("CAJERO_MOSTRADOR") ? (
                        <Check className="text-success mx-auto" size={18} />
                      ) : (
                        <Lock className="text-muted opacity-50 mx-auto" size={14} />
                      )}
                    </td>
                    <td><Lock className="text-muted opacity-50 mx-auto" size={14} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Designar Rol */}
      {usuarioEditando && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setUsuarioEditando(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content admin-modal-content">
              <div className="modal-header admin-modal-header">
                <h5 className="modal-title brand-font fs-5 text-secondary">
                  Designar Rol de Acceso
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setUsuarioEditando(null)}
                />
              </div>
              <div className="modal-body p-4">
                <p className="small text-secondary mb-3">
                  Selecciona el rol para <strong>{usuarioEditando.nombre}</strong>:
                </p>
                <div className="d-flex flex-column gap-2">
                  {(["ADMIN_GENERAL", "JEFE_COCINA", "CAJERO_MOSTRADOR", "CLIENTE"] as RolUsuario[]).map(
                    (rol) => (
                      <label
                        key={rol}
                        className={`p-3 border rounded-3 d-flex align-items-center justify-content-between ${
                          nuevoRol === rol ? "border-primary bg-light" : ""
                        }`}
                        style={{ cursor: "pointer" }}
                      >
                        <div>
                          <div className="fw-bold text-secondary small">{rol.replace("_", " ")}</div>
                        </div>
                        <input
                          type="radio"
                          name="rolSelect"
                          className="form-check-input"
                          checked={nuevoRol === rol}
                          onChange={() => setNuevoRol(rol)}
                        />
                      </label>
                    )
                  )}
                </div>
              </div>
              <div className="modal-footer border-top bg-light">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setUsuarioEditando(null)}
                >
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary" onClick={guardarRol}>
                  Guardar Asignación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
