// @pca:start
// @id(admin.pages.productos)
// @kind(page)
// @limit(lines: 700)
// @contract(ProductosAdminView())
// @relates(admin.lib.validators)
// @relates(docs.especificacion_pwa_admin)
// @desc(Gestion de productos, edicion, reporte de criticos y alta de nuevos)
// @pca:end
import { useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  Edit2,
  Lock,
  Plus,
  Radio,
  Search,
  Trash2,
} from "lucide-react";
import { adminApi } from "../services/api";

const CHANNEL_NAME = "cremeco_products_realtime";
const STORAGE_KEY = "cremeco_products_availability";

interface ProductoAdmin {
  id: number;
  nombre: string;
  categoria: "tortas" | "postres" | "individuales" | "sin-gluten";
  precio: number;
  porciones: string;
  stock: number;
  ventasHistoricas: number;
  disponible: boolean;
}

const PRODUCTOS_INICIALES: ProductoAdmin[] = [
  {
    id: 1,
    nombre: "Torta de Chocolate Clásica",
    categoria: "tortas",
    precio: 35000,
    porciones: "12, 20 personas",
    stock: 12,
    ventasHistoricas: 148,
    disponible: true,
  },
  {
    id: 2,
    nombre: "Tartaleta de Frutos Rojos",
    categoria: "postres",
    precio: 28000,
    porciones: "8, 12 personas",
    stock: 8,
    ventasHistoricas: 92,
    disponible: true,
  },
  {
    id: 3,
    nombre: "Caja de Macarons (12 uds)",
    categoria: "individuales",
    precio: 42000,
    porciones: "12 unidades",
    stock: 15,
    ventasHistoricas: 64,
    disponible: true,
  },
  {
    id: 4,
    nombre: "Cheesecake de Frutos Rojos",
    categoria: "tortas",
    precio: 30000,
    porciones: "10, 16 personas",
    stock: 10,
    ventasHistoricas: 110,
    disponible: true,
  },
  {
    id: 5,
    nombre: "Pancakes Sin Gluten",
    categoria: "sin-gluten",
    precio: 22000,
    porciones: "Torre familiar",
    stock: 14,
    ventasHistoricas: 35,
    disponible: true,
  },
  {
    id: 6,
    nombre: "Tres Leches Clásica",
    categoria: "postres",
    precio: 32000,
    porciones: "15, 25 personas",
    stock: 6,
    ventasHistoricas: 84,
    disponible: true,
  },
  {
    id: 7,
    nombre: "Pastel de Zanahoria",
    categoria: "postres",
    precio: 26000,
    porciones: "10, 15 personas",
    stock: 9,
    ventasHistoricas: 42,
    disponible: true,
  },
  {
    id: 8,
    nombre: "Torta de Vainilla y Frutos",
    categoria: "tortas",
    precio: 27000,
    porciones: "12, 18 personas",
    stock: 7,
    ventasHistoricas: 51,
    disponible: true,
  },
  {
    id: 9,
    nombre: "Torta de Vainilla con Crema",
    categoria: "tortas",
    precio: 29500,
    porciones: "15 personas",
    stock: 5,
    ventasHistoricas: 23,
    disponible: true,
  },
  {
    id: 10,
    nombre: "Postre Tres Leches con Canela",
    categoria: "postres",
    precio: 31500,
    porciones: "12 personas",
    stock: 8,
    ventasHistoricas: 38,
    disponible: true,
  },
  {
    id: 11,
    nombre: "Pancakes con Frutos Rojos",
    categoria: "postres",
    precio: 24500,
    porciones: "Individual",
    stock: 18,
    ventasHistoricas: 19,
    disponible: true,
  },
  {
    id: 12,
    nombre: "Tarta Prototipo Sin Gluten (Borrador)",
    categoria: "sin-gluten",
    precio: 19990,
    porciones: "8 personas",
    stock: 10,
    ventasHistoricas: 0,
    disponible: false,
  },
];

