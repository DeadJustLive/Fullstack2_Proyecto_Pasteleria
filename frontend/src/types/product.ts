// @pca:start
// @id(frontend.types.product)
// @kind(component)
// @limit(lines: 200)
// @contract(Categoria, Variacion, BadgeTipo, Producto)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (product.ts))
// @pca:end
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
