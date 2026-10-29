// @pca:start
// @id(admin.lib.validators)
// @kind(service)
// @limit(lines: 120)
// @contract(validarRutAdmin, validarProductoAdmin, validarUsuarioAdmin)
// @relates(docs.convenciones)
// @desc(Validaciones para formularios de gestion de catalogo y usuarios en Admin PWA)
// @pca:end
/**
 * Validador oficial de RUN/RUT chileno mediante algoritmo Módulo 11 (Admin PWA).
 */
export function limpiarRut(rut: string): string {
  if (typeof rut !== "string") return "";
  return rut.replace(/[^0-9kK]/g, "").toUpperCase();
}

export function formatearRut(rut: string): string {
  const limpio = limpiarRut(rut);
  if (limpio.length < 2) return limpio;

  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);

  let cuerpoFormateado = "";
  let contador = 0;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    cuerpoFormateado = cuerpo[i] + cuerpoFormateado;
    contador++;
    if (contador === 3 && i > 0) {
      cuerpoFormateado = "." + cuerpoFormateado;
      contador = 0;
    }
  }

  return `${cuerpoFormateado}-${dv}`;
}

export function validarRut(rut: string): boolean {
  const limpio = limpiarRut(rut);
  if (limpio.length < 2 || limpio.length > 9) return false;

  const cuerpo = limpio.slice(0, -1);
  const dvIngresado = limpio.slice(-1);

  if (!/^\d+$/.test(cuerpo)) return false;

  let suma = 0;
  let multiplicador = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = suma % 11;
  const digitoCalculado = 11 - resto;
  let dvEsperado = digitoCalculado === 11 ? "0" : digitoCalculado === 10 ? "K" : String(digitoCalculado);

  return dvIngresado === dvEsperado;
}

export function validarEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
}

export function validarProductoAdmin(datos: {
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
}): { valido: boolean; errores: Record<string, string> } {
  const errores: Record<string, string> = {};

  if (!datos.nombre || datos.nombre.trim().length < 3) {
    errores.nombre = "El nombre del producto debe tener al menos 3 caracteres.";
  }

  if (typeof datos.precio !== "number" || isNaN(datos.precio) || datos.precio <= 0) {
    errores.precio = "El precio debe ser un valor entero positivo mayor a 0.";
  }

  if (typeof datos.stock !== "number" || isNaN(datos.stock) || datos.stock < 0) {
    errores.stock = "El stock debe ser un número mayor o igual a 0.";
  }

  if (!datos.categoria || datos.categoria.trim() === "") {
    errores.categoria = "Debes seleccionar una categoría para el producto.";
  }

  return { valido: Object.keys(errores).length === 0, errores };
}

export function validarUsuarioAdmin(datos: {
  nombre: string;
  email: string;
  rut?: string;
  rol: string;
}): { valido: boolean; errores: Record<string, string> } {
  const errores: Record<string, string> = {};

  if (!datos.nombre || datos.nombre.trim().length < 2) {
    errores.nombre = "El nombre de usuario es obligatorio.";
  }

  if (!validarEmail(datos.email)) {
    errores.email = "Ingresa un correo electrónico corporativo válido.";
  }

  if (datos.rut && !validarRut(datos.rut)) {
    errores.rut = "El RUN ingresado no es válido (verifique dígito verificador).";
  }

  const rolesPermitidos = ["ADMIN_GENERAL", "JEFE_COCINA", "CAJERO_MOSTRADOR", "CLIENTE", "ADMIN", "PASTELERO", "VENDEDOR"];
  if (!datos.rol || !rolesPermitidos.includes(datos.rol)) {
    errores.rol = "El rol seleccionado no es válido.";
  }

  return { valido: Object.keys(errores).length === 0, errores };
}
