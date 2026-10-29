// @pca:start
// @id(admin.pages.pos)
// @kind(page)
// @limit(lines: 300)
// @contract(PosAdminView())
// @relates(docs.especificacion_pwa_admin)
// @desc(Terminal punto de venta POS mostrador con generacion de boletas)
// @pca:end
import { useState } from "react";
import { CreditCard } from "lucide-react";

interface ItemPOS {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  porcion: string;
}

const PRODUCTOS_POS: ItemPOS[] = [
  { id: 1, nombre: "Torta Cuatro Leches", categoria: "Tortas", precio: 34000, porcion: "15 pers." },
  { id: 2, nombre: "Cheesecake Frutos Rojos", categoria: "Tortas", precio: 34000, porcion: "12 pers." },
  { id: 3, nombre: "Hojarasca Manjar Lúcuma", categoria: "Tortas", precio: 32000, porcion: "20 pers." },
  { id: 4, nombre: "Mousse Chocolate Bitter", categoria: "Individual", precio: 4900, porcion: "Individual" },
  { id: 5, nombre: "Brownie Fudgy Almendras", categoria: "Sin Gluten", precio: 3500, porcion: "Individual" },
];

export function Pos() {
  const [ticket, setTicket] = useState<{ item: ItemPOS; cantidad: number }[]>([
    { item: PRODUCTOS_POS[0], cantidad: 1 },
  ]);
  const [modalCobro, setModalCobro] = useState(false);
  const [montoRecibido, setMontoRecibido] = useState(40000);

  const total = ticket.reduce((acc, t) => acc + t.item.precio * t.cantidad, 0);
  const subtotalNeto = Math.round(total / 1.19);
  const iva = total - subtotalNeto;
  const vuelto = Math.max(0, montoRecibido - total);

  function agregar(item: ItemPOS) {
    setTicket((prev) => {
      const ex = prev.find((t) => t.item.id === item.id);
      if (ex) {
        return prev.map((t) =>
          t.item.id === item.id ? { ...t, cantidad: t.cantidad + 1 } : t
        );
      }
      return [...prev, { item, cantidad: 1 }];
    });
  }

  return (
    <div className="container-fluid px-0">
      <div className="row g-4">
        {/* Catálogo de Productos Táctiles */}
        <div className="col-12 col-xl-8">
          <div className="card admin-card p-3 mb-3">
            <div className="d-flex flex-wrap gap-2">
              <button type="button" className="btn btn-sm btn-primary">Todas</button>
              <button type="button" className="btn btn-sm btn-outline-secondary">Tortas Enteras</button>
              <button type="button" className="btn btn-sm btn-outline-secondary">Individuales</button>
              <button type="button" className="btn btn-sm btn-outline-secondary">Sin Gluten</button>
            </div>
          </div>

          <div className="row g-3">
            {PRODUCTOS_POS.map((p) => (
              <div key={p.id} className="col-6 col-md-4">
                <div
                  className="card admin-card p-3 h-100"
                  style={{ cursor: "pointer" }}
                  onClick={() => agregar(p)}
                >
                  <span className="badge bg-light text-secondary border mb-2 align-self-start">
                    {p.categoria}
                  </span>
                  <h6 className="fw-bold text-secondary mb-1">{p.nombre}</h6>
                  <p className="small text-muted mb-2">{p.porcion}</p>
                  <div className="d-flex align-items-center justify-content-between mt-auto">
                    <span className="fw-bold text-primary fs-6">
                      ${p.precio.toLocaleString("es-CL")}
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary p-1 px-2 rounded-circle"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen de Ticket Lateral */}
        <div className="col-12 col-xl-4">
          <div className="card admin-card p-4 sticky-top" style={{ top: "80px" }}>
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
              <h5 className="brand-font fs-5 text-secondary mb-0">Ticket Actual</h5>
              <span className="badge bg-light text-secondary border">Mesa Mostrador</span>
            </div>

            <div className="d-flex flex-column gap-2 mb-4" style={{ maxHeight: "240px", overflowY: "auto" }}>
              {ticket.map((t) => (
                <div
                  key={t.item.id}
                  className="p-2.5 rounded-3 bg-light border d-flex align-items-center justify-content-between small"
                >
                  <div>
                    <div className="fw-bold text-secondary">{t.item.nombre}</div>
                    <div className="text-muted">
                      ${t.item.precio.toLocaleString("es-CL")} x {t.cantidad}
                    </div>
                  </div>
                  <span className="fw-bold text-secondary">
                    ${(t.item.precio * t.cantidad).toLocaleString("es-CL")}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-top pt-3 small">
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Subtotal Neto:</span>
                <span className="fw-bold text-secondary">${subtotalNeto.toLocaleString("es-CL")}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">IVA (19%):</span>
                <span className="fw-bold text-secondary">${iva.toLocaleString("es-CL")}</span>
              </div>
              <div className="d-flex justify-content-between border-top pt-2 fs-5 fw-bold text-secondary">
                <span>Total a Pagar:</span>
                <span className="text-primary">${total.toLocaleString("es-CL")}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setModalCobro(true)}
              className="btn btn-primary w-100 mt-4 py-2.5 fs-6 d-inline-flex align-items-center justify-content-center gap-2"
            >
              <CreditCard size={18} />
              <span>Cobrar ${total.toLocaleString("es-CL")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Cobro */}
      {modalCobro && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setModalCobro(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content admin-modal-content">
              <div className="modal-header admin-modal-header">
                <h5 className="modal-title brand-font fs-5 text-secondary">
                  Procesar Pago Mostrador
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalCobro(false)}
                />
              </div>
              <div className="modal-body p-4">
                <div className="text-center mb-4">
                  <span className="small text-muted text-uppercase fw-bold">Monto a Cobrar</span>
                  <div className="fs-2 fw-bold text-primary">${total.toLocaleString("es-CL")}</div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-uppercase text-secondary">
                    Monto Recibido en Efectivo
                  </label>
                  <input
                    type="number"
                    value={montoRecibido}
                    onChange={(e) => setMontoRecibido(Number(e.target.value))}
                    className="form-control form-control-lg text-center fw-bold"
                  />
                </div>

                <div className="p-3 rounded-3 bg-success-subtle text-success text-center">
                  <span className="small fw-bold text-uppercase">Vuelto a Entregar</span>
                  <div className="fs-4 fw-bold">${vuelto.toLocaleString("es-CL")}</div>
                </div>
              </div>
              <div className="modal-footer border-top bg-light">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setModalCobro(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setModalCobro(false);
                    setTicket([]);
                  }}
                >
                  Confirmar y Emitir Boleta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
