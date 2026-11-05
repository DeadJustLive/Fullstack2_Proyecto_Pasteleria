import { useSearchParams } from "react-router-dom";
import { Clock, FileText, Home, ShoppingBag } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { formatPrecio } from "@/lib/utils";

export function PagoPendiente() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || searchParams.get("external_reference") || "N/A";
  const total = searchParams.get("total");

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 py-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <Clock size={40} className="text-amber-600" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-tertiary">Pago en proceso</h1>
          <p className="font-body text-lg text-ink/80">
            Tu pago está siendo procesado. Esto puede tomar algunos minutos.
          </p>
        </div>
      </div>

      <Card className="flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-col gap-2 border-b border-tertiary/10 pb-6">
          <h2 className="font-display text-xl font-semibold text-tertiary">Estado del pedido</h2>
          <div className="flex flex-col gap-2 font-body text-sm text-ink/80">
            <div className="flex items-center justify-between">
              <span>Número de pedido</span>
              <span className="font-semibold">{orderId}</span>
            </div>
            {total && (
              <div className="flex items-center justify-between">
                <span>Total</span>
                <span className="font-semibold">{formatPrecio(Number(total))}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span>Estado del pago</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                Pendiente
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-body text-sm text-ink/80">
            Te notificaremos por correo electrónico cuando el pago sea confirmado.
            Mientras tanto, tu pedido quedará en estado pendiente.
          </p>
          <p className="font-body text-sm text-ink/70">
            Si pagaste con transferencia bancaria, puede tomar hasta 24 horas en acreditarse.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink to="/perfil" className="flex-1">
              <FileText size={18} />
              Revisar mi pedido
            </ButtonLink>
          <ButtonLink to="/catalogo" variant="outline" className="flex-1">
              <ShoppingBag size={18} />
              Seguir comprando
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
