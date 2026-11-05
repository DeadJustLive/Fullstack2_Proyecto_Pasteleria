// @pca:start
// @id(frontend.components.domain.blogcard)
// @kind(component)
// @limit(lines: 210)
// @contract(BlogCardProps, BlogCard)
// @relates(docs.reglas_ui)
// @desc(Tarjeta editorial reutilizable de articulo del blog con barra de interaccion social)
// @pca:end
import { useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Calendar, Check, Clock, Heart, MessageCircle, Share2, Sparkles, User } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, formatFechaLarga } from "@/lib/utils";
import { BLOG_CATEGORIAS } from "@/data/blog";
import { useSocialEngagement } from "@/hooks/useSocialEngagement";
import type { BlogPost } from "@/types/blog";

const blogCardVariants = cva(
  "group flex flex-col overflow-hidden rounded-2xl border border-tertiary/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-secondary/25 hover:shadow-md",
  {
    variants: {
      variant: {
        default: "",
        featured: "lg:grid lg:grid-cols-[1.15fr_1fr]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const blogImageVariants = cva(
  "h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-56",
  {
    variants: {
      variant: {
        default: "",
        featured: "lg:h-full lg:min-h-[300px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const blogTitleVariants = cva(
  "text-left font-display text-lg font-bold text-tertiary transition-colors group-hover/link:text-secondary sm:text-xl",
  {
    variants: {
      variant: {
        default: "",
        featured: "lg:text-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BlogCardProps extends VariantProps<typeof blogCardVariants> {
  post: BlogPost;
  className?: string;
}

export function BlogCard({ post, variant, className }: BlogCardProps) {
  const categoria = BLOG_CATEGORIAS.find((c) => c.value === post.categoria);
  const { liked, saved, likesCount, commentsCount, toggleLike, toggleSave } =
    useSocialEngagement(`blog:${post.slug}`);
  const [copiado, setCopiado] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/blog/${post.slug}`);
    } catch { /* ignore */ }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <article className={cn(blogCardVariants({ variant }), className)}>
      <Link to={`/blog/${post.slug}`} className="relative block overflow-hidden bg-neutral/50">
        <img
          src={post.imagen}
          alt={post.titulo}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/imagen/torta.jpg";
          }}
          className={blogImageVariants({ variant })}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
        <div className="absolute left-3.5 top-3.5 flex flex-wrap items-center gap-2">
          {categoria && (
            <span className="rounded-full bg-primary/95 px-3 py-1 font-body text-xs font-bold uppercase tracking-wider text-tertiary shadow-xs">
              {categoria.label}
            </span>
          )}
          {variant === "featured" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-tertiary/90 px-3 py-1 font-body text-xs font-semibold text-neutral backdrop-blur-xs">
              <Sparkles size={12} className="text-primary" /> Destacado
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col justify-between gap-4 p-5 sm:p-6">
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-3 font-body text-xs text-ink/65">
            <span className="flex items-center gap-1 font-semibold text-secondary">
              <User size={13} />
              {post.autor}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              {formatFechaLarga(post.fecha)}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock size={13} />
              {post.tiempoLectura}
            </span>
          </div>

          <Link to={`/blog/${post.slug}`} className="group/link">
            <h2 className={blogTitleVariants({ variant })}>{post.titulo}</h2>
          </Link>

          <p className="line-clamp-3 font-body text-sm leading-relaxed text-ink/80">
            {post.extracto}
          </p>
        </div>

        {/* Barra de interacción social viva */}
        <div className="mt-2 flex items-center justify-between border-t border-tertiary/10 pt-3.5">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleLike}
              aria-pressed={liked}
              aria-label={`Me gusta (${likesCount})`}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 font-body text-xs font-semibold transition-colors",
                liked
                  ? "border-red-200 bg-red-50 text-red-600"
                  : "border-tertiary/10 bg-neutral/50 text-ink/75 hover:border-red-200 hover:text-red-500"
              )}
            >
              <Heart size={14} className={cn(liked && "fill-current")} />
              <span>{likesCount}</span>
            </button>

            <Link
              to={`/blog/${post.slug}#comentarios`}
              aria-label={`Ver ${commentsCount} comentarios`}
              className="inline-flex items-center gap-1.5 rounded-full border border-tertiary/10 bg-neutral/50 px-2.5 py-1 font-body text-xs font-semibold text-ink/75 transition-colors hover:border-secondary/30 hover:text-secondary"
            >
              <MessageCircle size={14} />
              <span>{commentsCount}</span>
            </Link>

            <button
              type="button"
              onClick={toggleSave}
              aria-pressed={saved}
              aria-label={saved ? "Guardado en favoritos" : "Guardar receta"}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 font-body text-xs font-semibold transition-colors",
                saved
                  ? "border-secondary/30 bg-primary/35 text-secondary"
                  : "border-tertiary/10 bg-neutral/50 text-ink/75 hover:border-secondary/30 hover:text-secondary"
              )}
            >
              <Bookmark size={14} className={cn(saved && "fill-current")} />
              <span className="hidden xs:inline">{saved ? "Guardado" : "Guardar"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleShare()}
              aria-label="Copiar enlace del artículo"
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-tertiary/10 bg-neutral/40 text-ink/70 transition-colors hover:bg-primary/30 hover:text-tertiary"
            >
              {copiado ? <Check size={14} className="text-green-700" /> : <Share2 size={14} />}
            </button>
            <Link
              to={`/blog/${post.slug}`}
              className="font-body text-xs font-bold text-secondary hover:underline sm:text-sm"
            >
              Leer →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
