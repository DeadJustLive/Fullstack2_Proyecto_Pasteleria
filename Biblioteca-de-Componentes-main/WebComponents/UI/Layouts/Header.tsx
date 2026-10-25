import { Link, useLocation, useNavigate } from 'react-router';
import { Facebook, Instagram, Phone, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { COMPANY_PHONE_URL } from '../../lib/constants';
import { NAV_ITEMS, type NavItem } from '../../data/navigation';

export const BRAND_CYAN = '#0EA2CC';

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

const SOCIAL_COLORS = {
  whatsapp: { bg: 'bg-[#25D366]', hoverBg: 'hover:bg-[#20bd5a]', border: 'border-[#25D366]/50' },
  instagram: { bg: 'bg-[#E4405F]', hoverBg: 'hover:bg-[#c93650]', border: 'border-[#E4405F]/50' },
  facebook: { bg: 'bg-[#1877F2]', hoverBg: 'hover:bg-[#166fe5]', border: 'border-[#1877F2]/50' },
} as const;

const contactLinks = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    href: `https://wa.me/${COMPANY_PHONE_URL}?text=${encodeURIComponent('Hola! Me gustaría obtener más información sobre las propiedades disponibles.')}`,
    icon: WhatsAppIcon,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/schmidtcorredores',
    icon: Instagram,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    href: 'https://www.facebook.com/SchmidtCorredores/',
    icon: Facebook,
  },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [contactOpen, setContactOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  // ── IntersectionObserver: detecta qué sección domina el viewport ──
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('');
      return;
    }

    const sectionIds = ['hero', 'trust', 'services', 'contact'];
    const elements = sectionIds
      .map(id => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return; // Pausar vigía durante scroll manual

        const best = entries.reduce((max, e) =>
          e.intersectionRatio > (max?.intersectionRatio ?? 0) ? e : max,
        entries[0]);
        if (best && best.intersectionRatio > 0) {
          setActiveSection(best.target.id);
        }
      },
      { threshold: [0.15, 0.3, 0.45, 0.6], rootMargin: '-80px 0px -30% 0px' },
    );

    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [location.pathname]);

  // ── Click fuera del dropdown ──
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setContactOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isLinkActive = (link: NavItem) => {
    if (link.sectionId) {
      // Secciones del home: activa si coincide la sección visible
      return location.pathname === link.path && activeSection === link.sectionId;
    }
    // Links de ruta fija (Propiedades)
    return location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
  };

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, link: NavItem) => {
    e.preventDefault();
    setContactOpen(false);

    if (link.sectionId) {
      setActiveSection(link.sectionId);
      isScrollingRef.current = true;
      
      if (location.pathname === link.path) {
        const el = document.getElementById(link.sectionId);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: 'smooth' });
          setTimeout(() => { isScrollingRef.current = false; }, 800);
        } else {
          isScrollingRef.current = false;
        }
      } else {
        navigate(link.path);
        setTimeout(() => {
          const el = document.getElementById(link.sectionId!);
          if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
            setTimeout(() => { isScrollingRef.current = false; }, 800);
          } else {
            isScrollingRef.current = false;
          }
        }, 150);
      }
    } else {
      // Propiedades — navegación directa
      setActiveSection('');
      if (location.pathname === link.path) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate(link.path);
      }
    }
  };

  return (
    <header className="fixed top-3 left-1/2 -translate-x-1/2 z-40 w-[96%] sm:w-[90%] max-w-5xl">
      <div className="relative" ref={wrapperRef}>

        {/* ── Navbar pill ── */}
        <div
          className="rounded-2xl sm:rounded-full px-2 sm:px-5 py-1.5 sm:py-2.5 flex items-center gap-1 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-4 bg-brand-dark border border-brand-cyan/25 backdrop-blur-[20px] backdrop-saturate-[1.8] shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
        >
          {/* Logo */}
          <Link
            to="/"
            onClick={(e) => handleNavigation(e, NAV_ITEMS[0])}
            className="hidden lg:flex items-center gap-2 group min-w-0"
          >
            <img
              src="/logo-schmidt.svg"
              alt="Schmidt Corredores logo"
              className="h-7 sm:h-8 object-contain group-hover:opacity-90 transition-opacity"
            />
          </Link>

          {/* Nav pills */}
          <nav
            className="relative flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 py-1 rounded-full bg-white/10 border border-white/12 flex-1 sm:flex-initial"
          >
            {NAV_ITEMS.map((link) => {
              const active = isLinkActive(link);
              const Icon = link.icon;
              return (
                <Link
                  key={link.sectionId || link.path}
                  to={link.sectionId ? `/#${link.sectionId}` : link.path}
                  onClick={(e) => handleNavigation(e, link)}
                  className={`relative flex items-center gap-1 rounded-full transition-all duration-300 font-semibold px-1 sm:px-3 py-1 sm:py-2 flex-1 justify-center text-[10px] sm:text-sm
                    ${active
                      ? 'text-white bg-brand-cyan shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                >
                  <Icon className="size-3.5 sm:size-4 shrink-0" />
                  <span className="hidden min-[1100px]:inline">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Contacto button y Dropdown encapsulados */}
          <div className="relative justify-self-end flex items-center">
            <button
              onClick={() => setContactOpen((v) => !v)}
              className={`relative flex items-center justify-center shrink-0 rounded-full font-semibold transition-all duration-300 size-8 sm:size-10 text-white border border-white/15 ${contactOpen ? 'bg-brand-cyan shadow-md' : 'bg-white/10 hover:bg-white/20'}`}
              aria-label="Contacto"
              aria-expanded={contactOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                {contactOpen ? (
                  <m.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }} className="absolute">
                    <X className="size-4" />
                  </m.span>
                ) : (
                  <m.span key="phone" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }} className="absolute">
                    <Phone className="size-4" />
                  </m.span>
                )}
              </AnimatePresence>
            </button>

            {/* ── Dropdown de contacto ── */}
            <AnimatePresence>
              {contactOpen && (
                <m.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute top-[calc(100%+12px)] right-0 flex flex-col gap-3 min-w-[48px] items-center"
                >
                  {contactLinks.map((link, i) => {
                    const Icon = link.icon;
                    const colors = SOCIAL_COLORS[link.id];
                    return (
                      <m.a
                        key={link.id}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07, duration: 0.2 }}
                        aria-label={link.label}
                        title={link.label}
                        className={`flex items-center justify-center size-12 rounded-full transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.3)] text-white ${colors.bg} ${colors.hoverBg} border-2 ${colors.border}`}
                      >
                        <Icon className="size-5" />
                      </m.a>
                    );
                  })}
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </header>
  );
}
