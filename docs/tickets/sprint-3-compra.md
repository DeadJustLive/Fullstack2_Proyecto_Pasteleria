<!-- @pca:start
@id(docs.tickets.sprint3.compra)
@kind(doc)
@limit(lines: 860)
@relates(docs.plan_sprints, docs.backlog_requisitos, docs.plantilla_ticket, docs.convenciones)
@desc(Tickets T52-T61 del Sprint 3: pedidos, cupones, envios, pagos simulados y checkout)
@pca:end -->

# Sprint 3 — Compra (T52–T61)

> **Fase:** F3 — Ejecución por tickets · **Sprint:** S3 — Compra
> **Épica:** E04 Compra · **Requisitos:** RF-029 a RF-038, RF-053
> **Reglas de negocio:** RB-001 a RB-006, RB-011 a RB-014
> **Casos límite:** EC-001 a EC-008, EC-012, EC-020
> **Plantilla:** [`docs/plantilla_ticket.md`](../plantilla_ticket.md)
> **Plan:** [`docs/plan_sprints.md`](../plan_sprints.md)

## Propósito

Cerrar el flujo de compra de punta a punta con el backend como fuente de verdad: el cliente
cotiza envío, aplica cupón, paga con un proveedor simulado y recibe una confirmación real;
la PWA administra pedidos y transiciones de estado. Al terminar el sprint, el checkout de
`frontend/` deja de ser simulado (`localStorage`) y pasa a consumir la API.

**Criterio de salida del sprint (resumen):** una compra completa (carrito → checkout → pago →
confirmación → seguimiento) funciona contra MySQL, con stock validado, cupón revalidado,
envío cotizado en servidor, idempotencia ante doble submit y pruebas de concurrencia en verde.

**Decisiones transversales del sprint:**

- Dinero en CLP entero, IVA incluido (RB-001). Todo cálculo ocurre en el backend.
- Descuento porcentual se redondea a peso entero con `HALF_UP`; el descuento nunca supera el subtotal.
- Fechas y vigencias se evalúan en `America/Santiago` y se serializan en ISO-8601 (RNF-009).
- El stock **no se reserva** en el carrito (RB-004); se valida al crear el pedido y se descuenta
  al confirmar el pago.
- El cliente nunca envía precios: solo `productId`, `quantity` y datos de entrega/pago.
- `SUPUESTO:` el coordinador reserva el bloque de migraciones **V30–V59** para este sprint.

---

## Índice de tickets

