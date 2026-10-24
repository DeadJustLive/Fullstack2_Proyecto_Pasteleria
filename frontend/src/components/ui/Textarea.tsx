// Campo de texto multilinea. Misma receta visual que Input.
import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "w-full resize-y rounded border bg-white px-4 py-2 font-body text-base text-ink outline-none transition-colors placeholder:text-ink/40 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      state: {
        default: "border-tertiary/30 focus:border-primary focus:ring-primary/30",
        error: "border-error focus:border-error focus:ring-error/20",
        success:
          "border-green-500 focus:border-green-500 focus:ring-green-500/20",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
);

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, id, label, hint, error, state, rows = 4, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const effectiveState = error ? "error" : state;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={textareaId}
            className="font-body text-sm font-semibold text-tertiary"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(textareaVariants({ state: effectiveState }), className)}
          aria-invalid={effectiveState === "error"}
          {...props}
        />
        {error ? (
          <span className="font-body text-xs text-error">{error}</span>
        ) : hint ? (
          <span className="font-body text-xs text-ink/50">{hint}</span>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
