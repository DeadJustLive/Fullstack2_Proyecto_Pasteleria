import {
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  type FlowVerificationState,
} from "../dependencies/dependencies";

interface FlowStatusBadgeProps {
  state: FlowVerificationState;
  flowOrder?: string | null;
}

export function FlowStatusBadge({ state, flowOrder }: FlowStatusBadgeProps) {
  if (state === "verifying") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
        <RefreshCw size={13} className="animate-spin" />
        Verificando firma Flow.cl...
      </span>
    );
  }

  if (state === "verified") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
        <CheckCircle2 size={14} />
        PAGADO EN FLOW.CL {flowOrder ? `(#${flowOrder})` : ""}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
      <ShieldCheck size={14} />
      PAGADO (Webpay Plus {flowOrder ? `• #${flowOrder}` : ""})
    </span>
  );
}
