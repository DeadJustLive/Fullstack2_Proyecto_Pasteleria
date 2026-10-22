// @pca:start
// @id(frontend.data.articles)
// @kind(service)
// @limit(lines: 40)
// @contract(export ARTICULOS: Articulo[])
// @relates(docs.reglas_ui)
// @desc(Datos de los artículos del blog destacados en la Home)
// @pca:end
export interface Articulo {
  slug: string;
  titulo: string;
  resumen: string;
}

/** Artículos del blog destacados en la Home. */
export const ARTICULOS: Articulo[] = [
  {
    slug: "secretos-del-chocolate-oscuro",
    titulo: "5 Secretos del Chocolate Oscuro",
    resumen:
      "Descubre por qué usamos cacao al 70% en todas nuestras preparaciones premium.",
  },
  {
    slug: "tendencias-en-bodas",
    titulo: "Tendencias en Bodas 2025",
    resumen:
      "Las tortas de pisos minimalistas y con flores naturales se roban el show esta temporada.",
  },
  {
    slug: "receta-galletas-de-vainilla",
    titulo: "Receta: Galletas de Vainilla",
    resumen:
      "Te enseñamos la receta básica que usamos en Crème & Co para hacer en casa con niños.",
  },
];
