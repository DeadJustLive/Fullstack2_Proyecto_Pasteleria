export interface BannerServiciosProps {
  items: string[];
}

function Pill({ texto }: { texto: string }) {
  return (
    <li className="flex shrink-0 items-center gap-[0.6rem] text-[0.95rem] font-semibold text-tertiary">
      <span
        aria-hidden="true"
        className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[0.85rem] font-extrabold text-tertiary"
      >
        ✓
      </span>
      {texto}
    </li>
  );
}

export function BannerServicios({ items }: BannerServiciosProps) {
  return (
    <div
      role="region"
      aria-label="Nuestros servicios"
      className="group mb-12 overflow-hidden rounded-[12px] border border-tertiary/[0.12] bg-white px-8 py-6 shadow-[0_4px_6px_rgba(93,64,55,0.05)]"
    >
      <div className="flex w-max animate-[banner-deslizar_30s_linear_infinite] motion-reduce:animate-none group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
        <ul className="flex shrink-0 items-center gap-8 pr-8">
          {items.map((texto) => (
            <Pill key={texto} texto={texto} />
          ))}
        </ul>
        <ul aria-hidden="true" className="flex shrink-0 items-center gap-8 pr-8">
          {items.map((texto, i) => (
            <Pill key={`${texto}-${i}`} texto={texto} />
          ))}
        </ul>
      </div>
    </div>
  );
}