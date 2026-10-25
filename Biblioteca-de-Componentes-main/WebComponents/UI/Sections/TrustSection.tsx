import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { m } from 'motion/react';
import { StatCard } from '../ui/cards/StatCard';
import { TestimonialCard } from '../ui/cards/TestimonialCard';
import { api } from '../../services/api';
import { Testimonial } from '../../lib/types';

export function TrustSection() {
  const [testimonials, setTestimonials] = useState<
    { id: number; text: string; author: string; role: string }[]
  >([]);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        setIsLoading(true);
        const data = await api.testimonials.getFeatured();
        setTestimonials(
          data.map((t: Testimonial, idx: number) => ({
            id: idx + 1,
            text: t.comment,
            author: t.author_name,
            role: t.role_label,
          }))
        );
      } catch (error) {
        console.error('[TrustSection] Error cargando testimonios:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTestimonials();
  }, []);

  const nextTestimonial = () => {
    if (testimonials.length === 0) return;
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    if (testimonials.length === 0) return;
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="trust" className="py-20 lg:py-32 bg-slate-50 relative overflow-hidden scroll-mt-24 sm:scroll-mt-32">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-[10%] -left-[10%] w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none bg-brand-cyan/8" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Quiénes Somos — Encabezado */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-5xl mx-auto"
        >
          <div className="text-center mb-10">
            <span className="font-medium tracking-wider uppercase text-sm mb-4 block text-brand-cyan">
              Quiénes Somos
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900">
              Schmidt<span className="text-brand-cyan">Corredores</span>
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-10 bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100">
            {/* Foto de Perfil y Nombre */}
            <div className="shrink-0 flex flex-col items-center">
              <div className="w-48 h-72 md:w-64 md:h-80 lg:w-72 lg:h-96 rounded-3xl bg-slate-100 border-8 border-slate-50 shadow-inner overflow-hidden flex items-center justify-center relative group mb-5">
                <svg className="w-24 h-24 text-slate-300 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <div className="absolute inset-0 bg-brand-cyan/10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-brand-cyan font-bold text-sm bg-white/90 px-3 py-1 rounded-full shadow-sm">Espacio para foto</span>
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-xl text-slate-900 tracking-tight">Leslie Schmidt</h3>
                <p className="text-brand-cyan font-medium text-sm mt-1">Corredora Inmobiliaria</p>
              </div>
            </div>

            {/* Información y Texto */}
            <div className="flex-1 text-center md:text-left space-y-4 text-slate-600 text-lg leading-relaxed">
              <p>
                <strong>Somos un equipo de profesionales</strong> con una sólida experiencia en la actividad inmobiliaria y financiera, orientados a entregar excelencia y calidad en nuestros servicios. 
              </p>
              <p>
                Con <strong>más de 10 años de trayectoria</strong> en el mercado inmobiliario de Santiago, hemos gestionado con éxito más de 200 propiedades, ayudando a familias a encontrar su hogar ideal y a inversionistas a concretar negocios de manera segura.
              </p>
              <p>
                Respondemos con seriedad y profesionalismo a todos los requerimientos que exigen nuestros clientes y el mercado, operando siempre bajo las más estrictas <strong>normas éticas y con total transparencia</strong>.
              </p>
            </div>
          </div>
        </m.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-24">
          {[
            { value: "+200", label: "Propiedades Gestionadas", highlight: "text-blue-600" },
            { value: "98%", label: "Satisfacción", highlight: "" },
            { value: "10+", label: "Años Experiencia", highlight: "text-blue-600" },
            { value: "0", label: "Sin Comisiones", highlight: "" },
          ].map((stat, idx) => (
            <StatCard
              key={stat.label}
              index={idx}
              value={stat.value}
              label={stat.label}
              highlight={stat.highlight}
            />
          ))}
        </div>

        {/* Testimonials Carousel */}
        <div className="max-w-5xl mx-auto">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900">
              Lo Que Dicen Nuestros Clientes
            </h2>
            <p className="text-slate-600 mt-4 text-lg">Su confianza es nuestro mayor respaldo</p>
          </m.div>

          {isLoading ? (
            <div className="bg-white p-10 lg:p-16 rounded-[2.5rem] shadow-2xl border border-slate-100 flex items-center justify-center min-h-[450px] md:min-h-[400px]">
              <div className="size-10 border-4 border-slate-200 border-t-brand-cyan rounded-full animate-spin" />
            </div>
          ) : testimonials.length > 0 ? (
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative bg-white p-10 lg:p-16 rounded-[2.5rem] shadow-2xl border border-slate-100"
            >
              <Quote className="absolute top-10 left-10 size-16 text-slate-100 rotate-180 pointer-events-none" />

              <TestimonialCard
                key={currentTestimonial}
                testimonial={testimonials[currentTestimonial]}
              />

              {/* Navigation */}
              <div className="flex items-center justify-center gap-6 mt-12">
                <button
                  onClick={prevTestimonial}
                  className="p-3 bg-slate-50 rounded-full transition-colors border border-slate-100 hover:bg-brand-cyan/10 hover:text-brand-cyan"
                  aria-label="Anterior testimonio"
                >
                  <ChevronLeft className="size-6" />
                </button>

                <div className="flex gap-3">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`h-2.5 rounded-full transition-all duration-300 ${index === currentTestimonial
                        ? 'w-10 bg-brand-cyan'
                        : 'bg-slate-200 w-2.5 hover:bg-slate-300'
                        }`}
                      aria-label={`Ir a testimonio ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextTestimonial}
                  className="p-3 bg-slate-50 rounded-full transition-colors border border-slate-100 hover:bg-brand-cyan/10 hover:text-brand-cyan"
                  aria-label="Siguiente testimonio"
                >
                  <ChevronRight className="size-6" />
                </button>
              </div>
            </m.div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
