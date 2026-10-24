// Persistencia de pedidos en localStorage (simula un backend).
import { PEDIDOS_DEMO } from "@/data/pedidos";
import { guardarStorage, leerStorage } from "@/lib/storage";
import type { Pedido } from "@/types/pedido";

const STORAGE_KEY = "cremeco-pedidos";

function leerGuardados(): Pedido[] {
  return leerStorage<Pedido[]>(STORAGE_KEY, []);
}

// Pedidos reales (checkout) + demo, del mas reciente al mas antiguo.
export function obtenerPedidos(): Pedido[] {
  return [...leerGuardados(), ...PEDIDOS_DEMO].sort((a, b) =>
    b.fecha.localeCompare(a.fecha)
  );
}

export function guardarPedido(pedido: Pedido): void {
  guardarStorage(STORAGE_KEY, [pedido, ...leerGuardados()]);
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
