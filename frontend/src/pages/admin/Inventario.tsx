import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Package,
  Pencil,
  Plus,
  Trash2,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { EstadoBadge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PillFiltro } from "@/components/ui/PillFiltro";
import { Toast, type ToastTono } from "@/components/ui/Toast";
import { FormularioProducto } from "@/components/admin/inventario/FormularioProducto";
import {
  CATEGORIAS_INVENTARIO,
  ESTADO_STOCK,
  LABEL_CATEGORIA_INVENTARIO,
} from "@/data/inventario";
import {
  estadoStock,
  guardarInventario,
  nuevoIdInventario,
  obtenerInventario,
} from "@/lib/inventario";
import { formatPrecio } from "@/lib/utils";
import type {
  CategoriaInventario,
  DatosProducto,
  ItemInventario,
} from "@/types/inventario";

type FiltroCategoria = CategoriaInventario | "todas";

interface Aviso {
  mensaje: string;
  tono: ToastTono;
}

const TH_CLASES =
  "px-4 py-3 font-body text-xs font-bold uppercase tracking-wide text-secondary";

const ACTION_BTN =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

export function Inventario() {
  const [items, setItems] = useState<ItemInventario[]>(() => obtenerInventario());
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroCategoria>("todas");
  const [modal, setModal] = useState<"crear" | "editar" | null>(null);
  const [editando, setEditando] = useState<ItemInventario | null>(null);
  const [eliminando, setEliminando] = useState<ItemInventario | null>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return items.filter((item) => {
      const coincideCategoria = filtro === "todas" || item.categoria === filtro;
      const coincideTexto =
        !texto ||
        item.nombre.toLowerCase().includes(texto) ||
        LABEL_CATEGORIA_INVENTARIO[item.categoria]
          .toLowerCase()
          .includes(texto);

      return coincideCategoria && coincideTexto;
    });
  }, [items, busqueda, filtro]);

  const disponibles = items.filter(
    (item) => estadoStock(item.stock) === "disponible"
  ).length;
  const stockBajo = items.filter(
    (item) => estadoStock(item.stock) === "bajo"
  ).length;
  const agotados = items.filter(
    (item) => estadoStock(item.stock) === "agotado"
  ).length;

  const contar = (categoria: FiltroCategoria) =>
    categoria === "todas"
      ? items.length
      : items.filter((item) => item.categoria === categoria).length;

  const persistir = (siguientes: ItemInventario[]) => {
    setItems(siguientes);
    guardarInventario(siguientes);
  };

  const abrirCrear = () => {
    setEditando(null);
    setModal("crear");
  };

  const abrirEditar = (item: ItemInventario) => {
    setEditando(item);
    setModal("editar");
  };

  const cerrarFormulario = () => {
    setModal(null);
    setEditando(null);
  };

  const guardar = (datos: DatosProducto) => {
    if (editando) {
      persistir(
        items.map((item) =>
          item.id === editando.id ? { ...item, ...datos } : item
        )
      );
      setAviso({
        mensaje: `"${datos.nombre}" actualizado correctamente.`,
        tono: "success",
      });
    } else {
      const nuevo: ItemInventario = {
        id: nuevoIdInventario(items),
        ...datos,
      };
      persistir([nuevo, ...items]);
      setAviso({
        mensaje: `"${datos.nombre}" agregado al inventario.`,
        tono: "success",
      });
    }

    cerrarFormulario();
  };

  const confirmarEliminar = () => {
    if (!eliminando) return;

    persistir(items.filter((item) => item.id !== eliminando.id));
    setAviso({
      mensaje: `"${eliminando.nombre}" eliminado del inventario.`,
      tono: "success",
    });
    setEliminando(null);
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltro("todas");
  };

  const hayFiltros = busqueda.trim() !== "" || filtro !== "todas";

  return (
    <div className="pb-10">
      <div className="mb-6 mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-tertiary">
            Gestión de Inventario
          </h1>
          <p className="font-body text-ink/70">
            Controla el stock, los precios y la disponibilidad de tus productos.
          </p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus size={18} aria-hidden="true" />
          Añadir producto
        </Button>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card padding="sm" className="flex items-center justify-between gap-3">
          <div>
            <p className="font-body text-xs font-bold uppercase tracking-wide text-secondary">
              Productos
            </p>
            <p className="font-display text-2xl font-bold text-tertiary">
              {items.length}
            </p>
          </div>
          <Package size={22} className="text-tertiary/40" aria-hidden="true" />
        </Card>
        <Card padding="sm" className="flex items-center justify-between gap-3">
          <div>
            <p className="font-body text-xs font-bold uppercase tracking-wide text-secondary">
              Disponibles
            </p>
            <p className="font-display text-2xl font-bold text-[#155724]">
              {disponibles}
            </p>
          </div>
          <CheckCircle2 size={22} className="text-[#155724]/50" aria-hidden="true" />
        </Card>
        <Card padding="sm" className="flex items-center justify-between gap-3">
          <div>
            <p className="font-body text-xs font-bold uppercase tracking-wide text-secondary">
              Stock bajo
            </p>
            <p className="font-display text-2xl font-bold text-[#856404]">
              {stockBajo}
            </p>
          </div>
          <TriangleAlert size={22} className="text-[#856404]/50" aria-hidden="true" />
        </Card>
        <Card padding="sm" className="flex items-center justify-between gap-3">
          <div>
            <p className="font-body text-xs font-bold uppercase tracking-wide text-secondary">
              Agotados
            </p>
            <p className="font-display text-2xl font-bold text-error">{agotados}</p>
          </div>
          <XCircle size={22} className="text-error/50" aria-hidden="true" />
        </Card>
      </div>

      <div className="mb-5 flex flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <PillFiltro
            active={filtro === "todas"}
            onClick={() => setFiltro("todas")}
          >
            Todas ({items.length})
          </PillFiltro>
          {CATEGORIAS_INVENTARIO.map(({ value, label }) => (
            <PillFiltro
              key={value}
              active={filtro === value}
              onClick={() => setFiltro(value)}
            >
              {label} ({contar(value)})
            </PillFiltro>
          ))}
        </div>

        <div className="sm:max-w-sm">
          <Input
            name="busqueda"
            type="search"
            aria-label="Buscar productos en inventario"
            placeholder="Buscar producto o categoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {visibles.length === 0 ? (
        <EmptyState
          titulo={
            items.length === 0
              ? "El inventario está vacío"
              : "No encontramos productos"
          }
          descripcion={
            items.length === 0
              ? "Agrega tu primer producto para empezar a controlar el stock."
              : "Prueba con otra categoría o con otra búsqueda."
          }
          accion={
            items.length === 0 ? (
              <Button onClick={abrirCrear}>
                <Plus size={18} aria-hidden="true" />
                Añadir producto
              </Button>
            ) : hayFiltros ? (
              <Button variant="outline" onClick={limpiarFiltros}>
                Limpiar filtros
              </Button>
            ) : undefined
          }
          className="py-16"
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <caption className="sr-only">Inventario de productos</caption>
              <thead className="bg-[#f8f5f1]">
                <tr>
                  <th className={TH_CLASES}>Producto</th>
                  <th className={TH_CLASES}>Categoría</th>
                  <th className={TH_CLASES}>Stock</th>
                  <th className={TH_CLASES}>Precio</th>
                  <th className={`${TH_CLASES} text-right`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((item) => {
                  const estado = estadoStock(item.stock);

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-tertiary/5 last:border-b-0 hover:bg-tertiary/5"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.imagen ? (
                            <img
                              src={item.imagen}
                              alt={item.nombre}
                              className="h-12 w-12 shrink-0 rounded object-cover"
                            />
                          ) : (
                            <span
                              aria-hidden="true"
                              className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-[#f1ede9] text-tertiary"
                            >
                              <Package size={20} />
                            </span>
                          )}
                          <span className="font-body font-semibold text-tertiary">
                            {item.nombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-body text-sm text-secondary">
                        {LABEL_CATEGORIA_INVENTARIO[item.categoria]}
                      </td>
                      <td className="px-4 py-3">
                        <EstadoBadge
                          tono={ESTADO_STOCK[estado].tono}
                          title={ESTADO_STOCK[estado].label}
                        >
                          {item.stock} uds
                        </EstadoBadge>
                      </td>
                      <td className="px-4 py-3 font-body font-semibold text-secondary">
                        {formatPrecio(item.precio)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => abrirEditar(item)}
                            title="Editar"
                            aria-label={`Editar ${item.nombre}`}
                            className={`${ACTION_BTN} border-secondary text-secondary hover:bg-secondary hover:text-white focus-visible:ring-secondary`}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEliminando(item)}
                            title="Eliminar"
                            aria-label={`Eliminar ${item.nombre}`}
                            className={`${ACTION_BTN} border-error text-error hover:bg-error hover:text-white focus-visible:ring-error`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        abierto={modal !== null}
        titulo={modal === "editar" ? "Editar producto" : "Añadir producto"}
        onCerrar={cerrarFormulario}
        size="lg"
      >
        {modal && (
          <FormularioProducto
            key={editando?.id ?? "nuevo"}
            item={editando}
            onGuardar={guardar}
            onCancelar={cerrarFormulario}
          />
        )}
      </Modal>

      <Modal
        abierto={eliminando !== null}
        titulo="Eliminar producto"
        onCerrar={() => setEliminando(null)}
        size="sm"
      >
        {eliminando && (
          <div className="flex flex-col gap-4">
            <p className="font-body text-ink/80">
              ¿Seguro que quieres eliminar{" "}
              <strong className="text-tertiary">{eliminando.nombre}</strong>? Esta
              acción no se puede deshacer.
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setEliminando(null)}>
                Cancelar
              </Button>
              <Button
                onClick={confirmarEliminar}
                className="bg-error text-white hover:bg-error/90 focus-visible:ring-error"
              >
                Eliminar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Toast
        mensaje={aviso?.mensaje ?? null}
        tono={aviso?.tono}
        onCerrar={() => setAviso(null)}
      />
    </div>
  );
}
