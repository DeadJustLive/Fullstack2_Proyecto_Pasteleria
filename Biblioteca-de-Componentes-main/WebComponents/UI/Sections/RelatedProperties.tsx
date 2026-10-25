// @use(kind, props, limit, deps)
// @kind(component)
// @limit(lines: 150)
// @props({ properties: Property[], onNavigate: (id: string) => void })
// @deps(@internal: [StatusBadge, PriceDisplay, BADGE_VARIANT_MAP], @external: [lucide-react, embla-carousel-react])

import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import useEmblaCarousel from 'embla-carousel-react';
import { useState, useCallback, useEffect } from 'react';
import { Property } from '../../lib/types';
import { StatusBadge } from '../ui/StatusBadge';
import { PriceDisplay } from '../ui/PriceDisplay';
import { BrandButton } from '../ui/BrandButton';
import { BADGE_VARIANT_MAP } from '../../lib/constants';

interface RelatedPropertiesProps {
  properties: Property[];
}

export function RelatedProperties({ properties }: RelatedPropertiesProps) {
  const navigate = useNavigate();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start', dragFree: true });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  if (properties.length === 0) return null;

  const handleNavigate = (id: string) => {
    window.scrollTo(0, 0);
    navigate(`/catalog/${id}`);
  };

  return (
    <section className="container mx-auto px-4 max-w-7xl py-12 md:py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900">
            Otras propiedades que <span className="text-brand-cyan">te pueden interesar</span>
          </h2>
        </div>
        
        {/* Flechas superiores Desktop */}
        {properties.length > 3 && (
          <div className="hidden md:flex gap-2">
            <button 
              onClick={scrollPrev} 
              disabled={!canScrollPrev}
              aria-label="Anterior"
              className="p-2 rounded-full shadow-md transition-all text-slate-700 bg-white hover:bg-brand-cyan hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-700 border border-slate-100"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button 
              onClick={scrollNext} 
              disabled={!canScrollNext}
              aria-label="Siguiente"
              className="p-2 rounded-full shadow-md transition-all text-slate-700 bg-white hover:bg-brand-cyan hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-700 border border-slate-100"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        )}
      </div>

      <div className="relative group/carousel">
        {/* Viewport de Embla */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y" style={{ marginLeft: '-1rem' }}>
            {properties.map(p => (
              <div key={p.id} className="relative min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-4">
                <div 
                  className="relative overflow-hidden rounded-[2rem] h-[300px] md:h-[340px] cursor-pointer group transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 shadow-black/10 border border-slate-200 hover:border-brand-cyan/50 select-none"
                  onClick={() => handleNavigate(p.id)}
                >
                  <img
                    src={p.image}
                    alt={p.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    loading="lazy"
                    draggable={false}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/30 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />
                  
                  <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
                    <StatusBadge
                      variant={BADGE_VARIANT_MAP[p.status] ?? 'buy'}
                      label={p.status === 'Alquiler' ? 'Arriendo' : p.status}
                      className="shadow-lg"
                    />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 flex flex-col justify-end gap-3">
                    <div>
                      <h3 className="text-xl font-black text-white mb-1 leading-tight tracking-tight group-hover:text-brand-cyan transition-colors line-clamp-1">
                        {p.title}
                      </h3>
                      <p className="text-slate-300 text-sm flex items-center gap-1">
                        <MapPin className="size-4 text-brand-cyan shrink-0" />
                        <span className="truncate">{p.location}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/20 pt-3">
                      <PriceDisplay
                        price={p.price}
                        status={p.status}
                        priceLabel={p.price_label}
                        variant="sm"
                        className="!mb-0 [&_div]:text-white [&_div]:text-lg [&_div]:md:text-xl [&_div]:font-black"
                      />
                      <BrandButton
                        variant="primary"
                        size="sm"
                        className="px-4 py-1.5 shadow-lg shadow-brand-cyan/20 group-hover:bg-white group-hover:text-brand-dark transition-colors text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigate(p.id);
                        }}
                      >
                        Ver más
                      </BrandButton>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}