import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, SlidersHorizontal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CarouselBanner } from "@/components/domain/CarouselBanner";
import { CatalogoFiltros } from "@/components/domain/CatalogoFiltros";
import { ProductCard } from "@/components/domain/ProductCard";
import { CatalogHomeView } from "@/components/domain/CatalogHomeView";
import { CatalogDiscoveryView } from "@/features/CatalogDiscovery/implementation/CatalogDiscovery.view";
import { CATEGORIAS, PRECIO_MAX } from "@/data/products";
import { useRealtimeProducts } from "@/hooks/useRealtimeProducts";

export function Catalogo() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoriaParam = searchParams.get("categoria");
  const todosParam = searchParams.get("todos");
  const queryParam = searchParams.get("q");

  const esFaseExploracion = Boolean(categoriaParam || todosParam === "true" || queryParam);

  const { productos, cargando, error } = useRealtimeProducts();
  const [busqueda, setBusqueda] = useState(queryParam || "");
  const [categorias, setCategorias] = useState<string[]>(categoriaParam ? [categoriaParam] : []);
  const [variaciones, setVariaciones] = useState<string[]>([]);
  const [precioMax, setPrecioMax] = useState(PRECIO_MAX);
  const [filtros, setFiltros] = useState({
    busqueda: queryParam || "",
    categorias: categoriaParam ? [categoriaParam] : ([] as string[]),
    variaciones: [] as string[],
    precioMax: PRECIO_MAX,
  });
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  useEffect(() => {
    const cat = searchParams.get("categoria");
    const q = searchParams.get("q") || "";
    setCategorias(cat ? [cat] : []);
    setBusqueda(q);
    setFiltros((prev) => ({
      ...prev,
      categorias: cat ? [cat] : [],
      busqueda: q,
    }));
  }, [searchParams]);

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

  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of productos) {
      for (const c of p.categorias) {
        counts[c] = (counts[c] || 0) + 1;
      }
    }
    return counts;
  }, [productos]);

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

  const handleVolverACategorias = () => {
    limpiar();
    setSearchParams({});
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
        <div className="relative flex min-h-[280px] items-center justify-center px-3 py-6 sm:min-h-[320px] sm:px-5 sm:py-7 lg:min-h-[360px] lg:px-6 lg:py-8">
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

      {/* Fase 1: Selección previa de categoría si no hay filtro activo en URL */}
      {!esFaseExploracion ? (
        <CatalogHomeView
          onSelectCategory={(slug) => setSearchParams({ categoria: slug })}
          onViewAll={() => setSearchParams({ todos: "true" })}
          onSearch={(query) => setSearchParams({ q: query })}
          countsByCategory={countsByCategory}
          totalProducts={productos.length}
        />
      ) : (
        /* Fase 2: Catálogo con filtros y grilla de productos */
        <div>
          {/* Barra de Retorno a Categorías */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b border-tertiary/10 pb-4">
            <button
              type="button"
              onClick={handleVolverACategorias}
              className="inline-flex items-center gap-2 rounded-full border border-tertiary/20 bg-white px-4 py-1.5 font-body text-xs font-semibold text-tertiary transition-colors hover:bg-neutral hover:text-secondary"
            >
              <ArrowLeft size={15} />
              Volver a todas las categorías
            </button>
            <span className="inline-flex items-center gap-1.5 font-body text-xs text-ink/75">
              <Sparkles size={14} className="text-secondary" />
              {categoriaParam
                ? `Categoría activa: ${CATEGORIAS.find((c) => c.value === categoriaParam)?.label || categoriaParam}`
                : queryParam
                  ? `Búsqueda: "${queryParam}"`
                  : "Explorando todo el catálogo"}
            </span>
          </div>

          <Button
            variant="outline"
            onClick={() => setFiltrosAbiertos(true)}
            className="mt-6 w-full lg:hidden"
          >
            <SlidersHorizontal size={18} />
            Mostrar filtros
          </Button>

          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[250px_1fr]">
            <CatalogoFiltros
              abierto={filtrosAbiertos}
              onCerrar={() => setFiltrosAbiertos(false)}
              busqueda={busqueda}
              onBusquedaChange={setBusqueda}
              categorias={categorias}
              onToggleCategoria={toggleCategoria}
              variaciones={variaciones}
              onToggleVariacion={toggleVariacion}
              precioMax={precioMax}
              onPrecioMaxChange={setPrecioMax}
              onAplicar={aplicar}
              onLimpiar={limpiar}
            />

            <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] sm:gap-6">
              <div className="col-span-full">
                <CatalogDiscoveryView
                  totalProducts={filtrados.length}
                  activeCategory={filtros.categorias[0]}
                  searchQuery={filtros.busqueda}
                  onClearFilters={limpiar}
                />
              </div>

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
                <div className="col-span-full flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <p className="font-body text-ink/60">
                    No encontramos productos con esos filtros.
                  </p>
                  <Button variant="outline" size="sm" onClick={handleVolverACategorias}>
                    Volver a categorías
                  </Button>
                </div>
              ) : (
                filtrados.map((p) => (
                  <ProductCard key={p.id} producto={p} className="h-full" />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
