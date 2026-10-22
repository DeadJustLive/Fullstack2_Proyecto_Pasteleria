// @pca:start
// @id(frontend.domain.productCard)
// @kind(component)
// @limit(lines: 120)
// @contract(props: producto: Producto, className?: string)
// @relates(frontend.ui.button)
// @relates(frontend.ui.buttonLink)
// @relates(frontend.ui.badge)
// @desc(Tarjeta de producto: anadir al carrito real, enlaces reales y a11y)
// @pca:end
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import type { Producto } from "@/types/product";
import { BADGE_LABEL } from "@/data/products";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { useCart } from "@/context/cart";
import { cn, formatPrecio } from "@/lib/utils";

const PRODUCT_CARD =
  "relative flex flex-col overflow-hidden rounded-xl border border-tertiary/10 bg-white shadow-[0_1px_3px_rgba(93,64,55,0.06)]";

export interface ProductCardProps {
  producto: Producto;
  className?: string;
}

/**
 * Tarjeta de producto usada por la Home.
 *
 * - El enlace del nombre es el unico enlace "principal": el de la imagen se
 *   marca como decorativo (`aria-hidden` + `tabIndex={-1}`) para no duplicar
 *   el mismo destino en el arbol de accesibilidad.
 * - "Añadir al carrito" usa el `CartContext` (antes navegaba a `/carrito`).
 */
export function ProductCard({ producto, className }: ProductCardProps) {
  const { agregar } = useCart();
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    if (!agregado) return;
    const temporizador = window.setTimeout(() => setAgregado(false), 1600);
    return () => window.clearTimeout(temporizador);
  }, [agregado]);

  const handleAgregar = () => {
    agregar(producto);
    setAgregado(true);
  };

  return (
    <article className={cn(PRODUCT_CARD, className)}>
      {producto.badge && (
        <Badge tipo={producto.badge}>{BADGE_LABEL[producto.badge]}</Badge>
      )}

      <Link
        to={`/producto/${producto.id}`}
        tabIndex={-1}
        aria-hidden="true"
        className="block aspect-square w-full overflow-hidden"
      >
        <img
          src={producto.imagen}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-[1.1rem]">
        <h3 className="font-display font-semibold">
          <Link
            to={`/producto/${producto.id}`}
            aria-label={`Ver ${producto.nombre}`}
            className="text-tertiary transition-colors hover:underline"
          >
            {producto.nombre}
          </Link>
        </h3>

        <span className="font-bold text-secondary">{formatPrecio(producto.precio)}</span>

        <div className="mt-auto flex items-center gap-2">
          <Button
            onClick={handleAgregar}
            size="sm"
            aria-live="polite"
            className="flex-1 whitespace-nowrap"
          >
            {agregado ? "¡Añadido!" : "Añadir al carrito"}
          </Button>

          <ButtonLink
            to={`/producto/${producto.id}`}
            variant="outline"
            size="icon"
            title="Ver Detalles"
            aria-label={`Ver detalles de ${producto.nombre}`}
            className="h-[46px] w-[46px] border-2 border-secondary text-secondary hover:bg-secondary hover:text-neutral"
          >
            <Eye size={20} aria-hidden="true" />
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
