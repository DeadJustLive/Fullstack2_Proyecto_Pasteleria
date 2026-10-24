// Interruptor on/off accesible (role="switch").
import type { ButtonHTMLAttributes } from "react";
import { cva } from "class-variance-authority";

const pistaVariants = cva(
  "relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      activo: {
        true: "bg-secondary",
        false: "bg-tertiary/30",
      },
    },
    defaultVariants: {
      activo: false,
    },
  }
);

const perillaVariants = cva(
  "absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform",
  {
    variants: {
      activo: {
        true: "translate-x-5",
        false: "translate-x-0",
      },
    },
    defaultVariants: {
      activo: false,
    },
  }
);

interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "role"> {
  activo: boolean;
  onCambiar: (activo: boolean) => void;
}

export function Switch({ activo, onCambiar, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      onClick={() => onCambiar(!activo)}
      className={pistaVariants({ activo })}
      {...props}
    >
      <span className={perillaVariants({ activo })} />
    </button>
  );
}
