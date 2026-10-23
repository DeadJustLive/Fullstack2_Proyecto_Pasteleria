// @pca:start
// @id(frontend.hooks.useCarousel)
// @kind(service)
// @limit(lines: 120)
// @contract(useCarousel(total: number) -> { trackRef, indice, irA, desplazar })
// @relates(frontend.domain.carouselDestacados)
// @relates(docs.reglas_ui)
// @desc(Estado y acciones de un carrusel horizontal cíclico con scroll-snap)
// @pca:end
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Estado y acciones de un track horizontal con `scroll-snap`.
 *
 * - `indice` es el primer producto visible (el que queda pegado al borde
 *   izquierdo).
 * - `irA` alinea un producto concreto; `desplazar` avanza o retrocede uno.
 * - Es **cíclico**: al pulsar "siguiente" en el último producto vuelve al
 *   primero, y al pulsar "anterior" en el primero va al último.
 * - El scroll respeta `prefers-reduced-motion`.
 */
export interface UseCarousel {
  trackRef: React.RefObject<HTMLUListElement>;
  indice: number;
  irA: (destino: number) => void;
  desplazar: (direccion: 1 | -1) => void;
}

export function useCarousel(total: number): UseCarousel {
  const trackRef = useRef<HTMLUListElement>(null);
  const [indice, setIndice] = useState(0);

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
    if (!track || total <= 0) return;

    let activo = 0;
    posiciones().forEach((posicion, i) => {
      if (posicion <= track.scrollLeft + 8) activo = i;
    });

    // Normalizar por si queda fuera de rango (transición cíclica)
    activo = ((activo % total) + total) % total;
    setIndice(activo);
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
      if (!track || total <= 0) return;

      const offsets = posiciones();
      if (offsets.length === 0) return;

      // Cíclico: si se sale por arriba o por abajo, dar la vuelta
      const objetivo = ((destino % total) + total) % total;
      const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      track.scrollTo({ left: offsets[objetivo], behavior: suave ? "smooth" : "auto" });
    },
    [posiciones, total],
  );

  const desplazar = useCallback(
    (direccion: 1 | -1) => {
      irA(indice + direccion);
    },
    [indice, irA],
  );

  return { trackRef, indice, irA, desplazar };
}

