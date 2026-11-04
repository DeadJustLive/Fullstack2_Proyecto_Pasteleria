<!-- @pca:start
@id(docs.tickets.sprint12)
@kind(doc)
@limit(lines: 480)
@relates(docs.estado_proyecto)
@relates(docs.convenciones)
@relates(docs.tickets.readme)
@desc(Tickets T124 a T127 para cohesion E2E de flujos del cliente en frontend: tracking real en Checkout, CantidadStepper en ProductoDetalle, reactividad en Ofertas y MiniCarrito interactivo sin CSS legacy)
@pca:end -->
# Sprint 12 — Cohesión E2E de Flujos del Cliente y Unificación de Experiencia en Frontend

> **Fase:** F4 — Validación / Testing & Refinamiento UX · **Sprint:** S12 · **Tickets:** T124–T127
> **Estado:** Planificado / Pendiente de Aprobación · **Última actualización:** 2026-11-04
> **Objetivo:** Eliminar las fricciones e inconsistencias detectadas en los flujos de compra del cliente (`frontend/`), garantizando trazabilidad real del código de seguimiento entre Checkout y Backend, pre-llenado inteligente de sesión, control de stock unificado en detalle de producto y ofertas, y edición rápida en `MiniCarrito` libre de CSS legacy.

---

## Índice de Épicas y Tickets

