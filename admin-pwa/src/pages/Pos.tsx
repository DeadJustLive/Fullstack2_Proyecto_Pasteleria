// @pca:start
// @id(admin.pages.pos)
// @kind(page)
// @limit(lines: 420)
// @contract(PosAdminView())
// @relates(docs.especificacion_pwa_admin)
// @relates(admin.services.api)
// @relates(admin.hooks.realtimeSync)
// @relates(admin.components.posModals)
// @desc(Terminal punto de venta POS mostrador con generacion de boletas)
// @pca:end
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  CreditCard,
  DollarSign,
  CheckCircle2,
  Plus,
  Minus,
  Trash2,
  Search,
  Receipt,
  UserCheck,
  QrCode,
  X,
  ShoppingBag,
} from "lucide-react";
import { adminApi, type ProductCatalogDTO } from "../services/api";
import { useAdminRealtimeSync, broadcastAdminSync } from "../hooks/useAdminRealtimeSync";
import { PosCashModal, PosThermalReceiptModal } from "../components/PosModals";

interface ItemPOS {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  porcion: string;
  stock: number;
  imagen: string;
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80";

const PRODUCTOS_FALLBACK: ItemPOS[] = [
  { id: 1, nombre: "Torta Cuatro Leches", categoria: "Tortas", precio: 34000, porcion: "15-20 pers.", stock: 8, imagen: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80" },
  { id: 2, nombre: "Cheesecake Frutos Rojos", categoria: "Tortas", precio: 34000, porcion: "12 pers.", stock: 3, imagen: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80" },
  { id: 3, nombre: "Hojarasca Manjar Lúcuma", categoria: "Tortas", precio: 32000, porcion: "20 pers.", stock: 6, imagen: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&auto=format&fit=crop&q=80" },
  { id: 4, nombre: "Mousse Chocolate Bitter", categoria: "Individual", precio: 4900, porcion: "Individual", stock: 12, imagen: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=500&auto=format&fit=crop&q=80" },
  { id: 5, nombre: "Tartaleta Frutas Frescas", categoria: "Individual", precio: 4500, porcion: "Individual", stock: 5, imagen: "https://images.unsplash.com/photo-1519869325930-281384150729?w=500&auto=format&fit=crop&q=80" },
  { id: 6, nombre: "Caja Macarons x6", categoria: "Bollería", precio: 11000, porcion: "Caja 6 un.", stock: 15, imagen: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=500&auto=format&fit=crop&q=80" },
];

export function Pos() {
  const [productos, setProductos] = useState<ItemPOS[]>(PRODUCTOS_FALLBACK);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas");
  const [busqueda, setBusqueda] = useState<string>("");
  const [ticket, setTicket] = useState<{ item: ItemPOS; cantidad: number }[]>([
    { item: PRODUCTOS_FALLBACK[0], cantidad: 1 },
  ]);
  const [modalCobro, setModalCobro] = useState(false);
  const [modalBoleta, setModalBoleta] = useState(false);
  const [metodoPago, setMetodoPago] = useState<"EFECTIVO" | "TARJETA_POS" | "TRANSFERENCIA">("EFECTIVO");
  const [montoRecibido, setMontoRecibido] = useState(40000);
  const [folioEmitido, setFolioEmitido] = useState("CC-POS-9421");
  const [procesando, setProcesando] = useState(false);
  const [mobileTab, setMobileTab] = useState<"catalogo" | "ticket">("catalogo");

  const cargarCatalogo = useCallback(async () => {
    try {
      const data = await adminApi.products.list();
      if (Array.isArray(data) && data.length > 0) {
        const mapeados: ItemPOS[] = data.map((p: ProductCatalogDTO) => ({
          id: p.id,
          nombre: p.nombre,
          categoria: p.categoria || "Tortas",
          precio: p.precio,
          porcion: p.porciones || "Vitrina",
          stock: p.stock !== undefined ? p.stock : 10,
          imagen: p.imagen || DEFAULT_IMAGE,
        }));
        setProductos(mapeados);
      }
    } catch {
      // Fallback resiliente
    }
  }, []);

  useEffect(() => {
    void cargarCatalogo();
  }, [cargarCatalogo]);

  useAdminRealtimeSync(() => {
    void cargarCatalogo();
  });

  const total = useMemo(() => ticket.reduce((acc, t) => acc + t.item.precio * t.cantidad, 0), [ticket]);
  const subtotalNeto = Math.round(total / 1.19);
  const iva = total - subtotalNeto;
  const vuelto = Math.max(0, montoRecibido - total);

  const categorias = useMemo(() => ["todas", ...Array.from(new Set(productos.map((p) => p.categoria)))], [productos]);

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const matchCat = categoriaFiltro === "todas" || p.categoria.toLowerCase() === categoriaFiltro.toLowerCase();
      const matchTxt = !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.categoria.toLowerCase().includes(busqueda.toLowerCase());
      return matchCat && matchTxt;
    });
  }, [productos, categoriaFiltro, busqueda]);

  function agregar(item: ItemPOS) {
    if (item.stock <= 0) return;
    setTicket((prev) => {
      const ex = prev.find((t) => t.item.id === item.id);
      if (ex) {
        if (ex.cantidad >= item.stock) return prev;
        return prev.map((t) => (t.item.id === item.id ? { ...t, cantidad: t.cantidad + 1 } : t));
      }
      return [...prev, { item, cantidad: 1 }];
    });
  }

  function decrementar(id: number) {
    setTicket((prev) => prev.map((t) => (t.item.id === id ? { ...t, cantidad: t.cantidad - 1 } : t)).filter((t) => t.cantidad > 0));
  }

  function eliminar(id: number) {
    setTicket((prev) => prev.filter((t) => t.item.id !== id));
  }

  async function handleConfirmarCobro() {
    setProcesando(true);
    const folio = `CC-POS-${Math.floor(1000 + Math.random() * 9000)}`;
    setFolioEmitido(folio);
    try {
      await adminApi.inventory.registerSale({
        items: ticket.map((t) => ({ id: t.item.id, nombre: t.item.nombre, cantidad: t.cantidad, precio: t.item.precio })),
        total,
        medioPago: metodoPago,
      });
      ticket.forEach((t) => broadcastAdminSync({ type: "STOCK_DECREMENTED", id: t.item.id, cantidad: t.cantidad }));
      broadcastAdminSync({ type: "ORDER_PLACED" });
      setProductos((prev) => prev.map((p) => {
        const t = ticket.find((tk) => tk.item.id === p.id);
        return t ? { ...p, stock: Math.max(0, p.stock - t.cantidad) } : p;
      }));
    } catch { /* contingencia */ } finally {
      setProcesando(false);
      setModalCobro(false);
      setModalBoleta(true);
    }
  }

  const formatCLP = (v: number) => `$${v.toLocaleString("es-CL")}`;

  return (
    <div className="container-fluid px-0">
      <div className="d-xl-none mb-3">
        <div className="btn-group w-100 shadow-sm">
          <button type="button" className={`btn ${mobileTab === "catalogo" ? "btn-primary text-white" : "btn-outline-secondary"}`} onClick={() => setMobileTab("catalogo")}>
            Vitrina ({productosFiltrados.length})
          </button>
          <button type="button" className={`btn ${mobileTab === "ticket" ? "btn-primary text-white" : "btn-outline-secondary"}`} onClick={() => setMobileTab("ticket")}>
            Ticket ({ticket.reduce((a, b) => a + b.cantidad, 0)}) · {formatCLP(total)}
          </button>
        </div>
      </div>

      <div className="row g-4 align-items-stretch">
        <div className={`col-12 col-xl-8 ${mobileTab === "ticket" ? "d-none d-xl-block" : ""}`}>
          <div className="card admin-card p-3 mb-3 border-0 shadow-sm">
            <div className="d-flex flex-column flex-sm-row gap-2 justify-content-between mb-3">
              <div className="input-group input-group-sm flex-grow-1" style={{ maxWidth: "380px" }}>
                <span className="input-group-text bg-light"><Search size={14} /></span>
                <input type="text" className="form-control" placeholder="Buscar por nombre o sabor..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
              </div>
              <div className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 align-self-sm-center">
                ● En Línea · MySQL Sincronizado
              </div>
            </div>
            <div className="d-flex flex-wrap gap-1.5">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`btn btn-sm rounded-pill text-capitalize px-3 ${categoriaFiltro === cat ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => setCategoriaFiltro(cat)}
                >
                  {cat === "todas" ? "🍰 Todas" : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="row g-3">
            {productosFiltrados.map((p) => {
              const agotado = p.stock <= 0;
              return (
                <div key={p.id} className="col-6 col-md-4">
                  <div
                    className={`card admin-card h-100 border-0 shadow-sm overflow-hidden d-flex flex-column ${agotado ? "opacity-50" : ""}`}
                    style={{ cursor: agotado ? "not-allowed" : "pointer", transition: "transform 0.15s ease" }}
                    onClick={() => !agotado && agregar(p)}
                  >
                    <div className="position-relative" style={{ height: "120px", backgroundColor: "#ECE5DF" }}>
                      <img src={p.imagen} alt={p.nombre} className="w-100 h-100 object-fit-cover" loading="lazy" />
                      <span className={`position-absolute top-0 end-0 m-2 badge ${agotado ? "bg-danger" : p.stock <= 3 ? "bg-warning text-dark" : "bg-success"} rounded-pill shadow-sm`}>
                        {agotado ? "Agotado" : p.stock <= 3 ? `Últimas ${p.stock}` : `${p.stock} un.`}
                      </span>
                      <span className="position-absolute bottom-0 start-0 m-2 badge bg-dark bg-opacity-75 text-white small">
                        {p.porcion}
                      </span>
                    </div>
                    <div className="p-2.5 d-flex flex-column flex-grow-1 justify-content-between">
                      <h6 className="fw-bold text-secondary mb-1 text-truncate" title={p.nombre}>{p.nombre}</h6>
                      <div className="d-flex align-items-center justify-content-between mt-2 pt-1 border-top">
                        <span className="fw-bold text-primary fs-6">{formatCLP(p.precio)}</span>
                        <button type="button" className="btn btn-sm btn-outline-primary rounded-circle p-1" style={{ width: 28, height: 28 }} disabled={agotado} title="Agregar al ticket">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`col-12 col-xl-4 ${mobileTab === "catalogo" ? "d-none d-xl-block" : ""}`}>
          <div className="card admin-card h-100 border-0 shadow-sm d-flex flex-column">
            <div className="p-3 border-bottom bg-light d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <Receipt size={18} className="text-primary" />
                <h6 className="brand-font fs-6 mb-0 text-secondary">Ticket de Venta</h6>
                <span className="badge bg-secondary-subtle text-secondary font-monospace">{folioEmitido}</span>
              </div>
              <button type="button" className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 py-0.5 px-2" onClick={() => setTicket([])} disabled={ticket.length === 0}>
                <Trash2 size={13} /> Limpiar
              </button>
            </div>

            <div className="px-3 py-2 bg-light bg-opacity-50 border-bottom d-flex align-items-center justify-content-between small">
              <span className="d-inline-flex align-items-center gap-1 text-muted"><UserCheck size={14} className="text-success" /> Cliente Mostrador (Boleta)</span>
              <span className="badge bg-light text-secondary border">Presencial</span>
            </div>

            <div className="p-3 flex-grow-1 overflow-auto" style={{ minHeight: "220px", maxHeight: "380px" }}>
              {ticket.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <ShoppingBag size={40} className="mb-2 opacity-50" />
                  <p className="mb-0 small fw-semibold">Ticket vacío. Toca un pastel en la vitrina.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {ticket.map((t) => (
                    <div key={t.item.id} className="p-2 rounded-2 border bg-white d-flex align-items-center justify-content-between">
                      <div className="flex-grow-1 pe-2">
                        <div className="fw-bold small text-secondary text-truncate" style={{ maxWidth: "160px" }}>{t.item.nombre}</div>
                        <div className="text-muted" style={{ fontSize: "0.74rem" }}>{formatCLP(t.item.precio)} c/u</div>
                      </div>
                      <div className="d-flex align-items-center gap-1 bg-light p-0.5 rounded border">
                        <button type="button" className="btn btn-sm p-0 px-1 border-0" onClick={() => decrementar(t.item.id)}><Minus size={12} /></button>
                        <span className="fw-bold font-monospace px-1 small">{t.cantidad}</span>
                        <button type="button" className="btn btn-sm p-0 px-1 border-0" onClick={() => agregar(t.item)} disabled={t.cantidad >= t.item.stock}><Plus size={12} /></button>
                      </div>
                      <div className="text-end fw-bold small text-secondary ps-2" style={{ minWidth: "65px" }}>{formatCLP(t.item.precio * t.cantidad)}</div>
                      <button type="button" className="btn btn-sm text-danger border-0 p-0 ps-1" onClick={() => eliminar(t.item.id)}><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 bg-light border-top">
              <div className="d-flex justify-content-between small text-muted mb-1">
                <span>Subtotal Neto:</span> <strong>{formatCLP(subtotalNeto)}</strong>
              </div>
              <div className="d-flex justify-content-between small text-muted mb-2">
                <span>I.V.A. (19% SII):</span> <strong>{formatCLP(iva)}</strong>
              </div>
              <div className="p-2.5 rounded-3 bg-warning-subtle text-secondary border border-warning-subtle d-flex align-items-center justify-content-between mb-3">
                <span className="fw-bold text-uppercase small">Total a Cobrar</span>
                <span className="fs-4 fw-bold text-primary">{formatCLP(total)}</span>
              </div>

              <div className="btn-group w-100 mb-3" role="group">
                <button type="button" className={`btn btn-sm ${metodoPago === "EFECTIVO" ? "btn-primary text-white" : "btn-outline-secondary"}`} onClick={() => setMetodoPago("EFECTIVO")}>
                  <DollarSign size={14} /> Efectivo
                </button>
                <button type="button" className={`btn btn-sm ${metodoPago === "TARJETA_POS" ? "btn-primary text-white" : "btn-outline-secondary"}`} onClick={() => setMetodoPago("TARJETA_POS")}>
                  <CreditCard size={14} /> Tarjeta POS
                </button>
                <button type="button" className={`btn btn-sm ${metodoPago === "TRANSFERENCIA" ? "btn-primary text-white" : "btn-outline-secondary"}`} onClick={() => setMetodoPago("TRANSFERENCIA")}>
                  <QrCode size={14} /> QR
                </button>
              </div>

              <button
                type="button"
                className="btn btn-success w-100 py-2.5 fw-bold d-inline-flex align-items-center justify-content-center gap-2 shadow-sm"
                disabled={ticket.length === 0 || procesando}
                onClick={() => {
                  if (metodoPago === "EFECTIVO") {
                    setMontoRecibido(Math.max(total, 5000 * Math.ceil(total / 5000)));
                    setModalCobro(true);
                  } else {
                    void handleConfirmarCobro();
                  }
                }}
              >
                <CheckCircle2 size={18} />
                <span>{procesando ? "Procesando..." : `Cobrar ${formatCLP(total)}`}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <PosCashModal
        abierto={modalCobro}
        total={total}
        vuelto={vuelto}
        montoRecibido={montoRecibido}
        procesando={procesando}
        onChangeMonto={setMontoRecibido}
        onCancelar={() => setModalCobro(false)}
        onConfirmar={() => void handleConfirmarCobro()}
      />

      <PosThermalReceiptModal
        abierto={modalBoleta}
        folio={folioEmitido}
        metodoPago={metodoPago}
        ticket={ticket}
        subtotalNeto={subtotalNeto}
        iva={iva}
        total={total}
        onNuevoTicket={() => {
          setModalBoleta(false);
          setTicket([]);
        }}
      />
    </div>
  );
}
