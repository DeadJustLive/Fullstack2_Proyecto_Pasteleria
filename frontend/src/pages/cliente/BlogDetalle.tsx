// @pca:start
// @id(frontend.pages.cliente.blogDetalle)
// @kind(page)
// @limit(lines: 150)
// @contract(BlogDetalleView())
// @relates(docs.reglas_ui)
// @desc(Vista de lectura individual de un articulo del blog)
// @pca:end
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { BlogCard } from "@/components/domain/BlogCard";
import { blogPosts, BLOG_CATEGORIAS } from "@/data/blog";
import { formatFechaLarga } from "@/lib/utils";

export function BlogDetalle() {
  const { slug } = useParams<{ slug: string }>();

  const post = useMemo(() => blogPosts.find((p) => p.slug === slug), [slug]);
  const relacionados = useMemo(() => {
    if (!post) return [];
    return blogPosts
      .filter((p) => p.id !== post.id && p.categoria === post.categoria)
      .slice(0, 2);
  }, [post]);

  const categoria = post ? BLOG_CATEGORIAS.find((c) => c.value === post.categoria) : null;

  if (!post) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <h1 className="text-tertiary">Artículo no encontrado</h1>
        <p className="font-body text-ink/70">
          El artículo que buscas no existe o fue removido.
        </p>
        <ButtonLink to="/blog">
          Volver al blog
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <div className="flex flex-col gap-4">
          <Link
            to="/blog"
            className="flex items-center gap-2 font-body text-sm text-secondary transition-colors hover:text-tertiary"
          >
            <ArrowLeft size={16} />
            Volver al blog
          </Link>
          {categoria && (
            <span className="w-fit rounded-full bg-primary/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-tertiary">
              {categoria.label}
            </span>
          )}
          <h1 className="text-tertiary">{post.titulo}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-ink/70">
            <span className="flex items-center gap-1.5">
              <User size={16} />
              {post.autor}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={16} />
              {formatFechaLarga(post.fecha)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={16} />
              {post.tiempoLectura} de lectura
            </span>
          </div>
        </div>

        <img
          src={post.imagen}
          alt={post.titulo}
          className="h-64 w-full rounded-lg object-cover sm:h-80 lg:h-96"
        />

        <div className="flex flex-col gap-6">
          {post.contenido.map((parrafo, idx) => (
            <p key={idx} className="whitespace-pre-line font-body text-base leading-relaxed text-ink/90">
              {parrafo}
            </p>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-tertiary/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-sm text-ink/70">
            ¿Te gustó este artículo? Descubre más en nuestro blog.
          </p>
          <ButtonLink to="/blog" variant="outline">
            Volver al feed
          </ButtonLink>
        </div>
      </article>

      {relacionados.length > 0 && (
        <section className="flex flex-col gap-6">
          <h2 className="text-center text-tertiary">Artículos relacionados</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {relacionados.map((rel) => (
              <BlogCard key={rel.id} post={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
