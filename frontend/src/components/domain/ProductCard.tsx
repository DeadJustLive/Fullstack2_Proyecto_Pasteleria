import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import type { Producto } from "@/types/product";
import { BADGE_LABEL } from "@/data/products";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/cart";
import { cn, formatPrecio } from "@/lib/utils";

const PRODUCT_CARD =
  "relative flex flex-col overflow-hidden rounded border border-tertiary/10 bg-white shadow-[0_1px_3px_rgba(93,64,55,0.06)]";

const BOTON_DETALLE =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded border border-tertiary text-tertiary transition-colors hover:bg-tertiary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

export interface ProductCardProps {
  producto: Producto;
  className?: string;
}

export function ProductCard({ producto, className }: ProductCardProps) {
  const { agregar } = useCart();
  const [agregado, setAgregado] = useState(false);
  const rutaDetalle = `/producto/${producto.id}`;

  // El aviso "Añadido" se apaga solo a los 1,5 s.
  useEffect(() => {
    if (!agregado) return;
    const temporizador = setTimeout(() => setAgregado(false), 1500);
    return () => clearTimeout(temporizador);
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
      <Link to={rutaDetalle} className="block aspect-square w-full overflow-hidden">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          className="h-full w-full object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-[1.1rem]">
        <h3 className="font-display font-semibold text-tertiary">
          <Link className="hover:text-secondary" to={rutaDetalle}>
            {producto.nombre}
          </Link>
        </h3>
        <span className="font-bold text-secondary">{formatPrecio(producto.precio)}</span>
        <div className="mt-auto flex items-center gap-2">
          <Button
            size="sm"
            className="min-w-0 flex-1 whitespace-nowrap px-2 text-[0.8125rem]"
            onClick={handleAgregar}
            aria-live="polite"
          >
            {agregado ? "¡Añadido! ✓" : "Añadir al carrito"}
          </Button>
          <Link
            to={rutaDetalle}
            title="Ver detalles"
            aria-label={`Ver detalles de ${producto.nombre}`}
            className={BOTON_DETALLE}
          >
            <Eye size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
