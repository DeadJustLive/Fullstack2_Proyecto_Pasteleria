// @pca:start
// @id(interfaces.entity.rbac)
// @kind(model)
// @limit(lines: 70)
// @contract(RoleEntity, PermissionEntity, UserRoleEntity, RolePermissionEntity)
// @relates(interfaces.entity.common)
// @relates(docs.reglas_backend)
// @desc(Entidades de roles, permisos y tablas intermedias RBAC para MySQL y JPA)
// @pca:end
/**
 * @file rbac.entity.ts
 * @description Entidades de control de acceso basado en roles y permisos (RBAC) para MySQL y JPA.
 */

import { BaseEntity } from "./common.entity";

/**
 * Tabla: `roles`
 * Entidad JPA: `com.cremeco.pasteleria.identity.model.Role`
 */
export interface RoleEntity extends BaseEntity {
  /** Codigo unico del rol: 'ADMIN', 'CLIENTE', 'VENDEDOR', 'PASTELERO', etc. */
  code: string;
  /** Nombre amigable para mostrar en admin */
  name: string;
  /** Descripcion de responsabilidades del rol */
  description?: string | null;
  /** Si es rol protegido del sistema (no eliminable) */
  isSystem: boolean;
  /** Permisos asociados al rol */
  permissions?: PermissionEntity[];
}

/**
 * Tabla: `permissions`
 * Entidad JPA: `com.cremeco.pasteleria.identity.model.Permission`
 */
export interface PermissionEntity extends BaseEntity {
  /** Clave unica del permiso (ej: 'users.read', 'orders.manage', 'catalog.edit') */
  code: string;
  /** Modulo al que pertenece (ej: 'users', 'orders', 'inventory', 'catalog') */
  module: string;
  /** Accion especifica (ej: 'read', 'create', 'update', 'delete', 'manage') */
  action: string;
  /** Descripcion legible para administradores */
  description: string;
}

/**
 * Tabla pivot: `user_roles`
 */
export interface UserRoleEntity {
  userId: number;
  roleId: number;
  assignedAt: string;
}

/**
 * Tabla pivot: `role_permissions`
 */
export interface RolePermissionEntity {
  roleId: number;
  permissionId: number;
}
