import { Link } from "react-router-dom";
import type { Producto } from "@/types/product";
import { BADGE_LABEL } from "@/data/products";
import { Badge } from "@/components/ui/Badge";
import { cn, formatPrecio } from "@/lib/utils";

const PRODUCT_CARD =
  "relative flex flex-col overflow-hidden rounded border border-tertiary/10 bg-white shadow-[0_1px_3px_rgba(93,64,55,0.06)]";

const ICONO_OJO = (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
  </svg>
);

export interface ProductCardProps {
  producto: Producto;
  className?: string;
}

export function ProductCard({ producto, className }: ProductCardProps) {
  return (
    <article className={cn(PRODUCT_CARD, className)}>
      {producto.badge && (
        <Badge tipo={producto.badge}>{BADGE_LABEL[producto.badge]}</Badge>
      )}
      <Link to="#" className="block aspect-square w-full overflow-hidden">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          className="h-full w-full object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-[1.1rem]">
        <h3 className="font-display font-semibold text-tertiary">
          <Link className="hover:text-secondary" to="#">
            {producto.nombre}
          </Link>
        </h3>
        <span className="font-bold text-secondary">{formatPrecio(producto.precio)}</span>
        <div className="mt-auto flex items-center gap-2">
          <Link to="/carrito" className="btn btn-primary btn-add-cart">
            Añadir al carrito
          </Link>
          <a className="btn btn-icon" title="Ver Detalles" aria-label="Ver Detalles">
            {ICONO_OJO}
          </a>
        </div>
      </div>
    </article>
  );
}