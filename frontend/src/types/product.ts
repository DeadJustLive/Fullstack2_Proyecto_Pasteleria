export type Categoria = "torta" | "tartaleta" | "cheesecake" | "pastel" | "pancakes";

export type Variacion = "personalizable" | "temporada" | "vendido" | "sin gluten";

export type BadgeTipo = "premium" | "temporada" | "vendido" | "personalizable";

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  imagen: string;
  descripcion: string;
  categorias: Categoria[];
  variaciones: Variacion[];
  badge?: BadgeTipo;
  destacado?: boolean;
  ingredientes?: string[];
  nota?: string;
}
