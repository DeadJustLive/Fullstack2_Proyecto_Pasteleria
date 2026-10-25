// Evita redirecciones externas cuando llega ?redirect=... en la URL.
export function destinoSeguro(valor: string | null, porDefecto = "/perfil"): string {
  if (!valor) return porDefecto;
  if (!valor.startsWith("/") || valor.startsWith("//")) return porDefecto;
  if (valor.includes("\\")) return porDefecto;
  if (valor === "/login" || valor === "/registro") return porDefecto;
  return valor;
}
