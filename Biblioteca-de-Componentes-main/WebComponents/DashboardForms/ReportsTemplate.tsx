// @use(kind, props, limit, deps, state)
// @kind(component)
// @props(metrics, isCrunching, dateFilter, ...)
// @limit(lines: 390, functions: 3, params: 1) // TODO: refactor >250 lines
// @deps(@external: [react, lucide-react], @internal: [../styles/reports.css])
import { useState } from 'react';
import { TrendingUp, DollarSign, Package, CheckCircle, XCircle, Award, Layers, Star, Calendar, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/reports.css';

interface ReportsProps {
  metrics: any;
  isCrunching: boolean;
  onFilterDate?: () => void;
  onPreviousDate?: () => void;
  onNextDate?: () => void;
  isLoading?: boolean;
}

export function Reports({ metrics, isCrunching, isLoading, onFilterDate, onPreviousDate, onNextDate }: ReportsProps) {
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory'>('sales');
  const [productMetric, setProductMetric] = useState<'revenue' | 'success' | 'rating'>('revenue');

  // Accordion states
  const [isOverviewOpen, setIsOverviewOpen] = useState(true);
  const [isRevenueOpen, setIsRevenueOpen] = useState(true);
  const [isProductsOpen, setIsProductsOpen] = useState(false);

  if (!metrics || isCrunching || isLoading) {
    return (
      <div className="reports-skeleton">
        <div className="reports-header" style={{ paddingTop: 'max(var(--sat, 0px), 0.5rem)' }}>
          <div className="reports-header-inner">
            <div>
              <div className="h-6 w-24 bg-brand-secondary/20 rounded-lg mb-2" />
              <div className="h-4 w-48 bg-brand-secondary/10 rounded-lg" />
            </div>
            <div className="flex p-1 bg-brand-secondary/10 rounded-xl mt-4 gap-1">
              <div className="flex-1 h-9 bg-brand-primary/20 rounded-lg" />
              <div className="flex-1 h-9 bg-brand-secondary/10 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="reports-content">
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-brand-secondary/5 border border-brand-secondary/10 rounded-2xl p-4 h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (metrics && metrics.total_orders === 0 && metrics.inventory_value === 0) {
    return (
      <div className="reports-container">
        <div className="reports-header" style={{ paddingTop: 'max(var(--sat, 0px), 0.5rem)' }}>
          <div className="reports-header-inner-empty">
            <h1 className="reports-title">Reportes</h1>
            <p className="reports-subtitle">Análisis de rendimiento Inteligente</p>
          </div>
        </div>
        <div className="reports-empty">
          <div className="reports-empty-icon-bg">
            <TrendingUp className="reports-empty-icon" />
          </div>
          <h2 className="reports-empty-title">Sin datos todavía</h2>
          <p className="reports-empty-desc">
            Aún no hay pedidos ni productos registrados.
          </p>
        </div>
      </div>
    );
  }

  const sortedProducts = productMetric === 'revenue'
    ? metrics.top_products_revenue || []
    : productMetric === 'success'
      ? metrics.top_products_success || []
      : metrics.top_products_rating || [];

  return (
    <div className="reports-container">
      {/* Header */}
      <div className="reports-header" style={{ paddingTop: 'max(var(--sat, 0px), 0.5rem)' }}>
        <div className="reports-header-inner">
          <div className="reports-title-row">
            <div>
              <h1 className="reports-title">Reportes</h1>
              <p className="reports-subtitle">Métricas de rendimiento en crudo</p>
            </div>
          </div>
          {/* Segmented Control */}
          <div className="reports-tabs">
            <button
              onClick={() => setActiveTab('sales')}
              className={`reports-tab ${activeTab === 'sales' ? 'reports-tab--active' : 'reports-tab--inactive'}`}
            >
              Ventas
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`reports-tab ${activeTab === 'inventory' ? 'reports-tab--active' : 'reports-tab--inactive'}`}
            >
              Inventario
            </button>
          </div>

          {/* Centered Date Filter Button */}
          {activeTab === 'sales' && (
            <div className="reports-date-filter">
              <div className="reports-date-controls">
                <button
                  onClick={onPreviousDate}
                  className="reports-date-btn"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={onFilterDate}
                  className="reports-date-btn--active"
                >
                  <Calendar className="w-5 h-5" />
                </button>
                <button
                  onClick={onNextDate}
                  className="reports-date-btn"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="reports-content">
        {activeTab === 'sales' ? (
          <>
            {/* ACCORDION 1: Resumen General */}
            <div className="reports-accordion-first">
              <button
                onClick={() => setIsOverviewOpen(!isOverviewOpen)}
                className="reports-accordion-header"
              >
                <div className="reports-accordion-title-group">
                  <Package className="reports-accordion-icon" />
                  <h2 className="reports-accordion-title">Resumen General (Filtro Actual)</h2>
                </div>
                {isOverviewOpen ? <ChevronUp className="reports-accordion-chevron" /> : <ChevronDown className="reports-accordion-chevron" />}
              </button>

              {isOverviewOpen && (
                <div className="reports-overview-grid">
                  <div className="reports-card reports-card--emerald">
                    <div className="reports-card-header">
                      <DollarSign className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="reports-card-value">
                      ${Number(metrics.total_revenue).toLocaleString('es-CL')}
                    </div>
                    <div className="reports-card-label">Ingresos Totales</div>
                  </div>

                  <div className="reports-card reports-card--blue">
                    <div className="reports-card-header">
                      <Package className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="reports-card-value">
                      {metrics.total_orders}
                    </div>
                    <div className="reports-card-label">Pedidos Totales</div>
                  </div>

                  <div className="reports-card reports-card--purple">
                    <div className="reports-card-header">
                      <TrendingUp className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="reports-card-value">
                      ${Number(metrics.average_order_value).toLocaleString('es-CL')}
                    </div>
                    <div className="reports-card-label">Ticket Promedio</div>
                  </div>

                  <div className="reports-card reports-card--cyan">
                    <div className="reports-card-header">
                      <CheckCircle className="w-5 h-5 text-cyan-500" />
                    </div>
                    <div className="reports-card-value">
                      {metrics.total_orders > 0 ? ((metrics.delivered_orders / metrics.total_orders) * 100).toFixed(1) : 0}%
                    </div>
                    <div className="reports-card-label">Tasa de Éxito Global</div>
                  </div>

                  {/* Status distribution numbers */}
                  <div className="reports-status-grid">
                    <div>
                      <div className="reports-status-val text-emerald-600">{metrics.delivered_orders}</div>
                      <div className="reports-status-lbl text-emerald-600/70">Entregados</div>
                    </div>
                    <div>
                      <div className="reports-status-val text-amber-600">{metrics.pending_orders}</div>
                      <div className="reports-status-lbl text-amber-600/70">Pendientes</div>
                    </div>
                    <div>
                      <div className="reports-status-val text-red-600">{metrics.rejected_orders}</div>
                      <div className="reports-status-lbl text-red-600/70">Rechazados</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ACCORDION 2: Ganancias Acumuladas */}
            <div className="reports-accordion">
              <button
                onClick={() => setIsRevenueOpen(!isRevenueOpen)}
                className="reports-accordion-header"
              >
                <div className="reports-accordion-title-group">
                  <TrendingUp className="reports-accordion-icon" />
                  <h2 className="reports-accordion-title">Ganancias (Tiempo Real)</h2>
                </div>
                {isRevenueOpen ? <ChevronUp className="reports-accordion-chevron" /> : <ChevronDown className="reports-accordion-chevron" />}
              </button>

              {isRevenueOpen && (
                <div className="reports-revenue-list">
                  <div className="reports-revenue-item">
                    <div>
                      <div className="reports-revenue-title">Hoy</div>
                      <div className="reports-revenue-desc">Desde las 00:00</div>
                    </div>
                    <div className="reports-revenue-val">
                      ${Number(metrics.revenue_today || 0).toLocaleString('es-CL')}
                    </div>
                  </div>

                  <div className="reports-revenue-item">
                    <div>
                      <div className="reports-revenue-title">Esta Semana</div>
                      <div className="reports-revenue-desc">Desde el domingo</div>
                    </div>
                    <div className="reports-revenue-val">
                      ${Number(metrics.revenue_this_week || 0).toLocaleString('es-CL')}
                    </div>
                  </div>

                  <div className="reports-revenue-item">
                    <div>
                      <div className="reports-revenue-title">Este Mes</div>
                      <div className="reports-revenue-desc">Mes calendario actual</div>
                    </div>
                    <div className="reports-revenue-val">
                      ${Number(metrics.revenue_this_month || 0).toLocaleString('es-CL')}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ACCORDION 3: Rendimiento de Productos */}
            <div className="reports-accordion">
              <button
                onClick={() => setIsProductsOpen(!isProductsOpen)}
                className="reports-accordion-header"
              >
                <div className="reports-accordion-title-group">
                  <Award className="reports-accordion-icon" />
                  <h2 className="reports-accordion-title">Rendimiento de Productos</h2>
                </div>
                {isProductsOpen ? <ChevronUp className="reports-accordion-chevron" /> : <ChevronDown className="reports-accordion-chevron" />}
              </button>

              {isProductsOpen && (
                <div className="reports-products-content">
                  <div className="reports-product-filters">
                    <button
                      onClick={() => setProductMetric('revenue')}
                      className={`reports-product-filter-btn ${productMetric === 'revenue' ? 'reports-product-filter-btn--active' : 'reports-product-filter-btn--inactive'}`}
                    >
                      Mayores Ingresos
                    </button>
                    <button
                      onClick={() => setProductMetric('success')}
                      className={`reports-product-filter-btn ${productMetric === 'success' ? 'reports-product-filter-btn--active' : 'reports-product-filter-btn--inactive'}`}
                    >
                      Tasa de Éxito
                    </button>
                    <button
                      onClick={() => setProductMetric('rating')}
                      className={`reports-product-filter-btn ${productMetric === 'rating' ? 'reports-product-filter-btn--active' : 'reports-product-filter-btn--inactive'}`}
                    >
                      Mejor Valorados
                    </button>
                  </div>

                  <div className="reports-product-grid">
                    {sortedProducts.map((product: any, index: number) => (
                      <div key={product.name} className="reports-product-item">
                        <div className="reports-product-rank">
                          {index + 1}
                        </div>
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="reports-product-img" />
                        ) : (
                          <div className="reports-product-img-empty">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div className="reports-product-info">
                          <div className="reports-product-name">{product.name}</div>
                          <div className="reports-product-orders">{product.ordersCount} pedidos</div>
                        </div>
                        <div className="reports-product-stat">
                          {productMetric === 'revenue' ? (
                            <div className="reports-product-stat-revenue">${Number(product.revenue).toLocaleString('es-CL')}</div>
                          ) : productMetric === 'success' ? (
                            <div className={`reports-product-stat-success ${Number(product.successRate) >= 90 ? 'text-emerald-600' :
                              Number(product.successRate) >= 70 ? 'text-blue-600' :
                                Number(product.successRate) >= 50 ? 'text-amber-600' : 'text-red-600'
                              }`}>
                              {Number(product.successRate).toFixed(1)}%
                            </div>
                          ) : (
                            <div className="reports-product-stat-rating">
                              {Number(product.averageRating).toFixed(1)} <Star className="w-3.5 h-3.5 fill-current" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {sortedProducts.length === 0 && (
                      <div className="text-center py-8 text-brand-text/40 text-sm font-medium">
                        No hay datos suficientes
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="reports-inventory-overview">
              <div className="reports-inventory-header">
                <Layers className="w-5 h-5 text-brand-primary" />
                <h2 className="reports-accordion-title">Estado del Inventario</h2>
              </div>
              <div className="reports-inventory-grid-4">
                <div className="reports-card reports-card--blue">
                  <div className="reports-card-value">{metrics.total_products || 0}</div>
                  <div className="reports-card-label text-blue-700/70">Total de Productos</div>
                </div>
                <div className="reports-card reports-card--emerald">
                  <div className="reports-card-value">{metrics.active_products || 0}</div>
                  <div className="reports-card-label text-emerald-700/70">Productos Activos</div>
                </div>
                <div className="reports-card reports-card--purple">
                  <div className="reports-card-value">{metrics.products_on_sale || 0}</div>
                  <div className="reports-card-label text-purple-700/70">En Oferta</div>
                </div>
                <div className="reports-card reports-card--amber">
                  <div className="reports-card-value">{metrics.low_stock_products || 0}</div>
                  <div className="reports-card-label text-amber-700/70">Bajo Stock (≤5)</div>
                </div>
              </div>

              <div className="reports-inventory-grid-2">
                <div className="reports-inventory-card reports-inventory-card-red">
                  <div>
                    <div className="reports-card-value text-red-700">{metrics.out_of_stock_products || 0}</div>
                    <div className="reports-card-label text-red-700/70">Agotados</div>
                  </div>
                  <XCircle className="w-8 h-8 text-red-500/50" />
                </div>
                <div className="reports-inventory-card reports-inventory-card-neutral">
                  <div>
                    <div className="reports-card-value">
                      ${Number(metrics.inventory_value || 0).toLocaleString('es-CL')}
                    </div>
                    <div className="reports-card-label">Capital Inmovilizado</div>
                  </div>
                  <DollarSign className="w-8 h-8 text-brand-text/30" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}