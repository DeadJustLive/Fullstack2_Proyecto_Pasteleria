import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { OrderSummary } from "@/components/domain/OrderSummary";
import { LABEL_METODO } from "@/data/pedidos";
import { obtenerPedidos, obtenerUltimoPedidoGuardado } from "@/lib/pedidos";
import { formatPrecio } from "@/lib/utils";
import type { MetodoPago, Pedido } from "@/types/pedido";

const MENSAJE_PAGO: Record<MetodoPago, (email: string) => string> = {
  tarjeta: () => "Tu pago con tarjeta fue procesado correctamente.",
  transferencia: (email) => `Te enviaremos los datos bancarios a ${email}.`,
  efectivo: () => "Pagarás al recibir tu pedido en la puerta.",
};

function buscarPedido(id?: string): Pedido | undefined {
  if (id) return obtenerPedidos().find((p) => p.id === id);
  return obtenerUltimoPedidoGuardado();
}

export function Confirmacion() {
  const navigate = useNavigate();
  const { state } = useLocation();
  // Llega desde Checkout con el id; si se recarga la pagina, se usa la ultima compra.
  const [pedido] = useState(() =>
    buscarPedido((state as { pedidoId?: string } | null)?.pedidoId)
  );

  if (!pedido) {
    return (
      <EmptyState
        titulo="No hay una compra reciente"
        descripcion="Cuando completes un pedido, verás aquí su confirmación."
        accion={<Button onClick={() => navigate("/catalogo")}>Ir al catálogo</Button>}
        className="py-20"
      />
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <Card padding="lg" className="text-center">
        <span className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/40 text-secondary">
          <CheckCircle2 size={44} aria-hidden="true" />
        </span>
        <h1>¡Gracias por tu compra!</h1>
        <p className="mx-auto mt-3 font-body text-ink/80">
          Tu pedido <strong className="text-tertiary">#{pedido.id}</strong> ha sido
          confirmado y llegará pronto.
        </p>
        <p className="mx-auto mt-1 font-body text-sm text-secondary">
          {MENSAJE_PAGO[pedido.metodoPago](pedido.entrega.email)}
        </p>

        <div className="mt-8 text-left">
          <h2 className="mb-3 text-left">Resumen de tu pedido</h2>
          <ul className="mb-2 space-y-2">
            {pedido.items.map(({ producto, cantidad }) => (
              <li
                key={producto.id}
                className="flex justify-between gap-3 font-body text-sm"
              >
                <span className="min-w-0 truncate text-ink/80">
                  {producto.nombre} x{cantidad}
                </span>
                <span className="shrink-0 font-semibold text-tertiary">
                  {formatPrecio(producto.precio * cantidad)}
                </span>
              </li>
            ))}
          </ul>

          <OrderSummary
            subtotal={pedido.subtotal}
            descuento={pedido.descuento}
            cupon={pedido.cupon}
            envio={pedido.envio}
            total={pedido.total}
          />

          <dl className="mt-5 space-y-1 rounded bg-neutral p-4 font-body text-sm">
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-semibold text-tertiary">Entrega en:</dt>
              <dd className="text-ink/80">
                {pedido.entrega.direccion}, {pedido.entrega.comuna}
              </dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-semibold text-tertiary">Método de pago:</dt>
              <dd className="text-ink/80">{LABEL_METODO[pedido.metodoPago]}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Button onClick={() => navigate(`/envio/${pedido.id}`)} className="w-full">
            Seguir mi pedido
          </Button>
          <Link
            to="/catalogo"
            className="font-body text-sm font-semibold text-secondary hover:underline"
          >
            Seguir comprando
          </Link>
        </div>
      </Card>
    </div>
  );
}
