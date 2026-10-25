import { Link } from "react-router-dom";
import { Calendar, Clock, User } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, formatFechaLarga } from "@/lib/utils";
import { BLOG_CATEGORIAS } from "@/data/blog";
import type { BlogPost } from "@/types/blog";

const blogCardVariants = cva(
  "group overflow-hidden rounded-lg bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
  {
    variants: {
      variant: {
        default: "",
        featured: "lg:grid lg:grid-cols-[1.2fr_1fr]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const blogImageVariants = cva(
  "h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105",
  {
    variants: {
      variant: {
        default: "",
        featured: "lg:h-full",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const blogTitleVariants = cva(
  "font-display text-xl font-semibold text-tertiary transition-colors group-hover/link:text-secondary",
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

  return (
    <article className={cn(blogCardVariants({ variant }), className)}>
      <Link to={`/blog/${post.slug}`} className="relative block overflow-hidden">
        <img
          src={post.imagen}
          alt={post.titulo}
          className={blogImageVariants({ variant })}
        />
        {categoria && (
          <span className="absolute left-4 top-4 rounded-full bg-primary/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-tertiary">
            {categoria.label}
          </span>
        )}
      </Link>

      <div className="flex flex-col gap-4 p-6">
        <Link to={`/blog/${post.slug}`} className="group/link">
          <h2 className={blogTitleVariants({ variant })}>{post.titulo}</h2>
        </Link>
        <p className="line-clamp-3 font-body text-sm text-ink/80">{post.extracto}</p>
        <div className="mt-auto flex flex-wrap items-center gap-4 text-xs text-ink/70">
          <span className="flex items-center gap-1.5">
            <User size={14} />
            {post.autor}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {formatFechaLarga(post.fecha)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} />
            {post.tiempoLectura}
          </span>
        </div>
        <Link
          to={`/blog/${post.slug}`}
          className="font-body text-sm font-semibold text-secondary transition-colors hover:text-tertiary"
        >
          Leer más →
        </Link>
      </div>
    </article>
  );
}
