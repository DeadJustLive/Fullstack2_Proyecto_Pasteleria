// @pca:start
// @id(interfaces.entity.catalog)
// @kind(model)
// @limit(lines: 110)
// @contract(CategoryEntity, ProductEntity, ProductVariationEntity, PersonalizationOptionEntity)
// @relates(interfaces.entity.common)
// @relates(docs.reglas_backend)
// @desc(Entidades de productos, categorias, variaciones y personalizacion)
// @pca:end
/**
 * @file catalog.entity.ts
 * @description Entidades de catalogo, categorias y personalizacion de productos para MySQL y JPA.
 */

import { AuditableEntity, BaseEntity } from "./common.entity";

export type ProductBadgeTipo = "premium" | "temporada" | "vendido" | "personalizable";

/**
 * Tabla: `categories`
 * Entidad JPA: `com.cremeco.pasteleria.catalog.model.Category`
 */
export interface CategoryEntity extends BaseEntity {
  /** Slug unico para URL (ej: 'tortas-clasicas', 'pasteleria-individual') */
  slug: string;
  /** Nombre visible de la categoria */
  nombre: string;
  /** Descripcion de la categoria */
  descripcion?: string | null;
  /** Orden de despliegue en la tienda y filtros */
  orden: number;
  /** Si la categoria se encuentra visible publicamente */
  isActive: boolean;
}

/**
 * Tabla: `products`
 * Entidad JPA: `com.cremeco.pasteleria.catalog.model.Product`
 */
export interface ProductEntity extends AuditableEntity {
  /** Slug unico amigable (ej: 'torta-chocolate-frutillas') */
  slug: string;
  /** Nombre del producto */
  nombre: string;
  /** Descripcion completa de ingredientes y preparacion */
  descripcion: string;
  /** Precio en pesos chilenos enteros (CLP sin decimales) */
  precio: number;
  /** URL o ruta relativa a la imagen principal */
  imagenUrl: string;
  /** Insignia decorativa de marketing */
  badge?: ProductBadgeTipo | null;
  /** Estado de publicacion en el catalogo */
  isActive: boolean;
  /** Si aparece en la seccion de destacados de la Home */
  isFeatured: boolean;
  /** Stock actual disponible (para productos pre-elaborados o diarios) */
  stock: number;
  /** Categorias asociadas (relacion ManyToMany con `categories`) */
  categories?: CategoryEntity[];
  /** Variaciones de tamano o porciones disponibles */
  variations?: ProductVariationEntity[];
}

/**
 * Tabla: `product_variations`
 * Entidad JPA: `com.cremeco.pasteleria.catalog.model.ProductVariation`
 */
export interface ProductVariationEntity extends BaseEntity {
  /** FK hacia `products.id` */
  productId: number;
  /** Nombre de la variacion (ej: '10 personas', '20 personas', '30 personas') */
  nombre: string;
  /** Ajuste sobre el precio base en CLP (positivo o negativo) */
  precioAjuste: number;
  /** Codigo de inventario SKU */
  sku?: string | null;
  /** Stock especifico para esta variante */
  stock: number;
}

/**
 * Tabla: `personalization_options`
 * Entidad JPA: `com.cremeco.pasteleria.catalog.model.PersonalizationOption`
 */
export interface PersonalizationOptionEntity extends BaseEntity {
  /** Tipo de opcion: 'porciones' | 'bizcocho' | 'relleno' | 'cobertura' | 'decoracion' */
  tipo: "porciones" | "bizcocho" | "relleno" | "cobertura" | "decoracion";
  /** Nombre de la opcion (ej: 'Red Velvet', 'Ganache de Chocolate') */
  nombre: string;
  /** Descripcion de la opcion */
  descripcion?: string | null;
  /** Costo adicional en CLP enteros (0 si no tiene recargo) */
  precioExtra: number;
  /** Estado de disponibilidad en cocina */
  disponible: boolean;
}
