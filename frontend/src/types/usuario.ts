export type RolUsuario = "admin" | "editor" | "cliente";

export type EstadoUsuario = "activo" | "suspendido";

export interface UsuarioAdmin {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  estado: EstadoUsuario;
}
