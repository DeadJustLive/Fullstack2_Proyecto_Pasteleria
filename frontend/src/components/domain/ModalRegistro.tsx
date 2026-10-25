import { Link } from "react-router-dom";
import { Modal } from "@/components/ui/Modal";
import { FormularioRegistro } from "@/components/domain/auth/FormularioRegistro";

interface ModalRegistroProps {
  abierto: boolean;
  onCerrar: () => void;
  onCambiarALogin: () => void;
}

export function ModalRegistro({
  abierto,
  onCerrar,
  onCambiarALogin,
}: ModalRegistroProps) {
  return (
    <Modal abierto={abierto} titulo="Crear cuenta" onCerrar={onCerrar}>
      <FormularioRegistro onExito={onCerrar} onCambiarALogin={onCambiarALogin} />

      <p className="mt-5 border-t border-tertiary/10 pt-4 text-center font-body text-xs text-ink/60">
        <Link
          to="/registro"
          onClick={onCerrar}
          className="font-semibold text-secondary underline transition-colors hover:text-tertiary"
        >
          Abrir la página completa de registro
        </Link>
      </p>
    </Modal>
  );
}
