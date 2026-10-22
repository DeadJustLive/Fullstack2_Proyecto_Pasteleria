import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, ShoppingCart, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MenuPerfil } from "@/components/layout/MenuPerfil";
import { Modal } from "@/components/ui/Modal";
import { ModalLogin } from "@/components/domain/ModalLogin";
import { ModalRegistro } from "@/components/domain/ModalRegistro";
import { MiniCarrito } from "@/components/domain/MiniCarrito";
import { useCart } from "@/context/cart";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/catalogo", label: "Catálogo", end: false },
  { to: "/envio", label: "Seguimiento de envío", end: false },
];

type AuthModal = "login" | "registro" | null;

export function Navbar() {
  const [abierto, setAbierto] = useState(false);
  const [menuPerfilAbierto, setMenuPerfilAbierto] = useState(false);
  const [miniCarritoAbierto, setMiniCarritoAbierto] = useState(false);
  const [authModal, setAuthModal] = useState<AuthModal>(null);
  const perfilRef = useRef<HTMLLIElement>(null);
  const esEscritorio = useMediaQuery("(min-width: 1024px)");
  const { cantidadTotal } = useCart();
  const { pathname } = useLocation();

  useEffect(() => {
    setAbierto(false);
    setMenuPerfilAbierto(false);
  }, [pathname]);

  useEffect(() => {
    if (!abierto) return;

    const manejarEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };

    document.addEventListener("keydown", manejarEscape);
    return () => document.removeEventListener("keydown", manejarEscape);
  }, [abierto]);

  // Bloquea el scroll del documento mientras el menu movil esta abierto:
  // si no, el fondo sigue desplazandose detras del menu desplegado.
  useEffect(() => {
    if (!abierto) return;

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflowPrevio;
    };
  }, [abierto]);

  useEffect(() => {
    if (!esEscritorio || !menuPerfilAbierto) return;

    const cerrar = () => setMenuPerfilAbierto(false);
    const manejarClick = (e: MouseEvent) => {
      if (perfilRef.current && !perfilRef.current.contains(e.target as Node)) {
        cerrar();
      }
    };
    const manejarEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
    };

    document.addEventListener("click", manejarClick);
    document.addEventListener("keydown", manejarEscape);
    return () => {
      document.removeEventListener("click", manejarClick);
      document.removeEventListener("keydown", manejarEscape);
    };
  }, [esEscritorio, menuPerfilAbierto]);

  const abrirCarrito = () => {
    setAbierto(false);
    setMiniCarritoAbierto(true);
  };

  const abrirLogin = () => {
    setMenuPerfilAbierto(false);
    setAbierto(false);
    setAuthModal("login");
  };

  const abrirRegistro = () => {
    setMenuPerfilAbierto(false);
    setAbierto(false);
    setAuthModal("registro");
  };

  return (
    <header className="select-none">
      <div className="header-inner">
        <Link to="/" className="brand-group">
          <span className="brand-logo" aria-hidden="true">
            C
          </span>
          <span className="brand">Crème &amp; Co</span>
        </Link>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-tertiary/15 bg-white p-2 text-tertiary transition-colors hover:bg-primary lg:hidden"
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={abierto}
          aria-controls="nav-principal"
          onClick={() => setAbierto((v) => !v)}
        >
          {abierto ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav
          id="nav-principal"
          className={cn("w-full lg:block lg:w-auto", abierto ? "block" : "hidden")}
        >
          <ul className="flex flex-col items-stretch gap-1 [&_a]:block [&_a]:text-left lg:flex-row lg:items-center lg:justify-center lg:gap-[0.4rem] lg:[&_a]:inline-block lg:[&_a]:text-center">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end}>
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={abrirCarrito}
                aria-haspopup="dialog"
                aria-label={`Abrir carrito (${cantidadTotal} productos)`}
                className="relative flex w-full cursor-pointer items-center justify-start gap-1.5 rounded-full px-[1.05rem] py-2 font-body text-[0.92rem] font-semibold text-tertiary transition-colors hover:bg-primary/55 lg:inline-flex lg:w-auto lg:justify-center"
              >
                <ShoppingCart size={18} aria-hidden="true" />
                Carrito
                {cantidadTotal > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-xs font-bold text-white">
                    {cantidadTotal}
                  </span>
                )}
              </button>
            </li>
            <li className="relative flex items-center" ref={perfilRef}>
              <button
                type="button"
                className="nav-profile flex cursor-pointer items-center border-0 bg-transparent p-0"
                style={{ marginLeft: "1rem" }}
                aria-haspopup="menu"
                aria-expanded={menuPerfilAbierto}
                aria-label="Abrir menú de cuenta"
                onClick={() => {
                  setAbierto(false);
                  setMenuPerfilAbierto((v) => !v);
                }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="var(--color-tertiary)" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </button>
              {esEscritorio && (
                <div
                  className={cn(
                    "absolute right-0 top-full z-50 mt-2 w-52 flex-col overflow-hidden rounded bg-white shadow-lg",
                    menuPerfilAbierto ? "flex" : "hidden"
                  )}
                  role="menu"
                >
                  <MenuPerfil
                    onIniciarSesion={abrirLogin}
                    onRegistrarse={abrirRegistro}
                    onCerrar={() => setMenuPerfilAbierto(false)}
                  />
                </div>
              )}
            </li>
          </ul>
        </nav>
      </div>

      <Modal
        abierto={menuPerfilAbierto && !esEscritorio}
        titulo="Mi cuenta"
        onCerrar={() => setMenuPerfilAbierto(false)}
      >
        <div className="flex flex-col">
          <MenuPerfil
            onIniciarSesion={abrirLogin}
            onRegistrarse={abrirRegistro}
            onCerrar={() => setMenuPerfilAbierto(false)}
          />
        </div>
      </Modal>

      <MiniCarrito abierto={miniCarritoAbierto} onCerrar={() => setMiniCarritoAbierto(false)} />
      <ModalLogin
        abierto={authModal === "login"}
        onCerrar={() => setAuthModal(null)}
        onCambiarARegistro={() => setAuthModal("registro")}
      />
      <ModalRegistro
        abierto={authModal === "registro"}
        onCerrar={() => setAuthModal(null)}
        onCambiarALogin={() => setAuthModal("login")}
      />
    </header>
  );
}
