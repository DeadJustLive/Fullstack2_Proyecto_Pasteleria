import { useState } from "react";
import { Plus, Sparkles, Tag, ToggleLeft, ToggleRight } from "lucide-react";

interface Cupon {
  id: number;
  codigo: string;
  tipo: "PORCENTAJE" | "MONTO_FIJO";
  valor: number;
  minimoCompra: number;
  usosActuales: number;
  limiteUsos: number;
  expira: string;
  activo: boolean;
}

interface BannerPromocional {
  id: number;
  titulo: string;
  subtitulo: string;
  posicion: "TOP_BAR" | "POPUP_BIENVENIDA";
  activo: boolean;
}

const CUPONES_INICIALES: Cupon[] = [
  { id: 1, codigo: "DULCE10", tipo: "PORCENTAJE", valor: 10, minimoCompra: 20000, usosActuales: 42, limiteUsos: 100, expira: "2026-11-30", activo: true },
  { id: 2, codigo: "PRIMERACOMPRA", tipo: "PORCENTAJE", valor: 15, minimoCompra: 25000, usosActuales: 89, limiteUsos: 150, expira: "2026-12-31", activo: true },
  { id: 3, codigo: "CUMPLEANOS5000", tipo: "MONTO_FIJO", valor: 5000, minimoCompra: 30000, usosActuales: 14, limiteUsos: 50, expira: "2026-11-15", activo: true },
];

const BANNERS_INICIALES: BannerPromocional[] = [
  { id: 1, titulo: "10% de descuento en tu primer pedido online", subtitulo: "Usa el cupón DULCE10 al finalizar tu compra", posicion: "TOP_BAR", activo: true },
  { id: 2, titulo: "¡Reserva tus tortas de fin de año con anticipación!", subtitulo: "Cupos limitados para retiros del 24 y 31 de diciembre", posicion: "POPUP_BIENVENIDA", activo: false },
];

export function Promociones() {
  const [cupones, setCupones] = useState<Cupon[]>(CUPONES_INICIALES);
  const [banners, setBanners] = useState<BannerPromocional[]>(BANNERS_INICIALES);
  const [modalNuevoCupon, setModalNuevoCupon] = useState(false);

  // Form nuevo cupon
  const [codigo, setCodigo] = useState("");
  const [tipo, setTipo] = useState<"PORCENTAJE" | "MONTO_FIJO">("PORCENTAJE");
  const [valor, setValor] = useState(10);
  const [minimo, setMinimo] = useState(20000);
  const [limite, setLimite] = useState(100);
  const [expira, setExpira] = useState("2026-12-31");

  function handleCrearCupon(e: React.FormEvent) {
    e.preventDefault();
    if (!codigo.trim()) return;

    const nuevo: Cupon = {
      id: Date.now(),
      codigo: codigo.toUpperCase().trim(),
      tipo,
      valor: Number(valor),
      minimoCompra: Number(minimo),
      usosActuales: 0,
      limiteUsos: Number(limite),
      expira,
      activo: true,
    };

    setCupones([nuevo, ...cupones]);
    setModalNuevoCupon(false);
    setCodigo("");
  }

  function toggleCupon(id: number) {
    setCupones((prev) =>
      prev.map((c) => (c.id === id ? { ...c, activo: !c.activo } : c))
    );
  }

  function toggleBanner(id: number) {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, activo: !b.activo } : b))
    );
  }

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="brand-font fs-3 text-secondary mb-1">
            Promociones, Cupones &amp; Descuentos
          </h2>
          <p className="text-muted small mb-0">
            Crea códigos promocionales, límites de uso y banners para la tienda web con React + Bootstrap 5.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalNuevoCupon(true)}
          className="btn btn-primary d-inline-flex align-items-center gap-2"
        >
          <Plus size={18} />
          <span>Crear Cupón</span>
        </button>
      </div>

      {/* Tabla de Cupones */}
      <div className="card admin-card overflow-hidden mb-4">
        <div className="card-header admin-card-header d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <Tag size={18} className="text-primary" />
            <span className="fw-bold text-secondary">Cupones de Descuento Activos</span>
          </div>
          <span className="badge bg-secondary-subtle text-secondary">
            {cupones.filter((c) => c.activo).length} de {cupones.length} cupones activos
          </span>
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
                <th className="text-end pe-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              {cupones.map((c) => (
                <tr key={c.id}>
                  <td className="ps-4 font-monospace fw-bold text-primary">
                    <span className="badge bg-light text-secondary border px-2 py-1">
                      {c.codigo}
                    </span>
                  </td>
                  <td className="fw-bold text-secondary">
                    {c.tipo === "PORCENTAJE" ? `${c.valor}% OFF` : `$${c.valor.toLocaleString("es-CL")} OFF`}
                  </td>
                  <td className="small text-muted">${c.minimoCompra.toLocaleString("es-CL")}</td>
                  <td className="small">
                    <span className="fw-bold text-secondary">{c.usosActuales} / {c.limiteUsos}</span>
                    <span className="text-muted ms-1">canjes</span>
                  </td>
                  <td className="small text-muted">{c.expira}</td>
                  <td className="text-end pe-4">
                    <button
                      type="button"
                      onClick={() => toggleCupon(c.id)}
                      className={`btn btn-sm rounded-pill fw-bold py-0.5 px-3 ${
                        c.activo ? "btn-success" : "btn-light border text-muted"
                      }`}
                    >
                      {c.activo ? "Activo" : "Pausado"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Banners Web */}
      <div className="card admin-card p-4">
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

      {/* Modal Nuevo Cupon */}
      {modalNuevoCupon && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setModalNuevoCupon(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content admin-modal-content">
              <div className="modal-header admin-modal-header">
                <h5 className="modal-title brand-font fs-5 text-secondary">
                  Crear Nuevo Cupón de Descuento
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalNuevoCupon(false)}
                />
              </div>
              <form onSubmit={handleCrearCupon}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase text-secondary">
                      Código Promocional
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: PRIMAVERA2026"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                      className="form-control font-monospace text-uppercase"
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
                        {tipo === "PORCENTAJE" ? "Porcentaje %" : "Monto CLP"}
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

                  <div>
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
                </div>

                <div className="modal-footer border-top bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setModalNuevoCupon(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Guardar Cupón
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
