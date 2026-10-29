// @pca:start
// @id(admin.pages.loginAdmin)
// @kind(page)
// @limit(lines: 180)
// @contract(LoginAdminView())
// @relates(admin.services.api)
// @relates(docs.especificacion_pwa_admin)
// @desc(Pantalla de autenticacion administrativa con verificacion de roles RBAC y tokens JWT)
// @pca:end

import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi, setAdminSession } from "../services/api";

export function LoginAdmin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFill = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Por favor completa tu correo y contraseña corporativa.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await adminApi.auth.login({
        email: email.trim(),
        password,
      });

      // Verificación de rol administrativo RBAC
      const rol = (res.usuario.rol || "").toUpperCase();
      const rolesPermitidos = ["ADMIN_GENERAL", "ADMIN", "JEFE_COCINA", "CAJERO_MOSTRADOR", "STAFF", "PASTELERO", "VENDEDOR"];

      if (!rolesPermitidos.includes(rol)) {
        setError(`Acceso Denegado: Tu cuenta tiene rol '${rol}', el cual no posee permisos para ingresar al sistema administrativo.`);
        return;
      }

      setAdminSession(res.token, res.usuario);
      navigate("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al iniciar sesión en el panel";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark py-5 px-3">
      <div className="card shadow-lg border-0 rounded-4" style={{ maxWidth: "460px", width: "100%" }}>
        <div className="card-body p-4 p-sm-5">
          <div className="text-center mb-4">
            <div
              className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{
                width: "56px",
                height: "56px",
                backgroundColor: "#FFC0CB",
                color: "#5D4037",
                fontSize: "1.75rem",
                fontWeight: "bold",
              }}
            >
              C
            </div>
            <h2 className="h4 fw-bold mb-1" style={{ color: "#3A2A21" }}>
              Panel Administrativo
            </h2>
            <p className="text-muted small">
              Crème & Co • Sistema de Gestión de Pedidos y POS
            </p>
          </div>

          {/* Botonera de escenarios de prueba rápida */}
          <div className="p-3 mb-4 rounded-3 border border-dashed bg-light">
            <div className="d-flex align-items-center gap-1 text-uppercase text-secondary fw-bold small mb-2" style={{ fontSize: "0.75rem" }}>
              <i className="bi bi-shield-lock"></i>
              <span>Credenciales Demo (Roles RBAC):</span>
            </div>
            <div className="d-flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => handleFill("admin@cremeco.cl", "Admin2026!")}
                className="btn btn-sm btn-outline-secondary rounded-pill"
                style={{ fontSize: "0.75rem" }}
              >
                🧑‍💼 Admin General
              </button>
              <button
                type="button"
                onClick={() => handleFill("pastelero@cremeco.cl", "Pasteleria2026!")}
                className="btn btn-sm btn-outline-secondary rounded-pill"
                style={{ fontSize: "0.75rem" }}
              >
                🎂 Jefe Cocina
              </button>
              <button
                type="button"
                onClick={() => handleFill("ventas@cremeco.cl", "Pasteleria2026!")}
                className="btn btn-sm btn-outline-secondary rounded-pill"
                style={{ fontSize: "0.75rem" }}
              >
                💰 Cajero POS
              </button>
              <button
                type="button"
                onClick={() => handleFill("cliente@cremeco.cl", "Pasteleria2026!")}
                className="btn btn-sm btn-outline-danger rounded-pill"
                style={{ fontSize: "0.75rem" }}
                title="Probar rechazo de acceso sin rol administrativo"
              >
                🚫 Cliente (Sin Rol Admin)
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-start gap-2 py-2 px-3 small rounded-3 mb-3">
              <i className="bi bi-exclamation-octagon-fill text-danger flex-shrink-0 mt-1"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Correo Electrónico Corporativo</label>
              <input
                type="email"
                className="form-control"
                placeholder="ejemplo@cremeco.cl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">Contraseña</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn w-100 fw-bold py-2 mt-2 rounded-3 text-white"
              style={{ backgroundColor: "#8B4513" }}
              disabled={isLoading}
            >
              {isLoading ? "Validando permisos..." : "Ingresar al Panel"}
            </button>
          </form>

          <div className="text-center mt-4 pt-3 border-top text-muted small">
            <a href={import.meta.env.VITE_STORE_URL || "http://localhost:5173"} className="text-decoration-none text-muted">
              ← Volver a la Tienda Pública
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
