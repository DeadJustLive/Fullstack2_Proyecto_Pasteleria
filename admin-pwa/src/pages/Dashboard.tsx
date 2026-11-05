import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { adminApi, type OrderAdmin, type ProductCatalogDTO } from "../services/api";
import { useAdminRealtimeSync } from "../hooks/useAdminRealtimeSync";

export function Dashboard() {
  const [ordenes, setOrdenes] = useState<OrderAdmin[]>([]);
  const [productos, setProductos] = useState<ProductCatalogDTO[]>([]);
  const [mermasCount, setMermasCount] = useState<number>(0);
  const [cargando, setCargando] = useState<boolean>(true);

  const cargarDatos = useCallback(async () => {
    try {
      const [ordData, prodData, kardexData] = await Promise.all([
        adminApi.orders.list().catch(() => []),
        adminApi.products.list().catch(() => []),
        adminApi.inventory.getKardex().catch(() => []),
      ]);

      if (Array.isArray(ordData)) {
        setOrdenes(ordData);
      }
      if (Array.isArray(prodData)) {
        setProductos(prodData);
      }
      if (Array.isArray(kardexData)) {
        const mermas = kardexData.filter((k) => (k.tipo || "").toUpperCase().includes("MERMA")).length;
        setMermasCount(mermas);
      }
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

  // Cálculos dinámicos reales
  const ingresosTotales = useMemo(() => {
    return ordenes.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
  }, [ordenes]);

  const totalOrdenes = ordenes.length;
  const ticketProm = totalOrdenes > 0 ? Math.round(ingresosTotales / totalOrdenes) : 0;
  const ordenesEntregadas = useMemo(() => {
    return ordenes.filter((o) => o.estado === "ENTREGADO").length;
  }, [ordenes]);

  // Gráfico dinámico: últimos 7 días
  const { barrasSemana, totalSemana, picoDia } = useMemo(() => {
    const nombresDias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const hoy = new Date();
    const resultado = [];

    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - i);
      const diaSemana = nombresDias[fecha.getDay()];
      const fechaStr = fecha.toISOString().split("T")[0];

      const montoDia = ordenes
        .filter((o) => (o.fecha || "").startsWith(fechaStr))
        .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

      resultado.push({
        dia: diaSemana,
        fecha: fechaStr,
        monto: montoDia,
        montoStr: `$${montoDia.toLocaleString("es-CL")}`,
      });
    }

    const montos = resultado.map((r) => r.monto);
    const maxMonto = Math.max(1, ...montos);
    const total = montos.reduce((a, b) => a + b, 0);

    let maxDia = resultado[0];
    resultado.forEach((r) => {
      if (r.monto > (maxDia?.monto || 0)) maxDia = r;
    });

    const barras = resultado.map((r) => ({
      ...r,
      porcentaje: maxMonto > 0 ? Math.max(8, Math.round((r.monto / maxMonto) * 100)) : 8,
    }));

    return {
      barrasSemana: barras,
      totalSemana: total,
      picoDia: maxDia && maxDia.monto > 0 ? `${maxDia.dia}: $${maxDia.monto.toLocaleString("es-CL")}` : "Sin ventas aún",
    };
  }, [ordenes]);

  // Stock Crítico Real (<= 5 unidades en catálogo)
  const productosCriticos = useMemo(() => {
    return productos
      .filter((p) => Number(p.stock) <= 5)
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        nombre: p.nombre,
        actual: `${p.stock} un.`,
        minimo: "5 un.",
        categoria: p.categoria || "Catálogo",
      }));
  }, [productos]);

  // Top 5 Productos más vendidos calculado desde ítems de órdenes reales o ventas del catálogo
  const topProductos = useMemo(() => {
    const map: Record<string, { nombre: string; unidades: number; recaudacion: number }> = {};

    ordenes.forEach((o) => {
      if (Array.isArray(o.items)) {
        o.items.forEach((it) => {
          const key = it.nombre || "Producto";
          if (!map[key]) {
            map[key] = { nombre: key, unidades: 0, recaudacion: 0 };
          }
          const cant = Number(it.cantidad || 1);
          const prec = Number(it.precio || 0);
          map[key].unidades += cant;
          map[key].recaudacion += cant * prec;
        });
      }
    });

    let items = Object.values(map);

    // Si aún no hay ítems detallados en las órdenes, usar ventas del catálogo
    if (items.length === 0 && productos.length > 0) {
      items = productos
        .filter((p) => (p.ventas || 0) > 0)
        .map((p) => ({
          nombre: p.nombre,
          unidades: p.ventas || 0,
          recaudacion: (p.ventas || 0) * p.precio,
        }));
    }

    items.sort((a, b) => b.unidades - a.unidades);
    const top = items.slice(0, 5);
    const maxUnidades = Math.max(1, ...(top.map((t) => t.unidades)));

    return top.map((t) => ({
      ...t,
      recaudacionStr: `$${t.recaudacion.toLocaleString("es-CL")}`,
      porcentaje: Math.max(10, Math.round((t.unidades / maxUnidades) * 100)),
    }));
  }, [ordenes, productos]);

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-4">
        <div>
          <h2 className="brand-font fs-3 text-secondary mb-1">
            Resumen Operativo y Financiero
          </h2>
          <p className="text-muted small mb-0">
            Métricas de rendimiento en tiempo real · Conexión directa a MySQL y Spring Boot
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Link
            to="/reportes"
            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 shadow-sm"
          >
            <BarChart3 size={15} />
            <span>Ver Reportes Detallados</span>
          </Link>
          <div className="d-inline-flex align-items-center gap-1 badge bg-light text-secondary border py-2 px-3 small">
            <Clock size={14} className={cargando ? "animate-spin text-primary" : "text-success"} />
            <span>En vivo (5s)</span>
          </div>
        </div>
      </div>

      {/* Tarjetas KPI en Grid Bootstrap */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card admin-card h-100 p-3">
            <div className="d-flex align-items-center justify-content-between text-muted small text-uppercase fw-bold">
              <span>Ingresos Totales</span>
              <span className="badge bg-success-subtle text-success p-2 rounded-3">
                <DollarSign size={18} />
              </span>
            </div>
            <div className="fs-3 fw-bold text-secondary my-2">${ingresosTotales.toLocaleString("es-CL")}</div>
            <div className="d-flex align-items-center gap-1 text-success small fw-bold">
              <ArrowUpRight size={15} />
              <span>{totalOrdenes} órdenes registradas</span>
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
            <div className="fs-3 fw-bold text-secondary my-2">{totalOrdenes} órdenes</div>
            <div className="d-flex align-items-center gap-1 text-primary small fw-bold">
              <ArrowUpRight size={15} />
              <span>{ordenesEntregadas} entregadas con éxito</span>
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
            <div className="fs-3 fw-bold text-secondary my-2">${ticketProm.toLocaleString("es-CL")}</div>
            <div className="d-flex align-items-center gap-1 text-secondary small fw-bold">
              <span>Promedio por venta consolidada</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card admin-card h-100 p-3">
            <div className="d-flex align-items-center justify-content-between text-muted small text-uppercase fw-bold">
              <span>Mermas Registradas</span>
              <span className="badge bg-danger-subtle text-danger p-2 rounded-3">
                <AlertTriangle size={18} />
              </span>
            </div>
            <div className="fs-3 fw-bold text-secondary my-2">{mermasCount} incidentes</div>
            <div className="d-flex align-items-center gap-1 text-danger small fw-bold">
              <span>Trazabilidad Kardex en cocina</span>
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
                  Ventas de los Últimos 7 Días
                </h3>
                <span className="text-muted small">
                  Total acumulado en período: ${totalSemana.toLocaleString("es-CL")}
                </span>
              </div>
              <span className="badge bg-secondary-subtle text-secondary py-2 px-3">
                {picoDia}
              </span>
            </div>

            <div
              className="d-flex align-items-end justify-content-between border-bottom pb-2 pt-4"
              style={{ height: "220px" }}
            >
              {barrasSemana.map((item) => (
                <div
                  key={item.fecha}
                  className="d-flex flex-column align-items-center justify-content-end h-100 flex-fill px-1 text-center"
                >
                  <span
                    className="fw-bold text-secondary text-truncate mb-1"
                    style={{ fontSize: "0.68rem" }}
                  >
                    {item.montoStr}
                  </span>
                  <div
                    style={{
                      height: `${item.porcentaje}%`,
                      width: "100%",
                      maxWidth: "38px",
                      background: item.monto > 0 ? "linear-gradient(180deg, #8B4513, #FFC0CB)" : "#E0E0E0",
                      borderRadius: "6px 6px 0 0",
                      transition: "height 0.4s ease",
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
              <span className={`badge ${productosCriticos.length > 0 ? "bg-danger" : "bg-success"} rounded-pill`}>
                {productosCriticos.length} productos
              </span>
            </div>

            <div className="d-flex flex-column gap-2.5">
              {productosCriticos.length === 0 ? (
                <div className="p-3 rounded-3 border bg-light text-center py-4">
                  <CheckCircle2 size={32} className="text-success mb-2 mx-auto" />
                  <div className="fw-bold text-secondary small">Todo el catálogo con stock seguro</div>
                  <div className="text-muted small">Sin productos bajo el umbral mínimo (≤ 5 uds.)</div>
                </div>
              ) : (
                productosCriticos.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-3 border bg-light d-flex align-items-center justify-content-between"
                  >
                    <div>
                      <div className="fw-bold text-secondary small text-truncate" style={{ maxWidth: "160px" }}>
                        {item.nombre}
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                        Mínimo sugerido: {item.minimo}
                      </div>
                    </div>
                    <span className="badge bg-danger">{item.actual}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Tortas Más Vendidas */}
      <div className="card admin-card p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h3 className="brand-font fs-5 mb-0 text-secondary">
              Top Productos Más Vendidos
            </h3>
            <span className="text-muted small">
              Clasificados por volumen de órdenes y recaudación real en CLP
            </span>
          </div>
          <Package className="text-muted" size={22} />
        </div>

        {topProductos.length === 0 ? (
          <div className="text-center py-4 text-muted small">
            Aún no se registran órdenes para clasificar el ranking de ventas.
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {topProductos.map((prod, idx) => (
              <div key={prod.nombre}>
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 small fw-bold mb-1">
                  <span className="text-secondary text-truncate" style={{ maxWidth: "60%" }} title={prod.nombre}>
                    <span className="text-muted me-2">#{idx + 1}</span>
                    {prod.nombre}
                  </span>
                  <span className="text-secondary">
                    {prod.unidades} un. ·{" "}
                    <span className="text-primary fw-bold">{prod.recaudacionStr}</span>
                  </span>
                </div>
                <div className="progress" style={{ height: "8px" }}>
                  <div
                    className="progress-bar bg-primary"
                    role="progressbar"
                    style={{ width: `${prod.porcentaje}%`, transition: "width 0.4s ease" }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
