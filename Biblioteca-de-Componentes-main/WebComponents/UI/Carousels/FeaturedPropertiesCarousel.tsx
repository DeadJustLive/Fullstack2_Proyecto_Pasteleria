import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, MapPin, Sparkles } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { Property } from '../../lib/types';
import { BrandButton } from '../ui/BrandButton';
import { PriceDisplay } from '../ui/PriceDisplay';
import { StatusBadge } from '../ui/StatusBadge';
import { FeaturedSkeleton } from '../ui/skeletons/FeaturedSkeleton';

interface FeaturedPropertiesCarouselProps {
  properties: Property[];
  isLoading: boolean;
}

export function FeaturedPropertiesCarousel({ properties, isLoading }: FeaturedPropertiesCarouselProps) {
  const navigate = useNavigate();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: false, align: 'center' });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  // Auto-play
  useEffect(() => {
    if (!emblaApi) return;
    const autoplay = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 5000);

    const onInteract = () => {
      clearInterval(autoplay);
    };

    emblaApi.on('pointerDown', onInteract);

    return () => {
      clearInterval(autoplay);
      emblaApi.off('pointerDown', onInteract);
    };
  }, [emblaApi]);

  if (isLoading) {
    return <FeaturedSkeleton />;
  }

  if (properties.length === 0) {
    return (
      <div className="relative z-0 mb-8 md:mb-12 py-6 md:py-10 overflow-hidden bg-brand-dark" role="region" aria-label="Propiedades destacadas">
        <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none bg-brand-cyan/[.12]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-extrabold text-white tracking-tight">
              Propiedades <span className="text-brand-cyan">Destacadas</span>
            </h2>
          </div>
          <div className="max-w-md mx-auto text-center py-16">
            <Sparkles className="size-12 text-slate-600 mx-auto mb-4" aria-hidden="true" />
            <p className="text-slate-500 text-lg">Próximamente nuevas propiedades destacadas</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-0 mb-6 md:mb-8 pt-6 pb-8 md:pt-8 md:pb-10 overflow-hidden bg-brand-dark" role="region" aria-label="Carrusel de propiedades destacadas">
      {/* Fondo Inmersivo Dinámico */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <AnimatePresence mode="wait">
          <m.img
            key={selectedIndex}
            src={properties[selectedIndex]?.image}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full object-cover blur-[60px] scale-[1.15]"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-brand-dark/40" />
      </div>

      <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none bg-brand-cyan/[.12]" />

      <div className="container mx-auto px-4 relative z-10">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Propiedades <span className="text-brand-cyan">Destacadas</span>
          </h2>
          <p className="text-slate-400 mt-2 text-base">Las mejores oportunidades del mercado actual</p>
        </m.div>
      </div>

      <div className="w-full relative group/carousel z-10">
        {/* Viewport de Embla */}
        <div className="overflow-hidden py-4" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {properties.map((property, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={property.id}
                  className={`relative min-w-0 flex-[0_0_100%] sm:flex-[0_0_80%] lg:flex-[0_0_55%] xl:flex-[0_0_45%] 2xl:flex-[0_0_35%] px-2 md:px-4`}
                >
                  <div
                    className={`relative overflow-hidden rounded-3xl h-[280px] md:h-[340px] lg:h-[380px] xl:h-[420px] cursor-pointer group transition-all duration-700 shadow-2xl shadow-black/40 border border-white/10 ring-1 ring-white/5 hover:ring-brand-cyan/50 select-none ${isSelected ? 'opacity-100 scale-100' : 'opacity-40 scale-[0.92] blur-[2px]'}`}
                    onClick={() => {
                      if (isSelected) {
                        navigate(`/catalog/${property.id}`);
                      }
                    }}
                  >
                    <img
                      src={property.image}
                      alt={property.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                      {...(index === 0 ? { fetchpriority: 'high' as const } : { fetchpriority: 'auto' as const })}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      draggable={false}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/95 via-brand-dark/40 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />

                    <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
                      <span className="inline-block px-3 py-1 bg-brand-cyan text-brand-dark text-[10px] uppercase font-extrabold tracking-[0.2em] rounded-full shadow-lg backdrop-blur-md">
                        Propiedad Destacada
                      </span>
                      <StatusBadge
                        variant="opportunity"
                        label="Oportunidad"
                        className="shadow-lg scale-90 md:scale-100 origin-left"
                      />
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col justify-end gap-2">
                      <div>
                        <h3 className="text-lg md:text-xl font-black text-white mb-1 leading-tight tracking-tight group-hover:text-brand-cyan transition-colors line-clamp-1">
                          {property.title}
                        </h3>
                        <p className="text-slate-300 text-sm flex items-center gap-1">
                          <MapPin className="size-4 text-brand-cyan shrink-0" />
                          <span className="truncate">{property.location}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/20 pt-3">
                        <PriceDisplay
                          price={property.price}
                          status={property.status}
                          priceLabel={property.price_label}
                          variant="md"
                          className="!mb-0 [&_div]:text-white [&_div]:text-lg [&_div]:md:text-xl [&_div]:font-black"
                        />
                        <BrandButton
                          variant="primary"
                          size="md"
                          className="px-4 py-1.5 md:px-5 md:py-1.5 text-sm shadow-lg shadow-brand-cyan/20 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isSelected) {
                              navigate(`/catalog/${property.id}`);
                            }
                          }}
                        >
                          Ver más
                        </BrandButton>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controles: Flechas y Dots unificados en la parte inferior */}
        {properties.length > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={scrollPrev}
              aria-label="Anterior"
              className="flex items-center justify-center size-10 rounded-full transition-all text-white bg-slate-800 hover:bg-brand-cyan shadow-md"
            >
              <ChevronLeft className="size-5" />
            </button>

            <div className="flex items-center gap-2">
              {properties.map((_, index) => (
                <button
                  key={index}
                  aria-label={`Ir a slide ${index + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${index === selectedIndex ? 'bg-brand-cyan w-6' : 'bg-white/30 w-1.5 hover:bg-white/50'}`}
                  onClick={() => emblaApi?.scrollTo(index)}
                />
              ))}
            </div>

            <button
              onClick={scrollNext}
              aria-label="Siguiente"
              className="flex items-center justify-center size-10 rounded-full transition-all text-white bg-slate-800 hover:bg-brand-cyan shadow-md"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
