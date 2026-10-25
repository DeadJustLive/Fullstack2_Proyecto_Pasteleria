// @pca:start
// @id(interfaces.entity.blog)
// @kind(model)
// @limit(lines: 60)
// @contract(BlogPostEntity)
// @relates(interfaces.entity.common)
// @relates(docs.reglas_backend)
// @desc(Entidades de publicaciones editoriales y articulos del blog)
// @pca:end
/**
 * @file blog.entity.ts
 * @description Entidades de contenido editorial, noticias y blog para MySQL y JPA.
 */

import { BaseEntity } from "./common.entity";

/**
 * Tabla: `blog_posts`
 * Entidad JPA: `com.cremeco.pasteleria.content.model.BlogPost`
 */
export interface BlogPostEntity extends BaseEntity {
  /** Slug unico para URL (ej: 'secretos-del-chocolate-belga') */
  slug: string;
  /** Titulo principal del articulo */
  titulo: string;
  /** Resumen o extracto introductorio */
  extracto: string;
  /** Contenido completo en texto plano o JSON/Markdown */
  contenido: string[];
  /** Nombre del autor o repostero redactor */
  autor: string;
  /** Categoria editorial (ej: 'recetas', 'novedades', 'consejos', 'eventos') */
  categoria: string;
  /** URL de la imagen de portada */
  imagenUrl: string;
  /** Tiempo estimado de lectura (ej: '3 min') */
  tiempoLectura: string;
  /** Fecha en que se publico formalmente */
  publicadoAt: string;
  /** Si aparece destacado en la Home */
  isFeatured: boolean;
  /** Si el articulo se encuentra visible publicamente */
  isPublished: boolean;
}
