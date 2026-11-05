// @pca:start
// @id(frontend.domain.perfilSidebar)
// @kind(component)
// @limit(lines: 110)
// @contract(props: tabActiva: 'datos' | 'pedidos' | 'seguimiento')
// @relates(docs.reglas_ui)
// @desc(Barra lateral del perfil con usuario autenticado y enlaces de navegacion)
// @pca:end
import { Link, useNavigate } from "react-router-dom";
import { LogOut, MapPin, Package, User } from "lucide-react";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/utils";

export interface PerfilSidebarProps {
  tabActiva: "datos" | "pedidos" | "seguimiento";
  className?: string;
}

const NAV_ITEMS = [
  { id: "datos" as const, label: "Mis Datos", to: "/perfil", icon: User },
  { id: "pedidos" as const, label: "Mis Pedidos", to: "/perfil#pedidos", icon: Package },
  { id: "seguimiento" as const, label: "Seguimiento", to: "/perfil/seguimiento", icon: MapPin },
];

export function PerfilSidebar({ tabActiva, className }: PerfilSidebarProps) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const nombreMostrar = usuario?.nombre || "María González Pérez";
  const emailMostrar = usuario?.email || "maria.gonzalez@email.com";
  const iniciales = nombreMostrar
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside
      className={cn(
        "overflow-hidden rounded-2xl border border-tertiary/10 bg-white shadow-card lg:sticky lg:top-24",
        className
      )}
    >
      {/* Cabecera del usuario (compacta en móvil con botón de salida rápido) */}
      <div className="flex items-center justify-between gap-3 border-b border-tertiary/10 bg-gradient-to-br from-neutral/60 to-white p-3.5 sm:p-5">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary via-primary/80 to-[#ffb6c1] font-display text-base font-bold text-tertiary shadow-sm sm:h-14 sm:w-14 sm:text-xl">
            {iniciales || "MG"}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-body text-sm font-bold text-tertiary sm:text-base">{nombreMostrar}</span>
            <span className="truncate font-body text-xs text-ink/70">{emailMostrar}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Cerrar Sesión"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/70 px-2.5 py-1.5 font-body text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 lg:hidden"
        >
          <LogOut size={15} />
          <span className="hidden xs:inline">Salir</span>
        </button>
      </div>

      {/* Enlaces de navegación: barra horizontal compacta en móvil, lista vertical en desktop */}
      <nav className="flex flex-row gap-1 overflow-x-auto p-2 lg:flex-col [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const activo = tabActiva === item.id;

          return (
            <Link
              key={item.id}
              to={item.to}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 font-body text-xs font-semibold transition-colors sm:text-sm lg:justify-start lg:gap-3 lg:px-4 lg:py-3",
                activo
                  ? "bg-primary/20 font-bold text-secondary shadow-xs border-b-2 lg:border-b-0 lg:border-l-4 border-secondary"
                  : "text-ink/80 hover:bg-neutral hover:text-tertiary"
              )}
            >
              <Icon size={17} className={cn("shrink-0", activo ? "text-secondary" : "text-ink/60")} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 hidden w-full items-center gap-3 rounded-xl border-t border-tertiary/10 px-4 py-3 text-left font-body text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 lg:flex"
        >
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </nav>
    </aside>
  );
}
