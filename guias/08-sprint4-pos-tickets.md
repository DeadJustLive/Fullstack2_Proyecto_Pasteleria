# 📌 Sprint 4 — Punto de Venta (POS): Tablero de Tickets

Formato **PCA** = **P**or qué · **C**ómo · **A**fectación.
Cada ticket es una unidad de trabajo independiente y con un dueño de archivo (**sin solapamiento de archivos**).

Referencia de origen: `MockUpPasteleria/pages/admin/pos.html`, `js/pos-interactivity.js`, `css/admin-pos.css`.
Decisiones aprobadas: datos = `productos` (TS); carrito = `useState` local; iconos = `lucide-react`; moneda = `formatPrecio` (CLP); colores = tokens del design system.

---

## 🧱 POS-01 — Fundación (dueño: Matias)
**Por qué:** el POS reutiliza tipos y datos ya tipados, y necesita la dependencia de iconos antes de que el resto compile.
**Cómo:** instalar `lucide-react`; crear `src/types/ticket.ts` con el contrato `ItemTicket`.
**Afectación:** `package.json` (+ `lucide-react`); nuevo `src/types/ticket.ts`. No rompe nada existente.

```ts
// src/types/ticket.ts
import type { Producto } from "@/types/product";

export interface ItemTicket {
  producto: Producto;
  cantidad: number;
}
```

---

## 🪟 POS-02 — Primitivo `Modal` (dueño: Subagente A)
**Por qué:** el POS abre 3 modales (Ticket, Pago, Venta Exitosa). Un primitivo genérico evita triplicar overlay/teclado/foco.
**Cómo:** crear `src/components/ui/Modal.tsx` con overlay + panel, cierre por `Escape` y click en overlay, `role="dialog"`/`aria-modal`. Sin CVA (no tiene variantes).
**Afectación:** nuevo `src/components/ui/Modal.tsx`. Consumido por POS-05.

**Contrato:**
```ts
interface ModalProps {
  abierto: boolean;
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
}
```
- Si `abierto === false` → `return null`.
- Overlay: `fixed inset-0 z-50 flex items-center justify-center bg-inverted/60 p-4`.
- Panel: `relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded bg-white shadow-xl`.
- Header: `flex items-center justify-between border-b border-tertiary/10 bg-neutral px-5 py-4`; título `font-display text-lg font-semibold text-tertiary`; botón cerrar con icono `X` de `lucide-react`.
- Cuerpo: `flex-1 overflow-y-auto p-5`.
- `Escape` cierra (listener con `useEffect` activo solo cuando `abierto`).

---

## 🍰 POS-03 — `TarjetaProducto` (dueño: Subagente B)
**Por qué:** el POS se llena de tarjetas clicables; el mockup las genera por JS. En React es un componente por producto.
**Cómo:** crear `src/components/admin/pos/TarjetaProducto.tsx` que muestra foto, nombre y precio (`formatPrecio`) y agrega al ticket al hacer click.
**Afectación:** nuevo `src/components/admin/pos/TarjetaProducto.tsx`. Consumido por POS-05.

**Contrato:**
```ts
interface TarjetaProductoProps {
  producto: Producto;
  onAgregar: (producto: Producto) => void;
}
```
- Es un `<button type="button">` que ocupa todo el alto.
- Foto `aspect-square w-full object-cover`, nombre `line-clamp-1`, precio `font-body font-bold text-secondary`.

---

## 🧾 POS-04 — `FilaTicket` (dueño: Subagente C)
**Por qué:** cada línea del ticket tiene stepper `−/+`; el mockup la genera por JS.
**Cómo:** crear `src/components/admin/pos/FilaTicket.tsx` con nombre, precio c/u y controles `−/+` (iconos `Minus`/`Plus` de `lucide-react`) que avisan el delta al padre.
**Afectación:** nuevo `src/components/admin/pos/FilaTicket.tsx`. Consumido por POS-05.

**Contrato:**
```ts
interface FilaTicketProps {
  item: ItemTicket;
  onCambiar: (productoId: number, delta: number) => void;
}
```
- Nombre `font-body font-semibold text-secondary`; precio c/u `font-body text-sm text-secondary`.
- Botones `−`/`+` llaman `onCambiar(item.producto.id, -1 | 1)`.

---

## 🖥️ POS-05 — Página `Pos.tsx` (dueño: Subagente D · depende de POS-02/03/04)
**Por qué:** es la pantalla de caja rápida para ventas presenciales (tarea Sprint 4 de Matias).
**Cómo:** crear `src/pages/admin/Pos.tsx` con estado local y los 3 modales.
**Afectación:** nuevo `src/pages/admin/Pos.tsx`. Consumido por POS-06.

**Estado local:** `categoria` (`"todos"`), `ticket: ItemTicket[]`, `modal: "ticket" | "pago" | "exito" | null`.
**Derivados:** `visibles` según `categoria` (filtra por `producto.categorias.includes(...)`), `cantidadTotal`, `subtotal`.
**Layout:** título `Punto de Venta` + subtítulo; pills `Todos` + `CATEGORIAS`; grid `grid-cols-2 sm:grid-cols-3 xl:grid-cols-4` con `TarjetaProducto`; botón flotante `Ver Carrito (N)`.
**Modales:** Ticket (`FilaTicket` + Subtotal/Total + `COBRAR`), Método de Pago (Efectivo/Tarjeta/Transferencia), Venta Exitosa (`CheckCircle2` + Nueva Venta).
**Cobro simulado:** `COBRAR` → modal pago → método → modal éxito → "Nueva Venta" vacía el ticket.

---

## 🔗 POS-06 — Ruta y verificación (dueño: Matias)
**Por qué:** conectar la página a la navegación y validar.
**Cómo:** `src/App.tsx`: `admin/pos` pasa de `<Placeholder .../>` a `<Pos />`.
**Afectación:** `src/App.tsx`. Cierre con `npm run lint` + `npm run build` en 0 problemas.
