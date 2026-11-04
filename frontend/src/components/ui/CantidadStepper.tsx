// @pca:start
// @id(frontend.components.ui.cantidadstepper)
// @kind(component)
// @limit(lines: 200)
// @contract(CantidadStepper)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (CantidadStepper.tsx))
// @pca:end
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
      pill: "h-7 w-7 rounded-full bg-primary text-tertiary hover:bg-secondary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:hover:text-tertiary",
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
        <Minus size={14} strokeWidth={2.5} />
      </button>

      {editable ? (
        <input
          type="number"
          min={limiteMin ?? 1}
          max={max}
          value={valor}
          aria-label="Cantidad"
          data-no-spinner="true"
          onChange={(e) => {
            const valStr = e.target.value;
            if (valStr === "") return;
            const raw = Number(valStr);
            if (Number.isNaN(raw)) return;
            const piso = limiteMin ?? 1;
            let val = Math.max(piso, raw);
            if (max !== undefined) {
              val = Math.min(max, val);
            }
            onCambiar(val);
          }}
          onBlur={(e) => {
            const raw = Number(e.target.value);
            if (!e.target.value || Number.isNaN(raw) || raw < (limiteMin ?? 1)) {
              onCambiar(limiteMin ?? 1);
            }
          }}
          className="no-spinner w-10 border-none bg-transparent p-0 text-center font-body font-bold text-ink outline-none focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
        />
      ) : (
        <span className="min-w-6 text-center font-body font-semibold">{valor}</span>
      )}

      <button
        type="button"
        aria-label="Agregar uno"
        disabled={noPuedeSumar}
        onClick={handleSumar}
        className={buttonVariants({ variant })}
      >
        <Plus size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}
