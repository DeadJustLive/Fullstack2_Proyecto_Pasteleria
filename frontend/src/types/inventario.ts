import type { Categoria } from "@/types/product";

export type CategoriaInventario = Categoria | "otros";

export type EstadoStock = "agotado" | "bajo" | "disponible";

export interface ItemInventario {
  id: number;
  nombre: string;
  categoria: CategoriaInventario;
  stock: number;
  precio: number;
  imagen?: string;
}

export type DatosProducto = Omit<ItemInventario, "id" | "imagen">;
