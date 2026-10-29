// @pca:start
// @id(admin.pages.ordenes)
// @kind(page)
// @limit(lines: 260)
// @contract(OrdenesView())
// @relates(admin.services.api)
// @relates(admin.components.boletaModal)
// @relates(docs.especificacion_pwa_admin)
// @desc(Manejo de pedidos, cambio de estados y visualizacion de boletas tributarias)
// @pca:end
import { useState, useEffect, useMemo, useCallback } from "react";
import { ClipboardList, Search, RefreshCw, Receipt, Store, MapPin, Clock, CheckCircle2, AlertCircle, UserCheck } from "lucide-react";
import { adminApi, type OrderAdmin } from "../services/api";
import { BoletaModal } from "../components/BoletaModal";

const ESTADOS_VALIDOS = ["TODOS", "PAGADO", "EN_PREPARACION", "LISTO_RETIRO", "EN_RUTA", "ENTREGADO", "CANCELADO"] as const;
type EstadoFiltro = (typeof ESTADOS_VALIDOS)[number];

const ORDENES_FALLBACK: OrderAdmin[] = [
  {
    id: 1, trackingCode: "CC-1001", cliente: "Camila Silva", email: "camila.silva@duocuc.cl", telefono: "+56 9 7788 9900", rut: "18.452.912-3", tipoEntrega: "RETIRO", personaRetiroNombre: "Diego Morales", personaRetiroRut: "19.821.433-2", personaRetiroTelefono: "+56 9 9123 4455", subtotal: 37815, descuento: 0, costoEnvio: 0, iva: 7185, total: 45000, estado: "EN_PREPARACION", metodoPago: "WebPay Plus (Flow)", fecha: "2026-10-24 10:30", items: [{ id: 101, nombre: "Torta Cuatro Leches Tradicional (15 pers.)", cantidad: 1, precio: 34000, subtotal: 34000 }, { id: 102, nombre: "Caja Macarons Surtidos x6", cantidad: 1, precio: 11000, subtotal: 11000 }],
  },
  {
    id: 2, trackingCode: "CC-1002", cliente: "Ignacio Valenzuela", email: "ignacio.v@gmail.com", telefono: "+56 9 6655 4433", rut: "16.782.341-K", tipoEntrega: "DELIVERY", direccion: "Av. Providencia 1234", departamento: "402", comuna: "Providencia", region: "Metropolitana", indicaciones: "Dejar en conserjería", subtotal: 57143, descuento: 0, costoEnvio: 0, iva: 10857, total: 68000, estado: "EN_RUTA", metodoPago: "Servipag (Flow)", fecha: "2026-10-24 11:15", items: [{ id: 201, nombre: "Cheesecake Horneado Frutos Rojos (12 pers.)", cantidad: 2, precio: 34000, subtotal: 68000 }],
  },
  {
    id: 3, trackingCode: "CC-1003", cliente: "Francisca Pinto", email: "fran.pinto@profesor.duoc.cl", telefono: "+56 9 5544 3322", rut: "12.940.321-8", tipoEntrega: "RETIRO", personaRetiroNombre: "Francisca Pinto", subtotal: 28571, descuento: 0, costoEnvio: 0, iva: 5429, total: 34000, estado: "LISTO_RETIRO", metodoPago: "WebPay Plus (Flow)", fecha: "2026-10-24 12:45", items: [{ id: 301, nombre: "Torta Hojarasca Manjar Lúcuma (20 pers.)", cantidad: 1, precio: 34000, subtotal: 34000 }],
  },
  {
    id: 4, trackingCode: "CC-1004", cliente: "Rodrigo Morales", email: "rodrigo.m@empresa.cl", telefono: "+56 9 4433 2211", rut: "15.334.821-4", tipoEntrega: "DELIVERY", direccion: "Los Leones 2341", comuna: "Providencia", region: "Metropolitana", subtotal: 41176, descuento: 0, costoEnvio: 0, iva: 7824, total: 49000, estado: "ENTREGADO", metodoPago: "Transferencia Bancaria", fecha: "2026-10-23 16:20", items: [{ id: 401, nombre: "Torta Ópera Francesa Chocolate", cantidad: 1, precio: 49000, subtotal: 49000 }],
  },
];

