// @use(kind, props, limit)
// @kind(component)
// @props({ properties: Property[] })
// @limit(lines: 40, functions: 1)
import { Property } from '../../lib/types';
import { PropertyCard } from './PropertyCard';

interface PropertyGridProps {
  properties: Property[];
}

export function PropertyGrid({ properties }: PropertyGridProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
          />
        ))}
      </div>

      {properties.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500 text-lg">
            No se encontraron propiedades con los filtros seleccionados.
          </p>
        </div>
      )}
    </div>
  );
}
