import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ADMIN_DEMO, useAuth } from "@/context/auth";

function AccesoRestringido() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const cambiarCuenta = () => {
    logout();
    const destino = encodeURIComponent(
      `${location.pathname}${location.search}`
    );
    navigate(`/login?redirect=${destino}`);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral px-4 py-10">
      <Card padding="lg" className="w-full max-w-md text-center">
        <ShieldCheck
          size={48}
          className="mx-auto text-secondary"
          aria-hidden="true"
        />
        <h1 className="mt-4">Acceso restringido</h1>
        <p className="mt-2 font-body text-ink/70">
          La cuenta{" "}
          <strong className="text-tertiary">{usuario?.email}</strong> no tiene
          permisos de administrador.
        </p>

        <p className="mt-4 rounded bg-neutral p-3 font-body text-xs text-ink/60">
          Usa la cuenta demo:{" "}
          <strong className="text-tertiary">{ADMIN_DEMO.email}</strong> /{" "}
          <strong className="text-tertiary">{ADMIN_DEMO.password}</strong>
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={cambiarCuenta}>Cambiar de cuenta</Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            Volver a la tienda
          </Button>
        </div>
      </Card>
    </main>
  );
}

export function RutaAdmin() {
  const { usuario } = useAuth();
  const location = useLocation();

  if (!usuario) {
    const destino = encodeURIComponent(
      `${location.pathname}${location.search}`
    );
    return <Navigate to={`/login?redirect=${destino}`} replace />;
  }

  if (usuario.rol !== "admin") {
    return <AccesoRestringido />;
  }

  return <Outlet />;
}
