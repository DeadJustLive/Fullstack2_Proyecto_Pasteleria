import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useAuth } from "@/context/auth";
import {
  esEmailValido,
  validarNombre,
  validarPasswordSegura,
} from "@/lib/validacion";

interface ErroresRegistro {
  nombre?: string;
  email?: string;
  password?: string;
  confirmar?: string;
  terminos?: string;
}

interface DatosRegistro {
  nombre: string;
  email: string;
  password: string;
  confirmar: string;
  terminos: boolean;
}

function validar(datos: DatosRegistro): ErroresRegistro {
  const errores: ErroresRegistro = {};
  const errorNombre = validarNombre(datos.nombre);
  const errorPassword = validarPasswordSegura(datos.password);

  if (errorNombre) errores.nombre = errorNombre;

  if (!datos.email.trim()) {
    errores.email = "Ingresa tu correo.";
  } else if (!esEmailValido(datos.email)) {
    errores.email = "Ingresa un correo válido.";
  }

  if (errorPassword) errores.password = errorPassword;

  if (!datos.confirmar) {
    errores.confirmar = "Confirma tu contraseña.";
  } else if (datos.confirmar !== datos.password) {
    errores.confirmar = "Las contraseñas no coinciden.";
  }

  if (!datos.terminos) {
    errores.terminos = "Debes aceptar los términos y condiciones.";
  }

  return errores;
}

export interface FormularioRegistroProps {
  onExito: () => void;
  onCambiarALogin: () => void;
}

export function FormularioRegistro({
  onExito,
  onCambiarALogin,
}: FormularioRegistroProps) {
  const { registrar } = useAuth();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [terminos, setTerminos] = useState(false);
  const [errores, setErrores] = useState<ErroresRegistro>({});

  const limpiarError = (campo: keyof ErroresRegistro) => {
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  const cambiarNombre = (e: ChangeEvent<HTMLInputElement>) => {
    setNombre(e.target.value);
    limpiarError("nombre");
  };

  const cambiarEmail = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    limpiarError("email");
  };

  const cambiarPassword = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    limpiarError("password");
    limpiarError("confirmar");
  };

  const cambiarConfirmar = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmar(e.target.value);
    limpiarError("confirmar");
  };

  const cambiarTerminos = (e: ChangeEvent<HTMLInputElement>) => {
    setTerminos(e.target.checked);
    limpiarError("terminos");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const datos: DatosRegistro = {
      nombre,
      email,
      password,
      confirmar,
      terminos,
    };
    const nuevosErrores = validar(datos);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    registrar(nombre.trim(), email.trim());
    setNombre("");
    setEmail("");
    setPassword("");
    setConfirmar("");
    setTerminos(false);
    onExito();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Input
        label="Nombre"
        name="nombre"
        placeholder="Ej: Juan Pérez"
        autoComplete="name"
        required
        value={nombre}
        onChange={cambiarNombre}
        error={errores.nombre}
      />

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
        placeholder="Crea una contraseña segura"
        autoComplete="new-password"
        hint="Mínimo 8 caracteres, con al menos una letra y un número."
        required
        value={password}
        onChange={cambiarPassword}
        error={errores.password}
      />

      <PasswordInput
        label="Confirmar contraseña"
        name="confirmar"
        placeholder="Repite tu contraseña"
        autoComplete="new-password"
        required
        value={confirmar}
        onChange={cambiarConfirmar}
        error={errores.confirmar}
      />

      <div>
        <label className="flex cursor-pointer items-start gap-2 font-body text-sm text-ink/80">
          <input
            type="checkbox"
            name="terminos"
            checked={terminos}
            onChange={cambiarTerminos}
            className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-secondary"
          />
          <span>Acepto los términos y condiciones y la política de privacidad.</span>
        </label>
        {errores.terminos && (
          <p role="alert" className="mt-1 font-body text-xs text-error">
            {errores.terminos}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full">
        Registrarme
      </Button>

      <p className="text-center font-body text-sm text-ink/80">
        ¿Ya tienes cuenta?{" "}
        <button
          type="button"
          onClick={onCambiarALogin}
          className="font-semibold text-secondary underline transition-colors hover:text-tertiary"
        >
          Inicia sesión
        </button>
      </p>
    </form>
  );
}
