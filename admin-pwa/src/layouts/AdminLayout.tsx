import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BarChart3,
  ExternalLink,
  Layers,
  Menu,
  Monitor,
  Package,
  Palette,
  ShieldCheck,
  Tag,
  Users,
  Wifi,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard & Reportes", icon: BarChart3, end: true },
  { to: "/productos", label: "Productos & Catálogo", icon: Package },
  { to: "/inventario", label: "Inventario & Stock", icon: Layers },
  { to: "/usuarios", label: "Usuarios & Roles", icon: Users },
  { to: "/promociones", label: "Promociones & Descuentos", icon: Tag },
  { to: "/pos", label: "Punto de Venta POS", icon: Monitor },
  { to: "/componentes", label: "UI Kit & Modales", icon: Palette },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const tituloActual =
    NAV_ITEMS.find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
    )?.label ?? "Panel de Administración";

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
            className="btn btn-sm btn-light d-lg-none"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar navegación"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-grow-1 p-3 overflow-y-auto">
          <div className="d-flex flex-column gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `pwa-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="p-3 border-top bg-light small text-muted">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="fw-bold text-secondary">Terminal PWA</span>
            <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1">
              <span
                className="spinner-grow spinner-grow-sm text-success"
                style={{ width: "6px", height: "6px" }}
              />
              Caja Abierta
            </span>
          </div>
          <div className="text-secondary opacity-75" style={{ fontSize: "0.72rem" }}>
            React + Vite + Bootstrap 5 (Sin Tailwind)
          </div>
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
              <span className="fw-bold text-secondary">Rol: Admin General</span>
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

            <div
              className="d-flex align-items-center justify-content-center rounded-circle bg-secondary text-white fw-bold small shadow-sm"
              style={{ width: "36px", height: "36px" }}
            >
              AG
            </div>
          </div>
        </header>

        <main className="p-3 p-lg-4 flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
