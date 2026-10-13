import { createContext, useContext } from "react";

export interface Usuario {
  nombre: string;
  email: string;
}

export interface AuthContextValue {
  usuario: Usuario | null;
  logueado: boolean;
  login: (email: string) => void;
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
