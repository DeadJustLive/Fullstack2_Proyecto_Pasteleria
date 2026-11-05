// Filas del resumen de compra: subtotal, descuento, envio y total.
import { formatPrecio } from "@/lib/utils";

interface OrderSummaryProps {
  subtotal: number;
  envio: number;
  total: number;
  descuento?: number;
  cupon?: string | null;
  onQuitarCupon?: () => void;
  mostrarIva?: boolean;
}

export function OrderSummary({
  subtotal,
  envio,
  total,
  descuento = 0,
  cupon,
  onQuitarCupon,
  mostrarIva = true,
}: OrderSummaryProps) {
  const neto = Math.round(subtotal / 1.19);
  const iva = subtotal - neto;

  return (
    <>
      <div className="flex justify-between border-b border-dashed border-tertiary/20 py-2 font-body">
        <span>Subtotal</span>
        <span className="font-semibold">{formatPrecio(subtotal)}</span>
      </div>

      {mostrarIva && (
        <>
          <div className="flex justify-between border-b border-dashed border-tertiary/10 py-1.5 font-body text-xs text-ink/70">
            <span>↳ Subtotal neto</span>
            <span>{formatPrecio(neto)}</span>
          </div>
          <div className="flex justify-between border-b border-dashed border-tertiary/10 py-1.5 font-body text-xs text-ink/70">
            <span>↳ IVA (19%)</span>
            <span>{formatPrecio(iva)}</span>
          </div>
        </>
      )}

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
        <span>Envío</span>
        <span className="font-semibold">{envio === 0 ? "Gratis" : formatPrecio(envio)}</span>
      </div>

      <div className="flex justify-between pt-3 font-display text-lg font-bold text-tertiary">
        <span>Total</span>
        <span>{formatPrecio(total)}</span>
      </div>
    </>
  );
}
