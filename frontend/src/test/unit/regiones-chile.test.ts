import { describe, it, expect } from "vitest";
import {
  REGIONES_CHILE,
  obtenerComunasPorRegion,
  obtenerNombreRegion,
  validarRegionYComuna,
} from "../../lib/data/regiones-chile";

describe("regiones-chile — Diccionario Oficial de Regiones y Comunas de Chile", () => {
  it("debe contener las 16 regiones oficiales de Chile", () => {
    expect(REGIONES_CHILE.length).toBe(16);
    const rm = REGIONES_CHILE.find((r) => r.codigo === "RM");
    expect(rm).toBeDefined();
    expect(rm?.comunas.length).toBeGreaterThan(30);
  });

  describe("obtenerComunasPorRegion", () => {
    it("debe retornar la lista de comunas por código de región", () => {
      const comunasRM = obtenerComunasPorRegion("RM");
      expect(comunasRM).toContain("Santiago");
      expect(comunasRM).toContain("Providencia");
      expect(comunasRM).toContain("Las Condes");
    });

    it("debe permitir buscar por nombre de región case-insensitive", () => {
      const comunasValpo = obtenerComunasPorRegion("valparaíso");
      expect(comunasValpo).toContain("Viña del Mar");
      expect(comunasValpo).toContain("Valparaíso");
    });

    it("debe retornar arreglo vacío para códigos o nombres inexistentes", () => {
      expect(obtenerComunasPorRegion("XX")).toEqual([]);
      expect(obtenerComunasPorRegion("")).toEqual([]);
    });
  });

  describe("obtenerNombreRegion", () => {
    it("debe retornar el nombre completo a partir del código", () => {
      expect(obtenerNombreRegion("RM")).toBe("Metropolitana de Santiago");
      expect(obtenerNombreRegion("VA")).toBe("Valparaíso");
    });

    it("debe devolver el parámetro original si no existe", () => {
      expect(obtenerNombreRegion("INEXISTENTE")).toBe("INEXISTENTE");
    });
  });

  describe("validarRegionYComuna", () => {
    it("debe retornar true para combinaciones válidas", () => {
      expect(validarRegionYComuna("RM", "Santiago")).toBe(true);
      expect(validarRegionYComuna("RM", "providencia ")).toBe(true);
      expect(validarRegionYComuna("VA", "Viña del Mar")).toBe(true);
      expect(validarRegionYComuna("Biobío", "Concepción")).toBe(true);
    });

    it("debe retornar false para comunas que no pertenecen a la región", () => {
      expect(validarRegionYComuna("RM", "Viña del Mar")).toBe(false);
      expect(validarRegionYComuna("AP", "Punta Arenas")).toBe(false);
      expect(validarRegionYComuna("XX", "Santiago")).toBe(false);
    });
  });
});
