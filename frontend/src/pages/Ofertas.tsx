// @pca:start
// @id(frontend.pages.cliente.ofertas)
// @kind(page)
// @limit(lines: 260)
// @contract(OfertasView())
// @relates(frontend.domain.productCard)
// @relates(frontend.services.api)
// @relates(docs.reglas_ui)
// @desc(Seccion dedicada de productos en oferta con precios tachados y calculo de ahorro)
// @pca:end
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, Eye, Percent, ShoppingBag, Sparkles, Tag } from "lucide-react";
import { useCart } from "@/context/cart";
import { useRealtimeProducts } from "@/hooks/useRealtimeProducts";
import { cn, formatPrecio } from "@/lib/utils";
import type { Producto } from "@/types/product";

export function Ofertas() {
  const { productos, cargando } = useRealtimeProducts();
  const [agregados, setAgregados] = useState<Record<number, boolean>>({});
  const [cuponCopiado, setCuponCopiado] = useState(false);
  const { agregar } = useCart();

  const productosOferta = useMemo(
    () =>
      productos.filter(
        (p) =>
          p.enOferta === true ||
          (typeof p.precioAnterior === "number" && p.precioAnterior > p.precio) ||
          p.badge === "oferta"
      ),
    [productos]
  );

  const handleAgregar = (producto: Producto) => {
    const estaDisponible =
      producto.disponible !== false && (typeof producto.stock !== "number" || producto.stock > 0);
    if (!estaDisponible) return;
    agregar(producto);
    setAgregados((prev) => ({ ...prev, [producto.id]: true }));
    setTimeout(() => {
      setAgregados((prev) => ({ ...prev, [producto.id]: false }));
    }, 1500);
  };

  const handleCopiarCupon = async () => {
    try {
      await navigator.clipboard.writeText("CREME10");
      setCuponCopiado(true);
      setTimeout(() => setCuponCopiado(false), 1800);
    } catch {
      setCuponCopiado(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
      {/* Hero de Ofertas */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-100 via-neutral to-primary/30 px-6 py-10 text-center shadow-sm sm:px-12 sm:py-14">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3.5 py-1 font-body text-xs font-bold uppercase tracking-wider text-red-600">
            <Percent size={14} />
            Promociones Exclusivas
          </span>
          <h1 className="font-display text-3xl font-bold text-tertiary sm:text-4xl md:text-5xl">
            Ofertas & Descuentos
          </h1>
          <p className="font-body text-base text-ink/80 sm:text-lg">
            Aprovecha precios especiales en nuestras tortas y preparaciones seleccionadas. ¡Disponibles por tiempo limitado!
          </p>

          {/* Banner de cupón interactivo */}
          <button
            type="button"
            onClick={handleCopiarCupon}
            aria-label="Copiar cupón CREME10"
            className="mt-3 inline-flex cursor-pointer flex-wrap items-center justify-center gap-2 rounded-2xl border border-dashed border-secondary/40 bg-white/90 px-4 py-2.5 font-body text-xs shadow-sm transition-colors hover:bg-white sm:text-sm"
          >
            <span className="text-ink/80">Usa el cupón en carrito:</span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-neutral px-2.5 py-1 font-mono font-bold text-secondary">
              CREME10
              {cuponCopiado ? <Check size={13} className="text-emerald-700" /> : <Copy size={13} />}
            </span>
            <span className="font-semibold text-emerald-700">
              {cuponCopiado ? "¡Cupón copiado!" : "para un 10% adicional"}
            </span>
          </button>
        </div>
      </section>

      {/* Grid de Productos con Descuento */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-tertiary/10 pb-3">
          <p className="font-body text-sm text-ink/70">
            <span className="font-bold text-tertiary">{productosOferta.length}</span> preparaciones con descuento activo
          </p>
          <Link to="/catalogo" className="font-body text-sm font-semibold text-secondary hover:underline">
            Ver catálogo completo →
          </Link>
        </div>

        {cargando && productosOferta.length === 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="h-80 animate-pulse rounded-2xl bg-neutral/80" />
            ))}
          </div>
        ) : productosOferta.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-tertiary/10 bg-white py-16 text-center">
            <Tag size={40} className="text-secondary/60" />
            <h3 className="font-display text-xl font-bold text-tertiary">
              No hay ofertas activas en este momento
            </h3>
            <p className="max-w-md font-body text-sm text-ink/70">
              Vuelve a revisar pronto para nuevos descuentos o navega por todas nuestras categorías artesanales.
            </p>
            <Link
              to="/catalogo"
              className="mt-3 rounded-xl bg-secondary px-6 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-tertiary"
            >
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {productosOferta.map((producto) => {
              const precioAnt =
                producto.precioAnterior && producto.precioAnterior > producto.precio
                  ? producto.precioAnterior
                  : Math.round(producto.precio * 1.15);
              const ahorro = Math.max(0, precioAnt - producto.precio);
              const porcentaje = precioAnt > 0 ? Math.max(1, Math.round((ahorro / precioAnt) * 100)) : 10;
              const agregado = agregados[producto.id];
              const estaDisponible =
                producto.disponible !== false &&
                (typeof producto.stock !== "number" || producto.stock > 0);

              return (
                <article
                  key={producto.id}
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-2xl border border-tertiary/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
                    !estaDisponible && "opacity-90"
                  )}
                >
                  {/* Badge de Oferta o Agotado */}
                  <span className="absolute left-3 top-3 z-10 rounded-full bg-red-600 px-3 py-1 font-body text-xs font-bold text-white shadow-md">
                    {!estaDisponible ? "Agotado" : `-${porcentaje}% OFF`}
                  </span>

                  <Link
                    to={`/producto/${producto.id}`}
                    tabIndex={-1}
                    className="relative aspect-square w-full overflow-hidden bg-neutral"
                  >
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/imagen/chocolate.jpg";
                      }}
                      className={cn(
                        "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
                        !estaDisponible && "grayscale-[60%]"
                      )}
                    />
                  </Link>

                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="font-display text-base font-bold text-tertiary transition-colors group-hover:text-secondary">
                      <Link to={`/producto/${producto.id}`}>{producto.nombre}</Link>
                    </h2>

                    <p className="mt-1 line-clamp-2 flex-1 font-body text-xs leading-relaxed text-ink/70">
                      {producto.descripcion}
                    </p>

                    {/* Precios y Ahorro */}
                    <div className="mt-4 rounded-xl border border-secondary/10 bg-neutral/60 p-2.5">
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-lg font-bold text-red-600">
                          {formatPrecio(producto.precio)}
                        </span>
                        <span className="font-body text-xs text-ink/50 line-through">
                          {formatPrecio(precioAnt)}
                        </span>
                      </div>
                      <p className="mt-0.5 font-body text-xs font-semibold text-emerald-700">
                        Ahorras {formatPrecio(ahorro)} ({porcentaje}%)
                      </p>
                    </div>

                    {/* Acciones */}
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        type="button"
                        disabled={!estaDisponible}
                        onClick={() => handleAgregar(producto)}
                        className={cn(
                          "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 font-body text-xs font-semibold transition-colors",
                          estaDisponible
                            ? "bg-secondary text-white hover:bg-tertiary"
                            : "cursor-not-allowed bg-ink/15 text-ink/50"
                        )}
                      >
                        <ShoppingBag size={14} />
                        {!estaDisponible ? "Agotado" : agregado ? "¡Agregado!" : "Añadir"}
                      </button>

                      <Link
                        to={`/producto/${producto.id}`}
                        title="Ver detalles"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-secondary/30 text-secondary transition-colors hover:bg-secondary hover:text-white"
                      >
                        <Eye size={16} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Ribbon de Servicios */}
      <section className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-neutral p-6 sm:flex-row sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/40 text-secondary">
            <Sparkles size={22} />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-tertiary">¿Prefieres un menú para un evento corporativo?</h3>
            <p className="font-body text-xs text-ink/75 sm:text-sm">Ofrecemos precios mayoristas y cotizaciones directas para empresas.</p>
          </div>
        </div>
        <Link
          to="/personalizacion"
          className="whitespace-nowrap rounded-xl bg-tertiary px-5 py-2.5 font-body text-xs font-semibold text-white transition-colors hover:bg-secondary"
        >
          Cotizar Pedido Especial
        </Link>
      </section>
    </div>
  );
}
