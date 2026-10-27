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
      pill: "h-7 w-7 rounded-full bg-primary text-lg font-bold leading-none text-tertiary hover:bg-secondary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:hover:text-tertiary",
      compact:
        "h-6 w-6 rounded border border-tertiary/20 text-secondary hover:border-primary hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-tertiary/20 disabled:hover:bg-transparent",
    },
  },
  defaultVariants: {
    variant: "pill",
  },
});

interface CantidadStepperProps extends VariantProps<typeof stepperVariants> {
  valor: number;
  onCambiar: (nuevo: number) => void;
  min?: number;
  max?: number;
  editable?: boolean;
  className?: string;
}

export function CantidadStepper({
  valor,
  onCambiar,
  min,
  max,
  editable,
  variant = "pill",
  className,
}: CantidadStepperProps) {
  const compacto = variant === "compact";
  const limiteMin = min !== undefined ? min : undefined;
  const noPuedeRestar = limiteMin !== undefined && valor <= limiteMin;
  const noPuedeSumar = max !== undefined && valor >= max;

  const handleRestar = () => {
    if (noPuedeRestar) return;
    onCambiar(valor - 1);
  };

  const handleSumar = () => {
    if (noPuedeSumar) return;
    onCambiar(valor + 1);
  };

  return (
    <div className={cn(stepperVariants({ variant }), className)}>
      <button
        type="button"
        aria-label="Quitar uno"
        disabled={noPuedeRestar}
        onClick={handleRestar}
        className={buttonVariants({ variant })}
      >
        {compacto ? <Minus size={14} /> : "−"}
      </button>

      {editable ? (
        <input
          type="number"
          min={limiteMin ?? 1}
          max={max}
          value={valor}
          aria-label="Cantidad"
          onChange={(e) => {
            const raw = Number(e.target.value);
            if (Number.isNaN(raw)) return;
            const piso = limiteMin ?? 1;
            let val = Math.max(piso, raw);
            if (max !== undefined) {
              val = Math.min(max, val);
            }
            onCambiar(val);
          }}
          className="w-9 border-none bg-transparent text-center font-body font-bold text-ink outline-none"
        />
      ) : (
        <span className="min-w-4 text-center font-body font-semibold">{valor}</span>
      )}

      <button
        type="button"
        aria-label="Agregar uno"
        disabled={noPuedeSumar}
        onClick={handleSumar}
        className={buttonVariants({ variant })}
      >
        {compacto ? <Plus size={14} /> : "+"}
      </button>
    </div>
  );
}