| Épica | ID | Título | Capa Principal | Prioridad | Depende de | Estado |
| :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| **ÉPICA 1: Continuidad Checkout → Boleta → Seguimiento** | [T124](#ticket-t124--sincronización-e2e-del-trackingcode-real-y-pre-llenado-de-sesión-en-checkout) | Sincronización E2E del `trackingCode` real y pre-llenado de sesión en Checkout | `frontend/src/pages/Checkout.tsx`, `pago/Exito.tsx`, `Confirmacion.tsx` | **Alta** | T123 | **Pendiente** |
| **ÉPICA 2: Experiencia de Producto y Control de Stock** | [T125](#ticket-t125--unificación-de-productodetalletxs-con-cantidadstepper-tope-de-stock-y-feedback-sin-redirección) | Unificación de `ProductoDetalle.tsx` con `CantidadStepper`, tope de stock y feedback sin redirección | `frontend/src/pages/ProductoDetalle.tsx` | **Alta** | T123 | **Pendiente** |
| **ÉPICA 3: Reactividad en Ofertas** | [T126](#ticket-t126--reactividad-en-tiempo-real-y-unificación-de-productcard-en-ofertastsx) | Reactividad en tiempo real y unificación de `ProductCard` en `Ofertas.tsx` | `frontend/src/pages/Ofertas.tsx` | **Media** | T125 | **Pendiente** |
| **ÉPICA 4: MiniCarrito Interactivo y Limpieza de CSS Legacy** | [T127](#ticket-t127--controles-interactivos-en-minicarrito-y-desacoplamiento-de-mockupcss-en-navbarfooter) | Controles interactivos en `MiniCarrito` y desacoplamiento de `mockup.css` en Navbar/Footer | `frontend/src/components/domain/MiniCarrito.tsx`, `Navbar.tsx`, `Footer.tsx`, `main.tsx` | **Media** | T123 | **Pendiente** |

---

## Detalle de Tickets (Plantilla Oficial PCA)

### Ticket T124 — Sincronización E2E del `trackingCode` real y pre-llenado de sesión en Checkout

#### Metadatos
- **Tipo:** `fix` / `feat`
- **Fase / Sprint:** F4 · Sprint 12
- **Rama sugerida:** `feature/T124-checkout-tracking-real-autofill`
- **Prioridad:** Alta

#### Análisis PCA
- **P (Por qué):**
  1. En `Checkout.tsx`, se genera un código aleatorio local (`const orderCode = CC-${Math.floor(...)}`) y se guarda en `sessionStorage` (`cremeco_last_order`) **antes** de invocar `await api.orders.create(...)`. Cuando el microservicio `service-order` persiste la orden en MySQL y devuelve su propio `trackingCode` e `id`, `Checkout.tsx` ignora la respuesta. Como resultado, `PagoExito.tsx` muestra el código aleatorio local y, cuando el comprador pulsa en *"Seguir mi pedido"*, `PerfilSeguimiento.tsx` recibe `404 Not Found` porque ese código no coincide con el de la base de datos.
  2. Además, si el cliente ya inició sesión (`useAuth().usuario`), `Checkout.tsx` presenta todos los campos en blanco en vez de pre-rellenar los datos del usuario autenticado (nombre, apellidos, email, teléfono, RUT y dirección guardada), a diferencia de `Personalizacion.tsx`.
- **C (Cómo):**
  1. En `frontend/src/pages/Checkout.tsx`:
     - Agregar un `useEffect` que observe `useAuth().usuario` y pre-rellene automáticamente `nombre`, `apellidos`, `email`, `telefono`, `rut`, `calle`, `region` y `comuna` si el formulario aún está vacío.
     - Capturar la respuesta de `const createdOrder = await api.orders.create(...)`.
     - Extraer el identificador oficial (`const officialCode = createdOrder.trackingCode || String(createdOrder.id) || orderCode`).
     - Actualizar `ordenGuardada.orderId = officialCode` y persistir nuevamente en `sessionStorage.setItem("cremeco_last_order", JSON.stringify(ordenGuardada))` antes de redirigir a Flow, `/pago/exito` o `/confirmacion`.
  2. En `frontend/src/pages/pago/Exito.tsx` y `frontend/src/pages/Confirmacion.tsx`:
     - Asegurar que el enlace de seguimiento apunte directamente a `/perfil/seguimiento/${encodeURIComponent(orderId.replace("#", ""))}` para que `PerfilSeguimiento.tsx` cargue automáticamente el estado del pedido real.
- **A (A qué afecta):** `frontend/src/pages/Checkout.tsx`, `frontend/src/pages/pago/Exito.tsx`, `frontend/src/pages/Confirmacion.tsx`.

#### Convenciones aplicables
- `CONV-EST-01`, `CONV-TIP-01`, `CONV-ERR-01`, `CONV-UI-01`

#### Alcance (Qué SÍ / Qué NO)
- **SÍ:** Sincronización del `trackingCode` devuelto por el backend con `sessionStorage` y URLs de retorno, enlace directo al seguimiento del pedido y pre-llenado automático con los datos del usuario en sesión.
- **NO:** Cambios en el esquema de base de datos de `service-order`.

#### Criterios de aceptación
- [ ] Al crear una orden con el backend activo, el código mostrado en `/pago/exito` y `/confirmacion` coincide exactamente con el `trackingCode` persistido en MySQL.
- [ ] Al hacer clic en "Seguir pedido" desde la boleta de éxito, `PerfilSeguimiento.tsx` carga inmediatamente la orden real sin mostrar error de pedido no encontrado.
- [ ] Si el usuario inició sesión antes de ir a `/checkout`, sus datos personales se pre-cargan automáticamente en el formulario.
- [ ] Si el backend está offline (modo contingencia), se conserva el código fallback `CC-XXXX` sin romper el flujo.

#### Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `frontend/src/pages/Checkout.tsx` | page | 740 |
| `frontend/src/pages/pago/Exito.tsx` | page | 280 |
| `frontend/src/pages/Confirmacion.tsx` | page | 260 |

#### Casos límite (Edge Cases)
- **Usuario autenticado que ya empezó a escribir manualmente en Checkout:** El `useEffect` solo debe rellenar campos que estén vacíos (`""`) para no sobrescribir lo que el usuario haya editado.
- **Orden con `#` en el `trackingCode` (ej. `#CC-1024`):** Normalizar quitando el prefijo `#` al construir la URL `/perfil/seguimiento/:id`.

#### Definition of Done
- [ ] Criterios de aceptación verificados y cubiertos por test unitario/integración.
- [ ] `tsc -b && vite build` sin errores.
- [ ] `docs/estado_proyecto.md` actualizado.

---

### Ticket T125 — Unificación de `ProductoDetalle.tsx` con `CantidadStepper`, tope de stock y feedback sin redirección

#### Metadatos
- **Tipo:** `refactor` / `fix`
- **Fase / Sprint:** F4 · Sprint 12
- **Rama sugerida:** `feature/T125-producto-detalle-stepper-stock`
- **Prioridad:** Alta

#### Análisis PCA
- **P (Por qué):**
  1. En `ProductoDetalle.tsx`, el selector de cantidad usa dos botones manuales (`setCantidad(c => c + 1)`) sin límite máximo de stock y sin usar el componente del design system `CantidadStepper`. Un usuario puede seleccionar 30 unidades de un pastel que solo tiene 3 en stock.
  2. Al pulsar *"Agregar al carrito"*, ejecuta un bucle `for` llamando a `agregar(producto)` repetidas veces y fuerza `navigate("/carrito")`, expulsando al usuario de la página del producto en lugar de mostrar confirmación visual in-situ como hace `ProductCard.tsx`.
- **C (Cómo):**
  1. En `frontend/src/pages/ProductoDetalle.tsx`:
     - Reemplazar los botones manuales por `<CantidadStepper valor={cantidad} min={1} max={tieneStock ? producto.stock : undefined} onCambiar={setCantidad} editable />`.
     - Mostrar el stock disponible de la torta/producto (`Stock disponible: X unidades` o aviso ámbar cuando se alcanza el límite de stock, o badge rojo si `stock === 0` / `disponible === false`).
     - Reemplazar el bucle `for` y el `navigate("/carrito")` por `agregar(producto, cantidad)` y un estado temporal `agregadoFeedback` (`"¡Añadido al carrito!"` con icono `Check` durante 1.8s), manteniendo al usuario en la vista con el botón flotante de carrito visible por si desea ir a pagar.
- **A (A qué afecta):** `frontend/src/pages/ProductoDetalle.tsx`.

#### Convenciones aplicables
- `CONV-UI-02`, `CONV-UI-04`, `CONV-TIP-01`, `CONV-GEN-02`

#### Alcance (Qué SÍ / Qué NO)
- **SÍ:** Integración de `CantidadStepper` con `max={producto.stock}`, visualización de stock disponible, uso de `agregar(producto, cantidad)` y feedback visual sin redirección forzada.
- **NO:** Modificación del modal de compartir producto ni de la grilla de productos relacionados.

#### Criterios de aceptación
- [ ] El selector de cantidad en `/producto/:id` utiliza `CantidadStepper` (sin spinners nativos y con número centrado) y deshabilita el botón `+` al alcanzar `producto.stock`.
- [ ] Si el usuario ya tiene `M` unidades de ese producto en su carrito, el tope seleccionable respeta el stock restante o muestra aviso claro.
- [ ] Al hacer clic en "Agregar al carrito", se agregan las `N` unidades de una sola vez, el botón muestra `"¡Añadido al carrito!"` y el usuario permanece en la página sin ser redirigido forzosamente.

#### Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `frontend/src/pages/ProductoDetalle.tsx` | page | 300 |

#### Casos límite (Edge Cases)
- **Producto con `stock === 0` o `disponible === false`:** El `CantidadStepper` y el botón de agregar deben deshabilitarse mostrando `"Producto Agotado"`.
- **Cambio de producto desde la sección "Productos relacionados":** Reiniciar `cantidad` a `1` y `agregadoFeedback` a `false` cuando cambia el parámetro `id` de la URL.

#### Definition of Done
- [ ] Prueba automatizada para `ProductoDetalle` validando límite de stock y adición al carrito.
- [ ] `ProductoDetalle.tsx` dentro de `@limit(lines: 300)`.
- [ ] `docs/estado_proyecto.md` actualizado.

---

### Ticket T126 — Reactividad en tiempo real y unificación de `ProductCard` en `Ofertas.tsx`

#### Metadatos
- **Tipo:** `refactor` / `fix`
- **Fase / Sprint:** F4 · Sprint 12
- **Rama sugerida:** `feature/T126-ofertas-realtime-productcard`
- **Prioridad:** Media

#### Análisis PCA
- **P (Por qué):** `Ofertas.tsx` implementa un `useEffect` aislado con llamadas directas a `api.catalog.getOffers()` y construye tarjetas de producto a mano. Por ello, ignora el hook `useRealtimeProducts()` (no recibe eventos `AVAILABILITY_CHANGED` ni `STOCK_UPDATED` desde el Admin PWA) y permite agregar al carrito productos que fueron marcados como agotados.
- **C (Cómo):**
  1. En `frontend/src/pages/Ofertas.tsx`:
     - Consumir `const { productos, cargando } = useRealtimeProducts()`.
     - Filtrar con `useMemo` aquellos productos donde `p.enOferta === true || (typeof p.precioAnterior === "number" && p.precioAnterior > p.precio) || p.badge === "oferta"`.
     - Respetar `producto.disponible !== false && (producto.stock === undefined || producto.stock > 0)` en las tarjetas de oferta o delegar el renderizado a `ProductCard` / controles homologados con bloqueo de agotados.
     - Añadir botón rápido para copiar el cupón `CREME10` al portapapeles con confirmación visual (`"¡Cupón copiado!"`).
- **A (A qué afecta):** `frontend/src/pages/Ofertas.tsx`.

#### Convenciones aplicables
- `CONV-UI-01`, `CONV-UI-02`, `CONV-UI-04`, `CONV-TIP-01`

#### Alcance (Qué SÍ / Qué NO)
- **SÍ:** Conexión de `Ofertas.tsx` a `useRealtimeProducts`, bloqueo de productos agotados en tiempo real y botón interactivo de copiado de cupón `CREME10`.
- **NO:** Creación de nuevos endpoints en el backend.

#### Criterios de aceptación
- [ ] Si un administrador desactiva un producto en oferta o su stock llega a 0, `Ofertas.tsx` lo muestra como `"Agotado"` en tiempo real sin recargar la página.
- [ ] Hacer clic en el banner del cupón `CREME10` copia el código al portapapeles y muestra feedback visual.
- [ ] Reducción de código duplicado manteniendo `Ofertas.tsx` bajo `@limit(lines: 260)`.

#### Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `frontend/src/pages/Ofertas.tsx` | page | 260 |

#### Casos límite (Edge Cases)
- **Producto en oferta sin `precioAnterior` explícito:** Calcular precio de referencia de forma segura sin producir `NaN` ni porcentajes negativos.

#### Definition of Done
- [ ] Verificación de reactividad vía `BroadcastChannel` y build de producción limpio.
- [ ] `docs/estado_proyecto.md` actualizado.

---

### Ticket T127 — Controles interactivos en `MiniCarrito` y desacoplamiento de `mockup.css` en Navbar/Footer

#### Metadatos
- **Tipo:** `feat` / `refactor`
- **Fase / Sprint:** F4 · Sprint 12
- **Rama sugerida:** `feature/T127-minicarrito-interactivo-tailwind-layout`
- **Prioridad:** Media

#### Análisis PCA
- **P (Por qué):**
  1. El modal `MiniCarrito.tsx` (que se abre al pulsar "Carrito" en el `Navbar`) es estático: el usuario ve sus productos pero no puede ajustar cantidades ni quitar un ítem sin navegar primero a `/carrito`.
  2. Además, `main.tsx` todavía importa `@/mockup/mockup.css` globalmente porque `Navbar.tsx` (`header-inner`, `brand-group`, `brand-logo`) y `Footer.tsx` (`footer-inner`, `footer-col`) dependen de clases del snapshot antiguo (tickets pendientes T17/T19).
- **C (Cómo):**
  1. En `frontend/src/components/domain/MiniCarrito.tsx`:
     - Incorporar `<CantidadStepper variant="compact" valor={cantidad} min={1} max={producto.stock} onCambiar={(n) => cambiarCantidad(producto.id, n)} />` y un botón con icono `Trash2` para quitar un ítem directamente desde el modal.
  2. En `frontend/src/components/layout/Navbar.tsx` y `frontend/src/components/layout/Footer.tsx`:
     - Migrar las clases legacy (`header-inner`, `brand-group`, `brand-logo`, `brand`, `footer-inner`, `footer-bottom`) a clases utilitarias de Tailwind v4 usando los tokens oficiales de `@theme` (`bg-neutral`, `text-tertiary`, `border-tertiary/15`, etc.).
  3. En `frontend/src/main.tsx`:
     - Verificar que ninguna vista dependa de `@/mockup/mockup.css` y desvincular la hoja de estilos legacy del bundle principal.
- **A (A qué afecta):** `frontend/src/components/domain/MiniCarrito.tsx`, `frontend/src/components/layout/Navbar.tsx`, `frontend/src/components/layout/Footer.tsx`, `frontend/src/main.tsx`.

#### Convenciones aplicables
- `CONV-UI-03`, `CONV-UI-04`, `CONV-GEN-02`, `CONV-TIP-01`

#### Alcance (Qué SÍ / Qué NO)
- **SÍ:** Edición de cantidad y eliminación de ítems dentro de `MiniCarrito`, y migración de `Navbar` y `Footer` a Tailwind v4 puro.
- **NO:** Alteración de la identidad visual de marca (colores, tipografías y disposición se mantienen idénticos).

#### Criterios de aceptación
- [ ] Desde `MiniCarrito`, el usuario puede incrementar, disminuir o eliminar productos y ver el subtotal/total actualizarse al instante.
- [ ] Si el usuario vacía todos los productos desde `MiniCarrito`, se muestra el `EmptyState` con el botón "Explorar catálogo".
- [ ] `Navbar.tsx` y `Footer.tsx` se renderizan con paridad visual 1:1 en móvil y escritorio usando exclusivamente clases de Tailwind v4.
- [ ] Todos los tests de `layout.test.tsx` y la suite completa pasan en verde.

#### Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `frontend/src/components/domain/MiniCarrito.tsx` | component | 200 |
| `frontend/src/components/layout/Navbar.tsx` | component | 250 |
| `frontend/src/components/layout/Footer.tsx` | component | 150 |
| `frontend/src/main.tsx` | component | 200 |

#### Casos límite (Edge Cases)
- **Lista larga de productos en `MiniCarrito` en pantallas pequeñas:** La lista `<ul>` dentro del modal debe tener `max-h-[50vh] overflow-y-auto pr-1` para que los botones inferiores ("Ir a pagar" y "Ver carrito") siempre queden visibles en pantalla.

#### Definition of Done
- [ ] Pruebas unitarias en `layout.test.tsx` y nueva prueba de interacción en `MiniCarrito`.
- [ ] Build de producción verificado (`tsc -b && vite build`).
- [ ] `docs/estado_proyecto.md` actualizado.
