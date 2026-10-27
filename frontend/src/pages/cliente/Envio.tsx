// @pca:start
// @id(frontend.pages.cliente.envio)
// @kind(component)
// @limit(lines: 200)
// @contract(sin props: muestra estado de envio, ruta, resumen y formulario de soporte de un pedido mock)
// @relates(frontend.domain.lineaTiempoPedido)
// @relates(frontend.ui.card)
// @relates(frontend.domain.formularioSoporte)
// @relates(frontend.ui.buttonLink)
// @desc(Informacion de envio: estado del pedido, ruta de entrega, resumen y contacto de soporte)
// @pca:end
import { ArrowLeft, FileText } from "lucide-react";
import { FormularioSoporte } from "@/components/domain/FormularioSoporte";
import { LineaTiempoPedido, type HitoPedido } from "@/components/domain/LineaTiempoPedido";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";

interface ProductoEnvio {
  id: string;
  nombre: string;
  detalle: string;
  cantidad: number;
  imagen: string;
}

const NUMERO_PEDIDO = 67;
const ENTREGA_ESTIMADA = "15 de noviembre, 14:00 - 16:00";
const URL_MAPA =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.1415668612196!2d-70.6482613!3d-33.4488426!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662c5a2c4e201bb%3A0x23f79fbc957a1772!2sSantiago%2C%20Regi%C3%B3n%20Metropolitana!5e0!3m2!1ses!2scl!4v1700000000000!5m2!1ses!2scl";

const HITOS_ENVIO: HitoPedido[] = [
  {
    id: "recibido",
    titulo: "Pedido recibido",
    fechaHora: "09:30",
    descripcion: "Recibimos tu pedido y lo confirmamos.",
    estado: "completado",
  },
  {
    id: "preparacion",
    titulo: "En preparación",
    descripcion: "Nuestro equipo está horneando y decorando tu pedido.",
    estado: "activo",
  },
  {
    id: "despacho",
    titulo: "Listo para despacho",
    descripcion: "Pendiente: te avisaremos cuando salga de la pastelería.",
    estado: "pendiente",
  },
  {
    id: "camino",
    titulo: "En camino",
    descripcion: "Pendiente: tu pedido va hacia la dirección de entrega.",
    estado: "pendiente",
  },
];

const PRODUCTOS_PEDIDO: ProductoEnvio[] = [
  {
    id: "tartaleta",
    nombre: "Tartaleta de frutos rojos",
    detalle: "Porción individual",
    cantidad: 1,
    imagen: "/imagen/tartaleta.jpg",
  },
  {
    id: "chocolate",
    nombre: "Torta de chocolate clásica",
    detalle: "Porción individual",
    cantidad: 1,
    imagen: "/imagen/chocolate.jpg",
  },
];

export function Envio() {
  return (
    <div className="mx-auto flex max-w-[var(--container-page)] flex-col gap-8 py-8">
      <header className="flex flex-col gap-2">
        <ButtonLink to="/perfil" variant="ghost" size="sm" className="w-fit">
          <ArrowLeft size={16} />
          Volver a mis pedidos
        </ButtonLink>
        <h1 className="text-tertiary">Seguimiento del pedido #{NUMERO_PEDIDO}</h1>
        <p className="max-w-[60ch] font-body text-ink/80">
          Tu pedido está en preparación. Entrega estimada:{" "}
          <strong>{ENTREGA_ESTIMADA}</strong>.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4">
            <h2 className="font-display text-xl font-semibold text-tertiary">
              Estado del pedido
            </h2>
            <LineaTiempoPedido hitos={HITOS_ENVIO} />
          </Card>

          <Card className="flex flex-col gap-4">
            <h2 className="font-display text-xl font-semibold text-tertiary">
              Ruta de entrega
            </h2>
            <div className="h-[350px] overflow-hidden rounded-xl border border-tertiary/10">
              <iframe
                title="Mapa de la ruta de entrega en Santiago"
                src={URL_MAPA}
                className="h-full w-full border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Card>
        </div>

        <aside>
          <Card className="flex flex-col gap-4">
            <h2 className="font-display text-xl font-semibold text-tertiary">
              Resumen del pedido
            </h2>
            <ul className="flex flex-col gap-4">
              {PRODUCTOS_PEDIDO.map((producto) => (
                <li key={producto.id} className="flex items-center gap-3">
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                  />
                  <div className="flex-1 font-body">
                    <p className="font-semibold text-tertiary">{producto.nombre}</p>
                    <p className="text-sm text-ink/70">{producto.detalle}</p>
                  </div>
                  <span className="font-body text-sm font-semibold text-ink/80">
                    x{producto.cantidad}
                  </span>
                </li>
              ))}
            </ul>
            <ButtonLink to="/perfil" variant="outline">
              <FileText size={18} />
              Ver factura
            </ButtonLink>
          </Card>
        </aside>
      </div>

      <FormularioSoporte />
    </div>
  );
}