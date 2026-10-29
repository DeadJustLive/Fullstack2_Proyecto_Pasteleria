// @pca:start
// @id(admin.components.boletaModal)
// @kind(component)
// @limit(lines: 350)
// @contract(BoletaModal(order, onClose))
// @relates(docs.especificacion_pwa_admin)
// @desc(Modal con desglose de IVA 19%, datos de emisor/receptor e impresion tributaria DSY1104)
// @pca:end
import React from "react";
import { Printer, X, Receipt, MapPin, Store, UserCheck, ShieldCheck } from "lucide-react";
import type { OrderAdmin } from "../services/api";

export interface BoletaModalProps {
  orden: OrderAdmin | null;
  onClose: () => void;
}

export const BoletaModal: React.FC<BoletaModalProps> = ({ orden, onClose }) => {
  if (!orden) return null;

  // Formato de moneda chilena (CLP)
  const formatCLP = (monto: number): string =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(monto);

  // Formato formal de fecha
  const fechaFormateada = (() => {
    try {
      const d = new Date(orden.fecha);
      if (isNaN(d.getTime())) return orden.fecha;
      return d.toLocaleString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return orden.fecha;
    }
  })();

  // Desglose formal de IVA (19% según DSY1104 / Ley Chilena de Boleta Electrónica)
  const total = Number(orden.total) || 0;
  const netoCalculado = Math.round(total / 1.19);
  const ivaCalculado = total - netoCalculado;

  const esRetiro =
    orden.tipoEntrega?.toUpperCase() === "RETIRO" ||
    orden.tipoEntrega?.toUpperCase() === "RETIRO_TIENDA";

  const tieneRecogedor = Boolean(
    orden.personaRetiroNombre && orden.personaRetiroNombre.trim().length > 0
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Estilos para impresión controlada */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #boleta-print-area, #boleta-print-area * {
            visibility: visible !important;
          }
          #boleta-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            background: #ffffff !important;
          }
          .modal-backdrop, .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1050 }}
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        style={{ zIndex: 1055 }}
        onClick={onClose}
      >
        <div
          className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content admin-card border-0 shadow-lg">
            {/* Header del Modal */}
            <div className="modal-header bg-light border-bottom px-4 py-3 align-items-center">
              <div className="d-flex align-items-center gap-2">
                <Receipt className="text-primary" size={22} />
                <h5 className="modal-title brand-font fs-5 text-secondary mb-0">
                  Boleta Electrónica Oficial DSY1104
                </h5>
              </div>
              <button
                type="button"
                className="btn-close"
                aria-label="Cerrar"
                onClick={onClose}
              />
            </div>

            {/* Cuerpo del Modal con Contenedor Imprimible */}
            <div className="modal-body p-4 bg-white">
              <div
                id="boleta-print-area"
                className="p-4 rounded-3 border"
                style={{
                  backgroundColor: "#ffffff",
                  borderColor: "rgba(93, 64, 55, 0.2)",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}
              >
                {/* Encabezado Emisor y Récord SII */}
                <div className="row g-3 pb-3 border-bottom mb-3 align-items-center">
                  <div className="col-12 col-md-7">
                    <h4 className="brand-font text-secondary fw-bold mb-1">
                      PASTELERÍA CRÈME &amp; CO SpA
                    </h4>
                    <p className="small text-muted mb-0">
                      <strong>Giro:</strong> Elaboración de Productos de Pastelería y Repostería Fina
                      <br />
                      <strong>Casa Matriz:</strong> Av. Providencia 1234, Providencia, Santiago
                      <br />
                      <strong>Contacto:</strong> contacto@cremeco.cl · +56 9 8765 4321
                    </p>
                  </div>
                  <div className="col-12 col-md-5">
                    <div
                      className="text-center p-2 rounded-2 border border-2 border-danger"
                      style={{ backgroundColor: "#FFF8F8" }}
                    >
                      <div className="fw-bold text-danger small">R.U.T.: 76.543.210-K</div>
                      <div className="fw-bold fs-6 text-danger text-uppercase my-1">
                        BOLETA ELECTRÓNICA
                      </div>
                      <div className="fw-bold text-dark font-monospace fs-5">
                        Nº {orden.trackingCode.startsWith("#") ? orden.trackingCode : `#${orden.trackingCode}`}
                      </div>
                      <div className="small text-muted" style={{ fontSize: "0.75rem" }}>
                        S.I.I. — SANTIAGO ORIENTE
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadatos de la Transacción */}
                <div className="row g-3 p-3 bg-light rounded-3 mb-3 small">
                  <div className="col-12 col-md-6 border-end-md">
                    <div className="fw-bold text-secondary mb-1">Datos del Cliente:</div>
                    <div><strong>Nombre:</strong> {orden.cliente}</div>
                    {orden.rut && <div><strong>RUT:</strong> {orden.rut}</div>}
                    {orden.email && <div><strong>Email:</strong> {orden.email}</div>}
                    {orden.telefono && <div><strong>Teléfono:</strong> {orden.telefono}</div>}
                    <div className="mt-1">
                      <strong>Fecha de Emisión:</strong> {fechaFormateada}
                    </div>
                  </div>

                  <div className="col-12 col-md-6 ps-md-3">
                    <div className="fw-bold text-secondary mb-1">Tipo de Entrega:</div>
                    {esRetiro ? (
                      <div className="d-flex flex-column gap-1">
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle align-self-start d-inline-flex align-items-center gap-1">
                          <Store size={13} /> Retiro en Tienda
                        </span>
                        <div className="text-muted mt-1">
                          <strong>Local:</strong> Casa Matriz Providencia
                        </div>
                        {tieneRecogedor ? (
                          <div className="p-2 mt-1 bg-white border rounded-2">
                            <div className="d-flex align-items-center gap-1 text-secondary fw-semibold">
                              <UserCheck size={14} className="text-success" />
                              <span>Persona Autorizada a Retirar:</span>
                            </div>
                            <div className="ps-3 mt-1">
                              <div>• {orden.personaRetiroNombre}</div>
                              {orden.personaRetiroRut && <div>• RUT: {orden.personaRetiroRut}</div>}
                              {orden.personaRetiroTelefono && <div>• Tel: {orden.personaRetiroTelefono}</div>}
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted fst-italic">
                            Retira personalmente el titular de la orden.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-1">
                        <span className="badge bg-success-subtle text-success border border-success-subtle align-self-start d-inline-flex align-items-center gap-1">
                          <MapPin size={13} /> Despacho a Domicilio
                        </span>
                        <div className="mt-1">
                          <strong>Dirección:</strong> {orden.direccion || "Dirección registrada"}
                          {orden.departamento && `, Depto ${orden.departamento}`}
                        </div>
                        <div>
                          <strong>Comuna / Región:</strong> {orden.comuna || "Santiago"}, {orden.region || "Metropolitana"}
                        </div>
                        {orden.indicaciones && (
                          <div className="text-muted fst-italic">
                            Indicaciones: {orden.indicaciones}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-2 pt-2 border-top">
                      <strong>Medio de Pago:</strong> {orden.metodoPago || "WebPay Plus / Flow"}
                    </div>
                  </div>
                </div>

                {/* Tabla de Productos / Detalle */}
                <div className="table-responsive mb-3">
                  <table className="table table-sm table-bordered align-middle mb-0 small">
                    <thead className="table-light text-secondary">
                      <tr>
                        <th style={{ width: "50px" }} className="text-center">Cant.</th>
                        <th>Descripción del Producto</th>
                        <th style={{ width: "120px" }} className="text-end">P. Unitario</th>
                        <th style={{ width: "120px" }} className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orden.items && orden.items.length > 0 ? (
                        orden.items.map((it, idx) => {
                          const cant = it.cantidad || 1;
                          const prec = it.precio || 0;
                          const subt = it.subtotal || cant * prec;
                          return (
                            <tr key={it.id || idx}>
                              <td className="text-center fw-bold">{cant}</td>
                              <td className="text-secondary fw-semibold">{it.nombre}</td>
                              <td className="text-end text-muted">{formatCLP(prec)}</td>
                              <td className="text-end fw-bold text-secondary">{formatCLP(subt)}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td className="text-center fw-bold">1</td>
                          <td className="text-secondary fw-semibold">
                            Productos de Pastelería Fina Surtida (Orden #{orden.trackingCode})
                          </td>
                          <td className="text-end text-muted">{formatCLP(total)}</td>
                          <td className="text-end fw-bold text-secondary">{formatCLP(total)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Desglose Formal Financiero (Neto, IVA 19%, Total) */}
                <div className="row justify-content-end mb-3">
                  <div className="col-12 col-sm-7 col-md-6">
                    <div className="p-3 bg-light rounded-3 small">
                      <div className="d-flex justify-content-between mb-1.5">
                        <span className="text-muted">Subtotal Neto:</span>
                        <strong className="text-secondary">{formatCLP(netoCalculado)}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-1.5">
                        <span className="text-muted">I.V.A. (19%):</span>
                        <strong className="text-secondary">{formatCLP(ivaCalculado)}</strong>
                      </div>
                      {Boolean(orden.costoEnvio && orden.costoEnvio > 0) && (
                        <div className="d-flex justify-content-between mb-1.5">
                          <span className="text-muted">Costo Despacho:</span>
                          <strong className="text-secondary">{formatCLP(orden.costoEnvio || 0)}</strong>
                        </div>
                      )}
                      <div className="d-flex justify-content-between pt-2 border-top border-2 border-secondary fs-6 fw-bold text-secondary">
                        <span>TOTAL PAGADO:</span>
                        <span className="text-primary">{formatCLP(total)} CLP</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timbre Electrónico y Pie Legal SII */}
                <div className="text-center pt-3 border-top text-muted small" style={{ fontSize: "0.74rem" }}>
                  <div className="d-flex align-items-center justify-content-center gap-1 mb-1 text-secondary fw-semibold">
                    <ShieldCheck size={14} className="text-success" />
                    <span>Documento Tributario Electrónico emitido conforme a Res. Ex. SII Nº 99 de 2014</span>
                  </div>
                  <div>El IVA de esta boleta se encuentra incluido en el monto total. Verifique este documento en sii.cl</div>
                  <div className="fw-bold mt-1 text-secondary">¡Gracias por preferir Crème &amp; Co!</div>
                </div>
              </div>
            </div>

            {/* Footer con Acciones */}
            <div className="modal-footer bg-light border-top px-4 py-3 no-print">
              <button
                type="button"
                className="btn btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-3"
                onClick={onClose}
              >
                <X size={16} />
                <span>Cerrar</span>
              </button>
              <button
                type="button"
                className="btn btn-primary d-inline-flex align-items-center gap-1.5 px-4 shadow-sm"
                onClick={handlePrint}
              >
                <Printer size={16} />
                <span>Imprimir Boleta</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
