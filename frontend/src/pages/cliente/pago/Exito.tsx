// @pca:start
// @id(frontend.pages.cliente.pago.exito)
// @kind(page)
// @limit(lines: 160)
// @contract(PagoExitoView())
// @relates(docs.reglas_ui)
// @desc(Pantalla de confirmacion de pago exitoso con codigo y boleta DSY1104)
// @pca:end
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, FileText, Home, ShoppingBag } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { formatPrecio } from "@/lib/utils";

export function PagoExito() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || searchParams.get("external_reference") || "N/A";
  const paymentId = searchParams.get("payment_id") || searchParams.get("token");
  const total = searchParams.get("total");

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 py-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-tertiary">¡Pago exitoso!</h1>
          <p className="font-body text-lg text-ink/80">
            Tu pago ha sido procesado correctamente.
          </p>
        </div>
      </div>

      <Card className="flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-col gap-2 border-b border-tertiary/10 pb-6">
          <h2 className="font-display text-xl font-semibold text-tertiary">Detalles de la transacción</h2>
          <div className="flex flex-col gap-2 font-body text-sm text-ink/80">
            <div className="flex items-center justify-between">
              <span>Número de pedido</span>
              <span className="font-semibold">{orderId}</span>
            </div>
            {paymentId && (
              <div className="flex items-center justify-between">
                <span>ID de transacción</span>
                <span className="font-mono text-xs">{paymentId}</span>
              </div>
            )}
            {total && (
              <div className="flex items-center justify-between border-t border-tertiary/10 pt-2 text-base">
                <span className="font-semibold">Total pagado</span>
                <span className="font-semibold text-secondary">{formatPrecio(Number(total))}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span>Estado</span>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                Pagado
              </span>
            </div>
          </div>
        </div>

        <p className="font-body text-sm text-ink/80">
          Recibirás un correo electrónico con la confirmación de tu pedido. 
          Te avisaremos cuando esté listo para retiro o envío.
        </p>

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
    </div>
  );
}
