import { describe, it, expect } from "vitest";
import { productos, CATEGORIAS, VARIACIONES, BADGE_LABEL, PRECIO_MAX } from "@/data/products";
import { ARTICULOS } from "@/data/articles";
import { blogPosts } from "@/data/blog";

describe("data — Catálogos Estáticos y Semillas del Dominio", () => {
  it("productos contiene la lista completa con precios válidos", () => {
    expect(productos.length).toBeGreaterThan(0);
    productos.forEach((p) => {
      expect(p.id).toBeGreaterThan(0);
      expect(p.nombre).toBeTruthy();
      expect(p.precio).toBeGreaterThan(0);
      expect(p.precio).toBeLessThanOrEqual(PRECIO_MAX);
    });
  });

  it("CATEGORIAS y VARIACIONES contienen las opciones oficiales de filtro", () => {
    expect(CATEGORIAS.length).toBe(5);
    expect(CATEGORIAS.map((c) => c.value)).toContain("torta");
    expect(CATEGORIAS.map((c) => c.value)).toContain("cheesecake");

    expect(VARIACIONES.length).toBe(4);
    expect(VARIACIONES.map((v) => v.value)).toContain("personalizable");
    expect(VARIACIONES.map((v) => v.value)).toContain("sin gluten");
  });

  it("BADGE_LABEL mapea todas las etiquetas requeridas", () => {
    expect(BADGE_LABEL.premium).toBe("★ Premium");
    expect(BADGE_LABEL.vendido).toBe("Más vendido");
    expect(BADGE_LABEL.oferta).toBe("Oferta Especial");
  });

  it("ARTICULOS y blogPosts tienen contenidos y slugs únicos", () => {
    expect(ARTICULOS.length).toBeGreaterThan(0);
    expect(blogPosts.length).toBeGreaterThan(0);

    const slugs = blogPosts.map((a) => a.slug);
    const setSlugs = new Set(slugs);
    expect(setSlugs.size).toBe(slugs.length);
  });
});
