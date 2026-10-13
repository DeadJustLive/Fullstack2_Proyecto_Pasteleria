import { Link } from "react-router-dom";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ProductCard } from "@/components/domain/ProductCard";
import { BannerServicios } from "@/components/domain/BannerServicios";
import { productos } from "@/data/products";

const BENEFICIOS = [
  "Horneado fresco a diario",
  "Ingredientes 100% naturales",
  "Opciones personalizadas",
  "Entrega a domicilio segura",
];

const ARTICULOS = [
  {
    titulo: "5 Secretos del Chocolate Oscuro",
    resumen:
      "Descubre por qué usamos cacao al 70% en todas nuestras preparaciones premium.",
  },
  {
    titulo: "Tendencias en Bodas 2025",
    resumen:
      "Las tortas de pisos minimalistas y con flores naturales se roban el show esta temporada.",
  },
  {
    titulo: "Receta: Galletas de Vainilla",
    resumen:
      "Te enseñamos la receta básica que usamos en Crème & Co para hacer en casa con niños.",
  },
];

export function Home() {
  const destacados = productos.filter((p) => p.destacado);

  return (
    <>
      <div className="hero-wrapper">
        <div className="hero-split">
          <div className="hero-text">
            <p className="eyebrow">Pastelería Artesanal</p>
            <h1>Prueba nuestros exclusivos pasteles</h1>
            <p className="tagline">
              En Crème &amp; Co elaboramos cada pastel a mano, con ingredientes frescos y recetas
              tradicionales, para cada ocasión especial.
            </p>
            <Link to="/catalogo" className="btn btn-primary">
              Ver Catálogo
            </Link>
          </div>
          <div className="hero-logo" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 400 300"
              width="100%"
              style={{ filter: "drop-shadow(0px 8px 16px rgba(0,0,0,0.5))" }}
            >
              <defs>
                <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFD9DF" />
                  <stop offset="100%" stopColor="#FFC0CB" />
                </linearGradient>
              </defs>
              <circle cx="200" cy="150" r="140" fill="none" stroke="url(#gold)" strokeWidth="2" opacity="0.8" />
              <circle cx="200" cy="150" r="125" fill="none" stroke="#FFF5E1" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
              <text x="50%" y="45%" fontFamily="'Be Vietnam Pro', sans-serif" fontWeight="700" fontSize="52" fill="url(#gold)" textAnchor="middle" dominantBaseline="middle">
                Crème &amp; Co
              </text>
              <text x="50%" y="60%" fontFamily="'Source Sans 3', sans-serif" fontWeight="600" fontSize="14" fill="#FFF5E1" textAnchor="middle" letterSpacing="6">
                ARTISANAL BAKERY
              </text>
              <path d="M 200 210 L 205 220 L 215 225 L 205 230 L 200 240 L 195 230 L 185 225 L 195 220 Z" fill="url(#gold)" opacity="0.9" />
              <path d="M 200 60 L 205 70 L 215 75 L 205 80 L 200 90 L 195 80 L 185 75 L 195 70 Z" fill="url(#gold)" opacity="0.9" />
            </svg>
          </div>
        </div>
      </div>

      <BannerServicios items={BENEFICIOS} />

      <SectionTitle eyebrow="Nuestras recomendaciones" titulo="Las Creaciones Destacadas de la Semana" />

      <div className="carousel-wrapper">
        <button className="carousel-btn prev" aria-label="Anterior" type="button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div className="carousel">
          {destacados.map((p) => (
            <ProductCard
              key={p.id}
              producto={p}
              className="min-w-[260px] max-w-[300px] flex-[1_0_260px] snap-start min-[960px]:max-w-none min-[960px]:min-w-0 min-[960px]:flex-1"
            />
          ))}
        </div>
        <button className="carousel-btn next" aria-label="Siguiente" type="button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <section className="quienes-somos-split">
        <div className="texto">
          <span className="eyebrow">Nuestra Historia</span>
          <h2>Quiénes Somos</h2>
          <p>
            En Crème &amp; Co, la pastelería es más que una profesión; es una tradición familiar.
            Desde nuestros humildes inicios en una pequeña cocina hasta convertirnos en tu rincón
            dulce favorito, siempre hemos mantenido un compromiso inquebrantable con la calidad.
          </p>
          <p>
            Cada torta, cada galleta y cada postre es elaborado a mano diariamente utilizando solo
            ingredientes 100% naturales y mucho amor. Creemos que cada celebración merece un toque
            mágico, y estamos aquí para hornearlo para ti.
          </p>
        </div>
        <div className="imagen placeholder-img foto" aria-hidden="true">
          <img src="/imagen/macarons.jpg" alt="Equipo de pastelería Crème & Co" />
        </div>
      </section>

      <section className="blog-section" style={{ marginBottom: "4rem" }}>
        <SectionTitle eyebrow="Últimas Noticias" titulo="Nuestro Blog Dulce" />
        <div className="card-grid reco-grid">
          {ARTICULOS.map((articulo) => (
            <div className="product-card" style={{ padding: "1.5rem" }} key={articulo.titulo}>
              <h3 style={{ marginBottom: "0.75rem" }}>{articulo.titulo}</h3>
              <p style={{ fontSize: "0.95rem", opacity: 0.85, marginBottom: "1.5rem" }}>
                {articulo.resumen}
              </p>
              <a href="#" className="btn btn-secondary btn-sm" style={{ alignSelf: "flex-start" }}>
                Leer artículo
              </a>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}