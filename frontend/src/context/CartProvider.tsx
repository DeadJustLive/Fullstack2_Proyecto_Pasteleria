import { useEffect, useReducer, type ReactNode } from "react";
import {
  CartContext,
  ENVIO,
  type CartContextValue,
  type CartItem,
} from "@/context/cart";
import { guardarStorage, leerStorage } from "@/lib/storage";
import { api } from "@/services/api";
import type { Producto } from "@/types/product";

interface CartState {
  items: CartItem[];
  cupon: string | null;
  descuentoPorcentaje: number;
}

type Accion =
  | { tipo: "agregar"; producto: Producto; cantidad?: number }
  | { tipo: "quitar"; productoId: number }
  | { tipo: "cambiarCantidad"; productoId: number; cantidad: number }
  | { tipo: "aplicarCupon"; cupon: string; descuentoPorcentaje: number }
  | { tipo: "quitarCupon" }
  | { tipo: "vaciar" };

const STORAGE_KEY = "cremeco-carrito";

const estadoInicial: CartState = {
  items: [],
  cupon: null,
  descuentoPorcentaje: 0,
};

function reducer(state: CartState, accion: Accion): CartState {
  switch (accion.tipo) {
    case "agregar": {
      const incremento =
        typeof accion.cantidad === "number" && accion.cantidad > 0
          ? Math.round(accion.cantidad)
          : 1;

      const stockMax =
        typeof accion.producto.stock === "number" && accion.producto.stock >= 0
          ? accion.producto.stock
          : 99;

      if (stockMax <= 0) {
        return state;
      }

      const itemExistente = state.items.find(
        (i) => i.producto.id === accion.producto.id
      );

      if (itemExistente) {
        if (itemExistente.cantidad >= stockMax) {
          return state;
        }
        const nuevaCantidad = Math.min(stockMax, itemExistente.cantidad + incremento);
        return {
          ...state,
          items: state.items.map((i) =>
            i.producto.id === accion.producto.id
              ? { ...i, cantidad: nuevaCantidad, producto: accion.producto }
              : i
          ),
        };
      }

      const cantidadInicial = Math.min(stockMax, incremento);
      return {
        ...state,
        items: [...state.items, { producto: accion.producto, cantidad: cantidadInicial }],
      };
    }

    case "quitar": {
      const nuevosItems = state.items.filter((i) => i.producto.id !== accion.productoId);
      const vacio = nuevosItems.length === 0;
      return {
        ...state,
        items: nuevosItems,
        cupon: vacio ? null : state.cupon,
        descuentoPorcentaje: vacio ? 0 : state.descuentoPorcentaje,
      };
    }

    case "cambiarCantidad": {
      if (accion.cantidad <= 0) {
        const itemsSinProducto = state.items.filter((i) => i.producto.id !== accion.productoId);
        const vacio = itemsSinProducto.length === 0;
        return {
          ...state,
          items: itemsSinProducto,
          cupon: vacio ? null : state.cupon,
          descuentoPorcentaje: vacio ? 0 : state.descuentoPorcentaje,
        };
      }

      const itemsActualizados = state.items
        .map((i) => {
          if (i.producto.id !== accion.productoId) return i;
          const stockMax =
            typeof i.producto.stock === "number" && i.producto.stock >= 0
              ? i.producto.stock
              : 99;
          if (stockMax <= 0) {
            return null;
          }
          const cantidadSegura = Math.min(stockMax, Math.max(1, Math.round(accion.cantidad)));
          return { ...i, cantidad: cantidadSegura };
        })
        .filter((i): i is CartItem => i !== null);

      const vacio = itemsActualizados.length === 0;
      return {
        ...state,
        items: itemsActualizados,
        cupon: vacio ? null : state.cupon,
        descuentoPorcentaje: vacio ? 0 : state.descuentoPorcentaje,
      };
    }

    case "aplicarCupon": {
      const cuponLimpio = accion.cupon.trim().toUpperCase();
      return {
        ...state,
        cupon: cuponLimpio || null,
        descuentoPorcentaje: accion.descuentoPorcentaje,
      };
    }

    case "quitarCupon":
      return {
        ...state,
        cupon: null,
        descuentoPorcentaje: 0,
      };

    case "vaciar":
      return estadoInicial;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const recuperado = leerStorage<Partial<CartState>>(STORAGE_KEY, estadoInicial);
    return {
      items: Array.isArray(recuperado?.items) ? recuperado.items : [],
      cupon: recuperado?.cupon ?? null,
      descuentoPorcentaje:
        typeof recuperado?.descuentoPorcentaje === "number"
          ? recuperado.descuentoPorcentaje
          : 0,
    };
  });

  useEffect(() => {
    guardarStorage(STORAGE_KEY, state);
  }, [state]);

  const subtotal = state.items.reduce(
    (acc, i) => acc + i.producto.precio * i.cantidad,
    0
  );
  const cantidadTotal = state.items.reduce((acc, i) => acc + i.cantidad, 0);

  const descuento =
    state.cupon && subtotal > 0 && state.descuentoPorcentaje > 0
      ? Math.round(subtotal * (state.descuentoPorcentaje / 100))
      : 0;

  const envio = state.items.length > 0 ? ENVIO : 0;
  const total = Math.max(0, subtotal - descuento + envio);

  const value: CartContextValue = {
    items: state.items,
    cupon: state.cupon,
    descuentoPorcentaje: state.descuentoPorcentaje,
    cantidadTotal,
    subtotal,
    descuento,
    envio,
    total,
    agregar: (producto, cantidad = 1) =>
      dispatch({ tipo: "agregar", producto, cantidad }),
    quitar: (productoId) => dispatch({ tipo: "quitar", productoId }),
    cambiarCantidad: (productoId, cantidad) =>
      dispatch({ tipo: "cambiarCantidad", productoId, cantidad }),
    aplicarCupon: async (codigo: string) => {
      const normalizado = codigo.trim().toUpperCase();
      if (!normalizado) {
        return { ok: false, mensaje: "Ingresa un código de descuento." };
      }

      try {
        const res = await api.catalog.validateCoupon(normalizado);
        if (res.valido) {
          dispatch({
            tipo: "aplicarCupon",
            cupon: normalizado,
            descuentoPorcentaje: res.descuentoPorcentaje,
          });
          return {
            ok: true,
            mensaje:
              res.descripcion ||
              `¡Cupón ${normalizado} aplicado con ${res.descuentoPorcentaje}% de descuento!`,
          };
        }
        return {
          ok: false,
          mensaje: res.descripcion || "Cupón no válido o expirado.",
        };
      } catch (err) {
        return {
          ok: false,
          mensaje:
            err instanceof Error
              ? err.message
              : "Error al validar el cupón de descuento.",
        };
      }
    },
    quitarCupon: () => dispatch({ tipo: "quitarCupon" }),
    vaciar: () => dispatch({ tipo: "vaciar" }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
