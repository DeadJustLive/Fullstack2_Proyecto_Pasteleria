// @pca:start
// @id(frontend.pages.cliente.nosotros)
// @kind(page)
// @limit(lines: 320)
// @contract(NosotrosView())
// @relates(frontend.ui.buttonLink)
// @relates(docs.reglas_ui)
// @desc(Vista institucional con historia, equipo de maestros pasteleros y pilares artesanales)
// @pca:end

import {
  Flame,
  HeartHandshake,
  Leaf,
  PackageCheck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";

interface MaestroPastelero {
  nombre: string;
  rol: string;
  bio: string;
  imagen: string;
  especialidad: string;
}

const MAESTROS: MaestroPastelero[] = [
  {
    nombre: "Camille Laurent",
    rol: "Chef Ejecutiva & Co-Fundadora",
    bio: "Formada en la prestigiosa escuela Ferrandi de París. Lidera nuestras recetas aportando la precisión y sutileza técnica de la pastelería gala.",
    imagen: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=800&auto=format&fit=crop",
    especialidad: "Viennoiserie & Masas Laminadas",
  },
  {
    nombre: "Mateo Valenzuela",
    rol: "Maestro Chocolatero",
    bio: "Especialista en cacao orgánico y fermentación lenta. Transforma el chocolate puro en esculturas y rellenos de alta complejidad aromática.",
    imagen: "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?q=80&w=800&auto=format&fit=crop",
    especialidad: "Bombonería & Ganaches de Origen",
  },
  {
    nombre: "Sofía Arancibia",
    rol: "Diseñadora de Tortas de Autor",
    bio: "Pintora y pastelera. Diseña piezas únicas utilizando botánica comestible, acabados aterciopelados y flores prensadas naturales.",
    imagen: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?q=80&w=800&auto=format&fit=crop",
    especialidad: "Tortas de Boda & Eventos de Gala",
  },
];

const PILARES = [
  {
    icon: Leaf,
    titulo: "100% Ingredientes Naturales",
    descripcion:
      "Mantequilla de campo, huevos de gallinas libres, vainilla natural de Madagascar y frutas de agricultores locales de Chile.",
  },
  {
    icon: Sparkles,
    titulo: "Técnica Francesa & Alma Local",
    descripcion:
      "Laminados y fermentaciones precisas fusionadas con manjar de campo, lúcuma fresca y berrys silvestres del sur.",
  },
  {
    icon: Flame,
    titulo: "Horneado Diario en Pequeños Lotes",
    descripcion:
      "Sin conservantes ni premezclas industriales. Cada creación es horneada y decorada el mismo día para garantizar frescura.",
  },
  {
    icon: PackageCheck,
    titulo: "Packaging Sustentable",
    descripcion:
      "Cajas y envoltorios 100% biodegradables y reciclables que preservan la integridad de cada postre cuidando el entorno.",
  },
];

export function Nosotros() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 sm:gap-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-tertiary via-tertiary/95 to-secondary px-6 py-14 text-center text-neutral shadow-md sm:px-12 sm:py-20">
        <div className="relative z-10 mx-auto max-w-3xl">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/20 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-primary backdrop-blur-xs">
            <HeartHandshake size={14} /> Sobre Nosotros
          </span>
          <h1 className="text-balance text-neutral">
            Pasión Artesanal y Tradición que Enamora
          </h1>
          <p className="mx-auto mt-4 max-w-2xl font-body text-base text-neutral/90 sm:text-lg">
            En Crème &amp; Co concebimos la pastelería como una forma de arte.
            Horneamos momentos memorables cada día con técnica, amor y los más
            puros ingredientes de la tierra.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <ButtonLink to="/catalogo" variant="primary">
              Explorar Catálogo
            </ButtonLink>
            <ButtonLink
              to="/contacto"
              variant="outline"
              className="border-neutral/30 text-neutral hover:bg-neutral/10"
            >
              Contáctanos
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Historia Artesanal */}
      <section className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-12">
        <div className="flex flex-col gap-4 md:col-span-7">
          <span className="font-body text-xs font-bold uppercase tracking-widest text-secondary">
            Nuestra Historia
          </span>
          <h2 className="text-left text-tertiary">
            De una cocina familiar al corazón de Providencia
          </h2>
          <p className="font-body text-base text-ink/85 leading-relaxed">
            Crème &amp; Co nació en 2018 como un anhelo compartido: rescatar la
            auténtica pastelería artesanal europea y fusionarla con los
            sabores entrañables de nuestra infancia chilena.
          </p>
          <p className="font-body text-base text-ink/85 leading-relaxed">
            Lo que comenzó como un pequeño taller casero horneando para amigos y
            familias, se convirtió rápidamente en un punto de encuentro para los
            amantes del buen dulce gracias a nuestra regla de oro: jamás
            transar en la pureza de los ingredientes ni acelerar los tiempos que
            la buena masa exige.
          </p>
          <div className="mt-2 flex items-center gap-4 rounded-xl border border-tertiary/10 bg-white p-4 shadow-xs">
            <ShieldCheck size={32} className="shrink-0 text-secondary" />
            <div>
              <p className="font-display text-sm font-semibold text-tertiary">
                Compromiso Artesanal Certificado
              </p>
              <p className="font-body text-xs text-ink/70">
                Elaboración diaria sin conservantes, químicos ni procesos ultraprocesados.
              </p>
            </div>
          </div>
        </div>

        <div className="relative md:col-span-5">
          <div className="relative overflow-hidden rounded-2xl border border-tertiary/15 shadow-md">
            <img
              src="/imagen/fondo_obrador.webp"
              alt="Obrador de Crème & Co en Providencia"
              className="aspect-4/3 w-full object-cover sm:aspect-square"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-tertiary/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/95 p-3.5 shadow-sm backdrop-blur-xs">
              <span className="font-display text-2xl font-bold text-secondary">
                2018
              </span>
              <p className="font-body text-xs font-medium text-tertiary">
                Años dedicados a perfeccionar la alquimia de la repostería fina.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pilares de Calidad */}
      <section className="rounded-2xl border border-tertiary/10 bg-white p-6 shadow-xs sm:p-10">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="font-body text-xs font-bold uppercase tracking-widest text-secondary">
            Nuestros Estándares
          </span>
          <h2 className="mt-1 text-tertiary">Pilares de Calidad</h2>
          <p className="mt-2 font-body text-sm text-ink/75 sm:text-base">
            Cada torta, galleta y macaron que sale de nuestro horno refleja cuatro
            principios fundamentales.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PILARES.map((pilar) => {
            const Icon = pilar.icon;
            return (
              <div
                key={pilar.titulo}
                className="group flex flex-col items-center rounded-xl border border-tertiary/10 bg-neutral/30 p-6 text-center transition-all hover:-translate-y-1 hover:border-secondary/30 hover:bg-neutral hover:shadow-sm"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/40 text-secondary transition-transform group-hover:scale-110">
                  <Icon size={26} />
                </div>
                <h3 className="mb-2 font-display text-base font-semibold text-tertiary">
                  {pilar.titulo}
                </h3>
                <p className="font-body text-sm text-ink/75 leading-relaxed">
                  {pilar.descripcion}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Maestros Pasteleros */}
      <section className="flex flex-col gap-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-body text-xs font-bold uppercase tracking-widest text-secondary">
            Talento Culinario
          </span>
          <h2 className="mt-1 text-tertiary">Maestros Pasteleros</h2>
          <p className="mt-2 font-body text-sm text-ink/75 sm:text-base">
            Detrás de cada creación hay mentes apasionadas y manos expertas con
            décadas de estudio y dedicación.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MAESTROS.map((chef) => (
            <article
              key={chef.nombre}
              className="flex flex-col overflow-hidden rounded-xl border border-tertiary/10 bg-white shadow-xs transition-transform hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative h-64 w-full overflow-hidden bg-neutral/50">
                <img
                  src={chef.imagen}
                  alt={chef.nombre}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute bottom-3 left-3 rounded-full bg-tertiary/90 px-3 py-1 text-xs font-medium text-neutral backdrop-blur-xs">
                  {chef.especialidad}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <span className="font-body text-xs font-bold uppercase tracking-wider text-secondary">
                  {chef.rol}
                </span>
                <h3 className="mt-1 font-display text-lg font-semibold text-tertiary">
                  {chef.nombre}
                </h3>
                <p className="mt-3 flex-1 font-body text-sm text-ink/75 leading-relaxed">
                  {chef.bio}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Insignias e Impacto */}
      <section className="rounded-2xl bg-tertiary p-8 text-neutral shadow-sm sm:p-12">
        <div className="grid grid-cols-2 gap-6 text-center lg:grid-cols-4">
          <div className="flex flex-col gap-1">
            <span className="font-display text-3xl font-bold text-primary sm:text-4xl">
              +50.000
            </span>
            <span className="font-body text-xs text-neutral/80 sm:text-sm">
              Momentos y celebraciones endulzadas
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display text-3xl font-bold text-primary sm:text-4xl">
              100%
            </span>
            <span className="font-body text-xs text-neutral/80 sm:text-sm">
              Ingredientes puros sin premezclas
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display text-3xl font-bold text-primary sm:text-4xl">
              25+
            </span>
            <span className="font-body text-xs text-neutral/80 sm:text-sm">
              Creaciones de autor en carta viva
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display text-3xl font-bold text-primary sm:text-4xl">
              6 Años
            </span>
            <span className="font-body text-xs text-neutral/80 sm:text-sm">
              Creciendo junto a nuestra comunidad
            </span>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-secondary/20 bg-gradient-to-r from-neutral via-white to-neutral p-8 text-center sm:flex-row sm:text-left">
        <div>
          <h2 className="text-left text-tertiary">¿Tienes una celebración en mente?</h2>
          <p className="mt-1 font-body text-sm text-ink/75">
            Cotiza tu torta personalizada o consulta la disponibilidad de pedidos especiales.
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <ButtonLink to="/personalizacion" variant="primary" className="gap-2">
            Personalizar Torta <ArrowRight size={16} />
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
