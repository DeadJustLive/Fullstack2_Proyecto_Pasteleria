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

  const handleAutorellenarTest = (tipo: "cliente" | "admin") => {
    if (tipo === "cliente") {
      setEmail("cliente@cremeco.cl");
      setPassword("Pasteleria2026!");
    } else {
      setEmail("admin@cremeco.cl");
      setPassword("Admin2026!");
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    login(email);
    setEmail("");
    setPassword("");
    onCerrar();
  };

  return (
    <Modal abierto={abierto} titulo="Iniciar sesión" onCerrar={onCerrar}>
      <div className="mb-4 flex items-center justify-between rounded-lg border border-primary/50 bg-primary/15 px-3 py-2 text-xs">
        <span className="font-bold text-tertiary">⚡ Relleno Rápido Test:</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleAutorellenarTest("cliente")}
            className="rounded-full bg-secondary px-2.5 py-1 font-bold text-white transition-transform hover:scale-105 active:scale-95"
          >
            Cliente
          </button>
          <button
            type="button"
            onClick={() => handleAutorellenarTest("admin")}
            className="rounded-full bg-tertiary px-2.5 py-1 font-bold text-white transition-transform hover:scale-105 active:scale-95"
          >
            Admin
          </button>
        </div>
      </div>

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
