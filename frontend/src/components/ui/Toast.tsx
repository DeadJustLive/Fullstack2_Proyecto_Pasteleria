import { useEffect, useRef } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const toastVariants = cva(
  "flex items-start gap-3 rounded border p-4 shadow-lg",
  {
    variants: {
      tono: {
        success: "border-[#155724]/20 bg-[#d4edda] text-[#155724]",
        error: "border-error/20 bg-[#f8d7da] text-[#d9534f]",
        info: "border-[#004085]/20 bg-[#cce5ff] text-[#004085]",
      },
    },
    defaultVariants: {
      tono: "success",
    },
  }
);

const ICONOS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
} as const;

export type ToastTono = NonNullable<VariantProps<typeof toastVariants>["tono"]>;

interface ToastProps {
  mensaje: string | null;
  tono?: ToastTono;
  onCerrar: () => void;
  duracion?: number;
}

export function Toast({
  mensaje,
  tono = "success",
  onCerrar,
  duracion = 3000,
}: ToastProps) {
  const cerrarRef = useRef(onCerrar);
  const tonoFinal = tono ?? "success";
  const Icono = ICONOS[tonoFinal];

  useEffect(() => {
    cerrarRef.current = onCerrar;
  }, [onCerrar]);

  useEffect(() => {
    if (!mensaje) return;
    const temporizador = setTimeout(() => cerrarRef.current(), duracion);
    return () => clearTimeout(temporizador);
  }, [mensaje, duracion]);

  if (!mensaje) return null;

  return (
    <div
      role={tonoFinal === "error" ? "alert" : "status"}
      aria-atomic="true"
      className="fixed bottom-4 right-4 z-[60] w-[calc(100%_-_2rem)] max-w-sm"
    >
      <div className={cn(toastVariants({ tono: tonoFinal }))}>
        <Icono size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p className="min-w-0 flex-1 font-body text-sm font-semibold">{mensaje}</p>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar aviso"
          className="shrink-0 opacity-70 transition-opacity hover:opacity-100"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
