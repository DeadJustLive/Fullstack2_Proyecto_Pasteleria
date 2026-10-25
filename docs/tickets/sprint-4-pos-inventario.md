# Sprint 4 — POS e Inventario (T62–T70)

<!-- @pca:start
@id(docs.tickets.sprint4)
@kind(doc)
@limit(lines: 900)
@relates(docs.plan_sprints, docs.backlog_requisitos, docs.plantilla_ticket, docs.convenciones, docs.sistema_anotaciones)
@desc(Tickets T62-T70: inventario, insumos, recetas, caja, POS online/offline y PWA)
@pca:end -->

## Propósito

Cerrar la épica **E05 — POS e inventario** con una venta presencial que funcione tanto con
conexión como sin ella, sin romper la consistencia del stock. Al terminar el sprint debe existir:

- Stock por producto con movimientos auditables (`SALE`, `ADJUSTMENT`, `PRODUCTION`, `WASTE`) y alertas de stock bajo.
- Insumos con unidad de medida, costo y stock mínimo; recetas por producto y registro de producción y merma.
- Caja por cajero con apertura, cierre y arqueo (esperado, contado, diferencia).
- Venta POS transaccional que descuenta stock, con idempotencia por clave de cliente.
- POS en la PWA `admin/` (Bootstrap 5, sin Tailwind) usable en móvil y tablet.
- PWA instalable con service worker, shell offline y cola de ventas en IndexedDB que sincroniza al volver la conexión.

### Contexto técnico vigente

| Elemento | Valor |
| :--- | :--- |
| Cliente | `frontend/` React 18 + TypeScript + Vite + Tailwind v4 (no se toca en este sprint) |
| Admin PWA | `admin/` React 18 + TypeScript + Vite + Bootstrap 5, **sin Tailwind** |
| Backend | `backend/` Spring Boot 3.5 + Java 21 + Maven Wrapper + JPA + Security + Flyway + MySQL 8 |
| Paquete Java | `com.cremeco.pasteleria` |
| Base de datos | MySQL 8 en `infra/docker-compose.yml` |
| Auth | JWT + RBAC dinámico; permisos `inventory.*`, `ingredients.*`, `pos.use` |
| Puertos | 5173 cliente · 5174 admin · 8080 API · 3306 MySQL |
| API base | `http://localhost:8080/api/v1` |

### Reglas transversales del sprint

1. El backend es la fuente de verdad: precios, stock y permisos se validan en el servidor; la UI solo anticipa el error.
2. El stock nunca queda negativo (RNF-008). Todo descuento ocurre dentro de una transacción con bloqueo.
3. Las operaciones críticas son idempotentes (RNF-004, RB-013): ventas POS y sincronización offline llevan clave de idempotencia.
4. Toda acción crítica de inventario y caja se audita (RB-011).
5. Moneda CLP entera y fechas en `America/Santiago` serializadas en ISO-8601 (RNF-009).
6. La PWA admin no carga Tailwind y el cliente no carga Bootstrap (RNF-001).

### Supuestos del sprint

- **SUPUESTO:** las versiones Flyway `V40`, `V41` y `V42` están reservadas para T62, T64 y T66; el coordinador confirma antes de crear cada archivo.
- **SUPUESTO:** el stock de producto se expresa en unidades enteras; el stock de insumos usa `DECIMAL(12,3)` porque se pesa y se mide.
- **SUPUESTO:** cada producto tiene una sola receta activa (sin versionado histórico de recetas).
- **SUPUESTO:** los métodos de pago del POS son `CASH`, `CARD` y `TRANSFER` simulados; no hay integración real ni boleta tributaria.
- **SUPUESTO:** el POS exige una sesión de caja abierta (decisión confirmada en el backlog, sección 8).
- **SUPUESTO:** el número de ticket se genera por sesión de caja con el formato `POS-<yyyyMMdd>-<secuencia>`.
- **SUPUESTO:** `admin/` usa React Router y organiza pantallas en `admin/src/pages/<modulo>/`.
- **SUPUESTO:** las pruebas frontend usan Vitest + Testing Library; las de backend, JUnit 5 + Testcontainers con MySQL 8.
- **SUPUESTO:** T68 usa `vite-plugin-pwa` con Workbox; por eso ese ticket es dueño de `admin/package.json` y `admin/vite.config.ts`.
- **SUPUESTO:** los archivos de prueba declaran `@kind(test)`, valor que aún no figura en el diccionario de `docs/sistema_anotaciones.md`; debe registrarse al ejecutar T70.

---

## Índice de tickets

