import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  normalizeCategoria,
  normalizeVariacion,
  normalizeBadge,
  normalizeProduct,
  getToken,
  setToken,
  clearToken,
  catalogApi,
  orderApi,
  api,
  FALLBACK_CUPONES,
} from "../../services/api";

describe("api.ts — Cliente HTTP y Normalizadores de Microservicios", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Normalizadores Puros de Dominio", () => {
    it("normalizeCategoria debe mapear variaciones léxicas a las categorías canónicas", () => {
      expect(normalizeCategoria("TORTA")).toBe("torta");
      expect(normalizeCategoria("tortas")).toBe("torta");
      expect(normalizeCategoria("tartaletas")).toBe("tartaleta");
      expect(normalizeCategoria("tartas")).toBe("tartaleta");
      expect(normalizeCategoria("cheesecakes")).toBe("cheesecake");
      expect(normalizeCategoria("pasteles")).toBe("pastel");
      expect(normalizeCategoria("bolleria")).toBe("pastel");
      expect(normalizeCategoria("pancake")).toBe("pancakes");
      expect(normalizeCategoria("categoria_invalida")).toBeNull();
    });

    it("normalizeVariacion debe reconocer personalizable, temporada, vendido y sin gluten", () => {
      expect(normalizeVariacion("PERSONALIZABLE")).toBe("personalizable");
      expect(normalizeVariacion("temporada")).toBe("temporada");
      expect(normalizeVariacion("más vendido")).toBe("vendido");
      expect(normalizeVariacion("mas vendido")).toBe("vendido");
      expect(normalizeVariacion("singluten")).toBe("sin gluten");
      expect(normalizeVariacion("sin gluten")).toBe("sin gluten");
      expect(normalizeVariacion("otro")).toBeNull();
    });

    it("normalizeBadge debe admitir únicamente insignias autorizadas", () => {
      expect(normalizeBadge("premium")).toBe("premium");
      expect(normalizeBadge("temporada")).toBe("temporada");
      expect(normalizeBadge("vendido")).toBe("vendido");
      expect(normalizeBadge("personalizable")).toBe("personalizable");
      expect(normalizeBadge("invalido")).toBeUndefined();
      expect(normalizeBadge(undefined)).toBeUndefined();
    });

    it("normalizeProduct debe convertir DTO crudo de Backend a contrato Producto de Frontend", () => {
      const raw = {
        id: 42,
        nombre: "Torta Selva Negra",
        precio: 18990,
        precioAnterior: 21990,
        categoria: "tortas",
        variaciones: ["mas vendido"],
        ventas: 120,
      };

      const producto = normalizeProduct(raw);
      expect(producto.id).toBe(42);
      expect(producto.nombre).toBe("Torta Selva Negra");
      expect(producto.categorias).toEqual(["torta"]);
      expect(producto.variaciones).toEqual(["vendido"]);
      expect(producto.enOferta).toBe(true);
      expect(producto.destacado).toBe(true);
      expect(producto.badge).toBe("vendido");
      expect(producto.disponible).toBe(true);
    });

    it("normalizeProduct debe aplicar fallbacks seguros cuando falten datos", () => {
      const rawVacio = { id: 10 };
      const producto = normalizeProduct(rawVacio);

      expect(producto.nombre).toBe("Producto de Pastelería");
      expect(producto.imagen).toBe("/imagen/chocolate.jpg");
      expect(producto.descripcion).toContain("Deliciosa preparación artesanal");
      expect(producto.precio).toBe(0);
      expect(producto.categorias).toEqual([]);
      expect(producto.variaciones).toEqual([]);
    });
  });

  describe("Manejo de Tokens JWT", () => {
    it("debe guardar, obtener y limpiar el token de autenticación", () => {
      expect(getToken()).toBeNull();
      setToken("jwt-prueba-token-xyz");
      expect(getToken()).toBe("jwt-prueba-token-xyz");
      clearToken();
      expect(getToken()).toBeNull();
    });
  });

  describe("Llamadas HTTP con Fetch Mockeado", () => {
    it("catalogApi.getProducts debe normalizar la lista de productos devuelta", async () => {
      const mockRawList = [
        { id: 1, nombre: "Torta Cuatro Leches", precio: 15000, categoria: "torta" },
        { id: 2, nombre: "Pie de Limón", precio: 12000, categoria: "tartaleta" },
      ];

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => mockRawList,
      } as Response);

      const prods = await catalogApi.getProducts();
      expect(prods.length).toBe(2);
      expect(prods[0].nombre).toBe("Torta Cuatro Leches");
      expect(prods[0].categorias).toContain("torta");
    });

    it("api.auth.login debe retornar la respuesta de sesión", async () => {
      const mockResponse = {
        token: "token-jwt-sesion-exitosa",
        usuario: { id: 5, nombre: "Admin", email: "admin@cremeco.cl", rol: "ADMIN" },
      };

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const res = await api.auth.login({ email: "admin@cremeco.cl", password: "password123" });
      expect(res.usuario.email).toBe("admin@cremeco.cl");
      expect(res.token).toBe("token-jwt-sesion-exitosa");
    });

    it("catalogApi.validateCoupon debe resolver cupones locales si el backend no responde", async () => {
      // Mock de fallo de backend
      vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network Error"));

      const res = await catalogApi.validateCoupon("CREME10");
      expect(res.valido).toBe(true);
      expect(res.descuentoPorcentaje).toBe(10);
      expect(res.descripcion).toBe(FALLBACK_CUPONES.CREME10.descripcion);
    });

    it("orderApi.create debe guardar la orden localmente ante caída de microservicio", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Conexión rechazada"));

      const ordenCreada = await orderApi.create({
        cliente: "Rodrigo Pastelería",
        email: "rodrigo@pasteleria.cl",
        total: 25000,
        items: [{ productoId: 4, nombre: "Torta Mil Hojas", cantidad: 1, precio: 25000 }],
      });

      expect(ordenCreada).toBeDefined();
      expect(ordenCreada.cliente).toBe("Rodrigo Pastelería");
      expect(ordenCreada.total).toBe(25000);
      expect(ordenCreada.trackingCode).toMatch(/^CC-\d+/);
    });

    it("orderApi.create debe propagar el error si el backend responde STOCK_INSUFICIENTE", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => ({
          error: "STOCK_INSUFICIENTE",
          mensaje: "Stock insuficiente para 'Torta Cuatro Leches'. Disponible: 0, solicitado: 2",
        }),
      } as Response);

      await expect(
        orderApi.create({
          cliente: "Camila Silva",
          email: "camila@cremeco.cl",
          total: 68000,
          items: [{ productoId: 1, nombre: "Torta Cuatro Leches", cantidad: 2, precio: 34000 }],
        })
      ).rejects.toThrow("Stock insuficiente para 'Torta Cuatro Leches'");
    });

    it("debe capturar errores HTTP 500 y lanzar excepciones legibles", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => ({ mensaje: "Fallo en la base de datos MySQL" }),
      } as Response);

      await expect(catalogApi.getProducts()).rejects.toThrow("Fallo en la base de datos MySQL");
    });

    it("debe capturar errores HTTP 503 cuando el Gateway Spring Boot no está corriendo", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: "Service Unavailable",
        json: async () => ({}),
      } as Response);

      await expect(catalogApi.getProducts()).rejects.toThrow(
        "Servicio no disponible. El Backend Spring Boot"
      );
    });
  });
});
