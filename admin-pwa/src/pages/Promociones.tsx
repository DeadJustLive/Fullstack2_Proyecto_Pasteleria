// @pca:start
// @id(admin.pages.promociones)
// @kind(page)
// @limit(lines: 680)
// @contract(PromocionesAdminView())
// @relates(docs.especificacion_pwa_admin)
// @desc(Gestion de cupones de descuento, limites y vigencia)
// @pca:end
import { useEffect, useState, useMemo } from "react";
import {
  AlertCircle,
  CheckCircle,
  Edit2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
} from "lucide-react";
import {
  PromotionAdmin,
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from "../services/api";

interface BannerPromocional {
  id: number;
  titulo: string;
  subtitulo: string;
  posicion: "TOP_BAR" | "POPUP_BIENVENIDA";
  activo: boolean;
}

const BANNERS_INICIALES: BannerPromocional[] = [
  {
    id: 1,
    titulo: "10% de descuento en tu primer pedido online",
    subtitulo: "Usa el cupón DULCE10 al finalizar tu compra",
    posicion: "TOP_BAR",
    activo: true,
  },
  {
    id: 2,
    titulo: "¡Reserva tus tortas de fin de año con anticipación!",
    subtitulo: "Cupos limitados para retiros del 24 y 31 de diciembre",
    posicion: "POPUP_BIENVENIDA",
    activo: false,
  },
];

export function Promociones() {
  const [cupones, setCupones] = useState<PromotionAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<BannerPromocional[]>(BANNERS_INICIALES);
  const [busqueda, setBusqueda] = useState("");
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Modal Crear / Editar
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cuponEditando, setCuponEditando] = useState<PromotionAdmin | null>(null);

  // Formulario de Cupón
  const [codigo, setCodigo] = useState("");
  const [tipo, setTipo] = useState<"PORCENTAJE" | "MONTO_FIJO">("PORCENTAJE");
  const [valor, setValor] = useState(10);
  const [minimo, setMinimo] = useState(20000);
  const [limite, setLimite] = useState(100);
  const [expira, setExpira] = useState("2026-12-31");
  const [descripcion, setDescripcion] = useState("");
  const [activo, setActivo] = useState(true);
  const [guardando, setGuardando] = useState(false);

  async function cargarPromociones() {
    setLoading(true);
    setMensajeError(null);
    try {
      const data = await getPromotions();
      setCupones(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cargar promociones";
      setMensajeError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarPromociones();
  }, []);

  const cuponesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return cupones;
    return cupones.filter(
      (c) =>
        c.codigo.toLowerCase().includes(q) ||
        (c.descripcion && c.descripcion.toLowerCase().includes(q))
    );
  }, [cupones, busqueda]);

  function abrirModalNuevo() {
    setCuponEditando(null);
    setCodigo("");
    setTipo("PORCENTAJE");
    setValor(10);
    setMinimo(20000);
    setLimite(100);
    setExpira("2026-12-31");
    setDescripcion("");
    setActivo(true);
    setModalAbierto(true);
  }

  function abrirModalEditar(c: PromotionAdmin) {
    setCuponEditando(c);
    setCodigo(c.codigo);
    setTipo(c.tipo);
    setValor(c.valor);
    setMinimo(c.minimoCompra);
    setLimite(c.limiteUsos);
    setExpira(c.expira || "2026-12-31");
    setDescripcion(c.descripcion || "");
    setActivo(c.activo);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setCuponEditando(null);
  }

  async function handleGuardarCupon(e: React.FormEvent) {
    e.preventDefault();
    const codigoLimpio = codigo.toUpperCase().trim();
    if (!codigoLimpio) {
      setMensajeError("El código de cupón es obligatorio.");
      return;
    }

    setGuardando(true);
    setMensajeError(null);
    setMensajeExito(null);

    try {
      const payload: Partial<PromotionAdmin> = {
        codigo: codigoLimpio,
        tipo,
        valor: Number(valor),
        descuentoPorcentaje: tipo === "PORCENTAJE" ? Number(valor) : 0,
        minimoCompra: Number(minimo),
        limiteUsos: Number(limite),
        expira,
        descripcion: descripcion.trim(),
        activo,
      };

      if (cuponEditando) {
        const actualizado = await updatePromotion(cuponEditando.id, payload);
        setCupones((prev) =>
          prev.map((c) => (c.id === cuponEditando.id ? { ...c, ...actualizado } : c))
        );
        setMensajeExito(`Cupón "${codigoLimpio}" actualizado correctamente.`);
      } else {
        const nuevo = await createPromotion({
          ...payload,
          usosActuales: 0,
        });
        setCupones((prev) => [nuevo, ...prev]);
        setMensajeExito(`Cupón "${codigoLimpio}" creado exitosamente.`);
      }

      cerrarModal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al procesar el cupón";
      setMensajeError(msg);
    } finally {
      setGuardando(false);
    }
  }

  async function handleToggleCupon(c: PromotionAdmin) {
    const nuevoEstado = !c.activo;
    try {
      await updatePromotion(c.id, { activo: nuevoEstado });
      setCupones((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, activo: nuevoEstado } : item))
      );
      setMensajeExito(`Cupón "${c.codigo}" ${nuevoEstado ? "activado" : "pausado"}.`);
    } catch {
      setMensajeError("No se pudo alternar el estado del cupón.");
    }
  }

  async function handleEliminarCupon(c: PromotionAdmin) {
    const confirmar = window.confirm(`¿Está seguro de eliminar el cupón "${c.codigo}"?`);
    if (!confirmar) return;

    try {
      await deletePromotion(c.id);
      setCupones((prev) => prev.filter((item) => item.id !== c.id));
      setMensajeExito(`Cupón "${c.codigo}" eliminado.`);
    } catch {
      setMensajeError("No se pudo eliminar el cupón.");
    }
  }

  function toggleBanner(id: number) {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, activo: !b.activo } : b))
    );
  }

  return (
    <div className="container-fluid px-0">
      {/* Encabezado */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="brand-font fs-3 text-secondary mb-1 d-flex align-items-center gap-2">
            <Tag size={26} className="text-primary" />
            <span>Promociones, Cupones &amp; Descuentos</span>
          </h2>
          <p className="text-muted small mb-0">
            Crea códigos promocionales, límites de uso y banners para la tienda web y sistema POS.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            onClick={cargarPromociones}
            disabled={loading}
            className="btn btn-outline-secondary d-inline-flex align-items-center gap-1"
            title="Refrescar promociones"
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
            <span>Crear Cupón</span>
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

      {/* Tabla de Cupones */}
      <div className="card admin-card overflow-hidden shadow-sm mb-4">
        <div className="card-header admin-card-header d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 p-3">
          <div className="d-flex align-items-center gap-2">
            <Tag size={18} className="text-primary" />
            <span className="fw-bold text-secondary">Cupones de Descuento Activos</span>
            <span className="badge bg-secondary-subtle text-secondary ms-1">
              {cuponesFiltrados.filter((c) => c.activo).length} de {cuponesFiltrados.length} activos
            </span>
          </div>

          <div className="input-group" style={{ maxWidth: 300 }}>
            <span className="input-group-text bg-white border-end-0">
              <Search size={16} className="text-muted" />
            </span>
            <input
              type="text"
              placeholder="Buscar por código..."
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
                <th className="ps-4">Código</th>
                <th>Beneficio</th>
                <th>Mínimo Compra</th>
                <th>Usos Realizados</th>
                <th>Vencimiento</th>
                <th>Estado</th>
                <th className="text-end pe-4" style={{ width: 140 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Cargando cupones...
                  </td>
                </tr>
              ) : cuponesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    No se encontraron cupones registrados.
                  </td>
                </tr>
              ) : (
                cuponesFiltrados.map((c) => (
                  <tr key={c.id}>
                    <td className="ps-4 font-monospace fw-bold text-primary">
                      <span className="badge bg-light text-secondary border px-2 py-1">
                        {c.codigo}
                      </span>
                    </td>
                    <td className="fw-bold text-secondary">
                      {c.tipo === "PORCENTAJE"
                        ? `${c.valor}% OFF`
                        : `$${c.valor.toLocaleString("es-CL")} OFF`}
                    </td>
                    <td className="small text-muted">
                      ${c.minimoCompra.toLocaleString("es-CL")}
                    </td>
                    <td className="small">
                      <span className="fw-bold text-secondary">
                        {c.usosActuales} / {c.limiteUsos}
                      </span>
                      <span className="text-muted ms-1">canjes</span>
                    </td>
                    <td className="small text-muted">{c.expira || "Sin límite"}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleCupon(c)}
                        className={`btn btn-sm rounded-pill fw-bold py-0.5 px-3 ${
                          c.activo ? "btn-success" : "btn-light border text-muted"
                        }`}
                        title="Haz clic para alternar vigencia"
                      >
                        {c.activo ? "Activo" : "Pausado"}
                      </button>
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-inline-flex align-items-center gap-1">
                        <button
                          type="button"
                          onClick={() => abrirModalEditar(c)}
                          className="btn btn-sm btn-outline-secondary p-1"
                          title="Editar Cupón"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEliminarCupon(c)}
                          className="btn btn-sm btn-outline-danger p-1"
                          title="Eliminar Cupón"
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

      {/* Banners Web */}
      <div className="card admin-card p-4 shadow-sm">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <Sparkles size={20} className="text-primary" />
            <h3 className="brand-font fs-5 mb-0 text-secondary">
              Banners Promocionales en Tienda Web
            </h3>
          </div>
          <span className="text-muted small">Visible en tiempo real para clientes</span>
        </div>

        <div className="row g-3">
          {banners.map((b) => (
            <div key={b.id} className="col-12 col-md-6">
              <div
                className={`card admin-card h-100 p-3 ${
                  b.activo ? "border-primary bg-light" : "border-secondary-subtle opacity-75"
                }`}
              >
                <div className="d-flex align-items-start justify-content-between">
                  <div>
                    <span className="badge bg-secondary-subtle text-secondary mb-2">
                      {b.posicion === "TOP_BAR" ? "Barra Superior" : "Pop-up Bienvenida"}
                    </span>
                    <h5 className="fs-6 fw-bold text-secondary mb-1">{b.titulo}</h5>
                    <p className="small text-muted mb-0">{b.subtitulo}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleBanner(b.id)}
                    className="btn btn-link p-0 text-decoration-none"
                    title="Alternar estado"
                  >
                    {b.activo ? (
                      <ToggleRight size={32} className="text-success" />
                    ) : (
                      <ToggleLeft size={32} className="text-muted" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Crear / Editar Cupón */}
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
                  {cuponEditando ? `Editar Cupón: ${cuponEditando.codigo}` : "Crear Nuevo Cupón de Descuento"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={cerrarModal}
                  disabled={guardando}
                />
              </div>

              <form onSubmit={handleGuardarCupon}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase text-secondary">
                      Código Promocional *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: PRIMAVERA2026"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                      className="form-control font-monospace text-uppercase"
                      autoFocus
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase text-secondary">
                        Tipo Descuento
                      </label>
                      <select
                        value={tipo}
                        onChange={(e) =>
                          setTipo(e.target.value as "PORCENTAJE" | "MONTO_FIJO")
                        }
                        className="form-select"
                      >
                        <option value="PORCENTAJE">Porcentaje (%)</option>
                        <option value="MONTO_FIJO">Monto Fijo CLP ($)</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase text-secondary">
                        {tipo === "PORCENTAJE" ? "Porcentaje %" : "Monto CLP ($)"}
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={valor}
                        onChange={(e) => setValor(Number(e.target.value))}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase text-secondary">
                        Compra Mínima CLP
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={minimo}
                        onChange={(e) => setMinimo(Number(e.target.value))}
                        className="form-control"
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-bold text-uppercase text-secondary">
                        Límite de Canjes
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={limite}
                        onChange={(e) => setLimite(Number(e.target.value))}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase text-secondary">
                      Fecha de Vencimiento
                    </label>
                    <input
                      type="date"
                      required
                      value={expira}
                      onChange={(e) => setExpira(e.target.value)}
                      className="form-control"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase text-secondary">
                      Descripción de la Campaña (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 10% de descuento en pedidos sobre $20.000"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      className="form-control"
                    />
                  </div>

                  <div className="form-check form-switch mt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="checkCuponActivo"
                      checked={activo}
                      onChange={(e) => setActivo(e.target.checked)}
                    />
                    <label className="form-check-label fw-bold text-secondary" htmlFor="checkCuponActivo">
                      Cupón Activo (Permite canje inmediato en Webpay / POS)
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
                    <span>{cuponEditando ? "Guardar Cambios" : "Guardar Cupón"}</span>
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
