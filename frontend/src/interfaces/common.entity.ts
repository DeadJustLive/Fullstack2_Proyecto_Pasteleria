// @pca:start
// @id(interfaces.entity.common)
// @kind(model)
// @limit(lines: 60)
// @contract(BaseEntity, AuditableEntity, PaginationParams, PageResponse)
// @relates(docs.reglas_backend)
// @desc(Interfaces base de persistencia y paginacion para BD y JPA)
// @pca:end
/**
 * @file common.entity.ts
 * @description Interfaces base compartidas para entidades de base de datos y backend.
 */

export interface BaseEntity {
  /** Clave primaria autoincremental (BIGINT en MySQL / Long en JPA) */
  id: number;
  /** Marca de tiempo de creacion en formato ISO-8601 (America/Santiago) */
  createdAt: string;
  /** Marca de tiempo de ultima modificacion en formato ISO-8601 */
  updatedAt: string;
}

export interface AuditableEntity extends BaseEntity {
  /** Marca de tiempo de borrado logico (soft-delete), null si esta activo */
  deletedAt?: string | null;
}

export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
