// @pca:start
// @id(admin.services.api)
// @kind(service)
// @limit(lines: 200)
// @contract(authApi, catalogApi, orderApi, inventoryApi)
// @relates(docs.especificacion_pwa_admin)
// @relates(docs.convenciones)
// @desc(Cliente HTTP del Admin PWA para gestionar catalogo, POS e inventario)
// @pca:end
/**
 * Cliente de integración API para la PWA de Administración (Spring Boot API Gateway :8080).
 */
const BASE_URL = import.meta.env.VITE_API_URL || "/api";
const ADMIN_TOKEN_KEY = "cremeco_admin_token";
const ADMIN_USER_KEY = "cremeco_admin_user";

export interface AdminUser {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estado?: string;
}

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminSession(token: string, user: AdminUser): void {
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
  } catch {
    // Manejo de cuota
  }
}

export function getAdminUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAdminSession(): void {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  } catch {
    // Manejo seguro
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const token = getAdminToken();

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.mensaje || `Error HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const adminApi = {
  // Autenticación Administrativa
  auth: {
    login: (credenciales: { email: string; password?: string }) =>
      request<{ token: string; usuario: AdminUser }>("/identity/auth/login", {
        method: "POST",
        body: JSON.stringify(credenciales),
      }),
  },

  // Productos y Catálogo
  products: {
    list: () => request<Array<{ id: number; nombre: string; precio: number; stock: number; ventas: number; disponible: boolean; categoria: string; imagen: string; badge?: string }>>("/catalog/products"),
    create: (data: { nombre: string; precio: number; stock: number; categoria: string; imagen: string; disponible: boolean }) =>
      request<Record<string, unknown>>("/catalog/products", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<{ nombre: string; precio: number; stock: number; categoria: string; disponible: boolean }>) =>
      request<Record<string, unknown>>(`/catalog/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<{ mensaje: string; id: number }>(`/catalog/products/${id}`, {
        method: "DELETE",
      }),
  },

  // Inventario, Kardex y POS
  inventory: {
    getItems: () => request<Array<{ id: number; productoId: number; nombre: string; categoria: string; stockActual: number; stockMinimo: number; estadoSemaforo: string }>>("/inventory/items"),
    getCritical: () => request<Array<{ id: number; productoId: number; nombre: string; categoria: string; stockActual: number; stockMinimo: number; estadoSemaforo: string }>>("/inventory/items/critical"),
    getKardex: () => request<Array<{ id: number; productoNombre?: string; producto?: string; tipo: string; cantidad: number; fecha: string; saldo: number; motivo?: string; boleta?: string }>>("/inventory/kardex"),
    registerSale: (saleData: { items: Array<{ id: number; nombre: string; cantidad: number; precio: number }>; total: number; medioPago: string }) =>
      request<{ boleta: string; estado: string; timestamp: string }>("/inventory/pos/sale", {
        method: "POST",
        body: JSON.stringify(saleData),
      }),
    registerMerma: (mermaData: { productoId?: number; producto: string; cantidad: number; motivo: string }) =>
      request<Record<string, unknown>>("/inventory/merma", {
        method: "POST",
        body: JSON.stringify(mermaData),
      }),
  },

  // Usuarios y Roles RBAC
  users: {
    list: () => request<Array<{ id: number; nombre: string; email: string; rol: string; estado: string; rut?: string; telefono?: string }>>("/identity/users"),
    getRoles: () => request<Array<{ id: string; nombre: string; permisos: string[] }>>("/identity/roles"),
    updateRole: (userId: number, rol: string) =>
      request<Record<string, unknown>>(`/identity/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ rol }),
      }),
  },

  // Promociones
  promotions: {
    list: () => request<Array<{ codigo: string; descuentoPorcentaje: number; descripcion: string; activo?: boolean }>>("/catalog/promotions"),
  },

  // Pedidos
  orders: {
    list: () => request<Array<{ id: number; trackingCode: string; cliente: string; estado: string; total: number; fecha: string; items?: Array<{ nombre: string; cantidad: number; precio: number }> }>>("/orders"),
    updateStatus: (orderId: number, estado: string) =>
      request<Record<string, unknown>>(`/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ estado }),
      }),
  },
};
