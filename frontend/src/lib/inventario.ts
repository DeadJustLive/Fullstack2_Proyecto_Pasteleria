// Persistencia y reglas de stock del inventario (simula un backend).
import { INVENTARIO_INICIAL } from "@/data/inventario";
import { guardarStorage, leerStorage } from "@/lib/storage";
import type { EstadoStock, ItemInventario } from "@/types/inventario";

const STORAGE_KEY = "cremeco-inventario";

export function obtenerInventario(): ItemInventario[] {
  return leerStorage<ItemInventario[]>(STORAGE_KEY, INVENTARIO_INICIAL);
}

export function guardarInventario(items: ItemInventario[]): void {
  guardarStorage(STORAGE_KEY, items);
}

export function nuevoIdInventario(items: ItemInventario[]): number {
  return Math.max(0, ...items.map((item) => item.id)) + 1;
}

export function estadoStock(stock: number): EstadoStock {
  if (stock <= 0) return "agotado";
  if (stock <= 5) return "bajo";
  return "disponible";
}
