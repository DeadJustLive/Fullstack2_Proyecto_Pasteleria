// @pca:start
// @id(admin.pages.dashboard)
// @kind(page)
// @limit(lines: 260)
// @contract(DashboardView())
// @relates(docs.especificacion_pwa_admin)
// @desc(Resumen administrativo con metricas, ventas diarias y accesos rapidos)
// @pca:end
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  DollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

const VENTAS_SEMANALES = [
  { dia: "Lun", monto: "$450.000", porcentaje: 39 },
  { dia: "Mar", monto: "$520.000", porcentaje: 45 },
  { dia: "Mié", monto: "$610.000", porcentaje: 53 },
  { dia: "Jue", monto: "$580.000", porcentaje: 50 },
  { dia: "Vie", monto: "$890.000", porcentaje: 77 },
  { dia: "Sáb", monto: "$1.150.000", porcentaje: 100 },
  { dia: "Dom", monto: "$650.000", porcentaje: 56 },
];

const TOP_PRODUCTOS = [
  { nombre: "Torta Cuatro Leches Tradicional", unidades: 68, recaudacion: "$2.312.000", porcentaje: 85 },
  { nombre: "Cheesecake Horneado Frutos Rojos", unidades: 52, recaudacion: "$1.768.000", porcentaje: 65 },
  { nombre: "Torta Hojarasca Manjar Lúcuma", unidades: 34, recaudacion: "$1.088.000", porcentaje: 42 },
  { nombre: "Tarta de Limón y Merengue Suizo", unidades: 29, recaudacion: "$696.000", porcentaje: 36 },
];

const ALERTAS_STOCK = [
  { insumo: "Crema Chantilly 35% MG", actual: "3.5 L", minimo: "10 L" },
  { insumo: "Harina de Almendras Fina", actual: "1.2 kg", minimo: "5 kg" },
  { insumo: "Frutillas Frescas Selección", actual: "4 kg", minimo: "8 kg" },
];

