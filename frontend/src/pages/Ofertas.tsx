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
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Percent, ShoppingBag, Sparkles, Tag } from "lucide-react";
import { api } from "@/services/api";
import { useCart } from "@/context/cart";
import { productos as localProducts } from "@/data/products";
import { formatPrecio } from "@/lib/utils";
import type { Producto } from "@/types/product";

export function Ofertas() {
  const [productosOferta, setProductosOferta] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [agregados, setAgregados] = useState<Record<number, boolean>>({});
  const { agregar } = useCart();

  useEffect(() => {
    let montado = true;

    async function cargarOfertas() {
      setCargando(true);
      try {
        // Intentar obtener ofertas desde el endpoint dedicado
        const ofertasApi = await api.catalog.getOffers();
        if (montado && Array.isArray(ofertasApi) && ofertasApi.length > 0) {
          setProductosOferta(ofertasApi);
          return;
        }

        // Si no vienen del endpoint de ofertas, intentar desde lista general
        const todos = await api.catalog.getProducts();
        if (montado && Array.isArray(todos) && todos.length > 0) {
          const filtrados = todos.filter(
            (p) =>
              p.enOferta === true ||
              (typeof p.precioAnterior === "number" && p.precioAnterior > p.precio) ||
              p.badge === "oferta"
          );
          if (filtrados.length > 0) {
            setProductosOferta(filtrados);
            return;
          }
        }

        // Fallback a productos locales
        if (montado) {
          filtrarLocales();
        }
      } catch {
        if (montado) {
          filtrarLocales();
        }
      } finally {
        if (montado) setCargando(false);
      }
    }

    function filtrarLocales() {
      const locales = localProducts.filter(
        (p) =>
          p.enOferta === true ||
          (typeof p.precioAnterior === "number" && p.precioAnterior > p.precio) ||
          p.badge === "oferta"
      );
      setProductosOferta(locales);
    }

    void cargarOfertas();
    return () => {
      montado = false;
    };
  }, []);

  const handleAgregar = (producto: Producto) => {
    agregar(producto);
    setAgregados((prev) => ({ ...prev, [producto.id]: true }));
    setTimeout(() => {
      setAgregados((prev) => ({ ...prev, [producto.id]: false }));
    }, 1500);
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
          <div className="mt-3 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-dashed border-secondary/40 bg-white/90 px-4 py-2.5 text-xs font-body shadow-sm sm:text-sm">
            <span className="text-ink/80">Usa el cupón en carrito:</span>
            <span className="rounded-lg bg-neutral px-2.5 py-1 font-mono font-bold text-secondary">
              CREME10
            </span>
            <span className="font-semibold text-emerald-700">para un 10% adicional</span>
          </div>
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

        {cargando ? (
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
              const precioAnt = producto.precioAnterior || Math.round(producto.precio * 1.15);
              const ahorro = precioAnt - producto.precio;
              const porcentaje = Math.round((ahorro / precioAnt) * 100);
              const agregado = agregados[producto.id];

              return (
                <article
                  key={producto.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-tertiary/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  {/* Badge de Oferta */}
                  <span className="absolute left-3 top-3 z-10 rounded-full bg-red-600 px-3 py-1 font-body text-xs font-bold text-white shadow-md">
                    -{porcentaje}% OFF
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
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                        onClick={() => handleAgregar(producto)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-secondary px-3 py-2.5 font-body text-xs font-semibold text-white transition-colors hover:bg-tertiary"
                      >
                        <ShoppingBag size={14} />
                        {agregado ? "¡Agregado!" : "Añadir"}
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
      <section className="rounded-2xl bg-neutral p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
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
          to="/servicios"
          className="whitespace-nowrap rounded-xl bg-tertiary px-5 py-2.5 font-body text-xs font-semibold text-white transition-colors hover:bg-secondary"
        >
          Ver Servicios Corporativos
        </Link>
      </section>
    </div>
  );
}
