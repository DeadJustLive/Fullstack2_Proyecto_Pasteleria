import type { ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";
import {
  buttonVariants,
  type ButtonVariantProps,
} from "@/components/ui/buttonVariants";
import { cn } from "@/lib/utils";

/**
 * Enlace con la apariencia del design system.
 * Reutiliza `buttonVariants` para que un link y un boton se vean iguales.
 */
export interface ButtonLinkProps
  extends Omit<LinkProps, "className">,
    ButtonVariantProps {
  className?: string;
  children: ReactNode;
}

export function ButtonLink({
  className,
  variant,
  size,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
