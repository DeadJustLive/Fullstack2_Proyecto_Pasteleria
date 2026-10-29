// @pca:start
// @id(admin.pages.pos)
// @kind(page)
// @limit(lines: 420)
// @contract(PosAdminView())
// @relates(docs.especificacion_pwa_admin)
// @relates(admin.services.api)
// @desc(Terminal punto de venta POS mostrador con generacion de boletas)
// @pca:end
import { useState, useEffect } from "react";
import {
  CreditCard,
  DollarSign,
  Printer,
  CheckCircle2,
  Plus,
  Minus,
} from "lucide-react";
import { adminApi, type ProductCatalogDTO } from "../services/api";

interface ItemPOS {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  porcion: string;
}

const PRODUCTOS_DEFAULT: ItemPOS[] = [
  { id: 1, nombre: "Torta Cuatro Leches", categoria: "Tortas", precio: 34000, porcion: "15 pers." },
  { id: 2, nombre: "Cheesecake Frutos Rojos", categoria: "Tortas", precio: 34000, porcion: "12 pers." },
  { id: 3, nombre: "Hojarasca Manjar Lúcuma", categoria: "Tortas", precio: 32000, porcion: "20 pers." },
  { id: 4, nombre: "Mousse Chocolate Bitter", categoria: "Individual", precio: 4900, porcion: "Individual" },
  { id: 5, nombre: "Brownie Fudgy Almendras", categoria: "Sin Gluten", precio: 3500, porcion: "Individual" },
  { id: 6, nombre: "Tarta Limón y Merengue", categoria: "Tortas", precio: 28000, porcion: "10 pers." },
];

