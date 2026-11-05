import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, Heart, MessageSquarePlus, Send, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/auth";
import { useSocialEngagement } from "@/hooks/useSocialEngagement";
import { cn, formatFechaLarga } from "@/lib/utils";

export interface CommentSectionProps {
  targetKey: string;
  titulo?: string;
  subtitulo?: string;
  allowRating?: boolean;
  className?: string;
}

export function CommentSection({
  targetKey,
  titulo = "Comentarios de la Comunidad",
  subtitulo = "Comparte tus dudas, trucos de repostería o tu experiencia con nuestras recetas.",
  allowRating = false,
  className,
}: CommentSectionProps) {
  const { usuario, logueado } = useAuth();
  const { comments, commentsCount, averageRating, addComment, toggleCommentLike, deleteComment } =
    useSocialEngagement(targetKey);

  const [autor, setAutor] = useState(usuario?.nombre || "");
  const [texto, setTexto] = useState("");
  const [rating, setRating] = useState(5);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (usuario?.nombre) setAutor((prev) => prev || usuario.nombre);
  }, [usuario]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (texto.trim().length < 3) {
      setError("Escribe al menos 3 caracteres para publicar tu comentario.");
      return;
    }
    const ok = addComment({
      autor: autor.trim() || usuario?.nombre || "Amante de la Pastelería",
      texto,
      rating: allowRating ? rating : undefined,
      verificado: logueado,
    });
    if (ok) {
      setTexto("");
      setError(null);
    }
  };

  return (
    <Card className={cn("flex flex-col gap-6 p-5 sm:p-8", className)}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-tertiary/10 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-left font-display text-xl font-bold text-tertiary sm:text-2xl">{titulo}</h2>
            <span className="rounded-full bg-primary/40 px-3 py-0.5 font-body text-xs font-bold text-tertiary">
              {commentsCount}
            </span>
          </div>
          <p className="mt-1 font-body text-xs text-ink/70 sm:text-sm">{subtitulo}</p>
        </div>

        {allowRating && (
          <div className="flex items-center gap-2 rounded-2xl border border-tertiary/10 bg-neutral/60 px-4 py-2">
            <div className="flex items-center gap-0.5 text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={16} className={cn(star <= Math.round(averageRating) && "fill-current")} />
              ))}
            </div>
            <span className="font-display text-base font-bold text-tertiary">{averageRating.toFixed(1)}</span>
            <span className="font-body text-xs text-ink/60">({commentsCount})</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-tertiary/10 bg-neutral/40 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2 font-display text-sm font-semibold text-tertiary">
            <MessageSquarePlus size={17} className="text-secondary" />
            {allowRating ? "Deja tu valoración del producto" : "Añadir un comentario"}
          </span>

          {allowRating && (
            <div className="flex items-center gap-1" role="group" aria-label="Calificación en estrellas">
              <span className="mr-1 font-body text-xs font-semibold text-ink/70">Tu nota:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`${star} estrellas`}
                  className="cursor-pointer p-0.5 text-amber-500 transition-transform hover:scale-110"
                >
                  <Star size={18} className={cn(star <= rating && "fill-current")} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[220px_1fr]">
          <Input
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
            placeholder="Tu nombre (ej: Camila)"
            aria-label="Tu nombre"
          />
          <textarea
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              if (error) setError(null);
            }}
            rows={2}
            placeholder={
              allowRating
                ? "¿Qué te pareció el sabor, textura o presentación de este pastel?"
                : "Escribe tu comentario, pregunta o consejo pastelero..."
            }
            className="w-full rounded-xl border border-tertiary/20 bg-white px-3.5 py-2.5 font-body text-sm text-ink outline-none transition-colors focus:border-secondary focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {error && <p className="font-body text-xs font-semibold text-error">{error}</p>}

        <div className="flex items-center justify-between gap-3">
          <span className="font-body text-xs text-ink/60">
            {logueado ? `Publicando como cliente verificado (${usuario?.email})` : "Puedes comentar libremente o iniciar sesión."}
          </span>
          <Button type="submit" size="sm">
            <Send size={15} />
            Publicar
          </Button>
        </div>
      </form>

      {comments.length === 0 ? (
        <EmptyState spacing="compact" titulo="Aún no hay comentarios." descripcion="¡Sé la primera persona en compartir su opinión!" />
      ) : (
        <ul className="flex flex-col gap-3">
          {comments.map((item) => {
            const iniciales = item.autor.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
            return (
              <li key={item.id} className="flex flex-col gap-2.5 rounded-xl border border-tertiary/10 bg-white p-4 shadow-2xs transition-colors hover:border-tertiary/20">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 font-display text-xs font-bold text-tertiary">
                      {iniciales || "CC"}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-body text-sm font-bold text-tertiary">{item.autor}</span>
                        {item.verificado && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/30 px-2 py-0.5 font-body text-[10px] font-semibold text-secondary">
                            <CheckCircle2 size={11} /> Verificado
                          </span>
                        )}
                        {typeof item.rating === "number" && (
                          <span className="flex items-center gap-0.5 text-amber-500">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={12} className={cn(s <= (item.rating ?? 5) && "fill-current")} />
                            ))}
                          </span>
                        )}
                      </div>
                      <span className="font-body text-xs text-ink/55">{formatFechaLarga(item.fecha)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleCommentLike(item.id)}
                      aria-pressed={Boolean(item.likedByMe)}
                      className={cn(
                        "inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 font-body text-xs font-semibold transition-colors",
                        item.likedByMe
                          ? "border-red-200 bg-red-50 text-red-600"
                          : "border-tertiary/10 bg-neutral/40 text-ink/70 hover:border-secondary/30 hover:text-secondary"
                      )}
                    >
                      <Heart size={13} className={cn(item.likedByMe && "fill-current")} />
                      <span>{item.likes}</span>
                    </button>

                    {item.esPropio && (
                      <button
                        type="button"
                        onClick={() => deleteComment(item.id)}
                        aria-label="Eliminar mi comentario"
                        className="inline-flex cursor-pointer items-center justify-center rounded-full p-1.5 text-ink/50 transition-colors hover:bg-red-50 hover:text-error"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="pl-12 font-body text-sm leading-relaxed text-ink/85">{item.texto}</p>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
