// @pca:start
// @id(frontend.lib.validators.checkout)
// @kind(util)
// @limit(lines: 120)
// @contract(exporta: validarCheckoutForm, CheckoutFormData)
// @relates(frontend.lib.validators.rut, frontend.lib.data.regionesChile)
// @desc(Reglas de validación puras para el formulario de Checkout según DSY1104 Anexo 1)
// @pca:end

import { validarEmail } from "./auth.validator";
import { validarRut } from "./rut.validator";
import { validarRegionYComuna } from "../data/regiones-chile";

export interface CheckoutFormData {
  nombre: string;
  apellidos?: string;
  email: string;
  telefono: string;
  rut?: string;
  calle: string;
  departamento?: string;
  region: string;
  comuna: string;
  indicaciones?: string;
  metodoPago?: "flow" | "transferencia" | "mercadolibre";
}

export function validarCheckoutForm(datos: CheckoutFormData): {
  valido: boolean;
  errores: Record<string, string>;
} {
  const errores: Record<string, string> = {};

  // 1. Datos personales del comprador
  if (!datos.nombre || datos.nombre.trim().length < 2) {
    errores.nombre = "El nombre es obligatorio (mínimo 2 letras).";
  }

  if (datos.apellidos !== undefined && datos.apellidos.trim().length < 2) {
    errores.apellidos = "Los apellidos son obligatorios (mínimo 2 letras).";
  }

  if (!validarEmail(datos.email)) {
    errores.email = "Ingresa un correo electrónico de facturación válido.";
  }

  if (!datos.telefono || datos.telefono.trim().length < 8) {
    errores.telefono = "Ingresa un número telefónico de contacto válido.";
  }

  if (datos.rut && !validarRut(datos.rut)) {
    errores.rut = "El RUN ingresado no es válido.";
  }

  // 2. Dirección de despacho
  if (!datos.calle || datos.calle.trim().length < 5) {
    errores.calle = "Ingresa la calle y número de entrega (mínimo 5 caracteres).";
  }

  if (!datos.region || datos.region.trim() === "") {
    errores.region = "Debes seleccionar una región de entrega.";
  }

  if (!datos.comuna || datos.comuna.trim() === "") {
    errores.comuna = "Debes seleccionar una comuna de entrega.";
  } else if (datos.region && !validarRegionYComuna(datos.region, datos.comuna)) {
    errores.comuna = "La comuna seleccionada no corresponde a la región elegida.";
  }

  // 3. Indicaciones opcionales (máximo 250 caracteres)
  if (datos.indicaciones && datos.indicaciones.length > 250) {
    errores.indicaciones = "Las indicaciones no deben superar los 250 caracteres.";
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores,
  };
}
