// @pca:start
// @id(frontend.services.api)
// @kind(service)
// @limit(lines: 320)
// @contract(authApi, catalogApi, orderApi, inventoryApi, notificationApi, paymentApi)
// @relates(docs.especificacion_microservicios)
// @relates(docs.convenciones)
// @desc(Cliente HTTP del frontend con token JWT para consumir microservicios)
// @pca:end
import type { Producto, Categoria, Variacion, BadgeTipo } from "@/types/product";

/**
 * Cliente de integración HTTP con el API Gateway de Microservicios (Spring Boot :8080).
 */
const BASE_URL = import.meta.env.VITE_API_URL || "/api";
export const TOKEN_STORAGE_KEY = "cremeco_token";

export interface RawCatalogProduct {
  id: number;
  nombre?: string;
  precio?: number;
  imagen?: string;
  descripcion?: string;
  categoria?: string;
  categorias?: string[] | string;
  variaciones?: string[] | string;
  badge?: string;
  destacado?: boolean;
  disponible?: boolean;
  stock?: number;
  ventas?: number;
}

export interface CouponValidationResult {
  valido: boolean;
  descuentoPorcentaje: number;
  descripcion: string;
}

export const FALLBACK_CUPONES: Record<string, { descuentoPorcentaje: number; descripcion: string }> = {
  CREME10: { descuentoPorcentaje: 10, descripcion: "10% de descuento en el total de tu compra" },
  DULCE15: { descuentoPorcentaje: 15, descripcion: "15% de descuento especial" },
  DULCE10: { descuentoPorcentaje: 10, descripcion: "10% de descuento en el total de tu compra" },
  CREME20: { descuentoPorcentaje: 20, descripcion: "20% en pedidos sobre $30.000" },
  BIENVENIDA: { descuentoPorcentaje: 15, descripcion: "15% para clientes nuevos" },
};

export function normalizeCategoria(val: string): Categoria | null {
  const v = val.toLowerCase().trim();
  if (v === "torta" || v === "tortas") return "torta";
  if (v === "tartaleta" || v === "tartaletas" || v === "tarta" || v === "tartas") return "tartaleta";
  if (v === "cheesecake" || v === "cheesecakes") return "cheesecake";
  if (v === "pastel" || v === "pasteles" || v === "bolleria" || v === "bollería") return "pastel";
  if (v === "pancake" || v === "pancakes") return "pancakes";
  return null;
}

export function normalizeVariacion(val: string): Variacion | null {
  const v = val.toLowerCase().trim();
  if (v === "personalizable") return "personalizable";
  if (v === "temporada") return "temporada";
  if (v === "vendido" || v === "mas vendido" || v === "más vendido") return "vendido";
  if (v === "sin gluten" || v === "singluten") return "sin gluten";
  return null;
}

export function normalizeBadge(val?: string): BadgeTipo | undefined {
  if (!val) return undefined;
  const b = val.toLowerCase().trim();
  if (b === "premium" || b === "temporada" || b === "vendido" || b === "personalizable") {
    return b;
  }
  return undefined;
}

