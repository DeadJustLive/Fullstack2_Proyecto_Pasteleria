// @pca:start
// @id(frontend.test.unit.fallaDemo)
// @kind(test)
// @limit(lines: 45)
// @desc(Prueba demostrativa de ciclo TDD Red a Green corregida exitosamente)
// @pca:end
import { describe, it, expect } from "vitest";
import { validarRutChileno } from "@/lib/validators/rut.validator";

describe("Demostración TDD — Ciclo de Falla y Corrección", () => {
  /**
   * ESTADO INICIAL (FALLA INTENCIONAL / RED):
   *   expect(validarRutChileno("11.111.111-9")).toBe(true);
   *   Falla con: AssertionError: expected false to be true
   *
   * CORRECCIÓN APLICADA (GREEN):
   *   El dígito verificador correcto de 11.111.111 es 1, no 9.
   *   Por ende, el validador debe retornar false ante el RUT incorrecto.
   */
  it("DEMO CORREGIDA: Rechaza correctamente el RUT con dígito verificador adulterado", () => {
    const resultado = validarRutChileno("11.111.111-9");
    expect(resultado).toBe(false); // Corrección aplicada: ahora pasa exitosamente en verde
  });
});
