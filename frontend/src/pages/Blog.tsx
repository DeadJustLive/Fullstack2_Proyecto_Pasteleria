// @pca:start
// @id(frontend.pages.cliente.blog)
// @kind(page)
// @limit(lines: 240)
// @contract(BlogView())
// @relates(docs.reglas_ui)
// @desc(Vista listado de articulos del blog reutilizando PageHero, BlogCard y EmptyState)
// @pca:end
import { useEffect, useState } from "react";
import { BookOpen, Sparkles, Tag, TrendingUp } from "lucide-react";
import { BlogCard } from "@/components/domain/BlogCard";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHero } from "@/components/ui/PageHero";
import { blogPosts, BLOG_CATEGORIAS } from "@/data/blog";
import { cn } from "@/lib/utils";
import type { BlogPost, BlogCategoria } from "@/types/blog";

export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>(blogPosts);
  const [categoriaActiva, setCategoriaActiva] = useState<string>("todas");

  useEffect(() => {
    let montado = true;
    async function cargarArticulos() {
      try {
        const apiBase = import.meta.env.VITE_API_URL || "/api";
        const res = await fetch(`${apiBase}/catalog/blogs`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (montado && Array.isArray(data) && data.length > 0) {
          const adaptados: BlogPost[] = data.map((item: unknown) => {
            const b = item as Record<string, unknown>;
            let cat: BlogCategoria = "recetas";
            if (b.categoria === "tips" || b.categoria === "consejos") cat = "tips";
            else if (b.categoria === "novedades") cat = "novedades";
            else if (b.categoria === "historia") cat = "historia";

            return {
              id: Number(b.id) || 0,
              slug: String(b.slug || ""),
              titulo: String(b.titulo || "Artículo de Pastelería"),
              extracto: String(b.extracto || ""),
              contenido:
                typeof b.contenidoJson === "string"
                  ? b.contenidoJson.split("|||")
                  : Array.isArray(b.contenido)
                  ? (b.contenido as string[])
                  : [String(b.extracto || "")],
              imagen: String(b.imagen || "/imagen/torta.jpg"),
              categoria: cat,
              autor: String(b.autor || "Crème & Co"),
              fecha: String(b.fecha || "2026-10-01"),
              tiempoLectura: String(b.tiempoLectura || "3 min"),
              destacado: Boolean(b.destacado),
            };
          });
          setPosts(adaptados);
        }
      } catch {
        // Fallback elegante al data local si el backend no responde
      }
    }
    void cargarArticulos();
    return () => {
      montado = false;
    };
  }, []);

  const postsFiltrados =
    categoriaActiva === "todas"
      ? posts
      : posts.filter((post) => post.categoria === categoriaActiva);

  const postDestacado =
    categoriaActiva === "todas"
      ? postsFiltrados.find((p) => p.destacado) || postsFiltrados[0]
      : null;

  const postsRestantes = postDestacado
    ? postsFiltrados.filter((p) => p.id !== postDestacado.id)
    : postsFiltrados;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 pb-12">
      <PageHero
        eyebrow="Comunidad & Recetas"
        icon={<BookOpen size={14} />}
        titulo="Blog Dulce Crème & Co"
        descripcion="Descubre secretos de nuestro obrador, consejos de conservación, historias de pastelería artesanal y comenta junto a nuestra comunidad."
      />

      {/* Barra de filtros por categoría con contadores */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-tertiary/10 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCategoriaActiva("todas")}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 font-body text-xs font-bold transition-all sm:text-sm",
              categoriaActiva === "todas"
                ? "bg-tertiary text-neutral shadow-xs"
                : "bg-neutral/70 text-tertiary hover:bg-primary/30"
            )}
          >
            <Tag size={14} />
            <span>Todas ({posts.length})</span>
          </button>
          {BLOG_CATEGORIAS.map((cat) => {
            const count = posts.filter((p) => p.categoria === cat.value).length;
            const activo = categoriaActiva === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategoriaActiva(cat.value)}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 font-body text-xs font-bold transition-all sm:text-sm",
                  activo
                    ? "bg-secondary text-neutral shadow-xs"
                    : "bg-neutral/70 text-tertiary hover:bg-primary/30"
                )}
              >
                <span>{cat.label}</span>
                <span className={cn("rounded-full px-1.5 py-0.2 text-[11px]", activo ? "bg-white/20 text-white" : "bg-tertiary/10 text-tertiary")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <span className="hidden items-center gap-1.5 font-body text-xs font-semibold text-secondary md:inline-flex">
          <Sparkles size={14} />
          Haz clic en cualquier artículo para comentar o guardar la receta
        </span>
      </div>

      {/* Artículo Principal Destacado */}
      {postDestacado && <BlogCard post={postDestacado} variant="featured" />}

      {/* Grilla de Artículos */}
      {postsFiltrados.length === 0 ? (
        <EmptyState
          titulo="No hay artículos en esta categoría todavía."
          descripcion="Explora otra categoría para descubrir nuestras recetas y consejos de pastelería."
          accion={
            <Button variant="outline" onClick={() => setCategoriaActiva("todas")}>
              Ver todos los artículos
            </Button>
          }
          className="rounded-2xl border border-tertiary/10 bg-white py-12"
        />
      ) : (
        postsRestantes.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {postsRestantes.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )
      )}

      {/* Banner inferior de invitación a Ofertas y Catálogo */}
      <section className="overflow-hidden rounded-2xl border border-secondary/20 bg-gradient-to-r from-primary/60 via-neutral to-primary/40 p-6 shadow-xs sm:p-8">
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <TrendingUp size={18} className="text-secondary" />
              <span className="font-body text-xs font-bold uppercase tracking-widest text-secondary">
                Del recetario a tu mesa
              </span>
            </div>
            <h2 className="text-left font-display text-xl font-bold text-tertiary sm:text-2xl">
              ¿Te tentaste con alguna de nuestras preparaciones?
            </h2>
            <p className="font-body text-sm text-ink/80">
              Pide nuestras tortas y tartaletas recién horneadas o diseña tu propia torta a medida.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 shrink-0">
            <ButtonLink to="/personalizacion" variant="outline" size="sm">
              Diseñar Torta
            </ButtonLink>
            <ButtonLink to="/catalogo" variant="primary" size="sm">
              Explorar Catálogo
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
