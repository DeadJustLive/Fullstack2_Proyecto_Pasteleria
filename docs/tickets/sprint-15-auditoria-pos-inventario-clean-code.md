<!-- @pca:start
@id(docs.tickets.sprint15)
@kind(doc)
@limit(lines: 480)
@relates(docs.estado_proyecto, docs.convenciones, docs.tickets.readme)
@desc(Tickets T138 a T141 para correccion de persistencia POS/Inventario, extraccion de hook tiempo real, modularizacion de Pos.tsx y limpieza del grafo PCA)
@pca:end -->
# Sprint 15 — Auditoría Técnica: Persistencia Transaccional POS/Inventario, Modularización y Código Limpio

> **Fase:** F4 — Validación / Testing & Refactorización · **Sprint:** S15 · **Tickets:** T138–T141
> **Estado:** Completado (T138–T141 Hechos · T142 Diferido para F5) · **Última actualización:** 2026-11-04
> **Objetivo:** Resolver los 4 errores de integración detectados en la auditoría técnica (`registerPosSale` en backend, persistencia de ajustes/mermas y reseteo de estado en `Inventario.tsx`, homologación de tipos Kardex y recepción de eventos en `Pos.tsx`) y aplicar las 3 refactorizaciones de código limpio (`useAdminRealtimeSync`, extracción de `PosModals.tsx` y saneamiento del grafo PCA).

---

## Índice de Épicas y Tickets

