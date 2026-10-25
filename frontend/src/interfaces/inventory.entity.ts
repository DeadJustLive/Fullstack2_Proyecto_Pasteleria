// @pca:start
// @id(interfaces.entity.inventory)
// @kind(model)
// @limit(lines: 80)
// @contract(InventoryMovementEntity, CashRegisterEntity)
// @relates(interfaces.entity.common)
// @relates(docs.reglas_backend)
// @desc(Entidades de control de movimientos de inventario y sesiones de caja POS)
// @pca:end
/**
 * @file inventory.entity.ts
 * @description Entidades de control de inventario, stock y punto de venta (POS) para MySQL y JPA.
 */

import { BaseEntity } from "./common.entity";

export type InventoryMovementType = "ENTRADA" | "SALIDA" | "VENTA_POS" | "VENTA_WEB" | "MERMA" | "AJUSTE";

export type CashRegisterStatus = "ABIERTA" | "CERRADA";

/**
 * Tabla: `inventory_movements`
 * Entidad JPA: `com.cremeco.pasteleria.inventory.model.InventoryMovement`
 */
export interface InventoryMovementEntity extends BaseEntity {
  /** FK hacia `products.id` */
  productId: number;
  /** Tipo de movimiento de stock */
  tipo: InventoryMovementType;
  /** Cantidad afectada (positiva o negativa) */
  cantidad: number;
  /** Stock resultante tras el movimiento */
  stockResultante: number;
  /** Motivo u observacion del movimiento */
  motivo?: string | null;
  /** FK hacia `users.id` (quien registro la operacion) */
  userId: number;
  /** FK opcional hacia `orders.id` si proviene de una venta */
  orderId?: number | null;
}

/**
 * Tabla: `cash_registers`
 * Entidad JPA: `com.cremeco.pasteleria.pos.model.CashRegister`
 */
export interface CashRegisterEntity extends BaseEntity {
  /** FK hacia `users.id` (cajero responsable) */
  userId: number;
  /** Monto de apertura en caja en CLP enteros */
  montoApertura: number;
  /** Monto de cierre contabilizado en CLP enteros */
  montoCierre?: number | null;
  /** Total de ventas en efectivo durante el turno */
  ventasEfectivo: number;
  /** Total de ventas con tarjeta durante el turno */
  ventasTarjeta: number;
  /** Estado de la sesion de caja */
  estado: CashRegisterStatus;
  /** Fecha y hora de apertura */
  abiertaAt: string;
  /** Fecha y hora de cierre */
  cerradaAt?: string | null;
  /** Diferencia entre monto esperado y monto real */
  diferencia?: number | null;
  /** Observaciones al cerrar caja */
  observaciones?: string | null;
}
