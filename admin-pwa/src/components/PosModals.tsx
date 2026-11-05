// @pca:start
// @id(admin.components.posModals)
// @kind(component)
// @limit(lines: 220)
// @contract(PosCashModal, PosThermalReceiptModal)
// @relates(docs.especificacion_pwa_admin)
// @relates(admin.services.api)
// @desc(Modales extraidos del POS para arqueo de caja de turno e impresion de boleta termica 80mm)
// @pca:end
import { CheckCircle2, Printer } from "lucide-react";

export interface TicketEntryPOS {
  item: {
    id: number;
    nombre: string;
    precio: number;
  };
  cantidad: number;
}

interface PosCashModalProps {
  abierto: boolean;
  total: number;
  vuelto: number;
  montoRecibido: number;
  procesando: boolean;
  onChangeMonto: (monto: number) => void;
  onCancelar: () => void;
  onConfirmar: () => void;
}

const formatCLP = (v: number) => `$${v.toLocaleString("es-CL")}`;

export function PosCashModal({
  abierto,
  total,
  vuelto,
  montoRecibido,
  procesando,
  onChangeMonto,
  onCancelar,
  onConfirmar,
}: PosCashModalProps) {
  if (!abierto) return null;

  return (
    <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content admin-card border-0 shadow-lg">
          <div className="modal-header border-bottom">
            <h5 className="modal-title brand-font fs-5 text-secondary">Cobro en Efectivo</h5>
            <button type="button" className="btn-close" onClick={onCancelar} />
          </div>
          <div className="modal-body p-4">
            <div className="row g-3 mb-3">
              <div className="col-6">
                <div className="p-3 rounded-3 bg-light border text-center">
                  <span className="small text-muted fw-bold text-uppercase">Total Boleta</span>
                  <div className="fs-4 fw-bold text-secondary">{formatCLP(total)}</div>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 rounded-3 bg-success-subtle text-success text-center">
                  <span className="small fw-bold text-uppercase">Vuelto a Entregar</span>
                  <div className="fs-4 fw-bold">{formatCLP(vuelto)}</div>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">Monto Recibido</label>
              <input
                type="number"
                value={montoRecibido}
                onChange={(e) => onChangeMonto(Number(e.target.value))}
                className="form-control form-control-lg text-center fw-bold"
                step="1000"
              />
            </div>

            <div className="d-flex gap-2">
              {[5000, 10000, 20000].map((billete) => (
                <button
                  key={billete}
                  type="button"
                  className="btn btn-outline-secondary btn-sm flex-grow-1"
                  onClick={() => onChangeMonto(billete)}
                >
                  {formatCLP(billete)}
                </button>
              ))}
              <button
                type="button"
                className="btn btn-outline-primary btn-sm flex-grow-1 fw-bold"
                onClick={() => onChangeMonto(total)}
              >
                Exacto
              </button>
            </div>
          </div>
          <div className="modal-footer border-top bg-light">
            <button type="button" className="btn btn-outline-secondary" onClick={onCancelar}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" disabled={procesando} onClick={onConfirmar}>
              {procesando ? "Procesando..." : "Confirmar y Emitir Boleta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PosThermalReceiptModalProps {
  abierto: boolean;
  folio: string;
  metodoPago: string;
  ticket: TicketEntryPOS[];
  subtotalNeto: number;
  iva: number;
  total: number;
  onNuevoTicket: () => void;
}

export function PosThermalReceiptModal({
  abierto,
  folio,
  metodoPago,
  ticket,
  subtotalNeto,
  iva,
  total,
  onNuevoTicket,
}: PosThermalReceiptModalProps) {
  if (!abierto) return null;

  return (
    <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "420px" }}>
        <div className="modal-content admin-card border-0 shadow-lg font-monospace">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fs-6 text-secondary d-flex align-items-center gap-2">
              <CheckCircle2 size={16} className="text-success" /> Boleta Emitida {folio}
            </h5>
            <button type="button" className="btn-close" onClick={onNuevoTicket} />
          </div>
          <div className="modal-body p-3 text-center small">
            <h6 className="fw-bold mb-0">PASTELERÍA CRÈME &amp; CO</h6>
            <div style={{ fontSize: "0.75rem" }}>RUT: 76.543.210-K · S.I.I. SANTIAGO ORIENTE</div>
            <div className="p-1 border my-2 bg-light fw-bold">BOLETA ELECTRÓNICA Nº {folio}</div>
            <div className="text-start mb-2" style={{ fontSize: "0.74rem" }}>
              <div>Fecha: {new Date().toLocaleString("es-CL")}</div>
              <div>Cajero: Matías Retamal · Medio: {metodoPago}</div>
            </div>
            <table className="table table-sm border-top border-bottom text-start mb-2" style={{ fontSize: "0.75rem" }}>
              <tbody>
                {ticket.map((t) => (
                  <tr key={t.item.id}>
                    <td>
                      {t.cantidad}x {t.item.nombre}
                    </td>
                    <td className="text-end">{formatCLP(t.item.precio * t.cantidad)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="d-flex justify-content-between">
              <span>Neto:</span>
              <strong>{formatCLP(subtotalNeto)}</strong>
            </div>
            <div className="d-flex justify-content-between">
              <span>IVA 19%:</span>
              <strong>{formatCLP(iva)}</strong>
            </div>
            <div className="d-flex justify-content-between fs-6 fw-bold border-top pt-1 mt-1 text-primary">
              <span>TOTAL:</span>
              <strong>{formatCLP(total)} CLP</strong>
            </div>
          </div>
          <div className="modal-footer border-top bg-light">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
              onClick={() => window.print()}
            >
              <Printer size={14} /> Imprimir
            </button>
            <button type="button" className="btn btn-sm btn-primary" onClick={onNuevoTicket}>
              Nuevo Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
