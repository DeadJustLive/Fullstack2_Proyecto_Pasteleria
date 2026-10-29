// @pca:start
// @id(frontend.services.api)
// @kind(service)
// @limit(lines: 750)
// @contract(authApi, catalogApi, orderApi, inventoryApi, notificationApi, paymentApi)
// @relates(docs.especificacion_microservicios)
// @relates(docs.convenciones)
// @desc(Cliente HTTP del frontend con token JWT para consumir microservicios)
// @pca:end
import type { Producto, Categoria, Variacion, BadgeTipo } from "@/types/product";
import { validarRut } from "@/lib/validators/rut.validator";

/**
 * Cliente de integración HTTP con el API Gateway de Microservicios (Spring Boot :8080).
 */
const BASE_URL = import.meta.env.VITE_API_URL || "/api";
export const TOKEN_STORAGE_KEY = "cremeco_token";

export interface RawCatalogProduct {
  id: number;
  nombre?: string;
  precio?: number;
  precioAnterior?: number;
  enOferta?: boolean;
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
    precioAnterior: typeof raw.precioAnterior === "number" ? raw.precioAnterior : undefined,
    enOferta: raw.enOferta ?? (typeof raw.precioAnterior === "number" && typeof raw.precio === "number" && raw.precioAnterior > raw.precio),
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

export const catalogApi = {
  getProducts: async (categoria?: string): Promise<Producto[]> => {
      const endpoint = categoria ? `/catalog/products?categoria=${encodeURIComponent(categoria)}` : "/catalog/products";
      const data = await request<RawCatalogProduct[]>(endpoint);
      return Array.isArray(data) ? data.map(normalizeProduct) : [];
    },
    getCategories: async (): Promise<Array<{ id?: number; slug: string; nombre: string; descripcion?: string; imagen?: string; activo?: boolean }>> => {
      return request<Array<{ id?: number; slug: string; nombre: string; descripcion?: string; imagen?: string; activo?: boolean }>>("/catalog/categories");
    },
    getCategoryBySlug: async (slug: string) => {
      return request<{ id?: number; slug: string; nombre: string; descripcion?: string; imagen?: string; activo?: boolean }>(`/catalog/categories/slug/${slug}`);
    },
    getOffers: async (): Promise<Producto[]> => {
      const data = await request<RawCatalogProduct[]>("/catalog/products/offers");
      return Array.isArray(data) ? data.map(normalizeProduct) : [];
    },
    getBlogs: () => request<any[]>("/catalog/blogs"),
    getBlogBySlug: (slug: string) => request<any>(`/catalog/blogs/slug/${slug}`),
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
        const promotions = await catalogApi.getPromotions();
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
};

export interface OrderItemPayload {
  id?: number;
  nombre?: string;
  productoNombre?: string;
  cantidad: number;
  precio?: number;
  precioUnitario?: number;
  subtotal?: number;
  imagen?: string;
}

export interface OrderResponse {
  id: number;
  trackingCode: string;
  cliente: string;
  email: string;
  telefono?: string;
  rut?: string;
  tipoEntrega?: string;
  direccion?: string;
  departamento?: string;
  comuna?: string;
  region?: string;
  indicaciones?: string;
  personaRetiroNombre?: string;
  personaRetiroRut?: string;
  personaRetiroTelefono?: string;
  subtotal?: number;
  descuento?: number;
  costoEnvio?: number;
  iva?: number;
  total: number;
  estado: string;
  metodoPago?: string;
  fecha: string;
  fechaEntregaEstimada?: string;
  notas?: string;
  items?: OrderItemPayload[];
}

export interface PickupPersonPayload {
  nombre: string;
  rut: string;
  telefono: string;
}

export interface CustomQuotePayload {
  clienteNombre: string;
  email: string;
  telefono: string;
  tipoEvento?: string;
  porciones: number;
  saborBizcocho?: string;
  relleno?: string;
  cubierta?: string;
  tematica?: string;
  detalles?: string;
  fechaEvento?: string;
  montoEstimado?: number;
  estado?: string;
  codigoCotizacion?: string;
}

export interface CustomQuoteResponse {
  id: number;
  codigoCotizacion: string;
  clienteNombre: string;
  email: string;
  telefono: string;
  tipoEvento?: string;
  porciones: number;
  saborBizcocho?: string;
  relleno?: string;
  cubierta?: string;
  tematica?: string;
  detalles?: string;
  fechaEvento?: string;
  estado: string;
  montoEstimado?: number;
  fecha: string;
}

export interface UserProfileResponse {
  id?: number;
  nombre?: string;
  apellidos?: string;
  rut?: string;
  email: string;
  telefono?: string;
  calle?: string;
  departamento?: string;
  region?: string;
  comuna?: string;
  rol?: string;
  estado?: string;
  createdAt?: string;
  ultimoAcceso?: string;
}

const DEFAULT_SAMPLE_ORDERS: OrderResponse[] = [
  {
    id: 101,
    trackingCode: "CC-2025-001234",
    cliente: "María González Pérez",
    email: "maria.gonzalez@email.com",
    telefono: "+56 9 1234 5678",
    rut: "12.345.678-9",
    tipoEntrega: "RETIRO",
    direccion: "Av. Providencia 1234, Depto 501",
    comuna: "Providencia",
    region: "Región Metropolitana",
    personaRetiroNombre: "Juan Pablo Martínez",
    personaRetiroRut: "12.345.678-9",
    personaRetiroTelefono: "+56 9 8765 4321",
    subtotal: 45000,
    descuento: 0,
    costoEnvio: 0,
    iva: 7185,
    total: 45000,
    estado: "EN_PREPARACION",
    metodoPago: "FLOW_WEBPAY",
    fecha: "2025-10-25T14:30:00",
    fechaEntregaEstimada: "27 de Octubre, 2025",
    items: [
      {
        id: 1,
        nombre: "Torta de Chocolate con Frutillas",
        productoNombre: "Torta de Chocolate con Frutillas",
        cantidad: 1,
        precio: 45000,
        subtotal: 45000,
        imagen: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=400&auto=format&fit=crop",
      },
    ],
  },
  {
    id: 102,
    trackingCode: "CC-1002",
    cliente: "Camila Silva Tapia",
    email: "cliente@cremeco.cl",
    telefono: "+56 9 8765 4321",
    rut: "18.432.198-7",
    tipoEntrega: "DELIVERY",
    direccion: "Av. Las Condes 9870",
    comuna: "Las Condes",
    region: "Región Metropolitana",
    subtotal: 38000,
    descuento: 3800,
    costoEnvio: 3990,
    iva: 5461,
    total: 38190,
    estado: "ENTREGADO",
    metodoPago: "TRANSFERENCIA",
    fecha: "2025-10-18T11:15:00",
    fechaEntregaEstimada: "20 de Octubre, 2025",
    items: [
      {
        id: 2,
        nombre: "Cheesecake de Maracuyá",
        productoNombre: "Cheesecake de Maracuyá",
        cantidad: 1,
        precio: 38000,
        subtotal: 38000,
        imagen: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=400&auto=format&fit=crop",
      },
    ],
  },
];

function getStoredOrders(): OrderResponse[] {
  try {
    const raw = localStorage.getItem("cremeco_orders");
    if (!raw) return DEFAULT_SAMPLE_ORDERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as OrderResponse[]) : DEFAULT_SAMPLE_ORDERS;
  } catch {
    return DEFAULT_SAMPLE_ORDERS;
  }
}

