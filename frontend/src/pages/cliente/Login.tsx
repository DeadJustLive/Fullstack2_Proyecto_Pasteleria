import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHero } from "@/components/ui/PageHero";
import { FormularioLogin } from "@/components/domain/auth/FormularioLogin";
import { ADMIN_DEMO, useAuth, type Usuario } from "@/context/auth";
import { destinoSeguro } from "@/lib/redireccion";

export function Login() {
  const { logueado, usuario } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");

  const destinoPara = (nuevoUsuario: Usuario | null) => {
    const alternativo = nuevoUsuario?.rol === "admin" ? "/admin" : "/perfil";
    return redirect ? destinoSeguro(redirect, alternativo) : alternativo;
  };

  const destino = destinoPara(usuario);

  if (logueado) {
    return <Navigate to={destino} replace />;
  }

  return (
    <>
      <PageHero
        align="center"
        eyebrow="Mi cuenta"
        titulo="Iniciar sesión"
        descripcion="Accede para revisar tus pedidos, guardar tus datos y continuar comprando."
        className="mb-8"
      />

      <div className="mx-auto w-full max-w-md">
        <Card padding="lg">
          <FormularioLogin
            onExito={(nuevoUsuario) =>
              navigate(destinoPara(nuevoUsuario), { replace: true })
            }
            onCambiarARegistro={() => navigate("/registro")}
          />
        </Card>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center font-body text-xs text-ink/50">
          <ShieldCheck size={14} aria-hidden="true" />
          Tu contraseña no se guarda en este navegador.
        </p>

        <p className="mt-3 rounded bg-neutral p-3 text-center font-body text-xs text-ink/60">
          Acceso demo administrador:{" "}
          <strong className="text-tertiary">{ADMIN_DEMO.email}</strong> /{" "}
          <strong className="text-tertiary">{ADMIN_DEMO.password}</strong>
        </p>
      </div>
    </>
  );
}
