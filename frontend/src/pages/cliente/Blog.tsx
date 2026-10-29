// @pca:start
// @id(frontend.pages.cliente.blog)
// @kind(page)
// @limit(lines: 240)
// @contract(BlogView())
// @relates(docs.reglas_ui)
// @desc(Vista listado de articulos del blog de pasteleria)
// @pca:end
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Heart, MessageCircle, Repeat2, Share2, Tag, TrendingUp } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { blogPosts, BLOG_CATEGORIAS } from "@/data/blog";
import { cn, formatFechaLarga } from "@/lib/utils";
import type { BlogPost, BlogCategoria } from "@/types/blog";

export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>(blogPosts);
  const [categoriaActiva, setCategoriaActiva] = useState<string>("todas");

  useEffect(() => {
    let montado = true;
    async function cargarArticulos() {
      try {
        const res = await fetch("http://localhost:8080/api/catalog/blogs");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (montado && Array.isArray(data) && data.length > 0) {
          const adaptados: BlogPost[] = data.map((b: any) => {
            let cat: BlogCategoria = "recetas";
            if (b.categoria === "tips" || b.categoria === "consejos") cat = "tips";
            else if (b.categoria === "novedades") cat = "novedades";
            else if (b.categoria === "historia") cat = "historia";

            return {
              id: Number(b.id) || 0,
              slug: b.slug,
              titulo: b.titulo || "Artículo de Pastelería",
              extracto: b.extracto || "",
              contenido:
                typeof b.contenidoJson === "string"
                  ? b.contenidoJson.split("|||")
                  : Array.isArray(b.contenido)
                  ? b.contenido
                  : [b.extracto || ""],
              imagen: b.imagen || "/imagen/torta.jpg",
              categoria: cat,
              autor: b.autor || "Crème & Co",
              fecha: b.fecha || "2026-10-01",
              tiempoLectura: b.tiempoLectura || "3 min",
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

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      {/* Banner de promociones */}
      <section className="overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary/90 to-secondary">
        <div className="flex flex-col gap-3 px-6 py-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <TrendingUp size={20} className="text-tertiary" />
              <span className="font-body text-sm font-bold uppercase tracking-widest text-tertiary">
                Promociones activas
              </span>
            </div>
            <p className="font-display text-lg font-semibold text-tertiary sm:text-xl">
              2x1 en Tartaletas los Miércoles
            </p>
            <p className="font-body text-sm text-tertiary/80">
              Válido hasta fin de mes. No acumulable con otras ofertas.
            </p>
          </div>
          <ButtonLink to="/catalogo" variant="secondary" className="mx-auto sm:mx-0">
            Ver productos
          </ButtonLink>
        </div>
      </section>

      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-tertiary/10 pb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-tertiary">Blog Crème & Co</h1>
          <p className="font-body text-ink/70">
            Recetas, novedades y noticias de nuestra pastelería
          </p>
        </div>

        {/* Categorías */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoriaActiva("todas")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-1.5 font-body text-sm font-semibold transition-colors",
              categoriaActiva === "todas"
                ? "bg-tertiary text-white"
                : "bg-tertiary/5 text-tertiary hover:bg-tertiary/10"
            )}
          >
            <Tag size={14} />
            Todas
          </button>
          {BLOG_CATEGORIAS.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoriaActiva(cat.value)}
              className={cn(
                "rounded-full px-4 py-1.5 font-body text-sm font-semibold transition-colors",
                categoriaActiva === cat.value
                  ? "bg-tertiary text-white"
                  : "bg-tertiary/5 text-tertiary hover:bg-tertiary/10"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      {/* Feed de Artículos */}
      <div className="flex flex-col divide-y divide-tertiary/10">
        {postsFiltrados.length === 0 ? (
          <p className="py-10 text-center font-body text-ink/60">
            No hay publicaciones en esta categoría por el momento.
          </p>
        ) : (
          postsFiltrados.map((post) => {
            const categoria = BLOG_CATEGORIAS.find((c) => c.value === post.categoria);
            return (
              <article
                key={post.id}
                className="group flex gap-3 px-4 py-4 transition-colors hover:bg-tertiary/5 sm:gap-4 sm:px-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary sm:h-12 sm:w-12">
                  <span className="font-display text-lg text-white">C&C</span>
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-body font-semibold text-tertiary">Crème & Co</span>
                    <span className="text-ink/40">·</span>
                    <span className="font-body text-sm text-ink/60">
                      {formatFechaLarga(post.fecha)}
                    </span>
                    {categoria && (
                      <>
                        <span className="text-ink/40">·</span>
                        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-tertiary">
                          {categoria.label}
                        </span>
                      </>
                    )}
                  </div>

                  <Link to={`/blog/${post.slug}`} className="group/link">
                    <h2 className="font-display text-lg font-semibold text-tertiary transition-colors group-hover/link:text-secondary sm:text-xl">
                      {post.titulo}
                    </h2>
                  </Link>

                  <p className="font-body text-sm leading-relaxed text-ink/80 sm:text-base">
                    {post.extracto}
                  </p>

                  {post.imagen && (
                    <Link to={`/blog/${post.slug}`} className="overflow-hidden rounded-xl">
                      <img
                        src={post.imagen}
                        alt={post.titulo}
                        className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] sm:h-64"
                      />
                    </Link>
                  )}

                  <div className="flex items-center justify-between pt-2 text-ink/60">
                    <div className="flex items-center gap-6">
                      <button className="flex items-center gap-2 transition-colors hover:text-secondary">
                        <MessageCircle size={18} />
                        <span className="text-sm">0</span>
                      </button>
                      <button className="flex items-center gap-2 transition-colors hover:text-green-600">
                        <Repeat2 size={18} />
                        <span className="text-sm">0</span>
                      </button>
                      <button className="flex items-center gap-2 transition-colors hover:text-red-500">
                        <Heart size={18} />
                        <span className="text-sm">0</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-sm">
                        <Clock size={16} />
                        {post.tiempoLectura}
                      </span>
                      <button className="transition-colors hover:text-secondary">
                        <Share2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
