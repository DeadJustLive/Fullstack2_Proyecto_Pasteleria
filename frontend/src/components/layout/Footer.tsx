const LINEA_FILA = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
} as const;

const CONTACTOS = [
  {
    icono: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    ),
    texto: "Calle del Sabor 123, Barrio Dulce",
  },
  {
    icono: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
      </svg>
    ),
    texto: "+56 9 1234 5678",
  },
  {
    icono: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
      </svg>
    ),
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
    <footer>
      <div className="footer-container">
        <div className="footer-col">
          <h4>Crème &amp; Co</h4>
          <p>
            Tu pastelería artesanal de confianza. Horneamos cada día con ingredientes 100%
            naturales y muchísimo amor.
          </p>
        </div>
        <div className="footer-col">
          <h4>Contacto</h4>
          {CONTACTOS.map((contacto) => (
            <p style={LINEA_FILA} key={contacto.texto}>
              {contacto.icono} {contacto.texto}
            </p>
          ))}
        </div>
        <div className="footer-col">
          <h4>Horarios</h4>
          {HORARIOS.map((horario) => (
            <p key={horario}>{horario}</p>
          ))}
        </div>
        <div className="footer-col">
          <h4>Redes Sociales</h4>
          <ul>
            {REDES_SOCIALES.map((red) => (
              <li key={red.nombre}>
                <a href="#" style={LINEA_FILA}>
                  {red.icono} {red.nombre}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; 2026 Pastelería Crème &amp; Co. Todos los derechos reservados.
      </div>
    </footer>
  );
}