// @pca:start
// @id(frontend.domain.carouselDestacados)
// @kind(component)
// @limit(lines: 145)
// @contract(props: productos: Producto[])
// @relates(frontend.domain.productCard)
// @relates(frontend.hooks.useCarousel)
// @relates(docs.reglas_ui)
// @desc(Carrusel ciclico de destacados con scroll-snap, flechas inferiores y pildoras)
// @pca:end
import type { KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/domain/ProductCard";
import { useCarousel } from "@/hooks/useCarousel";
import { cn } from "@/lib/utils";
import type { Producto } from "@/types/product";

export interface CarouselDestacadosProps {
  productos: Producto[];
}

/**
 * Carrusel horizontal de las creaciones destacadas.
 *
 * - El scroll nativo con `scroll-snap` es el mecanismo real (funciona con dedo,
 *   trackpad y teclado); las flechas solo desplazan el mismo track.
 * - Las flechas viven DEBAJO del track: en movil son la unica forma de
 *   recorrer el carrusel sin arrastrar, asi que no pueden esconderse.
 * - Las pildoras indican el producto que queda a la izquierda y son clicables:
 *   al pulsarlas el carrusel alinea ese producto.
 * - El track termina con un espaciador (`calc(100% - 260px)`) para que el
 *   ultimo producto tambien pueda quedar pegado a la izquierda; sin el, el
 *   navegador lo dejaria a media pantalla y su pildora nunca se activaria.
 */
export function CarouselDestacados({ productos }: CarouselDestacadosProps) {
  const { trackRef, indice, irA, desplazar } = useCarousel(productos.length);

  const alTeclado = (evento: KeyboardEvent<HTMLUListElement>) => {
    if (evento.key === "ArrowRight") {
      evento.preventDefault();
      desplazar(1);
    }
    if (evento.key === "ArrowLeft") {
      evento.preventDefault();
      desplazar(-1);
    }
  };

  const clasesFlecha =
    "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-tertiary/15 bg-white text-tertiary shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition hover:bg-primary";

  return (
    <div className="mb-12">
      <ul
        ref={trackRef}
        onKeyDown={alTeclado}
        tabIndex={0}
        aria-label="Creaciones destacadas de la semana"
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {productos.map((producto) => (
          <li
            key={producto.id}
            data-carrusel-item
            className="flex min-w-[260px] max-w-[300px] flex-[1_0_260px] snap-start"
          >
            <ProductCard producto={producto} className="w-full" />
          </li>
        ))}
        {/* Espaciador final: permite alinear el ultimo producto a la izquierda. */}
        <li
          aria-hidden="true"
          className="basis-[calc(100%_-_260px)] min-w-0 grow-0 shrink-0 snap-none"
        />
      </ul>

      <div className="flex items-center justify-center gap-3 sm:gap-5">
        <button
          type="button"
          className={clasesFlecha}
          onClick={() => desplazar(-1)}
          aria-label="Ver creaciones anteriores"
        >
          <ChevronLeft size={24} aria-hidden="true" />
        </button>

        <div className="flex items-center gap-1" role="group" aria-label="Posición del carrusel">
          {productos.map((producto, i) => (
            <button
              key={producto.id}
              type="button"
              onClick={() => irA(i)}
              aria-label={`Ir a ${producto.nombre}`}
              aria-current={i === indice ? "true" : undefined}
              className="grid h-8 w-6 place-items-center"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === indice ? "w-5 bg-primary" : "w-2 bg-tertiary/30",
                )}
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          className={clasesFlecha}
          onClick={() => desplazar(1)}
          aria-label="Ver creaciones siguientes"
        >
          <ChevronRight size={24} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
