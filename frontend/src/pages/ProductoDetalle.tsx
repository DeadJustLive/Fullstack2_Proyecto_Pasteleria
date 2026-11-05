import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Copy, Heart, Leaf, Share2, ShoppingCart, Sparkles, Star, Truck } from "lucide-react";
import { CommentSection } from "@/components/domain/CommentSection";
import { ProductCard } from "@/components/domain/ProductCard";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CantidadStepper } from "@/components/ui/CantidadStepper";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { useCart } from "@/context/cart";
import { BADGE_LABEL } from "@/data/products";
import { useRealtimeProducts } from "@/hooks/useRealtimeProducts";
import { useSocialEngagement } from "@/hooks/useSocialEngagement";
import { api } from "@/services/api";
import { cn, formatPrecio } from "@/lib/utils";
import type { Producto } from "@/types/product";

const SELLOS = [
  { icon: Sparkles, titulo: "Horneado del Día", desc: "Frescura artesanal garantizada" },
  { icon: Leaf, titulo: "100% Natural", desc: "Sin premezclas ni conservantes" },
  { icon: Truck, titulo: "Entrega Segura", desc: "Retiro en local o cadena de frío" },
];

export function ProductoDetalle() {
  const { id } = useParams<{ id: string }>();
  const { agregar, items: itemsCarrito } = useCart();
  const { productos, cargando: cargandoCatalogo } = useRealtimeProducts();
  const [cantidad, setCantidad] = useState(1);
  const [agregadoFeedback, setAgregadoFeedback] = useState(false);
  const [compartirAbierto, setCompartirAbierto] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const targetKey = `product:${id || "0"}`;
  const { liked, likesCount, commentsCount, averageRating, toggleLike } = useSocialEngagement(targetKey);

  useEffect(() => {
    setCantidad(1);
    setAgregadoFeedback(false);
  }, [id]);

  useEffect(() => {
    if (!agregadoFeedback) return;
    const t = window.setTimeout(() => setAgregadoFeedback(false), 1800);
    return () => window.clearTimeout(t);
  }, [agregadoFeedback]);

  const productoEnLista = useMemo(() => productos.find((p) => p.id === Number(id)), [id, productos]);
  const [productoAsync, setProductoAsync] = useState<Producto | null>(null);
  const [cargandoDirecto, setCargandoDirecto] = useState(false);
  const [busquedaDirectaTerminada, setBusquedaDirectaTerminada] = useState(false);

  useEffect(() => {
    const numId = Number(id);
    if (!id || isNaN(numId) || numId <= 0) {
      setBusquedaDirectaTerminada(true);
      return;
    }
    if (productoEnLista) {
      setProductoAsync(null);
      setBusquedaDirectaTerminada(true);
      return;
    }
    if (cargandoCatalogo) return;

    let isMounted = true;
    setCargandoDirecto(true);
    setBusquedaDirectaTerminada(false);

    api.catalog
      .getProductById(numId)
      .then((remoto) => { if (isMounted) setProductoAsync(remoto); })
      .catch(() => { if (isMounted) setProductoAsync(null); })
      .finally(() => {
        if (isMounted) {
          setCargandoDirecto(false);
          setBusquedaDirectaTerminada(true);
        }
      });

    return () => { isMounted = false; };
  }, [id, productoEnLista, cargandoCatalogo]);

  const producto = productoEnLista || productoAsync;
  const estaCargando = !producto && (cargandoCatalogo || cargandoDirecto || !busquedaDirectaTerminada);

  const relacionados = useMemo(() => {
    if (!producto) return [];
    return productos
      .filter((p) => p.id !== producto.id && p.categorias.some((c) => producto.categorias.includes(c)))
      .slice(0, 3);
  }, [producto, productos]);

  if (estaCargando) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-tertiary/20 border-t-secondary" />
        <p className="font-body text-sm text-ink/70">Cargando producto...</p>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <h1 className="text-tertiary">Producto no encontrado</h1>
        <p className="font-body text-ink/70">El producto que buscas no existe o fue removido del catálogo.</p>
        <ButtonLink to="/catalogo">Volver al catálogo</ButtonLink>
      </div>
    );
  }

  const urlActual = typeof window !== "undefined" ? window.location.href : "";

  const compartirNativo = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: producto.nombre, text: `Mira ${producto.nombre} en Crème & Co`, url: urlActual });
      } catch {
        setCompartirAbierto(true);
      }
    } else {
      setCompartirAbierto(true);
    }
  };

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(urlActual);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  };

  const enCarrito = itemsCarrito.find((i) => i.producto.id === producto.id)?.cantidad ?? 0;
  const tieneStock = typeof producto.stock === "number" && producto.stock >= 0;
  const stockRestante = tieneStock ? Math.max(0, (producto.stock ?? 0) - enCarrito) : undefined;
  const agotado = producto.disponible === false || (tieneStock && (producto.stock ?? 0) <= 0);
  const sinStockParaAgregar = agotado || (stockRestante !== undefined && stockRestante <= 0);

  const agregarAlCarrito = () => {
    if (sinStockParaAgregar) return;
    agregar(producto, cantidad);
    setCantidad(1);
    setAgregadoFeedback(true);
  };

  return (
    <div className="flex flex-col gap-10 pb-12">
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1.08fr_1fr] lg:items-start lg:gap-10">
        <div className="relative overflow-hidden rounded-2xl border border-tertiary/10 bg-white shadow-md">
          <img src={producto.imagen} alt={producto.nombre} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/imagen/chocolate.jpg"; }} className="h-80 w-full object-cover sm:h-96 lg:h-[480px]" />
          {producto.badge && (
            <span className="absolute left-4 top-4 rounded-full bg-primary/95 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-tertiary shadow-sm">
              {BADGE_LABEL[producto.badge]}
            </span>
          )}
          <button
            type="button"
            onClick={toggleLike}
            aria-pressed={liked}
            aria-label="Guardar en favoritos"
            className={cn(
              "absolute right-4 top-4 inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 font-body text-xs font-bold shadow-md backdrop-blur-xs transition-all",
              liked ? "bg-red-600 text-white" : "bg-white/90 text-tertiary hover:bg-primary"
            )}
          >
            <Heart size={15} className={cn(liked && "fill-current")} />
            <span>{likesCount}</span>
          </button>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <Link to="/catalogo" className="flex w-fit items-center gap-2 font-body text-sm font-semibold text-secondary transition-colors hover:text-tertiary">
              <ArrowLeft size={16} /> Volver al catálogo
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={15} className={cn(s <= Math.round(averageRating) && "fill-current")} />
                ))}
              </div>
              <a href="#opiniones" className="font-body text-xs font-semibold text-secondary hover:underline">
                {averageRating.toFixed(1)} · {commentsCount} opiniones verificadas
              </a>
            </div>

            <h1 className="text-tertiary">{producto.nombre}</h1>
            <p className="font-display text-2xl font-bold text-secondary sm:text-3xl">{formatPrecio(producto.precio)}</p>
            <p className="font-body leading-relaxed text-ink/85">{producto.descripcion}</p>
          </div>

          <Card className="flex flex-col gap-4 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="font-body font-semibold text-tertiary">Cantidad</span>
                {tieneStock && (
                  <span className="font-body text-xs text-secondary/80">
                    {agotado ? "Sin stock disponible" : `Stock disponible: ${producto.stock} unidades`}
                  </span>
                )}
              </div>
              <CantidadStepper
                valor={cantidad}
                min={1}
                max={stockRestante !== undefined ? Math.max(1, stockRestante) : undefined}
                onCambiar={setCantidad}
                editable
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={agregarAlCarrito}
                disabled={sinStockParaAgregar}
                className={sinStockParaAgregar ? "flex-1 cursor-not-allowed bg-ink/20 text-ink/50 hover:bg-ink/20" : "flex-1"}
              >
                {agregadoFeedback ? <Check size={18} /> : <ShoppingCart size={18} />}
                {agotado ? "Producto Agotado" : sinStockParaAgregar ? "Máximo en carrito" : agregadoFeedback ? "¡Añadido al carrito!" : "Agregar al carrito"}
              </Button>
              <Button variant="outline" onClick={compartirNativo} className="sm:w-auto">
                <Share2 size={18} /> Compartir
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {SELLOS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.titulo} className="flex items-start gap-2.5 rounded-xl border border-tertiary/10 bg-white p-3.5 shadow-2xs">
                  <Icon size={18} className="mt-0.5 shrink-0 text-secondary" />
                  <div>
                    <p className="font-display text-xs font-bold text-tertiary">{s.titulo}</p>
                    <p className="font-body text-[11px] text-ink/70">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div id="opiniones" className="scroll-mt-24">
        <CommentSection
          targetKey={targetKey}
          allowRating
          titulo="Opiniones y Valoraciones del Producto"
          subtitulo="Conoce la experiencia de quienes ya probaron esta creación en Crème & Co."
        />
      </div>

      {relacionados.length > 0 && (
        <section className="flex flex-col gap-5">
          <div>
            <h2 className="text-left font-display text-2xl font-bold text-tertiary">Productos relacionados</h2>
            <p className="font-body text-sm text-ink/70">También te puede interesar de la misma especialidad</p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 sm:grid-cols-3 sm:gap-6">
            {relacionados.map((p) => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>
        </section>
      )}

      <Modal abierto={compartirAbierto} onCerrar={() => setCompartirAbierto(false)} titulo="Compartir producto">
        <div className="flex flex-col gap-4">
          <p className="font-body text-sm text-ink/80">Copia el enlace para compartir este producto:</p>
          <div className="flex items-center gap-2 rounded-lg border border-tertiary/20 bg-neutral/50 p-3">
            <p className="flex-1 truncate font-body text-sm text-ink">{urlActual}</p>
            <Button size="sm" onClick={copiarLink} className="shrink-0">
              {copiado ? <><Check size={16} /> Copiado</> : <><Copy size={16} /> Copiar</>}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
