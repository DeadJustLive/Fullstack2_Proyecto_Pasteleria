import { useState, type FormEvent } from "react";
import { AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/auth";

interface ModalLoginProps {
  abierto: boolean;
  onCerrar: () => void;
  onCambiarARegistro: () => void;
}

export function ModalLogin({ abierto, onCerrar, onCambiarARegistro }: ModalLoginProps) {
  const { login, isLoading, error, limpiarError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleCerrar = () => {
    limpiarError();
    onCerrar();
  };

  const handleAutorellenarTest = (tipo: "cliente" | "admin") => {
    limpiarError();
    if (tipo === "cliente") {
      setEmail("cliente@cremeco.cl");
      setPassword("Pasteleria2026!");
    } else {
      setEmail("admin@cremeco.cl");
      setPassword("Admin2026!");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) {
      setEmail("");
      setPassword("");
      onCerrar();
    }
  };

  return (
    <Modal abierto={abierto} titulo="Iniciar sesión" onCerrar={handleCerrar}>
      <div className="mb-4 flex items-center justify-between rounded-lg border border-primary/50 bg-primary/15 px-3 py-2 text-xs">
        <span className="font-bold text-tertiary">⚡ Relleno Rápido Test:</span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleAutorellenarTest("cliente")}
            className="rounded-full bg-secondary px-2.5 py-1 font-bold text-white transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cliente
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleAutorellenarTest("admin")}
            className="rounded-full bg-tertiary px-2.5 py-1 font-bold text-white transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Admin
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600 font-medium"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
          <span className="leading-tight">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Correo"
          type="email"
          placeholder="Ej: micorreo@ejemplo.com"
          required
          disabled={isLoading}
          value={email}
          onChange={(e) => {
            if (error) limpiarError();
            setEmail(e.target.value);
          }}
        />
        <PasswordInput
          label="Contraseña"
          placeholder="Ingresa tu contraseña"
          required
          disabled={isLoading}
          value={password}
          onChange={(e) => {
            if (error) limpiarError();
            setPassword(e.target.value);
          }}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Iniciando sesión..." : "Entrar"}
        </Button>

        <p className="text-center font-body text-sm text-ink/80">
          ¿No tienes cuenta?{" "}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              limpiarError();
              onCambiarARegistro();
            }}
            className="font-semibold text-secondary underline hover:text-secondary/80 disabled:opacity-50"
          >
            Regístrate
          </button>
        </p>
      </form>
    </Modal>
  );
}
