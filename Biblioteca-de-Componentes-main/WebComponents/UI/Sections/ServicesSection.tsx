// @use(kind, deps, limit, props)
// @kind(feature)
// @props({})
// @deps(@internal: [ServiceCard, BrandButton, ActionModalBase, AdvisoryModal, services], @external: [motion, react])
// @limit(lines: 150)

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { BrandButton } from '../ui/BrandButton';
import { ServiceCard } from '../ui/cards/ServiceCard';
import { ActionModalBase } from '../ui/ActionModalBase';
import { AdvisoryModal } from '../catalog/AdvisoryModal';
import { services } from '../../data/services';

export function ServicesSection() {
  const [showModal, setShowModal] = useState(false);
  const [activeService, setActiveService] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Si el desplazamiento es puramente horizontal (ej. trackpad), dejamos el comportamiento nativo
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      
      // Convertir desplazamiento vertical a horizontal
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const handleServiceContact = () => {
    setActiveService(null);
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="py-20 lg:py-32 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] z-0 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div
          className="text-center mb-16 lg:mb-24"
        >
          <span className="font-bold tracking-widest uppercase text-xs mb-3 block text-brand-cyan">
            Lo que hacemos
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-extrabold text-slate-900 mb-4 md:mb-6 tracking-tight">
            Nuestros <span className="text-brand-cyan">Servicios</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Ofrecemos soluciones integrales y tecnológicas para que comprar, vender o arrendar sea una experiencia simple y exitosa.
          </p>
        </div>

        {/* Contenedor scrollable horizontal */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x md:snap-none gap-6 pb-12 mb-12 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {services.map((service, index) => (
            <div 
              key={service.title} 
              className="snap-center shrink-0 w-[85vw] sm:w-[320px] md:w-[340px] lg:w-[360px] flex"
            >
              <ServiceCard
                index={index}
                icon={service.icon}
                title={service.title}
                description={service.description}
                gradient={service.gradient}
                onClick={() => setActiveService(index)}
              />
            </div>
          ))}
        </div>

        <div className="text-center">
          <BrandButton
            variant="dark"
            size="lg"
            className="group overflow-hidden relative px-10 py-5 rounded-2xl"
            onClick={() => setShowModal(true)}
          >
            <span className="relative z-10">Solicitar Asesoría Gratis</span>
            <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </BrandButton>
        </div>
      </div>

      <AnimatePresence>
        {activeService !== null && (
          <ActionModalBase
            isOpen={true}
            onClose={() => setActiveService(null)}
            title={services[activeService].title}
            subtitle="Conoce más sobre este servicio"
            maxWidth="xl"
            footer={
              <BrandButton variant="primary" size="lg" fullWidth onClick={handleServiceContact}>
                Contactar para este servicio
              </BrandButton>
            }
          >
            <div className="space-y-6">
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                {services[activeService].detail.summary}
              </p>

              <div className="space-y-8">
                {services[activeService].detail.sections.map((section) => (
                  <div key={section.heading}>
                    <h4 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-brand-cyan" />
                      {section.heading}
                    </h4>
                    <p className="text-slate-600 leading-relaxed pl-4">
                      {section.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ActionModalBase>
        )}
      </AnimatePresence>

      <AdvisoryModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </section>
  );
}