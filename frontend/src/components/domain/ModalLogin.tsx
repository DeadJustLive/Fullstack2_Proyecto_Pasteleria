import { Link } from "react-router-dom";
import { Modal } from "@/components/ui/Modal";
import { FormularioLogin } from "@/components/domain/auth/FormularioLogin";

interface ModalLoginProps {
  abierto: boolean;
  onCerrar: () => void;
  onCambiarARegistro: () => void;
}

export function ModalLogin({
  abierto,
  onCerrar,
  onCambiarARegistro,
}: ModalLoginProps) {
  return (
    <Modal abierto={abierto} titulo="Iniciar sesión" onCerrar={onCerrar}>
      <FormularioLogin onExito={onCerrar} onCambiarARegistro={onCambiarARegistro} />

      <p className="mt-5 border-t border-tertiary/10 pt-4 text-center font-body text-xs text-ink/60">
        <Link
          to="/login"
          onClick={onCerrar}
          className="font-semibold text-secondary underline transition-colors hover:text-tertiary"
        >
          Abrir la página completa de inicio de sesión
        </Link>
      </p>
    </Modal>
  );
}
