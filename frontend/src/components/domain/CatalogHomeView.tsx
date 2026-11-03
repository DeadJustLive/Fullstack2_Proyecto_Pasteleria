// @pca:start
// @id(frontend.domain.catalogHomeView)
// @kind(component)
// @limit(lines: 220)
// @contract(CatalogHomeView(props: CatalogHomeViewProps))
// @relates(docs.reglas_ui)
// @desc(Fase 1 del Catalogo: seleccion visual de categorias inspirado en catalog_home.html)
// @pca:end
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Cake, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface CategoryCardData {
  slug: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  emoji: string;
  altText: string;
}

export const CATEGORY_CARDS: CategoryCardData[] = [
  {
    slug: "torta",
    nombre: "Tortas Artesanales",
    descripcion: "Bizcochos húmedos, ganache belga y rellenos suaves.",
    imagen: "/imagen/chocolate.jpg",
    emoji: "🎂",
    altText: "Torta artesanal de chocolate belga",
  },
  {
    slug: "tartaleta",
    nombre: "Tartaletas & Pies",
    descripcion: "Masa sablée crocante, crema suave y frutas frescas.",
    imagen: "/imagen/tartaleta.jpg",
    emoji: "🥧",
    altText: "Tartaleta de frutos rojos de temporada",
  },
  {
    slug: "cheesecake",
    nombre: "Cheesecakes",
    descripcion: "Receta New York horneada con coulis artesanal.",
    imagen: "/imagen/cheesecake.jpg",
    emoji: "🍰",
    altText: "Cheesecake horneado con coulis de frutos silvestres",
  },
  {
    slug: "pastel",
    nombre: "Pasteles & Porciones",
    descripcion: "Tres leches, carrot cake y bocados diarios.",
    imagen: "/imagen/tres_leches.jpg",
    emoji: "🥐",
    altText: "Pastel tres leches tradicional con merengue",
  },
  {
    slug: "pancakes",
    nombre: "Sin Gluten & Especiales",
    descripcion: "Harinas de arroz y almendras sin contaminación.",
    imagen: "/imagen/pancakes.webp",
    emoji: "🌾",
    altText: "Pancakes esponjosos sin gluten",
  },
];

export interface CatalogHomeViewProps {
  onSelectCategory: (categorySlug: string) => void;
  onViewAll: () => void;
  onSearch: (query: string) => void;
  countsByCategory: Record<string, number>;
  totalProducts: number;
}

export function CatalogHomeView({
  onSelectCategory,
  onViewAll,
  onSearch,
  countsByCategory,
  totalProducts,
}: CatalogHomeViewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    } else {
      onViewAll();
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 py-2">
      {/* Barra de Búsqueda Rápida (Estilo Catalog Home) */}
      <form
        onSubmit={handleSearchSubmit}
        className="mx-auto flex w-full max-w-2xl items-center gap-2 rounded-2xl border border-tertiary/15 bg-white p-2 shadow-sm transition-all focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20"
      >
        <div className="flex flex-1 items-center gap-3 px-3 text-tertiary/70">
          <Search size={20} className="shrink-0 text-secondary" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre (ej: Torta, Cheesecake, Macarons...)"
            className="w-full bg-transparent font-body text-sm text-tertiary placeholder:text-ink/50 focus:outline-none"
            aria-label="Buscar en el catálogo"
          />
        </div>
        <Button type="submit" size="sm" className="rounded-xl px-5">
          Buscar
        </Button>
      </form>

      {/* Encabezado de Sección */}
      <div className="flex flex-col items-center gap-2 text-center sm:gap-3">
        <h2 className="font-display text-2xl font-bold text-tertiary sm:text-3xl md:text-4xl">
          Explorar por Categoría
        </h2>
        <p className="max-w-xl font-body text-sm text-ink/75 sm:text-base">
          Selecciona una familia de recetas para ingresar al catálogo filtrado, o explora toda nuestra carta artesanal.
        </p>
      </div>

      {/* Grid de Categorías (2 columnas en móvil, 3 en tablet/escritorio) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-6">
        {CATEGORY_CARDS.map((cat) => {
          const count = countsByCategory[cat.slug] ?? 0;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onSelectCategory(cat.slug)}
              className="group relative flex h-36 w-full flex-col justify-end overflow-hidden rounded-2xl p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 sm:h-44 sm:p-5"
            >
              {/* Imagen de Fondo */}
              <img
                src={cat.imagen}
                alt={cat.altText}
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/imagen/chocolate.jpg";
                }}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
              />

              {/* Degradado oscuro para máxima legibilidad */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/50 to-transparent transition-opacity duration-300 group-hover:from-ink/95"
                aria-hidden="true"
              />

              {/* Badge de cantidad de ítems (esquina superior derecha) */}
              <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 font-body text-[11px] font-semibold text-white backdrop-blur-md sm:right-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs">
                <Cake size={12} className="shrink-0" />
                {count} {count === 1 ? "ítem" : "delicias"}
              </span>

              {/* Título y etiqueta de la categoría */}
              <div className="relative z-10 flex flex-col gap-0.5">
                <span className="font-display text-sm font-bold text-white drop-shadow-sm sm:text-lg">
                  {cat.emoji} {cat.nombre}
                </span>
                <span className="line-clamp-1 font-body text-[11px] text-white/80 drop-shadow-xs sm:text-xs">
                  {cat.descripcion}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Acción "Ver Todo el Catálogo" */}
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <p className="font-body text-xs text-ink/70 sm:text-sm">
          ¿Deseas comparar todos los productos sin filtrar por categoría?
        </p>
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-tertiary bg-white px-8 py-3 font-body text-sm font-bold text-tertiary shadow-xs transition-all hover:bg-tertiary hover:text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
        >
          Ver todo el catálogo ({totalProducts} productos)
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Banner de Personalización al pie */}
      <div className="mt-4 flex flex-col items-center justify-between gap-4 rounded-2xl border border-secondary/20 bg-primary/15 p-6 text-center sm:flex-row sm:text-left sm:p-8">
        <div>
          <h3 className="font-display text-lg font-bold text-tertiary sm:text-xl">
            ¿Buscas una torta a medida?
          </h3>
          <p className="mt-1 font-body text-xs text-ink/75 sm:text-sm">
            Diseña tu torta con porciones, bizcocho, rellenos y cobertura personalizada.
          </p>
        </div>
        <Link
          to="/personalizacion"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 font-body text-xs font-semibold text-white transition-colors hover:bg-tertiary sm:text-sm"
        >
          Diseñar Torta Personalizada
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
