import { useEffect, useState, type FormEvent } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Switch } from "@/components/ui/Switch";
import { Textarea } from "@/components/ui/Textarea";
import {
  CONFIG_INICIAL,
  CONFIG_STORAGE_KEY,
  type ConfigTienda,
} from "@/data/configuracion";
import { guardarStorage, leerStorage } from "@/lib/storage";

const URL_MANUAL_FLOW = "https://developers.flow.cl/api";

export function Configuracion() {
  const [config, setConfig] = useState<ConfigTienda>(() =>
    leerStorage(CONFIG_STORAGE_KEY, CONFIG_INICIAL)
  );
  const [nombre, setNombre] = useState(config.nombre);
  const [email, setEmail] = useState(config.email);
  const [banner, setBanner] = useState(config.banner);
  const [flowHabilitado, setFlowHabilitado] = useState(config.flowHabilitado);
  // La API Key vive solo en memoria mientras se escribe; nunca se persiste.
  const [apiKey, setApiKey] = useState("");
  const [aviso, setAviso] = useState<"general" | "pagos" | null>(null);

  useEffect(() => {
    if (!aviso) return;
    const temporizador = setTimeout(() => setAviso(null), 2500);
    return () => clearTimeout(temporizador);
  }, [aviso]);

  const guardar = (nueva: ConfigTienda, cual: "general" | "pagos") => {
    guardarStorage(CONFIG_STORAGE_KEY, nueva);
    setConfig(nueva);
    setAviso(cual);
  };

  const handleGeneral = (e: FormEvent) => {
    e.preventDefault();
    guardar({ ...config, nombre, email, banner }, "general");
  };

  const handlePagos = (e: FormEvent) => {
    e.preventDefault();
    guardar(
      {
        ...config,
        flowHabilitado,
        flowConfigurado: config.flowConfigurado || apiKey.trim() !== "",
      },
      "pagos"
    );
    setApiKey("");
  };

  return (
    <div className="pb-10">
      <div className="mb-6 mt-2">
        <h1 className="font-display text-3xl font-bold text-tertiary">
          Configuración de la Tienda
        </h1>
        <p className="font-body text-ink/70">
          Personaliza el comportamiento y la identidad visual de la pastelería.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(240px,320px)]">
        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 text-left">Información general</h2>
            <form onSubmit={handleGeneral} className="flex flex-col gap-4">
              <Input
                label="Nombre de la tienda"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              <Input
                label="Email de contacto público"
                type="email"
                required
                hint="Este correo será visible para los clientes."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Textarea
                label="Mensaje en pantalla de inicio (banner)"
                rows={3}
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
              />
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit">Guardar cambios</Button>
                {aviso === "general" && (
                  <p role="status" className="font-body text-sm font-semibold text-secondary">
                    ¡Cambios guardados! ✓
                  </p>
                )}
              </div>
            </form>
          </Card>

          <Card>
            <h2 className="mb-4 text-left">Integraciones de pago</h2>
            <form onSubmit={handlePagos} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Switch
                  activo={flowHabilitado}
                  onCambiar={setFlowHabilitado}
                  aria-labelledby="etiqueta-flow"
                />
                <span id="etiqueta-flow" className="font-body font-semibold text-tertiary">
                  Habilitar Flow (Webpay y otros medios de pago)
                </span>
              </div>

              <div className="rounded bg-neutral p-4">
                <PasswordInput
                  label="API Key de producción (Flow)"
                  placeholder={config.flowConfigurado ? "••••••••••••••••" : "Pega tu API Key"}
                  autoComplete="off"
                  disabled={!flowHabilitado}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="mt-2 flex items-start gap-1.5 font-body text-xs text-ink/60">
                  <ShieldCheck size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                  {config.flowConfigurado
                    ? "Ya hay una clave configurada. Escribe una nueva solo si quieres reemplazarla."
                    : "Aún no hay una clave configurada."}{" "}
                  Esta demo no guarda la clave en el navegador; en producción se almacenará
                  cifrada en el servidor.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit">Guardar configuración de pagos</Button>
                {aviso === "pagos" && (
                  <p role="status" className="font-body text-sm font-semibold text-secondary">
                    ¡Configuración guardada! ✓
                  </p>
                )}
              </div>
            </form>
          </Card>
        </div>

        <aside className="lg:self-start">
          <div className="rounded bg-tertiary p-6 text-neutral">
            <h2 className="mb-3 text-left font-display text-lg text-primary">
              ¿Necesitas ayuda?
            </h2>
            <p className="mb-5 font-body text-sm">
              Si tienes problemas configurando Flow o cualquier otro servicio, revisa la
              documentación.
            </p>
            <a
              href={URL_MANUAL_FLOW}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center rounded bg-primary px-5 font-body font-semibold text-tertiary transition-colors hover:bg-white"
            >
              Ver manual
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
