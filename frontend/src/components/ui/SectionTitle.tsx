import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const sectionTitleVariants = cva("", {
  variants: {
    align: { center: "text-center", left: "text-left" },
    spacing: { default: "mb-7", compact: "mb-4", spacious: "mb-10" },
  },
  defaultVariants: { align: "center", spacing: "default" },
});

export interface SectionTitleProps
  extends VariantProps<typeof sectionTitleVariants> {
  eyebrow?: string;
  titulo: string;
  className?: string;
}

export function SectionTitle({
  eyebrow,
  titulo,
  align,
  spacing,
  className,
}: SectionTitleProps) {
  return (
    <div className={cn(sectionTitleVariants({ align, spacing }), className)}>
      {eyebrow && (
        <span className="mb-[0.35rem] block text-[0.78rem] font-bold uppercase tracking-[0.08em] text-secondary">
          {eyebrow}
        </span>
      )}
      <h2>{titulo}</h2>
    </div>
  );
}
