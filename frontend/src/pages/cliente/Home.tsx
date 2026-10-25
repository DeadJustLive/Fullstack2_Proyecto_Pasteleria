// @pca:start
// @id(frontend.pages.cliente.home)
// @kind(component)
// @limit(lines: 60)
// @contract(sin props)
// @relates(frontend.domain.heroHome)
// @relates(frontend.domain.carouselDestacados)
// @relates(frontend.domain.sobreNosotros)
// @relates(frontend.domain.blogRecientes)
// @relates(frontend.data.articles)
// @desc(Orquestador de la Home: compono las secciones de dominio)
// @pca:end
import { BannerServicios } from "@/components/domain/BannerServicios";
import { BlogRecientes } from "@/components/domain/BlogRecientes";
import { CarouselDestacados } from "@/components/domain/CarouselDestacados";
import { HeroHome } from "@/components/domain/HeroHome";
import { SobreNosotros } from "@/components/domain/SobreNosotros";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useRealtimeProducts } from "@/hooks/useRealtimeProducts";

const BENEFICIOS = [
  "Horneado fresco a diario",
  "Ingredientes 100% naturales",
  "Opciones personalizadas",
  "Entrega a domicilio segura",
];

export function Home() {
  const { productos } = useRealtimeProducts();
  const destacados = productos.filter((producto) => producto.destacado);

  return (
    <>
      <HeroHome />

      <BannerServicios items={BENEFICIOS} />

      <SectionTitle
        eyebrow="Nuestras recomendaciones"
        titulo="Las Creaciones Destacadas de la Semana"
      />

      <CarouselDestacados productos={destacados} />

      <SobreNosotros />

      <BlogRecientes />
    </>
  );
}
