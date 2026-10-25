import { useSearchParams } from "react-router-dom";
import { CheckCircle, FileText, Home, ShoppingBag } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { formatPrecio } from "@/lib/utils";

export function Confirmacion() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || searchParams.get("pedido") || "N/A";
  const total = searchParams.get("total");

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 py-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-tertiary">¡Pedido confirmado!</h1>
          <p className="font-body text-lg text-ink/80">
            Gracias por tu compra. Hemos recibido tu pedido correctamente.
          </p>
        </div>
      </div>

      <Card className="flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-col gap-2 border-b border-tertiary/10 pb-6">
          <h2 className="font-display text-xl font-semibold text-tertiary">Resumen del pedido</h2>
          <div className="flex flex-col gap-1 font-body text-sm text-ink/80">
            <p>
              <span className="font-semibold">Número de pedido:</span> {orderId}
            </p>
            {total && (
              <p>
                <span className="font-semibold">Total:</span> {formatPrecio(Number(total))}
              </p>
            )}
            <p>
              <span className="font-semibold">Estado:</span> Pendiente de confirmación
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-body text-sm text-ink/80">
            Te enviaremos un correo con los detalles del pedido y el seguimiento cuando esté listo.
            También puedes revisar el estado desde tu perfil.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink to="/perfil" className="flex-1">
              <FileText size={18} />
              Ver mi pedido
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

      <div className="text-center">
        <p className="font-body text-sm text-ink/70">
          ¿Tienes alguna duda? Contáctanos y te ayudaremos con gusto.
        </p>
      </div>
    </div>
  );
}
