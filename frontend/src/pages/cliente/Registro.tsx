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
// @desc(Vista publica de registro de nuevos clientes con selector regional y validacion de RUT)
// @pca:end

import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/auth";
import { api } from "@/services/api";
import { formatearRut, validarRut } from "@/lib/validators/rut.validator";
import { validarRegistroForm } from "@/lib/validators/auth.validator";
import { REGIONES_CHILE, obtenerComunasPorRegion } from "@/lib/data/regiones-chile";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UserPlus, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

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

    if (!aceptaTerminos) {
      nuevosErrores.terminos = "Debes aceptar los términos y condiciones";
    }

    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await api.auth.register({
        nombre: `${nombre.trim()} ${apellidos.trim()}`.trim(),
        email: email.trim(),
        password,
        telefono: telefono.trim(),
      });

      setRegistroExitoso(true);
      // Iniciar sesión automáticamente
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

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-[#E8D8CE]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/30 text-secondary mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-ink">
            Crear Cuenta de Cliente
          </h1>
          <p className="text-sm text-tertiary mt-2">
            Regístrate para guardar tus direcciones, acceder a promociones y ver tu historial de compras
          </p>
        </div>

        {/* Botonera de autocompletado demo */}
        <div className="mb-6 p-4 rounded-2xl bg-[#FFF9F3] border border-dashed border-[#E2BBA2]">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary mb-2.5">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span>Autocompletar datos de prueba válidos:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo("Camila", "Silva Tapia", "18.432.198-7", "camila.nueva@cremeco.cl", "+56 9 8765 4321", "Metropolitana de Santiago", "Providencia")}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-[#D7B9A5] text-ink hover:bg-primary/40 hover:border-secondary transition-colors"
            >
              ✨ Camila Silva (Providencia)
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo("Diego", "Araneda Castro", "17.890.123-4", "diego.araneda@cremeco.cl", "+56 9 9876 5432", "Valparaíso", "Viña del Mar")}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-[#D7B9A5] text-ink hover:bg-primary/40 hover:border-secondary transition-colors"
            >
              🌊 Diego Araneda (Viña del Mar)
            </button>
          </div>
        </div>

        {errorServidor && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
            <span>{errorServidor}</span>
          </div>
        )}

        {registroExitoso && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-900 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span>¡Cuenta creada con éxito! Iniciando sesión y redirigiendo...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1">
                Región *
              </label>
              <select
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  setComuna("");
                }}
                className="w-full px-4 py-2.5 bg-white border border-[#E8D8CE] rounded-xl text-ink focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-sm"
                required
              >
                <option value="">Selecciona tu región...</option>
                {REGIONES_CHILE.map((r) => (
                  <option key={r.nombre} value={r.nombre}>
                    {r.nombre}
                  </option>
                ))}
              </select>
              {errores.region && (
                <p className="text-xs text-red-600 mt-1">{errores.region}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-1">
                Comuna *
              </label>
              <select
                value={comuna}
                onChange={(e) => setComuna(e.target.value)}
                disabled={!region}
                className="w-full px-4 py-2.5 bg-white border border-[#E8D8CE] rounded-xl text-ink focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-sm disabled:opacity-50"
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
              {errores.comuna && (
                <p className="text-xs text-red-600 mt-1">{errores.comuna}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-tertiary select-none">
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
            {errores.terminos && (
              <p className="text-xs text-red-600 mt-1">{errores.terminos}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-4"
            disabled={isSubmitting || registroExitoso}
          >
            {isSubmitting ? "Registrando usuario en BD..." : "Crear mi Cuenta de Cliente"}
          </Button>

          <div className="text-center text-sm text-tertiary pt-4 border-t border-[#F0E6DF]">
            ¿Ya tienes una cuenta registrada?{" "}
            <Link
              to={`/login${redirectPath !== "/perfil" ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
              className="text-secondary font-semibold hover:underline"
            >
              Inicia sesión aquí
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
