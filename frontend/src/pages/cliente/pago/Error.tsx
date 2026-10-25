import { useSearchParams } from "react-router-dom";
import { AlertCircle, Home, RefreshCcw, ShoppingCart } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";

export function PagoError() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || searchParams.get("external_reference");
  const error = searchParams.get("error") || "El pago fue rechazado o cancelado";

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 py-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertCircle size={40} className="text-red-600" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-tertiary">Pago rechazado</h1>
          <p className="font-body text-lg text-ink/80">{error}</p>
        </div>
      </div>

      <Card className="flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-xl font-semibold text-tertiary">¿Qué puedo hacer?</h2>
          <ul className="flex flex-col gap-2 font-body text-sm text-ink/80">
            <li>• Verifica los datos de tu tarjeta o método de pago</li>
            <li>• Asegúrate de tener fondos suficientes</li>
            <li>• Intenta con otro método de pago</li>
            <li>• Si el problema persiste, contacta a tu banco</li>
          </ul>
          {orderId && (
            <p className="mt-2 font-body text-sm text-ink/70">
              Número de pedido: <span className="font-semibold">{orderId}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink to="/checkout" className="flex-1">
              <RefreshCcw size={18} />
              Intentar nuevamente
            </ButtonLink>
          <ButtonLink to="/carrito" variant="outline" className="flex-1">
              <ShoppingCart size={18} />
              Volver al carrito
            </ButtonLink>
          <ButtonLink to="/" variant="ghost" className="flex-1">
              <Home size={18} />
              Ir al inicio
            </ButtonLink>
        </div>
      </Card>
    </div>
  );
}
