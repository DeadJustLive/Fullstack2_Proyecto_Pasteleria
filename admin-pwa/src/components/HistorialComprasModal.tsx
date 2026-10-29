// @pca:start
// @id(admin.components.historialComprasModal)
// @kind(component)
// @limit(lines: 250)
// @contract(HistorialComprasModalProps)
// @relates(admin.services.api)
// @relates(admin.components.boletaModal)
// @desc(Modal para listar las compras del usuario y acceder a sus boletas)
// @pca:end
import React, { useState, useEffect } from "react";
import { ShoppingBag, Receipt, X, RefreshCw, AlertCircle } from "lucide-react";
import { adminApi, type AdminUser, type OrderAdmin } from "../services/api";

export interface HistorialComprasModalProps {
  usuario: AdminUser | null;
  onClose: () => void;
  onVerBoleta: (orden: OrderAdmin) => void;
}

export const HistorialComprasModal: React.FC<HistorialComprasModalProps> = ({
  usuario,
  onClose,
  onVerBoleta,
}) => {
  const [ordenes, setOrdenes] = useState<OrderAdmin[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    let isMounted = true;
    setLoading(true);
    adminApi.orders
      .getByUser({ email: usuario.email, clienteId: usuario.id })
      .then((data) => {
        if (isMounted) setOrdenes(data);
      })
      .catch(() => {
        if (isMounted) setOrdenes([]);
      })
      .finally(() => {
        if (isMounted) setLoadingComprasDone();
      });

    function setLoadingComprasDone() {
      if (isMounted) setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [usuario]);

  if (!usuario) return null;

  const formatCLP = (m: number) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(m);

  const getEstadoBadgeClass = (estado: string) => {
    switch (estado.toUpperCase()) {
      case "ENTREGADO":
      case "PAGADO":
        return "bg-success-subtle text-success border-success-subtle";
      case "EN_PREPARACION":
      case "EN_RUTA":
      case "LISTO_RETIRO":
        return "bg-warning-subtle text-warning-emphasis border-warning-subtle";
      case "CANCELADO":
        return "bg-danger-subtle text-danger border-danger-subtle";
      default:
        return "bg-secondary-subtle text-secondary border-secondary-subtle";
    }
  };

  const getResumenItems = (orden: OrderAdmin): string => {
    if (orden.items && orden.items.length > 0) {
      return orden.items.map((i) => `${i.cantidad}x ${i.nombre}`).join(", ");
    }
    return "Productos de pastelería artesanal";
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
          className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content admin-card border-0 shadow-lg">
            <div className="modal-header bg-light border-bottom px-4 py-3 align-items-center">
              <div className="d-flex align-items-center gap-2">
                <ShoppingBag className="text-primary" size={22} />
                <div>
                  <h5 className="modal-title brand-font fs-5 text-secondary mb-0">
                    Historial de Compras — {usuario.nombre}
                  </h5>
                  <span className="text-muted small">
                    {usuario.email} · {ordenes.length} órdenes registradas
                  </span>
                </div>
              </div>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose} />
            </div>

            <div className="modal-body p-4 bg-white">
              {loading ? (
                <div className="text-center py-5">
                  <RefreshCw size={24} className="spin text-primary mb-2" />
                  <p className="text-muted small mb-0">Cargando compras del cliente...</p>
                </div>
              ) : ordenes.length === 0 ? (
                <div className="text-center py-5">
                  <AlertCircle size={32} className="text-muted opacity-50 mb-2" />
                  <h6 className="text-secondary fw-semibold">Sin compras registradas</h6>
                  <p className="text-muted small mb-0">
                    Este usuario aún no tiene órdenes ni boletas emitidas en el sistema.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover admin-table align-middle mb-0">
                    <thead>
                      <tr>
                        <th className="ps-3">Código Boleta</th>
                        <th>Fecha de Emisión</th>
                        <th>Detalle de Items</th>
                        <th>Total CLP</th>
                        <th>Estado Pedido</th>
                        <th className="text-end pe-3">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordenes.map((ord) => (
                        <tr key={ord.id}>
                          <td className="ps-3">
                            <span className="fw-bold font-monospace text-primary">
                              {ord.trackingCode}
                            </span>
                          </td>
                          <td className="small text-muted">{ord.fecha}</td>
                          <td className="small text-secondary" style={{ maxWidth: "260px" }}>
                            <div className="text-truncate" title={getResumenItems(ord)}>
                              {getResumenItems(ord)}
                            </div>
                          </td>
                          <td>
                            <strong className="text-secondary">{formatCLP(ord.total)}</strong>
                          </td>
                          <td>
                            <span
                              className={`badge border ${getEstadoBadgeClass(ord.estado)} px-2 py-1`}
                            >
                              {ord.estado.replace("_", " ")}
                            </span>
                          </td>
                          <td className="text-end pe-3">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 shadow-sm"
                              onClick={() => onVerBoleta(ord)}
                            >
                              <Receipt size={14} />
                              <span>Ver Boleta</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer bg-light border-top px-4 py-2.5">
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>
                <X size={14} className="me-1" />
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
