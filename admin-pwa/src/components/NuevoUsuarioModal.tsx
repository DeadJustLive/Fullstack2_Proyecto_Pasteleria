// @pca:start
// @id(admin.components.nuevoUsuarioModal)
// @kind(component)
// @limit(lines: 250)
// @contract(NuevoUsuarioModalProps)
// @relates(admin.lib.validators)
// @relates(admin.services.api)
// @desc(Modal reactivo de creacion de nuevo usuario administrativo)
// @pca:end
import React, { useState } from "react";
import { UserPlus, X, AlertCircle } from "lucide-react";
import { validarUsuarioAdmin, formatearRut } from "../lib/validators";
import { adminApi, type AdminUser } from "../services/api";

export interface NuevoUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (nuevo: AdminUser) => void;
}

export const NuevoUsuarioModal: React.FC<NuevoUsuarioModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rut, setRut] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rol, setRol] = useState<string>("CLIENTE");
  const [estado, setEstado] = useState<string>("Activo");
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRut(e.target.value);
    if (errores.rut) {
      setErrores((prev) => {
        const next = { ...prev };
        delete next.rut;
        return next;
      });
    }
  };

  const handleRutBlur = () => {
    if (rut.trim()) {
      setRut(formatearRut(rut.trim()));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validacion = validarUsuarioAdmin({ nombre, email, rut, rol });
    if (!validacion.valido) {
      setErrores(validacion.errores);
      return;
    }

    setIsSubmitting(true);
    setErrores({});
    try {
      const nuevo = await adminApi.users.create({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        rut: rut.trim(),
        telefono: telefono.trim(),
        rol,
        estado,
      });
      onCreated(nuevo);
      onClose();
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : "Error al registrar usuario";
      setErrores({ general: mensaje });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} onClick={onClose} />
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        style={{ zIndex: 1055 }}
        onClick={onClose}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content admin-card border-0 shadow-lg">
            <div className="modal-header bg-light border-bottom px-4 py-3 align-items-center">
              <div className="d-flex align-items-center gap-2">
                <UserPlus className="text-primary" size={20} />
                <h5 className="modal-title brand-font fs-5 text-secondary mb-0">
                  Registrar Nuevo Usuario
                </h5>
              </div>
              <button
                type="button"
                className="btn-close"
                aria-label="Cerrar"
                onClick={onClose}
                disabled={isSubmitting}
              />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body p-4 bg-white">
                {errores.general && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small mb-3">
                    <AlertCircle size={16} />
                    <span>{errores.general}</span>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">
                    Nombre Completo <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control form-control-sm ${errores.nombre ? "is-invalid" : ""}`}
                    placeholder="Ej: Sofía Valenzuela"
                    value={nombre}
                    onChange={(e) => {
                      setNombre(e.target.value);
                      if (errores.nombre) setErrores((prev) => ({ ...prev, nombre: "" }));
                    }}
                    required
                  />
                  {errores.nombre && <div className="invalid-feedback small">{errores.nombre}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">
                    Correo Electrónico <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-control form-control-sm ${errores.email ? "is-invalid" : ""}`}
                    placeholder="sofia@cremeco.cl o usuario@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errores.email) setErrores((prev) => ({ ...prev, email: "" }));
                    }}
                    required
                  />
                  {errores.email && <div className="invalid-feedback small">{errores.email}</div>}
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold text-secondary">
                      RUN Chileno (Módulo 11) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-sm ${errores.rut ? "is-invalid" : ""}`}
                      placeholder="12.345.678-K"
                      value={rut}
                      onChange={handleRutChange}
                      onBlur={handleRutBlur}
                      required
                    />
                    {errores.rut && <div className="invalid-feedback small">{errores.rut}</div>}
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold text-secondary">
                      Teléfono Móvil
                    </label>
                    <input
                      type="tel"
                      className="form-control form-control-sm"
                      placeholder="+56 9 1234 5678"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                    />
                  </div>
                </div>

                <div className="row g-2">
                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold text-secondary">
                      Rol Asignado <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select form-select-sm ${errores.rol ? "is-invalid" : ""}`}
                      value={rol}
                      onChange={(e) => setRol(e.target.value)}
                    >
                      <option value="CLIENTE">CLIENTE</option>
                      <option value="REPARTIDOR">REPARTIDOR</option>
                      <option value="PASTELERO">PASTELERO</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                    {errores.rol && <div className="invalid-feedback small">{errores.rol}</div>}
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold text-secondary">
                      Estado Inicial <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select form-select-sm"
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                    >
                      <option value="Activo">Activo (Habilitado)</option>
                      <option value="Inactivo">Inactivo (Suspendido)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light border-top px-4 py-2.5">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  <X size={14} className="me-1" />
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Guardando..." : "Crear Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