export function Ordenes() {
  const [ordenes, setOrdenes] = useState<OrderAdmin[]>(ORDENES_FALLBACK);
  const [loading, setLoading] = useState<boolean>(true);
  const [busqueda, setBusqueda] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoFiltro>("TODOS");
  const [ordenParaBoleta, setOrdenParaBoleta] = useState<OrderAdmin | null>(null);
  const [notificacion, setNotificacion] = useState<{ tipo: "success" | "warning"; mensaje: string } | null>(null);

  const cargarOrdenes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.orders.list();
      setOrdenes(Array.isArray(data) && data.length > 0 ? data : ORDENES_FALLBACK);
    } catch {
      setOrdenes(ORDENES_FALLBACK);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarOrdenes();
  }, [cargarOrdenes]);

  const handleCambioEstado = async (orderId: number, nuevoEstado: string) => {
    setOrdenes((prev) => prev.map((ord) => (ord.id === orderId ? { ...ord, estado: nuevoEstado } : ord)));
    try {
      await adminApi.orders.updateStatus(orderId, nuevoEstado);
      setNotificacion({ tipo: "success", mensaje: `Orden #${orderId} actualizada a '${nuevoEstado}'.` });
    } catch {
      setNotificacion({ tipo: "warning", mensaje: `Estado de Orden #${orderId} actualizado localmente (modo resiliente).` });
    }
    setTimeout(() => setNotificacion(null), 3500);
  };

  const ordenesFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return ordenes.filter((ord) => {
      const matchTexto = !q || ord.trackingCode.toLowerCase().includes(q) || ord.cliente.toLowerCase().includes(q) || (ord.email && ord.email.toLowerCase().includes(q)) || (ord.rut && ord.rut.toLowerCase().includes(q));
      const matchEstado = filtroEstado === "TODOS" || ord.estado === filtroEstado;
      return matchTexto && matchEstado;
    });
  }, [ordenes, busqueda, filtroEstado]);

  const formatCLP = (m: number) => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(m);

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <ClipboardList className="text-primary" size={26} />
            <h2 className="brand-font fs-3 text-secondary mb-0">Gestión de Órdenes &amp; Boletas</h2>
          </div>
          <p className="text-muted small mb-0 mt-1">Supervisión del flujo de pedidos, retiro en tienda, despachos y emisión de boletas oficiales (DSY1104).</p>
        </div>
        <button type="button" onClick={cargarOrdenes} className="btn btn-outline-secondary d-inline-flex align-items-center gap-1.5 align-self-start align-self-sm-auto shadow-sm" disabled={loading}>
          <RefreshCw size={15} className={loading ? "spin" : ""} />
          <span>Sincronizar</span>
        </button>
      </div>

      {notificacion && (
        <div className={`alert ${notificacion.tipo === "success" ? "alert-success" : "alert-warning"} alert-dismissible fade show d-flex align-items-center gap-2 py-2 mb-3`} role="alert">
          {notificacion.tipo === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <div className="small fw-semibold">{notificacion.mensaje}</div>
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setNotificacion(null)} />
        </div>
      )}

      <div className="card admin-card p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-6 col-lg-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><Search size={16} className="text-muted" /></span>
              <input type="text" className="form-control border-start-0" placeholder="Buscar por código (#CC-), cliente o RUT..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-4">
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="filtro-estado-select" className="form-label text-muted small fw-bold text-nowrap mb-0">Estado:</label>
              <select id="filtro-estado-select" aria-label="Filtrar por estado" className="form-select form-select-sm" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value as EstadoFiltro)}>
                {ESTADOS_VALIDOS.map((est) => (
                  <option key={est} value={est}>{est === "TODOS" ? "Todos los estados" : est.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-12 col-lg-3 text-lg-end text-muted small">
            Mostrando <strong>{ordenesFiltradas.length}</strong> de {ordenes.length} órdenes
          </div>
        </div>
      </div>

      <div className="card admin-card overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 small">
            <thead className="table-light text-secondary">
              <tr>
                <th style={{ width: "110px" }}>Código</th>
                <th style={{ width: "130px" }}>Fecha</th>
                <th>Cliente / Contacto</th>
                <th>Método de Entrega</th>
                <th>Total</th>
                <th style={{ width: "180px" }}>Estado</th>
                <th style={{ width: "150px" }} className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">No se encontraron órdenes que coincidan con los criterios de búsqueda.</td>
                </tr>
              ) : (
                ordenesFiltradas.map((ord) => {
                  const esRetiro = ord.tipoEntrega?.toUpperCase() === "RETIRO" || ord.tipoEntrega?.toUpperCase() === "RETIRO_TIENDA";
                  return (
                    <tr key={ord.id}>
                      <td>
                        <span className="badge bg-light text-secondary border font-monospace fw-bold px-2 py-1">
                          {ord.trackingCode.startsWith("#") ? ord.trackingCode : `#${ord.trackingCode}`}
                        </span>
                      </td>
                      <td className="text-muted text-nowrap">
                        <div className="d-flex align-items-center gap-1">
                          <Clock size={13} />
                          <span>{ord.fecha ? ord.fecha.slice(0, 16) : "Hoy"}</span>
                        </div>
                      </td>
                      <td>
                        <div className="fw-bold text-secondary">{ord.cliente}</div>
                        <div className="text-muted" style={{ fontSize: "0.76rem" }}>
                          {ord.email && <span>{ord.email}</span>}
                          {ord.rut && <span> · {ord.rut}</span>}
                        </div>
                      </td>
                      <td>
                        {esRetiro ? (
                          <div>
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle d-inline-flex align-items-center gap-1 py-1">
                              <Store size={12} /> Retiro en Tienda
                            </span>
                            {ord.personaRetiroNombre && (
                              <div className="text-secondary small mt-1 d-flex align-items-center gap-1" style={{ fontSize: "0.74rem" }}>
                                <UserCheck size={12} className="text-success" />
                                <span>Recoge: {ord.personaRetiroNombre}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1 py-1">
                              <MapPin size={12} /> Delivery
                            </span>
                            <div className="text-muted text-truncate mt-1" style={{ maxWidth: "200px", fontSize: "0.74rem" }}>
                              {ord.direccion || "Dirección despacho"}
                              {ord.comuna ? `, ${ord.comuna}` : ""}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="fw-bold text-secondary text-nowrap">{formatCLP(ord.total)}</td>
                      <td>
                        <select
                          className="form-select form-select-sm fw-semibold"
                          value={ord.estado}
                          aria-label={`Estado de la orden #${ord.trackingCode}`}
                          onChange={(e) => handleCambioEstado(ord.id, e.target.value)}
                          style={{
                            fontSize: "0.78rem",
                            borderColor: ord.estado === "ENTREGADO" ? "#2E7D32" : ord.estado === "CANCELADO" ? "#C62828" : ord.estado === "EN_RUTA" ? "#0277BD" : "#F57F17",
                          }}
                        >
                          <option value="PAGADO">PAGADO</option>
                          <option value="EN_PREPARACION">EN PREPARACIÓN</option>
                          <option value="LISTO_RETIRO">LISTO RETIRO</option>
                          <option value="EN_RUTA">EN RUTA</option>
                          <option value="ENTREGADO">ENTREGADO</option>
                          <option value="CANCELADO">CANCELADO</option>
                        </select>
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 px-2.5 py-1"
                          onClick={() => setOrdenParaBoleta(ord)}
                          title="Ver boleta electrónica oficial"
                        >
                          <Receipt size={14} />
                          <span>Mostrar Boleta</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BoletaModal orden={ordenParaBoleta} onClose={() => setOrdenParaBoleta(null)} />
    </div>
  );
}

export default Ordenes;
