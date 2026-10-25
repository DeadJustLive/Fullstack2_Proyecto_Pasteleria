// @pca:start
// @id(frontend.ui.input)
// @kind(component)
// @limit(lines: 80)
// @contract(props: InputHTMLAttributes + InputProps)
// @relates(docs.reglas_ui)
// @desc(Campo de entrada de texto accesible con estados default, error y success)
// @pca:end
import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "w-full rounded-lg border bg-white font-body text-ink outline-none transition-colors placeholder:text-ink/40 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      state: {
        default: "border-tertiary/30 focus:border-primary focus:ring-primary/30",
        error: "border-error focus:border-error focus:ring-error/20",
        success:
          "border-green-500 focus:border-green-500 focus:ring-green-500/20",
      },
      inputSize: {
        sm: "h-9 px-3 text-sm",
        default: "px-4 py-2 text-base",
        lg: "h-12 px-4 text-lg",
      },
    },
    defaultVariants: {
      state: "default",
      inputSize: "default",
    },
  }
);

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, id, label, hint, error, state, inputSize, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const effectiveState = error ? "error" : state;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="font-body text-sm font-semibold text-tertiary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(inputVariants({ state: effectiveState, inputSize }), className)}
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

Input.displayName = "Input";
