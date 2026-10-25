// @pca:start
// @id(frontend.domain.carouselBanner)
// @kind(component)
// @limit(lines: 210)
// @contract(props: productos: Producto[])
// @relates(frontend.hooks.useCarousel)
// @relates(frontend.domain.productCard)
// @relates(docs.reglas_ui)
// @desc(Carrusel centrado para banner del catálogo con imagen central y botones en los bordes)
// @pca:end
import type { KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useCarousel } from "@/hooks/useCarousel";
import { cn, formatPrecio } from "@/lib/utils";
import type { Producto } from "@/types/product";

export interface CarouselBannerProps {
  productos: Producto[];
}

export function CarouselBanner({ productos }: CarouselBannerProps) {
  const { trackRef, indice, irA, desplazar } = useCarousel(productos.length);

  if (productos.length === 0) return null;

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
    "pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/95 text-tertiary shadow-xl transition hover:bg-white";

  return (
    <div className="relative w-full">
      <ul
        ref={trackRef}
        onKeyDown={alTeclado}
        tabIndex={0}
        aria-label="Destacados en banner del catálogo"
        className="flex snap-x snap-mandatory items-center gap-4 overflow-x-auto px-[calc(50%-150px)] py-6 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] [scrollbar-width:none] [scroll-padding-inline:calc(50%-150px)] [&::-webkit-scrollbar]:hidden sm:gap-5 sm:px-[calc(50%-180px)] sm:py-8 sm:[scroll-padding-inline:calc(50%-180px)] lg:gap-6 lg:px-[calc(50%-210px)] lg:py-0 lg:[scroll-padding-inline:calc(50%-210px)]"
      >
        {productos.map((producto, i) => {
          const esActivo = i === indice;
          return (
            <li
              key={producto.id}
              data-carrusel-item
              className={cn(
                "flex min-w-[300px] max-w-[340px] flex-[1_0_300px] snap-center transition-all duration-500 sm:min-w-[360px] sm:max-w-[400px] sm:flex-[1_0_360px] lg:min-w-[420px] lg:max-w-[460px] lg:flex-[1_0_420px]",
                esActivo ? "scale-100 opacity-100" : "scale-[0.88] opacity-35 blur-[1.8px]"
              )}
            >
              <div
                className={cn(
                  "relative flex w-full flex-col overflow-hidden rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] transition-none",
                  "h-[300px] sm:h-[340px] lg:h-[380px]",
                  esActivo ? "pointer-events-auto" : "pointer-events-none select-none"
                )}
              >
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div
                  className={cn(
                    "absolute inset-0 transition-all duration-500",
                    esActivo
                      ? "bg-gradient-to-t from-ink/95 via-ink/25 to-transparent"
                      : "bg-gradient-to-t from-ink/90 via-ink/40 to-ink/25"
                  )}
                />
                {!esActivo && <div className="absolute inset-0 backdrop-blur-[1.6px]" />}

                <div className="relative mt-auto flex items-end justify-between gap-3 p-4">
                  <div className="flex flex-col gap-1">
                    <p className="max-w-[170px] truncate font-display text-base font-semibold text-white sm:max-w-[210px] sm:text-lg lg:max-w-[250px]">
                      {producto.nombre}
                    </p>
                    <p className="font-display text-lg font-semibold text-primary sm:text-xl">
                      {formatPrecio(producto.precio)}
                    </p>
                  </div>
                  <Link
                    to={`/producto/${producto.id}`}
                    tabIndex={esActivo ? 0 : -1}
                    aria-label={`Ver detalle de ${producto.nombre}`}
                    title="Ver detalle"
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full bg-white text-tertiary shadow-lg transition-all",
                      esActivo ? "hover:bg-primary" : "pointer-events-none"
                    )}
                  >
                    <Eye size={18} />
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        className={cn(clasesFlecha, "absolute left-2 top-1/2 -translate-y-1/2 sm:left-4 lg:left-6")}
        onClick={() => desplazar(-1)}
        aria-label="Ver destacados anteriores"
      >
        <ChevronLeft size={20} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={cn(clasesFlecha, "absolute right-2 top-1/2 -translate-y-1/2 sm:right-4 lg:right-6")}
        onClick={() => desplazar(1)}
        aria-label="Ver destacados siguientes"
      >
        <ChevronRight size={20} aria-hidden="true" />
      </button>

      <div className="mt-4 flex items-center justify-center gap-1 lg:absolute lg:bottom-[-28px] lg:left-1/2 lg:mt-0 lg:-translate-x-1/2">
        {productos.map((producto, i) => (
          <button
            key={producto.id}
            type="button"
            onClick={() => irA(i)}
            aria-label={`Ir a ${producto.nombre}`}
            aria-current={i === indice ? "true" : undefined}
            className="grid h-7 w-6 place-items-center"
          >
            <span
              aria-hidden="true"
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === indice ? "w-5 bg-white" : "w-1.5 bg-white/50"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
