/**
 * Module Dependencies Gateway
 *
 * Import Gateway ("Aduana") for: CustomCakeQuote
 * Created: 2026-10-31
 *
 * Único punto de entrada para librerías externas, componentes globales o servicios.
 * Ningún archivo en implementation/ o components/ puede importar del exterior sin pasar por aquí.
 */

export type {
  ICustomCakeQuoteProps,
  CustomCakeQuoteContract,
} from "../interfaces/ICustomCakeQuote";

// === Iconos Autorizados ===
export { CakeSlice, Sparkles } from "lucide-react";

// === Utilidades del Dominio ===
export { formatPrecio } from "@/lib/utils";
