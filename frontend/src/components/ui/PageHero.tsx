import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const heroVariants = cva("mb-6 transition-all", {
  variants: {
    variant: {
      banner:
        "overflow-hidden rounded-2xl bg-gradient-to-r from-tertiary via-ink to-secondary p-6 text-neutral shadow-md sm:p-10",
      minimal: "",
    },
    align: {
      left: "text-left",
      center: "mb-7 text-center",
    },
  },
  defaultVariants: {
    variant: "banner",
    align: "left",
  },
});

export interface PageHeroProps extends VariantProps<typeof heroVariants> {
  eyebrow?: string;
  titulo: string;
  descripcion?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHero({
  eyebrow,
  titulo,
  descripcion,
  icon,
  actions,
  variant = "banner",
  align,
  className,
}: PageHeroProps) {
  const esBanner = variant === "banner";

  return (
    <section className={cn(heroVariants({ variant, align }), className)}>
      <div
        className={cn(
          "flex flex-col gap-4",
          actions && align !== "center" && "sm:flex-row sm:items-end sm:justify-between"
        )}
      >
        <div className={cn("flex flex-col", align === "center" && "mx-auto max-w-2xl items-center")}>
          {eyebrow && (
            <span
              className={cn(
                "mb-2 inline-flex w-fit items-center gap-1.5 font-body text-xs font-bold uppercase tracking-widest",
                esBanner
                  ? "rounded-full bg-primary/20 px-3 py-1 text-primary backdrop-blur-xs"
                  : "text-secondary"
              )}
            >
              {icon}
              {eyebrow}
            </span>
          )}
          <h1
            className={cn(
              "font-display font-bold",
              esBanner ? "text-2xl text-neutral sm:text-4xl" : "text-tertiary"
            )}
          >
            {titulo}
          </h1>
          {descripcion && (
            <p
              className={cn(
                "mt-2 max-w-[62ch] font-body text-sm sm:text-base",
                esBanner ? "text-neutral/85" : "text-ink/80"
              )}
            >
              {descripcion}
            </p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </section>
  );
}
