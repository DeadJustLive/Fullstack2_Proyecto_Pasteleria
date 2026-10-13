import { useState, type FormEvent } from "react";
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
  const { registrar } = useAuth();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    registrar(nombre, email);
    setNombre("");
    setEmail("");
    setPassword("");
    onCerrar();
  };

  return (
    <Modal abierto={abierto} titulo="Crear cuenta" onCerrar={onCerrar}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nombre"
          placeholder="Ej: Juan Pérez"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
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
          placeholder="Crea una contraseña segura"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" className="w-full">
          Registrarme
        </Button>

        <p className="text-center font-body text-sm text-ink/80">
          ¿Ya tienes cuenta?{" "}
          <button
            type="button"
            onClick={onCambiarALogin}
            className="font-semibold text-secondary underline"
          >
            Inicia sesión
          </button>
        </p>
      </form>
    </Modal>
  );
}
