import { useMemo, useState, type ChangeEvent } from "react";
import {
  Banknote,
  Package,
  PencilLine,
  Receipt,
  ShoppingBag,
  Truck,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { GraficoVentas } from "@/components/admin/GraficoVentas";
import { StatCard } from "@/components/admin/StatCard";
import { PillEstadoPedido } from "@/components/domain/PillEstadoPedido";
import { obtenerPedidos } from "@/lib/pedidos";
import { formatPrecio } from "@/lib/utils";

type Periodo = "esta-semana" | "semana-pasada" | "mes";

// Serie de ventas por periodo (CLP). Mock: aun no hay backend con historico diario.
const VENTAS: Record<Periodo, { etiquetas: string[]; valores: number[] }> = {
  "esta-semana": {
    etiquetas: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    valores: [180000, 240000, 210000, 390000, 330000, 520000, 460000],
  },
  "semana-pasada": {
    etiquetas: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    valores: [160000, 220000, 250000, 300000, 310000, 480000, 410000],
  },
  mes: {
    etiquetas: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
    valores: [1450000, 1720000, 1580000, 1990000],
  },
};

const PERIODOS: { value: Periodo; label: string }[] = [
  { value: "esta-semana", label: "Esta semana" },
  { value: "semana-pasada", label: "Semana pasada" },
  { value: "mes", label: "Este mes" },
];

interface Notificacion {
  titulo: string;
  detalle: string;
  hace: string;
  icono: LucideIcon;
  tono: string;
}

// Mock: las alertas reales llegaran con inventario y pedidos personalizados.
const NOTIFICACIONES: Notificacion[] = [
  {
    titulo: "Poco stock: Harina de almendras",
    detalle: "Quedan solo 2 kg en el inventario. Por favor reordena.",
    hace: "Hace 10 min",
    icono: TriangleAlert,
    tono: "bg-[#f8d7da] text-[#d9534f]",
  },
  {
    titulo: "Llegó un envío",
    detalle: "El envío del proveedor Cacao Central fue recibido y registrado.",
    hace: "Hace 1 hora",
    icono: Package,
    tono: "bg-[#eaddd3] text-tertiary",
  },
  {
    titulo: "Pedido personalizado actualizado",
    detalle: "El cliente modificó detalles del pedido #1046.",
    hace: "Hace 3 horas",
    icono: PencilLine,
    tono: "bg-[#fcb183] text-tertiary",
  },
];

const SELECT_CLASES =
  "h-9 rounded border border-tertiary/30 bg-white px-3 font-body text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/30";

export function Dashboard() {
  const [periodo, setPeriodo] = useState<Periodo>("esta-semana");
  const [pedidos] = useState(obtenerPedidos);

  // Metricas calculadas con los pedidos reales (checkout) + demo.
  const metricas = useMemo(() => {
    const ventas = pedidos.reduce((acc, p) => acc + p.total, 0);
    const entregados = pedidos.filter((p) => p.estado === "entregado").length;
    const listos = pedidos.filter((p) => p.estado === "listo").length;

    const unidades = new Map<number, { nombre: string; unidades: number }>();
    for (const pedido of pedidos) {
      for (const { producto, cantidad } of pedido.items) {
        const previo = unidades.get(producto.id);
        unidades.set(producto.id, {
          nombre: producto.nombre,
          unidades: (previo?.unidades ?? 0) + cantidad,
        });
      }
    }

    return {
      ventas,
      total: pedidos.length,
      activos: pedidos.length - entregados,
      listos,
      entregados,
      ticketPromedio: Math.round(ventas / Math.max(pedidos.length, 1)),
      masVendidos: [...unidades.values()].sort((a, b) => b.unidades - a.unidades).slice(0, 3),
      porDespachar: pedidos
        .filter((p) => p.estado === "preparacion" || p.estado === "listo")
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
        .slice(0, 4),
    };
  }, [pedidos]);

  const serie = VENTAS[periodo];

  return (
    <div className="space-y-6 pb-10">
      <div className="mb-4 mt-2">
        <h1 className="font-display text-3xl font-bold text-tertiary">Panel de Reportes</h1>
        <p className="font-body text-ink/70">Esto es lo que sucede en Crème &amp; Co.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          titulo="Ventas totales"
          valor={formatPrecio(metricas.ventas)}
          nota={`${metricas.total} pedidos registrados`}
          icono={Banknote}
          tono="rosa"
        />
        <StatCard
          titulo="Pedidos activos"
          valor={String(metricas.activos)}
          nota={`${metricas.listos} ${metricas.listos === 1 ? "listo" : "listos"} para despacho`}
          icono={ShoppingBag}
          tono="naranja"
        />
        <StatCard
          titulo="Pedidos entregados"
          valor={String(metricas.entregados)}
          nota={`${Math.round((metricas.entregados / Math.max(metricas.total, 1)) * 100)}% del total`}
          icono={Truck}
          tono="cafe"
        />
        <StatCard
          titulo="Ticket promedio"
          valor={formatPrecio(metricas.ticketPromedio)}
          nota="Por pedido"
          icono={Receipt}
          tono="rosa"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-left">Tendencia de ventas</h2>
            <select
              aria-label="Periodo del gráfico"
              value={periodo}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setPeriodo(e.target.value as Periodo)
              }
              className={SELECT_CLASES}
            >
              {PERIODOS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <GraficoVentas key={periodo} etiquetas={serie.etiquetas} valores={serie.valores} />
        </Card>

        <Card className="flex flex-col">
          <h2 className="mb-4 text-left">Notificaciones</h2>
          <ul className="flex flex-col gap-4">
            {NOTIFICACIONES.map(({ titulo, detalle, hace, icono: Icono, tono }) => (
              <li key={titulo} className="flex gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tono}`}
                >
                  <Icono size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-sm font-semibold text-tertiary">{titulo}</p>
                  <p className="font-body text-sm text-ink/70">{detalle}</p>
                  <p className="font-body text-xs text-ink/50">{hace}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-left">Top 3 más vendidos</h2>
          {metricas.masVendidos.length === 0 ? (
            <EmptyState titulo="Aún no hay ventas." className="py-6" />
          ) : (
            <ol className="flex flex-col">
              {metricas.masVendidos.map((p, i) => (
                <li
                  key={p.nombre}
                  className="flex items-center gap-3 border-b border-dashed border-tertiary/20 py-3 first:pt-0 last:border-b-0 last:pb-0"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-body text-sm font-bold text-tertiary">
                    {i + 1}
                  </span>
                  <p className="min-w-0 flex-1 truncate font-display font-semibold text-tertiary">
                    {p.nombre}
                  </p>
                  <span className="font-body text-sm text-secondary">
                    {p.unidades} {p.unidades === 1 ? "venta" : "ventas"}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-left">Próximos a despachar</h2>
          {metricas.porDespachar.length === 0 ? (
            <EmptyState titulo="No hay pedidos pendientes." className="py-6" />
          ) : (
            <ul className="flex flex-col gap-3">
              {metricas.porDespachar.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded border-l-4 border-primary bg-neutral p-3"
                >
                  <span className="min-w-0 truncate font-body text-sm font-semibold text-tertiary">
                    #{p.id} - {p.entrega.nombre}
                  </span>
                  <PillEstadoPedido estado={p.estado} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
