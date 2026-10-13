import { Link } from "react-router-dom";
import { useAuth } from "@/context/auth";

const ITEM =
  "block w-full cursor-pointer border-b border-tertiary/5 px-4 py-3 text-left font-body font-semibold text-ink transition-colors last:border-b-0 hover:bg-neutral";

interface MenuPerfilProps {
  onIniciarSesion: () => void;
  onRegistrarse: () => void;
  onCerrar: () => void;
}

export function MenuPerfil({ onIniciarSesion, onRegistrarse, onCerrar }: MenuPerfilProps) {
  const { logueado, usuario, logout } = useAuth();

  if (logueado) {
    return (
      <>
        <p className="border-b border-tertiary/10 bg-neutral px-4 py-3 font-body text-sm text-secondary">
          Hola, {usuario?.nombre}
        </p>
        <Link to="/perfil" className={ITEM} onClick={onCerrar}>
          Mi perfil
        </Link>
        <button
          type="button"
          className={ITEM}
          onClick={() => {
            logout();
            onCerrar();
          }}
        >
          Cerrar sesión
        </button>
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        className={ITEM}
        onClick={() => {
          onIniciarSesion();
          onCerrar();
        }}
      >
        Iniciar sesión
      </button>
      <button
        type="button"
        className={ITEM}
        onClick={() => {
          onRegistrarse();
          onCerrar();
        }}
      >
        Registrarse
      </button>
    </>
  );
}
