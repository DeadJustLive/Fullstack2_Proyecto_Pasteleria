import { useState, type FormEvent } from "react";
import { AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/auth";

interface ModalRegistroProps {
  abierto: boolean;
  onCerrar: () => void;
  onCambiarALogin: () => void;
}

export function ModalRegistro({ abierto, onCerrar, onCambiarALogin }: ModalRegistroProps) {
  const { registrar, isLoading, error, limpiarError } = useAuth();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleCerrar = () => {
    limpiarError();
    onCerrar();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await registrar(nombre, email, password);
    if (ok) {
      setNombre("");
      setEmail("");
      setPassword("");
      onCerrar();
    }
  };

  return (
    <Modal abierto={abierto} titulo="Crear cuenta" onCerrar={handleCerrar}>
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
          label="Nombre"
          placeholder="Ej: Juan Pérez"
          required
          disabled={isLoading}
          value={nombre}
          onChange={(e) => {
            if (error) limpiarError();
            setNombre(e.target.value);
          }}
        />
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
          placeholder="Crea una contraseña segura"
          required
          disabled={isLoading}
          value={password}
          onChange={(e) => {
            if (error) limpiarError();
            setPassword(e.target.value);
          }}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Registrando..." : "Registrarme"}
        </Button>

        <p className="text-center font-body text-sm text-ink/80">
          ¿Ya tienes cuenta?{" "}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              limpiarError();
              onCambiarALogin();
            }}
            className="font-semibold text-secondary underline hover:text-secondary/80 disabled:opacity-50"
          >
            Inicia sesión
          </button>
        </p>
      </form>
    </Modal>
  );
}
