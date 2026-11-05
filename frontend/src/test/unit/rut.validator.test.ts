import { describe, it, expect } from "vitest";
import {
  limpiarRut,
  formatearRut,
  validarRutChileno,
} from "@/lib/validators/rut.validator";

describe("rut.validator — Algoritmo Módulo 11", () => {
  describe("limpiarRut", () => {
    it("elimina puntos, guiones y espacios en blanco", () => {
      expect(limpiarRut(" 11.222.333-4 ")).toBe("112223334");
    });

    it("convierte el dígito verificador 'k' a mayúscula", () => {
      expect(limpiarRut("19876543-k")).toBe("19876543K");
    });

    it("retorna cadena vacía ante entrada no válida", () => {
      // @ts-expect-error probando robustez de tipos
      expect(limpiarRut(null)).toBe("");
    });
  });

  describe("formatearRut", () => {
    it("formatea correctamente un RUT estándar", () => {
      expect(formatearRut("112223334")).toBe("11.222.333-4");
    });

    it("retorna el texto limpio si tiene menos de 2 caracteres", () => {
      expect(formatearRut("1")).toBe("1");
    });
  });

  describe("validarRutChileno", () => {
    it("acepta RUTs chilenos válidos con guión y puntos", () => {
      expect(validarRutChileno("11.111.111-1")).toBe(true);
      expect(validarRutChileno("11111111-1")).toBe(true);
    });

    it("valida correctamente RUT con dígito verificador K", () => {
      // 19.876.543-K: suma modulo 11 calcula K
      // Probemos con un RUT verificado: 7.643.328-K o 10.000.001-K
      // Verifiquemos: 10000001 -> 1*2 + 0 + 0 + 0 + 0 + 0 + 0 + 1*9 = 11 -> resto 0 -> 11.
      // Probemos 7643328:
      // 8*2=16, 2*3=6, 3*4=12, 3*5=15, 4*6=24, 6*7=42, 7*2=14. Suma = 129 % 11 = 8 -> 11-8=3.
      // RUT oficial con K: 18.423.824-K -> 4*2=8, 2*3=6, 8*4=32, 3*5=15, 2*6=12, 4*7=28, 8*2=16, 1*3=3. Suma=120 % 11=10 -> 11-10=1 -> DV 1.
      // RUT con K conocido: 11.111.112-K -> suma: 2*2 + 1*3 + 1*4 + 1*5 + 1*6 + 1*7 + 1*2 + 1*3 = 4+3+4+5+6+7+2+3 = 34 % 11 = 1 -> 11-1 = 10 -> 'K'!
      expect(validarRutChileno("11.111.112-K")).toBe(true);
      expect(validarRutChileno("11111112-k")).toBe(true);
    });

    it("valida correctamente RUT con dígito verificador 0", () => {
      // 11.111.118 -> suma: 8*2 + 1*3 + 1*4 + 1*5 + 1*6 + 1*7 + 1*2 + 1*3 = 16+30 = 46 % 11 = 2 -> 9.
      // 11.111.117 -> 14+30 = 44 % 11 = 0 -> DV 0!
      expect(validarRutChileno("11.111.117-0")).toBe(true);
    });

    it("rechaza RUT con dígito verificador incorrecto", () => {
      expect(validarRutChileno("11.111.111-9")).toBe(false);
      expect(validarRutChileno("12.345.678-0")).toBe(false);
    });

    it("rechaza entradas con formato corrupto o letras en el cuerpo", () => {
      expect(validarRutChileno("11.ABC.111-1")).toBe(false);
      expect(validarRutChileno("")).toBe(false);
      expect(validarRutChileno("1")).toBe(false);
    });
  });
});
