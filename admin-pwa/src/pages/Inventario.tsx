// @pca:start
// @id(admin.pages.inventario)
// @kind(page)
// @limit(lines: 480)
// @contract(InventarioAdminView())
// @relates(docs.especificacion_pwa_admin)
// @relates(admin.services.api)
// @desc(Control de stock con semaforo, movimientos Kardex y registro de mermas)
// @pca:end
import { useState, useEffect } from "react";
import { adminApi } from "../services/api";
import {
  ArrowDown,
  ArrowUp,
  History,
  PackagePlus,
  Search,
} from "lucide-react";

interface ItemStock {
  id: number;
  nombre: string;
  categoria: "insumo" | "producto_terminado";
  stockActual: number;
  unidad: string;
  stockMinimo: number;
  estado: "optimo" | "reabastecer" | "critico";
}

interface MovimientoKardex {
  id: number;
  fecha: string;
  tipo: "ENTRADA" | "SALIDA_MERMA" | "VENTA_POS" | "AJUSTE";
  item: string;
  cantidad: number;
  unidad: string;
  motivo: string;
  responsable: string;
  saldoResultante: number;
}

const ITEMS_INICIALES: ItemStock[] = [
  { id: 1, nombre: "Crema Chantilly 35% MG", categoria: "insumo", stockActual: 3.5, unidad: "L", stockMinimo: 10, estado: "critico" },
  { id: 2, nombre: "Harina de Almendras Fina", categoria: "insumo", stockActual: 1.2, unidad: "kg", stockMinimo: 5, estado: "critico" },
  { id: 3, nombre: "Frutillas Frescas Selección", categoria: "insumo", stockActual: 4, unidad: "kg", stockMinimo: 8, estado: "reabastecer" },
  { id: 4, nombre: "Manjar Artesanal de Campo", categoria: "insumo", stockActual: 18, unidad: "kg", stockMinimo: 10, estado: "optimo" },
  { id: 5, nombre: "Torta Cuatro Leches (Stock Vitrina)", categoria: "producto_terminado", stockActual: 6, unidad: "un.", stockMinimo: 3, estado: "optimo" },
];

const KARDEX_INICIAL: MovimientoKardex[] = [
  { id: 1, fecha: "2026-10-24 11:20", tipo: "SALIDA_MERMA", item: "Crema Chantilly 35% MG", cantidad: -1.5, unidad: "L", motivo: "Vencimiento lote cadena de frío", responsable: "Carlos Pastelería", saldoResultante: 3.5 },
  { id: 2, fecha: "2026-10-24 09:15", tipo: "ENTRADA", item: "Manjar Artesanal de Campo", cantidad: 15, unidad: "kg", motivo: "Recepción Proveedor Dulces del Valle #8821", responsable: "Anaís Admin", saldoResultante: 18 },
  { id: 3, fecha: "2026-10-23 18:40", tipo: "VENTA_POS", item: "Torta Cuatro Leches (Vitrina)", cantidad: -1, unidad: "un.", motivo: "Venta Boleta #CC-9412", responsable: "Caja Mostrador 1", saldoResultante: 6 },
];

