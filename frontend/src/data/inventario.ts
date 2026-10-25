import { productos } from "@/data/products";
import type {
  CategoriaInventario,
  EstadoStock,
  ItemInventario,
} from "@/types/inventario";

export const LABEL_CATEGORIA_INVENTARIO: Record<CategoriaInventario, string> = {
  torta: "Tortas",
  tartaleta: "Tartaletas",
  cheesecake: "Cheesecakes",
  pastel: "Pasteles",
  pancakes: "Pancakes",
  otros: "Otros",
};

export const CATEGORIAS_INVENTARIO = (
  Object.keys(LABEL_CATEGORIA_INVENTARIO) as CategoriaInventario[]
).map((value) => ({ value, label: LABEL_CATEGORIA_INVENTARIO[value] }));

export const ESTADO_STOCK: Record<
  EstadoStock,
  { label: string; tono: "danger" | "warning" | "success" }
> = {
  agotado: { label: "Agotado", tono: "danger" },
  bajo: { label: "Stock bajo", tono: "warning" },
  disponible: { label: "Disponible", tono: "success" },
};

// Stock de demostracion. El resto de datos viene del catalogo tipado.
const STOCK_INICIAL: Record<number, number> = {
  1: 12,
  2: 6,
  3: 25,
  4: 0,
  5: 3,
  6: 8,
  7: 5,
  8: 10,
};

export const INVENTARIO_INICIAL: ItemInventario[] = productos.map((producto) => ({
  id: producto.id,
  nombre: producto.nombre,
  categoria: producto.categorias[0] ?? "otros",
  stock: STOCK_INICIAL[producto.id] ?? 0,
  precio: producto.precio,
  imagen: producto.imagen,
}));
