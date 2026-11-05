/**
 * Module Dependencies Gateway
 *
 * Import Gateway ("Aduana") for: CatalogDiscovery
 * Created: 2026-10-31
 *
 * Único punto de entrada para librerías externas, componentes globales o servicios.
 * Ningún archivo en implementation/ o components/ puede importar del exterior sin pasar por aquí.
 */

export type {
  ICatalogDiscoveryProps,
  CatalogDiscoveryContract,
} from "../interfaces/ICatalogDiscovery";

// === Iconos Autorizados ===
export { Sparkles, FilterX } from "lucide-react";
