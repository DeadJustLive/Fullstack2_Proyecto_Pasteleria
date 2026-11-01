// @pca:start
// @id(feature.checkoutsummary.securityBadge)
// @kind(component)
// @limit(lines: 200)
// @contract(CheckoutSecurityBadge)
// @relates(feature.checkoutsummary.dependencies)
// @desc(Subcomponente privado de insignia de seguridad transaccional para CheckoutSummary)
// @pca:end

import { Lock } from "../dependencies/dependencies";

interface CheckoutSecurityBadgeProps {
  paymentMethod: "flow" | "transferencia" | "mercadolibre";
}

export function CheckoutSecurityBadge({ paymentMethod }: CheckoutSecurityBadgeProps) {
  const gatewayLabel =
    paymentMethod === "flow"
      ? "Flow.cl HMAC-SHA256"
      : paymentMethod === "transferencia"
        ? "Banca Electrónica"
        : "Mercado Pago TLS";

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-bold text-green-800">
      <Lock size={11} />
      {gatewayLabel}
    </span>
  );
}
