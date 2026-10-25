import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Calculator,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/utils";

interface ItemNav {
  to: string;
  label: string;
  icono: LucideIcon;
  end?: boolean;
}

const NAV_ITEMS: ItemNav[] = [
  { to: "/admin", label: "Reportes", icono: BarChart3, end: true },
  { to: "/admin/pos", label: "Terminal POS", icono: Calculator },
  { to: "/admin/inventario", label: "Inventario", icono: Package },
  { to: "/admin/pedidos", label: "Pedidos", icono: ShoppingBag },
  { to: "/admin/usuarios", label: "Usuarios", icono: Users },
  { to: "/admin/configuracion", label: "Configuración", icono: Settings },
];

interface AdminSidebarProps {
  abierto: boolean;
  onCerrar: () => void;
}

export function AdminSidebar({ abierto, onCerrar }: AdminSidebarProps) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!abierto) return;

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const manejarEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };

    document.addEventListener("keydown", manejarEscape);
    return () => {
      document.body.style.overflow = overflowPrevio;
      document.removeEventListener("keydown", manejarEscape);
    };
  }, [abierto, onCerrar]);

  const cerrarSesion = () => {
    logout();
    onCerrar();
    navigate("/login");
  };

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onCerrar}
        className={cn(
          "fixed inset-0 z-30 bg-inverted/50 transition-opacity lg:hidden",
          abierto ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <aside
        aria-label="Menú de administración"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col overflow-y-auto border-r border-tertiary/10 bg-[#f1e9e0] p-4 transition-transform lg:sticky lg:inset-y-auto lg:top-0 lg:h-screen lg:translate-x-0",
          abierto ? "visible translate-x-0" : "invisible -translate-x-full lg:visible"
        )}
      >
        <div className="mb-6 flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary font-display text-xl font-bold text-tertiary shadow-sm"
          >
            C
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-bold leading-tight text-secondary">
              Crème &amp; Co
            </p>
            <p className="truncate font-body text-xs font-semibold text-ink/60">
              {usuario?.nombre ?? "Manager Administrativo"}
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar menú"
            className="rounded p-1 text-tertiary transition-colors hover:bg-tertiary/10 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1" aria-label="Secciones del admin">
          {NAV_ITEMS.map(({ to, label, icono: Icono, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onCerrar}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 font-body font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  isActive
                    ? "bg-tertiary text-white shadow-sm"
                    : "text-ink hover:bg-tertiary/10"
                )
              }
            >
              <Icono size={20} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 border-t border-tertiary/10 pt-4">
          <button
            type="button"
            onClick={cerrarSesion}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 font-body font-semibold text-error transition-colors hover:bg-error/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2"
          >
            <LogOut size={20} aria-hidden="true" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
