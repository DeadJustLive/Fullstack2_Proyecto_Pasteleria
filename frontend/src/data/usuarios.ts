import type {
  EstadoUsuario,
  RolUsuario,
  UsuarioAdmin,
} from "@/types/usuario";

export const LABEL_ROL: Record<RolUsuario, string> = {
  admin: "Admin",
  editor: "Editor",
  cliente: "Cliente",
};

export const LABEL_ESTADO_USUARIO: Record<EstadoUsuario, string> = {
  activo: "Activo",
  suspendido: "Suspendido",
};

export const TONO_ROL: Record<
  RolUsuario,
  "primary" | "warning" | "neutral"
> = {
  admin: "primary",
  editor: "warning",
  cliente: "neutral",
};

export const TONO_ESTADO_USUARIO: Record<
  EstadoUsuario,
  "success" | "danger"
> = {
  activo: "success",
  suspendido: "danger",
};

export const ROLES: {
  value: RolUsuario;
  label: string;
  descripcion: string;
}[] = [
  {
    value: "admin",
    label: "Administrador",
    descripcion: "Acceso total al panel y a la gestión de usuarios.",
  },
  {
    value: "editor",
    label: "Editor",
    descripcion: "Gestiona inventario y pedidos, sin acceso a usuarios.",
  },
  {
    value: "cliente",
    label: "Cliente",
    descripcion: "Compra en la tienda y sigue sus pedidos.",
  },
];

export const USUARIOS_INICIALES: UsuarioAdmin[] = [
  {
    id: "u1",
    nombre: "Matias Rojas",
    email: "matias@ejemplo.com",
    rol: "admin",
    estado: "activo",
  },
  {
    id: "u2",
    nombre: "Nicolás Pérez",
    email: "nicolas@ejemplo.com",
    rol: "admin",
    estado: "activo",
  },
  {
    id: "u3",
    nombre: "Ana García",
    email: "ana.garcia@ejemplo.com",
    rol: "editor",
    estado: "activo",
  },
  {
    id: "u4",
    nombre: "Cliente Frecuente",
    email: "cliente@ejemplo.com",
    rol: "cliente",
    estado: "activo",
  },
  {
    id: "u5",
    nombre: "Pedro Méndez",
    email: "pedro@ejemplo.com",
    rol: "cliente",
    estado: "suspendido",
  },
];
