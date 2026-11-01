// @pca:start
// @id(feature.catalogdiscovery.filterPill)
// @kind(component)
// @limit(lines: 200)
// @contract(CatalogFilterPill)
// @relates(feature.catalogdiscovery.dependencies)
// @desc(Subcomponente privado de píldora de filtro activo y botón de limpieza para CatalogDiscovery)
// @pca:end

import { FilterX } from "../dependencies/dependencies";

interface CatalogFilterPillProps {
  label: string;
  onClear?: () => void;
}

export function CatalogFilterPill({ label, onClear }: CatalogFilterPillProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/15 px-3 py-1 font-body text-xs font-semibold text-secondary">
      <span>{label}</span>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Limpiar filtros"
          className="inline-flex items-center gap-1 rounded-full bg-white/80 px-1.5 py-0.5 text-[11px] font-bold text-tertiary transition-colors hover:bg-secondary hover:text-white"
        >
          <FilterX size={12} />
          Limpiar
        </button>
      )}
    </span>
  );
}
