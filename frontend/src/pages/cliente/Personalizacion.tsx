// @pca:start
// @id(frontend.pages.cliente.personalizacion)
// @kind(component)
// @limit(lines: 320)
// @contract(sin props: formulario interactivo de diseno y cotizacion de tortas)
// @relates(frontend.ui.button)
// @relates(frontend.ui.modal)
// @relates(frontend.ui.input)
// @relates(docs.reglas_ui)
// @desc(Pagina de personalizacion de tortas por pasos: personas, sabores y detalles)
// @pca:end
import { useState } from "react";
import { Check, Info, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

interface Sabor {
  id: string;
  nombre: string;
  descripcion: string;
  badge: string;
}

const SABORES: Sabor[] = [
  { id: "chocolate", nombre: "Chocolate", descripcion: "Bizcocho húmedo con ganache de chocolate", badge: "Clásico" },
  { id: "vainilla", nombre: "Vainilla", descripcion: "Bizcocho esponjoso de vainilla natural", badge: "Clásico" },
  { id: "red-velvet", nombre: "Red Velvet", descripcion: "Bizcocho aterciopelado con crema de queso", badge: "Especial" },
  { id: "zanahoria", nombre: "Zanahoria", descripcion: "Bizcocho especiado con nueces y canela", badge: "Casero" },
  { id: "frutilla", nombre: "Frutilla", descripcion: "Bizcocho ligero con confitura artesanal de frutilla", badge: "Frutal" },
  { id: "tres-leches", nombre: "Tres Leches", descripcion: "Húmedo, cremoso y con merengue dorado", badge: "Latino" },
];

const OPCIONES_PERSONAS = [10, 15, 20, 25, 30, 40];

export function Personalizacion() {
  const [personas, setPersonas] = useState<number>(10);
  const [saboresSeleccionados, setSaboresSeleccionados] = useState<string[]>(["chocolate"]);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaEvento, setFechaEvento] = useState("");
  const [detalles, setDetalles] = useState("");
  const [modalEnviado, setModalEnviado] = useState(false);

  const toggleSabor = (id: string) => {
    setSaboresSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    setModalEnviado(true);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-12">
      {/* Hero Header */}
      <header className="overflow-hidden rounded-2xl bg-gradient-to-r from-tertiary via-ink to-secondary p-8 text-neutral shadow-md sm:p-10">
        <span className="font-body text-xs font-bold uppercase tracking-widest text-primary">
          Personalización
        </span>
        <h1 className="mt-2 font-display text-3xl font-bold text-neutral sm:text-4xl">
          Diseña tu Torta Ideal
        </h1>
        <p className="mt-2 max-w-2xl font-body text-sm text-neutral/80 sm:text-base">
          Personaliza cada detalle de tu torta. Los sabores y coberturas se elaboran en nuestra cocina según disponibilidad de temporada.
        </p>
      </header>

      {/* Grid Principal: Formulario + Resumen */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <form onSubmit={handleEnviar} className="flex flex-col gap-8">
          {/* Paso 1: Cantidad de Personas */}
          <Card className="flex flex-col gap-6 p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-tertiary/10 pb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary font-display font-bold text-white">
                1
              </span>
              <div>
                <h2 className="font-display text-xl font-bold text-tertiary">Cantidad de Personas</h2>
                <p className="font-body text-xs text-ink/70">Selecciona el tamaño según tus invitados</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {OPCIONES_PERSONAS.map((num) => {
                const seleccionado = personas === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPersonas(num)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 rounded-xl border p-4 transition-all",
                      seleccionado
                        ? "border-secondary bg-primary/20 text-tertiary font-bold shadow-xs ring-2 ring-secondary"
                        : "border-tertiary/15 bg-white text-ink/80 hover:bg-neutral/50 hover:border-tertiary/30"
                    )}
                  >
                    <span className="font-display text-2xl font-bold">{num}{num === 40 ? "+" : ""}</span>
                    <span className="font-body text-xs font-medium text-ink/60">personas</span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Paso 2: Sabores y Rellenos */}
          <Card className="flex flex-col gap-6 p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-tertiary/10 pb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary font-display font-bold text-white">
                2
              </span>
              <div>
                <h2 className="font-display text-xl font-bold text-tertiary">Sabores y Rellenos</h2>
                <p className="font-body text-xs text-ink/70">Selecciona los sabores preferidos</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-secondary/20 bg-primary/10 p-4">
              <Info size={20} className="mt-0.5 shrink-0 text-secondary" />
              <p className="font-body text-xs leading-relaxed text-ink/80">
                <strong>Recomendación:</strong> Puedes seleccionar hasta 2 o 3 sabores para combinar pisos y rellenos según el tamaño de tu torta.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {SABORES.map((sabor) => {
                const checked = saboresSeleccionados.includes(sabor.id);
                return (
                  <div
                    key={sabor.id}
                    onClick={() => toggleSabor(sabor.id)}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all",
                      checked
                        ? "border-secondary bg-primary/15 shadow-xs"
                        : "border-tertiary/15 bg-white hover:bg-neutral/40"
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                        checked ? "border-secondary bg-secondary text-white" : "border-tertiary/30 bg-white"
                      )}
                    >
                      {checked && <Check size={14} strokeWidth={3} />}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-body text-sm font-bold text-tertiary">{sabor.nombre}</span>
                        <span className="rounded-full bg-neutral px-2 py-0.5 font-body text-[10px] font-semibold text-secondary">
                          {sabor.badge}
                        </span>
                      </div>
                      <span className="mt-1 font-body text-xs text-ink/70">{sabor.descripcion}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Paso 3: Detalles y Datos de Contacto */}
          <Card className="flex flex-col gap-6 p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-tertiary/10 pb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary font-display font-bold text-white">
                3
              </span>
              <div>
                <h2 className="font-display text-xl font-bold text-tertiary">Detalles de la Cotización</h2>
                <p className="font-body text-xs text-ink/70">Datos de contacto y mensaje especial</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="font-body text-xs font-semibold text-tertiary">Nombre Completo</label>
                <Input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Camila Morales"
                  required
                />
              </div>
              <div>
                <label className="font-body text-xs font-semibold text-tertiary">Teléfono de Contacto</label>
                <Input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="+56 9 1234 5678"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-body text-xs font-semibold text-tertiary">Fecha estimada del evento</label>
              <Input
                type="date"
                value={fechaEvento}
                onChange={(e) => setFechaEvento(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="font-body text-xs font-semibold text-tertiary">Descripción del diseño o temática</label>
              <textarea
                value={detalles}
                onChange={(e) => setDetalles(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-tertiary/20 p-3 font-body text-sm text-ink outline-none transition-colors focus:border-secondary focus:ring-1 focus:ring-secondary"
                placeholder="Cuéntanos colores, mensaje escrito en placa de chocolate, estilo de decoración..."
              />
            </div>
          </Card>
        </form>

        {/* Aside: Resumen de Cotizacion */}
        <aside className="flex flex-col">
          <Card className="flex flex-col gap-5 p-6 shadow-md lg:sticky lg:top-24">
            <div className="border-b border-tertiary/10 pb-3">
              <h3 className="font-display text-xl font-bold text-tertiary">Resumen de Cotización</h3>
            </div>

            <div className="flex flex-col gap-4 font-body text-sm">
              <div className="flex justify-between border-b border-tertiary/10 pb-3">
                <span className="text-ink/70">Porciones</span>
                <span className="font-bold text-tertiary">{personas} personas</span>
              </div>

              <div className="flex flex-col gap-2 border-b border-tertiary/10 pb-3">
                <span className="text-ink/70">Sabores elegidos:</span>
                <div className="flex flex-wrap gap-1.5">
                  {saboresSeleccionados.length === 0 ? (
                    <span className="text-xs italic text-ink/50">Ninguno seleccionado</span>
                  ) : (
                    saboresSeleccionados.map((sId) => {
                      const s = SABORES.find((item) => item.id === sId);
                      return (
                        <span
                          key={sId}
                          className="rounded-full bg-primary/30 px-2.5 py-0.5 text-xs font-semibold text-tertiary"
                        >
                          {s?.nombre || sId}
                        </span>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-neutral/50 p-3 text-xs text-ink/80 leading-relaxed">
                <p>
                  <strong>Atención artesanal:</strong> Evaluamos la complejidad del diseño para ofrecerte el mejor valor y tiempo de preparación.
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleEnviar}
              disabled={saboresSeleccionados.length === 0}
              className="w-full"
            >
              <Send size={18} />
              Solicitar Cotización
            </Button>
            <p className="text-center font-body text-[11px] text-ink/60">
              Te contactaremos en un plazo máximo de 24 horas hábiles.
            </p>
          </Card>
        </aside>
      </div>

      {/* Modal Confirmacion Cotizacion */}
      <Modal
        abierto={modalEnviado}
        onCerrar={() => setModalEnviado(false)}
        titulo="¡Cotización Solicitada!"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-secondary">
            <Sparkles size={32} />
          </div>
          <p className="font-body text-sm text-ink/80">
            Hemos recibido tu solicitud para una torta de <strong>{personas} personas</strong>. Nuestro equipo de pastelería revisará los detalles y te contactará a la brevedad.
          </p>
          <Button onClick={() => setModalEnviado(false)} className="mt-2 w-full">
            Entendido
          </Button>
        </div>
      </Modal>
    </div>
  );
}
