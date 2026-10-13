import { useEffect, useState, type ReactNode } from "react";
import { AuthContext, type AuthContextValue, type Usuario } from "@/context/auth";
import { borrarStorage, guardarStorage, leerStorage } from "@/lib/storage";

const STORAGE_KEY = "cremeco-sesion";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() =>
    leerStorage(STORAGE_KEY, null)
  );

  useEffect(() => {
    if (usuario) {
      guardarStorage(STORAGE_KEY, usuario);
    } else {
      borrarStorage(STORAGE_KEY);
    }
  }, [usuario]);

  const value: AuthContextValue = {
    usuario,
    logueado: usuario !== null,
    login: (email) =>
      setUsuario({ nombre: email.split("@")[0] || "Cliente", email }),
    registrar: (nombre, email) => setUsuario({ nombre, email }),
    logout: () => setUsuario(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
