// @pca:start
// @id(interfaces.entity.order)
// @kind(model)
// @limit(lines: 150)
// @contract(OrderEntity, OrderItemEntity, OrderStatusHistoryEntity, OrderPickupEntity, OrderDeliveryAddressEntity)
// @relates(interfaces.entity.common)
// @relates(interfaces.entity.catalog)
// @relates(docs.reglas_backend)
// @desc(Entidades de pedidos, items, historial de estados y recogedor)
// @pca:end
/**
 * @file order.entity.ts
 * @description Entidades de pedidos, seguimiento e items de compra para MySQL y JPA.
 */

import { BaseEntity } from "./common.entity";
import { ProductEntity } from "./catalog.entity";

export type OrderStatus =
  | "PENDIENTE"
  | "CONFIRMADO"
  | "EN_PREPARACION"
  | "LISTO_RETIRO"
  | "EN_CAMINO"
  | "ENTREGADO"
  | "CANCELADO";

export type DeliveryType = "RETIRO_TIENDA" | "DESPACHO_DOMICILIO";

/**
 * Tabla: `orders`
 * Entidad JPA: `com.cremeco.pasteleria.orders.model.Order`
 */
export interface OrderEntity extends BaseEntity {
  /** Codigo unico legible de cara al cliente (ej: 'CC-2025-001234') */
  codigoSeguimiento: string;
  /** FK hacia `users.id` (quien realiza la compra) */
  userId: number;
  /** Modalidad de entrega */
  tipoEntrega: DeliveryType;
  /** Estado actual del pedido dentro de la maquina de estados */
  estado: OrderStatus;
  /** Subtotal de items en CLP enteros */
  subtotal: number;
  /** Descuento aplicado por cupon en CLP enteros */
  descuento: number;
  /** Costo de envio en CLP enteros (0 si es retiro en tienda) */
  costoEnvio: number;
  /** Monto total final pagado o por pagar en CLP */
  total: number;
  /** Fecha estimada de retiro o recepcion */
  fechaEntregaEstimada?: string | null;
  /** Notas o requerimientos especiales del cliente */
  notasCliente?: string | null;
  /** Clave de idempotencia para prevenir cobros duplicados */
  idempotencyKey?: string | null;
  /** Lista de productos incluidos en el pedido */
  items?: OrderItemEntity[];
  /** Historial cronologico de cambios de estado */
  historialEstados?: OrderStatusHistoryEntity[];
  /** Informacion de la persona que retira en tienda (si aplica) */
  recogedor?: OrderPickupEntity | null;
  /** Direccion de despacho a domicilio (si aplica) */
  direccionDespacho?: OrderDeliveryAddressEntity | null;
}

/**
 * Tabla: `order_items`
 * Entidad JPA: `com.cremeco.pasteleria.orders.model.OrderItem`
 */
export interface OrderItemEntity extends BaseEntity {
  /** FK hacia `orders.id` */
  orderId: number;
  /** FK hacia `products.id` */
  productId: number;
  /** Snapshot del nombre del producto al momento de comprar */
  productoNombre: string;
  /** Cantidad de unidades solicitadas */
  cantidad: number;
  /** Precio unitario historico congelado en CLP enteros */
  precioUnitario: number;
  /** Total de la linea (`cantidad * precioUnitario`) */
  subtotal: number;
  /** Detalle de personalizacion (ej: bizcocho, sabor, mensaje) */
  personalizacionDetalle?: string | null;
  /** Referencia al producto */
  producto?: ProductEntity;
}

/**
 * Tabla: `order_status_history`
 * Entidad JPA: `com.cremeco.pasteleria.orders.model.OrderStatusHistory`
 */
export interface OrderStatusHistoryEntity extends BaseEntity {
  /** FK hacia `orders.id` */
  orderId: number;
  /** Estado registrado en el hito */
  estado: OrderStatus;
  /** Mensaje explicativo para el cliente en el tracking */
  descripcion: string;
  /** Usuario o sistema que efectuo la transicion */
  autor?: string | null;
}

/**
 * Tabla: `order_pickups`
 * Entidad JPA: `com.cremeco.pasteleria.orders.model.OrderPickup`
 */
export interface OrderPickupEntity extends BaseEntity {
  /** FK hacia `orders.id` (1 a 1) */
  orderId: number;
  /** Nombre completo de quien retira */
  nombre: string;
  /** RUT chileno de quien retira (validado) */
  rut: string;
  /** Telefono de contacto del recogedor */
  telefono: string;
}

/**
 * Tabla: `order_delivery_addresses`
 * Entidad JPA: `com.cremeco.pasteleria.orders.model.OrderDeliveryAddress`
 */
export interface OrderDeliveryAddressEntity extends BaseEntity {
  /** FK hacia `orders.id` */
  orderId: number;
  calle: string;
  depto?: string | null;
  comuna: string;
  region: string;
  codigoPostal?: string | null;
  instrucciones?: string | null;
}
