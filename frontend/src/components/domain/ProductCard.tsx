// @pca:start
// @id(frontend.domain.productCard)
// @kind(component)
// @limit(lines: 140)
// @contract(props: producto: Producto, elevation?: string, className?: string)
// @relates(frontend.ui.button)
// @relates(frontend.ui.buttonLink)
// @relates(frontend.ui.badge)
// @desc(Tarjeta de producto: anadir al carrito real, enlaces reales y a11y)
// @pca:end
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import type { Producto } from "@/types/product";
import { BADGE_LABEL } from "@/data/products";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { useCart } from "@/context/cart";
import { cn, formatPrecio } from "@/lib/utils";

const productCardVariants = cva(
  "relative flex flex-col overflow-hidden rounded-xl border border-tertiary/10 bg-white transition-shadow duration-200",
  {
    variants: {
      elevation: {
        flat: "shadow-none",
        subtle: "shadow-[0_1px_3px_rgba(93,64,55,0.06)]",
        hoverable: "shadow-[0_1px_3px_rgba(93,64,55,0.06)] hover:shadow-md",
      },
    },
    defaultVariants: { elevation: "subtle" },
  }
);

export interface ProductCardProps extends VariantProps<typeof productCardVariants> {
  producto: Producto;
  className?: string;
}

export function ProductCard({ producto, elevation, className }: ProductCardProps) {
  const { agregar } = useCart();
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    if (!agregado) return;
    const t = window.setTimeout(() => setAgregado(false), 1600);
    return () => window.clearTimeout(t);
  }, [agregado]);

  const estaDisponible = producto.disponible !== false;
  const handleAgregar = () => {
    if (estaDisponible) {
      agregar(producto);
      setAgregado(true);
    }
  };

  return (
    <article className={cn(productCardVariants({ elevation }), !estaDisponible && "opacity-90", className)}>
      {!estaDisponible ? (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-red-600 px-3 py-1 font-body text-xs font-bold text-white shadow-md">
          Agotado
        </span>
      ) : producto.badge ? (
        <Badge tipo={producto.badge}>{BADGE_LABEL[producto.badge]}</Badge>
      ) : null}

      <Link to={`/producto/${producto.id}`} tabIndex={-1} aria-hidden="true" className="block aspect-square w-full overflow-hidden">
        <img
          src={producto.imagen}
          alt=""
          loading="lazy"
          decoding="async"
          className={cn("h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]", !estaDisponible && "grayscale-[60%]")}
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-[1.1rem]">
        <h3 className="font-display font-semibold">
          <Link to={`/producto/${producto.id}`} aria-label={`Ver ${producto.nombre}`} className="text-tertiary transition-colors hover:underline">
            {producto.nombre}
          </Link>
        </h3>

        <div className="flex items-center justify-between">
          <span className="font-bold text-secondary">{formatPrecio(producto.precio)}</span>
          {!estaDisponible && <span className="font-body text-xs font-semibold text-red-600">No disponible</span>}
        </div>

        <div className="mt-auto flex items-center gap-2">
          <Button
            onClick={handleAgregar}
            disabled={!estaDisponible}
            size="sm"
            aria-live="polite"
            className={cn("flex-1 whitespace-nowrap", !estaDisponible && "cursor-not-allowed bg-ink/20 text-ink/50 hover:bg-ink/20")}
          >
            {!estaDisponible ? "Agotado" : agregado ? "¡Añadido!" : "Añadir al carrito"}
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
