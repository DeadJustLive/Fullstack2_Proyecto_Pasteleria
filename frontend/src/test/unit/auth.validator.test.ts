import { describe, it, expect } from "vitest";
import {
  validarEmail,
  validarPassword,
  validarLoginForm,
  validarRegistroForm,
} from "../../lib/validators/auth.validator";

describe("auth.validator — Pruebas Unitarias de Autenticación", () => {
  describe("validarEmail", () => {
    it("debe validar correos electrónicos estándar válidos", () => {
      expect(validarEmail("cliente@cremeco.cl")).toBe(true);
      expect(validarEmail("juan.perez@dominio.com")).toBe(true);
      expect(validarEmail("usuario+tag@empresa.org")).toBe(true);
    });

    it("debe rechazar correos vacíos, mal formados o tipos no string", () => {
      expect(validarEmail("")).toBe(false);
      expect(validarEmail("sinarroba.com")).toBe(false);
      expect(validarEmail("@sinusuario.cl")).toBe(false);
      expect(validarEmail("usuario@sintld")).toBe(false);
      // @ts-expect-error probando entrada no string
      expect(validarEmail(null)).toBe(false);
      // @ts-expect-error probando entrada no string
      expect(validarEmail(undefined)).toBe(false);
    });
  });

  describe("validarPassword", () => {
    it("debe aceptar contraseñas con 6 o más caracteres", () => {
      const res = validarPassword("123456");
      expect(res.valido).toBe(true);
      expect(res.mensaje).toBeUndefined();
    });

    it("debe rechazar contraseñas vacías o menores a 6 caracteres", () => {
      const vacio = validarPassword("");
      expect(vacio.valido).toBe(false);
      expect(vacio.mensaje).toContain("requerida");

      const corta = validarPassword("12345");
      expect(corta.valido).toBe(false);
      expect(corta.mensaje).toContain("al menos 6 caracteres");

      // @ts-expect-error probando tipo inválido
      const nulo = validarPassword(null);
      expect(nulo.valido).toBe(false);
    });
  });

  describe("validarLoginForm", () => {
    it("debe aprobar credenciales válidas", () => {
      const res = validarLoginForm({
        email: "cliente@cremeco.cl",
        password: "password123",
      });
      expect(res.valido).toBe(true);
      expect(Object.keys(res.errores).length).toBe(0);
    });

    it("debe acumular errores si email y password son inválidos", () => {
      const res = validarLoginForm({
        email: "correo-invalido",
        password: "",
      });
      expect(res.valido).toBe(false);
      expect(res.errores.email).toBeDefined();
      expect(res.errores.password).toBeDefined();
    });
  });

  describe("validarRegistroForm", () => {
    it("debe validar un registro completo y correcto de cliente", () => {
      const res = validarRegistroForm({
        nombre: "María",
        apellidos: "González",
        email: "maria.gonzalez@cremeco.cl",
        rut: "11.111.111-1",
        telefono: "+56912345678",
        password: "secretoSeguro1",
        confirmPassword: "secretoSeguro1",
      });
      expect(res.valido).toBe(true);
      expect(Object.keys(res.errores).length).toBe(0);
    });

    it("debe detectar nombre corto, email inválido y contraseñas que no coinciden", () => {
      const res = validarRegistroForm({
        nombre: "M",
        apellidos: "G",
        email: "correo-invalido",
        password: "password123",
        confirmPassword: "passwordDiferente",
      });
      expect(res.valido).toBe(false);
      expect(res.errores.nombre).toContain("al menos 2 caracteres");
      expect(res.errores.apellidos).toContain("al menos 2 caracteres");
      expect(res.errores.email).toBeDefined();
      expect(res.errores.confirmPassword).toContain("no coinciden");
    });

    it("debe validar el formato del teléfono móvil chileno", () => {
      const conTelInvalido = validarRegistroForm({
        nombre: "Carlos",
        email: "carlos@test.cl",
        telefono: "123",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(conTelInvalido.valido).toBe(false);
      expect(conTelInvalido.errores.telefono).toContain("teléfono chileno válido");

      const conTelNacional9Digitos = validarRegistroForm({
        nombre: "Carlos",
        email: "carlos@test.cl",
        telefono: "912345678",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(conTelNacional9Digitos.valido).toBe(true);
    });

    it("debe rechazar RUN con dígito verificador erróneo", () => {
      const res = validarRegistroForm({
        nombre: "Pedro",
        email: "pedro@test.cl",
        rut: "11.111.111-9", // DV incorrecto
        password: "password123",
        confirmPassword: "password123",
      });
      expect(res.valido).toBe(false);
      expect(res.errores.rut).toContain("RUN ingresado no es válido");
    });
  });
});
