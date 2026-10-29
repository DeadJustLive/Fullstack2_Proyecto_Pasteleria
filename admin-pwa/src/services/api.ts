// @pca:start
// @id(admin.services.api)
// @kind(service)
// @limit(lines: 500)
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

export interface OrderItemAdmin {
  id?: number;
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal?: number;
}

export interface OrderAdmin {
  id: number;
  trackingCode: string;
  cliente: string;
  email?: string;
  telefono?: string;
  rut?: string;
  tipoEntrega?: string; // DELIVERY o RETIRO
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
  estado: string; // PAGADO, EN_PREPARACION, LISTO_RETIRO, EN_RUTA, ENTREGADO, CANCELADO
  metodoPago?: string;
  fecha: string;
  items?: OrderItemAdmin[];
}

export interface CategoryAdmin {
  id: number;
  slug: string;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  activo: boolean;
  productosCount?: number;
}

export interface PromotionAdmin {
  id: number;
  codigo: string;
  tipo: "PORCENTAJE" | "MONTO_FIJO";
  descuentoPorcentaje?: number;
  valor: number;
  minimoCompra: number;
  usosActuales: number;
  limiteUsos: number;
  expira?: string;
  activo: boolean;
  descripcion?: string;
}

export interface ProductCatalogDTO {
  id: number;
  codigo?: string;
  nombre: string;
  precio: number;
  stock: number;
  ventas?: number;
  disponible: boolean;
  categoria: string;
  imagen?: string;
  badge?: string;
  porciones?: string;
  descripcion?: string;
  fechaCreacion?: string;
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

// ==========================================
// FALLBACKS Y PERSISTENCIA LOCAL (OFFLINE FIRST)
// ==========================================
const CATEGORIES_KEY = "cremeco_admin_categories_cache";
const PROMOTIONS_KEY = "cremeco_admin_promotions_cache";

export const CATEGORIAS_FALLBACK: CategoryAdmin[] = [
  { id: 1, slug: "tortas-clasicas", nombre: "Tortas Clásicas", descripcion: "Recetas tradicionales de bizcocho húmedo, hojarasca y milhojas", activo: true, productosCount: 6 },
  { id: 2, slug: "pasteleria-fina", nombre: "Pastelería Fina", descripcion: "Tartaletas, macarons franceses, mini postres y eclairs", activo: true, productosCount: 5 },
  { id: 3, slug: "linea-saludable", nombre: "Línea Saludable", descripcion: "Opciones sin azúcar añadida, aptas para celíacos y keto", activo: true, productosCount: 3 },
  { id: 4, slug: "temporada-festivos", nombre: "Temporada y Festivos", descripcion: "Ediciones limitadas de fiestas patrias, pascua y fin de año", activo: false, productosCount: 0 },
];

export const PROMOCIONES_FALLBACK: PromotionAdmin[] = [
  { id: 1, codigo: "DULCE10", tipo: "PORCENTAJE", descuentoPorcentaje: 10, valor: 10, minimoCompra: 20000, usosActuales: 42, limiteUsos: 100, expira: "2026-11-30", activo: true, descripcion: "10% de descuento en compras sobre $20.000" },
  { id: 2, codigo: "PRIMERACOMPRA", tipo: "PORCENTAJE", descuentoPorcentaje: 15, valor: 15, minimoCompra: 25000, usosActuales: 89, limiteUsos: 150, expira: "2026-12-31", activo: true, descripcion: "15% de descuento primera compra" },
  { id: 3, codigo: "CUMPLEANOS5000", tipo: "MONTO_FIJO", descuentoPorcentaje: 0, valor: 5000, minimoCompra: 30000, usosActuales: 14, limiteUsos: 50, expira: "2026-11-15", activo: true, descripcion: "$5.000 CLP de descuento en compras sobre $30.000" },
];

function getLocalCategories(): CategoryAdmin[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignorar
  }
  return CATEGORIAS_FALLBACK;
}

function setLocalCategories(cats: CategoryAdmin[]): void {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
  } catch {
    // ignorar
  }
}

