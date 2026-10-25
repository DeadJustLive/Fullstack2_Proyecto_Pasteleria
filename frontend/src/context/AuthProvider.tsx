import { useEffect, useState, type ReactNode } from "react";
import {
  ADMIN_DEMO,
  AuthContext,
  type AuthContextValue,
  type RolSesion,
  type Usuario,
} from "@/context/auth";
import { borrarStorage, guardarStorage, leerStorage } from "@/lib/storage";

const STORAGE_KEY = "cremeco-sesion";

// Correos que pueden entrar al panel con la clave demo.
const ADMIN_EMAILS = new Set([
  ADMIN_DEMO.email,
  "matias@ejemplo.com",
  "nicolas@ejemplo.com",
]);

interface SesionGuardada {
  nombre: string;
  email: string;
  rol?: RolSesion;
}

function capitalizar(valor: string) {
  return valor.charAt(0).toUpperCase() + valor.slice(1);
}

function leerSesion(): Usuario | null {
  const guardado = leerStorage<SesionGuardada | null>(STORAGE_KEY, null);
  if (!guardado) return null;

  return {
    ...guardado,
    rol: guardado.rol === "admin" ? "admin" : "cliente",
  };
}

function crearUsuario(email: string, password?: string): Usuario {
  const normalizado = email.trim().toLowerCase();
  const esAdmin =
    ADMIN_EMAILS.has(normalizado) && password === ADMIN_DEMO.password;
  const base = normalizado.split("@")[0] || "Cliente";
  const nombre =
    esAdmin && normalizado === ADMIN_DEMO.email
      ? "Administrador"
      : capitalizar(base);

  return {
    nombre,
    email: normalizado,
    rol: esAdmin ? "admin" : "cliente",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(leerSesion);

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
    login: (email, password) => {
      const nuevoUsuario = crearUsuario(email, password);
      setUsuario(nuevoUsuario);
      return nuevoUsuario;
    },
    registrar: (nombre, email) =>
      setUsuario({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        rol: "cliente",
      }),
    logout: () => setUsuario(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
