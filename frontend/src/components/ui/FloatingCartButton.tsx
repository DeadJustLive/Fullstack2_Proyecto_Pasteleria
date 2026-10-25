import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cart";

/**
 * Botón flotante inferior central para acceso directo al carrito.
 * Visible en móvil y desktop únicamente cuando cantidadTotal > 0.
 * Solo icono + badge contador (sin texto).
 */
export function FloatingCartButton() {
  const { cantidadTotal } = useCart();

  if (cantidadTotal <= 0) return null;

  return (
    <aside
      aria-label="Acceso rápido al carrito"
      className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 transform"
    >
      <Link
        to="/carrito"
        aria-label={`Ver carrito de compras con ${cantidadTotal} productos`}
        title={`Ver carrito (${cantidadTotal} productos)`}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-white shadow-2xl ring-4 ring-primary/50 transition-all duration-300 hover:scale-110 hover:bg-tertiary active:scale-95"
      >
        <ShoppingCart size={26} strokeWidth={2.2} />

        <span className="absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 font-display text-xs font-black text-tertiary shadow-md ring-2 ring-white transition-transform group-hover:scale-110">
          {cantidadTotal > 99 ? "99+" : cantidadTotal}
        </span>
      </Link>
    </aside>
  );
}