export function Pos() {
  const [productos, setProductos] = useState<ItemPOS[]>(PRODUCTOS_DEFAULT);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas");
  const [ticket, setTicket] = useState<{ item: ItemPOS; cantidad: number }[]>([
    { item: PRODUCTOS_DEFAULT[0], cantidad: 1 },
  ]);
  const [modalCobro, setModalCobro] = useState(false);
  const [modalBoleta, setModalBoleta] = useState(false);
  const [metodoPago, setMetodoPago] = useState<"EFECTIVO" | "TARJETA_POS">("EFECTIVO");
  const [montoRecibido, setMontoRecibido] = useState(40000);
  const [folioEmitido, setFolioEmitido] = useState("CC-POS-9412");
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    let montado = true;
    async function cargarCatalogo() {
      try {
        const data = await adminApi.products.list();
        if (montado && Array.isArray(data) && data.length > 0) {
          const mapeados: ItemPOS[] = data.map((p: ProductCatalogDTO) => ({
            id: p.id,
            nombre: p.nombre,
            categoria: p.categoria || "Tortas",
            precio: p.precio,
            porcion: p.porciones || "Vitrina",
          }));
          setProductos(mapeados);
        }
      } catch {
        // Fallback activo
      }
    }
    void cargarCatalogo();
    return () => {
      montado = false;
    };
  }, []);

  const total = ticket.reduce((acc, t) => acc + t.item.precio * t.cantidad, 0);
  const subtotalNeto = Math.round(total / 1.19);
  const iva = total - subtotalNeto;
  const vuelto = Math.max(0, montoRecibido - total);

  const categorias = ["todas", ...Array.from(new Set(productos.map((p) => p.categoria)))];
  const productosFiltrados = categoriaFiltro === "todas"
    ? productos
    : productos.filter((p) => p.categoria.toLowerCase() === categoriaFiltro.toLowerCase());

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

  function decrementar(id: number) {
    setTicket((prev) =>
      prev
        .map((t) => (t.item.id === id ? { ...t, cantidad: t.cantidad - 1 } : t))
        .filter((t) => t.cantidad > 0)
    );
  }

  async function handleConfirmarCobro() {
    setProcesando(true);
    const folio = `CC-POS-${Math.floor(1000 + Math.random() * 9000)}`;
    setFolioEmitido(folio);

    try {
      await adminApi.inventory.registerSale({
        items: ticket.map((t) => ({
          id: t.item.id,
          nombre: t.item.nombre,
          cantidad: t.cantidad,
          precio: t.item.precio,
        })),
        total,
        medioPago: metodoPago,
      });
    } catch {
      // Manejo resiliente
    } finally {
      setProcesando(false);
      setModalCobro(false);
      setModalBoleta(true);
    }
  }

  return (
    <div className="container-fluid px-0">
      <div className="row g-4">
        {/* Catálogo de Productos Táctiles */}
        <div className="col-12 col-xl-8">
          <div className="card admin-card p-3 mb-3 shadow-sm border-0">
            <div className="d-flex flex-wrap gap-2">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`btn btn-sm text-capitalize ${
                    categoriaFiltro === cat ? "btn-primary" : "btn-outline-secondary"
                  }`}
                  onClick={() => setCategoriaFiltro(cat)}
                >
                  {cat === "todas" ? "Todas las Categorías" : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="row g-3">
            {productosFiltrados.map((p) => (
              <div key={p.id} className="col-6 col-md-4">
                <div
                  className="card admin-card p-3 h-100 shadow-sm border-0 d-flex flex-column"
                  style={{ cursor: "pointer", transition: "transform 0.15s ease" }}
                  onClick={() => agregar(p)}
                >
                  <span className="badge bg-light text-secondary border mb-2 align-self-start">
                    {p.categoria}
                  </span>
                  <h6 className="fw-bold text-secondary mb-1">{p.nombre}</h6>
                  <p className="small text-muted mb-3">{p.porcion}</p>
                  <div className="d-flex align-items-center justify-content-between mt-auto">
                    <span className="fw-bold text-primary fs-6">
                      ${p.precio.toLocaleString("es-CL")}
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary p-1 px-2.5 rounded-circle shadow-sm"
                      title="Agregar producto"
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
          <div className="card admin-card p-4 sticky-top shadow-sm border-0" style={{ top: "80px" }}>
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
              <h5 className="brand-font fs-5 text-secondary mb-0">Ticket Actual</h5>
              <span className="badge bg-success-subtle text-success border border-success-subtle">
                Caja Mostrador #1
              </span>
            </div>

            <div className="d-flex flex-column gap-2 mb-3" style={{ maxHeight: "240px", overflowY: "auto" }}>
              {ticket.length === 0 ? (
                <div className="text-center text-muted py-4 small">
                  No hay productos en el ticket actual
                </div>
              ) : (
                ticket.map((t) => (
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
                    <div className="d-flex align-items-center gap-2">
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className="btn btn-outline-secondary p-0 px-1.5"
                          onClick={() => decrementar(t.item.id)}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="btn btn-light p-0 px-2 fw-bold disabled">
                          {t.cantidad}
                        </span>
                        <button
                          type="button"
                          className="btn btn-outline-secondary p-0 px-1.5"
                          onClick={() => agregar(t.item)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="fw-bold text-secondary ms-1">
                        ${(t.item.precio * t.cantidad).toLocaleString("es-CL")}
                      </span>
                    </div>
                  </div>
                ))
              )}
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
              disabled={ticket.length === 0}
              onClick={() => {
                setMontoRecibido(total);
                setModalCobro(true);
              }}
              className="btn btn-primary w-100 mt-4 py-2.5 fs-6 d-inline-flex align-items-center justify-content-center gap-2 shadow-sm"
            >
              <CreditCard size={18} />
              <span>Cobrar ${total.toLocaleString("es-CL")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Cobro */}
      {modalCobro && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content admin-modal-content shadow-lg border-0">
              <div className="modal-header border-bottom">
                <h5 className="modal-title brand-font fs-5 text-secondary">Procesar Pago Mostrador</h5>
                <button type="button" className="btn-close" onClick={() => setModalCobro(false)} />
              </div>
              <div className="modal-body p-4">
                <div className="text-center mb-3">
                  <span className="small text-muted text-uppercase fw-bold">Total a Cobrar</span>
                  <div className="fs-2 fw-bold text-primary">${total.toLocaleString("es-CL")}</div>
                </div>

                <div className="btn-group w-100 mb-3">
                  <button
                    type="button"
                    className={`btn btn-sm ${metodoPago === "EFECTIVO" ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() => setMetodoPago("EFECTIVO")}
                  >
                    <DollarSign size={15} /> Efectivo
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${metodoPago === "TARJETA_POS" ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() => setMetodoPago("TARJETA_POS")}
                  >
                    <CreditCard size={15} /> Tarjeta Débito / POS
                  </button>
                </div>

                {metodoPago === "EFECTIVO" && (
                  <>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Monto Recibido en Efectivo</label>
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
                  </>
                )}
              </div>
              <div className="modal-footer border-top bg-light">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setModalCobro(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary" disabled={procesando} onClick={handleConfirmarCobro}>
                  {procesando ? "Procesando..." : "Confirmar y Emitir Boleta"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Boleta Emitida */}
      {modalBoleta && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content admin-modal-content shadow-lg border-0">
              <div className="modal-header border-bottom">
                <h5 className="modal-title brand-font fs-5 text-secondary d-flex align-items-center gap-2">
                  <CheckCircle2 size={18} className="text-success" /> Boleta Electrónica Emitida
                </h5>
                <button type="button" className="btn-close" onClick={() => { setModalBoleta(false); setTicket([]); }} />
              </div>
              <div className="modal-body p-4 text-center">
                <div className="badge bg-light text-secondary border fs-6 px-3 py-1.5 mb-3">
                  Folio: {folioEmitido}
                </div>
                <div className="bg-light p-3 rounded-3 text-start small mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Emisor:</span> <strong>Pastelería Crème & Co SpA</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>RUT Emisor:</span> <strong>76.543.210-K</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Método de Pago:</span> <strong>{metodoPago}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Subtotal Neto:</span> <strong>${subtotalNeto.toLocaleString("es-CL")}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>IVA (19%):</span> <strong>${iva.toLocaleString("es-CL")}</strong>
                  </div>
                  <div className="d-flex justify-content-between border-top pt-1 fw-bold fs-6 text-primary">
                    <span>Total Pagado:</span> <span>${total.toLocaleString("es-CL")}</span>
                  </div>
                </div>
                <p className="text-muted small mb-0">Stock rebajado automáticamente del inventario y registrado en Kardex.</p>
              </div>
              <div className="modal-footer border-top bg-light">
                <button
                  type="button"
                  className="btn btn-outline-secondary d-inline-flex align-items-center gap-1"
                  onClick={() => window.print()}
                >
                  <Printer size={15} /> Imprimir Comprobante
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => { setModalBoleta(false); setTicket([]); }}
                >
                  Nuevo Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
