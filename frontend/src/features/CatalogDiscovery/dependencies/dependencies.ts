// @pca:start
// @id(feature.catalogdiscovery.dependencies)
// @kind(dependencies)
// @limit(lines: 120)
// @contract(gateway: external imports and adapters for CatalogDiscovery)
// @relates(feature.catalogdiscovery.interface)
// @desc(Aduana de importaciones externas y adaptadores del módulo CatalogDiscovery)
// @pca:end

/**
 * FIDA - Dependencies Layer (D)
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
