import { Link } from 'react-router';
import { ChevronDown, ArrowRight, Home as HomeIcon, Star } from 'lucide-react';
import { m } from 'motion/react';
import { useState } from 'react';
import { SellModal } from '../catalog/SellModal';

export function HeroSection() {
  const [showSellModal, setShowSellModal] = useState(false);

  return (
    <section id="hero" className="relative min-h-[100svh] w-full flex items-center justify-center overflow-hidden bg-slate-100">
      {/* Background Image — Realistic Santiago Balcony View */}
      <div className="absolute inset-0 z-0 bg-brand-dark overflow-hidden">
          <m.img
            src="/hero-photo.jpg"
            alt="Interior de propiedad"
            className="absolute inset-0 w-full h-full object-cover scale-105 origin-top"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            loading="eager"
            decoding="sync"
          />

        {/* Capa 1: Oscurecimiento muy sutil para asegurar lectura sin perder la foto */}
        <div className="absolute inset-0 bg-black/15" />
        {/* Capa 2: Suave viñeta oscura abajo para los botones */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/10 to-transparent" />
      </div>

      {/* Container Content */}
      <div
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-16 pt-[clamp(4rem,8vh,7rem)] flex flex-col items-center text-center"
      >
        <div className="max-w-3xl md:max-w-4xl lg:max-w-4xl flex flex-col items-center">

          {/* Logo + Brand Name */}
          <m.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-center gap-3 md:gap-4 mb-4 sm:mb-8"
          >
            <img
              src="/logo-schmidt.svg"
              alt="Schmidt Corredores logo"
              className="h-16 sm:h-20 md:h-24 object-contain drop-shadow-md"
            />
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-white drop-shadow-[0_2px_10px_rgba(12,58,79,0.3)]"
            >
              Schmidt <span className="text-brand-cyan drop-shadow-[0_2px_12px_rgba(14,162,204,0.4)]">Corredores</span>
            </h1>
          </m.div>

          {/* Badge */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-dark/88 border border-brand-cyan/50 backdrop-blur-xl mb-[clamp(0.4rem,1.8vh,1.25rem)]"
          >
            <Star className="size-4 text-brand-cyan" />
            <span className="text-sm font-semibold tracking-wide uppercase text-white">
              10+ años de experiencia
            </span>
          </m.div>

          {/* Text Area */}
          <div className="relative">
            <div className="relative z-10">
              {/* Tagline */}
              <m.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 sm:mb-5 leading-[1.2] text-white drop-shadow-xl max-w-3xl mx-auto"
              >
                Tu hogar ideal te <span className="text-brand-cyan drop-shadow-lg">espera</span>
              </m.h2>

              {/* Subtitle */}
              <m.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-sm sm:text-base lg:text-lg mb-6 sm:mb-10 max-w-2xl mx-auto font-medium leading-relaxed text-slate-200 drop-shadow-md"
              >
                Asesoría personalizada en cada paso. Encuentra la propiedad que siempre soñaste con transparencia y confianza.
              </m.p>
            </div>
          </div>

          {/* CTA Buttons */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row justify-center gap-3 md:gap-5 w-full max-w-lg mx-auto"
          >
            {/* Primary CTA */}
            <Link
              to="/catalog"
              className="group relative inline-flex items-center justify-center gap-2 font-bold px-7 py-3 md:py-3.5 lg:py-4 rounded-2xl transition-all duration-300 text-sm sm:text-base overflow-hidden bg-brand-cyan text-white shadow-[0_8px_32px_rgba(226,232,240,0.15)] hover:shadow-[0_12px_48px_rgba(226,232,240,0.35)]"
            >
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <HomeIcon className="size-5 relative z-10" />
              <span className="relative z-10">Ver Propiedades</span>
              <ArrowRight className="size-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Secondary CTA */}
            <button
              onClick={() => setShowSellModal(true)}
              className="group relative inline-flex items-center justify-center gap-2 font-bold px-7 py-3 md:py-3.5 lg:py-4 rounded-2xl transition-all duration-300 cursor-pointer text-sm sm:text-base border-2 border-brand-cyan/40 bg-white/70 text-brand-dark backdrop-blur-md hover:bg-brand-cyan/10 hover:border-brand-cyan"
            >
              <span className="relative flex size-2.5 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75" />
                <span className="relative inline-flex rounded-full size-2.5 bg-brand-cyan" />
              </span>
              <span>Vender con Nosotros</span>
            </button>
          </m.div>

          {/* Trust micro-indicators */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="flex items-center justify-center gap-3 sm:gap-6 mt-8 md:mt-12 flex-wrap"
          >
            {[
              { value: '+200', label: 'Propiedades' },
              { value: '98%', label: 'Satisfacción' },
              { value: '10+', label: 'Años' },
            ].map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-2">
                {i > 0 && <div className="w-px h-5 bg-slate-400/50" />}
                <span
                  className="font-black text-2xl text-white drop-shadow-md"
                >
                  {stat.value}
                </span>
                <span
                  className="text-sm font-semibold text-slate-300 drop-shadow-sm"
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </m.div>
        </div>
      </div>

      {/* Scroll Down Indicator Premium */}
      <m.button
        onClick={() => {
          const el = document.getElementById('trust');
          if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 cursor-pointer outline-none group"
      >
        <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] font-medium text-slate-300 group-hover:text-white transition-colors">
          Descubrir
        </span>
        <div className="w-[1px] h-12 bg-white/20 relative overflow-hidden">
          <m.div
            animate={{ top: ['-10%', '110%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="absolute left-0 w-full h-1/3 bg-gradient-to-b from-transparent via-white to-transparent"
          />
        </div>
      </m.button>

      <SellModal isOpen={showSellModal} onClose={() => setShowSellModal(false)} />
    </section>
  );
}
