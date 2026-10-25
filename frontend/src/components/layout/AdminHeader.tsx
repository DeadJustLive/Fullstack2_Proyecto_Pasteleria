import { Link, useLocation } from "react-router-dom";
import { Menu, Store } from "lucide-react";
import { useAuth } from "@/context/auth";

const TITULOS: Record<string, string> = {
  "/admin": "Reportes",
  "/admin/pos": "Terminal POS",
  "/admin/inventario": "Inventario",
  "/admin/pedidos": "Pedidos",
  "/admin/usuarios": "Usuarios",
  "/admin/configuracion": "Configuración",
};

interface AdminHeaderProps {
  onAbrirMenu: () => void;
}

export function AdminHeader({ onAbrirMenu }: AdminHeaderProps) {
  const { pathname } = useLocation();
  const { usuario } = useAuth();
  const titulo = TITULOS[pathname] ?? "Administración";
  const inicial = usuario?.nombre.trim().charAt(0).toUpperCase() || "A";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-tertiary/10 bg-white/95 px-4 backdrop-blur lg:px-8">
      <button
        type="button"
        onClick={onAbrirMenu}
        aria-label="Abrir menú"
        className="rounded p-2 text-tertiary transition-colors hover:bg-tertiary/10 lg:hidden"
      >
        <Menu size={22} />
      </button>

      <div className="min-w-0 flex-1">
        <p className="font-body text-[0.7rem] font-bold uppercase tracking-widest text-secondary">
          Panel administrativo
        </p>
        <p className="truncate font-display font-semibold text-tertiary">{titulo}</p>
      </div>

      <Link
        to="/"
        className="hidden items-center gap-2 rounded border border-tertiary/30 px-3 py-2 font-body text-sm font-semibold text-tertiary transition-colors hover:bg-tertiary/10 sm:inline-flex"
      >
        <Store size={16} aria-hidden="true" />
        Ver tienda
      </Link>

      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-tertiary"
        >
          {inicial}
        </span>
        <div className="hidden min-w-0 sm:block">
          <p className="max-w-[12rem] truncate font-body text-sm font-semibold text-tertiary">
            {usuario?.nombre ?? "Administrador"}
          </p>
          <p className="font-body text-xs text-ink/60">Sesión activa</p>
        </div>
      </div>
    </header>
  );
}
