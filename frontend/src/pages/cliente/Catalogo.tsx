import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CarouselBanner } from "@/components/domain/CarouselBanner";
import { FiltroCheckbox } from "@/components/domain/FiltroCheckbox";
import { ProductCard } from "@/components/domain/ProductCard";

import { cn, formatPrecio } from "@/lib/utils";
import { CATEGORIAS, PRECIO_MAX, VARIACIONES } from "@/data/products";
import { useRealtimeProducts } from "@/hooks/useRealtimeProducts";

export function Catalogo() {

  const { productos, cargando, error } = useRealtimeProducts();
  const [busqueda, setBusqueda] = useState("");
  const [categorias, setCategorias] = useState<string[]>([]);
  const [variaciones, setVariaciones] = useState<string[]>([]);
  const [precioMax, setPrecioMax] = useState(PRECIO_MAX);
  const [filtros, setFiltros] = useState({
    busqueda: "",
    categorias: [] as string[],
    variaciones: [] as string[],
    precioMax: PRECIO_MAX,
  });
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  useEffect(() => {
    if (!filtrosAbiertos) return;

    const manejarEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFiltrosAbiertos(false);
    };

    document.addEventListener("keydown", manejarEscape);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", manejarEscape);
      document.body.style.overflow = overflowPrevio;
    };
  }, [filtrosAbiertos]);

  const aplicar = () => {
    setFiltros({ busqueda, categorias, variaciones, precioMax });
    setFiltrosAbiertos(false);
  };

  const limpiar = () => {
    setBusqueda("");
    setCategorias([]);
    setVariaciones([]);
    setPrecioMax(PRECIO_MAX);
    setFiltros({ busqueda: "", categorias: [], variaciones: [], precioMax: PRECIO_MAX });
  };

  const toggleCategoria = (v: string) =>
    setCategorias((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  const toggleVariacion = (v: string) =>
    setVariaciones((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  const filtrados = useMemo(
    () =>
      productos.filter((p) => {
        const coincideBusqueda =
          filtros.busqueda === "" ||
          p.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase());
        const coincideCategoria =
          filtros.categorias.length === 0 ||
          p.categorias.some((c) => filtros.categorias.includes(c));
        const coincideVariacion =
          filtros.variaciones.length === 0 ||
          p.variaciones.some((v) => filtros.variaciones.includes(v));
        return (
          coincideBusqueda &&
          coincideCategoria &&
          coincideVariacion &&
          p.precio <= filtros.precioMax
        );
      }),
    [filtros, productos]
  );

  return (
    <>
      <section className="relative overflow-hidden rounded-xl bg-[url('/imagen/fondo_obrador.webp')] bg-cover bg-[center_25%]">
        <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/90 to-ink/80" />
        <div className="relative flex min-h-[320px] items-center justify-center px-3 py-6 sm:min-h-[360px] sm:px-5 sm:py-7 lg:min-h-[400px] lg:px-6 lg:py-8">
          <div className="relative mx-auto w-full max-w-[1100px]">
            {cargando && productos.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
              </div>
            ) : (
              <CarouselBanner productos={productos.filter((p) => p.destacado).slice(0, 6)} />
            )}
          </div>
        </div>
      </section>

      <Button
        variant="outline"
        onClick={() => setFiltrosAbiertos(true)}
        className="mt-8 w-full lg:hidden"
      >
        <SlidersHorizontal size={18} />
        Mostrar filtros
      </Button>

      {filtrosAbiertos && (
        <div
          className="fixed inset-0 z-40 bg-inverted/50 lg:hidden"
          onClick={() => setFiltrosAbiertos(false)}
          aria-hidden="true"
        />
      )}

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[250px_1fr]">
        <aside
          id="filtros-panel"
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[300px] max-w-[85vw] flex-col gap-7 overflow-y-auto bg-white p-6 shadow-xl transition-transform duration-300",
            filtrosAbiertos ? "translate-x-0" : "-translate-x-full",
            "lg:static lg:z-auto lg:w-auto lg:max-w-none lg:translate-x-0 lg:overflow-visible lg:rounded-xl lg:border lg:border-tertiary/10 lg:bg-white/95 lg:shadow-card"
          )}
        >
          <div className="flex items-center justify-between lg:hidden">
            <h3 className="font-display text-lg font-semibold text-tertiary">Filtros</h3>
            <button
              type="button"
              onClick={() => setFiltrosAbiertos(false)}
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
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <FiltroCheckbox
            titulo="Categorías"
            opciones={CATEGORIAS}
            seleccionadas={categorias}
            onToggle={toggleCategoria}
          />

          <FiltroCheckbox
            titulo="Variaciones"
            opciones={VARIACIONES}
            seleccionadas={variaciones}
            onToggle={toggleVariacion}
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
                    if (val >= 0 && val <= PRECIO_MAX) {
                      setPrecioMax(val);
                    }
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
              onChange={(e) => setPrecioMax(Number(e.target.value))}
              className="w-full cursor-pointer accent-secondary"
              style={{ accentColor: "var(--color-secondary)" }}
            />
            <div className="flex justify-between font-body text-xs text-ink/70">
              <span>{formatPrecio(0)}</span>
              <span>{formatPrecio(PRECIO_MAX)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={aplicar} className="w-full">Confirmar Filtros</Button>
            <Button variant="outline" onClick={limpiar} className="w-full">Borrar Filtros</Button>
          </div>
        </aside>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {error && productos.length > 0 && (
            <div className="col-span-full rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              Modo sin conexión: mostrando catálogo almacenado localmente.
            </div>
          )}

          {cargando && productos.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`cat-skeleton-${i}`}
                className="flex flex-col overflow-hidden rounded-xl border border-tertiary/10 bg-white shadow-[0_1px_3px_rgba(93,64,55,0.06)] animate-pulse"
              >
                <div className="aspect-square w-full bg-neutral/80" />
                <div className="flex flex-1 flex-col gap-3 p-[1.1rem]">
                  <div className="h-5 w-3/4 rounded bg-neutral/80" />
                  <div className="h-4 w-1/3 rounded bg-neutral/80" />
                  <div className="mt-auto h-9 w-full rounded-md bg-neutral/80" />
                </div>
              </div>
            ))
          ) : filtrados.length === 0 ? (
            <p className="col-span-full py-10 text-center font-body text-ink/60">
              No encontramos productos con esos filtros.
            </p>
          ) : (
            filtrados.map((p) => (
              <ProductCard
                key={p.id}
                producto={p}
                className="h-full"
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
