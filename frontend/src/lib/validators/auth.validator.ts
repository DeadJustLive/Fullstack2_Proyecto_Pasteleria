// @pca:start
// @id(frontend.lib.authValidator)
// @kind(service)
// @limit(lines: 120)
// @contract(validarEmail, validarPassword, validarRegistro, validarLogin)
// @relates(frontend.lib.rutValidator)
// @relates(docs.convenciones)
// @desc(Validaciones de formularios de autenticacion y registro de clientes)
// @pca:end

import { validarRut } from "./rut.validator";

export function validarEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email.trim());
}

export function validarPassword(password: string): { valido: boolean; mensaje?: string } {
  if (!password || typeof password !== "string") {
    return { valido: false, mensaje: "La contraseña es requerida." };
  }
  if (password.length < 6) {
    return { valido: false, mensaje: "La contraseña debe tener al menos 6 caracteres." };
  }
  return { valido: true };
}

export function validarLoginForm(datos: {
  email: string;
  password?: string;
}): { valido: boolean; errores: Record<string, string> } {
  const errores: Record<string, string> = {};

  if (!validarEmail(datos.email)) {
    errores.email = "Ingresa un correo electrónico válido.";
  }

  if (!datos.password || datos.password.trim() === "") {
    errores.password = "La contraseña es requerida.";
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores,
  };
}

export function validarRegistroForm(datos: {
  nombre: string;
  apellidos?: string;
  email: string;
  rut?: string;
  telefono?: string;
  password?: string;
  confirmPassword?: string;
}): { valido: boolean; errores: Record<string, string> } {
  const errores: Record<string, string> = {};

  if (!datos.nombre || datos.nombre.trim().length < 2) {
    errores.nombre = "El nombre debe tener al menos 2 caracteres.";
  }

  if (datos.apellidos !== undefined && datos.apellidos.trim().length < 2) {
    errores.apellidos = "Los apellidos deben tener al menos 2 caracteres.";
  }

  if (!validarEmail(datos.email)) {
    errores.email = "Ingresa un correo electrónico válido.";
  }

  if (datos.rut && !validarRut(datos.rut)) {
    errores.rut = "El RUN ingresado no es válido (verifique el dígito verificador).";
  }

  if (datos.telefono) {
    const telLimpio = datos.telefono.replace(/\s+/g, "");
    if (!/^\+?56\d{9}$|^\d{9}$/.test(telLimpio)) {
      errores.telefono = "Ingresa un teléfono chileno válido (ej: +56 9 1234 5678).";
    }
  }

  const passRes = validarPassword(datos.password || "");
  if (!passRes.valido) {
    errores.password = passRes.mensaje || "Contraseña inválida.";
  }

  if (datos.confirmPassword !== undefined && datos.password !== datos.confirmPassword) {
    errores.confirmPassword = "Las contraseñas no coinciden.";
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores,
  };
}
