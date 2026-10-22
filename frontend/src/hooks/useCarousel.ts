// @pca:start
// @id(frontend.hooks.useCarousel)
// @kind(service)
// @limit(lines: 100)
// @contract(useCarousel(total: number) -> { trackRef, indice, enInicio, enFin, irA, desplazar })
// @relates(frontend.domain.carouselDestacados)
// @relates(docs.reglas_ui)
// @desc(Estado y acciones de un track horizontal con scroll-snap (indice y posiciones))
// @pca:end
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Estado y acciones de un track horizontal con `scroll-snap`.
 *
 * - `indice` es el primer producto visible (el que queda pegado al borde
 *   izquierdo). Como el track lleva un espaciador final, cualquier producto
 *   puede quedar alineado a la izquierda, incluido el ultimo.
 * - `irA` alinea un producto concreto; `desplazar` avanza o retrocede uno.
 * - El scroll respeta `prefers-reduced-motion`.
 */
export interface UseCarousel {
  trackRef: React.RefObject<HTMLUListElement>;
  indice: number;
  enInicio: boolean;
  enFin: boolean;
  irA: (destino: number) => void;
  desplazar: (direccion: 1 | -1) => void;
}

export function useCarousel(total: number): UseCarousel {
  const trackRef = useRef<HTMLUListElement>(null);
  const [indice, setIndice] = useState(0);
  const [enInicio, setEnInicio] = useState(true);
  const [enFin, setEnFin] = useState(false);

  /** Distancia, en px, desde la que empieza cada producto dentro del track. */
  const posiciones = useCallback((): number[] => {
    const track = trackRef.current;
    if (!track) return [];

    // Solo los productos: el track termina con un espaciador que no cuenta.
    const items = Array.from(track.querySelectorAll("[data-carrusel-item]")) as HTMLElement[];
    const base = items[0]?.offsetLeft ?? 0;

    return items.map((item) => item.offsetLeft - base);
  }, []);

  const sincronizar = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    setEnInicio(track.scrollLeft <= 4);

    let activo = 0;
    posiciones().forEach((posicion, i) => {
      if (posicion <= track.scrollLeft + 8) activo = i;
    });
    setIndice(activo);
    // El final se decide por el ultimo producto, no por el ancho total del
    // track: el espaciador final anade unos pixeles de mas y dejarian la
    // flecha activada cuando ya no hay nada que mostrar.
    setEnFin(activo >= total - 1);
  }, [posiciones, total]);

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
  }, [sincronizar, total]);

  const irA = useCallback(
    (destino: number) => {
      const track = trackRef.current;
      if (!track) return;

      const offsets = posiciones();
      if (offsets.length === 0) return;

      const objetivo = Math.min(Math.max(destino, 0), offsets.length - 1);
      const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      track.scrollTo({ left: offsets[objetivo], behavior: suave ? "smooth" : "auto" });
    },
    [posiciones],
  );

  const desplazar = useCallback(
    (direccion: 1 | -1) => {
      irA(indice + direccion);
    },
    [indice, irA],
  );

  return { trackRef, indice, enInicio, enFin, irA, desplazar };
}
