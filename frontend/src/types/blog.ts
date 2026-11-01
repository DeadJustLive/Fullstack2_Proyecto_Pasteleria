// @pca:start
// @id(frontend.types.blog)
// @kind(component)
// @limit(lines: 200)
// @contract(BlogCategoria, BlogPost)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (blog.ts))
// @pca:end
export type BlogCategoria = "recetas" | "tips" | "novedades" | "historia";

export interface BlogPost {
  id: number;
  slug: string;
  titulo: string;
  extracto: string;
  contenido: string[];
  imagen: string;
  categoria: BlogCategoria;
  autor: string;
  fecha: string;
  tiempoLectura: string;
  destacado?: boolean;
}
