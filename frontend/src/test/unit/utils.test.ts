// @pca:start
// @id(frontend.test.unit.utils)
// @kind(test)
// @limit(lines: 80)
// @relates(frontend.lib.utils)
// @desc(Pruebas unitarias para utilidades puras de clases Tailwind y formateo de precios)
// @pca:end
import { describe, it, expect } from "vitest";
import { formatPrecio, cn, formatFechaLarga } from "@/lib/utils";

describe("utils — Utilidades Puras", () => {
  describe("formatPrecio", () => {
    it("formatea precios positivos con separador de miles y signo peso", () => {
      const resultado = formatPrecio(12500);
      expect(resultado).toContain("$");
      expect(resultado).toContain("12");
      expect(resultado).toContain("500");
    });

    it("formatea cero adecuadamente", () => {
      expect(formatPrecio(0)).toBe("$0");
    });

    it("retorna $0 si el valor es inválido o NaN", () => {
      expect(formatPrecio(NaN)).toBe("$0");
      // @ts-expect-error validando caso límite
      expect(formatPrecio(null)).toBe("$0");
    });

    it("soporta valores negativos ante devoluciones o descuentos", () => {
      const resultado = formatPrecio(-5000);
      expect(resultado).toContain("-$");
      expect(resultado).toContain("5");
    });
  });

  describe("cn (clsx + tailwind-merge)", () => {
    it("combina clases condicionales simples", () => {
      expect(cn("px-4", "py-2")).toBe("px-4 py-2");
      expect(cn("base", false && "oculto", true && "visible")).toBe("base visible");
    });

    it("resuelve colisiones de clases Tailwind dando prioridad a la última", () => {
      expect(cn("px-2", "px-6")).toBe("px-6");
      expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    });
  });

  describe("formatFechaLarga", () => {
    it("formatea fechas ISO correctamente en español", () => {
      const fecha = formatFechaLarga("2026-11-03");
      expect(fecha).toContain("2026");
      expect(fecha).toContain("noviembre");
    });

    it("retorna string vacío si la fecha es inválida o vacía", () => {
      expect(formatFechaLarga("")).toBe("");
      expect(formatFechaLarga("fecha-invalida")).toBe("");
      // @ts-expect-error caso límite
      expect(formatFechaLarga(null)).toBe("");
    });
  });
});
