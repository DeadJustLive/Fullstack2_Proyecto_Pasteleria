import { useEffect, useReducer, type ReactNode } from "react";
import {
  CartContext,
  CUPONES,
  ENVIO,
  type CartContextValue,
  type CartItem,
} from "@/context/cart";
import { guardarStorage, leerStorage } from "@/lib/storage";
import type { Producto } from "@/types/product";

interface CartState {
  items: CartItem[];
  cupon: string | null;
}

type Accion =
  | { tipo: "agregar"; producto: Producto }
  | { tipo: "quitar"; productoId: number }
  | { tipo: "cambiarCantidad"; productoId: number; cantidad: number }
  | { tipo: "aplicarCupon"; cupon: string }
  | { tipo: "quitarCupon" }
  | { tipo: "vaciar" };

const STORAGE_KEY = "cremeco-carrito";

const estadoInicial: CartState = { items: [], cupon: null };

function reducer(state: CartState, accion: Accion): CartState {
  switch (accion.tipo) {
    case "agregar": {
      const existe = state.items.some(
        (i) => i.producto.id === accion.producto.id
      );
      return {
        ...state,
        items: existe
          ? state.items.map((i) =>
              i.producto.id === accion.producto.id
                ? { ...i, cantidad: i.cantidad + 1 }
                : i
            )
          : [...state.items, { producto: accion.producto, cantidad: 1 }],
      };
    }
    case "quitar":
      return {
        ...state,
        items: state.items.filter((i) => i.producto.id !== accion.productoId),
      };
    case "cambiarCantidad":
      return {
        ...state,
        items: state.items.map((i) =>
          i.producto.id === accion.productoId
            ? { ...i, cantidad: Math.max(1, accion.cantidad) }
            : i
        ),
      };
    case "aplicarCupon":
      return { ...state, cupon: accion.cupon };
    case "quitarCupon":
      return { ...state, cupon: null };
    case "vaciar":
      return estadoInicial;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    leerStorage(STORAGE_KEY, estadoInicial)
  );

  useEffect(() => {
    guardarStorage(STORAGE_KEY, state);
  }, [state]);

  const subtotal = state.items.reduce(
    (acc, i) => acc + i.producto.precio * i.cantidad,
    0
  );
  const cantidadTotal = state.items.reduce((acc, i) => acc + i.cantidad, 0);
  const descuento =
    state.cupon && subtotal > 0
      ? Math.round(subtotal * (CUPONES[state.cupon] ?? 0))
      : 0;
  const envio = state.items.length > 0 ? ENVIO : 0;
  const total = subtotal - descuento + envio;

  const value: CartContextValue = {
    items: state.items,
    cupon: state.cupon,
    cantidadTotal,
    subtotal,
    descuento,
    envio,
    total,
    agregar: (producto) => dispatch({ tipo: "agregar", producto }),
    quitar: (productoId) => dispatch({ tipo: "quitar", productoId }),
    cambiarCantidad: (productoId, cantidad) =>
      dispatch({ tipo: "cambiarCantidad", productoId, cantidad }),
    aplicarCupon: (codigo) => {
      const normalizado = codigo.trim().toUpperCase();
      if (!(normalizado in CUPONES)) return false;
      dispatch({ tipo: "aplicarCupon", cupon: normalizado });
      return true;
    },
    quitarCupon: () => dispatch({ tipo: "quitarCupon" }),
    vaciar: () => dispatch({ tipo: "vaciar" }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
