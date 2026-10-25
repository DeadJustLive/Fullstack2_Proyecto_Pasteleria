import { createContext, useContext } from "react";

export type RolSesion = "cliente" | "admin";

export interface Usuario {
  nombre: string;
  email: string;
  rol: RolSesion;
}

// Credenciales de demostracion para entrar al panel administrativo.
export const ADMIN_DEMO = {
  email: "admin@cremeco.cl",
  password: "admin123",
} as const;

export interface AuthContextValue {
  usuario: Usuario | null;
  logueado: boolean;
  login: (email: string, password?: string) => Usuario;
  registrar: (nombre: string, email: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return contexto;
}
