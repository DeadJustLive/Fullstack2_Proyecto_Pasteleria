<!-- @pca:start
@id(docs.tickets.sprint11)
@kind(doc)
@limit(lines: 480)
@relates(docs.estado_proyecto)
@relates(docs.convenciones)
@relates(docs.tickets.readme)
@desc(Tickets T119 a T122 para sincronizacion transaccional de stock web, reactividad tiempo real y eliminacion de datos mock en Dashboard y Reportes)
@pca:end -->
# Sprint 11 — Sincronización Real E2E de Stock, Descuento Transaccional y Métricas Vivas de Dashboard

> **Fase:** F4 — Validación / Testing & Entorno de Producción Docker · **Sprint:** S11 · **Tickets:** T119–T122
> **Estado:** Planificado / Pendiente de Aprobación · **Última actualización:** 2026-11-04
> **Objetivo:** Conectar el flujo completo de inventario y ventas para que el software funcione con datos 100% reales: descontar stock automáticamente tras cada venta web, sincronizar en tiempo real el inventario entre tienda cliente y Admin PWA, y erradicar todo dato mock cableado en Dashboard y Reportes.

---

## Índice de Épicas y Tickets

| Épica | ID | Título | Capa Principal | Prioridad | Depende de | Estado |
| :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| **ÉPICA 1: Ciclo de Stock Transaccional** | [T119](#ticket-t119--descuento-transaccional-de-stock-en-venta-web-y-kardex-backend) | Descuento transaccional de stock en venta web y Kardex backend | `backend/service-order`, `service-catalog`, `service-inventory`, `frontend/src/pages/Checkout.tsx` | **Alta** | T116, T118 | **Completado** |
| **ÉPICA 2: Reactividad y Sincronización en Tiempo Real** | [T120](#ticket-t120--reactividad-tiempo-real-de-stock-y-sondeo-activo-en-admin-pwa) | Reactividad tiempo real de stock y sondeo activo en Admin PWA | `admin-pwa/src/pages/Productos.tsx`, `Inventario.tsx`, `useRealtimeProducts.ts` | **Alta** | T119 | **Pendiente** |
| **ÉPICA 3: Métricas Vivas de Dashboard** | [T121](#ticket-t121--métricas-en-vivo-y-eliminación-de-datos-mock-en-dashboard) | Métricas en vivo y eliminación total de datos mock en Dashboard | `admin-pwa/src/pages/Dashboard.tsx`, `api.ts` | **Alta** | T119, T120 | **Pendiente** |
| **ÉPICA 4: Integridad Contable en Reportes** | [T122](#ticket-t122--desacoplamiento-de-mocks-en-reportes-y-consistencia-csv) | Desacoplamiento de mocks en Reportes y consistencia CSV contable | `admin-pwa/src/pages/Reportes.tsx` | **Media** | T121 | **Pendiente** |

---

## Detalle de Tickets (Plantilla Oficial PCA)

### Ticket T119 — Descuento transaccional de stock en venta web y Kardex backend

#### Metadatos
- **Tipo:** `feat` / `fix`
- **Fase / Sprint:** F4 · Sprint 11
- **Rama sugerida:** `feature/T119-descuento-stock-transaccional-web`
- **Prioridad:** Alta

#### Análisis PCA
- **P (Por qué):** Al comprar en la web (`Checkout.tsx`), se envía la orden a `POST /api/orders`, pero `OrderController` no descuenta unidades de la tabla `productos` de `service-catalog` ni registra salidas en `inventario_items` o `kardex_movements` de `service-inventory`. Esto genera stock infinito, no previene sobreventa y hace que el Admin nunca refleje las ventas online en el inventario.
- **C (Cómo):**
  1. En `frontend/src/pages/Checkout.tsx`: enviar `productoId` en el payload de cada ítem (`items: [{ productoId: i.producto.id, nombre, cantidad, precio }]`).
  2. En `backend/service-order/src/main/java/com/cremeco/order/controller/OrderController.java`:
     - Validar disponibilidad de stock antes de consolidar la orden. Si no hay suficiente stock, responder `HTTP 400 Bad Request` con código `STOCK_INSUFICIENTE`.
     - Actualizar el stock del producto (`stock = stock - cantidad`) y sumar a `ventasHistoricas`.
     - Registrar movimiento Kardex de salida tipo `VENTA_WEB` vinculado a la orden generada.
     - Invalidar la caché Redis `catalog::products` para que los catálogos cliente y admin lean el stock nuevo inmediatamente.
- **A (A qué afecta):** `frontend/src/pages/Checkout.tsx`, `frontend/src/services/api.ts`, `backend/service-order/src/main/java/com/cremeco/order/controller/OrderController.java`, `backend/service-order/src/main/java/com/cremeco/order/model/OrderItemEntity.java`, `backend/service-catalog/src/main/java/com/cremeco/catalog/service/CatalogService.java`, `backend/service-inventory/src/main/java/com/cremeco/inventory/controller/InventoryController.java`.

#### Convenciones aplicables
- `CONV-EST-01`, `CONV-TIP-01`, `CONV-ERR-01`, `CONV-SEG-01`

#### Alcance (Qué SÍ / Qué NO)
- **SÍ:** Descuento atómico de stock al crear una orden, registro en Kardex, envío de `productoId` desde el Checkout y refresco de caché Redis.
- **NO:** Modificación de las pantallas visuales del checkout cliente.

#### Criterios de aceptación
- [x] Al completar una compra web de 2 unidades de un producto con stock 10, su stock en catálogo se reduce automáticamente a 8.
- [x] En `service-inventory`, aparece un movimiento Kardex con tipo `VENTA_WEB` indicando la orden y la cantidad descontada.
- [x] Si un cliente intenta comprar una cantidad mayor al stock disponible en BD, la API retorna error controlado y la UI del checkout muestra el aviso sin cobrar.
- [x] La caché Redis no entrega datos viejos de stock tras una venta.

#### Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `frontend/src/pages/Checkout.tsx` | page | 700 |
| `backend/service-order/.../OrderController.java` | controller | 250 |
| `backend/service-order/.../OrderItemEntity.java` | entity | 100 |
| `backend/service-catalog/.../CatalogController.java` | controller | 300 |
| `backend/service-inventory/.../InventoryController.java` | controller | 250 |

#### Casos límite (Edge Cases)
- **Dos clientes compran el último producto en el mismo segundo:** La transacción debe fallar para el segundo con `STOCK_INSUFICIENTE`.
- **Venta de producto sin `productoId` (productos personalizados / tortas a medida):** Debe registrarse la orden sin descuento de catálogo pero con registro de ítems en orden.

#### Definition of Done
- [x] Descuento de stock probado mediante orden de prueba E2E.
- [x] Tests unitarios y de integración pasando (101 tests en verde).
- [x] Builds de `frontend` y `admin-pwa` validados en 0 errores.
- [x] `docs/estado_proyecto.md` actualizado.

---

### Ticket T120 — Reactividad tiempo real de stock y sondeo activo en Admin PWA

#### Metadatos
- **Tipo:** `feat` / `fix`
- **Fase / Sprint:** F4 · Sprint 11
- **Rama sugerida:** `feature/T120-reactividad-stock-admin-pwa`
- **Prioridad:** Alta

#### Análisis PCA
- **P (Por qué):** `Productos.tsx` e `Inventario.tsx` solo consultan la API una vez al montarse el componente. Si se vende un producto en la web, el admin nunca se entera salvo que recargue con F5. Además, el `BroadcastChannel` actual solo transmite `AVAILABILITY_CHANGED` (booleano), ignorando el stock.
- **C (Cómo):**
  1. En `admin-pwa/src/pages/Productos.tsx`:
     - Implementar refresco periódico (`setInterval` cada 5s cuando la pestaña esté activa y al recibir evento `focus`, idéntico al mecanismo de `Ordenes.tsx`).
     - Extender el listener del `BroadcastChannel("cremeco_products_realtime")` para manejar eventos `STOCK_UPDATED` y actualizar el stock en el estado de React en 0 ms si la tienda cliente y el admin están abiertos en el mismo navegador.
  2. En `admin-pwa/src/pages/Inventario.tsx`:
     - Agregar refresco periódico cada 5s para sincronizar `items` y `kardex` en vivo.
  3. Vincular dinámicamente la alerta `AdminCriticalStockView` en `Productos.tsx` para que refleje de inmediato cuando cualquier producto baja a `<= 5` unidades.
- **A (A qué afecta):** `admin-pwa/src/pages/Productos.tsx`, `admin-pwa/src/pages/Inventario.tsx`, `frontend/src/hooks/useRealtimeProducts.ts`.

#### Convenciones aplicables
- `CONV-UI-01`, `CONV-UI-04`, `CONV-TIP-01`

#### Alcance (Qué SÍ / Qué NO)
- **SÍ:** Sondeo inteligente cada 5s, soporte de `STOCK_UPDATED` en `BroadcastChannel`, reactividad inmediata del semáforo y del monitor de stock crítico.
- **NO:** Rediseño estructural de los componentes visuales ya blindados en ADM-03.

#### Criterios de aceptación
- [ ] Al reducir el stock de un producto en la web, la fila correspondiente en `Productos.tsx` del Admin se actualiza sin recargar la página.
- [ ] El contador de "Stock Crítico" en el encabezado de productos se incrementa automáticamente cuando un producto baja de 6 a 5 unidades o menos.
- [ ] En `Inventario.tsx`, el semáforo y la tabla de movimientos Kardex muestran la nueva venta sin intervención manual.

#### Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `admin-pwa/src/pages/Productos.tsx` | page | 720 |
| `admin-pwa/src/pages/Inventario.tsx` | page | 480 |
| `frontend/src/hooks/useRealtimeProducts.ts` | component | 200 |

#### Casos límite (Edge Cases)
- **Pestaña en segundo plano:** El intervalo debe pausarse cuando `document.visibilityState === "hidden"` para no consumir CPU ni ancho de banda innecesario, y disparar recarga inmediata al volver al foco (`window.addEventListener("focus")`).

#### Definition of Done
- [ ] Verificación de actualización en caliente en dos ventanas simultáneas (Cliente y Admin).
- [ ] Sin fugas de memoria por listeners o timers (`clearInterval` en unmount verificado).
- [ ] `docs/estado_proyecto.md` actualizado.

---

### Ticket T121 — Métricas en vivo y eliminación de datos mock en Dashboard

#### Metadatos
- **Tipo:** `fix` / `feat`
- **Fase / Sprint:** F4 · Sprint 11
- **Rama sugerida:** `feature/T121-dashboard-metricas-reales`
- **Prioridad:** Alta

#### Análisis PCA
- **P (Por qué):** El Dashboard del Admin muestra valores ficticios desconectados de la base de datos: `$4.850.000` e `142 órdenes` quemados como fallback, gráfico semanal con montos fijos (Lun $450k a Sáb $1.15M), 3 insumos mock en stock crítico y un top 4 de productos inventado.
- **C (Cómo):**
  1. En `admin-pwa/src/pages/Dashboard.tsx`:
     - Consultar en paralelo `adminApi.orders.list()`, `adminApi.products.list()` y `adminApi.inventory.getItems()`.
     - **Ingresos del Mes:** Calcular la sumatoria real de `o.total` de órdenes en estado pagado/entregado del mes actual. Si no hay pedidos, mostrar `$0` (no `$4.850.000`).
     - **Pedidos Totales:** Contar las órdenes reales devueltas por la API. Si es 0, mostrar `0 órdenes` (no `142`).
     - **Ticket Promedio:** Dividir ingresos reales por total de órdenes reales (manejando división por cero limpiamente).
     - **Mermas / Desperdicio:** Calcular a partir de las mermas registradas en Kardex o enlazar con el total de movimientos de merma reales.
     - **Ventas de la Semana en Curso:** Agrupar las órdenes reales de los últimos 7 días por día de la semana (Lun a Dom) y proyectar los montos reales en el gráfico de barras.
     - **Stock Crítico:** Poblar el widget a partir de los productos con `stock <= 5` obtenidos de la API de catálogo o inventario en tiempo real.
     - **Top 5 Más Vendidos:** Agregar los ítems contenidos en las órdenes reales sumando unidades y recaudación por producto.
     - Reemplazar porcentajes hardcodeados (`+18.4%`) por cálculo real o etiquetas neutrales si no existe historial del mes previo.
- **A (A qué afecta):** `admin-pwa/src/pages/Dashboard.tsx`, `admin-pwa/src/services/api.ts`.

#### Convenciones aplicables
- `CONV-UI-01`, `CONV-UI-04`, `CONV-ERR-01`, `CONV-TIP-01`

#### Alcance (Qué SÍ / Qué NO)
- **SÍ:** Reemplazo de datos fijos por cálculos dinámicos basados en `orders`, `products` e `inventory`.
- **NO:** Cambio de la paleta de colores ni alteración del layout Bootstrap 5 responsivo.

#### Criterios de aceptación
- [ ] Si la base de datos está vacía, el Dashboard muestra `$0` ingresos, `0 órdenes` y `$0` ticket promedio, sin inventar `$4.850.000` ni `142`.
- [ ] Al registrar una venta real (por Web o POS), los ingresos del mes y la barra del día correspondiente en el gráfico aumentan en proporción al monto vendido.
- [ ] La sección "Stock Crítico" muestra los productos reales que tienen stock menor o igual a 5 en MySQL.
- [ ] La sección "Top Productos" se genera a partir de los ítems de las órdenes reales.

#### Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `admin-pwa/src/pages/Dashboard.tsx` | page | 300 |
| `admin-pwa/src/services/api.ts` | service | 650 |

#### Casos límite (Edge Cases)
- **Base de datos recién inicializada (0 pedidos):** Debe mostrar un estado coherente en cero sin errores `NaN` ni divisiones por cero en el ticket promedio.
- **Órdenes de días futuros o fechas nulas:** Manejador defensivo con `try/catch` y filtrado estricto por fecha ISO.

#### Definition of Done
- [ ] Dashboard verificado visualmente con 0 órdenes, con 1 orden y con múltiples órdenes.
- [ ] Cero strings fijos de montos o porcentajes no respaldados por datos.
- [ ] `docs/estado_proyecto.md` actualizado.

---

### Ticket T122 — Desacoplamiento de mocks en Reportes y consistencia CSV contable

#### Metadatos
- **Tipo:** `fix` / `feat`
- **Fase / Sprint:** F4 · Sprint 11
- **Rama sugerida:** `feature/T122-reportes-reales-csv`
- **Prioridad:** Media

#### Análisis PCA
- **P (Por qué):** `Reportes.tsx` replica los fallbacks mock de `$4.850.000`, 118 pedidos entregados, 142 pedidos totales, y calcula ventas simuladas con `120 - idx * 25`. El archivo CSV generado puede contener datos engañosos si la API no está sincronizada.
- **C (Cómo):**
  - Eliminar los operadores de cortocircuito con números inventados (`totalIngresos = ... || 4850000`).
  - Calcular el ranking de productos utilizando las ventas históricas reales de `ProductCatalogDTO.ventas` o agregando los ítems de las órdenes existentes.
  - Asegurar que la exportación contable en CSV refleje con exactitud matemática el historial de órdenes reales.
- **A (A qué afecta):** `admin-pwa/src/pages/Reportes.tsx`.

#### Convenciones aplicables
- `CONV-UI-01`, `CONV-ERR-01`, `CONV-TIP-01`

#### Alcance (Qué SÍ / Qué NO)
- **SÍ:** Consistencia en cálculos contables, ranking real y CSV fidedigno.
- **NO:** Modificación de exportadores externos ni dependencias nuevas de reporting.

#### Criterios de aceptación
- [ ] Los reportes calculan totales exactos a partir del arreglo de órdenes obtenido del backend.
- [ ] La descarga del archivo CSV descarga únicamente las transacciones reales persistidas.
- [ ] Eliminación de fórmulas ficticias como `120 - idx * 25`.

#### Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `admin-pwa/src/pages/Reportes.tsx` | page | 450 |

#### Definition of Done
- [ ] Exportación de CSV probada y contrastada contra la base de datos `cremeco_db.orders`.
- [ ] `docs/estado_proyecto.md` actualizado.
