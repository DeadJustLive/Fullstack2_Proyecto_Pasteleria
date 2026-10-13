// Filas del resumen de compra: subtotal, descuento, envio y total.
import { formatPrecio } from "@/lib/utils";

interface OrderSummaryProps {
  subtotal: number;
  envio: number;
  total: number;
  descuento?: number;
  cupon?: string | null;
  onQuitarCupon?: () => void;
}

export function OrderSummary({
  subtotal,
  envio,
  total,
  descuento = 0,
  cupon,
  onQuitarCupon,
}: OrderSummaryProps) {
  return (
    <>
      <div className="flex justify-between border-b border-dashed border-tertiary/20 py-2 font-body">
        <span>Subtotal</span>
        <span className="font-semibold">{formatPrecio(subtotal)}</span>
      </div>

      {descuento > 0 && (
        <div className="flex justify-between border-b border-dashed border-tertiary/20 py-2 font-body text-secondary">
          <span>
            Descuento ({cupon}){" "}
            {onQuitarCupon && (
              <button
                type="button"
                onClick={onQuitarCupon}
                className="font-semibold underline"
              >
                quitar
              </button>
            )}
          </span>
          <span className="font-semibold">-{formatPrecio(descuento)}</span>
        </div>
      )}

      <div className="flex justify-between border-b border-dashed border-tertiary/20 py-2 font-body">
        <span>Envío a domicilio</span>
        <span className="font-semibold">{formatPrecio(envio)}</span>
      </div>

      <div className="flex justify-between pt-3 font-display text-lg font-bold text-tertiary">
        <span>Total</span>
        <span>{formatPrecio(total)}</span>
      </div>
    </>
  );
}
