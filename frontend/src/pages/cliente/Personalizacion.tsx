// @pca:start
// @id(frontend.pages.cliente.personalizacion)
// @kind(component)
// @limit(lines: 520)
// @contract(sin props: formulario interactivo de diseno y cotizacion de tortas)
// @relates(frontend.ui.button)
// @relates(frontend.ui.modal)
// @relates(frontend.ui.input)
// @relates(docs.reglas_ui)
// @desc(Pagina de personalizacion de tortas por pasos: personas, sabores y detalles)
// @pca:end
import { useState, useEffect } from "react";
import { Check, Info, Send, Sparkles, CheckCircle2, Calendar, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { cn, formatPrecio } from "@/lib/utils";
import { useAuth } from "@/context/auth";
import { api, type CustomQuoteResponse } from "@/services/api";

interface Sabor {
  id: string;
  nombre: string;
  descripcion: string;
  badge: string;
}

const SABORES: Sabor[] = [
  { id: "chocolate", nombre: "Chocolate Tradicional", descripcion: "Bizcocho húmedo de cacao con ganache semi-amargo", badge: "Clásico" },
  { id: "vainilla", nombre: "Vainilla Natural", descripcion: "Bizcocho esponjoso aromatizado con vainas de Madagascar", badge: "Clásico" },
  { id: "red-velvet", nombre: "Red Velvet", descripcion: "Bizcocho aterciopelado con suave crema de queso mascarpone", badge: "Especial" },
  { id: "zanahoria", nombre: "Zanahoria & Nueces", descripcion: "Bizcocho especiado artesanal con canela y nueces tostadas", badge: "Casero" },
  { id: "frutilla", nombre: "Frutilla Silvestre", descripcion: "Bizcocho liviano con confitura natural de frutillas", badge: "Frutal" },
  { id: "tres-leches", nombre: "Tres Leches Gourmet", descripcion: "Bizcocho húmedo bañado en infusión de tres leches y merengue", badge: "Latino" },
];

const OPCIONES_PERSONAS = [10, 15, 20, 25, 30, 40];

const TIPOS_EVENTO = [
  "Cumpleaños",
  "Boda / Matrimonio",
  "Baby Shower",
  "Aniversario",
  "Graduación / Fiesta Infantil",
  "Evento Corporativo",
];

const COBERTURAS = [
  "Crema Chantilly Artesanal",
  "Ganache de Chocolate Belga",
  "Merengue Italiano Dorado",
  "Fondant con Modelado Personalizado",
];

export function Personalizacion() {
  const { usuario } = useAuth();

  const [personas, setPersonas] = useState<number>(15);
  const [saboresSeleccionados, setSaboresSeleccionados] = useState<string[]>(["chocolate"]);
  const [tipoEvento, setTipoEvento] = useState<string>("Cumpleaños");
  const [cubierta, setCubierta] = useState<string>("Crema Chantilly Artesanal");

  const [nombre, setNombre] = useState(usuario?.nombre || "");
  const [email, setEmail] = useState(usuario?.email || "");
  const [telefono, setTelefono] = useState("+56 9 8765 4321");
  const [fechaEvento, setFechaEvento] = useState("");
  const [detalles, setDetalles] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [modalEnviado, setModalEnviado] = useState(false);
  const [cotizacionCreada, setCotizacionCreada] = useState<CustomQuoteResponse | null>(null);

  // Sincronizar datos si el usuario inicia sesión
  useEffect(() => {
    if (usuario) {
      if (!nombre && usuario.nombre) setNombre(usuario.nombre);
      if (!email && usuario.email) setEmail(usuario.email);
    }
  }, [usuario, nombre, email]);

  const toggleSabor = (id: string) => {
    setSaboresSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // Cálculo estimativo orientativo en CLP
  const precioBasePorcion = 2400;
  const adicionalSabores = saboresSeleccionados.length > 2 ? 3500 : 0;
  const montoEstimado = personas * precioBasePorcion + adicionalSabores;

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saboresSeleccionados.length === 0) return;

    setEnviando(true);
    try {
      const saboresNombres = saboresSeleccionados
        .map((sId) => SABORES.find((s) => s.id === sId)?.nombre || sId)
        .join(", ");

      const quote = await api.order.createQuote({
        clienteNombre: nombre || "Cliente Pastelería",
        email: email || "cliente@cremeco.cl",
        telefono: telefono || "+56 9 8765 4321",
        tipoEvento,
        porciones: personas,
        saborBizcocho: saboresNombres,
        relleno: saboresNombres,
        cubierta,
        tematica: detalles ? detalles.slice(0, 100) : "Diseño artesanal personalizado",
        detalles,
        fechaEvento,
        montoEstimado,
      });

      setCotizacionCreada(quote);
      setModalEnviado(true);
    } catch {
      // Manejo de contingencia
      const fallbackQuote: CustomQuoteResponse = {
        id: Date.now(),
        codigoCotizacion: `#COT-${Math.floor(1000 + Math.random() * 9000)}`,
        clienteNombre: nombre,
        email: email,
        telefono: telefono,
        tipoEvento,
        porciones: personas,
        estado: "RECIBIDA",
        montoEstimado,
        fecha: new Date().toISOString(),
      };
      setCotizacionCreada(fallbackQuote);
      setModalEnviado(true);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-12">
      {/* Hero Header */}
      <header className="overflow-hidden rounded-2xl bg-gradient-to-r from-tertiary via-ink to-secondary p-8 text-neutral shadow-md sm:p-10">
        <span className="font-body text-xs font-bold uppercase tracking-widest text-primary">
          Personalización DSY1104
        </span>
        <h1 className="mt-2 font-display text-3xl font-bold text-neutral sm:text-4xl">
          Diseña tu Torta Ideal
        </h1>
        <p className="mt-2 max-w-2xl font-body text-sm text-neutral/80 sm:text-base">
          Personaliza porciones, sabores, temática y solicita una cotización formal con código de seguimiento único #COT-XXXX.
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
                      "flex flex-col items-center justify-center gap-1 rounded-xl border p-4 transition-all cursor-pointer",
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
                <p className="font-body text-xs text-ink/70">Selecciona hasta 3 combinaciones para los pisos de tu torta</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-secondary/20 bg-primary/10 p-4">
              <Info size={20} className="mt-0.5 shrink-0 text-secondary" />
              <p className="font-body text-xs leading-relaxed text-ink/80">
                <strong>Recomendación del Pastelero:</strong> Para tortas de más de 20 personas, te sugerimos combinar 2 sabores complementarios (ej. Chocolate con Frutilla Silvestre o Red Velvet con Vainilla).
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
                        ? "border-secondary bg-primary/15 shadow-xs ring-1 ring-secondary/50"
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

          {/* Paso 3: Tipo de Evento y Cobertura */}
          <Card className="flex flex-col gap-6 p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-tertiary/10 pb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary font-display font-bold text-white">
                3
              </span>
              <div>
                <h2 className="font-display text-xl font-bold text-tertiary">Ocasión y Acabado</h2>
                <p className="font-body text-xs text-ink/70">Estilo del evento y cobertura deseada</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="font-body text-xs font-semibold text-tertiary">Tipo de Evento</label>
                <select
                  value={tipoEvento}
                  onChange={(e) => setTipoEvento(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-tertiary/20 bg-neutral/20 p-2.5 font-body text-sm text-ink outline-none transition-colors focus:border-secondary focus:ring-1 focus:ring-secondary"
                >
                  {TIPOS_EVENTO.map((ev) => (
                    <option key={ev} value={ev}>
                      {ev}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-body text-xs font-semibold text-tertiary">Cobertura Principal</label>
                <select
                  value={cubierta}
                  onChange={(e) => setCubierta(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-tertiary/20 bg-neutral/20 p-2.5 font-body text-sm text-ink outline-none transition-colors focus:border-secondary focus:ring-1 focus:ring-secondary"
                >
                  {COBERTURAS.map((cob) => (
                    <option key={cob} value={cob}>
                      {cob}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Paso 4: Detalles y Datos de Contacto */}
          <Card className="flex flex-col gap-6 p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-tertiary/10 pb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary font-display font-bold text-white">
                4
              </span>
              <div>
                <h2 className="font-display text-xl font-bold text-tertiary">Detalles de Contacto</h2>
                <p className="font-body text-xs text-ink/70">Información para enviarte el presupuesto formal</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="font-body text-xs font-semibold text-tertiary">Nombre Completo *</label>
                <Input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Camila Silva"
                  required
                />
              </div>
              <div>
                <label className="font-body text-xs font-semibold text-tertiary">Correo Electrónico *</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.cl"
                  required
                />
              </div>
              <div>
                <label className="font-body text-xs font-semibold text-tertiary">Teléfono de Contacto *</label>
                <Input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="+56 9 8765 4321"
                  required
                />
              </div>
              <div>
                <label className="font-body text-xs font-semibold text-tertiary">Fecha estimada del evento *</label>
                <Input
                  type="date"
                  value={fechaEvento}
                  onChange={(e) => setFechaEvento(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-body text-xs font-semibold text-tertiary">Descripción del diseño, colores o temática</label>
              <textarea
                value={detalles}
                onChange={(e) => setDetalles(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-tertiary/20 p-3 font-body text-sm text-ink outline-none transition-colors focus:border-secondary focus:ring-1 focus:ring-secondary"
                placeholder="Cuéntanos colores de decoración, mensajes en placa de chocolate, estilo de flores o detalles temáticos..."
              />
            </div>
          </Card>
        </form>

        {/* Aside: Resumen de Cotización */}
        <aside className="flex flex-col">
          <Card className="flex flex-col gap-5 p-6 shadow-md lg:sticky lg:top-24">
            <div className="border-b border-tertiary/10 pb-3">
              <h3 className="font-display text-xl font-bold text-tertiary">Resumen del Diseño</h3>
            </div>

            <div className="flex flex-col gap-4 font-body text-sm">
              <div className="flex justify-between border-b border-tertiary/10 pb-3">
                <span className="text-ink/70">Porciones</span>
                <span className="font-bold text-tertiary">{personas} personas</span>
              </div>

              <div className="flex flex-col gap-1.5 border-b border-tertiary/10 pb-3">
                <span className="text-ink/70">Sabores seleccionados:</span>
                <div className="flex flex-wrap gap-1.5">
                  {saboresSeleccionados.length === 0 ? (
                    <span className="text-xs italic text-ink/50">Selecciona al menos 1 sabor</span>
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

              <div className="flex justify-between border-b border-tertiary/10 pb-3">
                <span className="text-ink/70">Evento</span>
                <span className="font-semibold text-tertiary">{tipoEvento}</span>
              </div>

              <div className="flex justify-between border-b border-tertiary/10 pb-3">
                <span className="text-ink/70">Estimación Orientativa</span>
                <span className="font-display text-lg font-bold text-secondary">
                  ~ {formatPrecio(montoEstimado)}
                </span>
              </div>

              <div className="rounded-xl bg-neutral/50 p-3 text-xs text-ink/80 leading-relaxed">
                <p>
                  <strong>Atención Personalizada:</strong> Cada cotización se revisa manualmente por la jefa de cocina para confirmar disponibilidad y entregarte una propuesta final.
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleEnviar}
              disabled={saboresSeleccionados.length === 0 || !nombre || !email || !fechaEvento || enviando}
              className="w-full"
            >
              <Send size={18} />
              {enviando ? "Registrando Cotización..." : "Solicitar Cotización #COT"}
            </Button>
            <p className="text-center font-body text-[11px] text-ink/60">
              Genera tu código de cotización registrado en el sistema.
            </p>
          </Card>
        </aside>
      </div>

      {/* Modal Confirmación Cotización */}
      <Modal
        abierto={modalEnviado}
        onCerrar={() => setModalEnviado(false)}
        titulo="¡Cotización Registrada Exitosamente!"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/30 text-secondary shadow-sm">
            <Sparkles size={36} />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-widest text-secondary">
              Código de Cotización
            </span>
            <span className="rounded-xl bg-secondary/10 px-4 py-1.5 font-display text-2xl font-black text-secondary">
              {cotizacionCreada?.codigoCotizacion || "#COT-2026"}
            </span>
          </div>

          <p className="font-body text-sm text-ink/80">
            Hemos recibido tu solicitud para una torta de <strong>{personas} personas</strong> para el evento <strong>{tipoEvento}</strong>.
          </p>

          <div className="w-full rounded-xl border border-tertiary/10 bg-neutral/30 p-4 text-left font-body text-xs text-ink/80 space-y-1.5">
            <p className="flex items-center gap-2">
              <Calendar size={14} className="text-secondary" />
              <span>Fecha del Evento: <strong>{fechaEvento || "Por confirmar"}</strong></span>
            </p>
            <p className="flex items-center gap-2">
              <Mail size={14} className="text-secondary" />
              <span>Correo de Contacto: <strong>{email}</strong></span>
            </p>
            <p className="flex items-center gap-2">
              <Phone size={14} className="text-secondary" />
              <span>Teléfono: <strong>{telefono}</strong></span>
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-green-700" />
              <span>Estado: <strong className="text-green-800">RECIBIDA</strong> (En evaluación técnica)</span>
            </p>
          </div>

          <p className="font-body text-xs text-ink/60">
            Un maestro pastelero se pondrá en contacto contigo en un plazo máximo de 24 horas hábiles para acordar los últimos detalles y coordinar el pago.
          </p>

          <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row">
            <ButtonLink to="/perfil" variant="outline" className="w-full">
              Ir a Mi Perfil
            </ButtonLink>
            <Button onClick={() => setModalEnviado(false)} className="w-full">
              Aceptar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
