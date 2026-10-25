/**
 * Cliente de integración API para la PWA de Administración (Spring Boot API Gateway :8080).
 */
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
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
  // Productos y Catálogo
  products: {
    list: () => request<Array<{ id: number; nombre: string; precio: number; stock: number; ventas: number; disponible: boolean; categoria: string; imagen: string }>>("/catalog/products"),
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
    getKardex: () => request<Array<{ id: number; producto: string; tipo: string; cantidad: number; fecha: string; saldo: number; motivo?: string }>>("/inventory/kardex"),
    registerSale: (saleData: { items: Array<{ id: number; nombre: string; cantidad: number; precio: number }>; total: number; medioPago: string }) =>
      request<{ boleta: string; estado: string; timestamp: string }>("/inventory/pos/sale", {
        method: "POST",
        body: JSON.stringify(saleData),
      }),
    registerMerma: (mermaData: { producto: string; cantidad: number; motivo: string }) =>
      request<Record<string, unknown>>("/inventory/merma", {
        method: "POST",
        body: JSON.stringify(mermaData),
      }),
  },

  // Usuarios y Roles RBAC
  users: {
    list: () => request<Array<{ id: number; nombre: string; email: string; rol: string; estado: string }>>("/identity/users"),
    getRoles: () => request<Array<{ id: string; nombre: string; permisos: string[] }>>("/identity/roles"),
    updateRole: (userId: number, rol: string) =>
      request<Record<string, unknown>>(`/identity/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ rol }),
      }),
  },

  // Promociones
  promotions: {
    list: () => request<Array<{ codigo: string; descuentoPorcentaje: number; descripcion: string }>>("/catalog/promotions"),
  },

  // Pedidos
  orders: {
    list: () => request<Array<{ id: number; trackingCode: string; cliente: string; estado: string; total: number; fecha: string }>>("/orders"),
    updateStatus: (orderId: number, estado: string) =>
      request<Record<string, unknown>>(`/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ estado }),
      }),
  },
};
