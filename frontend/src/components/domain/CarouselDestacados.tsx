// @pca:start
// @id(frontend.domain.carouselDestacados)
// @kind(component)
// @limit(lines: 160)
// @contract(props: productos: Producto[])
// @relates(frontend.domain.productCard)
// @relates(docs.reglas_ui)
// @desc(Carrusel de destacados con scroll-snap, flechas funcionales y teclado)
// @pca:end
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/domain/ProductCard";
import type { Producto } from "@/types/product";

export interface CarouselDestacadosProps {
  productos: Producto[];
}

/**
 * Carrusel horizontal de las creations destacadas.
 *
 * - El scroll nativo con `scroll-snap` es el mecanismo real (funciona con dedo,
 *   trackpad y teclado); las flechas solo desplazan el mismo track.
 * - Las flechas viven FUERA del track (layout flex) para que no se escapen del
 *   contenedor ni tapen las tarjetas.
 * - Cada boton se deshabilita en los extremos, de modo que el estado es
 *   comprensible tambien para quien no puede ver el degradado del scroll.
 */
export function CarouselDestacados({ productos }: CarouselDestacadosProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [enInicio, setEnInicio] = useState(true);
  const [enFin, setEnFin] = useState(false);

  const sincronizar = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setEnInicio(track.scrollLeft <= 4);
    setEnFin(track.scrollLeft + track.clientWidth >= track.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    sincronizar();
    track.addEventListener("scroll", sincronizar, { passive: true });
    window.addEventListener("resize", sincronizar);

    return () => {
      track.removeEventListener("scroll", sincronizar);
      window.removeEventListener("resize", sincronizar);
    };
  }, [sincronizar, productos.length]);

  const desplazar = useCallback((direccion: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({
      left: direccion * track.clientWidth * 0.75,
      behavior: suave ? "smooth" : "auto",
    });
  }, []);

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
    "hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-tertiary/15 bg-white text-tertiary shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition hover:bg-primary disabled:pointer-events-none disabled:opacity-0 lg:inline-flex";

  return (
    <div className="mb-12 flex items-center gap-3">
      <button
        type="button"
        className={clasesFlecha}
        onClick={() => desplazar(-1)}
        disabled={enInicio}
        aria-label="Ver creations anteriores"
      >
        <ChevronLeft size={24} aria-hidden="true" />
      </button>

      <ul
        ref={trackRef}
        onKeyDown={alTeclado}
        tabIndex={0}
        aria-label="Creaciones destacadas de la semana"
        className="flex flex-1 select-none snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:justify-center"
      >
        {productos.map((producto) => (
          <li
            key={producto.id}
            className="flex min-w-[260px] max-w-[300px] flex-[1_0_260px] snap-start lg:min-w-0 lg:max-w-none lg:flex-1"
          >
            <ProductCard producto={producto} className="w-full" />
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={clasesFlecha}
        onClick={() => desplazar(1)}
        disabled={enFin}
        aria-label="Ver creations siguientes"
      >
        <ChevronRight size={24} aria-hidden="true" />
      </button>
    </div>
  );
}