| Épica | ID | Título | Capa Principal | Prioridad | Depende de | Estado |
| :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| **ÉPICA 1: Integración Transaccional POS** | [T138](#ticket-t138--persistencia-transaccional-de-ventas-pos-en-mysql-kardex-y-ordenes) | Persistencia transaccional de ventas POS en MySQL (`products`, `inventory_items`, `orders`, `kardex_movements`) | `backend/service-inventory/InventoryController.java` | **Alta** | T119, CORR-03 | **Hecho** |
| **ÉPICA 2: Integridad de Inventario y Kardex** | [T139](#ticket-t139--persistencia-de-entradasmermas-preservacion-de-select-y-tipos-kardex-en-inventario) | Persistencia de entradas/mermas, preservación de `<select>` durante polling y homologación de tipos Kardex | `admin-pwa/src/pages/Inventario.tsx`, `InventoryController.java` | **Alta** | T138 | **Hecho** |
| **ÉPICA 3: Modularización y DRY en Admin PWA** | [T140](#ticket-t140--extraccion-de-hook-useadminrealtimesync-y-desacoplamiento-de-posmodalstsx) | Extracción de `useAdminRealtimeSync` y desacoplamiento de `PosModals.tsx` | `admin-pwa/src/hooks/useAdminRealtimeSync.ts`, `PosModals.tsx`, `Pos.tsx`, `Dashboard.tsx`, `Reportes.tsx`, `Productos.tsx` | **Alta** | T138, T139 | **Hecho** |
| **ÉPICA 4: Gobernanza y Salud del Grafo PCA** | [T141](#ticket-t141--saneamiento-de-relaciones-huerfanas-y-validacion-del-grafo-pca) | Saneamiento de relaciones huérfanas `@relates` y validación 100% limpia en `pca_annotator.py check` | `tools/pca.config.json`, cabeceras `@pca` | **Media** | T140 | **Hecho** |
| **ÉPICA 5: Preparación de Entrega Académica (Diferido F5)** | [T142](#ticket-t142--herramienta-cli-en-fida-kit-para-purga-y-limpieza-total-de-anotaciones-fidapca-pre-entrega) | Herramienta CLI en `fida-kit` (`strip` / `clean-delivery`) para purgar anotaciones y artefactos FIDA/PCA antes de revisión o producción | `fida-kit/` | **Alta (En F5)** | T141 | **Diferido (Para Entrega)** |

---

## Detalle de Tickets (Plantilla Oficial PCA)

### Ticket T138 — Persistencia transaccional de ventas POS en MySQL, Kardex y Órdenes

#### Metadatos
- **Tipo:** `fix` / `feat`
- **Fase / Sprint:** F4 · Sprint 15
- **Rama sugerida:** `feature/T138-persistencia-transaccional-pos`
- **Prioridad:** Alta

#### Contexto & Análisis PCA
- **P (Por qué):** `Pos.tsx` envía `{ items: [{ id, nombre, cantidad, precio }], total, medioPago }` a `POST /api/inventory/pos/sale`, pero `InventoryController.registerPosSale` buscaba un campo plano `productoId` en la raíz del JSON. Como resultado, no se descontaba el stock en `products` ni en `inventory_items`, no se creaban movimientos Kardex por cada producto del ticket y la venta POS no se insertaba en `orders` (quedando invisible para Dashboard, Reportes y Órdenes & Boletas).
- **C (Cómo):**
  1. Inyectar `JdbcTemplate` en `InventoryController.java`.
  2. En `@PostMapping("/pos/sale")`, soportar el arreglo `items` (manteniendo retrocompatibilidad si se envía `productoId` unitario):
     - Por cada ítem del ticket: descontar `stock` y sumar `ventas_historicas` en `products`, descontar `stock_actual` y recalcular `estado_semaforo` en `inventory_items`, e insertar fila en `kardex_movements` con `tipo = 'VENTA_POS'` y el folio de boleta.
     - Insertar la transacción en `orders` (estado `ENTREGADO`, tipoEntrega `MOSTRADOR_POS`, cliente `Cliente Mostrador POS`, subtotal, iva 19%, total y metodoPago) y sus filas en `order_items`.
     - Invocar `POST /api/catalog/cache/evict` para limpiar el caché Redis del catálogo.
- **A (A qué afecta):** `backend/service-inventory/src/main/java/com/cremeco/inventory/controller/InventoryController.java`.

#### Convenciones aplicables
- `CONV-EST-01`, `CONV-ERR-01`, `CONV-NAM-05`

#### Alcance (Qué SÍ / Qué NO)
- **SÍ:** Procesamiento de múltiples ítems en `/pos/sale`, descuento real en MySQL, registro de orden POS e invalidación de caché.
- **NO:** Cambios en pasarelas de pago externas (Flow.cl).

#### Criterios de aceptación
- [x] Al confirmar una venta en `Pos.tsx`, el stock de cada producto vendido disminuye en MySQL (`products` e `inventory_items`) y persiste tras recargar la página (`F5`).
- [x] Se genera un movimiento `VENTA_POS` en `kardex_movements` por cada línea del ticket.
- [x] La venta POS queda registrada en `orders` y suma inmediatamente en los ingresos del Dashboard y Reportes.

#### Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/service-inventory/src/main/java/com/cremeco/inventory/controller/InventoryController.java` | controller | 250 |

#### Casos límite (Edge Cases)
- **Ticket con múltiples unidades de distintos productos:** Cada ítem debe procesarse individualmente sin dejar saldos negativos (`GREATEST(0, stock - ?)`).
- **Caché Redis inactivo:** El llamado HTTP a `/api/catalog/cache/evict` debe ejecutarse dentro de `try/catch` no bloqueante.

#### Definition of Done
- [x] Criterios de aceptación cumplidos.
- [x] `@limit(lines: 250)` respetado en `InventoryController.java`.
- [x] `docs/estado_proyecto.md` actualizado.

---

### Ticket T139 — Persistencia de entradas/mermas, preservación de `<select>` y tipos Kardex en Inventario

#### Metadatos
- **Tipo:** `fix`
- **Fase / Sprint:** F4 · Sprint 15
- **Rama sugerida:** `feature/T139-fix-inventario-mermas-kardex`
- **Prioridad:** Alta

#### Contexto & Análisis PCA
- **P (Por qué):**
  1. En `Inventario.tsx` (línea 77), cada vez que el polling de 5 segundos ejecuta `cargarInventario()`, la línea `if (adaptados[0]) setItemSeleccionado(adaptados[0].nombre)` sobreescribe el `<select>` del modal si el usuario estaba eligiendo otro producto.
  2. En `registrarAjuste`, al registrar una `SALIDA_MERMA` no se enviaba `productoId`, y al registrar una `ENTRADA` no se llamaba a `adminApi.inventory.registerRestock(...)`.
  3. Además, los movimientos devueltos por el backend (`INGRESO_COCINA`, `MERMA`, `VENTA_ONLINE`, `VENTA_POS`) no coincidían con las constantes literales de la vista (`ENTRADA`, `SALIDA_MERMA`), mostrando íconos y colores incorrectos.
- **C (Cómo):**
  1. En `Inventario.tsx`: inicializar `itemSeleccionado` con `setItemSeleccionado((prev) => prev || adaptados[0].nombre)`.
  2. En `registrarAjuste`: pasar `productoId: itemTarget.id` tanto a `registerMerma` como a `registerRestock` (cuando `tipoAjuste === "ENTRADA"`), sincronizando también `products.stock` en `InventoryController.java` y emitiendo `STOCK_UPDATED` por `BroadcastChannel`.
  3. Actualizar el renderizado de badges de la tabla Kardex para reconocer `ENTRADA`/`INGRESO_COCINA` (verde + `ArrowUp`), `SALIDA_MERMA`/`MERMA` (rojo + `ArrowDown`), `VENTA_ONLINE` y `VENTA_POS` (azul/primario + `ArrowDown`).
- **A (A qué afecta):** `admin-pwa/src/pages/Inventario.tsx`, `admin-pwa/src/services/api.ts`, `InventoryController.java`.

#### Convenciones aplicables
- `CONV-UI-01`, `CONV-TIP-01`, `CONV-ERR-01`

#### Alcance (Qué SÍ / Qué NO)
- **SÍ:** Corrección del reset del `<select>`, persistencia real de entradas y mermas en MySQL y badges Kardex fidedignos.
- **NO:** Alteración del diseño general de la página de inventario.

#### Criterios de aceptación
- [x] El `<select>` del modal "Registrar Ajuste o Merma" mantiene la opción elegida por el usuario aunque transcurran múltiples ciclos de sondeo de 5 segundos.
- [x] Registrar una `ENTRADA` o `SALIDA_MERMA` actualiza el stock real en MySQL y emite evento de sincronización.
- [x] Los movimientos `INGRESO_COCINA`, `MERMA`, `VENTA_ONLINE` y `VENTA_POS` se visualizan con el color e ícono de dirección correcto.

#### Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `admin-pwa/src/pages/Inventario.tsx` | page | 540 |
| `admin-pwa/src/services/api.ts` | service | 650 |

#### Casos límite (Edge Cases)
- **Ítem de inventario que es insumo puro (sin `productoId` en catálogo):** Debe actualizar `inventory_items` por su `id` propio si no tiene `productoId` asociado.

#### Definition of Done
- [x] Build de `admin-pwa` en código 0.
- [x] Límites de líneas respetados.
- [x] Error documentado en `docs/cicatrices_guerra.md`.

---

### Ticket T140 — Extracción de hook `useAdminRealtimeSync` y desacoplamiento de `PosModals.tsx`

#### Metadatos
- **Tipo:** `refactor`
- **Fase / Sprint:** F4 · Sprint 15
- **Rama sugerida:** `feature/T140-refactor-realtime-hook-pos-modals`
- **Prioridad:** Alta

#### Contexto & Análisis PCA
- **P (Por qué):**
  1. La lógica de sincronización en tiempo real (`BroadcastChannel("cremeco_products_realtime")` + `setInterval` con `document.visibilityState === "visible"` + `window.focus`) está duplicada en 4 páginas y faltaba como receptor en `Pos.tsx`.
  2. `Pos.tsx` se encuentra en 416 líneas de un límite de 420 (`@limit(lines: 420)`), dejando solo 4 líneas de margen debido a los dos modales embebidos (`ModalCobroEfectivo` y `ModalBoletaTermica`).
- **C (Cómo):**
  1. Crear `admin-pwa/src/hooks/useAdminRealtimeSync.ts` que exponga `useAdminRealtimeSync(onSync, intervalMs)` y `broadcastAdminSync(payload)`.
  2. Reemplazar los bloques duplicados en `Dashboard.tsx`, `Reportes.tsx`, `Productos.tsx`, `Inventario.tsx` e integrarlo en `Pos.tsx`.
  3. Extraer los modales de cobro en efectivo y boleta térmica de `Pos.tsx` hacia `admin-pwa/src/components/PosModals.tsx`, reduciendo `Pos.tsx` a ~260 líneas.
- **A (A qué afecta):** `admin-pwa/src/hooks/useAdminRealtimeSync.ts`, `admin-pwa/src/components/PosModals.tsx`, `Pos.tsx`, `Dashboard.tsx`, `Reportes.tsx`, `Productos.tsx`, `Inventario.tsx`.

#### Convenciones aplicables
- `CONV-EST-01`, `CONV-TIP-01`, `CONV-GEN-04`

#### Alcance (Qué SÍ / Qué NO)
- **SÍ:** Centralización DRY del canal tiempo real y modularización de modales del POS.
- **NO:** Cambios funcionales o visuales en las pantallas.

#### Criterios de aceptación
- [x] `useAdminRealtimeSync` es utilizado por `Dashboard`, `Reportes`, `Productos`, `Inventario` y `Pos`.
- [x] `Pos.tsx` escucha actualizaciones en tiempo real cuando ocurre una venta en la tienda web.
- [x] `Pos.tsx` queda bajo las 290 líneas (muy por debajo de su límite de 420).

#### Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `admin-pwa/src/hooks/useAdminRealtimeSync.ts` | component | 90 |
| `admin-pwa/src/components/PosModals.tsx` | component | 220 |
| `admin-pwa/src/pages/Pos.tsx` | page | 420 |
| `admin-pwa/src/pages/Dashboard.tsx` | page | 450 |
| `admin-pwa/src/pages/Reportes.tsx` | page | 450 |
| `admin-pwa/src/pages/Productos.tsx` | page | 760 |
| `admin-pwa/src/pages/Inventario.tsx` | page | 540 |

#### Casos límite (Edge Cases)
- **Navegadores sin soporte de `BroadcastChannel`:** El hook debe envolver la suscripción en `try/catch` y mantener operativo el polling por visibilidad y foco.

#### Definition of Done
- [x] `npm --prefix admin-pwa run build` pasa con código 0.
- [x] Todos los archivos quedan holgadamente bajo su `@limit`.

---

### Ticket T141 — Saneamiento de relaciones huérfanas y validación del grafo PCA

#### Metadatos
- **Tipo:** `chore` / `docs`
- **Fase / Sprint:** F4 · Sprint 15
- **Rama sugerida:** `feature/T141-saneamiento-grafo-pca`
- **Prioridad:** Media

#### Contexto & Análisis PCA
- **P (Por qué):** El comando `python tools/pca_annotator.py check` reporta 8 relaciones rotas (FK huérfanas) hacia nodos que cambiaron de ID tras el aplanado de rutas o que no estaban registrados en `tools/pca.config.json`.
- **C (Cómo):**
  1. Registrar en `tools/pca.config.json` los nuevos módulos (`useAdminRealtimeSync`, `PosModals`) y alinear las etiquetas `@relates(...)` en los archivos señalados.
  2. Ejecutar `python tools/pca_annotator.py check` y `python tools/pca_annotator.py graph` hasta obtener **0 sobre límite, 0 relaciones rotas, 0 archivos sin anotación y 0 IDs duplicados**.
- **A (A qué afecta):** `tools/pca.config.json`, cabeceras `@pca` de los archivos con FK huérfana y `docs/grafo_impacto.md`.

#### Convenciones aplicables
- `CONV-DOC-01`, `CONV-DOC-05`

#### Alcance (Qué SÍ / Qué NO)
- **SÍ:** Sincronización de `tools/pca.config.json` y cabeceras `@pca`.
- **NO:** Cambios en lógica de negocio.

#### Criterios de aceptación
- [x] `python tools/pca_annotator.py check` reporta `Sobre límite: 0`, `Relaciones rotas: 0`, `Archivos sin anotación: 0`, `IDs duplicados: 0`.

#### Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `tools/pca.config.json` | config | 800 |
| `docs/estado_proyecto.md` | doc | 200 |

#### Casos límite (Edge Cases)
- **Inyección de bloques:** Verificar que los comentarios respeten el formato de cada lenguaje (`//` en TS/Java, `<!-- -->` en Markdown).

#### Definition of Done
- [x] Salida limpia en `python tools/pca_annotator.py check`.
- [x] `docs/estado_proyecto.md` y `docs/tickets/README.md` actualizados.

---

### Ticket T142 — Herramienta CLI en `fida-kit` para purga y limpieza total de anotaciones FIDA/PCA (Pre-Entrega)

> **NOTA IMPORTANTE:** Este ticket queda **diferido para el momento de cierre / envío a producción o revisión académica (F5)**. No debe ejecutarse durante el desarrollo activo.

#### Metadatos
- **Tipo:** `feat` / `chore`
- **Fase / Sprint:** F5 · Entrega / Cierre
- **Rama sugerida:** `feature/T142-fida-kit-strip-annotations`
- **Prioridad:** Alta (al momento de entregar)

#### Contexto & Análisis PCA
- **P (Por qué):** `fida-kit` y las anotaciones `@pca:start ... @pca:end` son herramientas de autoría propia para gobernanza durante el desarrollo. Al enviar el proyecto a revisión académica o producción, la presencia de estas cabeceras, manifiestos (`fida.config.json`, `fida.module.json`, `.snapshot.json`, `.fidaignore`) y carpetas de tooling (`fida-kit/`, `tools/`) puede perjudicar la evaluación o generar cuestionamientos sobre herramientas fuera del currículum estándar.
- **C (Cómo):**
  1. Incorporar un subcomando en `fida-kit` (ej. `python fida-kit/bin/fida.py strip --all` o script autónomo `fida_strip.py`) con modo `--dry-run` y modo `--apply`:
     - Escanear recursivamente todos los archivos de código y documentación (`.ts`, `.tsx`, `.java`, `.css`, `.html`, `.md`, `.yml`, `.sql`) eliminando de raíz los bloques `@pca:start ... @pca:end` (tanto en comentarios `//`, `/* */` como `<!-- -->`) sin dejar líneas en blanco huérfanas al inicio del archivo.
     - Opción `--purge-artifacts` para remover limpiamente `.snapshot.json`, `fida.module.json`, `fida.config.json`, `.fidaignore`, `tools/` y `fida-kit/` en la rama o copia de entrega final.
  2. Verificar que tras la limpieza, tanto `frontend`, `admin-pwa` como `backend` compilen y pasen sus suites de pruebas al 100%.
- **A (A qué afecta):** `fida-kit/` (creación del comando de limpieza).

#### Convenciones aplicables
- `CONV-SEG-02`, `CONV-GEN-02`

#### Alcance (Qué SÍ / Qué NO)
- **SÍ:** Creación del comando `strip` / `clean-delivery` dentro de `fida-kit` con soporte `--dry-run` y `--apply`.
- **NO:** Ejecutar la purga destructiva sobre la rama de trabajo actual antes de que el usuario ordene el empaquetado final de entrega.

#### Criterios de aceptación
- [ ] El comando `strip --dry-run` lista todos los archivos con bloques `@pca` y artefactos FIDA detectados sin modificarlos.
- [ ] El comando `strip --apply` remueve el 100% de las cabeceras `@pca:start ... @pca:end` en TS, TSX, Java, CSS y Markdown preservando intacto el código fuente y su codificación UTF-8.
- [ ] Opción para purgar directorios y manifiestos de gobernanza dejando el repositorio en estándar puro React + Spring Boot.

#### Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `fida-kit/` (módulo CLI `strip`) | tool | 300 |

#### Definition of Done
- [ ] Herramienta probada en modo `--dry-run` y verificada en rama aislada.
- [ ] Documentado su uso para el día de la entrega final.

