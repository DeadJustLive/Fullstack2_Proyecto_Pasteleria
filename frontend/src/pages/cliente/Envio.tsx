import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHero } from "@/components/ui/PageHero";
import { FormularioSoporte } from "@/components/domain/FormularioSoporte";
import { OrderSummary } from "@/components/domain/OrderSummary";
import { PillEstadoPedido } from "@/components/domain/PillEstadoPedido";
import { ETAPAS_PEDIDO, LABEL_METODO } from "@/data/pedidos";
import { entregaEstimada, obtenerPedidos } from "@/lib/pedidos";
import { cn, formatFecha, formatHora } from "@/lib/utils";

const MAPA_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.1415668612196!2d-70.6482613!3d-33.4488426!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662c5a2c4e201bb%3A0x23f79fbc957a1772!2sSantiago%2C%20Regi%C3%B3n%20Metropolitana!5e0!3m2!1ses!2scl!4v1700000000000!5m2!1ses!2scl";

export function Envio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedidos] = useState(obtenerPedidos);

  // Sin id (enlace del Navbar) se muestra el pedido activo mas reciente.
  const pedido = id
    ? pedidos.find((p) => p.id === id)
    : (pedidos.find((p) => p.estado !== "entregado") ?? pedidos[0]);

  if (!pedido) {
    return (
      <EmptyState
        titulo={id ? `No encontramos el pedido #${id}` : "Aún no tienes pedidos"}
        descripcion="Cuando hagas una compra podrás seguir su estado desde aquí."
        accion={<Button onClick={() => navigate("/catalogo")}>Explorar catálogo</Button>}
        className="py-20"
      />
    );
  }

  const etapaActual = ETAPAS_PEDIDO.findIndex((e) => e.estado === pedido.estado);
  const entregado = pedido.estado === "entregado";

  return (
    <>
      <Link
        to="/perfil"
        className="mb-4 inline-block font-body text-sm font-semibold text-secondary hover:underline"
      >
        ← Volver a mis pedidos
      </Link>

      <PageHero
        eyebrow="Seguimiento"
        titulo={`Seguimiento de Pedido #${pedido.id}`}
        descripcion={
          entregado
            ? "Este pedido ya fue entregado. ¡Esperamos que lo hayas disfrutado!"
            : `Tu momento dulce está en camino. Entrega estimada: ${formatFecha(entregaEstimada(pedido), "largo")}, 14:00 - 16:00.`
        }
        className="mb-8 space-y-1"
      />

      <div className="grid gap-6 min-[900px]:grid-cols-[1fr_minmax(260px,330px)]">
        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 text-left">Estado del pedido</h2>
            <ol className="flex flex-col">
              {ETAPAS_PEDIDO.map((etapa, i) => {
                const completa = i < etapaActual || entregado;
                const actual = i === etapaActual && !entregado;
                const ultima = i === ETAPAS_PEDIDO.length - 1;

                return (
                  <li
                    key={etapa.estado}
                    aria-current={actual ? "step" : undefined}
                    className="flex gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 font-body text-sm font-bold",
                          completa && "border-secondary bg-secondary text-white",
                          actual && "border-primary bg-primary text-tertiary ring-4 ring-primary/30",
                          !completa && !actual && "border-tertiary/20 bg-white text-tertiary/50"
                        )}
                      >
                        {completa ? <Check size={18} /> : i + 1}
                      </span>
                      {!ultima && (
                        <span
                          aria-hidden="true"
                          className={cn(
                            "my-1 w-0.5 flex-1",
                            completa ? "bg-secondary" : "bg-tertiary/15"
                          )}
                        />
                      )}
                    </div>
                    <div className="pb-6">
                      <p
                        className={cn(
                          "font-display font-semibold",
                          completa || actual ? "text-tertiary" : "text-tertiary/50"
                        )}
                      >
                        {etapa.titulo}
                      </p>
                      <p className="font-body text-sm text-secondary">
                        {i === 0
                          ? `${formatFecha(pedido.fecha)}, ${formatHora(pedido.fecha)}`
                          : actual
                            ? etapa.nota
                            : completa
                              ? "Completado"
                              : "Pendiente"}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>

          <Card>
            <h2 className="mb-4 text-left">Ruta de entrega</h2>
            <p className="mb-3 font-body text-sm text-ink/80">
              Entregamos en {pedido.entrega.direccion}, {pedido.entrega.comuna}.
            </p>
            <div className="h-[350px] overflow-hidden rounded border border-tertiary/10">
              <iframe
                src={MAPA_URL}
                title="Mapa de la ruta de entrega"
                className="h-full w-full border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Card>
        </div>

        <aside className="min-[900px]:sticky min-[900px]:top-6 min-[900px]:self-start">
          <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-left">Resumen</h2>
              <PillEstadoPedido estado={pedido.estado} />
            </div>

            <ul className="mb-4 space-y-3">
              {pedido.items.map(({ producto, cantidad }) => (
                <li key={producto.id} className="flex items-center gap-3">
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="h-12 w-12 shrink-0 rounded-[10px] object-cover"
                  />
                  <p className="min-w-0 flex-1 truncate font-body text-sm font-semibold text-tertiary">
                    {producto.nombre}
                  </p>
                  <span className="font-body text-sm text-secondary">x{cantidad}</span>
                </li>
              ))}
            </ul>

            <OrderSummary
              subtotal={pedido.subtotal}
              descuento={pedido.descuento}
              cupon={pedido.cupon}
              envio={pedido.envio}
              total={pedido.total}
            />

            <p className="mt-4 font-body text-sm text-ink/70">
              Pago: {LABEL_METODO[pedido.metodoPago]}
            </p>

            <Button variant="outline" className="mt-4 w-full" onClick={() => window.print()}>
              <Printer size={18} aria-hidden="true" />
              Imprimir comprobante
            </Button>
          </Card>
        </aside>
      </div>

      <div className="mt-6">
        <FormularioSoporte
          nombreInicial={pedido.entrega.nombre}
          emailInicial={pedido.entrega.email}
        />
      </div>
    </>
  );
}
