import { createContext, useContext } from "react";
import type { Producto } from "@/types/product";

export interface CartItem {
  producto: Producto;
  cantidad: number;
}

export interface CartContextValue {
  items: CartItem[];
  cupon: string | null;
  cantidadTotal: number;
  subtotal: number;
  descuento: number;
  envio: number;
  total: number;
  agregar: (producto: Producto) => void;
  quitar: (productoId: number) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  aplicarCupon: (codigo: string) => boolean;
  quitarCupon: () => void;
  vaciar: () => void;
}

export const ENVIO = 8000;

export const CUPONES: Record<string, number> = {
  CREME10: 0.1,
  DULCE15: 0.15,
};

export const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const contexto = useContext(CartContext);
  if (!contexto) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return contexto;
}
