// Formulario de contacto y soporte (simulado: no envia datos a ningun servidor).
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

interface FormularioSoporteProps {
  nombreInicial?: string;
  emailInicial?: string;
}

export function FormularioSoporte({ nombreInicial = "", emailInicial = "" }: FormularioSoporteProps) {
  const [nombre, setNombre] = useState(nombreInicial);
  const [email, setEmail] = useState(emailInicial);
  const [mensaje, setMensaje] = useState("");
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setEnviado(true);
    setMensaje("");
  };

  return (
    <Card>
      <h2 className="text-left">Contacto y soporte</h2>
      <p className="mb-4 mt-1 font-body text-ink/80">
        ¿Problemas con tu pedido o con el envío? Escríbenos y te ayudaremos.
      </p>

      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Nombre"
          placeholder="Ej: María Gómez"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <Input
          label="Correo"
          type="email"
          placeholder="Ej: maria@ejemplo.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="sm:col-span-2">
          <Textarea
            label="Mensaje"
            placeholder="Cuéntanos en qué te podemos ayudar..."
            required
            value={mensaje}
            onChange={(e) => {
              setMensaje(e.target.value);
              setEnviado(false);
            }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
          <Button type="submit">Enviar consulta</Button>
          {enviado && (
            <p role="status" className="font-body text-sm font-semibold text-secondary">
              ¡Mensaje enviado! Te responderemos pronto. ✓
            </p>
          )}
        </div>
      </form>
    </Card>
  );
}
