// @pca:start
// @id(interfaces.entity.user)
// @kind(model)
// @limit(lines: 80)
// @contract(UserEntity, UserAddressEntity, RefreshTokenEntity)
// @relates(interfaces.entity.common)
// @relates(docs.reglas_backend)
// @desc(Entidades de usuarios, direcciones y refresh tokens para MySQL y JPA)
// @pca:end
/**
 * @file user.entity.ts
 * @description Entidades de usuarios, direcciones y sesiones para la base de datos (MySQL) y backend (JPA).
 */

import { AuditableEntity, BaseEntity } from "./common.entity";

/**
 * Tabla: `users`
 * Entidad JPA: `com.cremeco.pasteleria.identity.model.User`
 */
export interface UserEntity extends AuditableEntity {
  /** Correo unico de autenticacion */
  email: string;
  /** Hash seguro bcrypt (nunca texto plano; protegido en responses) */
  passwordHash?: string;
  /** Nombre completo del usuario */
  nombre: string;
  /** Telefono de contacto (+56 9 ...) */
  telefono?: string | null;
  /** Estado de habilitacion de la cuenta */
  isActive: boolean;
  /** Roles asignados al usuario (relacion ManyToMany con `roles`) */
  roleCodes?: string[];
}

/**
 * Tabla: `user_addresses`
 * Entidad JPA: `com.cremeco.pasteleria.identity.model.UserAddress`
 */
export interface UserAddressEntity extends BaseEntity {
  /** FK hacia `users.id` */
  userId: number;
  /** Calle y numero exterior/interior */
  calle: string;
  /** Departamento, oficina o bloque (opcional) */
  depto?: string | null;
  /** Comuna (ej. Providencia, Las Condes) */
  comuna: string;
  /** Region (ej. Region Metropolitana) */
  region: string;
  /** Codigo postal (7 digitos) */
  codigoPostal?: string | null;
  /** Instrucciones de entrega para el repartidor */
  instrucciones?: string | null;
  /** Marca si es la direccion predeterminada para checkout */
  esPredeterminada: boolean;
}

/**
 * Tabla: `refresh_tokens`
 * Entidad JPA: `com.cremeco.pasteleria.identity.model.RefreshToken`
 */
export interface RefreshTokenEntity extends BaseEntity {
  /** FK hacia `users.id` */
  userId: number;
  /** Hash SHA-256 del token opaco emitido */
  tokenHash: string;
  /** Fecha y hora de expiracion */
  expiresAt: string;
  /** Fecha en que fue revocado o rotado (null si esta vigente) */
  revokedAt?: string | null;
}
