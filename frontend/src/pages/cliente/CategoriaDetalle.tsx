// @pca:start
// @id(frontend.pages.cliente.categoriaDetalle)
// @kind(page)
// @limit(lines: 260)
// @contract(CategoriaDetalleView())
// @relates(frontend.domain.productCard)
// @relates(frontend.services.api)
// @relates(docs.reglas_ui)
// @desc(Vista de categoria especifica filtrada por slug con tarjetas de productos)
// @pca:end
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Sparkles, AlertCircle } from "lucide-react";
import { api } from "@/services/api";
import { ProductCard } from "@/components/domain/ProductCard";
import { FALLBACK_CATEGORIAS, type CategoriaItem } from "@/pages/cliente/Categorias";
import { productos as localProducts } from "@/data/products";
import type { Producto } from "@/types/product";

export function CategoriaDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const [categoria, setCategoria] = useState<CategoriaItem | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let montado = true;

    async function cargarDatos() {
      if (!slug) return;
      setCargando(true);

      // 1. Resolver información de la categoría
      const fallbackCat = FALLBACK_CATEGORIAS.find(
        (c) => c.slug.toLowerCase() === slug.toLowerCase()
      ) || {
        slug,
        nombre: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " "),
        descripcion: "Selección especial de nuestra pastelería artesanal.",
        imagen: "/imagen/chocolate.jpg",
        tags: ["Artesanal"],
      };

      try {
        const catApi = await api.catalog.getCategoryBySlug(slug);
        if (montado && catApi) {
          setCategoria({
            slug: catApi.slug,
            nombre: catApi.nombre || fallbackCat.nombre,
            descripcion: catApi.descripcion || fallbackCat.descripcion,
            imagen: catApi.imagen || fallbackCat.imagen,
            tags: fallbackCat.tags,
          });
        }
      } catch {
        if (montado) {
          setCategoria(fallbackCat);
        }
      }

      // 2. Obtener productos filtrados por categoría
      try {
        const prods = await api.catalog.getProducts(slug);
        if (montado && Array.isArray(prods) && prods.length > 0) {
          setProductos(prods);
        } else {
          // Fallback a productos locales
          filtrarProductosLocales(slug);
        }
      } catch {
        // En caso de fallo de red/offline
        if (montado) {
          filtrarProductosLocales(slug);
        }
      } finally {
        if (montado) setCargando(false);
      }
    }

    function filtrarProductosLocales(categoriaSlug: string) {
      const s = categoriaSlug.toLowerCase().trim();
      const filtrados = localProducts.filter((p) => {
        if (s === "tortas" || s === "torta") {
          return p.categorias.includes("torta");
        }
        if (s === "tartaletas" || s === "tartaleta") {
          return p.categorias.includes("tartaleta");
        }
        if (s === "cheesecake" || s === "cheesecakes") {
          return p.categorias.includes("cheesecake");
        }
        if (s === "pasteles" || s === "pastel" || s === "bolleria") {
          return p.categorias.includes("pastel");
        }
        if (s === "sin-gluten" || s === "singluten") {
          return p.variaciones.includes("sin gluten") || p.categorias.includes("pancakes");
        }
        return (
          p.categorias.some((c) => c.toLowerCase() === s) ||
          p.variaciones.some((v) => v.toLowerCase() === s)
        );
      });
      setProductos(filtrados);
    }

    void cargarDatos();
    return () => {
      montado = false;
    };
  }, [slug]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      {/* Navegación hacia atrás */}
      <div>
        <Link
          to="/categorias"
          className="inline-flex items-center gap-2 font-body text-sm font-semibold text-secondary transition-colors hover:text-tertiary"
        >
          <ArrowLeft size={16} />
          Volver a todas las categorías
        </Link>
      </div>

      {/* Banner de la Categoría */}
      <section className="relative overflow-hidden rounded-2xl bg-tertiary text-white shadow-md">
        <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/80 to-transparent z-10" />
        {categoria?.imagen && (
          <img
            src={categoria.imagen}
            alt={categoria.nombre}
            className="absolute inset-0 h-full w-full object-cover opacity-35"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/imagen/chocolate.jpg";
            }}
          />
        )}
        <div className="relative z-20 flex flex-col gap-3 px-6 py-10 sm:px-12 sm:py-14 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 w-fit rounded-full bg-primary/20 px-3 py-1 font-body text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles size={14} />
            Categoría Especializada
          </span>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            {categoria?.nombre || "Categoría"}
          </h1>
          <p className="font-body text-sm text-neutral/90 sm:text-base leading-relaxed">
            {categoria?.descripcion}
          </p>
        </div>
      </section>

      {/* Listado de Productos */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-tertiary/10 pb-3">
          <p className="font-body text-sm text-ink/70">
            Mostrando <span className="font-semibold text-tertiary">{productos.length}</span> preparaciones disponibles
          </p>
          <Link
            to="/catalogo"
            className="font-body text-sm font-semibold text-secondary hover:underline"
          >
            Ver catálogo completo →
          </Link>
        </div>

        {cargando ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="h-72 animate-pulse rounded-xl bg-neutral/80" />
            ))}
          </div>
        ) : productos.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-tertiary/10 bg-white py-14 text-center">
            <AlertCircle size={36} className="text-secondary/70" />
            <h3 className="font-display text-lg font-semibold text-tertiary">
              No hay productos registrados en esta categoría aún
            </h3>
            <p className="max-w-md font-body text-sm text-ink/70">
              Estamos horneando nuevas recetas. Puedes revisar las demás categorías o visitar el catálogo general.
            </p>
            <Link
              to="/categorias"
              className="mt-2 rounded-xl bg-secondary px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-tertiary"
            >
              Explorar otras categorías
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {productos.map((producto) => (
              <ProductCard key={producto.id} producto={producto} elevation="hoverable" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
