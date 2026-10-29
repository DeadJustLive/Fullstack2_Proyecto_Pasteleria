// @pca:start
// @id(frontend.pages.cliente.contacto)
// @kind(page)
// @limit(lines: 450)
// @contract(ContactoView())
// @relates(frontend.ui.button)
// @relates(frontend.lib.authValidator)
// @relates(docs.reglas_ui)
// @desc(Formulario de contacto con validacion de telefono y persistencia en service-notification)
// @pca:end

import { useState, type FormEvent, type ChangeEvent } from "react";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { validarEmail } from "@/lib/validators/auth.validator";

interface ContactoFormData {
  nombre: string;
  email: string;
  telefono: string;
  motivo: string;
  mensaje: string;
}

const MOTIVOS_CONSULTA = [
  { value: "cotizacion", label: "Cotización personalizada de torta" },
  { value: "eventos", label: "Eventos corporativos o celebraciones" },
  { value: "alergenos", label: "Consultas de ingredientes y alérgenos" },
  { value: "pedido", label: "Estado o retiro de un pedido existente" },
  { value: "otro", label: "Otras consultas y sugerencias" },
];

export function validarTelefonoChileno(telefono: string): boolean {
  if (!telefono || typeof telefono !== "string") return false;
  const telLimpio = telefono.replace(/[\s\-()]/g, "");
  // Acepta formato chileno movil o fijo: +56 9 xxxxxxxx, 569xxxxxxxx, 9xxxxxxxx, o 9 digitos
  return /^(\+?56)?9\d{8}$/.test(telLimpio) || /^[2-9]\d{8}$/.test(telLimpio);
}

