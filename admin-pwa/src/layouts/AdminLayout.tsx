import { useState } from "react";
import { NavLink, Outlet, useLocation, Navigate, useNavigate } from "react-router-dom";
import {
  BarChart3,
  ClipboardList,
  ExternalLink,
  Layers,
  Menu,
  Monitor,
  Package,
  Palette,
  ShieldCheck,
  Tag,
  FolderTree,
  Users,
  Wifi,
  X,
  LogOut,
} from "lucide-react";
import { getAdminToken, getAdminUser, clearAdminSession } from "../services/api";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard & Reportes", icon: BarChart3, end: true },
  { to: "/productos", label: "Productos & Catálogo", icon: Package },
  { to: "/categorias", label: "Categorías & Estructura", icon: FolderTree },
  { to: "/inventario", label: "Inventario & Stock", icon: Layers },
  { to: "/ordenes", label: "Órdenes & Boletas", icon: ClipboardList },
  { to: "/usuarios", label: "Usuarios & Roles", icon: Users },
  { to: "/promociones", label: "Promociones & Descuentos", icon: Tag },
  { to: "/pos", label: "Punto de Venta POS", icon: Monitor },
  { to: "/componentes", label: "UI Kit & Modales", icon: Palette },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const token = getAdminToken();
  const user = getAdminUser();

  // Guardián de rutas RBAC: si no hay token o sesión, redirigir a /login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    clearAdminSession();
    navigate("/login");
  };

  const tituloActual =
    NAV_ITEMS.find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
    )?.label ?? "Panel de Administración";

  const iniciales = user.nombre
    ? user.nombre
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AD";

  return (
    <div className="d-flex min-vh-100 bg-body-tertiary">
      {/* Backdrop móvil */}
      {sidebarOpen && (
        <div
          className="pwa-sidebar-backdrop show d-lg-none"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Desktop y Drawer Móvil */}
      <aside
        className={`pwa-sidebar d-flex flex-column ${
          sidebarOpen ? "show" : ""
        } d-lg-flex position-lg-static`}
      >
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center justify-content-center rounded-3 bg-primary text-white fw-bold shadow-sm"
              style={{ width: "40px", height: "40px", fontSize: "1.25rem" }}
            >
              C
            </div>
            <div>
              <span className="d-block brand-font fs-5 lh-1 text-secondary">
                Crème &amp; Co
              </span>
              <span className="badge bg-light text-secondary border mt-1">
                Admin PWA (React)
              </span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-lg-none p-1"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navegación Principal */}
        <nav className="p-2 flex-grow-1">
          <ul className="nav nav-pills flex-column gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <li className="nav-item" key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `nav-link d-flex align-items-center gap-2.5 px-3 py-2 rounded-3 text-secondary ${
                        isActive ? "active bg-primary text-white fw-semibold shadow-sm" : ""
                      }`
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Sidebar con Datos de Usuario */}
        <div className="p-3 border-top mt-auto bg-light">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="d-flex align-items-center gap-2 overflow-hidden">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle bg-secondary text-white fw-bold small flex-shrink-0"
                style={{ width: "32px", height: "32px", fontSize: "0.8rem" }}
              >
                {iniciales}
              </div>
              <div className="overflow-hidden">
                <span className="d-block text-truncate small fw-bold text-secondary">
                  {user.nombre}
                </span>
                <span className="d-block text-truncate text-muted" style={{ fontSize: "0.75rem" }}>
                  {user.email}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-sm btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-1.5 py-1"
            style={{ fontSize: "0.8rem" }}
          >
            <LogOut size={14} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="d-flex flex-column flex-grow-1 min-vw-0">
        <header className="pwa-header navbar navbar-expand px-3 px-lg-4 py-2">
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary d-lg-none p-1.5"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir navegación"
            >
              <Menu size={20} />
            </button>
            <h1 className="brand-font fs-4 mb-0 text-secondary">{tituloActual}</h1>
          </div>

          <div className="d-flex align-items-center gap-2 ms-auto">
            <span className="badge bg-success-subtle text-success border border-success-subtle d-none d-sm-inline-flex align-items-center gap-1 py-1.5 px-2.5">
              <Wifi size={13} />
              <span>Online PWA</span>
            </span>

            <div className="d-none d-md-flex align-items-center gap-2 bg-light border rounded-pill px-3 py-1 small">
              <ShieldCheck size={16} className="text-secondary" />
              <span className="fw-bold text-secondary">Rol: {user.rol || "ADMIN"}</span>
            </div>

            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm btn-outline-secondary rounded-pill d-inline-flex align-items-center gap-1"
            >
              <span>Tienda Web</span>
              <ExternalLink size={13} />
            </a>

            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center p-0 flex-shrink-0"
              style={{ width: "36px", height: "36px" }}
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <main className="p-3 p-lg-4 flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
