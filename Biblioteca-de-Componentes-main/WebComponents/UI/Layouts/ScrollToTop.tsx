import { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { useLocation } from 'react-router';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <m.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 lg:bottom-12 lg:right-12 z-50 p-4 bg-slate-900/90 backdrop-blur-md text-white rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:bg-emerald-500 transition-colors focus:outline-none focus:ring-4 focus:ring-emerald-500/30 group border border-white/20"
          aria-label="Volver arriba"
        >
          <ArrowUp className="size-6 group-hover:-translate-y-1 transition-transform" />
        </m.button>
      )}
    </AnimatePresence>
  );
}