export function Contacto() {
  const [formData, setFormData] = useState<ContactoFormData>({
    nombre: "",
    email: "",
    telefono: "",
    motivo: "",
    mensaje: "",
  });

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    tipo: "exito" | "error";
    mensaje: string;
  } | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpiar error del campo al escribir
    if (errores[name]) {
      setErrores((prev) => {
        const nuevo = { ...prev };
        delete nuevo[name];
        return nuevo;
      });
    }
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!formData.nombre.trim() || formData.nombre.trim().length < 2) {
      nuevosErrores.nombre = "Ingresa tu nombre completo (al menos 2 caracteres).";
    }

    if (!formData.email.trim()) {
      nuevosErrores.email = "El correo electrónico es requerido.";
    } else if (!validarEmail(formData.email)) {
      nuevosErrores.email = "Ingresa un correo electrónico válido (ej: nombre@dominio.cl).";
    }

    if (!formData.telefono.trim()) {
      nuevosErrores.telefono = "El teléfono de contacto es requerido.";
    } else if (!validarTelefonoChileno(formData.telefono)) {
      nuevosErrores.telefono =
        "Ingresa un teléfono chileno válido (ej: +56 9 1234 5678 o 9 1234 5678).";
    }

    if (!formData.motivo) {
      nuevosErrores.motivo = "Selecciona el motivo de tu consulta.";
    }

    if (!formData.mensaje.trim() || formData.mensaje.trim().length < 10) {
      nuevosErrores.mensaje = "Tu mensaje debe tener al menos 10 caracteres.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!validarFormulario()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = "/api/notifications/contact";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFeedback({
          tipo: "exito",
          mensaje:
            "¡Mensaje enviado con éxito! Nuestro equipo pastelero se comunicará contigo dentro de las próximas 24 horas hábiles.",
        });
        setFormData({
          nombre: "",
          email: "",
          telefono: "",
          motivo: "",
          mensaje: "",
        });
        setErrores({});
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMsg =
          errorData?.message ||
          `Error ${response.status}: no se pudo procesar tu solicitud de contacto.`;
        setFeedback({
          tipo: "error",
          mensaje: errorMsg,
        });
      }
    } catch {
      // Fallback amigable si el microservicio de notificaciones no está levantado
      setFeedback({
        tipo: "error",
        mensaje:
          "No fue posible conectar con el servidor de notificaciones. Por favor intenta más tarde o comunícate vía WhatsApp al +56 9 8765 4321.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10">
      {/* Hero Contacto */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-tertiary via-tertiary/95 to-secondary px-6 py-12 text-center text-neutral shadow-md sm:px-12 sm:py-16">
        <div className="relative z-10 mx-auto max-w-2xl">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/20 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-primary backdrop-blur-xs">
            <MessageSquare size={14} /> Contáctanos
          </span>
          <h1 className="text-balance text-neutral">
            Estamos Aquí para Escucharte
          </h1>
          <p className="mx-auto mt-3 max-w-xl font-body text-base text-neutral/90 sm:text-lg">
            ¿Tienes dudas sobre pedidos especiales, eventos o alérgenos?
            Escríbenos o visítanos en nuestro obrador de Providencia.
          </p>
        </div>
      </section>

      {/* Main Grid: Formulario + Info Local */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Formulario Reactivo */}
        <div className="rounded-2xl border border-tertiary/10 bg-white p-6 shadow-xs sm:p-8 lg:col-span-7">
          <h2 className="text-left text-tertiary">Envíanos un Mensaje</h2>
          <p className="mt-1 font-body text-sm text-ink/70">
            Completa los datos a continuación y nos pondremos en contacto contigo.
          </p>

          {feedback && (
            <div
              className={`mt-6 flex items-start gap-3 rounded-xl p-4 text-sm font-body ${
                feedback.tipo === "exito"
                  ? "border border-green-200 bg-green-50 text-green-900"
                  : "border border-red-200 bg-red-50 text-red-900"
              }`}
              role="alert"
            >
              {feedback.tipo === "exito" ? (
                <CheckCircle2 size={20} className="shrink-0 text-green-600" />
              ) : (
                <AlertCircle size={20} className="shrink-0 text-red-600" />
              )}
              <div className="flex-1">{feedback.mensaje}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
            <Input
              id="contacto-nombre"
              name="nombre"
              label="Nombre Completo *"
              placeholder="Ej: Marcela Morales"
              value={formData.nombre}
              onChange={handleChange}
              error={errores.nombre}
              disabled={isSubmitting}
            />

            <Input
              id="contacto-email"
              name="email"
              type="email"
              label="Correo Electrónico *"
              placeholder="nombre@ejemplo.cl"
              value={formData.email}
              onChange={handleChange}
              error={errores.email}
              hint="Te responderemos a esta dirección."
              disabled={isSubmitting}
            />

            <Input
              id="contacto-telefono"
              name="telefono"
              type="tel"
              label="Teléfono Móvil (Chile) *"
              placeholder="+56 9 1234 5678"
              value={formData.telefono}
              onChange={handleChange}
              error={errores.telefono}
              hint="Formato chileno: +56 9 XXXX XXXX o 9 dígitos."
              disabled={isSubmitting}
            />

            <div className="flex flex-col gap-1">
              <label
                htmlFor="contacto-motivo"
                className="font-body text-sm font-semibold text-tertiary"
              >
                Motivo de Consulta *
              </label>
              <select
                id="contacto-motivo"
                name="motivo"
                value={formData.motivo}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-tertiary/30 bg-white px-4 py-2 font-body text-base text-ink outline-none transition-colors focus:border-secondary focus:ring-2 focus:ring-secondary/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Selecciona un motivo...</option>
                {MOTIVOS_CONSULTA.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              {errores.motivo && (
                <span className="font-body text-xs text-error">
                  {errores.motivo}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="contacto-mensaje"
                className="font-body text-sm font-semibold text-tertiary"
              >
                Tu Mensaje *
              </label>
              <textarea
                id="contacto-mensaje"
                name="mensaje"
                rows={4}
                placeholder="Cuéntanos detalles de tu evento, fecha estimada, número de porciones o cualquier duda..."
                value={formData.mensaje}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-tertiary/30 bg-white px-4 py-2 font-body text-base text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-secondary focus:ring-2 focus:ring-secondary/20 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errores.mensaje && (
                <span className="font-body text-xs text-error">
                  {errores.mensaje}
                </span>
              )}
            </div>

            <Button
              type="submit"
              variant="secondary"
              size="lg"
              disabled={isSubmitting}
              className="mt-2 w-full justify-center gap-2"
            >
              {isSubmitting ? (
                <>Enviando mensaje...</>
              ) : (
                <>
                  <Send size={18} /> Enviar Mensaje
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Info Lateral: Local en Providencia + Horarios */}
        <aside className="flex flex-col gap-6 lg:col-span-5">
          <div className="flex flex-col gap-6 rounded-2xl border border-tertiary/10 bg-white p-6 shadow-xs sm:p-8">
            <div>
              <span className="font-body text-xs font-bold uppercase tracking-widest text-secondary">
                Visítanos
              </span>
              <h2 className="mt-1 text-left text-tertiary">Obrador Providencia</h2>
              <p className="mt-1 font-body text-sm text-ink/75">
                Acércate a disfrutar de nuestra vitrina fresca y degustación de café.
              </p>
            </div>

            <div className="flex flex-col gap-5 border-t border-tertiary/10 pt-5">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral text-secondary">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-tertiary">
                    Dirección
                  </h3>
                  <p className="font-body text-sm text-ink/80">
                    Av. Providencia 2133, Local 12
                  </p>
                  <p className="font-body text-xs text-ink/60">
                    Providencia, Santiago (a pasos de Metro Los Leones)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral text-secondary">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-tertiary">
                    Horarios de Atención
                  </h3>
                  <p className="font-body text-sm text-ink/80">
                    <strong>Lun a Vie:</strong> 08:30 – 20:00 hrs
                  </p>
                  <p className="font-body text-sm text-ink/80">
                    <strong>Sábados:</strong> 09:30 – 19:30 hrs
                  </p>
                  <p className="font-body text-xs text-ink/60">
                    <strong>Dom y Festivos:</strong> 10:00 – 15:00 hrs (Retiros)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral text-secondary">
                  <Phone size={20} />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-tertiary">
                    Teléfonos
                  </h3>
                  <p className="font-body text-sm text-ink/80">
                    +56 9 8765 4321 (WhatsApp Pedidos)
                  </p>
                  <p className="font-body text-xs text-ink/60">
                    +56 2 2345 6789 (Fijo Tienda)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral text-secondary">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-tertiary">
                    Correo Electrónico
                  </h3>
                  <p className="font-body text-sm text-ink/80">
                    contacto@cremeco.cl
                  </p>
                  <p className="font-body text-xs text-ink/60">
                    pedidos@cremeco.cl
                  </p>
                </div>
              </div>
            </div>

            {/* Imagen mapa / obrador */}
            <div className="overflow-hidden rounded-xl border border-tertiary/10">
              <img
                src="/imagen/mapa.jpg"
                alt="Mapa de ubicación Crème & Co Providencia"
                className="h-36 w-full object-cover"
                loading="lazy"
                onError={(e) => {
                  // Fallback si no carga imagen local de mapa
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=800&auto=format&fit=crop";
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-secondary/20 bg-neutral/60 p-4">
            <Sparkles size={24} className="shrink-0 text-secondary" />
            <p className="font-body text-xs text-ink/80 leading-relaxed">
              ¿Prefieres una degustación para tu boda o evento corporativo? Agenda
              previamente con 48 horas de anticipación.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