| ID | Título | Responsable | Prioridad | Depende de |
| :--- | :--- | :--- | :--- | :--- |
| [T52](#ticket-t52--modelo-de-pedidos-cupones-envíos-y-pagos) | Modelo de pedidos, cupones, envíos y pagos | Matias | Alta | T24, T43 |
| [T53](#ticket-t53--api-de-cupones-y-crud-admin) | API de cupones y CRUD admin | Nicolas | Alta | T52 |
| [T54](#ticket-t54--api-de-zonas-tarifas-y-cotización) | API de zonas, tarifas y cotización | Nicolas | Alta | T52 |
| [T55](#ticket-t55--orderservice-estados-e-idempotencia) | OrderService, estados e idempotencia | Matias | Alta | T52 |
| [T56](#ticket-t56--paymentprovider-simulado-y-webhook-base) | PaymentProvider simulado y webhook base | Matias | Alta | T52, T55 |
| [T57](#ticket-t57--checkout-backend-y-validación-transaccional) | Checkout backend y validación transaccional | Matias | Alta | T53–T56 |
| [T58](#ticket-t58--cliente-checkout-real-y-confirmación) | Cliente: checkout real y confirmación | Anais | Alta | T48, T57 |
| [T59](#ticket-t59--cliente-perfil-historial-y-seguimiento) | Cliente: perfil, historial y seguimiento | Anais | Alta | T57, T58 |
| [T60](#ticket-t60--pwa-pantalla-de-pedidos-y-transiciones) | PWA: pantalla de pedidos y transiciones | Anais | Alta | T55, T57 |
| [T61](#ticket-t61--pruebas-de-compra-concurrencia-y-doble-submit) | Pruebas de compra, concurrencia y doble submit | Nicolas | Alta | T53–T60 |

---

# Ticket T52 — Modelo de pedidos, cupones, envíos y pagos

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 3
- **Rama sugerida:** feature/T52-modelo-compra
- **Responsable:** Matias
- **Prioridad:** alta
- **Depende de:** T24, T43

## Contexto
T24 dejó Flyway operativo y T43 el modelo de catálogo. E04 necesita la base persistente del
flujo de compra: pedidos con sus líneas e historial, cupones y sus canjes, zonas y envíos,
pagos y eventos de pago. Sin este modelo, T53–T61 no pueden existir. Traza RF-029 a RF-034
y las reglas RB-001 a RB-006, RB-011, RB-012.

## Convenciones aplicables
- CONV-NAM-02
- CONV-NAM-05
- CONV-NAM-06
- CONV-TIP-01
- CONV-TIP-02
- CONV-EST-01
- CONV-DOC-01

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** entidades `Order`, `OrderItem`, `OrderStatusHistory`, `Coupon`, `CouponRedemption`,
  `ShippingZone`, `Shipment`, `Payment`, `PaymentEvent`; enums `OrderStatus` y `PaymentStatus`;
  migraciones Flyway con constraints e índices; regla de dinero en CLP entero.
- **NO:** endpoints, servicios de negocio, cálculo de totales (T55/T57), tarifas por comuna
  (`ShippingRate`, se crea en T54) ni pantallas.

## Criterios de aceptación
- [ ] `mvnw flyway:migrate` sobre una base vacía crea las 9 tablas y `mvnw flyway:info` reporta la versión como `Success`.
- [ ] Todos los montos (`subtotal`, `discount_amount`, `shipping_amount`, `total`, `unit_price`, `amount`) son `BIGINT NOT NULL` con `CHECK (>= 0)`, y existe `CHECK (subtotal - discount_amount + shipping_amount = total)` en `orders`.
- [ ] `orders.status` y `payments.status` se guardan como `VARCHAR` con `CHECK` que replica exactamente RB-005 y RB-006.
- [ ] `order_items` copia `product_name` y `unit_price` al momento de la compra, de modo que desactivar o borrar un producto no altere pedidos históricos (RB-012).
- [ ] Existen índices para `orders(customer_id, created_at DESC)`, `orders(status)`, `payments(order_id)`, `payment_events(external_event_id) UNIQUE`, `coupons(code) UNIQUE`, `coupon_redemptions(coupon_id, customer_id)` y `order_status_history(order_id, created_at)`.
- [ ] La aplicación arranca con `spring.jpa.hibernate.ddl-auto=validate` sin diferencias entre entidades y esquema.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/resources/db/migration/V30__order_purchase_schema.sql` | config | 320 |
| `backend/src/main/resources/db/migration/V31__order_purchase_indexes.sql` | config | 120 |
| `backend/src/main/java/com/cremeco/pasteleria/order/domain/Order.java` | model | 220 |
| `backend/src/main/java/com/cremeco/pasteleria/order/domain/OrderItem.java` | model | 130 |
| `backend/src/main/java/com/cremeco/pasteleria/order/domain/OrderStatusHistory.java` | model | 100 |
| `backend/src/main/java/com/cremeco/pasteleria/coupon/domain/Coupon.java` | model | 160 |
| `backend/src/main/java/com/cremeco/pasteleria/coupon/domain/CouponRedemption.java` | model | 100 |
| `backend/src/main/java/com/cremeco/pasteleria/shipping/domain/ShippingZone.java` | model | 120 |
| `backend/src/main/java/com/cremeco/pasteleria/shipping/domain/Shipment.java` | model | 140 |
| `backend/src/main/java/com/cremeco/pasteleria/payment/domain/Payment.java` | model | 170 |
| `backend/src/main/java/com/cremeco/pasteleria/payment/domain/PaymentEvent.java` | model | 110 |
| `backend/src/test/java/com/cremeco/pasteleria/order/OrderSchemaIT.java` | util | 160 |

## Casos límite (Edge Cases)
- Migración ejecutada sobre una base que ya tenía tablas creadas por `ddl-auto=update`: la
  migración debe fallar de forma explícita y el README de operación indica recrear el volumen;
  no se usa `IF NOT EXISTS` para ocultar el conflicto.
- Dos pedidos intentan usar el mismo `external_event_id` de pago: la restricción `UNIQUE`
  rechaza el segundo y el repositorio lo traduce a un resultado idempotente, nunca a un error 500.
- Monto que excede `BIGINT`: validación previa en el servicio con mensaje claro; la columna
  rechaza el valor antes de persistir.
- Producto eliminado después de la compra: `order_items` conserva nombre y precio copiados y
  la FK hacia `products` queda anulable (`ON DELETE SET NULL`).

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas: `mvnw test` en verde (incluye `OrderSchemaIT`).
- [ ] Migración Flyway incluida y numerada dentro del bloque V30–V59.
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).

---

# Ticket T53 — API de cupones y CRUD admin

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 3
- **Rama sugerida:** feature/T53-cupones
- **Responsable:** Nicolas
- **Prioridad:** alta
- **Depende de:** T52

## Contexto
El cliente aplica cupones con lógica simulada en `frontend/src/context/cart.ts`; el backend
debe ser la única autoridad (RF-029, RB-002). Se necesita validar un código contra un subtotal
y administrar cupones desde la PWA con el permiso `coupons.manage`.

## Convenciones aplicables
- CONV-NAM-01
- CONV-NAM-03
- CONV-TIP-02
- CONV-ERR-01
- CONV-ERR-02
- CONV-ERR-03
- CONV-ERR-04
- CONV-SEG-03
- CONV-UI-01
- CONV-UI-02

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** `POST /api/v1/coupons/validate`, CRUD `/api/v1/admin/coupons`, cálculo de descuento,
  vigencia, mínimo de compra, límite global y por cliente, borrado lógico, permiso `coupons.manage`.
- **NO:** registrar el canje definitivo (lo hace T57 dentro de la transacción de checkout),
  acumulación de cupones (prohibida por RB-002) ni pantalla de cupones en la PWA (T60 es de pedidos;
  la pantalla de cupones queda para S5).

## Criterios de aceptación
- [ ] `POST /api/v1/coupons/validate` con un código válido y subtotal suficiente responde `200` con `applicable=true`, `discountAmount` en CLP entero y `finalSubtotal = subtotal - discountAmount`.
- [ ] Un código inexistente, vencido, no iniciado, inactivo, con mínimo no alcanzado o con usos agotados responde `200` con `applicable=false` y un `reason` distinto por caso (`COUPON_NOT_FOUND`, `COUPON_EXPIRED`, `COUPON_NOT_STARTED`, `COUPON_INACTIVE`, `MIN_SUBTOTAL_NOT_REACHED`, `USAGE_LIMIT_REACHED`).
- [ ] El código se normaliza a mayúsculas y sin espacios antes de buscar; `"  crema10 "` y `"CREMA10"` devuelven el mismo resultado.
- [ ] La vigencia se evalúa por día completo en `America/Santiago`: un cupón con `valid_until = 2026-10-31` sigue vigente el 2026-10-31 a las 23:59 y vence el 2026-11-01 a las 00:00.
- [ ] El descuento porcentual se redondea a peso con `HALF_UP` y se topa al subtotal; un cupón de monto fijo mayor al subtotal deja `finalSubtotal = 0` y `shipping` se cobra igual.
- [ ] El CRUD admin exige `coupons.manage`: sin el permiso responde `403` con el formato de error de T26; con el permiso permite crear, editar, desactivar y listar con paginación.
- [ ] El borrado es lógico (`deleted_at`) y un cupón con canjes registrados no puede eliminarse físicamente.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/java/com/cremeco/pasteleria/coupon/api/CouponController.java` | service | 120 |
| `backend/src/main/java/com/cremeco/pasteleria/coupon/service/CouponService.java` | service | 180 |
| `backend/src/main/java/com/cremeco/pasteleria/coupon/service/CouponCalculator.java` | service | 110 |
| `backend/src/main/java/com/cremeco/pasteleria/coupon/api/CouponAdminController.java` | service | 150 |
| `backend/src/main/java/com/cremeco/pasteleria/coupon/repository/CouponRepository.java` | model | 80 |
| `backend/src/main/java/com/cremeco/pasteleria/coupon/api/dto/CouponValidationResponse.java` | model | 60 |
| `backend/src/test/java/com/cremeco/pasteleria/coupon/CouponServiceTest.java` | util | 180 |

## Casos límite (Edge Cases)
- EC-004: el cupón expira entre la cotización y el checkout; T57 debe revalidar y responder
  `COUPON_INVALID` en lugar de confiar en el resultado anterior.
- Dos solicitudes simultáneas agotan el último uso global: la actualización de `used_count` se
  hace con `UPDATE ... WHERE used_count < max_uses` y se verifica el número de filas afectadas.
- Código con caracteres Unicode o espacios no separables: se normaliza con `strip()` y
  comparación `Locale.ROOT`; si queda vacío responde `400` con mensaje de validación.
- Cliente sin autenticar consulta usos por cliente: el límite por cliente solo se evalúa con
  sesión; sin sesión se informa `applicable=false` y `reason=LOGIN_REQUIRED`.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas: `mvnw test` en verde, con casos de cada `reason` cubiertos.
- [ ] Contrato OpenAPI actualizado para los endpoints de cupones.
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).

---

# Ticket T54 — API de zonas, tarifas y cotización

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 3
- **Rama sugerida:** feature/T54-envios-cotizacion
- **Responsable:** Nicolas
- **Prioridad:** alta
- **Depende de:** T52

## Contexto
Hoy el envío se calcula con una constante simulada en el carrito. RF-030 y RB-003 exigen zonas,
tarifas por comuna, retiro gratis y umbral de envío gratis, cotizados por el backend antes de
pagar. La PWA administra estos datos con `shipping.manage`.

## Convenciones aplicables
- CONV-NAM-01
- CONV-NAM-05
- CONV-TIP-02
- CONV-TIP-03
- CONV-ERR-01
- CONV-ERR-04
- CONV-SEG-03
- CONV-UI-02

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** `ShippingRate` (SUPUESTO: tabla `shipping_rates`, creada aquí porque T52 solo define
  `shipping_zones`), `POST /api/v1/shipping/quote`, CRUD `/api/v1/admin/shipping/zones` y
  `/rates`, retiro en tienda, umbral de envío gratis, permiso `shipping.manage`.
- **NO:** crear el `Shipment` del pedido (T55/T57), rastreo externo real ni cálculo de distancia.

## Criterios de aceptación
- [ ] `POST /api/v1/shipping/quote` recibe comuna, dirección y subtotal, y devuelve las dos opciones disponibles (`PICKUP` con costo `0` y `DELIVERY` con el costo de la zona) más el `freeShippingThreshold` aplicado.
- [ ] Si el subtotal alcanza el umbral configurado en la zona, `DELIVERY` devuelve `cost = 0` y `isFreeByThreshold = true`.
- [ ] Si la comuna no pertenece a ninguna zona activa, responde `422` con `code=SHIPPING_ZONE_NOT_COVERED` y no inventa una tarifa por defecto.
- [ ] La comuna se normaliza (mayúsculas, sin tildes, sin espacios extra) antes de buscar, de modo que `"ñuñoa"`, `"NUNOA"` y `"Nunoa"` cotizan igual.
- [ ] El CRUD admin de zonas y tarifas exige `shipping.manage` y responde `403` sin el permiso.
- [ ] Una zona con tarifas asociadas no se elimina físicamente: se desactiva con `is_active = false` (RB-012).
- [ ] El costo de envío calculado aquí se recalcula en el checkout (T57) y nunca se acepta el valor enviado por el cliente.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/resources/db/migration/V32__shipping_rates.sql` | config | 140 |
| `backend/src/main/java/com/cremeco/pasteleria/shipping/domain/ShippingRate.java` | model | 110 |
| `backend/src/main/java/com/cremeco/pasteleria/shipping/service/ShippingQuoteService.java` | service | 170 |
| `backend/src/main/java/com/cremeco/pasteleria/shipping/api/ShippingQuoteController.java` | service | 100 |
| `backend/src/main/java/com/cremeco/pasteleria/shipping/api/ShippingAdminController.java` | service | 150 |
| `backend/src/main/java/com/cremeco/pasteleria/shipping/service/ComunaNormalizer.java` | util | 80 |
| `backend/src/test/java/com/cremeco/pasteleria/shipping/ShippingQuoteServiceTest.java` | util | 170 |

## Casos límite (Edge Cases)
- EC-012: la dirección está en una comuna sin cobertura; el checkout debe bloquear el pago y
  ofrecer retiro en tienda, sin dejar el pedido en un estado inconsistente.
- Comuna duplicada en dos zonas activas: gana la de menor `priority`; si empatan, se registra
  advertencia y se usa la de menor `id` para que el resultado sea determinista.
- Subtotal exactamente igual al umbral: se considera envío gratis (comparación `>=`, inclusive).
- Dirección vacía o solo con espacios: `400` con error de validación antes de consultar zonas.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas: `mvnw test` en verde.
- [ ] Migración Flyway y contrato OpenAPI actualizados.
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).

---

# Ticket T55 — OrderService, estados e idempotencia

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 3
- **Rama sugerida:** feature/T55-order-service
- **Responsable:** Matias
- **Prioridad:** alta
- **Depende de:** T52

## Contexto
RF-031, RF-032 y RF-038 exigen crear pedidos con precios recalculados, historial de estados,
transiciones auditables y resistencia al doble submit. Este ticket es la base de T56, T57 y T60.
También implementa el descuento de stock al pasar a `PAGADO` (RB-004).

## Convenciones aplicables
- CONV-GEN-03
- CONV-NAM-01
- CONV-NAM-03
- CONV-TIP-01
- CONV-TIP-02
- CONV-TIP-03
- CONV-ERR-01
- CONV-ERR-03
- CONV-SEG-04
- CONV-DOC-02

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** `OrderService` (crear, obtener, listar, cambiar estado, cancelar), máquina de estados,
  historial `OrderStatusHistory`, recálculo de precios desde catálogo, validación de stock,
  descuento de stock al confirmar pago, clave de idempotencia persistida, permiso `orders.manage`
  (SUPUESTO: lectura con `orders.read`).
- **NO:** llamada al proveedor de pago (T56), composición del checkout (T57), pantallas (T59/T60).

## Criterios de aceptación
- [ ] `POST /api/v1/orders` recibe solo `items[{productId, quantity}]`, `delivery`, `addressId` y `couponCode`; ignora cualquier precio enviado y lo recalcula desde `products`.
- [ ] Un producto inactivo, sin stock o inexistente impide crear el pedido y responde `422` con `code=PRODUCT_UNAVAILABLE` o `code=INSUFFICIENT_STOCK` y el detalle por ítem.
- [ ] Toda transición se valida contra la matriz aprobada: `PENDIENTE → PAGADO | CANCELADO`, `PAGADO → EN_PREPARACION | CANCELADO`, `EN_PREPARACION → LISTO`, `LISTO → ENVIADO | ENTREGADO`, `ENVIADO → ENTREGADO`; `ENTREGADO` y `CANCELADO` son terminales. Una transición inválida responde `409` con `code=INVALID_STATE_TRANSITION`.
- [ ] Cada cambio de estado inserta una fila en `order_status_history` con estado anterior, nuevo, actor, motivo y timestamp.
- [ ] El header `Idempotency-Key` es obligatorio en `POST /api/v1/orders`; repetir la misma clave con el mismo payload devuelve la misma respuesta (`201`/`200`) marcada con `Idempotent-Replay: true` y no crea un segundo pedido.
- [ ] La misma clave con payload distinto responde `409` con `code=IDEMPOTENCY_KEY_REUSED`.
- [ ] Al pasar a `PAGADO` el stock se descuenta con bloqueo pesimista; si el stock ya no alcanza, el pedido pasa a `CANCELADO` y se informa `code=INSUFFICIENT_STOCK`.
- [ ] La cancelación se permite solo antes de `EN_PREPARACION`; si el pedido estaba `PAGADO`, se dispara reembolso simulado y el historial registra el motivo.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/java/com/cremeco/pasteleria/order/service/OrderService.java` | service | 240 |
| `backend/src/main/java/com/cremeco/pasteleria/order/service/OrderStatusMachine.java` | service | 120 |
| `backend/src/main/java/com/cremeco/pasteleria/order/service/OrderPricingService.java` | service | 150 |
| `backend/src/main/java/com/cremeco/pasteleria/order/api/OrderController.java` | service | 160 |
| `backend/src/main/java/com/cremeco/pasteleria/order/domain/IdempotencyRecord.java` | model | 100 |
| `backend/src/main/java/com/cremeco/pasteleria/order/repository/OrderRepository.java` | model | 90 |
| `backend/src/main/resources/db/migration/V33__order_idempotency.sql` | config | 90 |
| `backend/src/test/java/com/cremeco/pasteleria/order/OrderStatusMachineTest.java` | util | 140 |

## Casos límite (Edge Cases)
- EC-005: doble clic o reintento de red con la misma clave; solo se crea un pedido y el segundo
  request devuelve la respuesta original sin efectos secundarios.
- EC-001: dos clientes compran la última unidad; el bloqueo pesimista serializa la operación y
  el segundo recibe `INSUFFICIENT_STOCK` sin dejar stock negativo (RNF-008).
- EC-002: el precio cambió entre carrito y checkout; el pedido usa el precio vigente y la
  respuesta incluye `priceChanged=true` con el desglose nuevo.
- EC-003: el producto se desactiva entre la validación y la persistencia; la transacción se
  revierte completa y no queda un pedido parcial.
- Clave de idempotencia vencida (> 24 h): se purga por tarea programada y la clave se trata
  como nueva, registrando la limpieza en log.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas: `mvnw test` en verde, incluida la matriz completa de transiciones.
- [ ] Migración Flyway y contrato OpenAPI actualizados.
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).

---

# Ticket T56 — PaymentProvider simulado y webhook base

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 3
- **Rama sugerida:** feature/T56-payment-provider
- **Responsable:** Matias
- **Prioridad:** alta
- **Depende de:** T52, T55

## Contexto
RF-033 y RF-053 exigen pagos simulados (efectivo, tarjeta, transferencia) con fallos controlados
detrás de una interfaz `PaymentProvider` preparada para Flow (RF-054, RB-014). El webhook base
debe ser idempotente y resistente a eventos duplicados o fuera de orden (EC-006).

## Convenciones aplicables
- CONV-GEN-03
- CONV-TIP-02
- CONV-TIP-03
- CONV-ERR-01
- CONV-ERR-04
- CONV-SEG-01
- CONV-SEG-03
- CONV-SEG-04
- CONV-DOC-02

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** interfaz `PaymentProvider`, implementación `SimulatedPaymentProvider`, estados de pago,
  referencia externa única, `POST /api/v1/payments/webhook/simulated` idempotente, configuración
  por perfil (`payments.provider`), fallos controlados por token de prueba.
- **NO:** adaptador Flow real (T80), pantallas de pago, conciliación contable ni devolución real.

## Criterios de aceptación
- [ ] `PaymentProvider` declara `providerId()`, `createPayment()`, `confirmPayment()`, `refundPayment()` y `verifyWebhook()`; `SimulatedPaymentProvider` es la única implementación activa con `payments.provider=simulated`.
- [ ] Cada pago recibe un `externalReference` único y persistido; reintentar la creación con la misma clave de idempotencia devuelve el mismo pago.
- [ ] Los estados siguen RB-006 (`PENDING`, `AUTHORIZED`, `PAID`, `FAILED`, `CANCELLED`, `REFUNDED`) y solo se aplican transiciones permitidas.
- [ ] El webhook valida firma HMAC (SUPUESTO: header `X-Provider-Signature` y secreto desde variable de entorno) y responde `401` ante firma inválida sin revelar detalles.
- [ ] Un evento con `externalEventId` ya procesado responde `200` sin volver a modificar el pago ni el pedido.
- [ ] Un evento con timestamp anterior al último aplicado se guarda como `IGNORED` y no retrocede el estado del pago.
- [ ] Con `payments.provider` distinto de `simulated` y sin credenciales, la aplicación falla al arrancar con un mensaje explícito (RB-014).
- [ ] Los fallos controlados se activan con tokens de prueba (`tok_ok`, `tok_fail`, `tok_pending`) y no con montos mágicos documentados solo en código.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/java/com/cremeco/pasteleria/payment/provider/PaymentProvider.java` | service | 90 |
| `backend/src/main/java/com/cremeco/pasteleria/payment/provider/SimulatedPaymentProvider.java` | service | 200 |
| `backend/src/main/java/com/cremeco/pasteleria/payment/service/PaymentService.java` | service | 190 |
| `backend/src/main/java/com/cremeco/pasteleria/payment/api/PaymentWebhookController.java` | service | 130 |
| `backend/src/main/java/com/cremeco/pasteleria/payment/config/PaymentProviderConfig.java` | config | 90 |
| `backend/src/main/resources/application-dev.yml` | config | 70 |
| `backend/src/test/java/com/cremeco/pasteleria/payment/SimulatedPaymentProviderTest.java` | util | 170 |

## Casos límite (Edge Cases)
- EC-006: el webhook `PAID` llega duplicado o después de un `REFUNDED`; el duplicado se ignora
  y el evento tardío no revive un pago reembolsado.
- EC-007: referencia externa desconocida; responde `404` sin crear pagos ni pedidos, y el intento
  queda en el log estructurado con el identificador recibido.
- Timeout del proveedor: el pago queda `PENDING` (nunca `PAID` optimista) y el reintento es seguro
  gracias a la clave de idempotencia.
- Secreto HMAC ausente en el perfil activo: la aplicación no arranca; no se usa un valor por
  defecto en el código (CONV-SEG-01).

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas: `mvnw test` en verde, con webhook duplicado y fuera de orden cubiertos.
- [ ] Contrato OpenAPI y variables de entorno documentadas.
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).

---

# Ticket T57 — Checkout backend y validación transaccional

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 3
- **Rama sugerida:** feature/T57-checkout-backend
- **Responsable:** Matias
- **Prioridad:** alta
- **Depende de:** T53, T54, T55, T56

## Contexto
RF-034 exige un checkout que valide cliente, dirección, stock, cupón, envío y pago antes de
comprometer dinero. RNF-004 pide operaciones transaccionales e idempotentes. Este endpoint es
el contrato que consumirá T58.

## Convenciones aplicables
- CONV-GEN-03
- CONV-TIP-01
- CONV-TIP-02
- CONV-ERR-01
- CONV-ERR-02
- CONV-ERR-03
- CONV-ERR-04
- CONV-SEG-03
- CONV-SEG-04
- CONV-DOC-02

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** `POST /api/v1/checkout` con `Idempotency-Key`, validación completa, creación atómica de
  pedido + pago, registro de canje de cupón, `Shipment` inicial, respuestas de error por caso,
  llamada al proveedor después del commit.
- **NO:** UI (T58), listado/detalle de pedidos (T59/T60), POS (S4), Flow real (T80).

## Criterios de aceptación
- [ ] `POST /api/v1/checkout` con sesión válida, ítems con stock, cupón vigente, comuna cubierta y pago aceptado responde `201` con `orderId`, `orderNumber`, `status=PENDIENTE`, `paymentStatus`, desglose (`subtotal`, `discountAmount`, `shippingAmount`, `total`) y `createdAt` en ISO-8601.
- [ ] El pedido, sus ítems, el pago, el canje de cupón y el `Shipment` se persisten en una sola transacción: si falla cualquiera, no queda ninguna fila ni se consume un uso de cupón.
- [ ] Cada error de negocio tiene código y HTTP propio: `CART_EMPTY` (400), `ADDRESS_NOT_FOUND` (404), `SHIPPING_ZONE_NOT_COVERED` (422), `INSUFFICIENT_STOCK` (422 con detalle por ítem), `COUPON_INVALID` (422), `COUPON_MIN_SUBTOTAL` (422), `IDEMPOTENCY_KEY_REUSED` (409), `PAYMENT_DECLINED` (402).
- [ ] Los precios, el descuento y el envío se recalculan en servidor; un `total` enviado por el cliente se ignora y se registra en el log si difiere.
- [ ] El header `Idempotency-Key` es obligatorio; sin él responde `400` y con una clave repetida devuelve exactamente la misma respuesta sin duplicar pedido, pago ni canje.
- [ ] La llamada al proveedor ocurre **después** del commit y su resultado se aplica en una transacción corta; si el proveedor falla, el pedido queda `PENDIENTE` y el pago `FAILED` o `PENDING`, nunca `PAGADO`.
- [ ] `PAYMENT_DECLINED` deja el pedido `CANCELADO` y libera el uso de cupón en la misma operación de compensación.
- [ ] El endpoint está anotado con `@contract` y documentado en OpenAPI con ejemplos de error.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/java/com/cremeco/pasteleria/checkout/api/CheckoutController.java` | service | 150 |
| `backend/src/main/java/com/cremeco/pasteleria/checkout/service/CheckoutService.java` | service | 230 |
| `backend/src/main/java/com/cremeco/pasteleria/checkout/service/CheckoutValidator.java` | service | 170 |
| `backend/src/main/java/com/cremeco/pasteleria/checkout/api/dto/CheckoutRequest.java` | model | 110 |
| `backend/src/main/java/com/cremeco/pasteleria/checkout/api/dto/CheckoutResponse.java` | model | 90 |
| `backend/src/test/java/com/cremeco/pasteleria/checkout/CheckoutIntegrationTest.java` | util | 240 |

## Casos límite (Edge Cases)
- EC-020: se pierde la conexión después de enviar el checkout; al reintentar con la misma clave
  el cliente recibe el pedido ya creado en lugar de un duplicado.
- El cupón alcanza su último uso entre la cotización y el commit: la transacción falla completa,
  el pedido no se crea y se responde `COUPON_INVALID` con mensaje comprensible.
- El pago queda `PENDING`: el pedido permanece `PENDIENTE`, no se descuenta stock y la respuesta
  indica `paymentStatus=PENDING` con instrucción de reintento.
- Dirección de otro cliente: se responde `404 ADDRESS_NOT_FOUND` (no `403`) para no filtrar la
  existencia del recurso (CONV-SEG-04).

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas: `mvnw test` en verde, incluida la prueba de rollback completo.
- [ ] Contrato OpenAPI actualizado y publicado (RF-005).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).

---

# Ticket T58 — Cliente: checkout real y confirmación

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 3
- **Rama sugerida:** feature/T58-checkout-cliente
- **Responsable:** Anais
- **Prioridad:** alta
- **Depende de:** T48, T57

## Contexto
`frontend/src/pages/cliente/Checkout.tsx` hoy simula el pago y el cupón con datos locales.
RF-031, RF-034 y RF-035 exigen consumir la API real y mostrar una confirmación con el resumen
del pedido. El carrito puede seguir en `localStorage`, pero los importes mandan desde el backend.

## Convenciones aplicables
- CONV-NAM-01
- CONV-NAM-04
- CONV-TIP-01
- CONV-TIP-02
- CONV-ERR-01
- CONV-ERR-04
- CONV-SEG-03
- CONV-UI-01
- CONV-UI-02
- CONV-UI-03
- CONV-UI-04

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** `checkoutApi`, hook `useCheckout`, checkout con dirección, entrega (retiro/domicilio),
  cupón validado por API, método de pago simulado, clave de idempotencia por intento, mapeo de
  errores a campos y banner, pantalla `/confirmacion/:orderId`.
- **NO:** perfil e historial (T59), pago real con Flow, rediseño del carrito.

## Criterios de aceptación
- [ ] El botón de pago llama a `POST /api/v1/checkout` con un `Idempotency-Key` generado una vez por intento y reutilizado en los reintentos; el botón se deshabilita mientras `isSubmitting` es `true`.
- [ ] La cotización de envío y el cupón se solicitan a la API al cambiar comuna o código, y el desglose mostrado coincide peso a peso con la respuesta del servidor.
- [ ] Cada código de error del backend se traduce a un mensaje en español y a un campo concreto (`INSUFFICIENT_STOCK` junto a los ítems, `COUPON_INVALID` junto al cupón, `SHIPPING_ZONE_NOT_COVERED` junto a la dirección, `PAYMENT_DECLINED` en el bloque de pago).
- [ ] Al recibir `201` se vacía el carrito y se navega a `/confirmacion/:orderId`, que muestra número de pedido, estado, ítems, desglose y método de envío.
- [ ] `/confirmacion/:orderId` funciona al recargar la página (no depende del estado en memoria) y muestra estado de carga, error y datos.
- [ ] Un pedido ajeno o inexistente muestra un mensaje neutro sin filtrar datos.
- [ ] La vista no usa `any` ni clases del snapshot (`mockup/`); usa `Card`, `Button`, `Input`, `EmptyState` y tokens del design system.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `frontend/src/services/checkoutApi.ts` | service | 150 |
| `frontend/src/hooks/useCheckout.ts` | hook | 180 |
| `frontend/src/pages/cliente/Checkout.tsx` | component | 240 |
| `frontend/src/pages/cliente/Confirmacion.tsx` | component | 170 |
| `frontend/src/types/checkout.ts` | model | 120 |
| `frontend/src/components/domain/ResumenPedido.tsx` | component | 110 |

## Casos límite (Edge Cases)
- EC-005: doble clic o doble `submit` por Enter; la segunda llamada se bloquea en cliente y,
  si igual llega, el backend devuelve el mismo pedido por idempotencia.
- EC-002: el precio cambió; el checkout muestra el nuevo desglose y pide confirmación explícita
  antes de reintentar, sin cambiar la clave de idempotencia de ese intento.
- EC-001: el stock se agota mientras el usuario completa el formulario; el error se ancla al
  ítem afectado y permite ajustar cantidades sin perder los datos de entrega.
- Sesión expirada al pagar (EC-008): se intenta refrescar una vez; si falla, se conserva el
  formulario y se redirige a login con retorno a `/checkout`.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas en frontend y `npm run lint` / `npm run build` en 0.
- [ ] Contrato OpenAPI consumido sin tipos manuales divergentes.
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).

---

# Ticket T59 — Cliente: perfil, historial y seguimiento

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 3
- **Rama sugerida:** feature/T59-perfil-pedidos-cliente
- **Responsable:** Anais
- **Prioridad:** alta
- **Depende de:** T57, T58

## Contexto
RF-036 exige que el cliente vea su perfil, sus direcciones, su historial y el seguimiento. Hoy
`/perfil` es un `Placeholder` y los pedidos no existen en el cliente. Se reemplaza la sesión
simulada por datos reales de la API y se protegen las rutas.

## Convenciones aplicables
- CONV-NAM-01
- CONV-TIP-01
- CONV-TIP-02
- CONV-ERR-01
- CONV-ERR-04
- CONV-SEG-04
- CONV-UI-01
- CONV-UI-02
- CONV-UI-03
- CONV-UI-04

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** `/perfil` con datos y direcciones (listar, crear, editar, marcar predeterminada),
  `/perfil/pedidos` con paginación, `/perfil/pedidos/:id` con detalle, línea de tiempo de estados
  y datos de envío, guard de sesión con retorno.
- **NO:** edición de contraseña (S1), cancelación de pedido desde el cliente (SUPUESTO: se evalúa
  en S5), seguimiento con transportista real.

## Criterios de aceptación
- [ ] `/perfil` muestra nombre, email y teléfono desde `GET /api/v1/me` y permite crear, editar y marcar una dirección predeterminada; los cambios persisten al recargar.
- [ ] `/perfil/pedidos` lista pedidos con número, fecha en `America/Santiago`, estado y total, con paginación y filtro por estado; el estado vacío muestra `EmptyState` con CTA al catálogo.
- [ ] `/perfil/pedidos/:id` muestra ítems, desglose de dinero, dirección o retiro, método de pago y la línea de tiempo de estados en orden cronológico.
- [ ] Un pedido de otro cliente o inexistente responde con mensaje neutro y sin datos ajenos; la API responde `404`.
- [ ] Sin sesión válida, las tres rutas redirigen a login y vuelven a la ruta solicitada después de autenticarse.
- [ ] Todos los montos se formatean con `formatPrecio` (CLP) y las fechas se muestran en la zona de la tienda, sin conversiones manuales dispersas.
- [ ] La vista contempla carga, vacío, error y datos (CONV-UI-02) y es usable a 360 px.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `frontend/src/pages/cliente/Perfil.tsx` | component | 220 |
| `frontend/src/pages/cliente/PedidosCliente.tsx` | component | 200 |
| `frontend/src/pages/cliente/PedidoDetalle.tsx` | component | 220 |
| `frontend/src/services/ordersApi.ts` | service | 160 |
| `frontend/src/components/domain/EstadoPedidoBadge.tsx` | component | 80 |
| `frontend/src/components/domain/LineaTiempoPedido.tsx` | component | 120 |
| `frontend/src/routes/RequireAuth.tsx` | component | 90 |

## Casos límite (Edge Cases)
- EC-008: el token expira mientras se navega el historial; se refresca una vez y se reintenta la
  misma consulta sin perder la página actual.
- Historial vacío por cliente recién registrado: se muestra estado vacío, no una tabla en blanco
  ni un error.
- Pedido `CANCELADO`: no muestra línea de tiempo de envío futura, solo los estados ocurridos.
- Dirección predeterminada eliminada: el checkout siguiente (T58) obliga a elegir otra y lo indica
  con un mensaje, sin romper el formulario.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas en frontend y `npm run lint` / `npm run build` en 0.
- [ ] Contrato OpenAPI consumido y guards cubiertos por prueba.
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).

---

# Ticket T60 — PWA: pantalla de pedidos y transiciones

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 3
- **Rama sugerida:** feature/T60-pwa-pedidos
- **Responsable:** Anais
- **Prioridad:** alta
- **Depende de:** T55, T57

## Contexto
RF-037 exige que el administrador vea, filtre y cambie el estado de los pedidos. La ruta
`admin/pedidos` está en `Placeholder`. La PWA usa React + Bootstrap 5 y **no** Tailwind (RNF-001).

## Convenciones aplicables
- CONV-NAM-01
- CONV-TIP-01
- CONV-TIP-02
- CONV-ERR-01
- CONV-ERR-04
- CONV-SEG-04
- CONV-UI-01
- CONV-UI-02
- CONV-UI-03

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** listado con filtros y paginación, detalle con ítems, pagos e historial, modal de cambio
  de estado con motivo, transiciones habilitadas según la matriz de T55 y los permisos
  (SUPUESTO: `orders.read` para consulta, `orders.manage` para transiciones), estados de carga,
  vacío y error, guard por URL directa.
- **NO:** crear pedidos desde la PWA, editar ítems, reembolsos manuales, reportes (S5).

## Criterios de aceptación
- [ ] `/admin/pedidos` lista pedidos paginados en servidor con columnas número, fecha (`America/Santiago`), cliente, total, estado y pago; los filtros por estado, rango de fechas y búsqueda por número o email se reflejan en la URL.
- [ ] El rango de fechas es inclusivo por día y se interpreta en la zona de la tienda; fechas invertidas muestran validación y no disparan la consulta (RB-018).
- [ ] `/admin/pedidos/:id` muestra ítems con precio y cantidad, desglose de dinero, datos de entrega, pagos con su estado e historial de estados con actor y timestamp.
- [ ] El cambio de estado solo ofrece las transiciones válidas desde el estado actual y solo se muestra con `orders.manage`; sin el permiso, la acción no aparece y la API responde `403`.
- [ ] Cada cambio exige motivo cuando el destino es `CANCELADO` y confirma antes de aplicar; al éxito se refresca el detalle y se anuncia con un mensaje no bloqueante.
- [ ] La pantalla contempla carga (skeleton o spinner Bootstrap), vacío, error con reintento y datos.
- [ ] La UI usa Bootstrap 5 y componentes propios del admin; no importa Tailwind ni clases del cliente.
- [ ] Acceder por URL directa sin permiso muestra la pantalla de acceso denegado y no deja la tabla vacía (EC-011).

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `admin/src/pages/pedidos/PedidosListPage.tsx` | component | 230 |
| `admin/src/pages/pedidos/PedidoDetallePage.tsx` | component | 250 |
| `admin/src/components/pedidos/TransicionEstadoModal.tsx` | component | 150 |
| `admin/src/components/pedidos/EstadoPedidoBadge.tsx` | component | 80 |
| `admin/src/services/ordersApi.ts` | service | 150 |
| `admin/src/hooks/useOrders.ts` | hook | 160 |

## Casos límite (Edge Cases)
- Dos administradores cambian el estado del mismo pedido: el segundo recibe `409 INVALID_STATE_TRANSITION`
  con el estado vigente y la pantalla se refresca sin perder el contexto de filtros.
- Filtro sin resultados: se muestra estado vacío con opción de limpiar filtros, no un error.
- Rol modificado con la sesión abierta (EC-009): el backend rechaza la transición y la UI
  actualiza los permisos visibles tras el `403`.
- Pedido con pago `PENDING`: el botón de avance a `EN_PREPARACION` permanece deshabilitado con
  una explicación, porque la matriz exige `PAGADO`.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas en admin y `npm run lint` / `npm run build` en 0.
- [ ] Contrato OpenAPI consumido y revisado.
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).

---

# Ticket T61 — Pruebas de compra, concurrencia y doble submit

## Metadatos
- **Tipo:** test
- **Fase / Sprint:** F3 · Sprint 3
- **Rama sugerida:** feature/T61-pruebas-compra
- **Responsable:** Nicolas
- **Prioridad:** alta
- **Depende de:** T53, T54, T55, T56, T57, T58, T59, T60

## Contexto
RF-064, RF-065 y RNF-008 exigen evidencia automatizada de los caminos críticos de compra.
Este ticket cierra el sprint demostrando que los edge cases EC-001, EC-004, EC-005 y EC-006
están resueltos y que los totales cuadran.

## Convenciones aplicables
- CONV-GEN-02
- CONV-TIP-01
- CONV-TIP-03
- CONV-ERR-01
- CONV-ERR-02
- CONV-ERR-04
- CONV-DOC-03

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** pruebas de integración de checkout con MySQL de test (SUPUESTO: Testcontainers),
  concurrencia de última unidad, doble submit, cupón inválido, stock insuficiente, pago fallido,
  transición inválida, cálculo de totales y pruebas de frontend del servicio de checkout y del
  doble clic.
- **NO:** E2E con Playwright (T84), pruebas de POS (T70), pruebas de Flow (T81), pruebas de carga.

## Criterios de aceptación
- [ ] La suite de backend cubre: cupón inexistente, vencido y bajo el mínimo; stock insuficiente; pago `FAILED`; transición inválida (`409`); totales con cupón porcentual y monto fijo.
- [ ] Un test de concurrencia con dos hilos sobre la última unidad produce exactamente un pedido `PAGADO` y un rechazo `INSUFFICIENT_STOCK`, con stock final `0` (nunca negativo).
- [ ] Un test de doble submit envía dos `POST /api/v1/checkout` con la misma `Idempotency-Key` y verifica un solo pedido, un solo pago y un solo canje de cupón.
- [ ] Un test verifica que un fallo del proveedor deja el pedido sin stock descontado y sin estado `PAGADO`.
- [ ] Un test de totales comprueba `subtotal - discount + shipping = total`, el redondeo `HALF_UP` y que el descuento se topa al subtotal.
- [ ] Las pruebas de frontend cubren el mapeo de cada código de error a su mensaje y que el segundo clic no dispara una segunda petición.
- [ ] `mvnw test` y `npm run test` pasan en verde y la evidencia (salida y capturas de la corrida) queda enlazada en `docs/estado_proyecto.md`.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/test/java/com/cremeco/pasteleria/checkout/CheckoutFlowIT.java` | util | 260 |
| `backend/src/test/java/com/cremeco/pasteleria/order/OrderConcurrencyIT.java` | util | 200 |
| `backend/src/test/java/com/cremeco/pasteleria/coupon/CouponRulesTest.java` | util | 170 |
| `backend/src/test/java/com/cremeco/pasteleria/order/OrderTotalsTest.java` | util | 150 |
| `frontend/src/services/__tests__/checkoutApi.test.ts` | util | 170 |
| `frontend/src/pages/cliente/__tests__/Checkout.test.tsx` | util | 210 |

## Casos límite (Edge Cases)
- El contenedor de MySQL tarda en levantar: las pruebas esperan el healthcheck y no fallan por
  timeout arbitrario; el `@limit` y el tiempo de suite quedan documentados.
- Dos pruebas de concurrencia corren en paralelo y compiten por el mismo producto: cada una crea
  sus propios datos con un `productId` distinto para no acoplarse.
- Test de totales con cupón del 100 %: el total queda igual al envío (o `0` si es retiro) y no
  se generan valores negativos.
- Pago `PENDING` en el test de fallo: se verifica explícitamente que no hay descuento de stock
  ni historial con estado `PAGADO`.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas: `mvnw test` y `npm run test` en verde, evidencia adjunta.
- [ ] Cobertura de los edge cases EC-001, EC-004, EC-005 y EC-006 demostrada.
- [ ] `docs/estado_proyecto.md` actualizado con el resultado de la corrida.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).

---

## Checklist de cierre del sprint

- [ ] T52 a T61 están en estado `Hecho` en `docs/plan_sprints.md`.
- [ ] Las migraciones V30–V59 están aplicadas y `mvnw flyway:info` no reporta pendientes.
- [ ] `mvnw test` pasa completo, incluidas las pruebas de concurrencia y doble submit de T61.
- [ ] `npm run lint` y `npm run build` pasan en `frontend/` y en `admin/`.
- [ ] El contrato OpenAPI de compra está publicado y los tipos TypeScript regenerados sin `any`.
- [ ] El checkout del cliente (`frontend/src/pages/cliente/Checkout.tsx`) ya no usa lógica simulada de cupón ni de envío.
- [ ] La confirmación `/confirmacion/:orderId` y el historial `/perfil/pedidos` funcionan contra la API.
- [ ] La PWA `/admin/pedidos` permite filtrar, ver el detalle y cambiar estado según permisos.
- [ ] Los permisos `coupons.manage`, `shipping.manage` y `orders.manage` existen en la matriz de T36 y están asignados a `ADMIN`.
- [ ] `docs/estado_proyecto.md` refleja el cierre del Sprint 3 y el próximo paso (S4 — POS e inventario).
- [ ] `docs/cicatrices_guerra.md` registra los bugs resueltos durante el sprint.
- [ ] No queda código muerto, `console.log` ni datos simulados de compra en el repositorio (CONV-GEN-02).

## Criterios de salida

1. **Compra de punta a punta:** carrito → checkout → pago simulado → confirmación → seguimiento,
   contra MySQL y sin datos mock.
2. **Backend como fuente de verdad:** precios, descuento, envío, stock y estados se calculan y
   validan en el servidor; el cliente solo presenta.
3. **Integridad:** no existe stock negativo, no se duplican pedidos por doble submit y todo cambio
   de estado queda en `order_status_history`.
4. **Trazabilidad:** cada ticket referencia requisitos (RF), reglas (RB) y edge cases (EC) del
   backlog, y su Definition of Done está completo.
5. **Calidad verificable:** pruebas de compra, concurrencia y doble submit en verde, con evidencia
   registrada en `docs/estado_proyecto.md`.
6. **Aprobación explícita del usuario** antes de avanzar a F4 o al Sprint 4.
