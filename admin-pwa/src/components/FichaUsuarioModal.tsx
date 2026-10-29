// @pca:start
// @id(admin.components.fichaUsuarioModal)
// @kind(component)
// @limit(lines: 250)
// @contract(FichaUsuarioModalProps)
// @relates(admin.services.api)
// @desc(Modal con la ficha tecnica y resumen de actividad comercial del usuario)
// @pca:end
import React, { useState, useEffect } from "react";
import { UserCheck, Shield, ShoppingBag, Calendar, Phone, Mail, Award, X } from "lucide-react";
import { adminApi, type AdminUser, type OrderAdmin } from "../services/api";

export interface FichaUsuarioModalProps {
  usuario: AdminUser | null;
  onClose: () => void;
  onVerHistorial: (usuario: AdminUser) => void;
}

export const FichaUsuarioModal: React.FC<FichaUsuarioModalProps> = ({
  usuario,
  onClose,
  onVerHistorial,
}) => {
  const [compras, setCompras] = useState<OrderAdmin[]>([]);
  const [loadingCompras, setLoadingCompras] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    let isMounted = true;
    setLoadingCompras(true);
    adminApi.orders
      .getByUser({ email: usuario.email, clienteId: usuario.id })
      .then((data) => {
        if (isMounted) setCompras(data);
      })
      .catch(() => {
        if (isMounted) setCompras([]);
      })
      .finally(() => {
        if (isMounted) setLoadingCompras(false);
      });

    return () => {
      isMounted = false;
    };
  }, [usuario]);

  if (!usuario) return null;

  const totalGastado = compras.reduce((acc, c) => acc + (c.total || 0), 0);
  const ticketPromedio = compras.length > 0 ? Math.round(totalGastado / compras.length) : 0;
  const formatCLP = (m: number) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(m);

  const getInitials = (n: string) =>
    n
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const getRoleBadgeClass = (r: string) => {
    switch (r.toUpperCase()) {
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
          className="modal-dialog modal-dialog-centered modal-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content admin-card border-0 shadow-lg">
            <div className="modal-header bg-light border-bottom px-4 py-3 align-items-center">
              <div className="d-flex align-items-center gap-2">
                <UserCheck className="text-primary" size={22} />
                <h5 className="modal-title brand-font fs-5 text-secondary mb-0">
                  Ficha Completa de Usuario
                </h5>
              </div>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose} />
            </div>

            <div className="modal-body p-4 bg-white">
              {/* Header de Usuario */}
              <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 pb-3 mb-3 border-bottom">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle bg-secondary text-white fw-bold shadow-sm"
                    style={{ width: "52px", height: "52px", fontSize: "1.2rem" }}
                  >
                    {getInitials(usuario.nombre)}
                  </div>
                  <div>
                    <h4 className="brand-font fs-5 text-secondary mb-0 fw-bold">{usuario.nombre}</h4>
                    <div className="text-muted small d-flex align-items-center gap-1">
                      <Mail size={13} />
                      {usuario.email}
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-2 align-items-center">
                  <span className={`badge border ${getRoleBadgeClass(usuario.rol)} px-2.5 py-1.5`}>
                    <Shield size={12} className="me-1" />
                    {usuario.rol}
                  </span>
                  <span
                    className={`badge ${
                      usuario.estado === "Activo" ? "bg-success" : "bg-secondary"
                    } px-2.5 py-1.5`}
                  >
                    {usuario.estado || "Activo"}
                  </span>
                </div>
              </div>

              {/* Estadísticas de Compras y Actividad */}
              <h6 className="text-uppercase text-muted fw-bold small mb-2 d-flex align-items-center gap-1.5">
                <Award size={14} className="text-primary" />
                Estadísticas de Actividad Comercial
              </h6>
              <div className="row g-3 mb-4">
                <div className="col-12 col-sm-4">
                  <div className="card bg-light border p-3 text-center h-100">
                    <span className="text-muted small text-uppercase">Total Compras</span>
                    <span className="brand-font fs-4 fw-bold text-primary mt-1">
                      {loadingCompras ? "..." : formatCLP(totalGastado)}
                    </span>
                  </div>
                </div>
                <div className="col-12 col-sm-4">
                  <div className="card bg-light border p-3 text-center h-100">
                    <span className="text-muted small text-uppercase">Pedidos Registrados</span>
                    <span className="brand-font fs-4 fw-bold text-secondary mt-1">
                      {loadingCompras ? "..." : compras.length}
                    </span>
                  </div>
                </div>
                <div className="col-12 col-sm-4">
                  <div className="card bg-light border p-3 text-center h-100">
                    <span className="text-muted small text-uppercase">Ticket Promedio</span>
                    <span className="brand-font fs-4 fw-bold text-secondary mt-1">
                      {loadingCompras ? "..." : formatCLP(ticketPromedio)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detalle de Identificación */}
              <div className="card bg-light border-0 p-3">
                <div className="row g-3 small">
                  <div className="col-12 col-sm-6">
                    <span className="text-muted d-block">RUN Chileno Oficial:</span>
                    <strong className="text-secondary font-monospace">
                      {usuario.rut || "Sin registrar"}
                    </strong>
                  </div>
                  <div className="col-12 col-sm-6">
                    <span className="text-muted d-block">Teléfono de Contacto:</span>
                    <strong className="text-secondary d-flex align-items-center gap-1">
                      <Phone size={13} className="text-muted" />
                      {usuario.telefono || "No especificado"}
                    </strong>
                  </div>
                  <div className="col-12 col-sm-6">
                    <span className="text-muted d-block">Fecha de Registro:</span>
                    <strong className="text-secondary d-flex align-items-center gap-1">
                      <Calendar size={13} className="text-muted" />
                      {usuario.fechaRegistro || "2026-01-10"}
                    </strong>
                  </div>
                  <div className="col-12 col-sm-6">
                    <span className="text-muted d-block">Último Acceso Registrado:</span>
                    <strong className="text-secondary">
                      {usuario.ultimoAcceso || "Hoy"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light border-top px-4 py-2.5 d-flex justify-content-between">
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>
                <X size={14} className="me-1" />
                Cerrar
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1.5"
                onClick={() => {
                  onClose();
                  onVerHistorial(usuario);
                }}
              >
                <ShoppingBag size={14} />
                Ver Historial de Compras ({compras.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