function saveStoredOrders(orders: OrderResponse[]): void {
  try {
    localStorage.setItem("cremeco_orders", JSON.stringify(orders));
  } catch {
    // Manejo seguro
  }
}

export const orderApi = {
  create: async (data: {
    cliente: string;
    email: string;
    total: number;
    items: Array<{ nombre: string; cantidad: number; precio: number }>;
    tipoEntrega?: string;
    rut?: string;
    telefono?: string;
    direccion?: string;
    comuna?: string;
    region?: string;
    personaRetiroNombre?: string;
    personaRetiroRut?: string;
    personaRetiroTelefono?: string;
  }): Promise<OrderResponse> => {
    try {
      const res = await request<OrderResponse>("/orders", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const stored = getStoredOrders();
      saveStoredOrders([res, ...stored]);
      return res;
    } catch {
      const trackingCode = `CC-${Math.floor(1000 + Math.random() * 9000)}`;
      const nuevaOrden: OrderResponse = {
        id: Date.now(),
        trackingCode,
        cliente: data.cliente,
        email: data.email,
        telefono: data.telefono,
        rut: data.rut,
        tipoEntrega: data.tipoEntrega || "RETIRO",
        direccion: data.direccion,
        comuna: data.comuna,
        region: data.region,
        personaRetiroNombre: data.personaRetiroNombre,
        personaRetiroRut: data.personaRetiroRut,
        personaRetiroTelefono: data.personaRetiroTelefono,
        total: data.total,
        estado: "PAGADO",
        fecha: new Date().toISOString(),
        items: data.items,
      };
      const stored = getStoredOrders();
      saveStoredOrders([nuevaOrden, ...stored]);
      return nuevaOrden;
    }
  },

  getByUser: async (emailOrUserId: string | number): Promise<OrderResponse[]> => {
    const str = String(emailOrUserId).trim();
    const isId = typeof emailOrUserId === "number" || (!str.includes("@") && /^\d+$/.test(str));
    try {
      const endpoint = isId ? `/orders/user/${str}` : `/orders/email/${encodeURIComponent(str)}`;
      const data = await request<OrderResponse[]>(endpoint);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch {
      // Fallback local
    }

    const stored = getStoredOrders();
    if (isId) {
      const idNum = Number(str);
      const matches = stored.filter((o) => o.id === idNum);
      if (matches.length > 0) return matches;
    } else {
      const lower = str.toLowerCase();
      const matches = stored.filter((o) => o.email.toLowerCase() === lower);
      if (matches.length > 0) return matches;
    }
    return stored;
  },

  getByTrackingCode: async (code: string): Promise<OrderResponse> => {
    const clean = code.replace("#", "").trim();
    try {
      const data = await request<OrderResponse>(`/orders/tracking/${clean}`);
      if (data && data.trackingCode) return data;
    } catch {
      // Fallback
    }

    const stored = getStoredOrders();
    const match = stored.find(
      (o) => o.trackingCode.replace("#", "").toUpperCase() === clean.toUpperCase() || String(o.id) === clean
    );
    if (match) return match;

    throw new Error(`Pedido #${clean} no encontrado`);
  },

  getById: async (id: number | string): Promise<OrderResponse> => {
    try {
      const data = await request<OrderResponse>(`/orders/${id}`);
      if (data) return data;
    } catch {
      // Fallback
    }
    const stored = getStoredOrders();
    const match = stored.find((o) => String(o.id) === String(id) || o.trackingCode === String(id));
    if (match) return match;
    throw new Error(`Pedido ID ${id} no encontrado`);
  },

  updatePickupPerson: async (
    orderId: number | string,
    data: PickupPersonPayload
  ): Promise<OrderResponse> => {
    if (!data.rut || !validarRut(data.rut)) {
      throw new Error("El RUN/RUT ingresado para la persona que retira no es válido (Módulo 11).");
    }

    let updated: OrderResponse | null = null;
    try {
      updated = await request<OrderResponse>(`/orders/${orderId}/pickup-person`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch {
      // Fallback local
    }

    const stored = getStoredOrders();
    const idx = stored.findIndex((o) => String(o.id) === String(orderId) || o.trackingCode === String(orderId));
    if (idx !== -1) {
      stored[idx] = {
        ...stored[idx],
        personaRetiroNombre: data.nombre,
        personaRetiroRut: data.rut,
        personaRetiroTelefono: data.telefono,
      };
      saveStoredOrders([...stored]);
      if (!updated) updated = stored[idx];
    }

    if (updated) return updated;
    throw new Error(`No se pudo actualizar la persona que retira para el pedido ${orderId}`);
  },

  createQuote: async (quoteData: CustomQuotePayload): Promise<CustomQuoteResponse> => {
    const code = quoteData.codigoCotizacion || `#COT-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      const res = await request<CustomQuoteResponse>("/orders/quotes", {
        method: "POST",
        body: JSON.stringify({
          ...quoteData,
          codigoCotizacion: code,
          estado: quoteData.estado || "RECIBIDA",
          fecha: new Date().toISOString(),
        }),
      });
      return {
        ...res,
        codigoCotizacion: res.codigoCotizacion || code,
      };
    } catch {
      const savedQuote: CustomQuoteResponse = {
        id: Date.now(),
        codigoCotizacion: code,
        clienteNombre: quoteData.clienteNombre,
        email: quoteData.email,
        telefono: quoteData.telefono,
        tipoEvento: quoteData.tipoEvento || "Personalizado",
        porciones: quoteData.porciones,
        saborBizcocho: quoteData.saborBizcocho,
        relleno: quoteData.relleno,
        cubierta: quoteData.cubierta,
        tematica: quoteData.tematica,
        detalles: quoteData.detalles,
        fechaEvento: quoteData.fechaEvento,
        estado: "RECIBIDA",
        montoEstimado: quoteData.montoEstimado,
        fecha: new Date().toISOString(),
      };
      try {
        const raw = localStorage.getItem("cremeco_quotes");
        const list: CustomQuoteResponse[] = raw ? JSON.parse(raw) : [];
        localStorage.setItem("cremeco_quotes", JSON.stringify([savedQuote, ...list]));
      } catch {
        // Fallback
      }
      return savedQuote;
    }
  },

  getUserQuotes: async (email: string): Promise<CustomQuoteResponse[]> => {
    try {
      const res = await request<CustomQuoteResponse[]>(`/orders/quotes/user?email=${encodeURIComponent(email)}`);
      if (Array.isArray(res) && res.length > 0) return res;
    } catch {
      // Fallback
    }
    try {
      const raw = localStorage.getItem("cremeco_quotes");
      if (raw) {
        const list: CustomQuoteResponse[] = JSON.parse(raw);
        return list.filter((q) => q.email.toLowerCase() === email.toLowerCase());
      }
    } catch {
      // Fallback
    }
    return [];
  },
};

export const api = {
  catalog: catalogApi,
  order: orderApi,
  orders: orderApi,

  // Pasarela Flow.cl
  payments: {
    createFlowPayment: async (data: { orderId: number | string; amount: number; email: string; concept: string }) => {
      const res = await request<{ redirectUrl?: string; checkoutUrl?: string; token?: string; paymentToken?: string }>("/payments/flow/create", {
        method: "POST",
        body: JSON.stringify({
          idempotencyKey: `idem_web_${data.orderId}_${Date.now()}`,
          orderId: String(data.orderId).startsWith("order_") ? String(data.orderId) : `order_${data.orderId}`,
          amount: data.amount,
          email: data.email,
          subject: data.concept || "Pedido Crème & Co",
          urlReturn: window.location.origin + "/pago/exito",
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
    getProfile: async (email?: string): Promise<UserProfileResponse> => {
      const query = email ? `?email=${encodeURIComponent(email)}` : "";
      return request<UserProfileResponse>(`/identity/profile${query}`);
    },
    updateProfile: async (data: Partial<UserProfileResponse> & { email: string }): Promise<{ mensaje: string; usuario: UserProfileResponse }> => {
      return request<{ mensaje: string; usuario: UserProfileResponse }>("/identity/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
  },
};
