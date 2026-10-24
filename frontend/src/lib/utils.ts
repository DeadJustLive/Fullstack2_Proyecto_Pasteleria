import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrecio(valor: number) {
  return `$${valor.toLocaleString("es-CL")}`;
}

export function formatFecha(valor: string | Date, estilo: "corto" | "largo" = "corto") {
  return new Date(valor).toLocaleDateString("es-CL", {
    day: "numeric",
    month: estilo === "largo" ? "long" : "short",
    year: "numeric",
  });
}

export function formatHora(valor: string | Date) {
  return new Date(valor).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
