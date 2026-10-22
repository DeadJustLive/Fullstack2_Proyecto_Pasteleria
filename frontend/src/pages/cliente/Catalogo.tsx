import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/dev/Skeleton";
import { FiltroCheckbox } from "@/components/domain/FiltroCheckbox";
import { useCart } from "@/context/cart";
import { cn, formatPrecio } from "@/lib/utils";
import { CATEGORIAS, PRECIO_MAX, VARIACIONES, productos } from "@/data/products";

export function Catalogo() {
  const { agregar } = useCart();
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
    [filtros]
  );

  return (
    <>
      <section className="rounded bg-[url('/imagen/fondo_obrador.webp')] bg-cover bg-center">
        <div className="rounded bg-ink/85 px-6 py-14 text-center text-neutral">
          <span className="font-body text-sm font-bold uppercase tracking-widest text-primary">
            Pastelería Artesanal
          </span>
          <h1 className="text-neutral">Nuestro Catálogo</h1>
          <p className="mt-3 font-body text-neutral/90">
            Elige entre nuestras tortas, postres y opciones sin gluten, elaboradas a mano cada día.
          </p>
        </div>
      </section>

      <Button
        variant="outline"
        onClick={() => setFiltrosAbiertos(true)}
        className="mt-10 w-full lg:hidden"
      >
        <SlidersHorizontal size={18} />
        Filtros
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
            "lg:static lg:z-auto lg:w-auto lg:max-w-none lg:translate-x-0 lg:overflow-visible lg:rounded lg:border lg:border-tertiary/10 lg:shadow-sm"
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
            <h3 className="font-display text-base font-semibold text-tertiary">Precio Máximo</h3>
            <input
              type="range"
              min={0}
              max={PRECIO_MAX}
              value={precioMax}
              onChange={(e) => setPrecioMax(Number(e.target.value))}
              className="w-full accent-secondary"
            />
            <div className="flex justify-between font-body text-xs text-secondary">
              <span>$0</span>
              <span>{formatPrecio(precioMax)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={aplicar} className="w-full">Confirmar Filtros</Button>
            <Button variant="outline" onClick={limpiar} className="w-full">Borrar Filtros</Button>
          </div>
        </aside>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtrados.length === 0 ? (
            <p className="col-span-full py-10 text-center font-body text-ink/60">
              No encontramos productos con esos filtros.
            </p>
          ) : (
            filtrados.map((p) => (
              <div key={p.id} className="flex flex-col gap-2">
                <Skeleton elemento="ProductCard" responsable="Anais" className="h-80" />
                <Button variant="outline" size="sm" onClick={() => agregar(p)}>
                  Agregar al carrito
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
