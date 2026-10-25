import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PillFiltro } from "@/components/ui/PillFiltro";
import { Toast, type ToastTono } from "@/components/ui/Toast";
import { OrderSummary } from "@/components/domain/OrderSummary";
import { PillEstadoPedido } from "@/components/domain/PillEstadoPedido";
import {
  ACCION_ESTADO,
  LABEL_ESTADO,
  LABEL_METODO,
  SIGUIENTE_ESTADO,
} from "@/data/pedidos";
import { actualizarEstadoPedido, obtenerPedidos } from "@/lib/pedidos";
import { formatFecha, formatHora, formatPrecio } from "@/lib/utils";
import type { EstadoPedido, Pedido } from "@/types/pedido";

type FiltroPedido = EstadoPedido | "todos";

const FILTROS: { value: FiltroPedido; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "recibido", label: "Pendientes" },
  { value: "preparacion", label: "En preparación" },
  { value: "listo", label: "Listos" },
  { value: "camino", label: "En camino" },
  { value: "entregado", label: "Entregados" },
];

interface Aviso {
  mensaje: string;
  tono: ToastTono;
}

interface TarjetaPedidoProps {
  pedido: Pedido;
  onVerDetalle: () => void;
  onAvanzar: () => void;
}

function TarjetaPedido({ pedido, onVerDetalle, onAvanzar }: TarjetaPedidoProps) {
  const accion = ACCION_ESTADO[pedido.estado];
  const totalUnidades = pedido.items.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <Card className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-display text-lg font-bold text-tertiary">
            Pedido #{pedido.id}
          </p>
          <p className="font-body text-xs text-ink/60">
            {formatFecha(pedido.fecha)} · {formatHora(pedido.fecha)}
          </p>
        </div>
        <PillEstadoPedido estado={pedido.estado} />
      </div>

      <div>
        <p className="font-body text-sm font-semibold text-tertiary">
          {pedido.entrega.nombre}
        </p>
        <p className="truncate font-body text-xs text-ink/60">
          {pedido.entrega.email}
        </p>
      </div>

      <ul className="space-y-2">
        {pedido.items.slice(0, 2).map(({ producto, cantidad }) => (
          <li key={producto.id} className="flex items-center gap-2">
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="h-10 w-10 shrink-0 rounded object-cover"
            />
            <span className="min-w-0 flex-1 truncate font-body text-sm text-ink">
              {producto.nombre}
            </span>
            <span className="font-body text-sm font-semibold text-secondary">
              x{cantidad}
            </span>
          </li>
        ))}
      </ul>
      {pedido.items.length > 2 && (
        <p className="font-body text-xs text-ink/50">
          +{pedido.items.length - 2} producto
          {pedido.items.length - 2 === 1 ? "" : "s"} más
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-tertiary/10 pt-3">
        <div>
          <p className="font-body text-xs text-ink/60">
            {totalUnidades} {totalUnidades === 1 ? "producto" : "productos"}
          </p>
          <p className="font-display text-lg font-bold text-secondary">
            {formatPrecio(pedido.total)}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            onClick={onVerDetalle}
            aria-label={`Ver detalles del pedido #${pedido.id}`}
          >
            Ver detalles
          </Button>
          {accion && (
            <Button
              size="sm"
              onClick={onAvanzar}
              aria-label={`${accion} del pedido #${pedido.id}`}
            >
              {accion}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

interface DetallePedidoProps {
  pedido: Pedido;
  onAvanzar: () => void;
}

function DetallePedido({ pedido, onAvanzar }: DetallePedidoProps) {
  const accion = ACCION_ESTADO[pedido.estado];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-body text-sm text-ink/60">Pedido</p>
          <p className="font-display text-2xl font-bold text-tertiary">
            #{pedido.id}
          </p>
        </div>
        <PillEstadoPedido estado={pedido.estado} />
      </div>

      <div className="grid gap-4 rounded bg-neutral p-4 sm:grid-cols-2">
        <div>
          <p className="font-body text-xs font-bold uppercase tracking-wide text-secondary">
            Cliente
          </p>
          <p className="font-body font-semibold text-tertiary">
            {pedido.entrega.nombre}
          </p>
          <p className="break-words font-body text-sm text-ink/70">
            {pedido.entrega.email}
          </p>
        </div>
        <div>
          <p className="font-body text-xs font-bold uppercase tracking-wide text-secondary">
            Entrega
          </p>
          <p className="font-body text-sm text-ink/80">
            {pedido.entrega.direccion}, {pedido.entrega.comuna}
          </p>
          <p className="font-body text-sm text-ink/70">{pedido.entrega.telefono}</p>
        </div>
        <div>
          <p className="font-body text-xs font-bold uppercase tracking-wide text-secondary">
            Fecha
          </p>
          <p className="font-body text-sm text-ink/80">
            {formatFecha(pedido.fecha)} · {formatHora(pedido.fecha)}
          </p>
        </div>
        <div>
          <p className="font-body text-xs font-bold uppercase tracking-wide text-secondary">
            Pago
          </p>
          <p className="font-body text-sm text-ink/80">
            {LABEL_METODO[pedido.metodoPago]}
          </p>
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-display text-lg font-semibold text-tertiary">
          Productos
        </h3>
        <ul className="space-y-3">
          {pedido.items.map(({ producto, cantidad }) => (
            <li
              key={producto.id}
              className="flex items-center gap-3 border-b border-dashed border-tertiary/20 pb-3 last:border-b-0 last:pb-0"
            >
              <img
                src={producto.imagen}
                alt={producto.nombre}
                className="h-12 w-12 shrink-0 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-body font-semibold text-tertiary">
                  {producto.nombre}
                </p>
                <p className="font-body text-sm text-ink/60">
                  {cantidad} × {formatPrecio(producto.precio)}
                </p>
              </div>
              <p className="font-body font-semibold text-secondary">
                {formatPrecio(producto.precio * cantidad)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <OrderSummary
        subtotal={pedido.subtotal}
        descuento={pedido.descuento}
        cupon={pedido.cupon}
        envio={pedido.envio}
        total={pedido.total}
      />

      {accion && (
        <Button onClick={onAvanzar} className="w-full">
          {accion}
        </Button>
      )}
    </div>
  );
}

export function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>(() => obtenerPedidos());
  const [filtro, setFiltro] = useState<FiltroPedido>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);

  const seleccionado =
    pedidos.find((pedido) => pedido.id === seleccionadoId) ?? null;
  const activos = pedidos.filter((pedido) => pedido.estado !== "entregado").length;

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return pedidos.filter((pedido) => {
      const coincideEstado = filtro === "todos" || pedido.estado === filtro;
      const coincideTexto =
        !texto ||
        pedido.id.toLowerCase().includes(texto) ||
        pedido.entrega.nombre.toLowerCase().includes(texto) ||
        pedido.entrega.email.toLowerCase().includes(texto);

      return coincideEstado && coincideTexto;
    });
  }, [pedidos, filtro, busqueda]);

  const contar = (estado: FiltroPedido) =>
    estado === "todos"
      ? pedidos.length
      : pedidos.filter((pedido) => pedido.estado === estado).length;

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltro("todos");
  };

  const avanzar = (pedido: Pedido) => {
    const siguiente = SIGUIENTE_ESTADO[pedido.estado];
    if (!siguiente) return;

    actualizarEstadoPedido(pedido.id, siguiente);
    setPedidos((prev) =>
      prev.map((p) => (p.id === pedido.id ? { ...p, estado: siguiente } : p))
    );
    setAviso({
      mensaje: `Pedido #${pedido.id}: ${LABEL_ESTADO[siguiente]}.`,
      tono: "success",
    });
  };

  return (
    <div className="pb-10">
      <div className="mb-6 mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-tertiary">
            Gestión de Pedidos
          </h1>
          <p className="font-body text-ink/70">
            Administra los estados de las compras realizadas por los clientes.
          </p>
        </div>
        <p className="rounded-full bg-white px-4 py-2 font-body text-sm font-semibold text-secondary shadow-sm">
          {activos} activos · {pedidos.length} en total
        </p>
      </div>

      <div className="mb-5 flex flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTROS.map(({ value, label }) => (
            <PillFiltro
              key={value}
              active={filtro === value}
              onClick={() => setFiltro(value)}
            >
              {label} ({contar(value)})
            </PillFiltro>
          ))}
        </div>

        <div className="sm:max-w-sm">
          <Input
            name="busqueda"
            type="search"
            aria-label="Buscar pedidos"
            placeholder="Buscar por pedido, cliente o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {visibles.length === 0 ? (
        <EmptyState
          titulo="No encontramos pedidos"
          descripcion="Prueba con otro filtro o con otra búsqueda."
          accion={
            <Button variant="outline" onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>
          }
          className="py-16"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibles.map((pedido) => (
            <TarjetaPedido
              key={pedido.id}
              pedido={pedido}
              onVerDetalle={() => setSeleccionadoId(pedido.id)}
              onAvanzar={() => avanzar(pedido)}
            />
          ))}
        </div>
      )}

      <Modal
        abierto={seleccionado !== null}
        titulo={seleccionado ? `Pedido #${seleccionado.id}` : "Pedido"}
        onCerrar={() => setSeleccionadoId(null)}
        size="lg"
      >
        {seleccionado && (
          <DetallePedido
            pedido={seleccionado}
            onAvanzar={() => avanzar(seleccionado)}
          />
        )}
      </Modal>

      <Toast
        mensaje={aviso?.mensaje ?? null}
        tono={aviso?.tono}
        onCerrar={() => setAviso(null)}
      />
    </div>
  );
}
