// @pca:start
// @id(frontend.ui.sectionTitle)
// @kind(component)
// @limit(lines: 40)
// @contract(props: eyebrow?, titulo, className?)
// @relates(docs.reglas_ui)
// @desc(Encabezado de seccion con eyebrow y titulo centrados)
// @pca:end
import { cn } from "@/lib/utils";

export interface SectionTitleProps {
  eyebrow?: string;
  titulo: string;
  className?: string;
}

export function SectionTitle({ eyebrow, titulo, className }: SectionTitleProps) {
  return (
    <div className={cn("mb-7 text-center", className)}>
      {eyebrow && (
        <span className="mb-[0.35rem] block text-[0.78rem] font-bold uppercase tracking-[0.08em] text-secondary">
          {eyebrow}
        </span>
      )}
      <h2>{titulo}</h2>
    </div>
  );
}
