// @pca:start
// @id(frontend.hooks.useCarousel)
// @kind(service)
// @limit(lines: 110)
// @contract(useCarousel(total: number) -> { trackRef, indice, enInicio, enFin, irA, desplazar })
// @relates(frontend.domain.carouselDestacados)
// @relates(docs.reglas_ui)
// @desc(Estado y acciones de un track horizontal con scroll-snap (indice y posiciones))
// @pca:end
import { useCallback, useEffect, useRef, useState } from "react";

export interface UseCarousel {
  trackRef: React.RefObject<HTMLUListElement>;
  indice: number;
  irA: (destino: number) => void;
  desplazar: (direccion: 1 | -1) => void;
}

export function useCarousel(total: number): UseCarousel {
  const trackRef = useRef<HTMLUListElement>(null);
  const [indice, setIndice] = useState(0);
  const rafId = useRef<number | null>(null);

  const posiciones = useCallback((): number[] => {
    const track = trackRef.current;
    if (!track) return [];
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

    activo = ((activo % total) + total) % total;
    setIndice(activo);
  }, [posiciones, total]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const manejarScroll = () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        sincronizar();
        rafId.current = null;
      });
    };

    sincronizar();
    track.addEventListener("scroll", manejarScroll, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => sincronizar());
      resizeObserver.observe(track);
    } else {
      window.addEventListener("resize", sincronizar);
    }

    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      track.removeEventListener("scroll", manejarScroll);
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", sincronizar);
      }
    };
  }, [sincronizar, total]);

  const irA = useCallback(
    (destino: number) => {
      const track = trackRef.current;
      if (!track || total <= 0) return;

      const offsets = posiciones();
      if (offsets.length === 0) return;

      const objetivo = ((destino % total) + total) % total;
      const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      track.scrollTo({ left: offsets[objetivo], behavior: suave ? "smooth" : "auto" });
    },
    [posiciones, total],
  );

  const desplazar = useCallback(
    (direccion: 1 | -1) => irA(indice + direccion),
    [indice, irA],
  );

  return { trackRef, indice, irA, desplazar };
}
