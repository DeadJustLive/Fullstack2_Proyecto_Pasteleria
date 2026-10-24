// Selector de cantidad +/-. Variante pill (carrito) y compact (POS).
import { Minus, Plus } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const stepperVariants = cva("flex items-center", {
  variants: {
    variant: {
      pill: "gap-1 rounded-full border border-tertiary/30 bg-neutral p-1",
      compact: "gap-2",
    },
  },
  defaultVariants: {
    variant: "pill",
  },
});

const buttonVariants = cva("flex items-center justify-center transition-colors", {
  variants: {
    variant: {
      pill: "h-7 w-7 rounded-full bg-primary text-lg font-bold leading-none text-tertiary hover:bg-secondary hover:text-white",
      compact:
        "h-6 w-6 rounded border border-tertiary/20 text-secondary hover:border-primary hover:bg-primary/20",
    },
  },
  defaultVariants: {
    variant: "pill",
  },
});

interface CantidadStepperProps extends VariantProps<typeof stepperVariants> {
  valor: number;
  onCambiar: (nuevo: number) => void;
  editable?: boolean;
  className?: string;
}

export function CantidadStepper({
  valor,
  onCambiar,
  editable,
  variant = "pill",
  className,
}: CantidadStepperProps) {
  const compacto = variant === "compact";

  return (
    <div className={cn(stepperVariants({ variant }), className)}>
      <button
        type="button"
        aria-label="Quitar uno"
        onClick={() => onCambiar(valor - 1)}
        className={buttonVariants({ variant })}
      >
        {compacto ? <Minus size={14} /> : "−"}
      </button>

      {editable ? (
        <input
          type="number"
          min={1}
          value={valor}
          aria-label="Cantidad"
          onChange={(e) => onCambiar(Number(e.target.value) || 1)}
          className="w-9 border-none bg-transparent p-0 text-center font-body font-bold text-ink outline-none"
        />
      ) : (
        <span className="min-w-4 text-center font-body font-semibold">{valor}</span>
      )}

      <button
        type="button"
        aria-label="Agregar uno"
        onClick={() => onCambiar(valor + 1)}
        className={buttonVariants({ variant })}
      >
        {compacto ? <Plus size={14} /> : "+"}
      </button>
    </div>
  );
}
