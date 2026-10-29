export type Categoria = "torta" | "tartaleta" | "cheesecake" | "pastel" | "pancakes";

export type Variacion = "personalizable" | "temporada" | "vendido" | "sin gluten";

export type BadgeTipo = "premium" | "temporada" | "vendido" | "personalizable" | "oferta";

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  precioAnterior?: number;
  enOferta?: boolean;
  imagen: string;
  descripcion: string;
  categorias: Categoria[];
  variaciones: Variacion[];
  badge?: BadgeTipo;
  destacado?: boolean;
  disponible?: boolean;
  stock?: number;
}
