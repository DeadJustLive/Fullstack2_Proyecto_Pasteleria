/**
 * Cliente de integración HTTP con el API Gateway de Microservicios (Spring Boot :8080).
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

export const api = {
  // Catálogo
  catalog: {
    getProducts: () => request<Array<{ id: number; nombre: string; precio: number; stock: number; categoria: string; imagen: string; disponible: boolean }>>("/catalog/products"),
    getPromotions: () => request<Array<{ codigo: string; descuentoPorcentaje: number; descripcion: string }>>("/catalog/promotions"),
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
    login: (credenciales: { email: string; password?: string }) =>
      request<{ token: string; usuario: { id: number; nombre: string; email: string; rol: string } }>("/identity/auth/login", {
        method: "POST",
        body: JSON.stringify(credenciales),
      }),
    register: (datos: { nombre: string; email: string; password?: string; telefono?: string }) =>
      request<{ mensaje: string; usuario: { id: number; nombre: string; email: string; rol: string } }>("/identity/auth/register", {
        method: "POST",
        body: JSON.stringify(datos),
      }),
  },
};
