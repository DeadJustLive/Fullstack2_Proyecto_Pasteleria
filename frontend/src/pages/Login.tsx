// @pca:start
// @id(frontend.pages.cliente.login)
// @kind(page)
// @limit(lines: 200)
// @contract(LoginView())
// @relates(frontend.ui.button)
// @relates(frontend.ui.input)
// @relates(frontend.lib.authValidator)
// @relates(docs.reglas_ui)
// @desc(Vista publica de inicio de sesion con validaciones y credenciales de prueba)
// @pca:end

import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/auth";
import { validarLoginForm } from "@/lib/validators/auth.validator";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LogIn, Sparkles, AlertCircle } from "lucide-react";

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

    if (!resultado.valido) {
      return;
    }

    const exito = await login(email.trim(), password);
    if (exito) {
      navigate(redirectPath);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-lg mx-auto">
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-[#E8D8CE]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/30 text-secondary mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-ink">
            Iniciar Sesión
          </h1>
          <p className="text-sm text-tertiary mt-2">
            Accede a tus pedidos guardados, cupones y seguimiento
          </p>
        </div>

        {/* Botonera de autocompletado para escenarios de prueba */}
        <div className="mb-6 p-4 rounded-2xl bg-[#FFF9F3] border border-dashed border-[#E2BBA2]">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary mb-2.5">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span>Autocompletar cuentas de prueba:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo("cliente@cremeco.cl", "Pasteleria2026!")}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-[#D7B9A5] text-ink hover:bg-primary/40 hover:border-secondary transition-colors"
            >
              🛍️ María González (Cliente)
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo("admin@cremeco.cl", "Admin2026!")}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-[#D7B9A5] text-ink hover:bg-primary/40 hover:border-secondary transition-colors"
            >
              🧑‍💼 Administrador
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo("pastelero@cremeco.cl", "Pasteleria2026!")}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-[#D7B9A5] text-ink hover:bg-primary/40 hover:border-secondary transition-colors"
            >
              🎂 Jefe de Cocina
            </button>
          </div>
        </div>

        {authError && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
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

          <div className="flex items-center justify-between text-xs text-tertiary pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" className="rounded text-secondary focus:ring-secondary" defaultChecked />
              Recordarme en este equipo
            </label>
            <a href="#" className="hover:underline text-secondary font-medium">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-4"
            disabled={isLoading}
          >
            {isLoading ? "Validando credenciales..." : "Ingresar a mi Cuenta"}
          </Button>

          <div className="text-center text-sm text-tertiary pt-4 border-t border-[#F0E6DF]">
            ¿No tienes cuenta todavía?{" "}
            <Link
              to={`/registro${redirectPath !== "/perfil" ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
              className="text-secondary font-semibold hover:underline"
            >
              Regístrate aquí
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
