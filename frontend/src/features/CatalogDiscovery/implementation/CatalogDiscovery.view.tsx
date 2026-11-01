// @pca:start
// @id(feature.catalogdiscovery.view)
// @kind(view)
// @limit(lines: 300)
// @contract(CatalogDiscoveryView(props: CatalogDiscoveryContract))
// @relates(feature.catalogdiscovery.interface)
// @relates(feature.catalogdiscovery.dependencies)
// @relates(feature.catalogdiscovery.filterPill)
// @desc(Implementación visual principal del módulo FIDA CatalogDiscovery con resumen de resultados activos)
// @pca:end

import {
  Sparkles,
  type CatalogDiscoveryContract,
  type ICatalogDiscoveryProps,
} from "../dependencies/dependencies";
import { CatalogFilterPill } from "../components/CatalogFilterPill";

export function CatalogDiscoveryView(props: CatalogDiscoveryContract) {
  const {
    totalProducts,
    activeCategory,
    searchQuery,
    onClearFilters,
  }: ICatalogDiscoveryProps = props;

  const hasActiveFilter = Boolean(activeCategory || (searchQuery && searchQuery.trim() !== ""));
  const filterDescription = [
    activeCategory ? `Categoría: ${activeCategory}` : "",
    searchQuery && searchQuery.trim() !== "" ? `Búsqueda: "${searchQuery.trim()}"` : "",
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="col-span-full flex flex-wrap items-center justify-between gap-2 rounded-xl border border-tertiary/10 bg-white/95 px-4 py-2.5 shadow-xs">
      <div className="flex items-center gap-2 font-body text-xs text-tertiary">
        <Sparkles size={15} className="shrink-0 text-secondary" />
        <span>
          Mostrando <strong>{totalProducts}</strong>{" "}
          {totalProducts === 1 ? "producto artesanal" : "productos artesanales"}
        </span>
      </div>
      {hasActiveFilter && (
        <CatalogFilterPill label={filterDescription} onClear={onClearFilters} />
      )}
    </div>
  );
}
