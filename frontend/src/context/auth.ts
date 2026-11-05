import { createContext, useContext } from "react";

export interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  rol?: string;
  estado?: string;
}

export interface AuthContextValue {
  usuario: Usuario | null;
  token: string | null;
  logueado: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password?: string) => Promise<boolean>;
  registrar: (nombre: string, email: string, password?: string, telefono?: string) => Promise<boolean>;
  logout: () => void;
  limpiarError: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return contexto;
}
