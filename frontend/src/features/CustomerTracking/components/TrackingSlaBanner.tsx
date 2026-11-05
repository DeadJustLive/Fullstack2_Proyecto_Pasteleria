import { Snowflake } from "../dependencies/dependencies";

interface TrackingSlaBannerProps {
  deliveryType: "RETIRO" | "DELIVERY";
}

export function TrackingSlaBanner({ deliveryType }: TrackingSlaBannerProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
      <Snowflake size={13} />
      {deliveryType === "RETIRO"
        ? "Cámara Refrigerada (2°C - 5°C)"
        : "Transporte con Cadena de Frío Activa"}
    </span>
  );
}
