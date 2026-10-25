// @pca:start
// @id(interfaces.entity.audit)
// @kind(model)
// @limit(lines: 60)
// @contract(AuditLogEntity)
// @relates(interfaces.entity.common)
// @relates(docs.reglas_backend)
// @desc(Entidades de registro de auditoria y trazabilidad de operaciones)
// @pca:end
/**
 * @file audit.entity.ts
 * @description Entidades de registro de auditoria y trazabilidad del sistema para MySQL y JPA.
 */

import { BaseEntity } from "./common.entity";

/**
 * Tabla: `audit_logs`
 * Entidad JPA: `com.cremeco.pasteleria.identity.model.AuditLog`
 */
export interface AuditLogEntity extends BaseEntity {
  /** FK opcional hacia `users.id` (null si fue una accion publica o del sistema) */
  actorId?: number | null;
  /** Accion ejecutada (ej: 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'USER_CREATED', 'ORDER_STATUS_CHANGED') */
  action: string;
  /** Tipo de entidad afectada (ej: 'User', 'Order', 'Role', 'Product') */
  entityType: string;
  /** ID de la entidad afectada */
  entityId?: string | number | null;
  /** Informacion previa y posterior serializada en JSON */
  metadata?: Record<string, unknown> | null;
  /** Direccion IP desde donde se origino la peticion */
  ipAddress?: string | null;
  /** Agente de usuario o navegador */
  userAgent?: string | null;
}
