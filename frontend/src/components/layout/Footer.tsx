// @pca:start
// @id(frontend.components.layout.footer)
// @kind(component)
// @limit(lines: 200)
// @contract(Footer)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (Footer.tsx))
// @pca:end
import { Clock, Mail, MapPin, Phone } from "lucide-react";

const CONTACTOS = [
  {
    icono: <MapPin size={16} className="shrink-0" />,
    texto: "Calle del Sabor 123, Barrio Dulce",
  },
  {
    icono: <Phone size={16} className="shrink-0" />,
    texto: "+56 9 1234 5678",
  },
  {
    icono: <Mail size={16} className="shrink-0" />,
    texto: "hola@cremeco.cl",
  },
];

const HORARIOS = [
  "Lunes a Viernes: 08:00 - 20:00",
  "Sábados: 09:00 - 18:00",
  "Domingos: Cerrado",
];

const REDES_SOCIALES = [
  {
    nombre: "Instagram",
    icono: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    ),
  },
  {
    nombre: "Facebook",
    icono: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
      </svg>
    ),
  },
  {
    nombre: "TikTok",
    icono: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13"></path>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="18" cy="16" r="3"></circle>
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="relative mt-12 bg-tertiary px-4 py-9 text-center font-body text-[0.95rem] text-neutral">
      <div className="mx-auto grid max-w-page grid-cols-1 gap-8 border-b border-neutral/20 pb-8 text-center sm:grid-cols-2 md:text-left lg:grid-cols-4">
        <div className="flex flex-col gap-2">
          <h4 className="mb-2 font-display text-[1.1rem] font-semibold text-primary">
            Crème &amp; Co
          </h4>
          <p className="text-[0.9rem] leading-[1.4]">
            Tu pastelería artesanal de confianza. Horneamos cada día con ingredientes 100%
            naturales y muchísimo amor.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="mb-2 font-display text-[1.1rem] font-semibold text-primary">
            Contacto
          </h4>
          {CONTACTOS.map((contacto) => (
            <p
              className="flex items-center justify-center gap-2 text-[0.9rem] leading-[1.4] md:justify-start"
              key={contacto.texto}
            >
              {contacto.icono} {contacto.texto}
            </p>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="mb-2 font-display text-[1.1rem] font-semibold text-primary">
            Horarios
          </h4>
          {HORARIOS.map((horario) => (
            <p
              key={horario}
              className="flex items-center justify-center gap-2 text-[0.9rem] leading-[1.4] md:justify-start"
            >
              <Clock size={14} className="shrink-0 opacity-75" />
              {horario}
            </p>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="mb-2 font-display text-[1.1rem] font-semibold text-primary">
            Redes Sociales
          </h4>
          <ul className="list-none flex flex-col gap-2">
            {REDES_SOCIALES.map((red) => (
              <li key={red.nombre}>
                <a
                  href={`https://www.${red.nombre.toLowerCase()}.com`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 text-[0.9rem] text-neutral no-underline transition-colors hover:text-primary md:justify-start"
                >
                  {red.icono} {red.nombre}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 text-center text-[0.85rem] text-neutral/70">
        &copy; 2026 Pastelería Crème &amp; Co. Todos los derechos reservados.
      </div>
    </footer>
  );
}