export function Inventario() {
  const [items, setItems] = useState<ItemStock[]>(ITEMS_INICIALES);
  const [kardex, setKardex] = useState<MovimientoKardex[]>(KARDEX_INICIAL);
  const [busqueda, setBusqueda] = useState("");
  const [modalAjuste, setModalAjuste] = useState(false);

  useEffect(() => {
    let montado = true;
    async function cargarInventario() {
      try {
        const [itemsData, kardexData] = await Promise.all([
          adminApi.inventory.getItems(),
          adminApi.inventory.getKardex(),
        ]);
        if (montado) {
          if (Array.isArray(itemsData) && itemsData.length > 0) {
            const adaptados: ItemStock[] = itemsData.map((it) => ({
              id: it.id,
              nombre: it.nombre,
              categoria: it.categoria?.toLowerCase().includes("insumo") ? "insumo" : "producto_terminado",
              stockActual: it.stockActual,
              unidad: "un.",
              stockMinimo: it.stockMinimo,
              estado: it.estadoSemaforo === "ROJO" ? "critico" : it.estadoSemaforo === "AMARILLO" ? "reabastecer" : "optimo",
            }));
            setItems(adaptados);
            if (adaptados[0]) setItemSeleccionado(adaptados[0].nombre);
          }
          if (Array.isArray(kardexData) && kardexData.length > 0) {
            const adaptadosK: MovimientoKardex[] = kardexData.map((k) => ({
              id: k.id,
              fecha: k.fecha ? k.fecha.replace("T", " ").slice(0, 16) : new Date().toISOString().slice(0, 16).replace("T", " "),
              tipo: (k.tipo as MovimientoKardex["tipo"]) || "AJUSTE",
              item: k.productoNombre || k.producto || "Producto",
              cantidad: k.cantidad,
              unidad: "un.",
              motivo: k.motivo || (k.boleta ? `Boleta ${k.boleta}` : "Ajuste inventario"),
              responsable: "Caja/Bodega",
              saldoResultante: k.saldo,
            }));
            setKardex(adaptadosK);
          }
        }
      } catch {
        // Fallback local
      }
    }
    void cargarInventario();
    return () => {
      montado = false;
    };
  }, []);

  // Form ajuste
  const [itemSeleccionado, setItemSeleccionado] = useState(items[0]?.nombre ?? "");
  const [tipoAjuste, setTipoAjuste] = useState<"ENTRADA" | "SALIDA_MERMA" | "AJUSTE">("SALIDA_MERMA");
  const [cantidadAjuste, setCantidadAjuste] = useState<number>(1);
  const [motivoAjuste, setMotivoAjuste] = useState("");

  const filtrados = items.filter((i) =>
    i.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  function registrarAjuste(e: React.FormEvent) {
    e.preventDefault();
    const itemTarget = items.find((i) => i.nombre === itemSeleccionado);
    if (!itemTarget || !motivoAjuste.trim()) return;

    const delta = tipoAjuste === "ENTRADA" ? Math.abs(cantidadAjuste) : -Math.abs(cantidadAjuste);
    const nuevoStock = Math.max(0, itemTarget.stockActual + delta);

    if (tipoAjuste === "SALIDA_MERMA") {
      adminApi.inventory.registerMerma({
        producto: itemSeleccionado,
        cantidad: Math.abs(cantidadAjuste),
        motivo: motivoAjuste,
      }).catch(() => {});
    }

    let nuevoEstado: ItemStock["estado"] = "optimo";
    if (nuevoStock <= itemTarget.stockMinimo * 0.5) {
      nuevoEstado = "critico";
    } else if (nuevoStock <= itemTarget.stockMinimo) {
      nuevoEstado = "reabastecer";
    }

    setItems((prev) =>
      prev.map((i) =>
        i.nombre === itemSeleccionado
          ? { ...i, stockActual: nuevoStock, estado: nuevoEstado }
          : i
      )
    );

    const nuevoMov: MovimientoKardex = {
      id: Date.now(),
      fecha: new Date().toISOString().slice(0, 16).replace("T", " "),
      tipo: tipoAjuste,
      item: itemSeleccionado,
      cantidad: delta,
      unidad: itemTarget.unidad,
      motivo: motivoAjuste,
      responsable: "Administrador Demo",
      saldoResultante: nuevoStock,
    };

    setKardex([nuevoMov, ...kardex]);
    setModalAjuste(false);
    setMotivoAjuste("");
  }

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="brand-font fs-3 text-secondary mb-1">
            Inventario &amp; Control de Stock
          </h2>
          <p className="text-muted small mb-0">
            Control de insumos de repostería, stock en vitrina y mermas con React + Bootstrap 5.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalAjuste(true)}
          className="btn btn-primary d-inline-flex align-items-center gap-2"
        >
          <PackagePlus size={18} />
          <span>Registrar Ajuste / Merma</span>
        </button>
      </div>

      {/* Semáforo de Existencias */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-4">
          <div className="card admin-card p-3 border-success-subtle bg-success-subtle">
            <div className="d-flex align-items-center justify-content-between">
              <span className="small text-uppercase fw-bold text-success">Nivel Óptimo</span>
              <span className="badge bg-success rounded-pill" style={{ width: "10px", height: "10px", padding: 0 }} />
            </div>
            <div className="fs-3 fw-bold text-success mt-2">
              {items.filter((i) => i.estado === "optimo").length} ítems
            </div>
            <div className="small text-success mt-1">Existencias seguras en pastelería</div>
          </div>
        </div>

        <div className="col-12 col-sm-4">
          <div className="card admin-card p-3 border-warning-subtle bg-warning-subtle">
            <div className="d-flex align-items-center justify-content-between">
              <span className="small text-uppercase fw-bold text-warning-emphasis">Por Reabastecer</span>
              <span className="badge bg-warning rounded-pill" style={{ width: "10px", height: "10px", padding: 0 }} />
            </div>
            <div className="fs-3 fw-bold text-warning-emphasis mt-2">
              {items.filter((i) => i.estado === "reabastecer").length} ítems
            </div>
            <div className="small text-warning-emphasis mt-1">Cerca del umbral de reposición</div>
          </div>
        </div>

        <div className="col-12 col-sm-4">
          <div className="card admin-card p-3 border-danger-subtle bg-danger-subtle">
            <div className="d-flex align-items-center justify-content-between">
              <span className="small text-uppercase fw-bold text-danger">Stock Crítico</span>
              <span className="badge bg-danger rounded-pill" style={{ width: "10px", height: "10px", padding: 0 }} />
            </div>
            <div className="fs-3 fw-bold text-danger mt-2">
              {items.filter((i) => i.estado === "critico").length} ítems
            </div>
            <div className="small text-danger mt-1">Requiere compra urgente hoy</div>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="card admin-card p-3 mb-4">
        <div className="input-group">
          <span className="input-group-text bg-light border-end-0 text-muted">
            <Search size={16} />
          </span>
          <input
            type="text"
            className="form-control border-start-0 bg-light"
            placeholder="Filtrar por insumo o producto terminado..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla de Existencias */}
      <div className="card admin-card overflow-hidden mb-4">
        <div className="table-responsive">
          <table className="table table-hover admin-table align-middle mb-0">
            <thead>
              <tr>
                <th className="ps-4">Ítem / Insumo</th>
                <th>Tipo</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
                <th className="text-end pe-4">Estado Semáforo</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((item) => (
                <tr key={item.id}>
                  <td className="ps-4 fw-bold text-secondary">{item.nombre}</td>
                  <td className="small text-muted text-capitalize">
                    {item.categoria.replace("_", " ")}
                  </td>
                  <td className="fw-bold text-secondary">
                    {item.stockActual} {item.unidad}
                  </td>
                  <td className="small text-muted">
                    {item.stockMinimo} {item.unidad}
                  </td>
                  <td className="text-end pe-4">
                    <span
                      className={`badge rounded-pill ${
                        item.estado === "critico"
                          ? "bg-danger"
                          : item.estado === "reabastecer"
                          ? "bg-warning text-dark"
                          : "bg-success"
                      }`}
                    >
                      {item.estado === "critico"
                        ? "Crítico"
                        : item.estado === "reabastecer"
                        ? "Por reabastecer"
                        : "Óptimo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Kardex */}
      <div className="card admin-card p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <History size={20} className="text-primary" />
            <h3 className="brand-font fs-5 mb-0 text-secondary">
              Trazabilidad de Movimientos (Kardex)
            </h3>
          </div>
          <span className="text-muted small">Últimos movimientos registrados</span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover admin-table align-middle mb-0 small">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Insumo</th>
                <th>Variación</th>
                <th>Motivo / Justificación</th>
                <th>Responsable</th>
                <th className="text-end">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {kardex.map((mov) => (
                <tr key={mov.id}>
                  <td className="text-muted text-nowrap">{mov.fecha}</td>
                  <td>
                    <span
                      className={`badge d-inline-flex align-items-center gap-1 ${
                        mov.tipo === "ENTRADA"
                          ? "bg-success"
                          : mov.tipo === "SALIDA_MERMA"
                          ? "bg-danger"
                          : "bg-info text-dark"
                      }`}
                    >
                      {mov.tipo === "ENTRADA" ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                      {mov.tipo}
                    </span>
                  </td>
                  <td className="fw-semibold text-secondary">{mov.item}</td>
                  <td className="fw-bold text-secondary">
                    {mov.cantidad > 0 ? `+${mov.cantidad}` : mov.cantidad} {mov.unidad}
                  </td>
                  <td className="text-secondary">{mov.motivo}</td>
                  <td className="text-muted">{mov.responsable}</td>
                  <td className="text-end fw-bold text-secondary">
                    {mov.saldoResultante} {mov.unidad}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajuste */}
      {modalAjuste && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setModalAjuste(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content admin-modal-content">
              <div className="modal-header admin-modal-header">
                <h5 className="modal-title brand-font fs-5 text-secondary">
                  Registrar Ajuste o Merma
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalAjuste(false)}
                />
              </div>
              <form onSubmit={registrarAjuste}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase text-secondary">
                      Insumo o Producto
                    </label>
                    <select
                      value={itemSeleccionado}
                      onChange={(e) => setItemSeleccionado(e.target.value)}
                      className="form-select"
                    >
                      {items.map((i) => (
                        <option key={i.id} value={i.nombre}>
                          {i.nombre} (Stock actual: {i.stockActual} {i.unidad})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase text-secondary">
                        Tipo de Operación
                      </label>
                      <select
                        value={tipoAjuste}
                        onChange={(e) =>
                          setTipoAjuste(
                            e.target.value as "ENTRADA" | "SALIDA_MERMA" | "AJUSTE"
                          )
                        }
                        className="form-select"
                      >
                        <option value="SALIDA_MERMA">Salida por Merma / Desecho</option>
                        <option value="ENTRADA">Entrada por Compra</option>
                        <option value="AJUSTE">Ajuste por Conteo Físico</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase text-secondary">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        required
                        value={cantidadAjuste}
                        onChange={(e) => setCantidadAjuste(Number(e.target.value))}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label small fw-bold text-uppercase text-secondary">
                      Motivo / Justificación Obligatoria
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Ej: Insumo derramado durante batido de turno tarde"
                      value={motivoAjuste}
                      onChange={(e) => setMotivoAjuste(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="modal-footer border-top bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setModalAjuste(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Guardar Movimiento
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
