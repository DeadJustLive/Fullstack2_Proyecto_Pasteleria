// Input de contrasena con boton para mostrar u ocultar el valor.
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<InputProps, "type">;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [mostrar, setMostrar] = useState(false);

  return (
    <div className="relative">
      <Input
        type={mostrar ? "text" : "password"}
        className={cn("pr-11", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setMostrar((v) => !v)}
        aria-label={mostrar ? "Ocultar contraseña" : "Mostrar contraseña"}
        className="absolute right-3 top-[2.15rem] text-secondary transition-colors hover:text-tertiary"
      >
        {mostrar ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}
