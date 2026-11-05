/**
 * Module Public Contract
 *
 * Contract for: CatalogDiscovery
 * Created: 2026-10-31
 *
 * Define estrictamente qué datos entran (Props) y qué eventos salen (Events).
 */

export interface ICatalogDiscoveryProps {
  totalProducts: number;
  activeCategory?: string;
  searchQuery?: string;
  onClearFilters?: () => void;
}

export type CatalogDiscoveryContract = ICatalogDiscoveryProps;
