import {
  ShieldCheck,
  formatPrecio,
  type CheckoutSummaryContract,
  type ICheckoutSummaryProps,
} from "../dependencies/dependencies";
import { CheckoutSecurityBadge } from "../components/CheckoutSecurityBadge";

export function CheckoutSummaryView(props: CheckoutSummaryContract) {
  const {
    totalAmount,
    itemCount,
    deliveryMethod,
    paymentMethod,
  }: ICheckoutSummaryProps = props;

  return (
    <div className="mt-4 flex flex-col gap-2 rounded-xl border border-secondary/20 bg-neutral/40 p-3 text-xs text-ink/80">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-semibold text-tertiary">
          <ShieldCheck size={15} className="shrink-0 text-secondary" />
          Respaldo de Orden ({itemCount} {itemCount === 1 ? "ítem" : "ítems"})
        </span>
        <CheckoutSecurityBadge paymentMethod={paymentMethod} />
      </div>
      <div className="flex items-center justify-between border-t border-tertiary/10 pt-1.5 text-[11px] text-ink/70">
        <span>Modalidad: {deliveryMethod === "retiro" ? "Retiro en Tienda" : "Despacho Refrigerado"}</span>
        <span className="font-bold text-secondary">{formatPrecio(totalAmount)}</span>
      </div>
    </div>
  );
}
