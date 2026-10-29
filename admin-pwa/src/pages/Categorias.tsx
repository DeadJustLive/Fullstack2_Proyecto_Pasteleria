// @pca:start
// @id(admin.pages.categorias)
// @kind(page)
// @limit(lines: 680)
// @contract(CategoriasAdminView())
// @relates(admin.services.api)
// @relates(docs.especificacion_pwa_admin)
// @desc(Gestion administrativa de categorias, jerarquias, slug y conteo de productos)
// @pca:end
import { useEffect, useState, useMemo } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Edit2,
  FolderTree,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  Tag,
} from "lucide-react";
import {
  CategoryAdmin,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  adminApi,
} from "../services/api";

export function Categorias() {
  const [categorias, setCategorias] = useState<CategoryAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Estado del Modal (Crear / Editar)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<CategoryAdmin | null>(null);

  // Formulario
  const [formNombre, setFormNombre] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescripcion, setFormDescripcion] = useState("");
  const [formImagen, setFormImagen] = useState("");
  const [formActivo, setFormActivo] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Modal de advertencia de integridad referencial
  const [bloqueoIntegridad, setBloqueoIntegridad] = useState<{
    nombre: string;
    conteo: number;
  } | null>(null);

  async function cargarCategorias() {
    setLoading(true);
    setMensajeError(null);
    try {
      const [catsData, prodsData] = await Promise.all([
        getCategories(),
        adminApi.products.list().catch(() => []),
      ]);

      // Calcular conteo real de productos por categoría o usar el registrado
      const mapped = catsData.map((cat) => {
        const countFromProds = Array.isArray(prodsData)
          ? prodsData.filter(
              (p) =>
                p.categoria?.toLowerCase() === cat.slug?.toLowerCase() ||
                p.categoria?.toLowerCase() === cat.nombre?.toLowerCase()
            ).length
          : 0;

        return {
          ...cat,
          productosCount: countFromProds > 0 ? countFromProds : (cat.productosCount ?? 0),
        };
      });

      setCategorias(mapped);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cargar categorías";
      setMensajeError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarCategorias();
  }, []);

  // Filtrado reactivo
  const categoriasFiltradas = useMemo(() => {
    const query = busqueda.trim().toLowerCase();
    if (!query) return categorias;
    return categorias.filter(
      (c) =>
        c.nombre.toLowerCase().includes(query) ||
        c.slug.toLowerCase().includes(query) ||
        (c.descripcion && c.descripcion.toLowerCase().includes(query))
    );
  }, [categorias, busqueda]);

  function abrirModalNuevo() {
    setCategoriaEditando(null);
    setFormNombre("");
    setFormSlug("");
    setFormDescripcion("");
    setFormImagen("");
    setFormActivo(true);
    setModalAbierto(true);
  }

  function abrirModalEditar(cat: CategoryAdmin) {
    setCategoriaEditando(cat);
    setFormNombre(cat.nombre);
    setFormSlug(cat.slug);
    setFormDescripcion(cat.descripcion || "");
    setFormImagen(cat.imagen || "");
    setFormActivo(cat.activo);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setCategoriaEditando(null);
  }

  function handleNombreChange(val: string) {
    setFormNombre(val);
    if (!categoriaEditando) {
      // Autogenerar slug en modo creación
      const slugGenerado = val
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormSlug(slugGenerado);
    }
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    if (!formNombre.trim() || !formSlug.trim()) {
      setMensajeError("El nombre y el slug de la categoría son obligatorios.");
      return;
    }

    setGuardando(true);
    setMensajeError(null);
    setMensajeExito(null);

    try {
      if (categoriaEditando) {
        // Actualizar
        const actualizada = await updateCategory(categoriaEditando.id, {
          nombre: formNombre.trim(),
          slug: formSlug.trim(),
          descripcion: formDescripcion.trim(),
          imagen: formImagen.trim(),
          activo: formActivo,
        });

        setCategorias((prev) =>
          prev.map((c) =>
            c.id === categoriaEditando.id
              ? { ...c, ...actualizada, productosCount: c.productosCount }
              : c
          )
        );
        setMensajeExito(`Categoría "${formNombre}" actualizada correctamente.`);
      } else {
        // Crear
        const nueva = await createCategory({
          nombre: formNombre.trim(),
          slug: formSlug.trim(),
          descripcion: formDescripcion.trim(),
          imagen: formImagen.trim(),
          activo: formActivo,
          productosCount: 0,
        });

        setCategorias((prev) => [...prev, { ...nueva, productosCount: 0 }]);
        setMensajeExito(`Categoría "${formNombre}" creada exitosamente.`);
      }

      cerrarModal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al procesar la categoría";
      setMensajeError(msg);
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(cat: CategoryAdmin) {
    // Validación de Integridad Referencial DSY1104:
    // Si la categoría tiene productos asociados, no puede ser eliminada.
    if ((cat.productosCount ?? 0) > 0) {
      setBloqueoIntegridad({
        nombre: cat.nombre,
        conteo: cat.productosCount ?? 0,
      });
      return;
    }

    const confirmar = window.confirm(
      `¿Está seguro de eliminar la categoría "${cat.nombre}"? Esta acción no se puede deshacer.`
    );
    if (!confirmar) return;

    try {
      await deleteCategory(cat.id);
      setCategorias((prev) => prev.filter((c) => c.id !== cat.id));
      setMensajeExito(`Categoría "${cat.nombre}" eliminada correctamente.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al eliminar categoría";
      setMensajeError(msg);
    }
  }

  async function handleToggleActivo(cat: CategoryAdmin) {
    const nuevoEstado = !cat.activo;
    try {
      await updateCategory(cat.id, { activo: nuevoEstado });
      setCategorias((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, activo: nuevoEstado } : c))
      );
      setMensajeExito(
        `Categoría "${cat.nombre}" ${nuevoEstado ? "activada" : "desactivada"}.`
      );
    } catch {
      setMensajeError("No se pudo actualizar el estado de la categoría.");
    }
  }

  return (
    <div className="container-fluid px-0">
      {/* Encabezado */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="brand-font fs-3 text-secondary mb-1 d-flex align-items-center gap-2">
            <FolderTree size={28} className="text-primary" />
            <span>Gestión de Categorías &amp; Jerarquías</span>
          </h2>
          <p className="text-muted small mb-0">
            Administra las clasificaciones del catálogo, URL slugs, conteo de productos y reglas de integridad.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            onClick={cargarCategorias}
            disabled={loading}
            className="btn btn-outline-secondary d-inline-flex align-items-center gap-1"
            title="Refrescar listado"
          >
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            <span className="d-none d-sm-inline">Actualizar</span>
          </button>
          <button
            type="button"
            onClick={abrirModalNuevo}
            className="btn btn-primary d-inline-flex align-items-center gap-2"
          >
            <Plus size={18} />
            <span>Nueva Categoría</span>
          </button>
        </div>
      </div>

      {/* Alertas */}
      {mensajeExito && (
        <div className="alert alert-success d-flex align-items-center justify-content-between py-2 px-3 mb-3">
          <div className="d-flex align-items-center gap-2 small">
            <CheckCircle size={18} />
            <span>{mensajeExito}</span>
          </div>
          <button
            type="button"
            className="btn-close small"
            onClick={() => setMensajeExito(null)}
          />
        </div>
      )}

      {mensajeError && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between py-2 px-3 mb-3">
          <div className="d-flex align-items-center gap-2 small">
            <AlertCircle size={18} />
            <span>{mensajeError}</span>
          </div>
          <button
            type="button"
            className="btn-close small"
            onClick={() => setMensajeError(null)}
          />
        </div>
      )}

      {/* Tarjeta de Regla de Negocio */}
      <div className="card admin-card border-0 mb-4 bg-light">
        <div className="card-body p-3 d-flex align-items-center gap-3">
          <div className="p-2 rounded-circle bg-warning-subtle text-warning">
            <AlertTriangle size={22} />
          </div>
          <div className="small text-secondary">
            <strong>Regla de integridad referencial (DSY1104 Anexo 1):</strong> Una categoría que posee
            productos activos o históricos no puede eliminarse físicamente de la base de datos para
            garantizar la consistencia del catálogo y pedidos. Puede pausar su estado a <em>Inactivo</em>.
          </div>
        </div>
      </div>

      {/* Tarjeta Tabla de Categorías */}
      <div className="card admin-card overflow-hidden shadow-sm">
        <div className="card-header admin-card-header d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 p-3">
          <div className="d-flex align-items-center gap-2">
            <Tag size={18} className="text-primary" />
            <span className="fw-bold text-secondary">Categorías del Catálogo</span>
            <span className="badge bg-secondary-subtle text-secondary ms-1">
              {categoriasFiltradas.length} total
            </span>
          </div>

          <div className="input-group" style={{ maxWidth: 320 }}>
            <span className="input-group-text bg-white border-end-0">
              <Search size={16} className="text-muted" />
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre o slug..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="form-control border-start-0 ps-0"
            />
            {busqueda && (
              <button
                type="button"
                className="btn btn-outline-secondary border-start-0"
                onClick={() => setBusqueda("")}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover admin-table align-middle mb-0">
            <thead>
              <tr>
                <th className="ps-4" style={{ width: 70 }}>ID</th>
                <th>Nombre</th>
                <th>Slug URL</th>
                <th>Descripción</th>
                <th className="text-center">Productos</th>
                <th>Estado</th>
                <th className="text-end pe-4" style={{ width: 140 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Cargando categorías...
                  </td>
                </tr>
              ) : categoriasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    No se encontraron categorías que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                categoriasFiltradas.map((c) => (
                  <tr key={c.id}>
                    <td className="ps-4 font-monospace text-muted small">#{c.id}</td>
                    <td className="fw-bold text-secondary">{c.nombre}</td>
                    <td>
                      <code className="text-primary bg-light px-2 py-1 rounded small">
                        {c.slug}
                      </code>
                    </td>
                    <td className="small text-muted text-truncate" style={{ maxWidth: 260 }}>
                      {c.descripcion || "—"}
                    </td>
                    <td className="text-center">
                      <span
                        className={`badge ${
                          (c.productosCount ?? 0) > 0
                            ? "bg-success-subtle text-success border border-success-subtle"
                            : "bg-light text-muted border"
                        }`}
                      >
                        {c.productosCount ?? 0} {c.productosCount === 1 ? "producto" : "productos"}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleActivo(c)}
                        className={`btn btn-sm rounded-pill fw-bold py-0.5 px-3 ${
                          c.activo ? "btn-success" : "btn-light border text-muted"
                        }`}
                        title="Haz clic para alternar estado"
                      >
                        {c.activo ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-inline-flex align-items-center gap-1">
                        <button
                          type="button"
                          onClick={() => abrirModalEditar(c)}
                          className="btn btn-sm btn-outline-secondary p-1"
                          title="Editar Categoría"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEliminar(c)}
                          className="btn btn-sm btn-outline-danger p-1"
                          title="Eliminar Categoría"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear / Editar Categoría */}
      {modalAbierto && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={cerrarModal}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content admin-modal-content">
              <div className="modal-header admin-modal-header">
                <h5 className="modal-title brand-font fs-5 text-secondary">
                  {categoriaEditando ? `Editar Categoría: ${categoriaEditando.nombre}` : "Nueva Categoría de Catálogo"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={cerrarModal}
                  disabled={guardando}
                />
              </div>

              <form onSubmit={handleGuardar}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase text-secondary">
                      Nombre de la Categoría *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Postres Individuales"
                      value={formNombre}
                      onChange={(e) => handleNombreChange(e.target.value)}
                      className="form-control"
                      autoFocus
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase text-secondary">
                      Slug URL (Identificador Único) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ej: postres-individuales"
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value.toLowerCase())}
                      className="form-control font-monospace"
                    />
                    <div className="form-text small">
                      Se utiliza en rutas URL y como identificador en productos.
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase text-secondary">
                      Descripción
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Breve reseña visible en el catálogo de clientes..."
                      value={formDescripcion}
                      onChange={(e) => setFormDescripcion(e.target.value)}
                      className="form-control"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase text-secondary">
                      URL de Imagen (Opcional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={formImagen}
                      onChange={(e) => setFormImagen(e.target.value)}
                      className="form-control"
                    />
                  </div>

                  <div className="form-check form-switch mt-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="checkActivo"
                      checked={formActivo}
                      onChange={(e) => setFormActivo(e.target.checked)}
                    />
                    <label className="form-check-label fw-bold text-secondary" htmlFor="checkActivo">
                      Categoría Activa (Visible en catálogo y menú)
                    </label>
                  </div>
                </div>

                <div className="modal-footer border-top bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={cerrarModal}
                    disabled={guardando}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary d-inline-flex align-items-center gap-2"
                    disabled={guardando}
                  >
                    {guardando && <span className="spinner-border spinner-border-sm" />}
                    <span>{categoriaEditando ? "Guardar Cambios" : "Crear Categoría"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Advertencia por Integridad Referencial */}
      {bloqueoIntegridad && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setBloqueoIntegridad(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content admin-modal-content border-warning">
              <div className="modal-header bg-warning-subtle text-warning-emphasis">
                <h5 className="modal-title fs-6 fw-bold d-flex align-items-center gap-2">
                  <AlertTriangle size={20} className="text-warning" />
                  <span>Acción Bloqueada por Integridad Referencial</span>
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setBloqueoIntegridad(null)}
                />
              </div>
              <div className="modal-body p-4 text-secondary">
                <p>
                  No es posible eliminar físicamente la categoría{" "}
                  <strong className="text-dark">"{bloqueoIntegridad.nombre}"</strong> porque
                  actualmente cuenta con{" "}
                  <span className="badge bg-danger">
                    {bloqueoIntegridad.conteo} producto(s) asociado(s)
                  </span>.
                </p>
                <div className="alert alert-light border small text-muted mb-0">
                  <strong>Recomendación:</strong> Reasigne los productos vinculados a otra categoría
                  o desactive la categoría cambiando su estado a <em>Inactivo</em> para retirarla del
                  catálogo público sin romper la consistencia de datos.
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setBloqueoIntegridad(null)}
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