export function normalizeProduct(raw: RawCatalogProduct): Producto {
  let categorias: Categoria[] = [];
  if (Array.isArray(raw.categorias)) {
    categorias = raw.categorias
      .map((c) => (typeof c === "string" ? normalizeCategoria(c) : null))
      .filter((c): c is Categoria => c !== null);
  } else if (typeof raw.categorias === "string") {
    const c = normalizeCategoria(raw.categorias);
    if (c) categorias = [c];
  } else if (typeof raw.categoria === "string") {
    const c = normalizeCategoria(raw.categoria);
    if (c) categorias = [c];
  }

  let variaciones: Variacion[] = [];
  if (Array.isArray(raw.variaciones)) {
    variaciones = raw.variaciones
      .map((v) => (typeof v === "string" ? normalizeVariacion(v) : null))
      .filter((v): v is Variacion => v !== null);
  } else if (typeof raw.variaciones === "string") {
    const v = normalizeVariacion(raw.variaciones);
    if (v) variaciones = [v];
  }

  const badge = normalizeBadge(raw.badge) || (raw.ventas !== undefined && raw.ventas >= 100 ? "vendido" : undefined);

  return {
    id: typeof raw.id === "number" ? raw.id : Number(raw.id) || 0,
    nombre: raw.nombre || "Producto de Pastelería",
    precio: typeof raw.precio === "number" ? raw.precio : 0,
    imagen: raw.imagen || "/imagen/chocolate.jpg",
    descripcion:
      raw.descripcion ||
      "Deliciosa preparación artesanal elaborada diariamente con los más selectos ingredientes de repostería.",
    categorias,
    variaciones,
    badge,
    destacado: raw.destacado ?? (raw.ventas !== undefined && raw.ventas > 50),
    disponible: raw.disponible !== false,
    stock: typeof raw.stock === "number" ? raw.stock : undefined,
  };
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // Manejo seguro en caso de fallos de cuota o cookies restringidas
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Manejo seguro
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string> | undefined),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as { mensaje?: string; message?: string };
    throw new Error(errorBody.mensaje || errorBody.message || `Error HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export interface AuthUsuarioResponse {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estado?: string;
}

export interface LoginResponse {
  token: string;
  usuario: AuthUsuarioResponse;
}

export interface RegisterResponse {
  mensaje: string;
  usuario: AuthUsuarioResponse;
  token?: string;
}

export const api = {
  // Catálogo
  catalog: {
    getProducts: async (): Promise<Producto[]> => {
      const data = await request<RawCatalogProduct[]>("/catalog/products");
      return Array.isArray(data) ? data.map(normalizeProduct) : [];
    },
    getProductById: async (id: number): Promise<Producto> => {
      const data = await request<RawCatalogProduct>(`/catalog/products/${id}`);
      return normalizeProduct(data);
    },
    getPromotions: () =>
      request<Array<{ codigo: string; descuentoPorcentaje: number; descripcion: string }>>("/catalog/promotions"),
    validateCoupon: async (code: string): Promise<CouponValidationResult> => {
      const normalizado = code.trim().toUpperCase();
      if (!normalizado) {
        return { valido: false, descuentoPorcentaje: 0, descripcion: "Código de cupón no proporcionado." };
      }

      try {
        const promotions = await api.catalog.getPromotions();
        const promo = promotions.find((p) => p.codigo.trim().toUpperCase() === normalizado);
        if (promo) {
          return {
            valido: true,
            descuentoPorcentaje: promo.descuentoPorcentaje,
            descripcion: promo.descripcion,
          };
        }

        // Fallback local a cupones estándar de contingencia si no está listado en backend
        if (normalizado in FALLBACK_CUPONES) {
          const fallback = FALLBACK_CUPONES[normalizado];
          return {
            valido: true,
            descuentoPorcentaje: fallback.descuentoPorcentaje,
            descripcion: fallback.descripcion,
          };
        }

        return {
          valido: false,
          descuentoPorcentaje: 0,
          descripcion: "Cupón no válido o expirado.",
        };
      } catch {
        // Fallback contingencia en modo offline / error del servidor
        if (normalizado in FALLBACK_CUPONES) {
          const fallback = FALLBACK_CUPONES[normalizado];
          return {
            valido: true,
            descuentoPorcentaje: fallback.descuentoPorcentaje,
            descripcion: fallback.descripcion,
          };
        }
        return {
          valido: false,
          descuentoPorcentaje: 0,
          descripcion: "Cupón no válido o servicio de promociones no disponible.",
        };
      }
    },
  },

  // Pedidos y Tracking
  orders: {
    create: (data: { cliente: string; email: string; total: number; items: Array<{ nombre: string; cantidad: number; precio: number }> }) =>
      request<{ id: number; trackingCode: string; estado: string; total: number }>("/orders", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getByTrackingCode: (code: string) =>
      request<{ id: number; trackingCode: string; cliente: string; estado: string; total: number; fecha: string; items: Array<{ nombre: string; cantidad: number; precio: number }> }>(
        `/orders/tracking/${code}`
      ),
  },

  // Pasarela Flow.cl
  payments: {
    createFlowPayment: async (data: { orderId: number; amount: number; email: string; concept: string }) => {
      const res = await request<{ redirectUrl?: string; checkoutUrl?: string; token?: string; paymentToken?: string }>("/payments/flow/create", {
        method: "POST",
        body: JSON.stringify({
          idempotencyKey: `idem_web_${data.orderId}_${Date.now()}`,
          orderId: `order_${data.orderId}`,
          amount: data.amount,
          email: data.email,
          subject: data.concept || "Pedido Crème & Co",
          urlReturn: window.location.origin + "/confirmacion",
        }),
      });
      return {
        redirectUrl: res.checkoutUrl || res.redirectUrl || "",
        token: res.paymentToken || res.token || "",
      };
    },
    getStatus: (token: string) =>
      request<{ status: string; flowOrder: number; amount: number }>(`/payments/flow/status?token=${token}`),
  },

  // Identidad y Autenticación
  auth: {
    getToken,
    setToken,
    clearToken,
    login: (credenciales: { email: string; password?: string }) =>
      request<LoginResponse>("/identity/auth/login", {
        method: "POST",
        body: JSON.stringify(credenciales),
      }),
    register: (datos: { nombre: string; email: string; password?: string; telefono?: string }) =>
      request<RegisterResponse>("/identity/auth/register", {
        method: "POST",
        body: JSON.stringify(datos),
      }),
  },
};
