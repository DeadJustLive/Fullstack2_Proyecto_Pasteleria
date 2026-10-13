import { useState, type FormEvent } from "react";
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
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    login(email);
    setEmail("");
    setPassword("");
    onCerrar();
  };

  return (
    <Modal abierto={abierto} titulo="Iniciar sesión" onCerrar={onCerrar}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Correo"
          type="email"
          placeholder="Ej: micorreo@ejemplo.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordInput
          label="Contraseña"
          placeholder="Ingresa tu contraseña"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" className="w-full">
          Entrar
        </Button>

        <p className="text-center font-body text-sm text-ink/80">
          ¿No tienes cuenta?{" "}
          <button
            type="button"
            onClick={onCambiarARegistro}
            className="font-semibold text-secondary underline"
          >
            Regístrate
          </button>
        </p>
      </form>
    </Modal>
  );
}
