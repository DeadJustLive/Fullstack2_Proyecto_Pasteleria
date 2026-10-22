// @pca:start
// @id(frontend.domain.heroHome)
// @kind(component)
// @limit(lines: 80)
// @contract(sin props)
// @relates(frontend.ui.logoCremeCo)
// @relates(frontend.ui.buttonLink)
// @relates(docs.reglas_ui)
// @desc(Banner principal de la Home (full-bleed con .hero-bg y .full-bleed))
// @pca:end
import { ButtonLink } from "@/components/ui/ButtonLink";
import { LogoCremeCo } from "@/components/ui/LogoCremeCo";

/**
 * Banner principal de la Home.
 *
 * Notas de implementacion:
 * - El fondo (degradado + foto) vive en la utilidad `.hero-bg` de `index.css`
 *   porque un `background-image` arbitrario de Tailwind con `url()` es fragil.
 * - `.full-bleed` escapa del `main` de 1080px usando `cqi` (ver `index.css`).
 * - El margen negativo compensa el `padding-top` del `main` para que el hero
 *   toque el header. El valor cambia con el breakpoint porque el padding del
 *   `main` tambien cambia (ver `layouts/ClienteLayout.tsx`).
 */
export function HeroHome() {
  return (
    <section
      aria-labelledby="hero-home-titulo"
      className="hero-bg full-bleed relative -mt-7 mb-16 rounded-none border-0 px-6 py-[clamp(3rem,8vw,6rem)] shadow-none sm:-mt-10"
    >
      <div className="mx-auto flex max-w-[1080px] flex-wrap items-center gap-8 text-left sm:gap-14">
        <div className="basis-[320px] flex-1">
          <p className="mb-2 text-[0.8rem] font-bold uppercase tracking-[0.08em] text-primary">
            Pastelería Artesanal
          </p>
          <h1
            id="hero-home-titulo"
            className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.1] text-neutral"
          >
            Prueba nuestros exclusivos pasteles
          </h1>
          <p className="my-4 max-w-[65ch] text-[1.05rem] text-neutral">
            En Crème &amp; Co elaboramos cada pastel a mano, con ingredientes frescos y
            recetas tradicionales, para cada ocasión especial.
          </p>
          <ButtonLink to="/catalogo" variant="primary" size="lg">
            Ver Catálogo
          </ButtonLink>
        </div>

        <div className="basis-[320px] flex-1">
          <LogoCremeCo className="mx-auto max-w-[400px] transition-transform duration-300 hover:scale-[1.02]" />
        </div>
      </div>
    </section>
  );
}
