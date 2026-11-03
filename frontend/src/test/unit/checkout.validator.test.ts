import { describe, it, expect } from "vitest";
import {
  validarCheckoutForm,
  validarCheckoutDelivery,
  validarCheckoutRetiro,
  type CheckoutFormData,
} from "../../lib/validators/checkout.validator";

describe("checkout.validator — Pruebas Unitarias de Validación de Checkout (DSY1104)", () => {
  const datosBaseDespachoValido: CheckoutFormData = {
    nombre: "Constanza",
    apellidos: "Valenzuela",
    email: "constanza@pasteleria.cl",
    telefono: "+56987654321",
    rut: "11.111.111-1",
    metodoEntrega: "despacho",
    calle: "Av. Providencia 1234, Depto 402",
    region: "RM",
    comuna: "Providencia",
    indicaciones: "Tocar timbre 402, conserjería 24/7",
    metodoPago: "flow",
  };

  it("debe validar un pedido con despacho a domicilio válido", () => {
    const res = validarCheckoutForm(datosBaseDespachoValido);
    expect(res.valido).toBe(true);
    expect(Object.keys(res.errores).length).toBe(0);
  });

  it("debe validar un pedido con retiro en tienda sin exigir calle ni comuna", () => {
    const datosRetiro: CheckoutFormData = {
      nombre: "Rodrigo",
      email: "rodrigo@pasteleria.cl",
      telefono: "912345678",
      metodoEntrega: "retiro",
    };
    const res = validarCheckoutRetiro(datosRetiro);
    expect(res.valido).toBe(true);
    expect(res.errores.calle).toBeUndefined();
    expect(res.errores.comuna).toBeUndefined();
  });

  it("debe exigir calle, región y comuna cuando el método es despacho", () => {
    const datosIncompletos: CheckoutFormData = {
      nombre: "Rodrigo",
      email: "rodrigo@pasteleria.cl",
      telefono: "912345678",
      metodoEntrega: "despacho",
      calle: "",
      region: "",
      comuna: "",
    };
    const res = validarCheckoutDelivery(datosIncompletos);
    expect(res.valido).toBe(false);
    expect(res.errores.calle).toBeDefined();
    expect(res.errores.region).toBeDefined();
    expect(res.errores.comuna).toBeDefined();
  });

  it("debe rechazar comuna que no corresponde a la región seleccionada", () => {
    const datosComunaIncongruente: CheckoutFormData = {
      ...datosBaseDespachoValido,
      region: "RM",
      comuna: "Viña del Mar", // Viña del Mar está en la V Región (Valparaíso)
    };
    const res = validarCheckoutForm(datosComunaIncongruente);
    expect(res.valido).toBe(false);
    expect(res.errores.comuna).toContain("no corresponde a la región elegida");
  });

  it("debe validar los límites de caracteres de nombre, teléfono e indicaciones", () => {
    const datosInvalidos: CheckoutFormData = {
      ...datosBaseDespachoValido,
      nombre: "A", // < 2 caracteres
      telefono: "123", // < 8 caracteres
      indicaciones: "A".repeat(251), // > 250 caracteres
    };
    const res = validarCheckoutForm(datosInvalidos);
    expect(res.valido).toBe(false);
    expect(res.errores.nombre).toContain("mínimo 2 letras");
    expect(res.errores.telefono).toContain("contacto válido");
    expect(res.errores.indicaciones).toContain("no deben superar los 250 caracteres");
  });

  it("debe rechazar RUN con dígito verificador inválido si se proporciona", () => {
    const datosRutInvalido: CheckoutFormData = {
      ...datosBaseDespachoValido,
      rut: "11.111.111-0",
    };
    const res = validarCheckoutForm(datosRutInvalido);
    expect(res.valido).toBe(false);
    expect(res.errores.rut).toContain("algoritmo Módulo 11");
  });
});
