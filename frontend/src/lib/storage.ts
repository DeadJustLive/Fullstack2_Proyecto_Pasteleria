// Helpers de persistencia en localStorage con manejo de errores.
export function leerStorage<T>(clave: string, respaldo: T): T {
  try {
    const guardado = localStorage.getItem(clave);
    return guardado ? (JSON.parse(guardado) as T) : respaldo;
  } catch {
    return respaldo;
  }
}

export function guardarStorage<T>(clave: string, valor: T): void {
  localStorage.setItem(clave, JSON.stringify(valor));
}

export function borrarStorage(clave: string): void {
  localStorage.removeItem(clave);
}
