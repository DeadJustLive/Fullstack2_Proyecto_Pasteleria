// Encabezado de pagina: eyebrow opcional + titulo + descripcion.
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const heroVariants = cva("", {
  variants: {
    align: {
      left: "text-left",
      center: "mb-7 text-center",
    },
  },
  defaultVariants: {
    align: "left",
  },
});

interface PageHeroProps extends VariantProps<typeof heroVariants> {
  eyebrow?: string;
  titulo: string;
  descripcion?: string;
  className?: string;
}

export function PageHero({ eyebrow, titulo, descripcion, align, className }: PageHeroProps) {
  return (
    <section className={cn(heroVariants({ align }), className)}>
      {eyebrow && (
        <span className="mb-[0.35rem] block font-body text-sm font-bold uppercase tracking-widest text-secondary">
          {eyebrow}
        </span>
      )}
      <h1>{titulo}</h1>
      {descripcion && (
        <p className="mt-3 max-w-[60ch] font-body text-ink/80">{descripcion}</p>
      )}
    </section>
  );
}
