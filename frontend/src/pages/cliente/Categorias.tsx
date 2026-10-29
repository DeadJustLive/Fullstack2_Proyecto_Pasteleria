// @pca:start
// @id(frontend.pages.cliente.categorias)
// @kind(page)
// @limit(lines: 220)
// @contract(CategoriasView())
// @relates(frontend.services.api)
// @relates(docs.reglas_ui)
// @desc(Grilla principal de las 5 categorias de la pasteleria conectada a service-catalog)
// @pca:end
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Cake, Sparkles } from "lucide-react";
import { api } from "@/services/api";

export interface CategoriaItem {
  slug: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  tags?: string[];
  activo?: boolean;
}

export const FALLBACK_CATEGORIAS: CategoriaItem[] = [
  {
    slug: "tortas",
    nombre: "Tortas",
    descripcion: "Bizcochos húmedos y aromáticos, capas suaves de ganache belga, dulce de leche de campo y coberturas sedosas.",
    imagen: "/imagen/Torta-Opera-Francesa.webp",
    tags: ["Torta Ópera", "Selva Negra", "Chocolate Belga"],
  },
  {
    slug: "tartaletas",
    nombre: "Tartaletas",
    descripcion: "Base crocante de masa sablée con crema pastelera infusionada en vainilla y frutas frescas de estación.",
    imagen: "/imagen/Tarta-de-Limon-y-Merengue.webp",
    tags: ["Limón Merengue", "Frutos Rojos", "Pies Horneados"],
  },
  {
    slug: "cheesecake",
    nombre: "Cheesecakes",
    descripcion: "Textura densa y suave al estilo New York, horneados a fuego suave y cubiertos de coulis de frutos silvestres.",
    imagen: "/imagen/Cheesecake-de-Frutos-Rojos.webp",
    tags: ["New York Style", "Frutos Rojos", "Maracuyá"],
  },
  {
    slug: "pasteles",
    nombre: "Pasteles y Bollería",
    descripcion: "Laminados hojaldrados de mantequilla al 82%, pasteles de zanahoria, tres leches y bocados individuales diarios.",
    imagen: "/imagen/Croissant.webp",
    tags: ["Croissants 82%", "Tres Leches", "Zanahoria"],
  },
  {
    slug: "sin-gluten",
    nombre: "Sin Gluten",
    descripcion: "Preparaciones 100% certificadas sin trigo, elaboradas con harinas de almendras y arroz sin contaminación cruzada.",
    imagen: "/imagen/Pancakes.webp",
    tags: ["Pancakes", "100% Gluten Free", "Almendras"],
  },
];

export function Categorias() {
  const [categorias, setCategorias] = useState<CategoriaItem[]>(FALLBACK_CATEGORIAS);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let montado = true;

    async function cargarCategorias() {
      try {
        const datos = await api.catalog.getCategories();
        if (montado && Array.isArray(datos) && datos.length > 0) {
          const mapeadas: CategoriaItem[] = datos
            .filter((c) => c.activo !== false)
            .map((c) => {
              const fb = FALLBACK_CATEGORIAS.find((f) => f.slug === c.slug);
              return {
                slug: c.slug,
                nombre: c.nombre || fb?.nombre || "Categoría",
                descripcion: c.descripcion || fb?.descripcion || "Preparación artesanal.",
                imagen: c.imagen || fb?.imagen || "/imagen/chocolate.jpg",
                tags: fb?.tags || ["Artesanal", "Fresco"],
                activo: c.activo !== false,
              };
            });
          setCategorias(mapeadas);
        }
      } catch {
        // Fallback elegante a categorías predefinidas
        if (montado) {
          setCategorias(FALLBACK_CATEGORIAS);
        }
      } finally {
        if (montado) setCargando(false);
      }
    }

    void cargarCategorias();
    return () => {
      montado = false;
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
      {/* Hero de Categorías */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/30 via-neutral to-primary/20 px-6 py-12 text-center shadow-sm sm:px-12 sm:py-16">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1 font-body text-xs font-bold uppercase tracking-wider text-secondary">
            <Sparkles size={14} />
            Nuestra Carta de Especialidades
          </span>
          <h1 className="font-display text-3xl font-bold text-tertiary sm:text-4xl md:text-5xl">
            Categorías de Pastelería
          </h1>
          <p className="font-body text-base text-ink/80 sm:text-lg">
            Explora nuestras 5 familias artesanales creadas a mano diariamente con mantequilla pura, cacaos seleccionados y frutas frescas.
          </p>
        </div>
      </section>

      {/* Grid de Categorías */}
      <section>
        {cargando ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="h-80 animate-pulse rounded-2xl bg-neutral/80" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categorias.map((cat) => (
              <article
                key={cat.slug}
                className="group flex flex-col overflow-hidden rounded-2xl border border-tertiary/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <Link
                  to={`/categorias/${cat.slug}`}
                  className="relative aspect-[16/10] w-full overflow-hidden bg-neutral"
                  tabIndex={-1}
                >
                  <img
                    src={cat.imagen}
                    alt={cat.nombre}
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/imagen/chocolate.jpg";
                    }}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-tertiary/85 px-2.5 py-1 font-body text-xs font-semibold text-white backdrop-blur-sm">
                    <Cake size={13} />
                    Ver carta
                  </span>
                </Link>

                <div className="flex flex-1 flex-col p-6">
                  <h2 className="font-display text-xl font-bold text-tertiary transition-colors group-hover:text-secondary">
                    <Link to={`/categorias/${cat.slug}`}>{cat.nombre}</Link>
                  </h2>

                  <p className="mt-2 flex-1 font-body text-sm leading-relaxed text-ink/75">
                    {cat.descripcion}
                  </p>

                  {cat.tags && cat.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {cat.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-secondary/15 bg-neutral px-2 py-0.5 font-body text-xs font-medium text-secondary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 pt-2">
                    <Link
                      to={`/categorias/${cat.slug}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-tertiary px-4 py-2.5 font-body text-sm font-semibold text-white transition-colors duration-200 hover:bg-secondary"
                    >
                      Explorar {cat.nombre}
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Banner de personalización */}
      <section className="rounded-2xl border-2 border-dashed border-secondary/25 bg-white p-8 text-center sm:p-10">
        <h3 className="font-display text-2xl font-bold text-tertiary">
          ¿Buscas una torta totalmente personalizada?
        </h3>
        <p className="mx-auto mt-2 max-w-xl font-body text-sm text-ink/75 sm:text-base">
          Elige bizcocho, relleno, cobertura y decoraciones a medida para tu cumpleaños, boda o evento especial.
        </p>
        <Link
          to="/personalizacion"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-secondary px-6 py-3 font-body text-sm font-semibold text-white shadow-sm transition-colors hover:bg-tertiary"
        >
          Diseñar Torta Personalizada
          <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
