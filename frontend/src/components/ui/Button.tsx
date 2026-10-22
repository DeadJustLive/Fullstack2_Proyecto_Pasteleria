// @pca:start
// @id(frontend.ui.button)
// @kind(component)
// @limit(lines: 50)
// @contract(props: variant, size, type, disabled + ButtonHTMLAttributes)
// @relates(frontend.ui.buttonVariants)
// @relates(docs.reglas_ui)
// @desc(Boton del design system (pildora, variantes CVA))
// @pca:end
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { buttonVariants, type ButtonVariantProps } from "@/components/ui/buttonVariants";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
