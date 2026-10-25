// Reglas de validacion compartidas por los formularios de acceso.
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function esEmailValido(valor: string): boolean {
  return EMAIL_REGEX.test(valor.trim());
}

export function validarNombre(valor: string): string | null {
  if (!valor.trim()) return "Ingresa tu nombre.";
  if (valor.trim().length < 2) return "El nombre debe tener al menos 2 caracteres.";
  return null;
}

export function validarPasswordSegura(valor: string): string | null {
  if (!valor) return "Crea una contraseña.";
  if (valor.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (!/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(valor)) {
    return "La contraseña debe incluir al menos una letra.";
  }
  if (!/\d/.test(valor)) {
    return "La contraseña debe incluir al menos un número.";
  }
  return null;
}
