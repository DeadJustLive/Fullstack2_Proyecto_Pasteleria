// @pca:start
// @id(frontend.domain.formularioSoporte)
// @kind(component)
// @limit(lines: 140)
// @contract(props: titulo?: string, descripcion?: string)
// @relates(frontend.ui.input)
// @relates(frontend.ui.button)
// @relates(frontend.ui.card)
// @desc(Formulario de contacto y soporte con validacion y confirmacion de envio)
// @pca:end
import { useState, type FormEvent } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

interface ConsultaSoporte {
  nombre: string;
  email: string;
  mensaje: string;
}

type ErroresConsulta = Partial<Record<keyof ConsultaSoporte, string>>;

export interface FormularioSoporteProps {
  titulo?: string;
  descripcion?: string;
}

const CONSULTA_INICIAL: ConsultaSoporte = { nombre: "", email: "", mensaje: "" };
const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarConsulta(consulta: ConsultaSoporte): ErroresConsulta {
  const errores: ErroresConsulta = {};
  if (!consulta.nombre.trim()) errores.nombre = "Escribe tu nombre.";
  if (!PATRON_EMAIL.test(consulta.email.trim())) {
    errores.email = "Ingresa un correo válido, por ejemplo maria@ejemplo.com.";
  }
  if (consulta.mensaje.trim().length < 10) {
    errores.mensaje = "Cuéntanos tu consulta en al menos 10 caracteres.";
  }
  return errores;
}

export function FormularioSoporte({
  titulo = "Contacto y soporte",
  descripcion = "¿Problemas con tu pedido o con el envío? Escríbenos y te ayudaremos.",
}: FormularioSoporteProps) {
  const [consulta, setConsulta] = useState<ConsultaSoporte>(CONSULTA_INICIAL);
  const [errores, setErrores] = useState<ErroresConsulta>({});
  const [enviada, setEnviada] = useState(false);

  function actualizarCampo(campo: keyof ConsultaSoporte, valor: string) {
    setConsulta((previa) => ({ ...previa, [campo]: valor }));
    setErrores((previos) => ({ ...previos, [campo]: undefined }));
  }

  function enviarConsulta(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const erroresNuevos = validarConsulta(consulta);
    setErrores(erroresNuevos);
    if (Object.keys(erroresNuevos).length > 0) return;

    // Pendiente de backend: aquí se enviará la consulta al servicio de soporte.
    setEnviada(true);
    setConsulta(CONSULTA_INICIAL);
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-semibold text-tertiary">{titulo}</h2>
        <p className="font-body text-sm text-ink/80">{descripcion}</p>
      </div>

      {enviada ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl bg-green-50 p-4 font-body text-sm text-green-800"
        >
          <CheckCircle size={20} className="mt-0.5 shrink-0" />
          <p>Recibimos tu consulta. Te responderemos por correo lo antes posible.</p>
        </div>
      ) : (
        <form onSubmit={enviarConsulta} noValidate className="flex flex-col gap-4">
          <Input
            label="Nombre"
            name="nombre"
            placeholder="Ej: María Gómez"
            autoComplete="name"
            value={consulta.nombre}
            onChange={(e) => actualizarCampo("nombre", e.target.value)}
            error={errores.nombre}
          />
          <Input
            label="Correo"
            name="email"
            type="email"
            placeholder="Ej: maria@ejemplo.com"
            autoComplete="email"
            value={consulta.email}
            onChange={(e) => actualizarCampo("email", e.target.value)}
            error={errores.email}
          />
          <div className="flex flex-col gap-1">
            <label
              htmlFor="consulta-mensaje"
              className="font-body text-sm font-semibold text-tertiary"
            >
              Mensaje
            </label>
            <textarea
              id="consulta-mensaje"
              name="mensaje"
              rows={4}
              placeholder="Cuéntanos en qué te podemos ayudar..."
              value={consulta.mensaje}
              onChange={(e) => actualizarCampo("mensaje", e.target.value)}
              aria-invalid={Boolean(errores.mensaje)}
              className="w-full rounded-lg border border-tertiary/30 bg-white px-4 py-2 font-body text-base text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-primary focus:ring-2 focus:ring-primary/30 aria-[invalid=true]:border-error"
            />
            {errores.mensaje && (
              <span className="font-body text-xs text-error">{errores.mensaje}</span>
            )}
          </div>
          <Button type="submit" className="w-fit">
            Enviar consulta
          </Button>
        </form>
      )}
    </Card>
  );
}