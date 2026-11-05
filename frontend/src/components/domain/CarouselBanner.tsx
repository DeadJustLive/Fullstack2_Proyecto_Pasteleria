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
    "pointer-events-auto inline-flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/95 text-tertiary shadow-xl transition hover:bg-white cursor-pointer";

  return (
    <div className="relative w-full">
      <ul
        ref={trackRef}
        onKeyDown={alTeclado}
        tabIndex={0}
        aria-label="Destacados en banner del catálogo"
        className="flex snap-x snap-mandatory items-center gap-3 overflow-x-auto px-[calc(50%-120px)] py-4 [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)] [scrollbar-width:none] [scroll-padding-inline:calc(50%-120px)] [&::-webkit-scrollbar]:hidden sm:gap-5 sm:px-[calc(50%-180px)] sm:py-8 sm:[scroll-padding-inline:calc(50%-180px)] lg:gap-6 lg:px-[calc(50%-210px)] lg:py-0 lg:[scroll-padding-inline:calc(50%-210px)]"
      >
        {productos.map((producto, i) => {
          const esActivo = i === indice;
          return (
            <li
              key={producto.id}
              data-carrusel-item
              className={cn(
                "flex min-w-[240px] max-w-[270px] flex-[1_0_240px] snap-center transition-all duration-500 sm:min-w-[360px] sm:max-w-[400px] sm:flex-[1_0_360px] lg:min-w-[420px] lg:max-w-[460px] lg:flex-[1_0_420px]",
                esActivo ? "scale-100 opacity-100" : "scale-[0.88] opacity-35 blur-[1.8px]"
              )}
            >
              <div
                className={cn(
                  "relative flex w-full flex-col overflow-hidden rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] transition-none",
                  "h-[250px] sm:h-[340px] lg:h-[380px]",
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

                <div className="relative mt-auto flex items-end justify-between gap-2.5 p-3.5 sm:gap-3 sm:p-4">
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:gap-1">
                    <p className="truncate font-display text-sm font-semibold text-white sm:text-lg">
                      {producto.nombre}
                    </p>
                    <p className="font-display text-base font-semibold text-primary sm:text-xl">
                      {formatPrecio(producto.precio)}
                    </p>
                  </div>
                  <Link
                    to={`/producto/${producto.id}`}
                    tabIndex={esActivo ? 0 : -1}
                    aria-label={`Ver detalle de ${producto.nombre}`}
                    title="Ver detalle"
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-tertiary shadow-lg transition-all sm:h-10 sm:w-10",
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

      {/* Flechas flotantes laterales (desde sm: en adelante, donde hay espacio suficiente) */}
      <button
        type="button"
        className={cn(clasesFlecha, "hidden sm:inline-flex sm:absolute sm:left-4 sm:top-1/2 sm:-translate-y-1/2 lg:left-6")}
        onClick={() => desplazar(-1)}
        aria-label="Ver destacados anteriores"
      >
        <ChevronLeft size={20} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={cn(clasesFlecha, "hidden sm:inline-flex sm:absolute sm:right-4 sm:top-1/2 sm:-translate-y-1/2 lg:right-6")}
        onClick={() => desplazar(1)}
        aria-label="Ver destacados siguientes"
      >
        <ChevronRight size={20} aria-hidden="true" />
      </button>

      {/* Barra inferior de controles: en móvil incluye flechas a los lados de los indicadores para no tapar el slide */}
      <div className="mt-2 flex items-center justify-center gap-3 sm:mt-4 sm:gap-1 lg:absolute lg:bottom-[-28px] lg:left-1/2 lg:mt-0 lg:-translate-x-1/2">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/90 text-tertiary shadow-md transition hover:bg-white sm:hidden"
          onClick={() => desplazar(-1)}
          aria-label="Ver destacados anteriores"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>

        <div className="flex items-center gap-1">
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

        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/90 text-tertiary shadow-md transition hover:bg-white sm:hidden"
          onClick={() => desplazar(1)}
          aria-label="Ver destacados siguientes"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
