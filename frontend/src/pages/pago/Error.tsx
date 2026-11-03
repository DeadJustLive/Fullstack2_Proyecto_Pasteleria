// @pca:start
// @id(frontend.pages.cliente.pago.error)
// @kind(page)
// @limit(lines: 160)
// @contract(PagoErrorView())
// @relates(docs.reglas_ui)
// @desc(Pantalla de fallo de pago manteniendo resumen del carrito y boton reintentar)
// @pca:end
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  RotateCcw,
  ShoppingCart,
  Home,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { useCart } from "@/context/cart";
import { formatPrecio } from "@/lib/utils";

export function PagoError() {
  const [searchParams] = useSearchParams();
  const { items, total } = useCart();

  const reason = searchParams.get("reason") || searchParams.get("error");
  const orderId = searchParams.get("orderId") || searchParams.get("external_reference");

  let tituloError = "Pago no autorizado";
  let codigoError = "ERR_PAYMENT_FAILED_101";
  let detalleError = "La pasarela de pago Flow no pudo completar la transacción.";

  if (reason === "insufficient_funds") {
    tituloError = "Fondos insuficientes en la cuenta";
    codigoError = "ERR_INSUFFICIENT_FUNDS_104";
    detalleError =
      "Tu banco emisor rechazó la operación porque la tarjeta no cuenta con saldo o cupo suficiente para cubrir el total de la compra.";
  } else if (reason === "bank_rejected") {
    tituloError = "Transacción denegada por la entidad emisora";
    codigoError = "ERR_BANK_REJECTED_105";
    detalleError =
      "El banco rechazó la transacción por motivos de seguridad o autenticación 3DS (clave dinámica no validada).";
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 py-6">
      {/* Alerta de Error */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 shadow-sm">
          <AlertTriangle size={38} />
        </div>
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold text-tertiary sm:text-3xl">
            {tituloError}
          </h1>
          <p className="font-body text-sm text-ink/80">
            No pudimos procesar tu pago mediante la pasarela Flow Sandbox.
          </p>
        </div>
      </div>

      <Card className="flex flex-col gap-6 p-6 sm:p-8">
        {/* Detalle Técnico del Rechazo */}
        <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 text-xs">
          <div className="mb-1 flex items-center justify-between gap-2 font-mono">
            <span className="font-bold text-red-900">Código de rechazo:</span>
            <span className="rounded bg-red-100 px-2 py-0.5 font-bold text-red-700">
              {codigoError}
            </span>
          </div>
          <p className="text-red-800 leading-relaxed">{detalleError}</p>
          {orderId && (
            <p className="mt-2 text-ink/70">
              Referencia de pedido: <span className="font-mono font-bold">{orderId}</span>
            </p>
          )}
        </div>

        {/* Resumen de Productos Conservados en Carrito (DSY1104) */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
          <div className="mb-2 flex items-center gap-2 text-amber-900">
            <ShoppingCart size={18} className="text-amber-700 shrink-0" />
            <h3 className="font-display text-sm font-bold">
              Tus productos siguen a salvo en tu carrito ({items.length})
            </h3>
          </div>
          <p className="mb-3 text-xs text-amber-800">
            No se realizó ningún cobro a tu medio de pago. Puedes reintentar con otra tarjeta o elegir transferencia electrónica.
          </p>

          {items.length > 0 ? (
            <div className="space-y-2 border-t border-amber-200/60 pt-2 text-xs">
              {items.map((it) => (
                <div key={it.producto.id} className="flex justify-between text-ink/80">
                  <span className="truncate pr-2">
                    {it.producto.nombre} x{it.cantidad}
                  </span>
                  <span className="shrink-0 font-semibold text-tertiary">
                    {formatPrecio(it.producto.precio * it.cantidad)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between border-t border-amber-200/60 pt-2 font-bold text-tertiary">
                <span>Total carrito:</span>
                <span className="text-secondary">{formatPrecio(total)}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-ink/60">No hay productos guardados.</p>
          )}
        </div>

        {/* Pasos a seguir */}
        <div className="space-y-2 text-xs text-ink/80">
          <h4 className="font-bold uppercase tracking-wider text-tertiary">
            ¿Cómo continuar con tu compra?
          </h4>
          <ul className="space-y-1 list-disc pl-4 text-ink/70">
            <li>Verifica que tu tarjeta tenga fondos disponibles y habilitación para compras online.</li>
            <li>Prueba con otro método de pago (Webpay Crédito, Débito o Transferencia Bancaria).</li>
            <li>Si el rechazo persiste, contacta directamente al banco emisor de tu tarjeta.</li>
          </ul>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <ButtonLink to="/checkout" variant="secondary" className="flex-1 gap-2">
            <RotateCcw size={16} />
            Volver a intentar el pago
          </ButtonLink>

          <ButtonLink to="/carrito" variant="outline" className="flex-1 gap-2">
            <ShoppingCart size={16} />
            Volver al carrito
          </ButtonLink>

          <ButtonLink to="/" variant="ghost" className="flex-1 gap-2">
            <Home size={16} />
            Ir al inicio
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}
