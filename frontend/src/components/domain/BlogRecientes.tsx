// @pca:start
// @id(frontend.domain.blogRecientes)
// @kind(component)
// @limit(lines: 60)
// @contract(sin props)
// @relates(frontend.ui.buttonLink)
// @relates(frontend.ui.sectionTitle)
// @relates(frontend.data.articles)
// @desc(Grid de artículos recientes del blog en la Home)
// @pca:end
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ARTICULOS } from "@/data/articles";

/** Grid con las últimas entradas del blog. */
export function BlogRecientes() {
  return (
    <section className="mb-16 rounded-xl border border-tertiary/[0.12] bg-white p-6 shadow-[0_1px_3px_rgba(93,64,55,0.06)] sm:p-8">
      <SectionTitle eyebrow="Últimas Noticias" titulo="Nuestro Blog Dulce" />

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ARTICULOS.map((articulo) => (
          <li key={articulo.slug}>
            <article className="flex h-full flex-col rounded-xl border border-tertiary/[0.12] bg-white p-6 shadow-[0_1px_3px_rgba(93,64,55,0.06)]">
              <h3 className="mb-3 text-[0.95rem]">{articulo.titulo}</h3>
              <p className="mb-6 flex-1 text-[0.95rem] opacity-85">{articulo.resumen}</p>
              <ButtonLink
                to={`/blog/${articulo.slug}`}
                variant="outline"
                size="sm"
                className="self-start"
              >
                Leer artículo
              </ButtonLink>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
