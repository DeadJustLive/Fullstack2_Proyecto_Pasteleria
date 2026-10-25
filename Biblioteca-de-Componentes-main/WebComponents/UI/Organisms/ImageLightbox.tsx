// @use(kind, props, limit)
// @kind(component)
// @limit(lines: 120)
// @props({ images: string[], title: string, isOpen: boolean, onClose: () => void, selectedIndex: number, onSelectIndex: (index: number) => void })

import { useEffect, useCallback } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  title: string;
  isOpen: boolean;
  onClose: () => void;
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
}

export function ImageLightbox({
  images,
  title,
  isOpen,
  onClose,
  selectedIndex,
  onSelectIndex,
}: ImageLightboxProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handlePrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectIndex((selectedIndex - 1 + images.length) % images.length);
  }, [selectedIndex, images.length, onSelectIndex]);

  const handleNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectIndex((selectedIndex + 1) % images.length);
  }, [selectedIndex, images.length, onSelectIndex]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onSelectIndex((selectedIndex - 1 + images.length) % images.length);
    if (e.key === 'ArrowRight') onSelectIndex((selectedIndex + 1) % images.length);
  }, [onClose, selectedIndex, images.length, onSelectIndex]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={`Galería de imágenes: ${title}`}
          onClick={onClose}
        >
          <button
            onClick={onClose}
            aria-label="Cerrar galería"
            className="absolute top-6 right-6 z-10 text-white/70 hover:text-white transition-colors"
          >
            <X className="size-8" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                aria-label="Imagen anterior"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white transition-colors"
              >
                <ChevronLeft className="size-10" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Imagen siguiente"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white transition-colors"
              >
                <ChevronRight className="size-10" />
              </button>
            </>
          )}

          <m.img
            key={selectedIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            src={images[selectedIndex]}
            alt={title}
            className="max-w-[90vw] max-h-[90vh] w-auto h-auto object-contain rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectIndex(index);
                  }}
                  aria-label={`Ir a imagen ${index + 1}`}
                  className={`size-2.5 rounded-full transition-all ${
                    index === selectedIndex
                      ? 'bg-white scale-125'
                      : 'bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </m.div>
      )}
    </AnimatePresence>
  );
}