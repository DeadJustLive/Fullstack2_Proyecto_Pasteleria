// @pca:start
// @id(feature.catalogdiscovery.interface)
// @kind(interface)
// @limit(lines: 150)
// @contract(ICatalogDiscoveryProps, CatalogDiscoveryContract)
// @desc(Contrato público de datos y eventos para el módulo FIDA CatalogDiscovery)
// @pca:end

/**
 * FIDA - Interface Layer (I)
 *
 * Contract for: CatalogDiscovery
 * Created: 2026-10-31
 *
 * Define estrictamente qué datos entran (Props) y qué eventos salen (Events).
 * ⚠️ Nivel de Impacto FIDA: ALTO (+60 pts) — Cambios aquí disparan el WAL documental.
 */

export interface ICatalogDiscoveryProps {
  totalProducts: number;
  activeCategory?: string;
  searchQuery?: string;
  onClearFilters?: () => void;
}

export type CatalogDiscoveryContract = ICatalogDiscoveryProps;
