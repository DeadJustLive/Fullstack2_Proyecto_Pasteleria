// @pca:start
// @id(admin.pages.productos)
// @kind(page)
// @limit(lines: 760)
// @contract(ProductosAdminView())
// @relates(admin.lib.validators)
// @relates(admin.hooks.realtimeSync)
// @relates(docs.especificacion_pwa_admin)
// @desc(Gestion de productos, edicion, reporte de criticos y alta de nuevos)
// @pca:end
import { useEffect, useState, useMemo, useCallback } from "react";
import { AlertCircle, AlertTriangle, BarChart3, Check, Edit2, Eye, Lock, Plus, Radio, RefreshCw, Search, Trash2 } from "lucide-react";
import { adminApi } from "../services/api";
import { useAdminRealtimeSync, broadcastAdminSync } from "../hooks/useAdminRealtimeSync";
import { validarProductoAdmin } from "../lib/validators";
import { AdminCriticalStockView } from "../features/AdminCriticalStock/implementation/AdminCriticalStock.view";
import { AdminImageOptimizerView } from "../features/AdminImageOptimizer/implementation/AdminImageOptimizer.view";

const STORAGE_KEY = "cremeco_products_availability";

export interface ProductoAdmin {
  id: number;
  codigo: string;
  nombre: string;
  categoria: "tortas" | "postres" | "individuales" | "sin-gluten";
  precio: number;
  porciones: string;
  stock: number;
  ventasHistoricas: number;
  disponible: boolean;
  descripcion?: string;
  imagen?: string;
  fechaCreacion?: string;
}