function getStoredAvailability(): Record<number, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function Productos() {
  const [lista, setLista] = useState<ProductoAdmin[]>(() => {
    const overrides = getStoredAvailability();
    return PRODUCTOS_INICIALES.map((prod) => ({
      ...prod,
      disponible: overrides[prod.id] !== undefined ? overrides[prod.id] : prod.disponible,
    }));
  });

  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas");
  const [modalNuevo, setModalNuevo] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState<ProductoAdmin | null>(null);

  // Form nuevo producto
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoPrecio, setNuevoPrecio] = useState(28000);
  const [nuevaCat, setNuevaCat] = useState<ProductoAdmin["categoria"]>("tortas");
  const [nuevoStock, setNuevoStock] = useState(10);
  const [nuevasPorciones, setNuevasPorciones] = useState("10, 15, 20 personas");

  // Escuchar cambios de disponibilidad desde otras ventanas o pestañas
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event: MessageEvent) => {
        if (event.data?.type === "AVAILABILITY_CHANGED" && typeof event.data.id === "number") {
          setLista((prev) =>
            prev.map((item) =>
              item.id === event.data.id ? { ...item, disponible: Boolean(event.data.disponible) } : item
            )
          );
        }
      };
    } catch {
      // Ignore
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const overrides: Record<number, boolean> = JSON.parse(e.newValue);
          setLista((prev) =>
            prev.map((item) => ({
              ...item,
              disponible: overrides[item.id] !== undefined ? overrides[item.id] : item.disponible,
            }))
          );
        } catch {
          // Ignore
        }
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const filtrados = lista.filter((prod) => {
    const coincideTexto = prod.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCat = categoriaFiltro === "todas" || prod.categoria === categoriaFiltro;
    return coincideTexto && coincideCat;
  });

  function toggleDisponibilidad(id: number) {
    setLista((prev) => {
      const target = prev.find((p) => p.id === id);
      if (!target) return prev;
      const nuevoEstado = !target.disponible;

      const updated = prev.map((item) =>
        item.id === id ? { ...item, disponible: nuevoEstado } : item
      );

      // 1. Guardar en localStorage compartido para acceso inmediato en frontend
      const overrides = getStoredAvailability();
      overrides[id] = nuevoEstado;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
      } catch {
        // Ignore
      }

      // 2. BroadcastChannel para propagación en tiempo real (0ms de latencia) a la tienda web
      try {
        const channel = new BroadcastChannel(CHANNEL_NAME);
        channel.postMessage({
          type: "AVAILABILITY_CHANGED",
          id,
          disponible: nuevoEstado,
          timestamp: Date.now(),
        });
        channel.close();
      } catch {
        // Ignore
      }

      // 3. Notificar evento personalizado local
      window.dispatchEvent(
        new CustomEvent("cremeco:product-updated", { detail: { id, disponible: nuevoEstado } })
      );

      // 4. Sincronizar en segundo plano con el microservicio Spring Boot :8082
      adminApi.products.update(id, { disponible: nuevoEstado }).catch(() => {
        // Resiliente si el microservicio está offline
      });

      return updated;
    });
  }

  function handleCrearProducto(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;

    const nuevo: ProductoAdmin = {
      id: Date.now(),
      nombre: nuevoNombre,
      categoria: nuevaCat,
      precio: Number(nuevoPrecio),
      porciones: nuevasPorciones,
      stock: Number(nuevoStock),
      ventasHistoricas: 0,
      disponible: true,
    };

    setLista([nuevo, ...lista]);
    setModalNuevo(false);
    setNuevoNombre("");

    // Broadcast reload
    try {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ type: "CATALOG_RELOAD", timestamp: Date.now() });
      channel.close();
    } catch {
      // Ignore
    }
  }

  function handleConfirmarEliminar() {
    if (!productoAEliminar) return;
    setLista((prev) => prev.filter((p) => p.id !== productoAEliminar.id));
    setProductoAEliminar(null);

    try {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ type: "CATALOG_RELOAD", timestamp: Date.now() });
      channel.close();
    } catch {
      // Ignore
    }
  }

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h2 className="brand-font fs-3 text-secondary mb-0">
              Catálogo de Productos &amp; Disponibilidad
            </h2>
            <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1.5 py-1 px-2.5">
              <Radio size={12} className="text-success animate-pulse" />
              <span>Tiempo Real Activo</span>
            </span>
          </div>
          <p className="text-muted small mb-0">
            Administra precios, porciones, visibilidad web y stock. Los cambios de disponibilidad se reflejan de inmediato en la tienda del cliente.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalNuevo(true)}
          className="btn btn-primary d-inline-flex align-items-center gap-2"
        >
          <Plus size={18} />
          <span>Crear Producto</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="card admin-card p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-8">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control border-start-0 bg-light"
                placeholder="Buscar por nombre de torta o postre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-4 d-flex align-items-center gap-2">
            <span className="text-muted small fw-bold text-nowrap">Categoría:</span>
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="form-select form-select-sm"
            >
              <option value="todas">Todas las categorías</option>
              <option value="tortas">Tortas enteras</option>
              <option value="postres">Postres familiares</option>
              <option value="individuales">Porciones individuales</option>
              <option value="sin-gluten">Línea sin gluten</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Productos con Regla de Integridad de Ventas */}
      <div className="card admin-card overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover admin-table align-middle mb-0">
            <thead>
              <tr>
                <th className="ps-4">Producto</th>
                <th>Categoría</th>
                <th>Precio Base</th>
                <th>Porciones</th>
                <th>Stock</th>
                <th>Disponibilidad Web</th>
                <th className="text-end pe-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((prod) => {
                const tieneVentas = prod.ventasHistoricas > 0;

                return (
                  <tr key={prod.id}>
                    <td className="ps-4">
                      <div className="fw-bold text-secondary">{prod.nombre}</div>
                      <div className="small">
                        {tieneVentas ? (
                          <span className="text-success fw-semibold d-inline-flex align-items-center gap-1">
                            <Check size={12} /> {prod.ventasHistoricas} ventas registradas
                          </span>
                        ) : (
                          <span className="text-warning fw-semibold">
                            Sin ventas históricas (Borrador)
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className="badge bg-light text-secondary border text-capitalize">
                        {prod.categoria}
                      </span>
                    </td>

                    <td className="fw-bold text-secondary">
                      ${prod.precio.toLocaleString("es-CL")}
                    </td>

                    <td className="small text-muted">{prod.porciones}</td>

                    <td>
                      <span
                        className={`badge ${
                          prod.stock <= 5 ? "bg-danger" : "bg-success"
                        }`}
                      >
                        {prod.stock} un.
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() => toggleDisponibilidad(prod.id)}
                        className={`btn btn-sm rounded-pill fw-bold d-inline-flex align-items-center gap-1.5 ${
                          prod.disponible ? "btn-success" : "btn-light border text-muted"
                        }`}
                        title="Haz clic para activar o pausar en la tienda web en tiempo real"
                      >
                        <span
                          className={`rounded-circle d-inline-block`}
                          style={{
                            width: 8,
                            height: 8,
                            backgroundColor: prod.disponible ? "#ffffff" : "#adb5bd",
                          }}
                        />
                        <span>{prod.disponible ? "Disponible (En Tienda)" : "Agotado (Pausado)"}</span>
                      </button>
                    </td>

                    <td className="text-end pe-4">
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          title="Editar producto"
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* REGLA CRÍTICA DE DOMINIO: No eliminar si tiene ventas */}
                        {tieneVentas ? (
                          <button
                            type="button"
                            className="btn btn-outline-secondary text-muted"
                            disabled
                            title="Bloqueado: no se puede eliminar un producto con historial de ventas"
                          >
                            <Lock size={14} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setProductoAEliminar(prod)}
                            className="btn btn-outline-danger"
                            title="Eliminar borrador sin ventas"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo Producto */}
      {modalNuevo && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleCrearProducto}>
                <div className="modal-header">
                  <h5 className="modal-title brand-font text-secondary">
                    Nuevo Producto para el Catálogo
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setModalNuevo(false)}
                  />
                </div>
                <div className="modal-body space-y-3">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Nombre del Producto</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="Ej: Torta Milhojas Frambuesa"
                      value={nuevoNombre}
                      onChange={(e) => setNuevoNombre(e.target.value)}
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Categoría</label>
                      <select
                        className="form-select"
                        value={nuevaCat}
                        onChange={(e) =>
                          setNuevaCat(e.target.value as ProductoAdmin["categoria"])
                        }
                      >
                        <option value="tortas">Tortas enteras</option>
                        <option value="postres">Postres familiares</option>
                        <option value="individuales">Porciones individuales</option>
                        <option value="sin-gluten">Línea sin gluten</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Precio Base ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        required
                        min="1000"
                        step="500"
                        value={nuevoPrecio}
                        onChange={(e) => setNuevoPrecio(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Stock Inicial</label>
                      <input
                        type="number"
                        className="form-control"
                        required
                        min="0"
                        value={nuevoStock}
                        onChange={(e) => setNuevoStock(Number(e.target.value))}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Porciones / Formato</label>
                      <input
                        type="text"
                        className="form-control"
                        value={nuevasPorciones}
                        onChange={(e) => setNuevasPorciones(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setModalNuevo(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Guardar Producto
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmación de Eliminación */}
      {productoAEliminar && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-danger">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <AlertCircle size={20} /> Confirmar Eliminación
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setProductoAEliminar(null)}
                />
              </div>
              <div className="modal-body">
                <p>
                  ¿Estás seguro de que deseas eliminar permanentemente el producto{" "}
                  <strong>{productoAEliminar.nombre}</strong>?
                </p>
                <div className="alert alert-warning small mb-0">
                  Esta acción es permitida únicamente porque este producto no tiene ventas
                  registradas en el historial contable.
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setProductoAEliminar(null)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleConfirmarEliminar}
                >
                  Eliminar Producto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
