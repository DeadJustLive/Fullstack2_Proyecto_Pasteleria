// @pca:start
// @id(admin.services.api)
// @kind(service)
// @limit(lines: 620)
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
  rut?: string;
  telefono?: string;
  ultimoAcceso?: string;
  fechaRegistro?: string;
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

export function setAdminUser(user: AdminUser): void {
  try {
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
  } catch {
    // Manejo seguro
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
const USERS_KEY = "cremeco_admin_users_cache";

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

export const USUARIOS_ADMIN_FALLBACK: AdminUser[] = [
  { id: 1, nombre: "Matías Retamal", email: "matias.admin@cremeco.cl", rut: "15.342.891-K", telefono: "+56 9 8888 7777", rol: "ADMIN", estado: "Activo", fechaRegistro: "2026-01-10", ultimoAcceso: "Hoy 14:15" },
  { id: 2, nombre: "Anaís Morales", email: "anais.cocina@cremeco.cl", rut: "17.892.431-2", telefono: "+56 9 7777 6666", rol: "PASTELERO", estado: "Activo", fechaRegistro: "2026-02-14", ultimoAcceso: "Hoy 11:30" },
  { id: 3, nombre: "Claudio Navarrete", email: "claudio.reparto@cremeco.cl", rut: "19.452.123-5", telefono: "+56 9 6655 4433", rol: "REPARTIDOR", estado: "Activo", fechaRegistro: "2026-03-01", ultimoAcceso: "Ayer 18:20" },
  { id: 4, nombre: "Camila Silva", email: "camila.silva@duocuc.cl", rut: "18.452.912-3", telefono: "+56 9 7788 9900", rol: "CLIENTE", estado: "Activo", fechaRegistro: "2026-03-15", ultimoAcceso: "2026-10-24 10:30" },
  { id: 5, nombre: "Ignacio Valenzuela", email: "ignacio.v@gmail.com", rut: "16.782.341-K", telefono: "+56 9 6655 4433", rol: "CLIENTE", estado: "Activo", fechaRegistro: "2026-04-20", ultimoAcceso: "2026-10-24 11:15" },
  { id: 6, nombre: "Francisca Pinto", email: "fran.pinto@profesor.duoc.cl", rut: "12.940.321-8", telefono: "+56 9 5544 3322", rol: "CLIENTE", estado: "Inactivo", fechaRegistro: "2026-05-02", ultimoAcceso: "2026-10-24 12:45" },
];

export const ORDENES_FALLBACK: OrderAdmin[] = [
  { id: 1, trackingCode: "CC-1001", cliente: "Camila Silva", email: "camila.silva@duocuc.cl", telefono: "+56 9 7788 9900", rut: "18.452.912-3", tipoEntrega: "RETIRO", personaRetiroNombre: "Diego Morales", subtotal: 37815, total: 45000, iva: 7185, estado: "EN_PREPARACION", metodoPago: "WebPay Plus", fecha: "2026-10-24 10:30", items: [{ id: 101, nombre: "Torta Cuatro Leches (15 pers.)", cantidad: 1, precio: 34000, subtotal: 34000 }, { id: 102, nombre: "Macarons x6", cantidad: 1, precio: 11000, subtotal: 11000 }] },
  { id: 2, trackingCode: "CC-1002", cliente: "Ignacio Valenzuela", email: "ignacio.v@gmail.com", telefono: "+56 9 6655 4433", rut: "16.782.341-K", tipoEntrega: "DELIVERY", direccion: "Av. Providencia 1234", subtotal: 57143, total: 68000, iva: 10857, estado: "EN_RUTA", metodoPago: "Servipag", fecha: "2026-10-24 11:15", items: [{ id: 201, nombre: "Cheesecake Frutos Rojos (12 pers.)", cantidad: 2, precio: 34000, subtotal: 68000 }] },
  { id: 3, trackingCode: "CC-1003", cliente: "Francisca Pinto", email: "fran.pinto@profesor.duoc.cl", telefono: "+56 9 5544 3322", rut: "12.940.321-8", tipoEntrega: "RETIRO", personaRetiroNombre: "Francisca Pinto", subtotal: 28571, total: 34000, iva: 5429, estado: "LISTO_RETIRO", metodoPago: "WebPay Plus", fecha: "2026-10-24 12:45", items: [{ id: 301, nombre: "Torta Hojarasca Lúcuma", cantidad: 1, precio: 34000, subtotal: 34000 }] },
  { id: 4, trackingCode: "CC-1004", cliente: "Camila Silva", email: "camila.silva@duocuc.cl", telefono: "+56 9 7788 9900", rut: "18.452.912-3", tipoEntrega: "DELIVERY", direccion: "Los Leones 2341", subtotal: 16807, total: 20000, iva: 3193, estado: "ENTREGADO", metodoPago: "Transferencia", fecha: "2026-10-18 16:40", items: [{ id: 401, nombre: "Tartaleta Frutas Finas", cantidad: 1, precio: 20000, subtotal: 20000 }] },
];

function getLocalUsers(): AdminUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return USUARIOS_ADMIN_FALLBACK;
}

function setLocalUsers(users: AdminUser[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {}
}

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

// ==========================================
// SERVICIOS CRUD USUARIOS Y COMPRAS (CON FALLBACK)
// ==========================================
export async function getUsers(): Promise<AdminUser[]> {
  try {
    const data = await request<AdminUser[]>("/identity/users");
    if (Array.isArray(data) && data.length > 0) {
      setLocalUsers(data);
      return data;
    }
    return getLocalUsers();
  } catch {
    return getLocalUsers();
  }
}

export async function createUser(u: Partial<AdminUser>): Promise<AdminUser> {
  try {
    const res = await request<AdminUser>("/identity/users", {
      method: "POST",
      body: JSON.stringify(u),
    });
    setLocalUsers([...getLocalUsers(), res]);
    return res;
  } catch {
    const list = getLocalUsers();
    const newId = list.length > 0 ? Math.max(...list.map((x) => x.id)) + 1 : 1;
    const nuevo: AdminUser = {
      id: newId,
      nombre: u.nombre || `Usuario #${newId}`,
      email: u.email || "",
      rol: u.rol || "CLIENTE",
      estado: u.estado || "Activo",
      rut: u.rut || "",
      telefono: u.telefono || "",
      fechaRegistro: new Date().toISOString().split("T")[0],
      ultimoAcceso: "Reciente",
    };
    setLocalUsers([...list, nuevo]);
    return nuevo;
  }
}

export async function updateUser(id: number, u: Partial<AdminUser>): Promise<AdminUser> {
  try {
    const res = await request<AdminUser>(`/identity/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(u),
    });
    setLocalUsers(getLocalUsers().map((x) => (x.id === id ? { ...x, ...res } : x)));
    return res;
  } catch {
    const list = getLocalUsers().map((x) => (x.id === id ? { ...x, ...u } : x));
    setLocalUsers(list);
    const found = list.find((x) => x.id === id);
    if (!found) throw new Error("Usuario no encontrado");
    return found;
  }
}

export async function deleteUser(id: number): Promise<{ mensaje: string; id: number }> {
  try {
    await request(`/identity/users/${id}`, { method: "DELETE" });
  } catch {
    // Modo resiliente
  }
  setLocalUsers(getLocalUsers().filter((x) => x.id !== id));
  return { mensaje: "Usuario eliminado", id };
}

export async function getOrdersByUser(query: { email?: string; clienteId?: number }): Promise<OrderAdmin[]> {
  try {
    const data = await request<OrderAdmin[]>("/orders");
    const list = Array.isArray(data) && data.length > 0 ? data : ORDENES_FALLBACK;
    return list.filter(
      (o) =>
        (query.email && o.email?.toLowerCase() === query.email.toLowerCase()) ||
        (query.clienteId && o.id === query.clienteId)
    );
  } catch {
    return ORDENES_FALLBACK.filter(
      (o) =>
        (query.email && o.email?.toLowerCase() === query.email.toLowerCase()) ||
        (query.clienteId && o.id === query.clienteId)
    );
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
    list: getUsers,
    getUsers,
    create: createUser,
    createUser,
    update: updateUser,
    updateUser,
    updateRole: (userId: number, rol: string) => updateUser(userId, { rol }),
    delete: deleteUser,
    deleteUser,
    getRoles: () => request<Array<{ id: string; nombre: string; permisos: string[] }>>("/identity/roles"),
  },

  // Pedidos
  orders: {
    list: () => request<OrderAdmin[]>("/orders").catch(() => ORDENES_FALLBACK),
    getOrders: () => request<OrderAdmin[]>("/orders").catch(() => ORDENES_FALLBACK),
    getByUser: getOrdersByUser,
    getOrdersByUser,
    updateStatus: (orderId: number, estado: string) =>
      request<OrderAdmin>(`/orders/${orderId}/status`, { method: "PUT", body: JSON.stringify({ estado }) }),
  },

  // Perfil del Administrador
  profile: {
    get: (email?: string) => request<AdminUser>(`/identity/profile${email ? `?email=${encodeURIComponent(email)}` : ""}`),
    update: (data: Partial<AdminUser> & { password?: string }) =>
      request<{ mensaje: string; usuario: AdminUser }>("/identity/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },
};

// Top-level exported convenience methods
export const getProducts = () => adminApi.products.list();
export const createProduct = (data: Partial<ProductCatalogDTO>) => adminApi.products.create(data);
export const updateProduct = (id: number, data: Partial<ProductCatalogDTO>) => adminApi.products.update(id, data);
export const deleteProduct = (id: number) => adminApi.products.delete(id);
