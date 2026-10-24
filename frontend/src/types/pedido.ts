import type { Producto } from "@/types/product";

export type MetodoPago = "tarjeta" | "transferencia" | "efectivo";

export type EstadoPedido =
  | "recibido"
  | "preparacion"
  | "listo"
  | "camino"
  | "entregado";

export interface ItemPedido {
  producto: Producto;
  cantidad: number;
}

export interface DatosEntrega {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  comuna: string;
}

// El producto se guarda completo para conservar el precio pagado en esa fecha.
export interface Pedido {
  id: string;
  fecha: string; // ISO 8601
  estado: EstadoPedido;
  items: ItemPedido[];
  cupon: string | null;
  subtotal: number;
  descuento: number;
  envio: number;
  total: number;
  metodoPago: MetodoPago;
  entrega: DatosEntrega;
}
