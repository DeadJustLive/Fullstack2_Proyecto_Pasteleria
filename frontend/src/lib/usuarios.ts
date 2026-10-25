// Persistencia y reglas de seguridad para la gestion de usuarios.
import { USUARIOS_INICIALES } from "@/data/usuarios";
import { guardarStorage, leerStorage } from "@/lib/storage";
import type { RolUsuario, UsuarioAdmin } from "@/types/usuario";

const STORAGE_KEY = "cremeco-usuarios";

export function obtenerUsuarios(): UsuarioAdmin[] {
  return leerStorage<UsuarioAdmin[]>(STORAGE_KEY, USUARIOS_INICIALES);
}

export function guardarUsuarios(usuarios: UsuarioAdmin[]): void {
  guardarStorage(STORAGE_KEY, usuarios);
}

export function contarAdministradoresActivos(usuarios: UsuarioAdmin[]): number {
  return usuarios.filter(
    (usuario) => usuario.rol === "admin" && usuario.estado === "activo"
  ).length;
}

export function validarCambioRol(
  usuarios: UsuarioAdmin[],
  usuarioId: string,
  nuevoRol: RolUsuario
): string | null {
  const usuario = usuarios.find((item) => item.id === usuarioId);
  if (!usuario) return "Usuario no encontrado.";

  if (
    usuario.rol === "admin" &&
    usuario.estado === "activo" &&
    nuevoRol !== "admin" &&
    contarAdministradoresActivos(usuarios) <= 1
  ) {
    return "No puedes quitar el rol al último administrador activo.";
  }

  return null;
}

export function validarSuspension(
  usuarios: UsuarioAdmin[],
  usuarioId: string
): string | null {
  const usuario = usuarios.find((item) => item.id === usuarioId);
  if (!usuario) return "Usuario no encontrado.";

  if (
    usuario.rol === "admin" &&
    usuario.estado === "activo" &&
    contarAdministradoresActivos(usuarios) <= 1
  ) {
    return "No puedes suspender al último administrador activo.";
  }

  return null;
}