function getLocalPromotions(): PromotionAdmin[] {
  try {
    const raw = localStorage.getItem(PROMOTIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignorar
  }
  return PROMOCIONES_FALLBACK;
}

function setLocalPromotions(promos: PromotionAdmin[]): void {
  try {
    localStorage.setItem(PROMOTIONS_KEY, JSON.stringify(promos));
  } catch {
    // ignorar
  }
}

// ==========================================
// SERVICIOS CRUD CATEGORÍAS (CON FALLBACK)
// ==========================================
export async function getCategories(): Promise<CategoryAdmin[]> {
  try {
    const data = await request<CategoryAdmin[]>("/catalog/categories");
    if (Array.isArray(data) && data.length > 0) {
      setLocalCategories(data);
      return data;
    }
    return getLocalCategories();
  } catch {
    return getLocalCategories();
  }
}

export async function createCategory(cat: Partial<CategoryAdmin>): Promise<CategoryAdmin> {
  try {
    const res = await request<CategoryAdmin>("/catalog/categories", {
      method: "POST",
      body: JSON.stringify(cat),
    });
    const list = getLocalCategories();
    setLocalCategories([...list, res]);
    return res;
  } catch {
    const list = getLocalCategories();
    const newId = list.length > 0 ? Math.max(...list.map((c) => c.id)) + 1 : 1;
    const fallbackCat: CategoryAdmin = {
      id: newId,
      slug: cat.slug || `categoria-${newId}`,
      nombre: cat.nombre || `Nueva Categoría ${newId}`,
      descripcion: cat.descripcion || "",
      imagen: cat.imagen || "",
      activo: cat.activo ?? true,
      productosCount: cat.productosCount || 0,
    };
    setLocalCategories([...list, fallbackCat]);
    return fallbackCat;
  }
}

export async function updateCategory(id: number, cat: Partial<CategoryAdmin>): Promise<CategoryAdmin> {
  try {
    const res = await request<CategoryAdmin>(`/catalog/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(cat),
    });
    const list = getLocalCategories().map((c) => (c.id === id ? { ...c, ...res } : c));
    setLocalCategories(list);
    return res;
  } catch {
    const list = getLocalCategories().map((c) => (c.id === id ? { ...c, ...cat } : c));
    setLocalCategories(list);
    const found = list.find((c) => c.id === id);
    if (!found) throw new Error("Categoría no encontrada");
    return found;
  }
}

export async function deleteCategory(id: number): Promise<{ mensaje: string; id: number }> {
  try {
    const res = await request<{ mensaje: string; id: number }>(`/catalog/categories/${id}`, {
      method: "DELETE",
    });
    const list = getLocalCategories().filter((c) => c.id !== id);
    setLocalCategories(list);
    return res;
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("INTEGRIDAD")) {
      throw err;
    }
    const list = getLocalCategories().filter((c) => c.id !== id);
    setLocalCategories(list);
    return { mensaje: "Categoría eliminada", id };
  }
}

// ==========================================
// SERVICIOS CRUD PROMOCIONES (CON FALLBACK)
// ==========================================
export async function getPromotions(): Promise<PromotionAdmin[]> {
  try {
    const data = await request<PromotionAdmin[]>("/catalog/promotions");
    if (Array.isArray(data) && data.length > 0) {
      setLocalPromotions(data);
      return data;
    }
    return getLocalPromotions();
  } catch {
    return getLocalPromotions();
  }
}

export async function createPromotion(promo: Partial<PromotionAdmin>): Promise<PromotionAdmin> {
  try {
    const res = await request<PromotionAdmin>("/catalog/promotions", {
      method: "POST",
      body: JSON.stringify(promo),
    });
    const list = getLocalPromotions();
    setLocalPromotions([res, ...list]);
    return res;
  } catch {
    const list = getLocalPromotions();
    const newId = list.length > 0 ? Math.max(...list.map((p) => p.id)) + 1 : 1;
    const fallbackPromo: PromotionAdmin = {
      id: newId,
      codigo: (promo.codigo || `PROMO${newId}`).toUpperCase(),
      tipo: promo.tipo || "PORCENTAJE",
      descuentoPorcentaje: promo.descuentoPorcentaje ?? (promo.tipo === "PORCENTAJE" ? promo.valor || 10 : 0),
      valor: promo.valor ?? 10,
      minimoCompra: promo.minimoCompra ?? 0,
      usosActuales: promo.usosActuales ?? 0,
      limiteUsos: promo.limiteUsos ?? 100,
      expira: promo.expira || "2026-12-31",
      activo: promo.activo ?? true,
      descripcion: promo.descripcion || "",
    };
    setLocalPromotions([fallbackPromo, ...list]);
    return fallbackPromo;
  }
}

export async function updatePromotion(id: number, promo: Partial<PromotionAdmin>): Promise<PromotionAdmin> {
  try {
    const res = await request<PromotionAdmin>(`/catalog/promotions/${id}`, {
      method: "PUT",
      body: JSON.stringify(promo),
    });
    const list = getLocalPromotions().map((p) => (p.id === id ? { ...p, ...res } : p));
    setLocalPromotions(list);
    return res;
  } catch {
    const list = getLocalPromotions().map((p) => (p.id === id ? { ...p, ...promo } : p));
    setLocalPromotions(list);
    const found = list.find((p) => p.id === id);
    if (!found) throw new Error("Promoción no encontrada");
    return found;
  }
}

export async function deletePromotion(id: number): Promise<{ mensaje: string; id: number }> {
  try {
    const res = await request<{ mensaje: string; id: number }>(`/catalog/promotions/${id}`, {
      method: "DELETE",
    });
    const list = getLocalPromotions().filter((p) => p.id !== id);
    setLocalPromotions(list);
    return res;
  } catch {
    const list = getLocalPromotions().filter((p) => p.id !== id);
    setLocalPromotions(list);
    return { mensaje: "Promoción eliminada", id };
  }
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

  // Productos y Catálogo (cumplimiento T97: list/get, create, update, delete)
  products: {
    list: () => request<ProductCatalogDTO[]>("/catalog/products"),
    getProducts: () => request<ProductCatalogDTO[]>("/catalog/products"),
    create: (data: Partial<ProductCatalogDTO>) =>
      request<Record<string, unknown>>("/catalog/products", { method: "POST", body: JSON.stringify(data) }),
    createProduct: (data: Partial<ProductCatalogDTO>) =>
      request<Record<string, unknown>>("/catalog/products", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<ProductCatalogDTO>) =>
      request<Record<string, unknown>>(`/catalog/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    updateProduct: (id: number, data: Partial<ProductCatalogDTO>) =>
      request<Record<string, unknown>>(`/catalog/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) =>
      request<{ mensaje: string; id: number }>(`/catalog/products/${id}`, { method: "DELETE" }),
    deleteProduct: (id: number) =>
      request<{ mensaje: string; id: number }>(`/catalog/products/${id}`, { method: "DELETE" }),
  },

  // Categorías
  categories: {
    list: getCategories,
    getCategories,
    create: createCategory,
    createCategory,
    update: updateCategory,
    updateCategory,
    delete: deleteCategory,
    deleteCategory,
  },

  // Promociones
  promotions: {
    list: getPromotions,
    getPromotions,
    create: createPromotion,
    createPromotion,
    update: updatePromotion,
    updatePromotion,
    delete: deletePromotion,
    deletePromotion,
  },

  // Inventario, Kardex y POS
  inventory: {
    getItems: () => request<Array<{ id: number; productoId: number; nombre: string; categoria: string; stockActual: number; stockMinimo: number; estadoSemaforo: string }>>("/inventory/items"),
    getCritical: () => request<Array<{ id: number; productoId: number; nombre: string; categoria: string; stockActual: number; stockMinimo: number; estadoSemaforo: string }>>("/inventory/items/critical"),
    getKardex: () => request<Array<{ id: number; productoNombre?: string; producto?: string; tipo: string; cantidad: number; fecha: string; saldo: number; motivo?: string; boleta?: string }>>("/inventory/kardex"),
    registerSale: (saleData: { items: Array<{ id: number; nombre: string; cantidad: number; precio: number }>; total: number; medioPago: string }) =>
      request<{ boleta: string; estado: string; timestamp: string }>("/inventory/pos/sale", { method: "POST", body: JSON.stringify(saleData) }),
    registerMerma: (mermaData: { productoId?: number; producto: string; cantidad: number; motivo: string }) =>
      request<Record<string, unknown>>("/inventory/merma", { method: "POST", body: JSON.stringify(mermaData) }),
  },

  // Usuarios y Roles RBAC
  users: {
    list: () => request<Array<{ id: number; nombre: string; email: string; rol: string; estado: string; rut?: string; telefono?: string }>>("/identity/users"),
    getRoles: () => request<Array<{ id: string; nombre: string; permisos: string[] }>>("/identity/roles"),
    updateRole: (userId: number, rol: string) =>
      request<Record<string, unknown>>(`/identity/users/${userId}/role`, { method: "PUT", body: JSON.stringify({ rol }) }),
  },

  // Pedidos
  orders: {
    list: () => request<OrderAdmin[]>("/orders"),
    updateStatus: (orderId: number, estado: string) =>
      request<OrderAdmin>(`/orders/${orderId}/status`, { method: "PUT", body: JSON.stringify({ estado }) }),
  },
};

// Top-level exported convenience methods
export const getProducts = () => adminApi.products.list();
export const createProduct = (data: Partial<ProductCatalogDTO>) => adminApi.products.create(data);
export const updateProduct = (id: number, data: Partial<ProductCatalogDTO>) => adminApi.products.update(id, data);
export const deleteProduct = (id: number) => adminApi.products.delete(id);
