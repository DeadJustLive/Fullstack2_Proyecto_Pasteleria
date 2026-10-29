// @pca:start
// @id(admin.components.editarUsuarioModal)
// @kind(component)
// @limit(lines: 250)
// @contract(EditarUsuarioModalProps)
// @relates(admin.services.api)
// @desc(Modal para editar rol, estado y contacto de un usuario)
// @pca:end
import React, { useState, useEffect } from "react";
import { Edit3, X, AlertCircle } from "lucide-react";
import { adminApi, type AdminUser } from "../services/api";

export interface EditarUsuarioModalProps {
  usuario: AdminUser | null;
  onClose: () => void;
  onUpdated: (actualizado: AdminUser) => void;
}

export const EditarUsuarioModal: React.FC<EditarUsuarioModalProps> = ({
  usuario,
  onClose,
  onUpdated,
}) => {
  const [telefono, setTelefono] = useState("");
  const [rol, setRol] = useState("CLIENTE");
  const [estado, setEstado] = useState("Activo");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (usuario) {
      setTelefono(usuario.telefono || "");
      setRol(usuario.rol || "CLIENTE");
      setEstado(usuario.estado || "Activo");
      setError(null);
    }
  }, [usuario]);

  if (!usuario) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const actualizado = await adminApi.users.update(usuario.id, {
        telefono: telefono.trim(),
        rol,
        estado,
      });
      onUpdated(actualizado);
      onClose();
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : "Error al actualizar usuario";
      setError(mensaje);
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
                <Edit3 className="text-primary" size={20} />
                <h5 className="modal-title brand-font fs-5 text-secondary mb-0">
                  Editar Perfil de Usuario
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
                {error && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small mb-3">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">
                    Usuario
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm bg-light"
                    value={`${usuario.nombre} (${usuario.email})`}
                    disabled
                  />
                  {usuario.rut && (
                    <span className="text-muted small mt-1 d-block font-monospace">
                      RUN: {usuario.rut}
                    </span>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="tel"
                    className="form-control form-control-sm"
                    placeholder="+56 9 1234 5678"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                  />
                </div>

                <div className="row g-2">
                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold text-secondary">
                      Rol Asignado
                    </label>
                    <select
                      className="form-select form-select-sm"
                      value={rol}
                      onChange={(e) => setRol(e.target.value)}
                    >
                      <option value="CLIENTE">CLIENTE</option>
                      <option value="REPARTIDOR">REPARTIDOR</option>
                      <option value="PASTELERO">PASTELERO</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold text-secondary">
                      Estado de la Cuenta
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
                  {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
