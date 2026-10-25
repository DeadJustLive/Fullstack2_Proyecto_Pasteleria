import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { PropertyFilters, FilterState } from '../components/catalog/PropertyFilters';
import { PropertyGrid } from '../components/catalog/PropertyGrid';
import { Property } from '../lib/types';
import { api } from '../services/api';
import { SearchX } from 'lucide-react';
import { PageTransition } from '../components/layout/PageTransition';
import { useNavigate } from 'react-router';
import { m } from 'motion/react';
import { BrandButton } from '../components/ui/BrandButton';
import { PropertyCardSkeleton } from '../components/ui/skeletons/PropertyCardSkeleton';
import { FeaturedPropertiesCarousel } from '../components/catalog/FeaturedPropertiesCarousel';
import { SEO } from '../components/ui/SEO';

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function CatalogView() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState<FilterState>({
    bedrooms: 'any',
    bathrooms: 'any',
    type: 'any',
    status: 'Todos',
    sort: 'default'
  });
  const [displayCount, setDisplayCount] = useState(30);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const data = await api.properties.getAll();
        setProperties(data);
      } catch (error) {
        console.error("Error cargando propiedades:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const navigate = useNavigate();
  const featuredProperties = useMemo(() => {
    if (properties.length === 0) return [];
    
    // Prioridad 1: Mostrar las propiedades marcadas explícitamente como destacadas
    const explicitFeatured = properties.filter(p => p.featured);
    if (explicitFeatured.length > 0) {
      return explicitFeatured;
    }
    
    // Prioridad 2: Fallback (Predeterminado) -> Mostrar 5 propiedades al azar si nadie configuró destacadas aún
    return [...properties]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
  }, [properties]);

  const filteredProperties = useMemo(() => {
    const filtered = properties.filter(property => {
      if (filters.status !== 'Todos' && property.status !== filters.status) return false;
      if (filters.bedrooms !== 'any' && property.bedrooms < parseInt(filters.bedrooms)) return false;
      if (filters.bathrooms !== 'any' && property.bathrooms < parseInt(filters.bathrooms)) return false;
      if (filters.type !== 'any' && filters.type !== property.type) return false;
      return true;
    });

    switch (filters.sort) {
      case 'price-asc':
        return filtered.toSorted((a, b) => a.price - b.price);
      case 'price-desc':
        return filtered.toSorted((a, b) => b.price - a.price);
      case 'newest':
        return filtered.toSorted((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());
      case 'oldest':
        return filtered.toSorted((a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime());
      default:
        return filtered;
    }
  }, [filters, properties]);

  const visibleProperties = useMemo(() => {
    return filteredProperties.slice(0, displayCount);
  }, [filteredProperties, displayCount]);

  const hasMore = displayCount < filteredProperties.length;

  const loadMore = useCallback(() => {
    if (hasMore) {
      setDisplayCount(prev => prev + 30);
    }
  }, [hasMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);



  return (
    <PageTransition>
      <SEO
        title="Propiedades"
        description="Explora nuestro catálogo de propiedades en Santiago. Casas, departamentos y terrenos con asesoría personalizada."
        url="https://schmidtcorredores.cl/catalog"
      />
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="h-24 sm:h-32" />

        {/* Featured Properties Hero-Banner */}
        <FeaturedPropertiesCarousel 
          properties={featuredProperties} 
          isLoading={isLoading} 
        />

        {/* Global Filters */}
        <div className="relative z-20">
          <PropertyFilters filters={filters} onChange={setFilters} />
        </div>

        {/* Main Property Catalog */}
        <main className="flex-1 container mx-auto px-4 max-w-7xl py-12">
          {isLoading ? (
            <LoadingSkeleton />
          ) : filteredProperties.length > 0 ? (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <PropertyGrid
                properties={visibleProperties}
              />

              {hasMore && (
                <div ref={sentinelRef} className="flex justify-center py-12">
                  <div className="size-8 border-2 border-brand-cyan/30 border-t-brand-cyan rounded-full animate-spin" />
                </div>
              )}
            </m.div>
          ) : (
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm max-w-3xl mx-auto mt-10"
            >
              <SearchX className="size-20 text-slate-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No encontramos resultados exactos</h3>
              <p className="text-slate-500 text-lg mb-8">Intenta ajustar los filtros, o mejor aún, contáctanos y nosotros buscaremos la propiedad perfecta para ti.</p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <a
                  href="https://wa.me/56912345678?text=Hola%2C%20estoy%20buscando%20una%20propiedad%20con%20caracter%C3%ADsticas%20espec%C3%ADficas%20y%20no%20la%20encontr%C3%A9%20en%20el%20cat%C3%A1logo.%20%C2%BFMe%20ayudan%3F"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center font-bold px-6 py-3 rounded-xl bg-green-500 text-white hover:bg-green-600 hover:scale-105 transition-all text-center"
                >
                  Contactar por WhatsApp
                </a>
                
                <BrandButton
                  variant="subtle"
                  size="md"
                  onClick={() => setFilters(prev => ({ ...prev, type: 'any', bedrooms: 'any', bathrooms: 'any', sort: 'default', status: 'Todos' }))}
                >
                  Borrar filtros
                </BrandButton>
              </div>
            </m.div>
          )}
        </main>

      </div>
    </PageTransition>
  );
}
