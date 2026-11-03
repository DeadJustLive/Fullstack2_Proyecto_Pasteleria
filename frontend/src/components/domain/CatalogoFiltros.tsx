// @pca:start
// @id(frontend.domain.catalogoFiltros)
// @kind(component)
// @limit(lines: 160)
// @contract(CatalogoFiltros(props: CatalogoFiltrosProps))
// @relates(docs.reglas_ui)
// @desc(Panel lateral y drawer responsivo de filtros para el catalogo)
// @pca:end
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FiltroCheckbox } from "@/components/domain/FiltroCheckbox";
import { cn, formatPrecio } from "@/lib/utils";
import { CATEGORIAS, PRECIO_MAX, VARIACIONES } from "@/data/products";

export interface CatalogoFiltrosProps {
  abierto: boolean;
  onCerrar: () => void;
  busqueda: string;
  onBusquedaChange: (val: string) => void;
  categorias: string[];
  onToggleCategoria: (val: string) => void;
  variaciones: string[];
  onToggleVariacion: (val: string) => void;
  precioMax: number;
  onPrecioMaxChange: (val: number) => void;
  onAplicar: () => void;
  onLimpiar: () => void;
}

export function CatalogoFiltros({
  abierto,
  onCerrar,
  busqueda,
  onBusquedaChange,
  categorias,
  onToggleCategoria,
  variaciones,
  onToggleVariacion,
  precioMax,
  onPrecioMaxChange,
  onAplicar,
  onLimpiar,
}: CatalogoFiltrosProps) {
  return (
    <>
      {abierto && (
        <div
          className="fixed inset-0 z-40 bg-inverted/50 lg:hidden"
          onClick={onCerrar}
          aria-hidden="true"
        />
      )}

      <aside
        id="filtros-panel"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[300px] max-w-[85vw] flex-col gap-7 overflow-y-auto bg-white p-6 shadow-xl transition-transform duration-300",
          abierto ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:z-auto lg:w-auto lg:max-w-none lg:translate-x-0 lg:overflow-visible lg:rounded-xl lg:border lg:border-tertiary/10 lg:bg-white/95 lg:shadow-card"
        )}
      >
        <div className="flex items-center justify-between lg:hidden">
          <h3 className="font-display text-lg font-semibold text-tertiary">Filtros</h3>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar filtros"
            className="inline-flex items-center justify-center rounded-full p-2 text-tertiary transition-colors hover:bg-primary"
          >
            <X size={22} />
          </button>
        </div>

        <Input
          label="Buscar producto"
          placeholder="Ej: Torta, Cheesecake..."
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
        />

        <FiltroCheckbox
          titulo="Categorías"
          opciones={CATEGORIAS}
          seleccionadas={categorias}
          onToggle={onToggleCategoria}
        />

        <FiltroCheckbox
          titulo="Variaciones"
          opciones={VARIACIONES}
          seleccionadas={variaciones}
          onToggle={onToggleVariacion}
        />

        <div className="flex flex-col gap-3">
          <h3 className="font-display text-base font-semibold text-tertiary">Rango de precio</h3>
          <div className="flex items-center gap-2">
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-xs font-body text-ink/70">Mínimo</span>
              <input
                type="number"
                min={0}
                max={precioMax}
                value={0}
                readOnly
                className="w-full rounded-lg border border-tertiary/20 bg-neutral/50 px-3 py-2 font-body text-sm text-ink/70 focus:outline-none"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-xs font-body text-ink/70">Máximo</span>
              <input
                type="number"
                min={0}
                max={PRECIO_MAX}
                value={precioMax}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= 0 && val <= PRECIO_MAX) onPrecioMaxChange(val);
                }}
                className="w-full rounded-lg border border-tertiary/20 px-3 py-2 font-body text-sm text-tertiary focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
              />
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={PRECIO_MAX}
            value={precioMax}
            onChange={(e) => onPrecioMaxChange(Number(e.target.value))}
            className="w-full cursor-pointer accent-secondary"
            style={{ accentColor: "var(--color-secondary)" }}
          />
          <div className="flex justify-between font-body text-xs text-ink/70">
            <span>{formatPrecio(0)}</span>
            <span>{formatPrecio(PRECIO_MAX)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={onAplicar} className="w-full">Confirmar Filtros</Button>
          <Button variant="outline" onClick={onLimpiar} className="w-full">Borrar Filtros</Button>
        </div>
      </aside>
    </>
  );
}
