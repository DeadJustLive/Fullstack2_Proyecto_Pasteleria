import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Crown, Gift } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { PageHero } from "@/components/ui/PageHero";
import { ProductCard } from "@/components/domain/ProductCard";
import { PillEstadoPedido } from "@/components/domain/PillEstadoPedido";
import { useAuth, type Usuario } from "@/context/auth";
import { productos } from "@/data/products";
import { obtenerPedidos } from "@/lib/pedidos";
import { guardarStorage, leerStorage } from "@/lib/storage";
import { formatFecha, formatPrecio } from "@/lib/utils";

const PREFERENCIAS = ["Sin Gluten", "Vegano", "Amante del Chocolate Oscuro"];
const PEDIDOS_VISIBLES = 3;

interface DatosPerfil {
  telefono: string;
  direccion: string;
  preferencias: string[];
}

const PERFIL_INICIAL: DatosPerfil = { telefono: "", direccion: "", preferencias: [] };

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join("");
}

function PerfilContenido({ usuario }: { usuario: Usuario }) {
  // Un perfil por correo: asi dos cuentas en el mismo navegador no se mezclan.
  const claveStorage = `cremeco-perfil:${usuario.email}`;
  const [guardado, setGuardado] = useState<DatosPerfil>(() =>
    leerStorage(claveStorage, PERFIL_INICIAL)
  );
  const [telefono, setTelefono] = useState(guardado.telefono);
  const [direccion, setDireccion] = useState(guardado.direccion);
  const [preferencias, setPreferencias] = useState(guardado.preferencias);
  const [aviso, setAviso] = useState<"datos" | "prefs" | null>(null);
  const [verTodos, setVerTodos] = useState(false);
  const [pedidos] = useState(obtenerPedidos);

  useEffect(() => {
    if (!aviso) return;
    const temporizador = setTimeout(() => setAviso(null), 2500);
    return () => clearTimeout(temporizador);
  }, [aviso]);

  const persistir = (nuevo: DatosPerfil, cual: "datos" | "prefs") => {
    guardarStorage(claveStorage, nuevo);
    setGuardado(nuevo);
    setAviso(cual);
  };

  const handleDatos = (e: FormEvent) => {
    e.preventDefault();
    persistir({ ...guardado, telefono, direccion }, "datos");
  };

  const togglePreferencia = (pref: string) =>
    setPreferencias((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );

  const pedidosVisibles = verTodos ? pedidos : pedidos.slice(0, PEDIDOS_VISIBLES);

  // Recomendaciones: primero lo que aun no ha comprado.
  const comprados = new Set(pedidos.flatMap((p) => p.items.map((i) => i.producto.id)));
  const recomendados = [
    ...productos.filter((p) => !comprados.has(p.id)),
    ...productos.filter((p) => comprados.has(p.id)),
  ].slice(0, 4);

  return (
    <>
      <PageHero
        eyebrow="Mi cuenta"
        titulo="Mi Perfil"
        descripcion="Bienvenido de nuevo. Aquí puedes gestionar tus datos, preferencias y revisar tus dulces beneficios."
        className="mb-8 space-y-1"
      />

      <div className="grid gap-6 min-[900px]:grid-cols-[minmax(260px,340px)_1fr]">
        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 text-left">Mis datos</h2>
            <div className="mb-5 flex items-center gap-4">
              <div
                aria-hidden="true"
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-tertiary"
              >
                {iniciales(usuario.nombre)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-display font-semibold text-tertiary">
                  {usuario.nombre}
                </p>
                <p className="truncate font-body text-sm text-secondary">{usuario.email}</p>
              </div>
            </div>

            <form onSubmit={handleDatos} className="flex flex-col gap-4">
              <Input
                label="Teléfono"
                type="tel"
                placeholder="+56 9 1234 5678"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
              <Input
                label="Dirección principal"
                placeholder="Calle, número, comuna"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
              />
              <Button type="submit" className="w-full">
                Actualizar datos
              </Button>
              {aviso === "datos" && (
                <p role="status" className="font-body text-sm font-semibold text-secondary">
                  ¡Datos actualizados! ✓
                </p>
              )}
            </form>
          </Card>

          <Card>
            <h2 className="mb-4 text-left">Preferencias</h2>
            <ul className="flex flex-col gap-3">
              {PREFERENCIAS.map((pref) => (
                <li key={pref}>
                  <label className="flex cursor-pointer items-center gap-3 font-body text-ink">
                    <input
                      type="checkbox"
                      className="h-4 w-4 shrink-0 cursor-pointer p-0 accent-secondary"
                      checked={preferencias.includes(pref)}
                      onChange={() => togglePreferencia(pref)}
                    />
                    {pref}
                  </label>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => persistir({ ...guardado, preferencias }, "prefs")}
              >
                Guardar
              </Button>
              {aviso === "prefs" && (
                <span
                  role="status"
                  className="rounded-full bg-tertiary px-3 py-0.5 font-body text-sm font-bold text-primary"
                >
                  ¡Guardado! ✓
                </span>
              )}
            </div>
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col justify-between gap-2 rounded bg-primary p-5 text-tertiary">
              <div>
                <p className="flex items-center gap-1.5 font-body text-xs font-bold uppercase tracking-widest">
                  <Crown size={14} aria-hidden="true" /> Cliente Premium
                </p>
                <p className="font-display text-3xl font-bold">10% OFF</p>
              </div>
              <p className="font-body text-sm">
                Descuento activo de por vida en todos los pasteles artesanales.
              </p>
            </div>
            <div className="flex flex-col justify-between gap-2 rounded bg-tertiary p-5 text-neutral">
              <div>
                <p className="flex items-center gap-1.5 font-body text-xs font-bold uppercase tracking-widest text-primary">
                  <Gift size={14} aria-hidden="true" /> Promo especial
                </p>
                <p className="font-display text-xl font-semibold">Día del Cumpleaños</p>
              </div>
              <p className="font-body text-sm">
                Disfruta de un cupcake de cortesía en tu mes de cumpleaños.
              </p>
            </div>
          </div>

          <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-left">Historial reciente</h2>
              {pedidos.length > PEDIDOS_VISIBLES && (
                <button
                  type="button"
                  onClick={() => setVerTodos((v) => !v)}
                  className="font-body text-sm font-semibold text-secondary hover:underline"
                >
                  {verTodos ? "Ver menos" : "Ver todos"}
                </button>
              )}
            </div>

            {pedidos.length === 0 ? (
              <EmptyState titulo="Aún no tienes pedidos." className="py-6" />
            ) : (
              <ul>
                {pedidosVisibles.map((pedido) => {
                  const primero = pedido.items[0].producto;
                  const resto = pedido.items.length - 1;
                  return (
                    <li
                      key={pedido.id}
                      className="border-b border-dashed border-tertiary/20 py-3 first:pt-0 last:border-b-0 last:pb-0"
                    >
                      <Link
                        to={`/envio/${pedido.id}`}
                        className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded transition-colors hover:bg-neutral/60"
                      >
                        <img
                          src={primero.imagen}
                          alt={primero.nombre}
                          className="h-14 w-14 shrink-0 rounded-[10px] object-cover"
                        />
                        <div className="min-w-0 grow basis-44">
                          <p className="truncate font-display font-semibold text-tertiary">
                            {primero.nombre}
                            {resto > 0 && ` y ${resto} más`}
                          </p>
                          <p className="font-body text-sm text-secondary">
                            Pedido #{pedido.id} • {formatFecha(pedido.fecha)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <p className="font-body font-bold text-tertiary">
                            {formatPrecio(pedido.total)}
                          </p>
                          <PillEstadoPedido estado={pedido.estado} />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <div>
            <h2 className="mb-4 text-left">Recomendaciones para ti</h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-6">
              {recomendados.map((p) => (
                <ProductCard key={p.id} producto={p} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function Perfil() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  if (!usuario) {
    return (
      <EmptyState
        titulo="Inicia sesión para ver tu perfil"
        descripcion="Usa el ícono de perfil de la barra superior para iniciar sesión o registrarte."
        accion={<Button onClick={() => navigate("/catalogo")}>Explorar catálogo</Button>}
        className="py-20"
      />
    );
  }

  return <PerfilContenido key={usuario.email} usuario={usuario} />;
}
