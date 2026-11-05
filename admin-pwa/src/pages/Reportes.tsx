// @pca:start
// @id(admin.pages.reportes)
// @kind(page)
// @limit(lines: 450)
// @contract(ReportesAdminView())
// @relates(admin.services.api)
// @relates(admin.hooks.realtimeSync)
// @relates(docs.especificacion_pwa_admin)
// @desc(Modulo independiente de reportes financieros, KPIs, graficos y exportacion CSV)
// @pca:end
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { adminApi, type OrderAdmin, type ProductCatalogDTO } from "../services/api";
import { useAdminRealtimeSync } from "../hooks/useAdminRealtimeSync";

export function Reportes() {
  const [periodo, setPeriodo] = useState<"todos" | "mes_actual" | "7dias">("todos");
  const [ordenes, setOrdenes] = useState<OrderAdmin[]>([]);
  const [productos, setProductos] = useState<ProductCatalogDTO[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);

  const cargarDatos = useCallback(async () => {
    try {
      const [ordData, prodData] = await Promise.all([
        adminApi.orders.list().catch(() => []),
        adminApi.products.list().catch(() => []),
      ]);
      if (Array.isArray(ordData)) setOrdenes(ordData);
      if (Array.isArray(prodData)) setProductos(prodData);
    } catch {
      // Manejo defensivo
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  useAdminRealtimeSync(() => {
    void cargarDatos();
  });

  const ordenesFiltradas = useMemo(() => {
    if (periodo === "todos") return ordenes;
    const ahora = new Date();
    if (periodo === "7dias") {
      const limite = new Date(ahora);
      limite.setDate(ahora.getDate() - 7);
      const iso = limite.toISOString().split("T")[0];
      return ordenes.filter((o) => (o.fecha || "") >= iso);
    }
    const mesStr = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}`;
    return ordenes.filter((o) => (o.fecha || "").startsWith(mesStr));
  }, [ordenes, periodo]);

  const totalIngresos = useMemo(() => {
    return ordenesFiltradas.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
  }, [ordenesFiltradas]);

  const totalPedidos = ordenesFiltradas.length;
  const pedidosEntregados = ordenesFiltradas.filter((o) => o.estado === "ENTREGADO").length;
  const porcentajeCumplimiento = totalPedidos > 0 ? Math.round((pedidosEntregados / totalPedidos) * 100) : 0;
  const ticketPromedio = totalPedidos > 0 ? Math.round(totalIngresos / totalPedidos) : 0;
  const enPreparacion = ordenesFiltradas.filter((o) => o.estado === "EN_PREPARACION" || o.estado === "PAGADO").length;

  const { ventasSemanales, maxVentaTexto, promedioDiarioTexto } = useMemo(() => {
    const nombres = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const hoy = new Date();
    const bars = [];
    for (let i = 6; i >= 0; i--) {
      const f = new Date(hoy);
      f.setDate(hoy.getDate() - i);
      const dia = nombres[f.getDay()];
      const fStr = f.toISOString().split("T")[0];
      const monto = ordenes
        .filter((o) => (o.fecha || "").startsWith(fStr))
        .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      bars.push({ dia, fecha: fStr, monto, porcentaje: 8 });
    }
    const maxMonto = Math.max(1, ...bars.map((b) => b.monto));
    const totalSem = bars.reduce((acc, b) => acc + b.monto, 0);
    let maxDia = bars[0];
    bars.forEach((b) => {
      b.porcentaje = maxMonto > 0 ? Math.max(8, Math.round((b.monto / maxMonto) * 100)) : 8;
      if (b.monto > (maxDia?.monto || 0)) maxDia = b;
    });
    return {
      ventasSemanales: bars,
      maxVentaTexto: maxDia && maxDia.monto > 0 ? `${maxDia.dia} ($${maxDia.monto.toLocaleString("es-CL")})` : "Sin ventas registradas",
      promedioDiarioTexto: `$${Math.round(totalSem / 7).toLocaleString("es-CL")}`,
    };
  }, [ordenes]);

  const metodosPago = useMemo(() => {
    const counts = {
      flow: { total: 0, label: "Flow / Webpay Online", icon: CreditCard, color: "bg-primary" },
      pos: { total: 0, label: "Débito / Crédito POS", icon: CreditCard, color: "bg-success" },
      efectivo: { total: 0, label: "Efectivo Mostrador", icon: DollarSign, color: "bg-warning" },
      transf: { total: 0, label: "Transferencia Bancaria", icon: ShoppingBag, color: "bg-secondary" },
    };
    ordenesFiltradas.forEach((o) => {
      const m = (o.metodoPago || "").toLowerCase();
      const val = Number(o.total) || 0;
      if (m.includes("efectivo") || m.includes("cash")) counts.efectivo.total += val;
      else if (m.includes("pos") || m.includes("debito") || m.includes("crédito") || m.includes("credito") || m.includes("tarjeta")) counts.pos.total += val;
      else if (m.includes("transf") || m.includes("banco")) counts.transf.total += val;
      else counts.flow.total += val;
    });
    const divisor = totalIngresos > 0 ? totalIngresos : 1;
    return Object.values(counts).map((c) => ({
      ...c,
      porcentaje: totalIngresos > 0 ? Math.round((c.total / divisor) * 100) : 0,
    }));
  }, [ordenesFiltradas, totalIngresos]);

  const rankingProductos = useMemo(() => {
    const ventasMap: Record<string, { nombre: string; categoria: string; unidades: number; ingresos: number }> = {};
    ordenesFiltradas.forEach((o) => {
      if (Array.isArray(o.items)) {
        o.items.forEach((it) => {
          const key = it.nombre || "Producto";
          if (!ventasMap[key]) ventasMap[key] = { nombre: key, categoria: "Pastelería", unidades: 0, ingresos: 0 };
          const cant = Number(it.cantidad) || 1;
          ventasMap[key].unidades += cant;
          ventasMap[key].ingresos += Number(it.subtotal) || cant * (Number(it.precio) || 0);
        });
      }
    });
    let list = Object.values(ventasMap);
    if (list.length === 0) {
      list = productos
        .filter((p) => (p.ventas || 0) > 0)
        .map((p) => ({ nombre: p.nombre, categoria: p.categoria || "Catálogo", unidades: p.ventas || 0, ingresos: (p.ventas || 0) * (Number(p.precio) || 0) }));
    }
    list.sort((a, b) => b.unidades - a.unidades);
    const top = list.slice(0, 5);
    const maxU = Math.max(1, ...top.map((t) => t.unidades));
    return top.map((p, idx) => ({
      ranking: `#${idx + 1}`,
      medalla: idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "🍰",
      ...p,
      porcentaje: Math.max(5, Math.round((p.unidades / maxU) * 100)),
    }));
  }, [ordenesFiltradas, productos]);

  const handleExportarCSV = () => {
    const bom = "\uFEFF";
    const headers = "ID,Tracking,Cliente,Fecha,Estado,Total CLP,Metodo Pago\r\n";
    const escapeCsv = (val: unknown) => `"${String(val ?? "").replace(/"/g, '""')}"`;
    const rows = ordenesFiltradas.map((o) => [
      escapeCsv(o.id), escapeCsv(o.trackingCode || ""), escapeCsv(o.cliente || ""),
      escapeCsv(o.fecha || ""), escapeCsv(o.estado || ""), escapeCsv(o.total || 0),
      escapeCsv(o.metodoPago || "Flow / Webpay Online"),
    ].join(",")).join("\r\n");

    const blob = new Blob([bom + headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte_ventas_cremeco_${periodo}_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const kpis = [
    { label: "Ingresos Totales", valor: `$${totalIngresos.toLocaleString("es-CL")}`, icon: DollarSign, badgeClass: "bg-success-subtle text-success", sub: `${totalPedidos} órdenes registradas` },
    { label: "Pedidos Entregados", valor: `${pedidosEntregados} de ${totalPedidos}`, icon: CheckCircle2, badgeClass: "bg-primary-subtle text-primary", sub: `${porcentajeCumplimiento}% entregados a tiempo` },
    { label: "Ticket Promedio", valor: `$${ticketPromedio.toLocaleString("es-CL")}`, icon: TrendingUp, badgeClass: "bg-warning-subtle text-warning", sub: "Calculado sobre órdenes del período" },
    { label: "En Cocina / KDS", valor: `${enPreparacion} pedidos`, icon: Clock, badgeClass: "bg-danger-subtle text-danger", sub: "Pendientes de entrega" },
  ];

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="brand-font fs-3 text-secondary mb-1">Reportes &amp; Métricas Financieras</h2>
          <p className="text-muted small mb-0">Análisis consolidado de ventas Webpay, mostrador POS, cumplimiento y productos</p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="input-group input-group-sm" style={{ width: "200px" }}>
            <span className="input-group-text bg-light"><Calendar size={14} /></span>
            <select
              className="form-select form-select-sm"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value as "todos" | "mes_actual" | "7dias")}
              aria-label="Seleccionar periodo"
            >
              <option value="todos">Histórico Completo</option>
              <option value="mes_actual">Mes Actual</option>
              <option value="7dias">Últimos 7 días</option>
            </select>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 shadow-sm"
            onClick={handleExportarCSV}
            disabled={ordenesFiltradas.length === 0}
            title={ordenesFiltradas.length === 0 ? "No hay órdenes para exportar" : "Descargar CSV"}
          >
            <Download size={15} /><span>Exportar CSV</span>
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {kpis.map((k) => (
          <div key={k.label} className="col-12 col-sm-6 col-xl-3">
            <div className="card admin-card h-100 p-3 shadow-sm border-0">
              <div className="d-flex align-items-center justify-content-between text-muted small text-uppercase fw-bold">
                <span>{k.label}</span>
                <span className={`badge ${k.badgeClass} p-2 rounded-3`}><k.icon size={18} /></span>
              </div>
              <div className="fs-3 fw-bold text-secondary my-2">{k.valor}</div>
              <div className="text-muted small">{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-8">
          <div className="card admin-card p-3 p-md-4 shadow-sm border-0 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <div>
                <h5 className="brand-font fs-5 text-secondary mb-1">Ventas Semanales Consolidadas</h5>
                <p className="text-muted small mb-0">Consolidado diario en CLP (Webpay + Flow + Terminal POS)</p>
              </div>
              <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 small">Tiempo Real</span>
            </div>
            <div className="d-flex align-items-end justify-content-between gap-2 pt-4 pb-2 border-bottom" style={{ minHeight: "200px" }}>
              {ventasSemanales.map((b) => (
                <div key={`${b.dia}-${b.fecha}`} className="d-flex flex-column align-items-center flex-grow-1" style={{ height: "180px" }}>
                  <span className="small text-muted fw-bold mb-1" style={{ fontSize: "0.75rem" }}>
                    ${Math.round(b.monto / 1000)}k
                  </span>
                  <div
                    className="w-100 rounded-top"
                    style={{
                      height: `${b.porcentaje}%`,
                      maxWidth: "42px",
                      backgroundColor: b.monto > 0 ? "#8B4513" : "#E2D9D2",
                      transition: "height 0.4s ease",
                    }}
                    title={`${b.dia} (${b.fecha}): $${b.monto.toLocaleString("es-CL")}`}
                  />
                  <span className="small text-secondary fw-semibold mt-2">{b.dia}</span>
                </div>
              ))}
            </div>
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3 pt-2 text-muted small">
              <span>Mayor venta: <strong>{maxVentaTexto}</strong></span>
              <span>Promedio diario: <strong>{promedioDiarioTexto}</strong></span>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card admin-card p-3 p-md-4 shadow-sm border-0 h-100">
            <h5 className="brand-font fs-5 text-secondary mb-3 pb-2 border-bottom">Distribución de Métodos de Pago</h5>
            <div className="d-flex flex-column gap-3">
              {metodosPago.map((m) => (
                <div key={m.label}>
                  <div className="d-flex justify-content-between small fw-bold mb-1">
                    <span className="d-flex align-items-center gap-1.5 text-secondary">
                      <m.icon size={15} /> {m.label}
                    </span>
                    <span>{m.porcentaje}% (${m.total.toLocaleString("es-CL")})</span>
                  </div>
                  <div className="progress" style={{ height: "8px" }}>
                    <div className={`progress-bar ${m.color}`} style={{ width: `${m.porcentaje}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="alert alert-light border mt-4 mb-0 small text-muted">
              💡 <strong>Transparencia:</strong> Calculado sobre {totalPedidos} transacciones en el periodo.
            </div>
          </div>
        </div>
      </div>

      <div className="card admin-card p-3 p-md-4 shadow-sm border-0">
        <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
          <div>
            <h5 className="brand-font fs-5 text-secondary mb-1">Tortas y Productos Más Vendidos</h5>
            <p className="text-muted small mb-0">Rendimiento por volumen de ventas e ingresos en el periodo</p>
          </div>
          <span className="badge bg-light text-secondary border">Top {rankingProductos.length} Productos</span>
        </div>
        {cargando ? (
          <div className="p-4 text-center text-muted">Cargando métricas...</div>
        ) : rankingProductos.length === 0 ? (
          <div className="p-4 text-center text-muted small">No se registran ventas para los productos en este periodo.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th style={{ width: "80px" }}>Ranking</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th className="text-center">Unidades</th>
                  <th className="text-end">Ingresos CLP</th>
                  <th style={{ width: "160px" }}>Participación</th>
                </tr>
              </thead>
              <tbody>
                {rankingProductos.map((item) => (
                  <tr key={item.ranking}>
                    <td><span className="fw-bold">{item.ranking} {item.medalla}</span></td>
                    <td><span className="fw-bold text-secondary">{item.nombre}</span></td>
                    <td><span className="badge bg-light text-secondary border">{item.categoria}</span></td>
                    <td className="text-center fw-bold">{item.unidades}</td>
                    <td className="text-end fw-bold text-primary">${item.ingresos.toLocaleString("es-CL")}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <div className="progress flex-grow-1" style={{ height: "6px" }}>
                          <div className="progress-bar bg-secondary" style={{ width: `${item.porcentaje}%` }} />
                        </div>
                        <span className="small text-muted fw-bold">{item.porcentaje}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
