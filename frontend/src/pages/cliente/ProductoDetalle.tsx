import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CantidadStepper } from "@/components/ui/CantidadStepper";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ProductCard } from "@/components/domain/ProductCard";
import { useCart } from "@/context/cart";
import { BADGE_LABEL, CATEGORIAS, VARIACIONES, productos } from "@/data/products";
import { formatPrecio } from "@/lib/utils";
import type { Producto } from "@/types/product";

const etiquetaDe = (lista: { value: string; label: string }[], valor: string) =>
  lista.find((o) => o.value === valor)?.label ?? valor;

function Detalle({ producto }: { producto: Producto }) {
  const { agregar } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const [agregados, setAgregados] = useState(0);
  const [copiado, setCopiado] = useState(false);

  // Al pasar de un producto a otro (relacionados) se vuelve arriba.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [producto.id]);

  useEffect(() => {
    if (!copiado) return;
    const temporizador = setTimeout(() => setCopiado(false), 2000);
    return () => clearTimeout(temporizador);
  }, [copiado]);

  const handleAgregar = () => {
    // El carrito suma de a una unidad por accion; se repite segun la cantidad.
    for (let i = 0; i < cantidad; i++) agregar(producto);
    setAgregados(cantidad);
    setCantidad(1);
  };

  const handleCompartir = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiado(true);
    } catch {
      // El navegador bloqueo el portapapeles: no hay nada mas que hacer.
    }
  };

  const categoria = producto.categorias[0]
    ? etiquetaDe(CATEGORIAS, producto.categorias[0])
    : "Pastelería";

  const mismaCategoria = productos.filter(
    (p) => p.id !== producto.id && p.categorias.some((c) => producto.categorias.includes(c))
  );
  const otros = productos.filter(
    (p) => p.id !== producto.id && !mismaCategoria.includes(p)
  );
  const relacionados = [...mismaCategoria, ...otros].slice(0, 3);

  return (
    <>
      <Link
        to="/catalogo"
        className="mb-6 inline-block font-body text-sm font-semibold text-secondary hover:underline"
      >
        ← Volver al catálogo
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded border border-tertiary/10 bg-white shadow-sm">
          {producto.badge && (
            <Badge tipo={producto.badge}>{BADGE_LABEL[producto.badge]}</Badge>
          )}
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-4">
          <span className="font-body text-sm font-bold uppercase tracking-widest text-secondary">
            {categoria}
          </span>
          <h1>{producto.nombre}</h1>
          <p className="font-display text-3xl font-bold text-secondary">
            {formatPrecio(producto.precio)}
          </p>
          <p className="font-body text-ink/80">{producto.descripcion}</p>

          {producto.variaciones.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {producto.variaciones.map((v) => (
                <li
                  key={v}
                  className="rounded-full bg-primary/40 px-3 py-1 font-body text-xs font-bold uppercase tracking-wide text-tertiary"
                >
                  {etiquetaDe(VARIACIONES, v)}
                </li>
              ))}
            </ul>
          )}

          {producto.ingredientes && producto.ingredientes.length > 0 && (
            <div>
              <h3 className="mb-2">Ingredientes</h3>
              <ul className="list-inside list-disc font-body text-ink/80">
                {producto.ingredientes.map((ing) => (
                  <li key={ing}>{ing}</li>
                ))}
              </ul>
            </div>
          )}

          {producto.nota && (
            <p className="rounded border border-tertiary/10 bg-white p-3 font-body text-sm text-secondary">
              {producto.nota}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-4">
            <CantidadStepper
              valor={cantidad}
              onCambiar={(n) => setCantidad(Math.max(1, n))}
              editable
            />
            <Button onClick={handleAgregar} size="lg">
              Añadir al carrito
            </Button>
          </div>

          {agregados > 0 && (
            <p role="status" className="font-body text-sm font-semibold text-secondary">
              <Check size={16} className="mr-1 inline" aria-hidden="true" />
              Agregaste {agregados} {agregados === 1 ? "unidad" : "unidades"} al carrito.{" "}
              <Link to="/carrito" className="underline">
                Ver carrito
              </Link>
            </p>
          )}

          <div>
            <Button variant="outline" size="sm" onClick={handleCompartir}>
              <Share2 size={16} aria-hidden="true" />
              {copiado ? "¡Enlace copiado!" : "Compartir"}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <SectionTitle eyebrow="Para completar tu mesa dulce" titulo="También te puede gustar" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {relacionados.map((p) => (
            <ProductCard key={p.id} producto={p} />
          ))}
        </div>
      </div>
    </>
  );
}

export function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const producto = productos.find((p) => p.id === Number(id));

  if (!producto) {
    return (
      <EmptyState
        titulo="No encontramos este producto"
        descripcion="Puede que ya no esté disponible o que el enlace sea incorrecto."
        accion={<Button onClick={() => navigate("/catalogo")}>Ir al catálogo</Button>}
        className="py-20"
      />
    );
  }

  // key: al cambiar de producto se reinicia el estado (cantidad, avisos).
  return <Detalle key={producto.id} producto={producto} />;
}
