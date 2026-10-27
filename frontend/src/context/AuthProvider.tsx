import { useEffect, useState, type ReactNode } from "react";
import { AuthContext, type AuthContextValue, type Usuario } from "@/context/auth";
import { api, clearToken, getToken, setToken } from "@/services/api";
import { borrarStorage, guardarStorage, leerStorage } from "@/lib/storage";

const STORAGE_KEY = "cremeco-sesion";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() =>
    leerStorage<Usuario | null>(STORAGE_KEY, null)
  );
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (usuario) {
      guardarStorage(STORAGE_KEY, usuario);
    } else {
      borrarStorage(STORAGE_KEY);
    }
  }, [usuario]);

  const login = async (email: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.auth.login({ email, password });
      setToken(res.token);
      setTokenState(res.token);
      setUsuario(res.usuario);
      return true;
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : "Error al iniciar sesión";
      if (
        mensaje.includes("Failed to fetch") ||
        mensaje.includes("NetworkError") ||
        mensaje.includes("Load failed") ||
        mensaje.includes("conexión") ||
        mensaje.includes("conexion")
      ) {
        setError("No se pudo conectar con el servidor de autenticación. Verifica que el backend esté activo.");
      } else {
        setError(mensaje);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const registrar = async (
    nombre: string,
    email: string,
    password?: string,
    telefono?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.auth.register({ nombre, email, password, telefono });
      if (res.token) {
        setToken(res.token);
        setTokenState(res.token);
      }
      setUsuario(res.usuario);
      return true;
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : "Error al registrar usuario";
      if (
        mensaje.includes("Failed to fetch") ||
        mensaje.includes("NetworkError") ||
        mensaje.includes("Load failed") ||
        mensaje.includes("conexión") ||
        mensaje.includes("conexion")
      ) {
        setError("No se pudo conectar con el servidor de autenticación. Verifica que el backend esté activo.");
      } else {
        setError(mensaje);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    clearToken();
    setTokenState(null);
    setUsuario(null);
    borrarStorage(STORAGE_KEY);
    setError(null);
  };

  const limpiarError = (): void => {
    setError(null);
  };

  const value: AuthContextValue = {
    usuario,
    token,
    logueado: usuario !== null,
    isLoading,
    error,
    login,
    registrar,
    logout,
    limpiarError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
