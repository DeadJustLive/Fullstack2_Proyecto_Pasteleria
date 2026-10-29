// @pca:start
// @id(frontend.lib.validators.rut)
// @kind(util)
// @limit(lines: 90)
// @contract(exporta: validarRut, formatearRut, limpiarRut)
// @desc(Validador y formateador oficial de RUN/RUT chileno mediante algoritmo Módulo 11)
// @pca:end

/**
 * Limpia un RUT eliminando puntos, guiones y espacios en blanco,
 * retornando el cuerpo y dígito verificador en mayúsculas.
 */
export function limpiarRut(rut: string): string {
  if (typeof rut !== "string") return "";
  return rut.replace(/[^0-9kK]/g, "").toUpperCase();
}

/**
 * Formatea un RUT al formato estándar XX.XXX.XXX-X.
 * Si el RUT no tiene suficientes dígitos, retorna el valor limpio.
 */
export function formatearRut(rut: string): string {
  const limpio = limpiarRut(rut);
  if (limpio.length < 2) return limpio;

  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);

  // Formatear cuerpo con separadores de miles
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

/**
 * Valida un RUN/RUT chileno calculando el dígito verificador con algoritmo Módulo 11.
 * Retorna true si es válido, false en caso contrario.
 */
export function validarRut(rut: string): boolean {
  const limpio = limpiarRut(rut);
  if (limpio.length < 2 || limpio.length > 9) {
    return false;
  }

  const cuerpo = limpio.slice(0, -1);
  const dvIngresado = limpio.slice(-1);

  // El cuerpo debe ser estrictamente numérico
  if (!/^\d+$/.test(cuerpo)) {
    return false;
  }

  // Algoritmo Módulo 11
  let suma = 0;
  let multiplicador = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = suma % 11;
  const digitoCalculado = 11 - resto;

  let dvEsperado = "";
  if (digitoCalculado === 11) {
    dvEsperado = "0";
  } else if (digitoCalculado === 10) {
    dvEsperado = "K";
  } else {
    dvEsperado = String(digitoCalculado);
  }

  return dvIngresado === dvEsperado;
}
