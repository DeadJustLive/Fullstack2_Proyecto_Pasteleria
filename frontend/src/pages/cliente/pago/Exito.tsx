// @pca:start
// @id(frontend.pages.cliente.pago.exito)
// @kind(page)
// @limit(lines: 280)
// @contract(PagoExitoView())
// @relates(docs.reglas_ui)
// @desc(Pantalla de confirmacion de pago exitoso con codigo y boleta DSY1104)
// @pca:end
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  Printer,
  ShoppingBag,
  Home,
  Truck,
  User,
  ShieldCheck,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useCart } from "@/context/cart";
import { formatPrecio } from "@/lib/utils";

interface StoredOrderItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  total: number;
}

interface StoredOrder {
  orderId: string;
  fecha: string;
  comprador: {
    nombre: string;
    email: string;
    telefono: string;
    rut?: string;
  };
  entrega: {
    metodo: string;
    direccion: string;
    indicaciones?: string;
  };
  items: StoredOrderItem[];
  totales: {
    subtotal: number;
    descuento: number;
    envio: number;
    total: number;
    neto: number;
    iva: number;
  };
  metodoPago: string;
}

export function PagoExito() {
  const [searchParams] = useSearchParams();
  const { vaciar } = useCart();
  const [orden, setOrden] = useState<StoredOrder | null>(null);

  const urlOrderId = searchParams.get("orderId") || searchParams.get("external_reference") || "CC-8941";
  const urlTotal = Number(searchParams.get("total")) || 53400;

  // Al llegar a la pantalla de éxito se vacía el carrito definitivamente (clearCart)
  useEffect(() => {
    vaciar();

    try {
      const guardada = sessionStorage.getItem("cremeco_last_order");
      if (guardada) {
        setOrden(JSON.parse(guardada));
      }
    } catch {
      // Continuar con fallback
    }
  }, [vaciar]);

  const orderId = orden?.orderId || urlOrderId;
  const comprador = orden?.comprador || {
    nombre: "Camila Silva Tapia",
    email: "camila.silva@cremeco.cl",
    telefono: "+56 9 8765 4321",
    rut: "18.432.198-7",
  };
  const entrega = orden?.entrega || {
    metodo: "despacho",
    direccion: "Av. Providencia 1234, Depto 402, Providencia, RM",
    indicaciones: "Dejar en conserjería.",
  };
  const items = orden?.items && orden.items.length > 0 ? orden.items : [
    {
      id: 1,
      nombre: "Torta Cuatro Leches Artesanal",
      precio: 28900,
      cantidad: 1,
      total: 28900,
    },
    {
      id: 2,
      nombre: "Cheesecake de Frutos Rojos",
      precio: 16500,
      cantidad: 1,
      total: 16500,
    },
  ];

  const totalFinal = orden?.totales?.total || urlTotal;
  const envio = orden?.totales?.envio ?? 8000;
  const subtotalNeto = orden?.totales?.neto ?? Math.round((totalFinal - envio) / 1.19);
  const iva = orden?.totales?.iva ?? (totalFinal - envio - subtotalNeto);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 py-6 print:m-0 print:max-w-full print:p-0">
      {/* Header de Exito */}
      <div className="flex flex-col items-center gap-3 text-center print:hidden">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-sm">
          <CheckCircle2 size={40} />
        </div>
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold text-tertiary sm:text-3xl">
            ¡Pago Aprobado y Confirmado!
          </h1>
          <p className="font-body text-sm text-ink/80">
            Tu transacción fue procesada con éxito por Flow (Webpay Plus). Te enviamos una copia a tu correo.
          </p>
        </div>
      </div>

      {/* Tarjeta de Boleta Electrónica */}
      <Card className="flex flex-col gap-6 p-6 sm:p-8 print:border-none print:shadow-none print:p-0">
        {/* Encabezado Boleta */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-tertiary/10 pb-4">
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-ink/60">
              Boleta Electrónica DSY1104
            </span>
            <span className="font-mono text-lg font-black text-tertiary">
              #{orderId}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
              <ShieldCheck size={14} />
              PAGADO (Webpay Plus)
            </span>
          </div>
        </div>

        {/* Datos Cliente y Entrega */}
        <div className="grid gap-4 rounded-xl border border-tertiary/10 bg-neutral/30 p-4 text-xs sm:grid-cols-2">
          <div className="space-y-1">
            <h4 className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-tertiary">
              <User size={13} className="text-secondary" />
              Datos del Comprador
            </h4>
            <p><strong>Cliente:</strong> {comprador.nombre}</p>
            <p><strong>RUT:</strong> {comprador.rut || "Sin registrar"}</p>
            <p><strong>Email:</strong> {comprador.email}</p>
            <p><strong>Teléfono:</strong> {comprador.telefono}</p>
          </div>

          <div className="space-y-1">
            <h4 className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-tertiary">
              <Truck size={13} className="text-secondary" />
              Entrega / Despacho
            </h4>
            <p><strong>Método:</strong> {entrega.metodo === "retiro" ? "Retiro en Tienda" : "Despacho a Domicilio"}</p>
            <p><strong>Destino:</strong> {entrega.direccion}</p>
            {entrega.indicaciones && (
              <p><strong>Indicaciones:</strong> {entrega.indicaciones}</p>
            )}
          </div>
        </div>

        {/* Tabla de Productos */}
        <div>
          <h3 className="mb-2 font-display text-sm font-bold text-tertiary">
            Detalle de Productos Comprados
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-tertiary/20 text-ink/70">
                <tr>
                  <th className="py-2">Producto</th>
                  <th className="py-2 text-center">Cant.</th>
                  <th className="py-2 text-right">Precio</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tertiary/10">
                {items.map((it) => (
                  <tr key={it.id}>
                    <td className="py-2.5 font-medium text-ink">{it.nombre}</td>
                    <td className="py-2.5 text-center">{it.cantidad}</td>
                    <td className="py-2.5 text-right">{formatPrecio(it.precio)}</td>
                    <td className="py-2.5 text-right font-bold text-tertiary">
                      {formatPrecio(it.total || it.precio * it.cantidad)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Desglose Tributario DSY1104 */}
        <div className="space-y-1.5 border-t border-tertiary/15 pt-3 text-xs">
          <div className="flex justify-between text-ink/75">
            <span>Subtotal Neto (Afecto a IVA):</span>
            <span className="font-semibold">{formatPrecio(subtotalNeto)}</span>
          </div>
          <div className="flex justify-between text-ink/75">
            <span>IVA (19% DSY1104):</span>
            <span className="font-semibold">{formatPrecio(iva)}</span>
          </div>
          <div className="flex justify-between text-ink/75">
            <span>Costo de Despacho / Entrega:</span>
            <span className="font-semibold">{envio === 0 ? "Gratis" : formatPrecio(envio)}</span>
          </div>
          <div className="flex justify-between border-t border-tertiary/20 pt-2 text-base font-bold">
            <span className="text-tertiary">Total Cancelado:</span>
            <span className="text-secondary">{formatPrecio(totalFinal)}</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-3 pt-2 print:hidden sm:flex-row">
          <Button
            type="button"
            onClick={handlePrint}
            variant="secondary"
            className="flex-1 gap-2"
          >
            <Printer size={16} />
            Imprimir comprobante
          </Button>

          <ButtonLink to="/perfil/seguimiento" variant="outline" className="flex-1 gap-2">
            <Truck size={16} />
            Seguir pedido
          </ButtonLink>

          <ButtonLink to="/catalogo" variant="outline" className="flex-1 gap-2">
            <ShoppingBag size={16} />
            Catálogo
          </ButtonLink>

          <ButtonLink to="/" variant="ghost" className="flex-1 gap-2">
            <Home size={16} />
            Inicio
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}
