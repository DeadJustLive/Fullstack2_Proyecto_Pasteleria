import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHero } from "@/components/ui/PageHero";
import { FormularioRegistro } from "@/components/domain/auth/FormularioRegistro";
import { useAuth } from "@/context/auth";
import { destinoSeguro } from "@/lib/redireccion";

export function Registro() {
  const { logueado } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const destino = destinoSeguro(searchParams.get("redirect"));

  if (logueado) {
    return <Navigate to={destino} replace />;
  }

  return (
    <>
      <PageHero
        align="center"
        eyebrow="Mi cuenta"
        titulo="Crear cuenta"
        descripcion="Regístrate para guardar tus datos y hacer seguimiento a tus pedidos."
        className="mb-8"
      />

      <div className="mx-auto w-full max-w-lg">
        <Card padding="lg">
          <FormularioRegistro
            onExito={() => navigate(destino, { replace: true })}
            onCambiarALogin={() => navigate("/login")}
          />
        </Card>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center font-body text-xs text-ink/50">
          <ShieldCheck size={14} aria-hidden="true" />
          Esta demo guarda tu nombre y correo en el navegador, nunca tu contraseña.
        </p>
      </div>
    </>
  );
}
