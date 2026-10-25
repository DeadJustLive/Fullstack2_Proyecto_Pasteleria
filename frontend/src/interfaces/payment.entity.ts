// @pca:start
// @id(interfaces.entity.payment)
// @kind(model)
// @limit(lines: 80)
// @contract(PaymentEntity, CouponEntity)
// @relates(interfaces.entity.common)
// @relates(docs.reglas_backend)
// @desc(Entidades de transacciones de pago, pasarelas y cupones de descuento)
// @pca:end
/**
 * @file payment.entity.ts
 * @description Entidades de transacciones de pago y cupones de descuento para MySQL y JPA.
 */

import { BaseEntity } from "./common.entity";

export type PaymentMethod = "WEBPAY_PLUS" | "TRANSFERENCIA_BANCARIA" | "EFECTIVO_POS" | "FLOW";

export type PaymentStatus = "PENDIENTE" | "PAGADO" | "RECHAZADO" | "REEMBOLSADO";

export type CouponType = "PORCENTAJE" | "MONTO_FIJO";

/**
 * Tabla: `payments`
 * Entidad JPA: `com.cremeco.pasteleria.orders.model.Payment`
 */
export interface PaymentEntity extends BaseEntity {
  /** FK hacia `orders.id` */
  orderId: number;
  /** Metodo de pago utilizado */
  metodoPago: PaymentMethod;
  /** Estado de la transaccion */
  estadoPago: PaymentStatus;
  /** Monto total procesado en CLP enteros */
  monto: number;
  /** Identificador externo devuelto por la pasarela (Webpay/Flow) */
  transaccionId?: string | null;
  /** Codigo de autorizacion bancario */
  codigoAutorizacion?: string | null;
  /** Ultimos 4 digitos de la tarjeta utilizada */
  ultimosCuatroDigitos?: string | null;
  /** Fecha en que se confirmo exitosamente el pago */
  pagadoAt?: string | null;
  /** Payload o respuesta serializada del webhook para auditoria */
  datosRespuestaPasarela?: string | null;
}

/**
 * Tabla: `coupons`
 * Entidad JPA: `com.cremeco.pasteleria.orders.model.Coupon`
 */
export interface CouponEntity extends BaseEntity {
  /** Codigo alfanumerico unico (ej: 'BIENVENIDA10', 'DULCE2025') */
  codigo: string;
  /** Tipo de descuento */
  tipoDescuento: CouponType;
  /** Valor del descuento (porcentaje 1-100 o monto CLP) */
  valor: number;
  /** Monto minimo de compra requerido en CLP */
  compraMinima?: number | null;
  /** Cantidad maxima de usos permitidos en total */
  limiteUsos?: number | null;
  /** Cantidad de veces que ha sido aplicado */
  usosActuales: number;
  /** Fecha limite de validez */
  fechaExpiracion?: string | null;
  /** Si el cupon se encuentra habilitado para canje */
  isActive: boolean;
}
