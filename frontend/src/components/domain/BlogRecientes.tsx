// @pca:start
// @id(frontend.domain.blogRecientes)
// @kind(component)
// @limit(lines: 60)
// @contract(sin props)
// @relates(frontend.ui.buttonLink)
// @relates(frontend.ui.sectionTitle)
// @relates(frontend.components.domain.blogcard)
// @desc(Grid de artículos recientes del blog en la Home)
// @pca:end
import { BlogCard } from "@/components/domain/BlogCard";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { blogPosts } from "@/data/blog";

/** Grid con las últimas entradas del blog reutilizando BlogCard e interacciones sociales. */
export function BlogRecientes() {
  const recientes = blogPosts.slice(0, 3);

  return (
    <section className="mb-16 rounded-2xl border border-tertiary/[0.12] bg-white p-5 shadow-[0_1px_3px_rgba(93,64,55,0.06)] sm:p-8">
      <div className="mb-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <SectionTitle
          eyebrow="Comunidad & Recetas"
          titulo="Nuestro Blog Dulce"
          align="left"
          spacing="compact"
          className="mb-0"
        />
        <ButtonLink to="/blog" variant="outline" size="sm">
          Ver todos los artículos
        </ButtonLink>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recientes.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