const PRODUCTOS_INICIALES: ProductoAdmin[] = [
  { id: 1, codigo: "TORT-001", nombre: "Torta de Chocolate Clásica", categoria: "tortas", precio: 35000, porciones: "12-20 pers.", stock: 12, ventasHistoricas: 148, disponible: true, descripcion: "Torta húmeda de chocolate con ganache al 70% de cacao.", imagen: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=200&auto=format&fit=crop", fechaCreacion: "2026-01-15" },
  { id: 2, codigo: "POST-002", nombre: "Tartaleta de Frutos Rojos", categoria: "postres", precio: 28000, porciones: "8-12 pers.", stock: 4, ventasHistoricas: 92, disponible: true, descripcion: "Masa sablée crocante con crema pastelera y berries.", imagen: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=200&auto=format&fit=crop", fechaCreacion: "2026-02-10" },
  { id: 3, codigo: "IND-003", nombre: "Caja de Macarons (12 uds)", categoria: "individuales", precio: 42000, porciones: "12 unidades", stock: 15, ventasHistoricas: 64, disponible: true, descripcion: "Selección gourmet de macarons franceses variados.", imagen: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?q=80&w=200&auto=format&fit=crop", fechaCreacion: "2026-03-01" },
  { id: 4, codigo: "TORT-004", nombre: "Cheesecake de Frutos Rojos", categoria: "tortas", precio: 30000, porciones: "10-16 pers.", stock: 3, ventasHistoricas: 110, disponible: true, descripcion: "Cheesecake horneado New York con coulis artesanal.", imagen: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=200&auto=format&fit=crop", fechaCreacion: "2026-03-14" },
  { id: 5, codigo: "SGLU-005", nombre: "Pancakes Sin Gluten", categoria: "sin-gluten", precio: 22000, porciones: "Torre familiar", stock: 14, ventasHistoricas: 35, disponible: true, descripcion: "Harina de almendras y avena certificada sin gluten.", imagen: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=200&auto=format&fit=crop", fechaCreacion: "2026-04-05" },
  { id: 6, codigo: "POST-006", nombre: "Tres Leches Clásica", categoria: "postres", precio: 32000, porciones: "15-25 pers.", stock: 6, ventasHistoricas: 84, disponible: true, descripcion: "Remojado en tres leches con toque de canela y merengue.", imagen: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?q=80&w=200&auto=format&fit=crop", fechaCreacion: "2026-05-18" },
  { id: 7, codigo: "POST-007", nombre: "Pastel de Zanahoria", categoria: "postres", precio: 26000, porciones: "10-15 pers.", stock: 9, ventasHistoricas: 42, disponible: true, descripcion: "Carrot cake con nueces y frosting de queso crema.", imagen: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?q=80&w=200&auto=format&fit=crop", fechaCreacion: "2026-06-20" },
  { id: 8, codigo: "TORT-008", nombre: "Torta de Vainilla y Frutos", categoria: "tortas", precio: 27000, porciones: "12-18 pers.", stock: 7, ventasHistoricas: 51, disponible: true, descripcion: "Bizcocho de vainilla con durazno y chantilly natural.", imagen: "https://images.unsplash.com/photo-1542826438-bd32f43d626f?q=80&w=200&auto=format&fit=crop", fechaCreacion: "2026-07-12" },
  { id: 9, codigo: "TORT-009", nombre: "Torta de Vainilla con Crema", categoria: "tortas", precio: 29500, porciones: "15 pers.", stock: 5, ventasHistoricas: 23, disponible: true, descripcion: "Capas de vainilla rellenas de crema pastelera casera.", imagen: "https://images.unsplash.com/photo-1542826438-bd32f43d626f?q=80&w=200&auto=format&fit=crop", fechaCreacion: "2026-08-01" },
  { id: 10, codigo: "POST-010", nombre: "Postre Tres Leches con Canela", categoria: "postres", precio: 31500, porciones: "12 pers.", stock: 8, ventasHistoricas: 38, disponible: true, descripcion: "Versión especial con infusión de canela en rama.", imagen: "https://images.unsplash.com/photo-1579372786545-d24232daf58c?q=80&w=200&auto=format&fit=crop", fechaCreacion: "2026-08-22" },
  { id: 11, codigo: "POST-011", nombre: "Pancakes con Frutos Rojos", categoria: "postres", precio: 24500, porciones: "Individual", stock: 18, ventasHistoricas: 19, disponible: true, descripcion: "Pancakes dorados con miel de palma y frutos rojos.", imagen: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?q=80&w=200&auto=format&fit=crop", fechaCreacion: "2026-09-10" },
  { id: 12, codigo: "SGLU-012", nombre: "Tarta Prototipo Sin Gluten", categoria: "sin-gluten", precio: 19990, porciones: "8 pers.", stock: 2, ventasHistoricas: 0, disponible: false, descripcion: "Tarta de ensayo de recetas sin alérgenos (Borrador).", imagen: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=200&auto=format&fit=crop", fechaCreacion: "2026-10-15" },
];

function getStoredAvailability(): Record<number, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function Productos() {
  const [lista, setLista] = useState<ProductoAdmin[]>(() => {
    const overrides = getStoredAvailability();
    return PRODUCTOS_INICIALES.map((prod) => ({
      ...prod, disponible: overrides[prod.id] !== undefined ? overrides[prod.id] : prod.disponible,
    }));
  });

  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas");
  const [tabFiltro, setTabFiltro] = useState<"todos" | "criticos">("todos");
  const [cargando, setCargando] = useState(false);
  const [notificacion, setNotificacion] = useState<{ tipo: "success" | "warning"; texto: string } | null>(null);

  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalReportes, setModalReportes] = useState(false);
  const [productoDetalle, setProductoDetalle] = useState<ProductoAdmin | null>(null);
  const [productoEditando, setProductoEditando] = useState<ProductoAdmin | null>(null);
  const [productoAEliminar, setProductoAEliminar] = useState<ProductoAdmin | null>(null);

  // Form Nuevo Producto
  const [nuevoCodigo, setNuevoCodigo] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaCat, setNuevaCat] = useState<ProductoAdmin["categoria"]>("tortas");
  const [nuevoPrecio, setNuevoPrecio] = useState(28000);
  const [nuevoStock, setNuevoStock] = useState(10);
  const [nuevasPorciones, setNuevasPorciones] = useState("10, 15, 20 personas");
  const [nuevaImagen, setNuevaImagen] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [nuevoDisponible, setNuevoDisponible] = useState(true);
  const [erroresNuevo, setErroresNuevo] = useState<Record<string, string>>({});

  // Form Editar Producto
  const [editNombre, setEditNombre] = useState("");
  const [editCategoria, setEditCategoria] = useState<ProductoAdmin["categoria"]>("tortas");
  const [editPrecio, setEditPrecio] = useState(0);
  const [editStock, setEditStock] = useState(0);
  const [editDisponible, setEditDisponible] = useState(true);
  const [editImagen, setEditImagen] = useState("");
  const [erroresEdit, setErroresEdit] = useState<Record<string, string>>({});

  const mostrarNotif = useCallback((tipo: "success" | "warning", texto: string) => {
    setNotificacion({ tipo, texto });
    setTimeout(() => setNotificacion(null), 3500);
  }, []);

  const cargarProductos = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargando(true);
    try {
      const data = await adminApi.products.list();
      if (Array.isArray(data) && data.length > 0) {
        const mapeados: ProductoAdmin[] = data.map((d, idx) => ({
          id: d.id,
          codigo: d.codigo || `PROD-${String(d.id).padStart(3, "0")}`,
          nombre: d.nombre,
          categoria: (d.categoria as ProductoAdmin["categoria"]) || "tortas",
          precio: Number(d.precio),
          porciones: d.porciones || "Formato vitrina",
          stock: Number(d.stock),
          ventasHistoricas: d.ventas || 0,
          disponible: d.disponible !== false,
          descripcion: d.descripcion || "Receta artesanal de alta pastelería.",
          imagen: (d.imagen && !d.imagen.startsWith("/imagen/")) ? d.imagen : PRODUCTOS_INICIALES[idx % PRODUCTOS_INICIALES.length].imagen,
          fechaCreacion: d.fechaCreacion || "2026-01-01",
        }));
        setLista(mapeados);
        if (!silencioso) {
          mostrarNotif("success", "Catálogo sincronizado desde service-catalog.");
        }
      }
    } catch { /* Fallback reactivo */ } finally {
      if (!silencioso) setCargando(false);
    }
  }, [mostrarNotif]);

  useEffect(() => {
    void cargarProductos();
  }, [cargarProductos]);

  useAdminRealtimeSync((data) => {
    if (!data) {
      void cargarProductos(true);
      return;
    }
    if (data.type === "AVAILABILITY_CHANGED" && typeof data.id === "number") {
      setLista((prev) => prev.map((item) => item.id === data.id ? { ...item, disponible: Boolean(data.disponible) } : item));
    } else if (data.type === "STOCK_UPDATED" && typeof data.id === "number") {
      setLista((prev) => prev.map((item) => item.id === data.id ? { ...item, stock: Number(data.stock) } : item));
    } else if (data.type === "STOCK_DECREMENTED" && typeof data.id === "number") {
      const dec = Number(data.cantidad || 1);
      setLista((prev) => prev.map((item) => item.id === data.id ? { ...item, stock: Math.max(0, item.stock - dec) } : item));
    } else {
      void cargarProductos(true);
    }
  });

  const totalCriticos = useMemo(() => lista.filter((p) => p.stock <= 5).length, [lista]);

  const filtrados = useMemo(() => {
    return lista.filter((prod) => {
      const q = busqueda.toLowerCase().trim();
      const matchTexto = !q || prod.nombre.toLowerCase().includes(q) || prod.codigo.toLowerCase().includes(q);
      const matchCat = categoriaFiltro === "todas" || prod.categoria === categoriaFiltro;
      const matchStock = tabFiltro === "todos" || (tabFiltro === "criticos" && prod.stock <= 5);
      return matchTexto && matchCat && matchStock;
    });
  }, [lista, busqueda, categoriaFiltro, tabFiltro]);

  const metricasCatalogo = useMemo(() => {
    const total = lista.length;
    const valorInventario = lista.reduce((sum, p) => sum + p.precio * p.stock, 0);
    let masCaro = lista[0];
    let menorStock = lista[0];
    lista.forEach((p) => {
      if (!masCaro || p.precio > masCaro.precio) masCaro = p;
      if (!menorStock || p.stock < menorStock.stock) menorStock = p;
    });
    const categorias: Array<ProductoAdmin["categoria"]> = ["tortas", "postres", "individuales", "sin-gluten"];
    const desglose = categorias.map((cat) => {
      const prods = lista.filter((p) => p.categoria === cat);
      return {
        cat, cantidad: prods.length,
        stockTotal: prods.reduce((s, p) => s + p.stock, 0),
        subtotal: prods.reduce((s, p) => s + p.precio * p.stock, 0),
      };
    });
    return { total, valorInventario, masCaro, menorStock, desglose };
  }, [lista]);

  function toggleDisponibilidad(id: number) {
    setLista((prev) => {
      const target = prev.find((p) => p.id === id);
      if (!target) return prev;
      const nuevoEstado = !target.disponible;
      const updated = prev.map((item) => (item.id === id ? { ...item, disponible: nuevoEstado } : item));
      const overrides = getStoredAvailability();
      overrides[id] = nuevoEstado;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides)); } catch { /* Fallback */ }
      broadcastAdminSync({ type: "AVAILABILITY_CHANGED", id, disponible: nuevoEstado, timestamp: Date.now() });
      adminApi.products.update(id, { disponible: nuevoEstado }).catch(() => {});
      return updated;
    });
  }

  function handleReponerStockRapido(id: number) {
    setLista((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nuevoStock = item.stock + 10;
        adminApi.products.update(id, { stock: nuevoStock }).catch(() => {});
        broadcastAdminSync({ type: "STOCK_UPDATED", id, stock: nuevoStock });
        mostrarNotif("success", `Reposición exitosa: +10 uds. para '${item.nombre}'. Total: ${nuevoStock} uds.`);
        return { ...item, stock: nuevoStock };
      })
    );
  }

  function handleCrearProducto(e: React.FormEvent) {
    e.preventDefault();
    const val = validarProductoAdmin({ codigo: nuevoCodigo || undefined, nombre: nuevoNombre, precio: Number(nuevoPrecio), stock: Number(nuevoStock), categoria: nuevaCat });
    if (!val.valido) { setErroresNuevo(val.errores); return; }
    setErroresNuevo({});
    const tempId = Date.now();
    const nuevo: ProductoAdmin = {
      id: tempId,
      codigo: nuevoCodigo.trim() || `PROD-${String(tempId).slice(-4)}`,
      nombre: nuevoNombre.trim(),
      categoria: nuevaCat,
      precio: Number(nuevoPrecio),
      porciones: nuevasPorciones.trim() || "Porción estándar",
      stock: Number(nuevoStock),
      ventasHistoricas: 0,
      disponible: nuevoDisponible,
      descripcion: nuevaDescripcion.trim() || "Producto incorporado al catálogo.",
      imagen: nuevaImagen.trim() || PRODUCTOS_INICIALES[0].imagen,
      fechaCreacion: new Date().toISOString().slice(0, 10),
    };
    setLista((prev) => [nuevo, ...prev]);
    const { id: _omitId, ...payloadSinId } = nuevo;
    void _omitId;
    adminApi.products.create(payloadSinId).then((creado) => {
      const realId = typeof creado?.id === "number" ? creado.id : Number(creado?.id);
      if (realId) {
        setLista((prev) => prev.map((p) => (p.id === tempId ? { ...p, id: realId } : p)));
      }
      mostrarNotif("success", `Producto '${nuevo.nombre}' guardado exitosamente en el catálogo.`);
    }).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : "Error de conexión con el backend";
      setLista((prev) => prev.filter((p) => p.id !== tempId));
      mostrarNotif("warning", `No se pudo guardar el producto en el backend: ${msg}`);
    });
    setModalNuevo(false);
    setNuevoCodigo(""); setNuevoNombre(""); setNuevaDescripcion(""); setNuevaImagen("");
  }

  function abrirModalEditar(prod: ProductoAdmin) {
    setProductoEditando(prod);
    setEditNombre(prod.nombre);
    setEditCategoria(prod.categoria);
    setEditPrecio(prod.precio);
    setEditStock(prod.stock);
    setEditDisponible(prod.disponible);
    setEditImagen(prod.imagen || "");
    setErroresEdit({});
  }

  function handleGuardarEdicion(e: React.FormEvent) {
    e.preventDefault();
    if (!productoEditando) return;
    const val = validarProductoAdmin({ nombre: editNombre, precio: Number(editPrecio), stock: Number(editStock), categoria: editCategoria });
    if (!val.valido) { setErroresEdit(val.errores); return; }
    setErroresEdit({});
    const imagenFinal = editImagen.trim() || productoEditando.imagen;
    const previo = { ...productoEditando };
    setLista((prev) => prev.map((item) => item.id === productoEditando.id ? { ...item, nombre: editNombre.trim(), categoria: editCategoria, precio: Number(editPrecio), stock: Number(editStock), disponible: editDisponible, imagen: imagenFinal } : item));
    broadcastAdminSync({ type: "STOCK_UPDATED", id: productoEditando.id, stock: Number(editStock) });
    adminApi.products.update(productoEditando.id, { nombre: editNombre.trim(), categoria: editCategoria, precio: Number(editPrecio), stock: Number(editStock), disponible: editDisponible, imagen: imagenFinal })
      .then(() => {
        mostrarNotif("success", "Producto modificado correctamente.");
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Error al actualizar en el servidor";
        setLista((prev) => prev.map((item) => item.id === previo.id ? previo : item));
        mostrarNotif("warning", `Error al sincronizar cambio con el backend: ${msg}`);
      });
    setProductoEditando(null);
  }

  function handleConfirmarEliminar() {
    if (!productoAEliminar) return;
    const id = productoAEliminar.id;
    const previo = productoAEliminar;
    setLista((prev) => prev.filter((p) => p.id !== id));
    adminApi.products.delete(id)
      .then(() => {
        mostrarNotif("success", "Borrador de producto eliminado.");
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Error al eliminar en el servidor";
        setLista((prev) => [previo, ...prev]);
        mostrarNotif("warning", `No se pudo eliminar en el backend: ${msg}`);
      });
    setProductoAEliminar(null);
  }

  const formatCLP = (m: number) => "$" + Number(m || 0).toLocaleString("es-CL");

  return (
    <div className="container-fluid px-0">
      {notificacion && (
        <div className={`alert ${notificacion.tipo === "success" ? "alert-success" : "alert-warning"} alert-dismissible fade show d-flex align-items-center gap-2 mb-3 shadow-sm`} role="alert">
          <Check size={18} /><span>{notificacion.texto}</span>
          <button type="button" className="btn-close ms-auto" onClick={() => setNotificacion(null)} />
        </div>
      )}

      {/* Header */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <h2 className="brand-font fs-3 text-secondary mb-0">Catálogo de Productos &amp; Disponibilidad</h2>
            <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1.5 py-1 px-2.5">
              <Radio size={12} className="text-success animate-pulse" /><span>Sincronización Activa</span>
            </span>
          </div>
          <p className="text-muted small mb-0">Administra precios, porciones, visibilidad web y stock crítico con sincronización reactiva.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap w-100 w-sm-auto">
          <button type="button" onClick={() => setModalReportes(true)} className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 flex-grow-1 flex-sm-grow-0 justify-content-center">
            <BarChart3 size={18} /><span>Reportes Catálogo</span>
          </button>
          <button type="button" onClick={() => { setModalNuevo(true); setErroresNuevo({}); }} className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1.5 flex-grow-1 flex-sm-grow-0 justify-content-center">
            <Plus size={18} /><span>Crear Producto</span>
          </button>
        </div>
      </div>

      {/* Regla de integridad DSY1104 */}
      <div className="alert alert-warning border border-warning-subtle d-flex align-items-center gap-3 mb-4 shadow-sm py-2 px-3">
        <AlertCircle size={22} className="text-warning flex-shrink-0" />
        <div className="small text-dark">
          <strong>Regla de integridad transaccional:</strong> Productos con historial de ventas <strong>no pueden eliminarse físicamente</strong>. Use el interruptor de disponibilidad web para pausar la venta.
        </div>
      </div>

      <AdminCriticalStockView
        criticalCount={totalCriticos}
        totalCatalogCount={lista.length}
        onFocusCritical={() => setTabFiltro("criticos")}
      />

      {/* Filtros y Tabs */}
      <div className="card admin-card p-3 mb-4">
        <div className="row g-3 align-items-center mb-3">
          <div className="col-12 col-md-7">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted"><Search size={16} /></span>
              <input type="text" className="form-control border-start-0 bg-light" placeholder="Buscar por código o nombre de producto..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </div>
          </div>
          <div className="col-12 col-md-5 d-flex align-items-center gap-2 flex-wrap flex-sm-nowrap">
            <span className="text-muted small fw-bold text-nowrap">Categoría:</span>
            <select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)} className="form-select form-select-sm">
              <option value="todas">Todas las categorías</option>
              <option value="tortas">Tortas enteras</option>
              <option value="postres">Postres familiares</option>
              <option value="individuales">Porciones individuales</option>
              <option value="sin-gluten">Línea sin gluten</option>
            </select>
            <button type="button" onClick={() => void cargarProductos(false)} disabled={cargando} className="btn btn-sm btn-outline-secondary" title="Recargar catálogo">
              <RefreshCw size={14} className={cargando ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Tab rápido Stock Crítico */}
        <div className="d-flex gap-2 border-top pt-3 flex-wrap">
          <button type="button" onClick={() => setTabFiltro("todos")} className={`btn btn-sm ${tabFiltro === "todos" ? "btn-secondary text-white" : "btn-light border text-muted"}`}>
            Todos los productos ({lista.length})
          </button>
          <button type="button" onClick={() => setTabFiltro("criticos")} className={`btn btn-sm d-inline-flex align-items-center gap-1.5 ${tabFiltro === "criticos" ? "btn-danger text-white" : "btn-outline-danger"}`}>
            <AlertTriangle size={14} /><span>Productos Críticos (≤ 5 uds.)</span><span className="badge bg-white text-danger ms-1">{totalCriticos}</span>
          </button>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="card admin-card overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover admin-table align-middle mb-0">
            <thead>
              <tr>
                <th className="ps-4">Foto</th><th>Código &amp; Producto</th><th>Categoría</th><th>Precio Base</th><th>Stock Actual</th><th>Disponibilidad Web</th><th className="text-end pe-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-5 text-muted">No se encontraron productos con los filtros seleccionados.</td></tr>
              ) : (
                filtrados.map((prod) => {
                  const tieneVentas = prod.ventasHistoricas > 0;
                  const esCritico = prod.stock <= 5;
                  return (
                    <tr key={prod.id}>
                      <td className="ps-4"><img src={prod.imagen || PRODUCTOS_INICIALES[0].imagen} alt={prod.nombre} className="rounded object-cover" style={{ width: 44, height: 44 }} /></td>
                      <td>
                        <div className="fw-bold text-secondary">{prod.nombre}</div>
                        <div className="d-flex align-items-center gap-2 small">
                          <span className="badge bg-light text-muted border font-monospace py-0.5">{prod.codigo}</span>
                          {tieneVentas ? (
                            <span className="text-success fw-semibold d-inline-flex align-items-center gap-1"><Check size={12} /> {prod.ventasHistoricas} ventas</span>
                          ) : (
                            <span className="text-warning fw-semibold">Sin ventas (Borrador)</span>
                          )}
                        </div>
                      </td>
                      <td><span className="badge bg-light text-secondary border text-capitalize">{prod.categoria}</span></td>
                      <td className="fw-bold text-secondary">{formatCLP(prod.precio)}</td>
                      <td>
                        <div className="d-flex align-items-center gap-1.5">
                          <span className={`badge ${esCritico ? "bg-danger" : "bg-success"}`}>{prod.stock} un.</span>
                          {esCritico && <span className="badge bg-danger-subtle text-danger border border-danger-subtle small py-0.5 px-1.5">⚠️ Crítico</span>}
                        </div>
                      </td>
                      <td>
                        <button type="button" onClick={() => toggleDisponibilidad(prod.id)} className={`btn btn-sm rounded-pill fw-bold d-inline-flex align-items-center gap-1.5 ${prod.disponible ? "btn-success" : "btn-light border text-muted"}`} title="Alternar disponibilidad">
                          <span className="rounded-circle d-inline-block" style={{ width: 8, height: 8, backgroundColor: prod.disponible ? "#ffffff" : "#adb5bd" }} />
                          <span>{prod.disponible ? "Disponible (En Tienda)" : "Agotado (Pausado)"}</span>
                        </button>
                      </td>
                      <td className="text-end pe-4">
                        <div className="btn-group btn-group-sm">
                          {esCritico && (
                            <button type="button" onClick={() => handleReponerStockRapido(prod.id)} className="btn btn-outline-success fw-bold" title="Reposición rápida (+10 uds.)">+10 Reponer</button>
                          )}
                          <button type="button" onClick={() => setProductoDetalle(prod)} className="btn btn-outline-info" title="Mostrar Detalle del Producto"><Eye size={14} /></button>
                          <button type="button" onClick={() => abrirModalEditar(prod)} className="btn btn-outline-secondary" title="Editar producto"><Edit2 size={14} /></button>
                          {tieneVentas ? (
                            <button type="button" className="btn btn-outline-secondary text-muted" disabled title="Bloqueado: cuenta con historial de ventas"><Lock size={14} /></button>
                          ) : (
                            <button type="button" onClick={() => setProductoAEliminar(prod)} className="btn btn-outline-danger" title="Eliminar borrador"><Trash2 size={14} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Nuevo Producto */}
      {modalNuevo && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <form onSubmit={handleCrearProducto}>
                <div className="modal-header">
                  <h5 className="modal-title brand-font text-secondary">Nuevo Producto para el Catálogo</h5>
                  <button type="button" className="btn-close" onClick={() => setModalNuevo(false)} />
                </div>
                <div className="modal-body">
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-bold">Código del Producto *</label>
                      <input type="text" className={`form-control ${erroresNuevo.codigo ? "is-invalid" : ""}`} placeholder="Ej: TORT-015" value={nuevoCodigo} onChange={(e) => setNuevoCodigo(e.target.value)} />
                      {erroresNuevo.codigo && <div className="invalid-feedback">{erroresNuevo.codigo}</div>}
                    </div>
                    <div className="col-12 col-md-8">
                      <label className="form-label small fw-bold">Nombre del Producto *</label>
                      <input type="text" className={`form-control ${erroresNuevo.nombre ? "is-invalid" : ""}`} placeholder="Ej: Torta Milhojas Frambuesa Manjar" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} />
                      {erroresNuevo.nombre && <div className="invalid-feedback">{erroresNuevo.nombre}</div>}
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-bold">Categoría *</label>
                      <select className={`form-select ${erroresNuevo.categoria ? "is-invalid" : ""}`} value={nuevaCat} onChange={(e) => setNuevaCat(e.target.value as ProductoAdmin["categoria"])}>
                        <option value="tortas">Tortas enteras</option>
                        <option value="postres">Postres familiares</option>
                        <option value="individuales">Porciones individuales</option>
                        <option value="sin-gluten">Línea sin gluten</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-bold">Precio Base ($ CLP) *</label>
                      <input type="number" className={`form-control ${erroresNuevo.precio ? "is-invalid" : ""}`} min="1000" step="500" value={nuevoPrecio} onChange={(e) => setNuevoPrecio(Number(e.target.value))} />
                      {erroresNuevo.precio && <div className="invalid-feedback">{erroresNuevo.precio}</div>}
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-bold">Stock Inicial *</label>
                      <input type="number" className={`form-control ${erroresNuevo.stock ? "is-invalid" : ""}`} min="0" value={nuevoStock} onChange={(e) => setNuevoStock(Number(e.target.value))} />
                      {erroresNuevo.stock && <div className="invalid-feedback">{erroresNuevo.stock}</div>}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Porciones / Formato</label>
                    <input type="text" className="form-control" placeholder="Ej: 15 a 20 personas" value={nuevasPorciones} onChange={(e) => setNuevasPorciones(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <AdminImageOptimizerView
                      value={nuevaImagen}
                      onChange={(val) => setNuevaImagen(val)}
                      label="Fotografía del Producto (Conversión automática a WebP)"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Descripción de Receta</label>
                    <textarea className="form-control" rows={2} placeholder="Bizcocho esponjoso relleno de crema pastelera casera y frutas..." value={nuevaDescripcion} onChange={(e) => setNuevaDescripcion(e.target.value)} />
                  </div>
                  <div className="form-check">
                    <input type="checkbox" id="checkDispNuevo" className="form-check-input" checked={nuevoDisponible} onChange={(e) => setNuevoDisponible(e.target.checked)} />
                    <label htmlFor="checkDispNuevo" className="form-check-label small fw-bold">Publicar de inmediato como disponible en tienda web</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setModalNuevo(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Guardar Producto</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Mostrar Detalle de Producto */}
      {productoDetalle && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title brand-font text-secondary d-flex align-items-center gap-2">
                  <Eye size={20} className="text-info" /><span>Ficha Técnica: {productoDetalle.nombre}</span>
                </h5>
                <button type="button" className="btn-close" onClick={() => setProductoDetalle(null)} />
              </div>
              <div className="modal-body">
                <div className="row g-4 align-items-center mb-3">
                  <div className="col-12 col-md-4 text-center">
                    <img src={productoDetalle.imagen || PRODUCTOS_INICIALES[0].imagen} alt={productoDetalle.nombre} className="img-fluid rounded border shadow-sm" style={{ maxHeight: 200, objectFit: "cover", width: "100%" }} />
                  </div>
                  <div className="col-12 col-md-8">
                    <div className="badge bg-light text-secondary border font-monospace mb-1">{productoDetalle.codigo}</div>
                    <h4 className="fw-bold text-secondary mb-1">{productoDetalle.nombre}</h4>
                    <p className="text-muted small mb-3">{productoDetalle.descripcion || "Sin descripción adicional ingresada."}</p>
                    <div className="row g-2">
                      <div className="col-6"><span className="text-muted small d-block">Categoría</span><span className="badge bg-light text-secondary border text-capitalize">{productoDetalle.categoria}</span></div>
                      <div className="col-6"><span className="text-muted small d-block">Precio de Venta</span><strong className="fs-5 text-secondary">{formatCLP(productoDetalle.precio)}</strong></div>
                    </div>
                  </div>
                </div>
                <div className="row g-3 border-top pt-3">
                  <div className="col-6 col-md-3"><span className="text-muted small d-block">Stock Actual</span><span className={`badge ${productoDetalle.stock <= 5 ? "bg-danger" : "bg-success"} fs-6`}>{productoDetalle.stock} unidades</span></div>
                  <div className="col-6 col-md-3"><span className="text-muted small d-block">Estado Tienda</span><span className={`badge ${productoDetalle.disponible ? "bg-success" : "bg-warning text-dark"} fs-6`}>{productoDetalle.disponible ? "Activo (En Tienda)" : "Inactivo (Pausado)"}</span></div>
                  <div className="col-6 col-md-3"><span className="text-muted small d-block">Fecha Creación</span><span className="fw-semibold small">{productoDetalle.fechaCreacion || "2026-01-01"}</span></div>
                  <div className="col-6 col-md-3"><span className="text-muted small d-block">Ventas Históricas</span><span className="fw-semibold small">{productoDetalle.ventasHistoricas} pedidos</span></div>
                </div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setProductoDetalle(null)}>Cerrar Ficha</button></div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Editar Producto */}
      {productoEditando && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleGuardarEdicion}>
                <div className="modal-header">
                  <h5 className="modal-title brand-font text-secondary">Editar Producto: {productoEditando.codigo}</h5>
                  <button type="button" className="btn-close" onClick={() => setProductoEditando(null)} />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Nombre del Producto *</label>
                    <input type="text" className={`form-control ${erroresEdit.nombre ? "is-invalid" : ""}`} value={editNombre} onChange={(e) => setEditNombre(e.target.value)} />
                    {erroresEdit.nombre && <div className="invalid-feedback">{erroresEdit.nombre}</div>}
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Categoría *</label>
                      <select className={`form-select ${erroresEdit.categoria ? "is-invalid" : ""}`} value={editCategoria} onChange={(e) => setEditCategoria(e.target.value as ProductoAdmin["categoria"])}>
                        <option value="tortas">Tortas enteras</option>
                        <option value="postres">Postres familiares</option>
                        <option value="individuales">Porciones individuales</option>
                        <option value="sin-gluten">Línea sin gluten</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Precio Base ($) *</label>
                      <input type="number" className={`form-control ${erroresEdit.precio ? "is-invalid" : ""}`} min="1000" step="500" value={editPrecio} onChange={(e) => setEditPrecio(Number(e.target.value))} />
                      {erroresEdit.precio && <div className="invalid-feedback">{erroresEdit.precio}</div>}
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Stock Actual *</label>
                      <input type="number" className={`form-control ${erroresEdit.stock ? "is-invalid" : ""}`} min="0" value={editStock} onChange={(e) => setEditStock(Number(e.target.value))} />
                      {erroresEdit.stock && <div className="invalid-feedback">{erroresEdit.stock}</div>}
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Estado en Tienda</label>
                      <select className="form-select" value={editDisponible ? "true" : "false"} onChange={(e) => setEditDisponible(e.target.value === "true")}>
                        <option value="true">Activo (Disponible)</option>
                        <option value="false">Inactivo (Pausado)</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <AdminImageOptimizerView
                      value={editImagen}
                      onChange={(val) => setEditImagen(val)}
                      label="Actualizar Fotografía (WebP / URL)"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setProductoEditando(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Actualizar Cambios</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Reportes de Catálogo */}
      {modalReportes && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title brand-font text-secondary d-flex align-items-center gap-2">
                  <BarChart3 size={20} className="text-secondary" /><span>Reporte General del Catálogo e Inventario</span>
                </h5>
                <button type="button" className="btn-close" onClick={() => setModalReportes(false)} />
              </div>
              <div className="modal-body">
                <div className="row g-3 mb-4">
                  <div className="col-6 col-md-3">
                    <div className="card p-3 border text-center h-100">
                      <span className="text-muted small text-uppercase fw-bold">Total Registrados</span>
                      <strong className="fs-3 text-secondary">{metricasCatalogo.total}</strong>
                      <span className="small text-muted">Productos activos</span>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="card p-3 border text-center h-100">
                      <span className="text-muted small text-uppercase fw-bold">Valor Catálogo</span>
                      <strong className="fs-4 text-success">{formatCLP(metricasCatalogo.valorInventario)}</strong>
                      <span className="small text-muted">Stock x Precio Base</span>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="card p-3 border text-center h-100">
                      <span className="text-muted small text-uppercase fw-bold">Producto Más Caro</span>
                      <div className="small fw-bold text-truncate text-secondary mt-1">{metricasCatalogo.masCaro?.nombre}</div>
                      <span className="text-muted small">{formatCLP(metricasCatalogo.masCaro?.precio || 0)}</span>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="card p-3 border text-center h-100">
                      <span className="text-muted small text-uppercase fw-bold">Menor Stock</span>
                      <div className="small fw-bold text-truncate text-danger mt-1">{metricasCatalogo.menorStock?.nombre}</div>
                      <span className="badge bg-danger-subtle text-danger mx-auto mt-1">{metricasCatalogo.menorStock?.stock} uds.</span>
                    </div>
                  </div>
                </div>
                <h6 className="fw-bold text-secondary mb-2">Distribución por Categoría</h6>
                <div className="table-responsive">
                  <table className="table table-bordered table-sm align-middle">
                    <thead className="table-light">
                      <tr><th>Categoría</th><th>Cant. Productos</th><th>Unidades en Stock</th><th>Valor Inventario</th></tr>
                    </thead>
                    <tbody>
                      {metricasCatalogo.desglose.map((item) => (
                        <tr key={item.cat}>
                          <td className="text-capitalize fw-semibold">{item.cat}</td>
                          <td>{item.cantidad}</td>
                          <td>{item.stockTotal} un.</td>
                          <td><strong>{formatCLP(item.subtotal)}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setModalReportes(false)}>Cerrar Reporte</button></div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Confirmar Eliminación */}
      {productoAEliminar && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-danger">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title d-flex align-items-center gap-2"><AlertCircle size={20} /> Confirmar Eliminación</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setProductoAEliminar(null)} />
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de que deseas eliminar permanentemente el producto <strong>{productoAEliminar.nombre}</strong> ({productoAEliminar.codigo})?</p>
                <div className="alert alert-warning small mb-0">Esta acción es permitida únicamente porque este producto no registra ventas históricas en el balance contable.</div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setProductoAEliminar(null)}>Cancelar</button>
                <button type="button" className="btn btn-danger" onClick={handleConfirmarEliminar}>Eliminar Producto</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
