import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatPrecio(valor: number): string {
  if (typeof valor !== "number" || Number.isNaN(valor)) {
    return "$0";
  }
  const entero = Math.round(valor);
  const esNegativo = entero < 0;
  const valorAbsoluto = Math.abs(entero).toLocaleString("es-CL");

  return esNegativo ? `-$${valorAbsoluto}` : `$${valorAbsoluto}`;
}

export function formatFechaLarga(fecha: string): string {
  if (!fecha || typeof fecha !== "string") {
    return "";
  }

  // Prevenir desfase de huso horario en fechas ISO cortas (YYYY-MM-DD) fijando mediodía
  const fechaSegura = /^\d{4}-\d{2}-\d{2}$/.test(fecha.trim())
    ? `${fecha.trim()}T12:00:00`
    : fecha;

  const date = new Date(fechaSegura);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
