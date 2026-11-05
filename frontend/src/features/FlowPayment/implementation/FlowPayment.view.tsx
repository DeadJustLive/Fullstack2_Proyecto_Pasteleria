import { useEffect, useState } from "react";
import {
  api,
  formatPrecio,
  ShieldCheck,
  type FlowPaymentContract,
  type FlowVerificationState,
} from "../dependencies/dependencies";
import { FlowStatusBadge } from "../components/FlowStatusBadge";

export function FlowPaymentView(props: FlowPaymentContract) {
  const {
    orderId,
    amount,
    token,
    initialFlowOrder,
    mode = "receipt",
    onVerified,
  } = props;

  const [verificationState, setVerificationState] = useState<FlowVerificationState>(
    token ? "verifying" : "simulated"
  );
  const [flowOrder, setFlowOrder] = useState<string | null>(initialFlowOrder || null);

  useEffect(() => {
    if (!token) {
      setVerificationState("simulated");
      return;
    }

    let cancelled = false;
    setVerificationState("verifying");

    api.payments
      .getStatus(token)
      .then((res) => {
        if (cancelled) return;
        const resolvedTrx = String(
          res.gatewayTransactionId || res.flowOrder || initialFlowOrder || ""
        );
        const isSim = token.startsWith("flow_") || resolvedTrx.startsWith("FLOW-SIM-");
        const nextState: FlowVerificationState = isSim ? "simulated" : "verified";

        if (resolvedTrx) {
          setFlowOrder(resolvedTrx);
        }
        setVerificationState(nextState);
        if (onVerified && resolvedTrx) {
          onVerified(resolvedTrx, nextState);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setVerificationState("offline");
      });

    return () => {
      cancelled = true;
    };
  }, [token, initialFlowOrder, onVerified]);

  if (mode === "checkout") {
    return (
      <div className="flex items-center justify-between gap-2 rounded-xl border border-secondary/20 bg-neutral/40 px-3.5 py-2.5 text-xs text-ink/80">
        <span className="flex items-center gap-2 font-medium text-tertiary">
          <ShieldCheck size={16} className="shrink-0 text-secondary" />
          Pasarela Híbrida Flow.cl (HMAC-SHA256) lista para orden #{orderId}
        </span>
        <span className="font-bold text-secondary">{formatPrecio(amount)}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <FlowStatusBadge state={verificationState} flowOrder={flowOrder} />
      <span className="font-mono text-[11px] text-ink/60">
        Monto validado: {formatPrecio(amount)}
      </span>
    </div>
  );
}
