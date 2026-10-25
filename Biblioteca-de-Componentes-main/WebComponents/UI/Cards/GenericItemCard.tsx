import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import { Lock, MapPin } from 'lucide-react';
import { BrandButton } from '../ui/BrandButton';
import { ActionModalBase } from '../ui/ActionModalBase';
import { StatusBadge } from '../ui/StatusBadge';

export interface GenericItem {
  id: string;
  title: string;
  subtitle?: string;
  price: number;
  formattedPrice?: string;
  images: string[];
  status: {
    label: string; // ej: "Vendido", "En Stock", "Agotado"
    variant: 'default' | 'success' | 'warning' | 'destructive' | 'neutral';
    isGhost: boolean; // Si es true, la tarjeta se pone en blanco y negro y muestra el GhostModal
  };
  features: {
    icon?: React.ReactNode;
    label: string;
  }[];
}

interface GenericItemCardProps {
  item: GenericItem;
  onCardClick?: (id: string) => void;
  actionButtonText?: string;
  ghostModalConfig?: {
    title: string;
    description: string;
    primaryActionText: string;
    primaryActionUrl: string;
  };
}

function GhostModal({ 
  item, 
  config,
  onClose 
}: { 
  item: GenericItem; 
  config: GenericItemCardProps['ghostModalConfig'];
  onClose: () => void;
}) {
  return (
    <ActionModalBase isOpen={true} onClose={onClose} maxWidth="md" showCloseButton={false}>
      <div className="text-center">
        <div className="size-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-slate-100">
          <Lock className="size-8 text-slate-500" />
        </div>
        <h3 className="text-2xl font-extrabold text-slate-900 mb-3">
          {config?.title || `Este artículo está ${item.status.label.toLowerCase()}`}
        </h3>
        <p className="text-slate-500 mb-8 leading-relaxed">
          {config?.description || 'Lamentablemente ya no se encuentra disponible. Por favor, explora otras opciones similares en nuestro catálogo.'}
        </p>
        <div className="flex flex-col gap-3">
          {config?.primaryActionUrl && (
            <a
              href={config.primaryActionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 font-bold w-full py-4 rounded-2xl bg-brand-primary text-white hover:opacity-90 hover:scale-[1.02] transition-all text-center"
            >
              {config.primaryActionText || 'Ver opciones similares'}
            </a>
          )}
          <BrandButton variant="subtle" size="lg" fullWidth onClick={onClose}>
            Seguir explorando
          </BrandButton>
        </div>
      </div>
    </ActionModalBase>
  );
}

export function GenericItemCard({ 
  item, 
  onCardClick, 
  actionButtonText = "Ver detalles",
  ghostModalConfig
}: GenericItemCardProps) {
  const [showGhostModal, setShowGhostModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const hasMultipleImages = item.images.length > 1;

  useEffect(() => {
    if (!hasMultipleImages || !isHovered) return;
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % item.images.length);
    }, 1250);
    return () => clearInterval(interval);
  }, [hasMultipleImages, isHovered, item.images.length]);

  useEffect(() => {
    if (!isHovered) setCurrentImageIndex(0);
  }, [isHovered]);

  const handleDotClick = useCallback((e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  }, []);

  const handleCardClick = () => {
    if (item.status.isGhost) {
      setShowGhostModal(true);
    } else {
      onCardClick?.(item.id);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showGhostModal && (
          <GhostModal 
            item={item} 
            config={ghostModalConfig} 
            onClose={() => setShowGhostModal(false)} 
          />
        )}
      </AnimatePresence>

      <div className={`group relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full ${item.status.isGhost ? 'opacity-80' : ''}`}>
        <div
          className="relative h-[240px] sm:h-[260px] md:h-[280px] overflow-hidden cursor-pointer shrink-0"
          role="button"
          tabIndex={0}
          onClick={handleCardClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {item.images[currentImageIndex] ? (
            <img
              src={item.images[currentImageIndex]}
              alt={item.title}
              loading="lazy"
              className={`w-full h-full object-cover transition-transform duration-700 ease-in-out ${item.status.isGhost ? 'grayscale-[50%]' : 'group-hover:scale-110'}`}
            />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">Sin imagen</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60" />

          <StatusBadge
            variant={item.status.variant}
            label={item.status.label}
            className="absolute top-5 left-5 shadow-black/30 ring-1 ring-white/20"
          />

          {hasMultipleImages && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {item.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => handleDotClick(e, index)}
                  className={`size-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-4 md:p-5 flex flex-col cursor-pointer flex-1" onClick={handleCardClick}>
          <div className="mb-2 md:mb-3 h-[72px] md:h-[92px] flex flex-col justify-start">
            <h3 className={`font-extrabold text-sm md:text-lg leading-snug text-slate-900 line-clamp-2 transition-colors ${!item.status.isGhost && 'group-hover:text-brand-primary'}`}>
              {item.title}
            </h3>
            {item.subtitle && (
              <div className="flex items-center gap-1.5 mt-2 md:mt-2.5 text-xs md:text-sm text-slate-500">
                <MapPin className="size-3.5 md:size-4 text-brand-primary shrink-0" />
                <span className="truncate">{item.subtitle}</span>
              </div>
            )}
          </div>

          <div className="mb-2 md:mb-3 h-[48px] flex flex-col justify-end">
            <span className="text-2xl font-bold text-slate-900">
              {item.formattedPrice || `$${item.price.toLocaleString()}`}
            </span>
          </div>

          <div className="mt-auto pt-1.5 md:pt-3 border-t border-slate-100">
            {/* Generic Features Row */}
            <div className="flex flex-wrap gap-2 mb-3">
              {item.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-md">
                  {feature.icon && <span className="opacity-70">{feature.icon}</span>}
                  <span>{feature.label}</span>
                </div>
              ))}
            </div>

            <BrandButton
              variant={item.status.isGhost ? 'subtle' : 'dark'}
              size="sm"
              fullWidth
              className="py-2 md:py-3 shadow-sm hover:shadow-md"
              onClick={handleCardClick}
            >
              {actionButtonText}
            </BrandButton>
          </div>
        </div>
      </div>
    </>
  );
}
