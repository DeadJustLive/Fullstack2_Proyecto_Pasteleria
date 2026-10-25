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

  const navItems = [
    {
      id: "datos" as const,
      label: "Mis Datos",
      to: "/perfil",
      icon: User,
    },
    {
      id: "pedidos" as const,
      label: "Mis Pedidos",
      to: "/perfil/seguimiento",
      icon: Package,
    },
    {
      id: "seguimiento" as const,
      label: "Seguimiento de Pedido",
      to: "/perfil/seguimiento",
      icon: MapPin,
    },
  ];

  return (
    <aside
      className={cn(
        "overflow-hidden rounded-2xl border border-tertiary/10 bg-white shadow-card lg:sticky lg:top-24",
        className
      )}
    >
      {/* Cabecera del usuario */}
      <div className="flex items-center gap-4 border-b border-tertiary/10 p-5 bg-gradient-to-br from-neutral/60 to-white">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary via-primary/80 to-[#ffb6c1] font-display text-xl font-bold text-tertiary shadow-sm">
          {iniciales || "MG"}
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-body font-bold text-tertiary">{nombreMostrar}</span>
          <span className="truncate font-body text-xs text-ink/70">{emailMostrar}</span>
        </div>
      </div>

      {/* Enlaces de navegacion */}
      <nav className="flex flex-col p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const activo = tabActiva === item.id;

          return (
            <Link
              key={item.id}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 font-body text-sm font-semibold transition-colors",
                activo
                  ? "bg-primary/20 text-secondary border-l-4 border-secondary font-bold shadow-xs"
                  : "text-ink/80 hover:bg-neutral hover:text-tertiary"
              )}
            >
              <Icon size={18} className={cn(activo ? "text-secondary" : "text-ink/60")} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-3 rounded-xl border-t border-tertiary/10 px-4 py-3 text-left font-body text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
        >
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </nav>
    </aside>
  );
}
