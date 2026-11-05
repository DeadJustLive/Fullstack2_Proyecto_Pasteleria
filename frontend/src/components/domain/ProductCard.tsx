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
  "relative flex min-w-[150px] flex-col overflow-hidden rounded-xl border border-tertiary/10 bg-white transition-shadow duration-200",
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
      ) : producto.enOferta ? (
        <Badge tipo="oferta">Oferta</Badge>
      ) : null}

      <Link to={`/producto/${producto.id}`} tabIndex={-1} aria-hidden="true" className="block aspect-square w-full overflow-hidden">
        <img
          src={producto.imagen}
          alt=""
          loading="lazy"
          decoding="async" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/imagen/chocolate.jpg"; }}
          className={cn("h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]", !estaDisponible && "grayscale-[60%]")}
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-[1.1rem]">
        <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug sm:text-base">
          <Link to={`/producto/${producto.id}`} aria-label={`Ver ${producto.nombre}`} className="text-tertiary transition-colors hover:underline">
            {producto.nombre}
          </Link>
        </h3>

        <div className="flex flex-wrap items-center justify-between gap-1">
          <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
            <span className="text-sm font-bold text-secondary sm:text-base">{formatPrecio(producto.precio)}</span>
            {producto.precioAnterior && producto.precioAnterior > producto.precio && (
              <span className="text-[11px] text-ink/50 line-through sm:text-xs">
                {formatPrecio(producto.precioAnterior)}
              </span>
            )}
          </div>
          {!estaDisponible && <span className="font-body text-[11px] font-semibold text-red-600 sm:text-xs">No disponible</span>}
        </div>

        <div className="mt-auto flex items-center gap-1.5 pt-1 sm:gap-2">
          <Button
            onClick={handleAgregar}
            disabled={!estaDisponible}
            size="sm"
            aria-live="polite"
            className={cn(
              "min-w-0 flex-1 whitespace-nowrap px-2.5 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm",
              !estaDisponible && "cursor-not-allowed bg-ink/20 text-ink/50 hover:bg-ink/20"
            )}
          >
            {!estaDisponible ? (
              "Agotado"
            ) : agregado ? (
              "¡Añadido!"
            ) : (
              <>
                <span className="sm:hidden" aria-hidden="true">Añadir</span>
                <span className="hidden sm:inline">Añadir al carrito</span>
              </>
            )}
          </Button>

          <ButtonLink
            to={`/producto/${producto.id}`}
            variant="outline"
            size="icon"
            title="Ver Detalles"
            aria-label={`Ver detalles de ${producto.nombre}`}
            className="h-9 w-9 shrink-0 border-2 border-secondary text-secondary hover:bg-secondary hover:text-neutral sm:h-[46px] sm:w-[46px]"
          >
            <Eye className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
