// @pca:start
// @id(frontend.pages.cliente.registro)
// @kind(page)
// @limit(lines: 380)
// @contract(RegistroView())
// @relates(frontend.ui.button)
// @relates(frontend.ui.input)
// @relates(frontend.lib.rutValidator)
// @relates(frontend.lib.authValidator)
// @relates(frontend.lib.regionesChile)
// @relates(docs.reglas_ui)
// @desc(Vista publica de registro de nuevos clientes con selector regional, validacion de RUT y tokens del design system)
// @pca:end
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Sparkles, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/auth";
import { REGIONES_CHILE, obtenerComunasPorRegion } from "@/lib/data/regiones-chile";
import { validarRegistroForm } from "@/lib/validators/auth.validator";
import { formatearRut, validarRut } from "@/lib/validators/rut.validator";
import { api } from "@/services/api";

export function Registro() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/perfil";
  const { login } = useAuth();

  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [rut, setRut] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [region, setRegion] = useState("");
  const [comuna, setComuna] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);

  const comunasDisponibles = region ? obtenerComunasPorRegion(region) : [];

  const handleRutBlur = () => {
    if (!rut.trim()) return;
    const formateado = formatearRut(rut);
    setRut(formateado);
    if (!validarRut(formateado)) {
      setErrores((prev) => ({ ...prev, rut: "RUT inválido (dígito verificador Módulo 11 no coincide)" }));
    } else {
      setErrores((prev) => {
        const copy = { ...prev };
        delete copy.rut;
        return copy;
      });
    }
  };

  const handleFillDemo = (nom: string, ape: string, r: string, mail: string, tel: string, reg: string, com: string) => {
    setNombre(nom);
    setApellidos(ape);
    setRut(r);
    setEmail(mail);
    setTelefono(tel);
    setRegion(reg);
    setComuna(com);
    setPassword("Pasteleria2026!");
    setConfirmPassword("Pasteleria2026!");
    setAceptaTerminos(true);
    setErrores({});
    setErrorServidor(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorServidor(null);

    const resultado = validarRegistroForm({
      nombre,
      apellidos,
      email,
      rut,
      telefono,
      password,
      confirmPassword,
    });

    const nuevosErrores: Record<string, string> = { ...resultado.errores };
    if (!region) nuevosErrores.region = "Selecciona una región";
    if (!comuna) nuevosErrores.comuna = "Selecciona una comuna";
    if (!aceptaTerminos) nuevosErrores.terminos = "Debes aceptar los términos y condiciones";

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    setIsSubmitting(true);
    try {
      await api.auth.register({
        nombre: `${nombre.trim()} ${apellidos.trim()}`.trim(),
        email: email.trim(),
        password,
        telefono: telefono.trim(),
      });

      setRegistroExitoso(true);
      const loginOk = await login(email.trim(), password);
      if (loginOk) {
        setTimeout(() => {
          navigate(redirectPath);
        }, 1200);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al procesar el registro";
      setErrorServidor(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectClass =
    "w-full rounded-lg border border-tertiary/25 bg-white px-3.5 py-2.5 font-body text-sm text-ink outline-none transition-colors focus:border-secondary focus:ring-2 focus:ring-primary/60 disabled:opacity-50";

  return (
    <div className="mx-auto max-w-2xl py-6 sm:py-10">
      <Card className="overflow-hidden p-0 shadow-md">
        <div className="bg-gradient-to-r from-tertiary via-ink to-secondary px-6 py-8 text-center text-neutral sm:px-8">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/25 text-primary">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-neutral sm:text-3xl">
            Crear Cuenta de Cliente
          </h1>
          <p className="mt-2 font-body text-sm text-neutral/85">
            Regístrate para guardar tus direcciones, acceder a promociones y ver tu historial de compras
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-6 rounded-2xl border border-dashed border-secondary/30 bg-neutral/60 p-4">
            <div className="mb-2.5 flex items-center gap-1.5 font-body text-xs font-bold uppercase tracking-wider text-secondary">
              <Sparkles className="h-4 w-4 text-secondary" />
              <span>Autocompletar datos de prueba válidos:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  handleFillDemo(
                    "Camila",
                    "Silva Tapia",
                    "18.432.198-7",
                    "camila.nueva@cremeco.cl",
                    "+56 9 8765 4321",
                    "Metropolitana de Santiago",
                    "Providencia"
                  )
                }
                className="cursor-pointer rounded-full border border-tertiary/20 bg-white px-3.5 py-1.5 font-body text-xs font-semibold text-tertiary transition-colors hover:border-secondary hover:bg-primary/30"
              >
                ✨ Camila Silva (Providencia)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleFillDemo(
                    "Diego",
                    "Araneda Castro",
                    "17.890.123-4",
                    "diego.araneda@cremeco.cl",
                    "+56 9 9876 5432",
                    "Valparaíso",
                    "Viña del Mar"
                  )
                }
                className="cursor-pointer rounded-full border border-tertiary/20 bg-white px-3.5 py-1.5 font-body text-xs font-semibold text-tertiary transition-colors hover:border-secondary hover:bg-primary/30"
              >
                🌊 Diego Araneda (Viña del Mar)
              </button>
            </div>
          </div>

          {errorServidor && (
            <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 font-body text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-error" />
              <span>{errorServidor}</span>
            </div>
          )}

          {registroExitoso && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 font-body text-sm text-green-900">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
              <span>¡Cuenta creada con éxito! Iniciando sesión y redirigiendo...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Nombre(s) *"
                type="text"
                placeholder="Ej. Camila Andrea"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                error={errores.nombre}
                required
              />
              <Input
                label="Apellidos *"
                type="text"
                placeholder="Ej. Silva Tapia"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                error={errores.apellidos}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="RUT Chileno *"
                type="text"
                placeholder="18.432.198-7"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                onBlur={handleRutBlur}
                error={errores.rut}
                required
              />
              <Input
                label="Teléfono Móvil *"
                type="tel"
                placeholder="+56 9 8765 4321"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                error={errores.telefono}
                required
              />
            </div>

            <Input
              label="Correo Electrónico *"
              type="email"
              placeholder="ejemplo@correo.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errores.email}
              required
              autoComplete="email"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block font-body text-sm font-semibold text-tertiary">
                  Región *
                </label>
                <select
                  value={region}
                  onChange={(e) => {
                    setRegion(e.target.value);
                    setComuna("");
                  }}
                  className={selectClass}
                  required
                >
                  <option value="">Selecciona tu región...</option>
                  {REGIONES_CHILE.map((r) => (
                    <option key={r.nombre} value={r.nombre}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
                {errores.region && <p className="mt-1 font-body text-xs text-error">{errores.region}</p>}
              </div>

              <div>
                <label className="mb-1.5 block font-body text-sm font-semibold text-tertiary">
                  Comuna *
                </label>
                <select
                  value={comuna}
                  onChange={(e) => setComuna(e.target.value)}
                  disabled={!region}
                  className={selectClass}
                  required
                >
                  <option value="">
                    {region ? "Selecciona tu comuna..." : "Primero elige región"}
                  </option>
                  {comunasDisponibles.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errores.comuna && <p className="mt-1 font-body text-xs text-error">{errores.comuna}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Contraseña (mínimo 6 caracteres) *"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errores.password}
                required
                autoComplete="new-password"
              />
              <Input
                label="Confirmar Contraseña *"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errores.confirmPassword}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="pt-2">
              <label className="flex cursor-pointer select-none items-start gap-2.5 font-body text-xs text-tertiary">
                <input
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  className="mt-0.5 rounded text-secondary focus:ring-secondary"
                  required
                />
                <span>
                  Acepto los términos y condiciones de servicio y consiento el tratamiento de mis datos de contacto para la gestión de pedidos de Crème & Co Pastelería.
                </span>
              </label>
              {errores.terminos && <p className="mt-1 font-body text-xs text-error">{errores.terminos}</p>}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="mt-4 w-full"
              disabled={isSubmitting || registroExitoso}
            >
              {isSubmitting ? "Registrando usuario en BD..." : "Crear mi Cuenta de Cliente"}
            </Button>

            <div className="border-t border-tertiary/10 pt-4 text-center font-body text-sm text-tertiary">
              ¿Ya tienes una cuenta registrada?{" "}
              <Link
                to={`/login${redirectPath !== "/perfil" ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
                className="font-semibold text-secondary hover:underline"
              >
                Inicia sesión aquí
              </Link>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
