import { useMemo, useState } from "react";
import { Banknote, CheckCircle2, CreditCard, ShoppingCart, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilaTicket } from "@/components/admin/pos/FilaTicket";
import { PillCategoria } from "@/components/admin/pos/PillCategoria";
import { TarjetaProducto } from "@/components/admin/pos/TarjetaProducto";
import { CATEGORIAS, productos } from "@/data/products";
import { formatPrecio } from "@/lib/utils";
import type { ItemTicket } from "@/types/ticket";
import type { Producto } from "@/types/product";

export function Pos() {
  const [categoria, setCategoria] = useState("todos");
  const [ticket, setTicket] = useState<ItemTicket[]>([]);
  const [modal, setModal] = useState<"ticket" | "pago" | "exito" | null>(null);

  const visibles = useMemo(() => {
    if (categoria === "todos") return productos;
    return productos.filter((p) => p.categorias.some((c) => c === categoria));
  }, [categoria]);

  const cantidadTotal = ticket.reduce((acc, i) => acc + i.cantidad, 0);
  const subtotal = ticket.reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0);

  function agregar(producto: Producto) {
    setTicket((prev) => {
      const existente = prev.find((i) => i.producto.id === producto.id);
      if (existente) {
        return prev.map((i) =>
          i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  }

  function cambiarCantidad(productoId: number, delta: number) {
    setTicket((prev) =>
      prev
        .map((i) => (i.producto.id === productoId ? { ...i, cantidad: i.cantidad + delta } : i))
        .filter((i) => i.cantidad > 0)
    );
  }

  function nuevaVenta() {
    setTicket([]);
    setModal(null);
  }

  return (
    <div className="pb-24">
      <div className="mb-4 mt-2">
        <h1 className="font-display text-3xl font-bold text-tertiary">Punto de Venta</h1>
        <p className="font-body text-ink/70">Registra nuevas ventas rápidamente.</p>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <PillCategoria
          label="Todos"
          active={categoria === "todos"}
          onClick={() => setCategoria("todos")}
        />
        {CATEGORIAS.map((c) => (
          <PillCategoria
            key={c.value}
            label={c.label}
            active={categoria === c.value}
            onClick={() => setCategoria(c.value)}
          />
        ))}
      </div>

      {visibles.length === 0 ? (
        <p className="py-10 text-center font-body text-ink/60">No hay productos en esta categoría.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {visibles.map((p) => (
            <TarjetaProducto key={p.id} producto={p} onAgregar={agregar} />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setModal("ticket")}
        className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-6 py-3 font-body font-bold text-inverted shadow-lg transition-colors hover:bg-secondary hover:text-white"
      >
        <ShoppingCart size={20} />
        Ver Carrito
        <span className="rounded-full bg-error px-2 py-0.5 text-xs font-bold text-white">
          {cantidadTotal}
        </span>
      </button>

      <Modal abierto={modal === "ticket"} titulo="Ticket Actual" onCerrar={() => setModal(null)}>
        {ticket.length === 0 ? (
          <EmptyState titulo="El carrito está vacío." className="py-8" />
        ) : (
          <>
            {ticket.map((item) => (
              <FilaTicket key={item.producto.id} item={item} onCambiar={cambiarCantidad} />
            ))}
            <div className="mt-4 flex justify-between border-t border-tertiary/20 pt-2 font-body text-ink">
              <span>Subtotal</span>
              <span>{formatPrecio(subtotal)}</span>
            </div>
            <div className="flex justify-between font-body font-bold text-ink">
              <span>Total</span>
              <span>{formatPrecio(subtotal)}</span>
            </div>
            <Button onClick={() => setModal("pago")} disabled={ticket.length === 0} className="mt-4 w-full">
              COBRAR
            </Button>
          </>
        )}
      </Modal>

      <Modal abierto={modal === "pago"} titulo="Método de Pago" onCerrar={() => setModal(null)}>
        <div className="flex flex-col gap-3">
          <Button variant="outline" className="justify-center py-3" onClick={() => setModal("exito")}>
            <Banknote size={20} className="mr-2" />
            Efectivo
          </Button>
          <Button variant="outline" className="justify-center py-3" onClick={() => setModal("exito")}>
            <CreditCard size={20} className="mr-2" />
            Tarjeta / Débito
          </Button>
          <Button variant="outline" className="justify-center py-3" onClick={() => setModal("exito")}>
            <Smartphone size={20} className="mr-2" />
            Transferencia
          </Button>
        </div>
      </Modal>

      <Modal abierto={modal === "exito"} titulo="¡Venta Exitosa!" onCerrar={nuevaVenta}>
        <div className="flex flex-col items-center gap-4 py-4">
          <CheckCircle2 size={64} className="text-green-500" />
          <p className="font-body text-ink/70">El pago ha sido procesado correctamente.</p>
          <Button onClick={nuevaVenta} className="rounded-full px-6">
            Nueva Venta
          </Button>
        </div>
      </Modal>
    </div>
  );
}
