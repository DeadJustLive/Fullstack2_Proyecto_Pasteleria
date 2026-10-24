import { ENVIO } from "@/context/cart";
import { productos } from "@/data/products";
import type {
  DatosEntrega,
  EstadoPedido,
  ItemPedido,
  MetodoPago,
  Pedido,
} from "@/types/pedido";

export const LABEL_METODO: Record<MetodoPago, string> = {
  tarjeta: "Tarjeta de crédito o débito",
  transferencia: "Transferencia bancaria",
  efectivo: "Pago contra entrega",
};

export const LABEL_ESTADO: Record<EstadoPedido, string> = {
  recibido: "Recibido",
  preparacion: "En preparación",
  listo: "Listo para despacho",
  camino: "En camino",
  entregado: "Entregado",
};

// Orden de las etapas del seguimiento (stepper de Envio).
export const ETAPAS_PEDIDO: { estado: EstadoPedido; titulo: string; nota: string }[] = [
  { estado: "recibido", titulo: "Pedido recibido", nota: "Recibimos tu pedido" },
  { estado: "preparacion", titulo: "En preparación", nota: "Amasando con amor" },
  { estado: "listo", titulo: "Listo para despacho", nota: "Empacando tu pedido" },
  { estado: "camino", titulo: "En camino", nota: "Tu repartidor va hacia tu dirección" },
  { estado: "entregado", titulo: "Entregado", nota: "¡Que lo disfrutes!" },
];

// ---------------------------------------------------------------------------
// Pedidos de demostracion (mock). Se mezclan con los pedidos reales que el
// Checkout guarda en localStorage, para que Perfil, Envio y Dashboard tengan
// datos desde el primer dia. Se eliminan cuando exista backend.
// ---------------------------------------------------------------------------
const ENTREGA_DEMO: DatosEntrega = {
  nombre: "Ana García",
  email: "ana.garcia@mail.com",
  telefono: "+56 9 9153 2345",
  direccion: "Estación Venezuela 1234",
  comuna: "Santiago",
};

function item(productoId: number, cantidad = 1): ItemPedido {
  return {
    producto: productos.find((p) => p.id === productoId) ?? productos[0],
    cantidad,
  };
}

function pedidoDemo(
  id: string,
  fecha: string,
  estado: EstadoPedido,
  items: ItemPedido[],
  metodoPago: MetodoPago = "tarjeta"
): Pedido {
  const subtotal = items.reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0);
  return {
    id,
    fecha,
    estado,
    items,
    cupon: null,
    subtotal,
    descuento: 0,
    envio: ENVIO,
    total: subtotal + ENVIO,
    metodoPago,
    entrega: ENTREGA_DEMO,
  };
}

export const PEDIDOS_DEMO: Pedido[] = [
  pedidoDemo("1046", "2026-10-23T09:30:00", "preparacion", [item(2), item(1)]),
  pedidoDemo("1045", "2026-10-22T11:10:00", "listo", [item(7)], "transferencia"),
  pedidoDemo("1044", "2026-10-20T16:45:00", "camino", [item(6, 2)]),
  pedidoDemo("1042", "2026-10-12T10:05:00", "entregado", [item(1), item(4)]),
  pedidoDemo("1041", "2026-10-09T13:20:00", "entregado", [item(8), item(5)], "efectivo"),
  pedidoDemo("0985", "2026-09-28T15:00:00", "entregado", [item(3)]),
];
