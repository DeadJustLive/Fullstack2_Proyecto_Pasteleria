// @pca:start
// @id(frontend.pages.cliente.login)
// @kind(page)
// @limit(lines: 200)
// @contract(LoginView())
// @relates(frontend.ui.button)
// @relates(frontend.ui.input)
// @relates(frontend.lib.authValidator)
// @relates(docs.reglas_ui)
// @desc(Vista publica de inicio de sesion homologada con tokens del design system)
// @pca:end
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, LogIn, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/auth";
import { validarLoginForm } from "@/lib/validators/auth.validator";

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/perfil";
  const { login, isLoading, error: authError, limpiarError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});

  const handleFillDemo = (mail: string, pass: string) => {
    setEmail(mail);
    setPassword(pass);
    setErrores({});
    limpiarError();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    limpiarError();

    const resultado = validarLoginForm({ email, password });
    setErrores(resultado.errores);
    if (!resultado.valido) return;

    const exito = await login(email.trim(), password);
    if (exito) {
      navigate(redirectPath);
    }
  };

  return (
    <div className="mx-auto max-w-lg py-6 sm:py-10">
      <Card className="overflow-hidden p-0 shadow-md">
        {/* Cabecera con tokens oficiales de marca */}
        <div className="bg-gradient-to-r from-tertiary via-ink to-secondary px-6 py-8 text-center text-neutral sm:px-8">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/25 text-primary">
            <LogIn className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-neutral sm:text-3xl">
            Iniciar Sesión
          </h1>
          <p className="mt-2 font-body text-sm text-neutral/85">
            Accede a tus pedidos guardados, direcciones de entrega y seguimiento en línea
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {/* Botonera de autocompletado de clientes para escenarios de demostración */}
          <div className="mb-6 rounded-2xl border border-dashed border-secondary/30 bg-neutral/60 p-4">
            <div className="mb-2.5 flex items-center gap-1.5 font-body text-xs font-bold uppercase tracking-wider text-secondary">
              <Sparkles className="h-4 w-4 text-secondary" />
              <span>Autocompletar cuentas de cliente:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo("cliente@cremeco.cl", "Pasteleria2026!")}
                className="cursor-pointer rounded-full border border-tertiary/20 bg-white px-3.5 py-1.5 font-body text-xs font-semibold text-tertiary transition-colors hover:border-secondary hover:bg-primary/30"
              >
                ✨ Camila Silva (Cliente Frecuente)
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo("maria.gonzalez@email.com", "Pasteleria2026!")}
                className="cursor-pointer rounded-full border border-tertiary/20 bg-white px-3.5 py-1.5 font-body text-xs font-semibold text-tertiary transition-colors hover:border-secondary hover:bg-primary/30"
              >
                🍰 María González (Cliente)
              </button>
            </div>
          </div>

          {authError && (
            <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 font-body text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-error" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="ejemplo@correo.cl"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errores.email) setErrores((prev) => ({ ...prev, email: "" }));
              }}
              error={errores.email}
              required
              autoComplete="email"
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errores.password) setErrores((prev) => ({ ...prev, password: "" }));
              }}
              error={errores.password}
              required
              autoComplete="current-password"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-body text-xs text-tertiary">
              <label className="flex cursor-pointer select-none items-center gap-2">
                <input type="checkbox" className="rounded text-secondary focus:ring-secondary" defaultChecked />
                Recordarme en este equipo
              </label>
              <Link to="/contacto" className="font-semibold text-secondary hover:underline">
                ¿Necesitas ayuda con tu acceso?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="mt-4 w-full"
              disabled={isLoading}
            >
              {isLoading ? "Validando credenciales..." : "Ingresar a mi Cuenta"}
            </Button>

            <div className="border-t border-tertiary/10 pt-4 text-center font-body text-sm text-tertiary">
              ¿No tienes cuenta todavía?{" "}
              <Link
                to={`/registro${redirectPath !== "/perfil" ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
                className="font-semibold text-secondary hover:underline"
              >
                Regístrate aquí
              </Link>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
