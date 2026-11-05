import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, Calendar, Check, Clock, Heart, MessageCircle, Share2, User } from "lucide-react";
import { BlogCard } from "@/components/domain/BlogCard";
import { CommentSection } from "@/components/domain/CommentSection";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { blogPosts, BLOG_CATEGORIAS } from "@/data/blog";
import { useSocialEngagement } from "@/hooks/useSocialEngagement";
import { cn, formatFechaLarga } from "@/lib/utils";
import type { BlogPost, BlogCategoria } from "@/types/blog";

export function BlogDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [post, setPost] = useState<BlogPost | null>(() => blogPosts.find((p) => p.slug === slug) || null);
  const [cargando, setCargando] = useState(true);
  const [copiado, setCopiado] = useState(false);

  const targetKey = `blog:${slug || post?.slug || "default"}`;
  const { liked, saved, likesCount, savesCount, commentsCount, toggleLike, toggleSave } =
    useSocialEngagement(targetKey);

  useEffect(() => {
    let montado = true;
    async function cargarArticulo() {
      if (!slug) return;
      setCargando(true);
      try {
        const apiBase = import.meta.env.VITE_API_URL || "/api";
        const res = await fetch(`${apiBase}/catalog/blogs/slug/${slug}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const b = await res.json();
        if (montado && b && b.slug) {
          let cat: BlogCategoria = "recetas";
          if (b.categoria === "tips" || b.categoria === "consejos") cat = "tips";
          else if (b.categoria === "novedades") cat = "novedades";
          else if (b.categoria === "historia") cat = "historia";

          setPost({
            id: Number(b.id) || 0,
            slug: b.slug,
            titulo: b.titulo || "Artículo",
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
          });
        }
      } catch {
        if (montado) setPost(blogPosts.find((p) => p.slug === slug) || null);
      } finally {
        if (montado) setCargando(false);
      }
    }
    void cargarArticulo();
    return () => { montado = false; };
  }, [slug]);

  useEffect(() => {
    if (location.hash === "#comentarios" && post) {
      const el = document.getElementById("comentarios");
      if (el && typeof el.scrollIntoView === "function") el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash, post]);

  const compartir = async () => {
    try { await navigator.clipboard.writeText(window.location.href); } catch { /* ignore */ }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  if (!post && !cargando) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <h1 className="text-tertiary">Artículo no encontrado</h1>
        <p className="font-body text-ink/70">El artículo que buscas no existe o fue removido.</p>
        <ButtonLink to="/blog">Volver al blog</ButtonLink>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-10 animate-pulse">
        <div className="h-6 w-32 rounded bg-neutral/80" />
        <div className="h-10 w-3/4 rounded bg-neutral/80" />
        <div className="h-64 w-full rounded-xl bg-neutral/80" />
      </div>
    );
  }

  const relacionados = blogPosts.filter((p) => p.id !== post.id).slice(0, 2);
  const categoria = BLOG_CATEGORIAS.find((c) => c.value === post.categoria);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 pb-12">
      <Card className="overflow-hidden p-0">
        <div className="relative h-64 w-full overflow-hidden sm:h-80 lg:h-96">
          <img
            src={post.imagen}
            alt={post.titulo}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/imagen/torta.jpg"; }}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent" />
          <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-1.5 font-body text-xs font-bold text-tertiary shadow-sm backdrop-blur-xs transition-colors hover:bg-primary"
            >
              <ArrowLeft size={15} /> Volver al blog
            </Link>
          </div>

          <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-3 p-5 text-neutral sm:p-8">
            {categoria && (
              <span className="w-fit rounded-full bg-primary px-3 py-1 font-body text-xs font-bold uppercase tracking-wider text-tertiary">
                {categoria.label}
              </span>
            )}
            <h1 className="font-display text-2xl font-bold text-neutral sm:text-4xl">{post.titulo}</h1>
            <div className="flex flex-wrap items-center gap-4 font-body text-xs text-neutral/85 sm:text-sm">
              <span className="flex items-center gap-1.5 font-semibold text-primary"><User size={15} /> {post.autor}</span>
              <span className="flex items-center gap-1.5"><Calendar size={15} /> {formatFechaLarga(post.fecha)}</span>
              <span className="flex items-center gap-1.5"><Clock size={15} /> {post.tiempoLectura} de lectura</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-5 sm:p-8 lg:p-10">
          <p className="rounded-xl border-l-4 border-secondary bg-neutral/60 p-4 font-body text-base font-medium italic text-tertiary">
            {post.extracto}
          </p>

          <div className="flex flex-col gap-4">
            {post.contenido.map((parrafo, idx) => {
              const lineas = parrafo.split("\n");
              return lineas.length > 1 ? (
                <div key={idx} className="flex flex-col gap-1.5 rounded-xl border border-tertiary/10 bg-neutral/30 p-4 sm:p-5">
                  <h3 className="font-display text-base font-bold text-secondary sm:text-lg">{lineas[0]}</h3>
                  <p className="font-body text-sm leading-relaxed text-ink/90 sm:text-base">{lineas.slice(1).join("\n")}</p>
                </div>
              ) : (
                <p key={idx} className="whitespace-pre-line font-body text-base leading-relaxed text-ink/90">{parrafo}</p>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-tertiary/10 bg-neutral/50 p-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={toggleLike}
                aria-pressed={liked}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 font-body text-xs font-bold transition-all sm:text-sm",
                  liked ? "border-red-300 bg-red-50 text-red-600 shadow-2xs" : "border-tertiary/15 bg-white text-tertiary hover:border-red-200 hover:text-red-500"
                )}
              >
                <Heart size={16} className={cn(liked && "fill-current")} />
                <span>Me gusta ({likesCount})</span>
              </button>

              <button
                type="button"
                onClick={toggleSave}
                aria-pressed={saved}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 font-body text-xs font-bold transition-all sm:text-sm",
                  saved ? "border-secondary bg-primary/40 text-tertiary shadow-2xs" : "border-tertiary/15 bg-white text-tertiary hover:border-secondary"
                )}
              >
                <Bookmark size={16} className={cn(saved && "fill-current")} />
                <span>{saved ? "Guardado" : "Guardar"} ({savesCount})</span>
              </button>

              <a
                href="#comentarios"
                className="inline-flex items-center gap-2 rounded-full border border-tertiary/15 bg-white px-4 py-2 font-body text-xs font-bold text-tertiary transition-colors hover:border-secondary sm:text-sm"
              >
                <MessageCircle size={16} />
                <span>Comentarios ({commentsCount})</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => void compartir()}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-tertiary/15 bg-white px-4 py-2 font-body text-xs font-bold text-secondary transition-colors hover:bg-primary/30 sm:text-sm"
            >
              {copiado ? <Check size={16} className="text-green-700" /> : <Share2 size={16} />}
              <span>{copiado ? "¡Enlace copiado!" : "Compartir"}</span>
            </button>
          </div>
        </div>
      </Card>

      <div id="comentarios" className="scroll-mt-24">
        <CommentSection targetKey={targetKey} />
      </div>

      {relacionados.length > 0 && (
        <section className="flex flex-col gap-5">
          <h2 className="text-left font-display text-2xl font-bold text-tertiary">Más artículos de nuestro obrador</h2>
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