| ID | Título | Responsable | Prioridad | Depende de | Requisitos |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [T62](#ticket-t62--modelo-de-inventario-de-productos) | Modelo de inventario de productos | Nicolas | Alta | T43 | RF-039, RF-040 |
| [T63](#ticket-t63--api-de-inventario-y-pantalla-pwa) | API de inventario y pantalla PWA | Nicolas | Alta | T62 | RF-039, RF-040 |
| [T64](#ticket-t64--modelo-de-insumos-y-recetas) | Modelo de insumos y recetas | Matias | Alta | T43 | RF-041, RF-042 |
| [T65](#ticket-t65--api-de-insumos-recetas-y-producción) | API de insumos, recetas y producción | Matias | Alta | T64 | RF-041, RF-042 |
| [T66](#ticket-t66--pos-backend-caja-ventas-y-arqueo) | POS backend: caja, ventas y arqueo | Matias | Alta | T55, T57, T62 | RF-043, RF-044 |
| [T67](#ticket-t67--pwa-pos-ui-ticket-y-cobro) | PWA POS: UI, ticket y cobro | Anais | Alta | T66 | RF-045 |
| [T68](#ticket-t68--pwa-manifest-service-worker-y-caché) | PWA: manifest, service worker y caché | Anais | Media | T27 | RF-060, RF-061, RF-062 |
| [T69](#ticket-t69--pos-offline-indexeddb-cola-y-sincronización) | POS offline: IndexedDB, cola y sincronización | Matias | Alta | T67, T68 | RF-046, RF-063 |
| [T70](#ticket-t70--pruebas-de-pos-y-offline) | Pruebas de POS y offline | Nicolas | Alta | T66–T69 | RF-064, RF-065 |

---

# Ticket T62 — Modelo de inventario de productos

## Metadatos

- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 4
- **Rama sugerida:** feature/T62-inventario-productos
- **Responsable:** Nicolas
- **Prioridad:** alta
- **Depende de:** T43 (modelo de catálogo y datos semilla)
- **Trazabilidad:** RF-039, RF-040, RB-004, RB-010, RB-012, RNF-008, EC-001, EC-017

## Contexto

El catálogo ya existe (T43) pero no controla existencias. El POS y la tienda necesitan una
fuente única de stock por producto y un historial de movimientos que explique cada variación.
Sin este modelo, T63, T65 y T66 no pueden descontar ni reponer nada.

## Convenciones aplicables

- CONV-GEN-01 — Código en inglés, documentación y mensajes en español.
- CONV-NAM-02 — Entidades y clases en `PascalCase`.
- CONV-NAM-05 — Tablas y columnas en `snake_case` y plural.
- CONV-NAM-06 — Booleanos con prefijo `is`/`has`/`can`.
- CONV-TIP-02 — Contratos primero: el modelo se define antes de los servicios.
- CONV-TIP-04 — Respetar `@limit(lines)`.
- CONV-DOC-01 — Bloque de anotación PCA en la cabecera de cada archivo.

## Alcance (Qué SÍ / Qué NO)

- **SÍ:** entidad `ProductStock` uno a uno con `Product`; entidad `StockMovement` de solo alta;
  enum `MovementType` (`SALE`, `ADJUSTMENT`, `PRODUCTION`, `WASTE`); stock mínimo por producto;
  consulta de productos en o bajo el mínimo; migración Flyway con claves foráneas e índices;
  backfill de los productos existentes.
- **NO:** endpoints HTTP (son T63), pantallas (T63), producción y recetas (T64/T65),
  venta POS (T66), reserva de stock por carrito (RB-004 indica que el carrito no reserva).

## Criterios de aceptación

- [ ] La migración `V40` crea `product_stocks` y `stock_movements` con FK a `products`, restricción única por `product_id` y `CHECK` que impide cantidades en cero.
- [ ] La migración hace backfill: todo producto existente queda con `stock_quantity = 0`, `minimum_stock = 0` y `version = 0`, sin filas huérfanas.
- [ ] Existen índices que cubren las consultas del sprint: `stock_movements(product_id, created_at DESC)`, `stock_movements(movement_type, created_at DESC)` y `product_stocks(stock_quantity, minimum_stock)`.
- [ ] El repositorio expone `findLowStock()` y una prueba demuestra que un producto con `stock_quantity = minimum_stock` **sí** aparece (el umbral es inclusivo).
- [ ] Los movimientos son de solo alta: no existen setters públicos de `quantity`, `movementType`, `product` ni `createdAt`, y no se define `delete` en el repositorio.
- [ ] `mvnw test` pasa con pruebas de persistencia contra MySQL 8 (Testcontainers) y la migración se aplica desde cero.

## Archivos afectados (previstos)

| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/resources/db/migration/V40__create_product_stock_and_movements.sql` | model | 120 |
| `backend/src/main/java/com/cremeco/pasteleria/inventory/domain/ProductStock.java` | model | 120 |
| `backend/src/main/java/com/cremeco/pasteleria/inventory/domain/StockMovement.java` | model | 120 |
| `backend/src/main/java/com/cremeco/pasteleria/inventory/domain/MovementType.java` | model | 40 |
| `backend/src/main/java/com/cremeco/pasteleria/inventory/repository/ProductStockRepository.java` | model | 90 |

## Casos límite (Edge Cases)

- **EC-017 — Ajuste que dejaría stock negativo:** la validación de dominio lanza `InsufficientStockException` antes de tocar la base; la fila no se modifica y no se inserta el movimiento.
- **EC-001 — Dos movimientos concurrentes sobre el mismo producto:** la entidad usa `@Version`; el segundo commit recibe `OptimisticLockException` y debe reintentar leyendo el stock real, nunca sobrescribir a ciegas.
- **Producto inactivo recibe movimiento:** el modelo lo permite (para poder corregir inventario), pero el stock de un producto inactivo no es vendible; la regla se aplica en T66.
- **Merma mayor al stock disponible:** se rechaza con el mismo error que un ajuste negativo; no se crea movimiento parcial.

## Definition of Done

- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] Migración Flyway con número confirmado por el coordinador y aplicada en base limpia.
- [ ] Bloque de anotación de cada archivo nuevo y `pca.config.json` actualizado por quien corresponda.

---

# Ticket T63 — API de inventario y pantalla PWA

## Metadatos

- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 4
- **Rama sugerida:** feature/T63-api-inventario-pwa
- **Responsable:** Nicolas
- **Prioridad:** alta
- **Depende de:** T62 (modelo de inventario de productos), T33 (SecurityConfig y authorities), T34 (`/auth/me`)
- **Trazabilidad:** RF-039, RF-040, RB-007, RB-011, RNF-003, EC-008, EC-011, EC-017

## Contexto

El bodeguero necesita ver existencias, corregirlas con un motivo y entender por qué cambiaron.
La API expone el modelo de T62 y la PWA entrega la pantalla `admin/inventario`, hoy en
`Placeholder`. Los permisos son `inventory.view` (consulta) e `inventory.manage` (ajuste).

## Convenciones aplicables

- CONV-GEN-01 — Mensajes al usuario en español.
- CONV-NAM-01 — Variables y funciones en `camelCase`.
- CONV-NAM-04 — Archivos en `kebab-case` en backend; componentes `PascalCase` en React.
- CONV-EST-01 — Separación entre controlador, servicio y repositorio.
- CONV-ERR-01 — Ningún error se ignora en silencio.
- CONV-ERR-04 — Mensajes que dicen qué falló y dónde, sin datos sensibles.
- CONV-SEG-03 — Validar toda entrada externa.
- CONV-SEG-04 — Mínimo privilegio en consultas y respuestas.
- CONV-UI-01 — Componentes de UI sin lógica de negocio.
- CONV-UI-02 — Estados explícitos: cargando, vacío, error y datos.
- CONV-UI-03 — Accesibilidad básica en tabla, formularios y foco del modal.
- CONV-TIP-01 — TypeScript estricto, sin `any`.
- CONV-DOC-02 — Contratos declarados en los servicios.

## Alcance (Qué SÍ / Qué NO)

- **SÍ:** `GET /api/v1/inventory/products` (paginado, búsqueda, filtro `lowStockOnly`),
  `GET /api/v1/inventory/products/{id}/movements` (paginado, filtro por tipo y rango de fechas),
  `POST /api/v1/inventory/adjustments`, `GET /api/v1/inventory/alerts`; pantalla PWA con tabla,
  modal de ajuste y panel de alertas; contrato OpenAPI y tipos TypeScript.
- **NO:** ajustes masivos, importación CSV, kardex exportable, historial de precios,
  producción (T65) ni venta (T66).

## Criterios de aceptación

- [ ] `GET /inventory/products` responde 200 con `content`, `page`, `size`, `totalElements`; el filtro `lowStockOnly=true` devuelve solo productos con `stock_quantity <= minimum_stock`.
- [ ] `POST /inventory/adjustments` exige `productId`, `quantity` distinta de cero y `reason` de al menos 5 caracteres; responde 201 con el stock resultante y el movimiento creado.
- [ ] Un ajuste con `expectedStock` desactualizado responde 409 con el stock real en el cuerpo, sin modificar la base.
- [ ] Un usuario sin `inventory.manage` recibe 403 aunque abra la URL directa en la PWA; el menú además oculta la acción (RB-007).
- [ ] Cada ajuste genera una entrada de auditoría con usuario, producto, cantidad anterior, cantidad nueva y motivo (RB-011).
- [ ] La pantalla muestra los cuatro estados (cargando, vacío, error con reintento, datos), funciona a 360 px y no usa Tailwind.
- [ ] El contrato OpenAPI queda actualizado y los tipos TypeScript de la PWA se regeneran sin `any`.

## Archivos afectados (previstos)

| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/java/com/cremeco/pasteleria/inventory/web/InventoryController.java` | service | 160 |
| `backend/src/main/java/com/cremeco/pasteleria/inventory/service/InventoryService.java` | service | 220 |
| `backend/src/main/java/com/cremeco/pasteleria/inventory/web/dto/StockAdjustmentRequest.java` | model | 60 |
| `admin/src/pages/inventory/InventoryPage.tsx` | view | 220 |
| `admin/src/services/inventory-api.ts` | service | 120 |

## Casos límite (Edge Cases)

- **EC-011 — Acceso por URL directa sin permiso:** la ruta se protege con el guard de permisos y, si el token ya no trae `inventory.view`, se redirige a la pantalla de acceso denegado; el backend igual responde 403.
- **EC-017 — Ajuste negativo:** la API responde 409 con el stock disponible y la UI restaura el valor anterior del campo.
- **EC-008 — Token expirado a mitad de un ajuste:** el cliente intenta refrescar una vez; si falla, muestra el error y no reintenta el `POST` para evitar un ajuste duplicado.
- **Producto sin movimientos:** la tabla de movimientos muestra estado vacío con el texto "Sin movimientos registrados", no un error.
- **Rango de fechas invertido:** se valida en el controlador y se responde 400 antes de consultar la base.

## Definition of Done

- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] Contrato OpenAPI actualizado y tipos TypeScript regenerados.
- [ ] `npm run lint` y `npm run build` en `admin/` sin errores.

---

# Ticket T64 — Modelo de insumos y recetas

## Metadatos

- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 4
- **Rama sugerida:** feature/T64-insumos-recetas
- **Responsable:** Matias
- **Prioridad:** alta
- **Depende de:** T43 (modelo de catálogo y datos semilla), T24 (Flyway baseline)
- **Trazabilidad:** RF-041, RF-042, RB-010, RB-012, EC-016

## Contexto

El obrador consume materia prima, no productos terminados. Para calcular el costo de un lote y
descontar insumos al producir, primero hay que modelar insumos con unidad de medida y recetas
por producto. Este ticket es el modelo; la API y la producción llegan en T65.

## Convenciones aplicables

- CONV-GEN-01 — Código en inglés, documentación en español.
- CONV-NAM-02 — Entidades en `PascalCase`.
- CONV-NAM-05 — Tablas y columnas en `snake_case` y plural.
- CONV-NAM-06 — Booleanos con prefijo `is`.
- CONV-NAM-07 — Sin abreviaturas: `ingredient`, no `ing`.
- CONV-TIP-02 — Contratos primero.
- CONV-TIP-04 — Respetar `@limit(lines)`.
- CONV-DOC-01 — Bloque de anotación PCA por archivo.

## Alcance (Qué SÍ / Qué NO)

- **SÍ:** entidad `Ingredient` (nombre único, unidad `GRAM`/`MILLILITER`/`UNIT`, stock
  `DECIMAL(12,3)`, costo por unidad, stock mínimo, `isActive`); `Recipe` uno a uno con producto;
  `RecipeItem` con cantidad por insumo; restricciones únicas; borrado lógico; migración `V41`.
- **NO:** endpoints (T65), cálculo de costo expuesto por API (T65), producción y merma (T65),
  compras a proveedores, historial de precios de insumos ni multi-bodega.

## Criterios de aceptación

- [ ] La migración `V41` crea `ingredients`, `recipes` y `recipe_items` con FK a `products` y `ingredients`, `UNIQUE(name)` en insumos, `UNIQUE(product_id)` en recetas y `UNIQUE(recipe_id, ingredient_id)` en ítems.
- [ ] `quantity` de `recipe_items` y `stock_quantity` de insumos son `DECIMAL(12,3)` con `CHECK (quantity > 0)` y `CHECK (stock_quantity >= 0)`.
- [ ] La unidad de medida se persiste como `VARCHAR` validado por enum y rechaza valores desconocidos al deserializar.
- [ ] Eliminar un insumo con recetas asociadas aplica borrado lógico (`is_active = false`, `deleted_at`) y no borra filas referenciadas (RB-012).
- [ ] El costo estimado de una receta se calcula como `Σ(quantity × cost_per_unit)` con `BigDecimal` y redondeo a CLP entero, verificado por una prueba unitaria.
- [ ] `mvnw test` y la migración desde base limpia pasan.

## Archivos afectados (previstos)

| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/resources/db/migration/V41__create_ingredients_and_recipes.sql` | model | 140 |
| `backend/src/main/java/com/cremeco/pasteleria/inventory/domain/Ingredient.java` | model | 130 |
| `backend/src/main/java/com/cremeco/pasteleria/inventory/domain/Recipe.java` | model | 90 |
| `backend/src/main/java/com/cremeco/pasteleria/inventory/domain/RecipeItem.java` | model | 90 |
| `backend/src/main/java/com/cremeco/pasteleria/inventory/domain/MeasurementUnit.java` | model | 40 |

## Casos límite (Edge Cases)

- **Receta duplicada para el mismo producto:** el índice único lo impide y la excepción se traduce a un error de dominio legible (`RecipeAlreadyExistsException`).
- **Insumo con `cost_per_unit = 0`:** se permite (insumo donado o de costo desconocido), pero el costo estimado de la receta lo refleja; la UI de T65 debe advertirlo.
- **Cambio de unidad de un insumo ya usado en recetas:** se bloquea si existen `recipe_items` activos, porque las cantidades quedarían con otra semántica.
- **Insumo duplicado dentro de la misma receta:** lo impide `UNIQUE(recipe_id, ingredient_id)`; el servicio suma cantidades solo si el usuario confirma explícitamente en T65.

## Definition of Done

- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] Migración Flyway con número confirmado y aplicada en base limpia.
- [ ] Datos semilla mínimos de insumos documentados en el README del módulo si se agregan.

---

# Ticket T65 — API de insumos, recetas y producción

## Metadatos

- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 4
- **Rama sugerida:** feature/T65-api-produccion
- **Responsable:** Matias
- **Prioridad:** alta
- **Depende de:** T64 (modelo de insumos y recetas), T62 (movimientos de stock), T63 (servicio de inventario)
- **Trazabilidad:** RF-041, RF-042, RB-010, RB-011, EC-016, EC-017

## Contexto

Con insumos y recetas modelados, el bodeguero necesita administrarlos y registrar producción:
un lote consume insumos y aumenta el stock del producto terminado, dejando dos movimientos
explicables. También necesita declarar merma de insumos.

## Convenciones aplicables

- CONV-EST-01 — Controlador, servicio y repositorio separados.
- CONV-ERR-02 — Errores de validación del usuario separados de fallas de infraestructura.
- CONV-ERR-04 — Mensajes útiles sin datos sensibles.
- CONV-SEG-03 — Validar toda entrada externa.
- CONV-SEG-04 — Mínimo privilegio por permiso (`ingredients.view`, `ingredients.manage`).
- CONV-UI-01 — Componentes sin lógica de negocio.
- CONV-UI-02 — Estados de carga, vacío, error y datos.
- CONV-TIP-01 — Sin `any`.
- CONV-TIP-03 — Cálculos de costo en funciones puras.
- CONV-DOC-02 — Contratos declarados.
- CONV-NAM-01 — `camelCase` en métodos y variables.

## Alcance (Qué SÍ / Qué NO)

- **SÍ:** CRUD de insumos y recetas; `POST /api/v1/production/batches` (producto, cantidad,
  receta); `POST /api/v1/inventory/waste` (insumo o producto, cantidad, motivo); consulta de
  costo estimado por receta y por lote; movimientos `PRODUCTION` y `WASTE`; pantallas PWA de
  insumos, recetas y producción.
- **NO:** órdenes de compra, proveedores, planificación de producción, costeo histórico por
  período (S5), ni integración con balanzas o impresoras.

## Criterios de aceptación

- [ ] `POST /production/batches` es transaccional: descuenta todos los insumos de la receta, aumenta el stock del producto y crea un `StockMovement` por insumo más uno `PRODUCTION` del producto; si algo falla, no queda ningún cambio.
- [ ] Si falta un insumo, la respuesta es 409 con la lista de insumos insuficientes (nombre, requerido, disponible) y el stock no se altera (EC-016).
- [ ] Registrar merma descuenta stock y exige motivo; una merma mayor al stock responde 409 sin movimiento parcial.
- [ ] La respuesta de producción incluye `estimatedCost` calculado con la receta vigente y el costo de los insumos al momento del lote.
- [ ] Un usuario sin `ingredients.manage` puede consultar pero no crear, editar ni producir; la PWA deshabilita las acciones y el backend responde 403.
- [ ] Las pantallas de insumos, recetas y producción cubren los cuatro estados y funcionan a 360 px sin Tailwind.
- [ ] Cada operación crítica genera auditoría con usuario, cantidades y motivo (RB-011).

## Archivos afectados (previstos)

| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/java/com/cremeco/pasteleria/inventory/web/IngredientController.java` | service | 170 |
| `backend/src/main/java/com/cremeco/pasteleria/inventory/web/RecipeController.java` | service | 150 |
| `backend/src/main/java/com/cremeco/pasteleria/inventory/service/ProductionService.java` | service | 220 |
| `backend/src/main/java/com/cremeco/pasteleria/inventory/web/ProductionController.java` | service | 130 |
| `admin/src/pages/inventory/ProductionPage.tsx` | view | 200 |

## Casos límite (Edge Cases)

- **EC-016 — Lote sin insumos suficientes:** se valida todo antes de descontar; si el insumo 3 de 5 falta, no se descuentan los dos primeros.
- **Producto sin receta activa:** la producción responde 409 con el mensaje "El producto no tiene receta activa" y no crea el lote.
- **Doble clic en "Producir":** el botón se deshabilita y el servicio usa una clave de idempotencia por solicitud para no registrar dos lotes.
- **Insumo desactivado dentro de una receta:** la producción se bloquea hasta que la receta se actualice; el mensaje identifica el insumo.
- **Merma de un insumo que además es producto vendible:** se permite, pero el movimiento queda tipado como `WASTE` para no confundirlo con una venta.

## Definition of Done

- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] Contrato OpenAPI actualizado y tipos TypeScript regenerados.
- [ ] `npm run lint` y `npm run build` en `admin/` sin errores.

---

# Ticket T66 — POS backend: caja, ventas y arqueo

## Metadatos

- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 4
- **Rama sugerida:** feature/T66-pos-caja-ventas
- **Responsable:** Matias
- **Prioridad:** alta
- **Depende de:** T55 (OrderService e idempotencia), T57 (checkout transaccional), T62 (stock por producto), T33 (SecurityConfig)
- **Trazabilidad:** RF-043, RF-044, RB-004, RB-009, RB-011, RB-013, RB-015, RNF-004, RNF-008, EC-013, EC-014, EC-015

## Contexto

Es el corazón del POS. El cajero abre una caja, vende y cierra con arqueo. Cada venta
descuenta stock y emite un ticket. La idempotencia es obligatoria porque T69 reenviará ventas
que se registraron sin conexión.

## Convenciones aplicables

- CONV-GEN-01 — Código en inglés, mensajes en español.
- CONV-NAM-02 — Entidades y servicios en `PascalCase`.
- CONV-NAM-05 — Tablas y columnas en `snake_case` y plural.
- CONV-NAM-06 — Booleanos con prefijo `is`/`has`.
- CONV-EST-01 — Separación de capas.
- CONV-TIP-02 — Contratos primero.
- CONV-TIP-03 — Cálculo de arqueo en función pura y testeable.
- CONV-ERR-02 — Validación de negocio separada de fallas de infraestructura.
- CONV-SEG-03 — Validar el cuerpo de la venta antes de abrir la transacción.
- CONV-DOC-02 — Contratos declarados.

## Alcance (Qué SÍ / Qué NO)

- **SÍ:** entidades `CashSession`, `PosSale`, `PosSaleItem`; apertura y cierre de caja;
  `POST /api/v1/pos/sales` con `Idempotency-Key`; descuento de stock con bloqueo; medios de
  pago `CASH`/`CARD`/`TRANSFER`; arqueo con esperado, contado y diferencia; generación de
  número de ticket y payload de impresión; migración `V42`; auditoría de caja y venta.
- **NO:** UI (T67), cola offline (T69), devoluciones y notas de crédito, descuentos por línea,
  propinas, facturación electrónica ni integración real con medios de pago.

## Criterios de aceptación

- [ ] `POST /pos/cash-sessions/open` crea una sesión `OPEN` con monto inicial y cajero autenticado; una segunda apertura del mismo cajero responde 409 con el identificador de la sesión abierta.
- [ ] Vender sin sesión `OPEN` responde 409 y no descuenta stock (el POS no opera sin caja, según la decisión del backlog).
- [ ] `POST /pos/sales` descuenta stock dentro de una transacción con bloqueo pesimista por producto; si no alcanza, responde 409 con el detalle y no persiste la venta ni el movimiento (EC-013).
- [ ] Reenviar la misma `Idempotency-Key` devuelve la venta original con el mismo `ticketNumber` y no vuelve a descontar stock (EC-014, RB-013).
- [ ] `POST /pos/cash-sessions/{id}/close` calcula `expectedAmount = openingAmount + ventas en efectivo - devoluciones en efectivo`, registra `countedAmount` y `difference`, y deja la sesión `CLOSED` inmutable.
- [ ] Cerrar una sesión ya cerrada responde 409 sin recalcular el arqueo (EC-015).
- [ ] El ticket devuelve folio, fecha en `America/Santiago`, ítems con precio unitario, total, medio de pago, cajero y sesión, con montos CLP enteros (RNF-009).
- [ ] Caja y venta generan auditoría con usuario, sesión, total y diferencia (RB-011).

## Archivos afectados (previstos)

| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/resources/db/migration/V42__create_cash_sessions_and_pos_sales.sql` | model | 160 |
| `backend/src/main/java/com/cremeco/pasteleria/pos/domain/CashSession.java` | model | 150 |
| `backend/src/main/java/com/cremeco/pasteleria/pos/service/CashRegisterService.java` | service | 220 |
| `backend/src/main/java/com/cremeco/pasteleria/pos/service/PosSaleService.java` | service | 260 |
| `backend/src/main/java/com/cremeco/pasteleria/pos/web/PosController.java` | service | 150 |
| `backend/src/main/java/com/cremeco/pasteleria/pos/service/CashAuditCalculator.java` | util | 70 |

## Casos límite (Edge Cases)

- **EC-013 — Venta sin stock:** responde 409 con producto y disponible; la venta no se crea y el ticket no se consume.
- **EC-014 — Reintento de red con la misma clave:** se devuelve la venta existente; una clave distinta con el mismo contenido sí crea una venta nueva (no se deduplica por contenido).
- **EC-015 — Dos cajas cierran la misma sesión:** el cierre usa bloqueo y estado esperado; el segundo request recibe 409 y no sobrescribe `countedAmount`.
- **Pago en efectivo mayor al total:** se registra `changeAmount` y no se altera el total ni el stock; pagos menores al total se rechazan con 400.
- **Venta con dos ítems del mismo producto:** se agregan cantidades antes de descontar stock para no competir por el mismo bloqueo.

## Definition of Done

- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] Contrato OpenAPI actualizado con los endpoints de caja y venta.
- [ ] Migración Flyway con número confirmado y aplicada en base limpia.

---

# Ticket T67 — PWA POS: UI, ticket y cobro

## Metadatos

- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 4
- **Rama sugerida:** feature/T67-pwa-pos-ui
- **Responsable:** Anais
- **Prioridad:** alta
- **Depende de:** T66 (POS backend), T39 (guards y menú por permisos)
- **Trazabilidad:** RF-045, RF-044, RNF-001, RNF-003, RNF-010, EC-013, EC-011

## Contexto

El POS existente en `frontend/src/pages/admin/Pos.tsx` es una referencia visual en Tailwind, no
el destino. La PWA de `admin/` debe ofrecer la misma operación con Bootstrap 5, consumiendo la
API de T66 y funcionando en tablet y móvil.

## Convenciones aplicables

- CONV-GEN-01 — Mensajes al usuario en español.
- CONV-NAM-02 — Componentes en `PascalCase`.
- CONV-NAM-04 — Una carpeta por componente cuando aplique.
- CONV-NAM-07 — Sin abreviaturas en nombres.
- CONV-UI-01 — Componentes que reciben datos por props, sin lógica de negocio.
- CONV-UI-02 — Estados explícitos: cargando, vacío, error y datos.
- CONV-UI-03 — Etiquetas, contraste y navegación por teclado en modales.
- CONV-UI-04 — Estilos con variables de Bootstrap y tokens de marca definidos en T27.
- CONV-TIP-01 — TypeScript estricto, sin `any`.
- CONV-DOC-01 — Bloque de anotación PCA por archivo.

## Alcance (Qué SÍ / Qué NO)

- **SÍ:** `admin/src/pages/pos/` con grilla de productos, filtro por categoría y búsqueda,
  ticket con stepper, subtotal/total, modal de cobro con medio de pago, pantalla de éxito con
  número de ticket y acción de imprimir; estado de caja (abrir/cerrar) en la cabecera.
- **NO:** cola offline (T69), service worker (T68), descuentos por línea, propinas, división de
  cuenta, ni reutilizar clases Tailwind del POS viejo.

## Criterios de aceptación

- [ ] La grilla muestra productos activos con stock; un producto sin stock aparece deshabilitado con la etiqueta "Sin stock" (EC-013 anticipado en UX).
- [ ] Agregar, sumar y restar en el ticket actualiza cantidades y totales sin llamar a la API; el total se calcula en CLP entero.
- [ ] "Cobrar" abre un modal con `CASH`, `CARD` y `TRANSFER`; al confirmar se envía un único `POST /pos/sales` con una `Idempotency-Key` generada en el cliente.
- [ ] El doble clic en "Cobrar" no genera dos ventas: el botón pasa a estado de carga y se bloquea hasta la respuesta.
- [ ] La pantalla de éxito muestra folio, total, medio de pago y botón "Nueva venta"; el ticket es imprimible con estilos de impresión propios.
- [ ] Sin sesión de caja abierta, el POS muestra un aviso bloqueante con acceso a apertura; no permite cobrar.
- [ ] La interfaz es usable a 360 px y 768 px, sin scroll horizontal en la grilla de productos ni en el ticket.
- [ ] No se importa Tailwind ni clases utilitarias de Tailwind en `admin/`.

## Archivos afectados (previstos)

| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `admin/src/pages/pos/PosPage.tsx` | view | 240 |
| `admin/src/pages/pos/ProductGrid.tsx` | component | 140 |
| `admin/src/pages/pos/TicketPanel.tsx` | component | 190 |
| `admin/src/pages/pos/PaymentModal.tsx` | component | 170 |
| `admin/src/services/pos-api.ts` | service | 150 |

## Casos límite (Edge Cases)

- **Doble clic o reintento en "Cobrar":** la clave de idempotencia se genera una vez por intento de venta y se reutiliza en el reintento, no se regenera.
- **La caja se cierra en otra pestaña durante el cobro:** la API responde 409 y la UI muestra "La sesión de caja fue cerrada" con opción de reabrir, sin perder el ticket armado.
- **Recarga de página con ticket en curso:** el ticket se guarda en `sessionStorage` y se restaura; si el usuario cierra la pestaña, se descarta con confirmación del navegador.
- **Producto desactivado mientras está en el ticket:** la API lo rechaza y la UI marca la línea como conflicto para quitarla.
- **Impresión sin impresora:** el navegador abre el diálogo del sistema; si falla, se ofrece descargar el ticket como texto.

## Definition of Done

- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] `npm run lint` y `npm run build` en `admin/` sin errores.
- [ ] Verificación visual manual en 360, 768 y 1280 px.

---

# Ticket T68 — PWA: manifest, service worker y caché

## Metadatos

- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 4
- **Rama sugerida:** feature/T68-pwa-manifest-service-worker
- **Responsable:** Anais
- **Prioridad:** media
- **Depende de:** T27 (PWA base con Vite, React y Bootstrap)
- **Trazabilidad:** RF-060, RF-061, RF-062, RNF-001, EC-021

## Contexto

Sin manifest ni service worker no hay instalación ni arranque sin conexión. El POS offline de
T69 necesita que el shell cargue aunque la red falle; este ticket entrega esa base y una
estrategia de caché explícita que no sirva versiones viejas del shell (EC-021).

## Convenciones aplicables

- CONV-EST-03 — Configuración de build en la raíz de `admin/`.
- CONV-SEG-01 — Sin secretos en el código ni en el service worker.
- CONV-SEG-03 — Validar parámetros de consulta antes de cachear.
- CONV-ERR-01 — Fallos de registro del service worker se informan, no se silencian.
- CONV-UI-02 — La pantalla offline es un estado explícito, no una página en blanco.
- CONV-TIP-01 — TypeScript estricto, sin `any`.
- CONV-DOC-01 — Bloque de anotación PCA por archivo.

## Alcance (Qué SÍ / Qué NO)

- **SÍ:** `manifest.webmanifest` con nombre, colores de marca, `display: standalone`,
  `start_url`, iconos 192/512 y `maskable`; service worker con precache del shell; estrategia
  `network-first` con timeout para `GET` de API, `cache-first` para estáticos con hash,
  `stale-while-revalidate` para imágenes; pantalla offline; flujo de actualización con aviso;
  botón de instalación.
- **NO:** Background Sync API (se resuelve en T69 con la cola al volver `online`), push
  notifications, caché de mutaciones, ni soporte offline del cliente `frontend/`.

## Criterios de aceptación

- [ ] El manifest se sirve con `Content-Type: application/manifest+json`, declara `start_url: "/pos"`, `scope: "/"` y al menos los iconos 192 y 512 en PNG, incluido uno `maskable`.
- [ ] Con la app instalada, el modo es `standalone`, el color de tema coincide con el token de marca y el nombre corto cabe en la pantalla de inicio.
- [ ] El service worker precachea el shell compilado (`index.html`, JS, CSS, fuentes) y la app abre con la red desactivada mostrando la pantalla offline en lugar del error del navegador.
- [ ] Los `POST`/`PUT`/`DELETE` nunca se cachean; una prueba manual lo verifica revisando `Cache Storage`.
- [ ] Los `GET` de API se resuelven `network-first` con timeout de 3 s y caída a caché; una respuesta 401/403 no se almacena.
- [ ] Cuando hay una versión nueva del shell, la app muestra un aviso "Nueva versión disponible" y solo recarga al aceptar, sin dejar contenido mezclado (EC-021).
- [ ] Lighthouse local reporta la app como instalable y sin errores de service worker.
- [ ] El botón de instalación aparece solo cuando `beforeinstallprompt` está disponible y se explica su ausencia en iOS.

## Archivos afectados (previstos)

| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `admin/public/manifest.webmanifest` | config | 80 |
| `admin/vite.config.ts` | config | 90 |
| `admin/src/pwa/register-service-worker.ts` | service | 90 |
| `admin/src/pwa/use-pwa-install.ts` | hook | 80 |
| `admin/public/offline.html` | view | 70 |
| `admin/package.json` | config | 90 |

## Casos límite (Edge Cases)

- **EC-021 — Service worker viejo sirviendo shell antiguo:** el nuevo worker no activa hasta que el usuario acepta; se comparan versiones por mensaje y se limpian cachés con prefijo anterior.
- **Primera visita sin conexión:** no hay nada cacheado; se muestra `offline.html` con instrucción de conectarse una vez, sin pantalla en blanco.
- **`manifest.webmanifest` cacheado tras un cambio de íconos:** se sirve con `Cache-Control: no-cache` para que el ícono no quede obsoleto.
- **Navegador sin soporte de instalación:** el botón se oculta y no se muestra un error técnico al usuario.
- **Cuota de caché excedida:** la estrategia de imágenes se limita a un máximo de entradas y descarta las más antiguas.

## Definition of Done

- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] `npm run build` genera el service worker y el manifest en `dist/`.
- [ ] Evidencia de Lighthouse y de la prueba offline adjunta al ticket.

---

# Ticket T69 — POS offline: IndexedDB, cola y sincronización

## Metadatos

- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 4
- **Rama sugerida:** feature/T69-pos-offline-sync
- **Responsable:** Matias
- **Prioridad:** alta
- **Depende de:** T67 (UI del POS), T68 (service worker y shell offline), T66 (idempotencia del backend)
- **Trazabilidad:** RF-046, RF-063, RB-013, RB-015, RNF-004, EC-014, EC-015, EC-020

## Contexto

La pastelería puede perder internet en plena venta. La venta debe registrarse localmente, con
un identificador generado en el cliente, y sincronizarse exactamente una vez. Si el stock ya no
alcanza, la venta queda en conflicto visible para revisión, no se descarta en silencio.

## Convenciones aplicables

- CONV-GEN-01 — Código en inglés, mensajes de estado en español.
- CONV-NAM-01 — `camelCase` en funciones y variables.
- CONV-NAM-03 — Constantes de reintento en `SCREAMING_SNAKE_CASE`.
- CONV-NAM-06 — Booleanos con prefijo `is`/`has`/`can`.
- CONV-TIP-01 — TypeScript estricto, sin `any`.
- CONV-TIP-02 — Contratos primero: el tipo de la venta en cola es explícito.
- CONV-TIP-03 — Cálculo de backoff en función pura.
- CONV-ERR-01 — Ningún fallo de sincronización se pierde en silencio.
- CONV-ERR-02 — Error de red, error de negocio y conflicto se tratan distinto.
- CONV-UI-02 — El estado de sincronización es visible y tiene estados explícitos.

## Alcance (Qué SÍ / Qué NO)

- **SÍ:** base IndexedDB `cremeco-pos` con almacén `pendingSales`; venta con `clientSaleId`
  (UUID v4); estados `PENDING`, `SYNCING`, `SYNCED`, `CONFLICT`, `FAILED`; envío secuencial al
  volver `online` y al iniciar la app; reintento con backoff exponencial y tope; detección de
  duplicado y de conflicto de stock; barra de estado con contadores y pantalla de conflictos.
- **NO:** Background Sync API, sincronización multi-dispositivo, resolución automática de
  conflictos, edición de ventas sincronizadas, ni offline del catálogo completo de productos.

## Criterios de aceptación

- [ ] Una venta sin conexión se guarda en IndexedDB con `clientSaleId` UUID v4, estado `PENDING`, timestamp y payload completo, y aparece en la lista de pendientes.
- [ ] Al recuperar la conexión, la cola se envía en orden de creación, una venta a la vez, usando `clientSaleId` como `Idempotency-Key`.
- [ ] Reenviar una venta ya aceptada devuelve el mismo ticket y el registro local pasa a `SYNCED` sin duplicar stock ni venta (EC-014).
- [ ] Un 409 por stock insuficiente deja la venta en `CONFLICT` con el detalle del backend, sin reintentos automáticos, y visible en la pantalla de conflictos (RB-015).
- [ ] Un error de red o 5xx incrementa `attempts` y reintenta con backoff exponencial (1 s, 2 s, 4 s, 8 s, máximo 60 s) sin bloquear el resto de la cola.
- [ ] La cola sobrevive a recargas y a cerrar la pestaña; una venta `SYNCING` interrumpida vuelve a `PENDING` al iniciar.
- [ ] La barra de estado muestra conectado/desconectado, pendientes, conflictos y última sincronización; se actualiza sin recargar.
- [ ] Las ventas `SYNCED` se conservan al menos 7 días y luego se purgan; las `CONFLICT` nunca se purgan solas.

## Archivos afectados (previstos)

| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `admin/src/offline/pos-database.ts` | util | 140 |
| `admin/src/offline/pending-sales-repository.ts` | service | 170 |
| `admin/src/offline/sync-service.ts` | service | 220 |
| `admin/src/offline/use-offline-sync.ts` | hook | 130 |
| `admin/src/pages/pos/SyncStatusBar.tsx` | component | 90 |

## Casos límite (Edge Cases)

- **EC-014 — Venta offline que ya fue registrada:** el backend responde con la venta original; el cliente marca `SYNCED` y no encola de nuevo.
- **EC-015 — Ventas mixtas online/offline en la misma caja:** ambas se asocian a la sesión local y el arqueo del backend las suma; el cliente muestra la diferencia si la sesión se cerró antes de sincronizar.
- **EC-020 — Conexión intermitente durante el envío:** el request puede haber llegado; al reintentar con la misma clave no se duplica. Nunca se regenera el `clientSaleId`.
- **Reloj del cliente desfasado:** el backend sella `createdAt` y el ticket usa la hora del servidor; el timestamp local se guarda solo como referencia.
- **Cuota de IndexedDB agotada:** la venta no se pierde en memoria; se muestra un error bloqueante que impide cobrar hasta liberar espacio.
- **Usuario cierra sesión con ventas pendientes:** se advierte antes de salir y la cola se conserva asociada al usuario que la creó.

## Definition of Done

- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] Prueba manual documentada: vender offline, reconectar y verificar un solo registro en la base.
- [ ] `npm run lint` y `npm run build` en `admin/` sin errores.

---

# Ticket T70 — Pruebas de POS y offline

## Metadatos

- **Tipo:** test
- **Fase / Sprint:** F3 · Sprint 4
- **Rama sugerida:** feature/T70-pruebas-pos-offline
- **Responsable:** Nicolas
- **Prioridad:** alta
- **Depende de:** T66, T67, T68, T69
- **Trazabilidad:** RF-064, RF-065, RNF-004, RNF-008, EC-013, EC-014, EC-015

## Contexto

El POS mueve dinero y stock; un error silencioso cuesta caro. Las pruebas deben cubrir caja,
venta, arqueo, descuento de stock, cola offline, reintento, duplicado y conflicto. Sin esto, el
sprint no puede declararse cerrado.

## Convenciones aplicables

- CONV-GEN-02 — Sin código muerto ni `console.log` en la entrega.
- CONV-GEN-04 — Legibilidad antes que astucia en los tests.
- CONV-NAM-01 — Nombres de test en `camelCase` y descriptivos.
- CONV-NAM-03 — Constantes de prueba en `SCREAMING_SNAKE_CASE`.
- CONV-TIP-01 — Sin `any` en los tests de TypeScript.
- CONV-TIP-03 — Fixtures y cálculos en funciones puras reutilizables.
- CONV-ERR-01 — Los tests verifican que los errores se comunican, no que se ignoran.
- CONV-DOC-03 — Comentarios solo donde el test necesita explicar el porqué.

## Alcance (Qué SÍ / Qué NO)

- **SÍ:** pruebas de integración de caja (apertura, doble apertura, cierre, arqueo, doble
  cierre), de venta (descuento, stock insuficiente, pago con vuelto, idempotencia), de
  concurrencia sobre la última unidad y de la cola offline (encolar, reintentar, duplicado,
  conflicto, persistencia tras recarga); prueba de componente del cobro con doble clic.
- **NO:** E2E con Playwright (T84), pruebas de carga, pruebas de Flow (T81), ni cobertura de
  módulos de S5.

## Criterios de aceptación

- [ ] Existe una prueba que abre caja, vende en efectivo y cierra con arqueo, verificando `expectedAmount`, `countedAmount` y `difference` con montos CLP exactos.
- [ ] Una prueba demuestra que vender sin stock responde 409 y deja `product_stocks` y `stock_movements` sin cambios.
- [ ] Una prueba envía dos veces la misma `Idempotency-Key` y comprueba una sola fila en `pos_sales` y un solo movimiento de stock por ítem.
- [ ] Una prueba con dos hilos vendedores sobre la última unidad confirma que solo uno gana y el otro recibe 409 (EC-001 aplicado al POS).
- [ ] Una prueba de la cola offline verifica el ciclo `PENDING → SYNCING → SYNCED` y que un 409 produce `CONFLICT` sin reintento automático.
- [ ] Una prueba de `sync-service` confirma que un fallo de red incrementa `attempts` y aplica el backoff esperado usando reloj simulado, sin `sleep` real.
- [ ] La prueba de componente del POS verifica que el doble clic en "Cobrar" produce una sola llamada a la API.
- [ ] `mvnw test` y `npm run test` corren en local sin red externa y sin depender del orden de ejecución.

## Archivos afectados (previstos)

| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/test/java/com/cremeco/pasteleria/pos/CashRegisterServiceTest.java` | test | 200 |
| `backend/src/test/java/com/cremeco/pasteleria/pos/PosSaleServiceTest.java` | test | 240 |
| `backend/src/test/java/com/cremeco/pasteleria/inventory/StockConcurrencyTest.java` | test | 180 |
| `admin/src/offline/__tests__/pending-sales-repository.test.ts` | test | 180 |
| `admin/src/offline/__tests__/sync-service.test.ts` | test | 200 |

## Casos límite (Edge Cases)

- **Base de prueba con puerto 3306 ocupado:** Testcontainers publica un puerto aleatorio; ninguna prueba depende del MySQL local del desarrollador.
- **Cálculo de diferencia con decimales:** los montos son enteros CLP; una prueba con `countedAmount` menor y mayor al esperado cubre diferencia negativa y positiva.
- **Prueba de reintento con temporizadores reales:** se prohíbe `setTimeout` real; se usa reloj simulado para evitar tests intermitentes.
- **Datos residuales entre pruebas:** cada prueba limpia sus tablas o usa transacción con rollback; el orden de ejecución no altera el resultado.

## Definition of Done

- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] Evidencia de ejecución (`mvnw test` y `npm run test`) adjunta al ticket.

---

## Checklist de cierre del sprint

- [ ] T62, T63, T64, T65, T66, T67, T68, T69 y T70 están en estado `Hecho` y revisados por otra persona del equipo.
- [ ] Las migraciones `V40`, `V41` y `V42` se aplican en orden desde una base limpia y `Flyway` no reporta checksum inválido.
- [ ] `mvnw test` pasa en `backend/` con pruebas de caja, venta, stock, idempotencia y concurrencia.
- [ ] `npm run lint` y `npm run build` pasan en `admin/`; `npm run test` pasa con las pruebas de la cola offline.
- [ ] El contrato OpenAPI incluye inventario, insumos, recetas, producción, caja y venta, y los tipos TypeScript están regenerados.
- [ ] La matriz de permisos incluye `inventory.view`, `inventory.manage`, `ingredients.view`, `ingredients.manage` y `pos.use` asignados a los roles correspondientes.
- [ ] La PWA `admin/` es instalable, abre sin conexión y no carga Tailwind; el cliente `frontend/` sigue sin Bootstrap.
- [ ] Prueba manual completa: abrir caja, vender online, vender offline, reconectar, verificar una sola venta y stock consistente, cerrar caja y validar el arqueo.
- [ ] Ningún secreto, token ni contraseña quedó en el código o en los archivos de configuración versionados.
- [ ] `docs/estado_proyecto.md` actualizado con fase, tickets cerrados y próximo paso.
- [ ] Las cicatrices de bugs resueltos quedaron registradas en `docs/cicatrices_guerra.md`.
- [ ] No hay archivos por encima de su `@limit` y `python tools/pca_annotator.py check` no reporta relaciones rotas.

## Criterios de salida

El sprint se considera cerrado cuando se cumple todo lo siguiente:

1. **Venta POS online:** una venta en efectivo, tarjeta o transferencia descuenta stock y emite ticket con folio, sin permitir stock negativo.
2. **Venta POS offline:** una venta registrada sin conexión sobrevive a la recarga, se sincroniza una sola vez al volver online y no duplica venta ni stock.
3. **Conflictos visibles:** una venta offline sin stock suficiente queda en estado `CONFLICT`, es visible para el cajero y no se reintenta indefinidamente.
4. **Caja y arqueo:** apertura, cierre y arqueo calculan esperado, contado y diferencia; una sesión cerrada no se puede reabrir ni recalcular.
5. **Inventario consistente:** `stock_movements` explica toda variación de `product_stocks`; los productos en o bajo el mínimo aparecen en alertas.
6. **Insumos y producción:** un lote descuenta insumos, aumenta stock del producto y calcula costo estimado; sin insumos suficientes no hay cambios parciales.
7. **PWA instalable:** manifest, iconos, service worker y shell offline operativos, con aviso de actualización y sin servir versiones viejas del shell.
8. **Calidad:** pruebas de T70 pasan, no hay `any`, no hay secretos y la documentación de estado quedó actualizada.
