import {
  ShieldAlert,
  type CustomerTrackingContract,
  type ICustomerTrackingProps,
} from "../dependencies/dependencies";
import { TrackingSlaBanner } from "../components/TrackingSlaBanner";

export function CustomerTrackingView(props: CustomerTrackingContract) {
  const {
    trackingCode,
    orderStatus,
    deliveryType,
  }: ICustomerTrackingProps = props;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-secondary/20 bg-neutral/40 px-4 py-3 text-xs text-ink/80">
      <div className="flex items-center gap-2 font-body text-tertiary">
        <ShieldAlert size={16} className="shrink-0 text-secondary" />
        <span>
          Protocolo de Trazabilidad <strong>#{trackingCode.replace("#", "")}</strong> ({orderStatus})
        </span>
      </div>
      <TrackingSlaBanner deliveryType={deliveryType} />
    </div>
  );
}