export function Dashboard() {
  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-4">
        <div>
          <h2 className="brand-font fs-3 text-secondary mb-1">
            Resumen Operativo y Financiero
          </h2>
          <p className="text-muted small mb-0">
            Métricas de rendimiento en tiempo real · Octubre 2026 (React + Bootstrap 5)
          </p>
        </div>
        <div className="d-inline-flex align-items-center gap-1 badge bg-light text-secondary border py-2 px-3 small">
          <Clock size={14} />
          <span>Último corte: Hoy 14:30 hrs</span>
        </div>
      </div>

      {/* Tarjetas KPI en Grid Bootstrap */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card admin-card h-100 p-3">
            <div className="d-flex align-items-center justify-content-between text-muted small text-uppercase fw-bold">
              <span>Ingresos del Mes</span>
              <span className="badge bg-success-subtle text-success p-2 rounded-3">
                <DollarSign size={18} />
              </span>
            </div>
            <div className="fs-3 fw-bold text-secondary my-2">$4.850.000</div>
            <div className="d-flex align-items-center gap-1 text-success small fw-bold">
              <ArrowUpRight size={15} />
              <span>+18.4% vs mes anterior</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card admin-card h-100 p-3">
            <div className="d-flex align-items-center justify-content-between text-muted small text-uppercase fw-bold">
              <span>Pedidos Totales</span>
              <span className="badge bg-primary-subtle text-primary p-2 rounded-3">
                <ShoppingBag size={18} />
              </span>
            </div>
            <div className="fs-3 fw-bold text-secondary my-2">142 órdenes</div>
            <div className="d-flex align-items-center gap-1 text-success small fw-bold">
              <ArrowUpRight size={15} />
              <span>+12.0% cumplidas a tiempo</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card admin-card h-100 p-3">
            <div className="d-flex align-items-center justify-content-between text-muted small text-uppercase fw-bold">
              <span>Ticket Promedio</span>
              <span className="badge bg-warning-subtle text-warning p-2 rounded-3">
                <TrendingUp size={18} />
              </span>
            </div>
            <div className="fs-3 fw-bold text-secondary my-2">$34.150</div>
            <div className="d-flex align-items-center gap-1 text-success small fw-bold">
              <ArrowUpRight size={15} />
              <span>+5.8% en tortas personalizadas</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card admin-card h-100 p-3">
            <div className="d-flex align-items-center justify-content-between text-muted small text-uppercase fw-bold">
              <span>Mermas / Desperdicio</span>
              <span className="badge bg-danger-subtle text-danger p-2 rounded-3">
                <AlertTriangle size={18} />
              </span>
            </div>
            <div className="fs-3 fw-bold text-secondary my-2">1.2% producción</div>
            <div className="d-flex align-items-center gap-1 text-success small fw-bold">
              <ArrowDownRight size={15} />
              <span>-0.4% reducción de costos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico Semanal y Alertas en Grid Bootstrap */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-8">
          <div className="card admin-card h-100 p-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h3 className="brand-font fs-5 mb-0 text-secondary">
                  Ventas de la Semana en Curso
                </h3>
                <span className="text-muted small">
                  Comparativo diario (Total acumulado: $4.850.000)
                </span>
              </div>
              <span className="badge bg-secondary-subtle text-secondary py-2 px-3">
                Pico Sábado: $1.150.000
              </span>
            </div>

            <div
              className="d-flex align-items-end justify-content-between border-bottom pb-2 pt-4"
              style={{ height: "220px" }}
            >
              {VENTAS_SEMANALES.map((item) => (
                <div
                  key={item.dia}
                  className="d-flex flex-column align-items-center justify-content-end h-100 flex-fill px-1 text-center"
                >
                  <span
                    className="fw-bold text-secondary text-truncate mb-1"
                    style={{ fontSize: "0.68rem" }}
                  >
                    {item.monto}
                  </span>
                  <div
                    style={{
                      height: `${item.porcentaje}%`,
                      width: "100%",
                      maxWidth: "38px",
                      background: "linear-gradient(180deg, #8B4513, #FFC0CB)",
                      borderRadius: "6px 6px 0 0",
                      transition: "height 0.3s ease",
                    }}
                  />
                  <span className="mt-2 text-muted fw-bold small">{item.dia}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card admin-card h-100 p-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h3 className="brand-font fs-5 mb-0 text-secondary">Stock Crítico</h3>
              <span className="badge bg-danger rounded-pill">3 insumos</span>
            </div>

            <div className="d-flex flex-column gap-2.5">
              {ALERTAS_STOCK.map((item) => (
                <div
                  key={item.insumo}
                  className="p-3 rounded-3 border bg-light d-flex align-items-center justify-content-between"
                >
                  <div>
                    <div className="fw-bold text-secondary small">{item.insumo}</div>
                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                      Mínimo sugerido: {item.minimo}
                    </div>
                  </div>
                  <span className="badge bg-danger">{item.actual}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Tortas Más Vendidas */}
      <div className="card admin-card p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h3 className="brand-font fs-5 mb-0 text-secondary">
              Top 5 Tortas y Postres Más Vendidos
            </h3>
            <span className="text-muted small">
              Clasificados por volumen de órdenes y recaudación en CLP
            </span>
          </div>
          <Package className="text-muted" size={22} />
        </div>

        <div className="d-flex flex-column gap-3">
          {TOP_PRODUCTOS.map((prod, idx) => (
            <div key={prod.nombre}>
              <div className="d-flex align-items-center justify-content-between small fw-bold mb-1">
                <span className="text-secondary">
                  <span className="text-muted me-2">#{idx + 1}</span>
                  {prod.nombre}
                </span>
                <span className="text-secondary">
                  {prod.unidades} un. ·{" "}
                  <span className="text-primary fw-bold">{prod.recaudacion}</span>
                </span>
              </div>
              <div className="progress" style={{ height: "8px" }}>
                <div
                  className="progress-bar bg-primary"
                  role="progressbar"
                  style={{ width: `${prod.porcentaje}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
