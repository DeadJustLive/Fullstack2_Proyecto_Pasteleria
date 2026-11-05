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

  const formatCLP = (monto: number): string =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(monto);

  const fechaFormateada = (() => {
    try {
      if (!orden.fecha) return new Date().toLocaleDateString("es-CL");
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
      return orden.fecha || "Fecha reciente";
    }
  })();

  const tracking = orden.trackingCode || (orden.id ? `CC-${orden.id}` : "CC-1000");
  const folioBoleta = tracking.startsWith("#") ? tracking : `#${tracking}`;

  // Montos contables y desglose SII
  const total = Number(orden.total) || 0;
  const envio = Number(orden.costoEnvio) || 0;
  const descuento = Number(orden.descuento) || 0;
  const subtotalNeto = Math.round(total / 1.19);
  const ivaCalculado = total - subtotalNeto;

  const items = Array.isArray(orden.items) && orden.items.length > 0 ? orden.items : [
    {
      id: 1,
      nombre: `Pastelería Fina Artesanal (Orden ${folioBoleta})`,
      cantidad: 1,
      precio: Math.max(0, total - envio + descuento),
      subtotal: Math.max(0, total - envio + descuento),
    },
  ];

  const subtotalItems = items.reduce((acc, it) => acc + (Number(it.subtotal) || (Number(it.precio) * (Number(it.cantidad) || 1))), 0);

  const esRetiro =
    orden.tipoEntrega?.toUpperCase() === "RETIRO" ||
    orden.tipoEntrega?.toUpperCase() === "RETIRO_TIENDA";

  const tieneRecogedor = Boolean(
    orden.personaRetiroNombre && orden.personaRetiroNombre.trim().length > 0
  );

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #boleta-print-area, #boleta-print-area * { visibility: visible !important; }
          #boleta-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 15px !important;
            background: #ffffff !important;
            border: 1px solid #333 !important;
          }
          .modal-backdrop, .no-print { display: none !important; }
        }
      `}</style>

      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} onClick={onClose} />

      <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" style={{ zIndex: 1055 }} onClick={onClose}>
        <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content admin-card border-0 shadow-lg">
            <div className="modal-header bg-light border-bottom px-4 py-3 align-items-center">
              <div className="d-flex align-items-center gap-2">
                <Receipt className="text-primary" size={22} />
                <h5 className="modal-title brand-font fs-5 text-secondary mb-0">Boleta Electrónica Oficial DSY1104</h5>
              </div>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose} />
            </div>

            <div className="modal-body p-4 bg-white">
              <div id="boleta-print-area" className="p-4 rounded-3 border" style={{ backgroundColor: "#ffffff", borderColor: "rgba(93, 64, 55, 0.2)" }}>
                {/* Encabezado Emisor y Timbre Fiscal SII */}
                <div className="row g-3 pb-3 border-bottom mb-3 align-items-center">
                  <div className="col-12 col-md-7">
                    <h4 className="brand-font text-secondary fw-bold mb-1">PASTELERÍA CRÈME &amp; CO SpA</h4>
                    <p className="small text-muted mb-0">
                      <strong>Giro:</strong> Elaboración de Productos de Pastelería y Repostería Fina<br />
                      <strong>Casa Matriz:</strong> Av. Providencia 1234, Providencia, Santiago<br />
                      <strong>Contacto:</strong> contacto@cremeco.cl · +56 9 8765 4321
                    </p>
                  </div>
                  <div className="col-12 col-md-5">
                    <div className="text-center p-2 rounded-2 border border-2 border-danger" style={{ backgroundColor: "#FFF8F8" }}>
                      <div className="fw-bold text-danger small">R.U.T.: 76.543.210-K</div>
                      <div className="fw-bold fs-6 text-danger text-uppercase my-1">BOLETA ELECTRÓNICA</div>
                      <div className="fw-bold text-dark font-monospace fs-5">Nº {folioBoleta}</div>
                      <div className="small text-muted" style={{ fontSize: "0.75rem" }}>S.I.I. — SANTIAGO ORIENTE</div>
                    </div>
                  </div>
                </div>

                {/* Datos del Cliente y Despacho */}
                <div className="row g-3 p-3 bg-light rounded-3 mb-3 small">
                  <div className="col-12 col-md-6 border-end-md">
                    <div className="fw-bold text-secondary mb-1">Receptor / Cliente:</div>
                    <div><strong>Nombre:</strong> {orden.cliente || "Cliente Particular"}</div>
                    <div><strong>RUT:</strong> {orden.rut || "66.666.666-6"}</div>
                    {orden.email && <div><strong>Email:</strong> {orden.email}</div>}
                    {orden.telefono && <div><strong>Teléfono:</strong> {orden.telefono}</div>}
                    <div className="mt-1"><strong>Fecha Emisión:</strong> {fechaFormateada}</div>
                  </div>

                  <div className="col-12 col-md-6 ps-md-3">
                    <div className="fw-bold text-secondary mb-1">Modalidad de Entrega:</div>
                    {esRetiro ? (
                      <div className="d-flex flex-column gap-1">
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle align-self-start d-inline-flex align-items-center gap-1">
                          <Store size={13} /> Retiro en Tienda
                        </span>
                        <div className="text-muted mt-1"><strong>Local:</strong> Casa Matriz Providencia</div>
                        {tieneRecogedor ? (
                          <div className="p-2 mt-1 bg-white border rounded-2">
                            <div className="d-flex align-items-center gap-1 text-secondary fw-semibold">
                              <UserCheck size={14} className="text-success" />
                              <span>Persona Autorizada a Retirar:</span>
                            </div>
                            <div className="ps-3 mt-1">
                              <div>• {orden.personaRetiroNombre}</div>
                              {orden.personaRetiroRut && <div>• RUT: {orden.personaRetiroRut}</div>}
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted fst-italic">Retira personalmente el titular de la orden.</div>
                        )}
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-1">
                        <span className="badge bg-success-subtle text-success border border-success-subtle align-self-start d-inline-flex align-items-center gap-1">
                          <MapPin size={13} /> Despacho a Domicilio
                        </span>
                        <div className="mt-1">
                          <strong>Dirección:</strong> {orden.direccion || "Dirección registrada"}
                          {orden.departamento ? `, Depto ${orden.departamento}` : ""}
                        </div>
                        <div><strong>Comuna / Región:</strong> {orden.comuna || "Santiago"}, {orden.region || "Metropolitana"}</div>
                      </div>
                    )}
                    <div className="mt-2 pt-2 border-top">
                      <strong>Medio de Pago:</strong> {orden.metodoPago || "WebPay Plus / Flow"}
                    </div>
                  </div>
                </div>

                {/* Detalle de Productos */}
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
                      {items.map((it, idx) => {
                        const cant = Number(it.cantidad) || 1;
                        const prec = Number(it.precio) || 0;
                        const subt = Number(it.subtotal) || (cant * prec);
                        return (
                          <tr key={it.id || idx}>
                            <td className="text-center fw-bold">{cant}</td>
                            <td className="text-secondary fw-semibold">{it.nombre}</td>
                            <td className="text-end text-muted">{formatCLP(prec)}</td>
                            <td className="text-end fw-bold text-secondary">{formatCLP(subt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Resumen Comercial y Desglose Tributario SII */}
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100 small border">
                      <div className="fw-bold text-secondary mb-2 border-bottom pb-1">Resumen de Cuenta:</div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Subtotal Productos:</span>
                        <strong className="text-secondary">{formatCLP(subtotalItems)}</strong>
                      </div>
                      {envio > 0 && (
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted">Costo Envío / Despacho:</span>
                          <strong className="text-secondary">{formatCLP(envio)}</strong>
                        </div>
                      )}
                      {descuento > 0 && (
                        <div className="d-flex justify-content-between mb-1 text-success">
                          <span>Descuento Promoción:</span>
                          <strong>-{formatCLP(descuento)}</strong>
                        </div>
                      )}
                      <div className="d-flex justify-content-between pt-2 border-top fw-bold text-secondary">
                        <span>Monto Cobrado:</span>
                        <span className="text-primary">{formatCLP(total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100 small border">
                      <div className="fw-bold text-secondary mb-2 border-bottom pb-1">Desglose Tributario Ley Nº 21.210:</div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Monto Neto (Afecto):</span>
                        <strong className="text-secondary">{formatCLP(subtotalNeto)}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">I.V.A. Débito Fiscal (19%):</span>
                        <strong className="text-secondary">{formatCLP(ivaCalculado)}</strong>
                      </div>
                      <div className="d-flex justify-content-between pt-2 border-top border-2 border-secondary fs-6 fw-bold text-secondary">
                        <span>TOTAL BOLETA:</span>
                        <span className="text-primary">{formatCLP(total)} CLP</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pie Legal SII */}
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

            <div className="modal-footer bg-light border-top px-4 py-3 no-print">
              <button type="button" className="btn btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-3" onClick={onClose}>
                <X size={16} /><span>Cerrar</span>
              </button>
              <button type="button" className="btn btn-primary d-inline-flex align-items-center gap-1.5 px-4 shadow-sm" onClick={() => window.print()}>
                <Printer size={16} /><span>Imprimir Boleta</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
