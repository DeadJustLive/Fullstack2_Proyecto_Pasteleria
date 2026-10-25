import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useAuth, type Usuario } from "@/context/auth";
import { esEmailValido } from "@/lib/validacion";

interface ErroresLogin {
  email?: string;
  password?: string;
}

function validar(email: string, password: string): ErroresLogin {
  const errores: ErroresLogin = {};

  if (!email.trim()) {
    errores.email = "Ingresa tu correo.";
  } else if (!esEmailValido(email)) {
    errores.email = "Ingresa un correo válido.";
  }

  if (!password) {
    errores.password = "Ingresa tu contraseña.";
  } else if (password.length < 6) {
    errores.password = "La contraseña debe tener al menos 6 caracteres.";
  }

  return errores;
}

export interface FormularioLoginProps {
  onExito: (usuario: Usuario) => void;
  onCambiarARegistro: () => void;
}

export function FormularioLogin({
  onExito,
  onCambiarARegistro,
}: FormularioLoginProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errores, setErrores] = useState<ErroresLogin>({});

  const cambiarEmail = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errores.email) setErrores((prev) => ({ ...prev, email: undefined }));
  };

  const cambiarPassword = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errores.password) {
      setErrores((prev) => ({ ...prev, password: undefined }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const nuevosErrores = validar(email, password);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const usuario = login(email.trim(), password);
    setEmail("");
    setPassword("");
    onExito(usuario);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Input
        label="Correo"
        name="email"
        type="email"
        placeholder="Ej: micorreo@ejemplo.com"
        autoComplete="email"
        required
        value={email}
        onChange={cambiarEmail}
        error={errores.email}
      />

      <PasswordInput
        label="Contraseña"
        name="password"
        placeholder="Ingresa tu contraseña"
        autoComplete="current-password"
        required
        value={password}
        onChange={cambiarPassword}
        error={errores.password}
      />

      <Button type="submit" className="w-full">
        Entrar
      </Button>

      <p className="text-center font-body text-sm text-ink/80">
        ¿No tienes cuenta?{" "}
        <button
          type="button"
          onClick={onCambiarARegistro}
          className="font-semibold text-secondary underline transition-colors hover:text-tertiary"
        >
          Regístrate
        </button>
      </p>
    </form>
  );
}
