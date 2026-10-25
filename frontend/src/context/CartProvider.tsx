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
                ? { ...i, cantidad: Math.min(99, i.cantidad + 1) }
                : i
            )
          : [...state.items, { producto: accion.producto, cantidad: 1 }],
      };
    }
    case "quitar": {
      const nuevosItems = state.items.filter((i) => i.producto.id !== accion.productoId);
      return {
        ...state,
        items: nuevosItems,
        cupon: nuevosItems.length === 0 ? null : state.cupon,
      };
    }
    case "cambiarCantidad": {
      if (accion.cantidad <= 0) {
        const itemsSinProducto = state.items.filter((i) => i.producto.id !== accion.productoId);
        return {
          ...state,
          items: itemsSinProducto,
          cupon: itemsSinProducto.length === 0 ? null : state.cupon,
        };
      }
      const cantidadSegura = Math.min(99, Math.max(1, Math.round(accion.cantidad)));
      return {
        ...state,
        items: state.items.map((i) =>
          i.producto.id === accion.productoId
            ? { ...i, cantidad: cantidadSegura }
            : i
        ),
      };
    }
    case "aplicarCupon": {
      const cuponLimpio = accion.cupon.trim().toUpperCase();
      return { ...state, cupon: cuponLimpio || null };
    }
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
