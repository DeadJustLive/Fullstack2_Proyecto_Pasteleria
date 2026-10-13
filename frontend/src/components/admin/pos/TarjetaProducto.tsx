import { formatPrecio } from "@/lib/utils";
import type { Producto } from "@/types/product";

interface TarjetaProductoProps {
  producto: Producto;
  onAgregar: (producto: Producto) => void;
}

export function TarjetaProducto({ producto, onAgregar }: TarjetaProductoProps) {
  return (
    <button
      type="button"
      onClick={() => onAgregar(producto)}
      className="flex h-full w-full flex-col overflow-hidden rounded border border-tertiary/10 bg-white text-left shadow-sm transition-transform hover:scale-[1.03] hover:border-primary hover:shadow-md"
    >
      <img
        src={producto.imagen}
        alt={producto.nombre}
        className="aspect-square w-full object-cover"
      />
      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="line-clamp-1 font-body text-sm font-semibold text-ink">
          {producto.nombre}
        </span>
        <span className="font-body font-bold text-secondary">
          {formatPrecio(producto.precio)}
        </span>
      </div>
    </button>
  );
}
