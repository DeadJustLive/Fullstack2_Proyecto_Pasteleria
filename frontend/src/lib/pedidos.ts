// Persistencia de pedidos en localStorage (simula un backend).
import { PEDIDOS_DEMO } from "@/data/pedidos";
import { guardarStorage, leerStorage } from "@/lib/storage";
import type { EstadoPedido, Pedido } from "@/types/pedido";

const STORAGE_KEY = "cremeco-pedidos";
const ESTADOS_KEY = "cremeco-pedidos-estados";

function leerGuardados(): Pedido[] {
  return leerStorage<Pedido[]>(STORAGE_KEY, []);
}

function leerEstados(): Record<string, EstadoPedido> {
  return leerStorage<Record<string, EstadoPedido>>(ESTADOS_KEY, {});
}

// Pedidos reales (checkout) + demo, del mas reciente al mas antiguo.
// Los cambios de estado del admin se guardan aparte para no duplicar los demo.
export function obtenerPedidos(): Pedido[] {
  const estados = leerEstados();

  return [...leerGuardados(), ...PEDIDOS_DEMO]
    .map((pedido) =>
      estados[pedido.id] ? { ...pedido, estado: estados[pedido.id] } : pedido
    )
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export function guardarPedido(pedido: Pedido): void {
  guardarStorage(STORAGE_KEY, [pedido, ...leerGuardados()]);

  // Si el id se reutiliza, el pedido nuevo no debe heredar un estado viejo.
  const estados = leerEstados();
  if (estados[pedido.id]) {
    delete estados[pedido.id];
    guardarStorage(ESTADOS_KEY, estados);
  }
}

export function actualizarEstadoPedido(id: string, estado: EstadoPedido): void {
  guardarStorage(ESTADOS_KEY, { ...leerEstados(), [id]: estado });
}

export function obtenerUltimoPedidoGuardado(): Pedido | undefined {
  return leerGuardados()[0];
}

export function crearIdPedido(): string {
  const mayor = Math.max(0, ...obtenerPedidos().map((p) => Number(p.id)));
  return String(mayor + 1);
}

// Entrega estimada: 2 dias despues de la compra.
export function entregaEstimada(pedido: Pedido): Date {
  const fecha = new Date(pedido.fecha);
  fecha.setDate(fecha.getDate() + 2);
  return fecha;
}
