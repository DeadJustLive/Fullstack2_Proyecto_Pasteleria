import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Copy, Minus, Plus, Share2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { useCart } from "@/context/cart";
import { BADGE_LABEL } from "@/data/products";
import { useRealtimeProducts } from "@/hooks/useRealtimeProducts";
import { api } from "@/services/api";
import { formatPrecio } from "@/lib/utils";
import type { Producto } from "@/types/product";

export function ProductoDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { agregar } = useCart();
  const { productos, cargando: cargandoCatalogo } = useRealtimeProducts();
  const [cantidad, setCantidad] = useState(1);
  const [compartirAbierto, setCompartirAbierto] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const productoEnLista = useMemo(
    () => productos.find((p) => p.id === Number(id)),
    [id, productos]
  );

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

    if (cargandoCatalogo) {
      return;
    }

    let isMounted = true;
    setCargandoDirecto(true);
    setBusquedaDirectaTerminada(false);

    api.catalog
      .getProductById(numId)
      .then((remoto) => {
        if (isMounted) {
          setProductoAsync(remoto);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProductoAsync(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setCargandoDirecto(false);
          setBusquedaDirectaTerminada(true);
        }
      });

    return () => {
      isMounted = false;
    };
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
        <p className="font-body text-ink/70">
          El producto que buscas no existe o fue removido del catálogo.
        </p>
        <ButtonLink to="/catalogo">Volver al catálogo</ButtonLink>
      </div>
    );
  }

  const urlActual = typeof window !== "undefined" ? window.location.href : "";

  const compartirNativo = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: producto.nombre,
          text: `Mira ${producto.nombre} en Crème & Co`,
          url: urlActual,
        });
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

  const agregarAlCarrito = () => {
    for (let i = 0; i < cantidad; i++) {
      agregar(producto);
    }
    navigate("/carrito");
  };

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <div className="relative overflow-hidden rounded-xl shadow-card">
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="h-80 w-full object-cover sm:h-96 lg:h-[500px]"
          />
          {producto.badge && (
            <span className="absolute left-4 top-4 rounded-full bg-primary/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-tertiary">
              {BADGE_LABEL[producto.badge]}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Link
              to="/catalogo"
              className="flex w-fit items-center gap-2 font-body text-sm text-secondary transition-colors hover:text-tertiary"
            >
              <ArrowLeft size={16} />
              Volver al catálogo
            </Link>
            <h1 className="text-tertiary">{producto.nombre}</h1>
            <p className="font-display text-2xl font-semibold text-secondary sm:text-3xl">
              {formatPrecio(producto.precio)}
            </p>
            <p className="font-body leading-relaxed text-ink/80">{producto.descripcion}</p>
          </div>

          <Card className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
              <span className="font-body font-semibold text-tertiary">Cantidad</span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                  aria-label="Disminuir cantidad"
                >
                  <Minus size={18} />
                </Button>
                <span className="w-12 text-center font-body text-lg font-semibold text-tertiary">
                  {cantidad}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCantidad((c) => c + 1)}
                  aria-label="Aumentar cantidad"
                >
                  <Plus size={18} />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={agregarAlCarrito}
                disabled={producto.disponible === false}
                className={producto.disponible === false ? "flex-1 cursor-not-allowed bg-ink/20 text-ink/50 hover:bg-ink/20" : "flex-1"}
              >
                <ShoppingCart size={18} />
                {producto.disponible === false ? "Producto Agotado" : "Agregar al carrito"}
              </Button>
              <Button variant="outline" onClick={compartirNativo} className="flex-1">
                <Share2 size={18} />
                Compartir
              </Button>
            </div>
          </Card>

          <div className="flex flex-col gap-3 rounded-lg bg-primary/20 p-4">
            <p className="font-body text-sm font-semibold text-tertiary">Información</p>
            <ul className="flex flex-col gap-1 font-body text-sm text-ink/80">
              <li>• Elaborado artesanalmente</li>
              <li>• Consulta disponibilidad al momento de comprar</li>
              <li>• Retiro en tienda o envío a domicilio</li>
            </ul>
          </div>
        </div>
      </div>

      {relacionados.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-tertiary">Productos relacionados</h2>
            <p className="font-body text-ink/70">También te puede interesar</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relacionados.map((p) => (
              <Card key={p.id} className="group overflow-hidden">
                <Link to={`/producto/${p.id}`} className="flex flex-col">
                  <div className="relative overflow-hidden">
                    <img
                      src={p.imagen}
                      alt={p.nombre}
                      className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col gap-2 p-4">
                    <h3 className="font-display text-lg font-semibold text-tertiary">{p.nombre}</h3>
                    <p className="font-display text-lg font-semibold text-secondary">
                      {formatPrecio(p.precio)}
                    </p>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      )}

      <Modal abierto={compartirAbierto} onCerrar={() => setCompartirAbierto(false)} titulo="Compartir producto">
        <div className="flex flex-col gap-4">
          <p className="font-body text-sm text-ink/80">
            Copia el enlace para compartir este producto con tus amigos y familiares.
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-tertiary/20 bg-neutral/50 p-3">
            <p className="flex-1 truncate font-body text-sm text-ink">{urlActual}</p>
            <Button size="sm" onClick={copiarLink} className="shrink-0">
              {copiado ? (
                <>
                  <Check size={16} />
                  Copiado
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copiar
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
