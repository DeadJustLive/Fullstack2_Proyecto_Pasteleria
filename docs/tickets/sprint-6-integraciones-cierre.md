# Sprint 6 — Integraciones y Cierre

> **Fase:** F3 — Ejecución por tickets (cierre) · **Sprint:** S6 · **Tickets:** T80–T88
> **Estado:** Pendiente de aprobación · **Última actualización:** 2026-10-23
> **Plan:** [`docs/plan_sprints.md`](../plan_sprints.md) · **Backlog:** [`docs/backlog_requisitos.md`](../backlog_requisitos.md) · **Plantilla:** [`docs/plantilla_ticket.md`](../plantilla_ticket.md)

---

## Propósito

Cerrar el MVP local de Crème & Co dejando el sistema conmutable y verificable:

1. Integrar Flow detrás de `PaymentProvider` sin romper el pago simulado ni acoplar los pedidos al proveedor.
2. Endurecer la PWA offline (reintentos, conflictos, cuota) y la seguridad de la API (rate limiting, headers, CORS, secretos, logs).
3. Cubrir los flujos críticos de cliente, admin y POS offline con Playwright.
4. Medir y documentar performance, SEO y Lighthouse con umbrales explícitos.
5. Eliminar el CSS del mockup y dejar el design system como única fuente visual del cliente.
6. Cerrar F4 (validación) y F5 (extracción y aprendizajes) con evidencias, documentación de operación y cicatrices registradas.

El sprint no agrega módulos de negocio nuevos: integra, endurece, prueba, mide y documenta lo construido en S0–S5.

---

## Índice de tickets

| ID | Título | Responsable | Prioridad | Depende de | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [T80](#ticket-t80--adaptador-flow-y-webhook) | Adaptador Flow y webhook | Matias | Alta | T56, T57 | Pendiente |
| [T81](#ticket-t81--pruebas-de-flow-y-documentación) | Pruebas de Flow y documentación | Nicolas | Alta | T80 | Pendiente |
| [T82](#ticket-t82--pwa-offline-hardening-y-conflictos) | PWA offline hardening y conflictos | Matias | Media | T69, T73 | Pendiente |
| [T83](#ticket-t83--endurecimiento-de-seguridad) | Endurecimiento de seguridad | Nicolas | Alta | T33, T42, T57, T66 | Pendiente |
| [T84](#ticket-t84--e2e-con-playwright) | E2E con Playwright | Anais | Alta | T58, T60, T67, T69, T82 | Pendiente |
| [T85](#ticket-t85--performance-seo-y-lighthouse) | Performance, SEO y Lighthouse | Anais | Media | T48, T49, T58, T59, T76 | Pendiente |
| [T86](#ticket-t86--migración-final-y-eliminación-de-mockup) | Migración final y eliminación de mockup | Anais | Media | T48, T49, T76 | Pendiente |
| [T87](#ticket-t87--documentación-final-y-cicatrices) | Documentación final y cicatrices | Matias | Media | T84, T85, T86 | Pendiente |
| [T88](#ticket-t88--cierre-f4f5-y-extracción-de-componentes) | Cierre F4/F5 y extracción de componentes | Matias | Media | T87 | Pendiente |

Estados: `Pendiente` · `En curso` · `En revisión` · `Hecho` · `Bloqueado`.

---

## Contexto y supuestos del sprint

### Stack y entorno aprobado

| Capa | Tecnología | Puerto / ruta |
| :--- | :--- | :--- |
| Cliente | React 18.3 + TypeScript 5.6 + Vite 5 + React Router 7 + Tailwind v4 | `frontend/` · `http://localhost:5173` |
| Admin PWA | React 18.3 + TypeScript 5.6 + Vite 5 + Bootstrap 5 (sin Tailwind) | `admin/` · `http://localhost:5174` |
| API | Spring Boot 3.5 + Java 21 + Maven Wrapper + JPA + Security + Flyway | `backend/` · `http://localhost:8080` |
| Base de datos | MySQL 8 vía Docker Compose | `infra/docker-compose.yml` · `localhost:3306` |
| Autenticación | JWT + RBAC dinámico | Access 15 min · refresh 7 días |
| Pagos | `PaymentProvider` simulado + adaptador Flow | Activable por configuración |
| Pruebas | JUnit, MockMvc, WireMock, Vitest, Playwright, Lighthouse local | Solo entorno local |

Reglas transversales:

- El **backend es la fuente de verdad** de precios, stock, pedidos, permisos y estados de pago. El frontend solo presenta y valida UX.
- El cliente no carga Bootstrap y la PWA admin no carga Tailwind (RNF-001).
- TypeScript estricto, sin `any`; Java con DTOs y tipos explícitos (RNF-005).
- Moneda CLP entera y fechas en `America/Santiago`, ISO-8601 (RNF-009).
- Sin secretos en el repositorio; `.env` fuera de Git y `.env.example` con placeholders (CONV-SEG-01, CONV-SEG-02).
- El mockup (`MockUpPasteleria/`) es solo referencial. La estructura final es React-idiomática.

### Supuestos del sprint

1. **SUPUESTO:** S0–S5 están cerrados (T21–T79) y sus contratos base existen: `PaymentProvider`, `OrderService`, cola offline del POS y RBAC dinámico. Si un contrato difiere, se actualiza primero el OpenAPI y luego el ticket.
2. **SUPUESTO:** la API usa el prefijo `/api` y expone `/api/webhooks/flow` como ruta pública firmada. Los paths exactos se confirman contra el contrato de T56 antes de programar.
3. **SUPUESTO:** la última migración Flyway de S5 es `V33`; T80 reserva `V60` con el coordinador. Ningún otro ticket usa ese número.
4. **SUPUESTO:** Flow sandbox es accesible desde el entorno local. Los tests automatizados usan mocks/WireMock y **no** dependen de Internet; el smoke test manual contra sandbox se ejecuta con credenciales reales de prueba.
5. **SUPUESTO:** Flow no puede alcanzar `localhost`; para el webhook real se usa un túnel de desarrollo (ngrok o cloudflared) y se documenta la URL pública temporal. El túnel no es un despliegue.
6. **SUPUESTO:** los archivos de prueba usan `@kind(test)`; T87 lo registra en `docs/sistema_anotaciones.md` para que el vocabulario quede completo.
7. **SUPUESTO:** las rutas del admin son `/pos`, `/pos/pendientes` y `/pos/conflictos` sobre React Router; se ajustan a la estructura real de T67/T69 sin cambiar el alcance.
8. **SUPUESTO:** Playwright usa Chromium y un viewport móvil; la matriz completa de navegadores queda fuera del MVP. Lighthouse se ejecuta sobre build de producción local con preset móvil.
9. **SUPUESTO:** no hay SSR ni prerender. El SEO se resuelve con metadatos por ruta, JSON-LD y `sitemap.xml` estático; las rutas privadas quedan `noindex`.
10. **SUPUESTO:** el equipo mantiene la regla de no solapar archivos compartidos. `application.yml` se reserva a T80 y T83 en secuencia; `main.tsx` a T86; `estado_proyecto.md` y `cicatrices_guerra.md` a T87/T88 en secuencia; `pca.config.json` a T86/T88.

---

## Orden de ejecución y reglas de paralelización

### Secuencia recomendada

```text
T80 → T81 ─┬→ T83 → T84 ─┐
           │              ├→ T87 → T88
T82 ───────┴──────────────┤
T85 ──────────────────────┤
T86 ──────────────────────┘
```

- **T80 y T81** son secuenciales: primero se implementa el adaptador, luego se prueban y documentan sus contratos.
- **T83** puede ejecutarse en paralelo con T82/T85/T86, pero **no** con T80 porque ambos editan `application.yml`.
- **T84** requiere T82 cerrado para cubrir la UI de conflictos offline; el plan original solo exige T69 y aquí se agrega como dependencia operativa.
- **T85 y T86** pueden ejecutarse en paralelo porque no comparten archivos: T85 se limita a `App.tsx`, metadatos y scripts; T86 a Navbar/Footer/Catálogo/`main.tsx`. Si T85 necesita tocar `Catalogo.tsx`, se coordina con T86 antes de editar.
- **T87** consume las evidencias de T84, T85 y T86. **T88** cierra F4/F5 después de que la documentación esté estable.
- Máximo **3 frentes simultáneos** (Matias, Nicolas, Anais), una rama por ticket desde `develop`.

### Archivos compartidos reservados

| Archivo | Ticket dueño | Regla |
| :--- | :--- | :--- |
| `backend/src/main/resources/application.yml` | T80, luego T83 | Secuencial; cada uno agrega solo su bloque y documenta el cambio |
| `frontend/src/main.tsx` | T86 | Solo T86 elimina el import del mockup |
| `frontend/src/App.tsx` | T85 | Solo T85 agrega lazy loading y Suspense |
| `docs/estado_proyecto.md` | T87, luego T88 | Secuencial; T88 deja el estado final F5 |
| `docs/cicatrices_guerra.md` | T81, T87, T88 | Se agregan entradas, nunca se reescriben las existentes |
| `tools/pca.config.json` | T86, luego T88 | T86 elimina el mockup; T88 registra componentes extraídos |
| `package.json` raíz | T84 | Solo T84 agrega scripts y dependencia de Playwright |

---

# Ticket T80 — Adaptador Flow y webhook

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 6
- **Rama sugerida:** feature/T80-adaptador-flow-webhook
- **Responsable:** Matias
- **Prioridad:** alta
- **Depende de:** T56, T57

## Contexto
Flow debe integrarse como segundo proveedor de pago sin romper el pago simulado ni acoplar los pedidos a un proveedor concreto. El requisito exige crear pagos, recibir webhooks y confirmar pedidos (RF-053, RF-054, RF-055), respetando los estados de pago de RB-006 y la activación por configuración de RB-014. Los riesgos principales son el webhook duplicado o fuera de orden (EC-006), la firma inválida o referencia desconocida (EC-007) y la doble confirmación de stock (RNF-004, RB-004).

La activación es explícita: con `PAYMENTS_FLOW_ENABLED=false` (valor por defecto), la API sigue usando el proveedor simulado y arranca normalmente. Con la bandera activa pero credenciales incompletas, la API falla temprano indicando la variable faltante, sin imprimir su valor. Con Flow activo, el monto y la referencia se calculan siempre desde el pedido en el backend; nunca se confía en valores enviados por el navegador.

**SUPUESTO:** los endpoints propuestos son `POST /api/payments/flow/create`, `GET /api/payments/flow/return` y `POST /api/webhooks/flow`. Si T56 definió otro prefijo o nombre, se respeta el contrato existente y se actualiza este ticket antes de codificar.

## Convenciones aplicables
- CONV-NAM-01
- CONV-NAM-02
- CONV-NAM-07
- CONV-TIP-01
- CONV-TIP-02
- CONV-ERR-01
- CONV-ERR-02
- CONV-ERR-03
- CONV-ERR-04
- CONV-SEG-01
- CONV-SEG-02
- CONV-SEG-03
- CONV-SEG-04
- CONV-DOC-01
- CONV-DOC-02
- CONV-DOC-05

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** implementar `FlowPaymentProvider` detrás de `PaymentProvider`; configuración tipada por entorno; creación de pago; URL de retorno; webhook firmado y verificado; idempotencia; mapeo de estados; persistencia del intento de pago; actualización de OpenAPI y del contrato de tipos.
- **NO:** reembolsos reales desde la PWA; conciliación contable; multi-moneda; suscripciones; rediseño del checkout (T58 solo consume la URL); cambios de reglas de negocio de pedidos fuera de la confirmación de pago; despliegue en cloud.

## Criterios de aceptación
- [ ] `FlowPaymentProvider` implementa `PaymentProvider` y solo se selecciona con `PAYMENTS_FLOW_ENABLED=true` y credenciales completas; con la bandera apagada, la API arranca con el proveedor simulado; con la bandera activa y credenciales incompletas, falla al arrancar indicando la variable faltante sin imprimir el valor (RB-014).
- [ ] `POST /api/payments/flow/create` persiste un intento en estado `PENDING`, calcula el monto desde el pedido y devuelve la URL de Flow con su token; repetir la llamada con la misma clave de idempotencia devuelve el mismo intento y no crea un segundo pago.
- [ ] `GET /api/payments/flow/return` verifica el estado contra la API de Flow antes de responder y redirige a `/confirmacion` con el código de pedido; un parámetro de query manipulado no confirma el pago por sí solo.
- [ ] `POST /api/webhooks/flow` valida firma y referencia; un evento `PAID` válido ejecuta la transición `PENDIENTE → PAGADO` una sola vez y descuenta stock una sola vez; un duplicado responde 200 sin mutar nada; una firma inválida responde 401; una referencia desconocida responde 404 sin filtrar datos.
- [ ] Los eventos fuera de orden no revierten estados: `PENDING` después de `PAID` se ignora, y un `PAID` tardío sobre un pedido `CANCELADO` queda en revisión manual sin confirmar ni descontar stock.
- [ ] La configuración vive en variables de entorno y `application.yml` con placeholders; el repositorio no contiene secretos, y los logs de creación, retorno y webhook enmascaran token, firma y claves (CONV-SEG-01, RNF-002).
- [ ] El OpenAPI documenta los tres endpoints, los DTO de entrada/salida y los códigos de error; los tipos TypeScript generados compilan en cliente y admin.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/java/com/cremeco/pasteleria/payment/flow/FlowPaymentProvider.java` | service | 180 |
| `backend/src/main/java/com/cremeco/pasteleria/payment/flow/FlowProperties.java` | config | 90 |
| `backend/src/main/java/com/cremeco/pasteleria/payment/flow/FlowSignatureVerifier.java` | util | 90 |
| `backend/src/main/java/com/cremeco/pasteleria/payment/flow/FlowWebhookController.java` | component | 120 |
| `backend/src/main/java/com/cremeco/pasteleria/payment/flow/FlowWebhookService.java` | service | 190 |
| `backend/src/main/resources/db/migration/V60__flow_payment.sql` | config | 80 |
| `backend/src/main/resources/application.yml` | config | 140 |
| `backend/src/main/resources/openapi.yaml` | doc | 400 |

**SUPUESTO:** la ruta del contrato OpenAPI (`backend/src/main/resources/openapi.yaml`) es la definida en T25. Si T25 usa otra ubicación, se actualiza allí y se corrige esta tabla.

## Casos límite (Edge Cases)
- **Timeout después de crear el pago en Flow:** la API no recibe la respuesta pero Flow sí creó el pago. El intento queda `UNKNOWN`, no se reintenta la creación automáticamente y se muestra "pago en revisión"; la conciliación usa `commerceOrder` y el estado real de Flow.
- **Webhook duplicado o simultáneo (EC-006):** dos entregas del mismo evento llegan a la vez. La clave única del evento y el bloqueo del pedido garantizan una sola transición y un solo movimiento de stock; la segunda entrega responde 200.
- **Firma inválida o referencia desconocida (EC-007):** se responde 401 o 404 respectivamente, se registra el intento sin datos sensibles y no se modifica ningún pedido.
- **Monto o moneda no coinciden con el pedido:** el webhook se rechaza como evento inválido y el pedido permanece en su estado anterior; se alerta en el log para revisión.
- **Flow no disponible:** el pedido queda `PENDING`; el retorno y el webhook reintentan la consulta de estado sin confirmar a ciegas y sin perder el intento.
- **Retorno y webhook llegan casi al mismo tiempo:** ambos pasan por la máquina de estados y por la misma clave de idempotencia; el segundo es un no-op.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] Evidencia adjunta (comandos, salida o captura) en el ticket.
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).

---

# Ticket T81 — Pruebas de Flow y documentación

## Metadatos
- **Tipo:** test
- **Fase / Sprint:** F3 · Sprint 6
- **Rama sugerida:** feature/T81-pruebas-flow-documentacion
- **Responsable:** Nicolas
- **Prioridad:** alta
- **Depende de:** T80

## Contexto
T80 deja el adaptador funcionando, pero un webhook de pago no puede considerarse terminado sin pruebas de duplicidad, firma inválida, pago cancelado y referencia desconocida (EC-006, EC-007, RF-054). Además, Flow exige credenciales y una URL pública de confirmación, por lo que la operación debe quedar documentada para que otra persona pueda activarlo y desactivarlo sin tocar código (RF-055, RB-014).

Las pruebas automatizadas deben ser deterministas y **no depender de Internet**: se usan mocks/WireMock y fixtures locales. El smoke test contra sandbox es una verificación manual separada, con evidencia, y no bloquea la suite.

## Convenciones aplicables
- CONV-NAM-04
- CONV-TIP-02
- CONV-TIP-03
- CONV-ERR-01
- CONV-SEG-01
- CONV-SEG-02
- CONV-GEN-05
- CONV-DOC-01
- CONV-DOC-03
- CONV-DOC-04
- CONV-DOC-05

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** pruebas unitarias y de integración del adaptador, la firma, el controlador y el servicio de webhook; fixtures de Flow; documentación de credenciales, activación, desactivación, túnel y troubleshooting; archivo HTTP de smoke test; registro de cicatrices si aparece un fallo.
- **NO:** agregar funcionalidad nueva al adaptador; probar con dinero real; automatizar el túnel o el sandbox; hacer pentest; duplicar en la documentación el contrato OpenAPI completo.

## Criterios de aceptación
- [ ] `./mvnw test -Dtest='Flow*Test'` pasa en verde sin conexión a Internet y sin credenciales reales.
- [ ] La prueba de firma saliente compara un vector conocido (parámetros ordenados + HMAC-SHA256) y falla si se altera un solo parámetro; la comparación es en tiempo constante.
- [ ] La prueba de webhook duplicado envía el mismo evento dos veces y verifica una sola transición de pedido, un solo movimiento de stock y respuesta 200 en ambas entregas.
- [ ] La prueba de firma inválida responde 401, la de referencia desconocida responde 404 y la de pago cancelado no confirma el pedido; en los tres casos el estado y el stock no cambian.
- [ ] La prueba de eventos fuera de orden confirma que `PENDING` después de `PAID` no revierte el pedido y que un `PAID` tardío sobre `CANCELADO` queda en revisión manual.
- [ ] `docs/integraciones/flow.md` explica cómo obtener credenciales sandbox, qué variables configurar, cómo activar/desactivar, cómo exponer el webhook con túnel, cómo interpretar errores y cómo volver al proveedor simulado; no contiene secretos reales.
- [ ] El smoke test manual contra sandbox está documentado y ejecutado al menos una vez con evidencia (fecha, monto, estado final y orden de referencia); si el sandbox no está disponible, el ticket queda `Bloqueado` con causa y responsable, no `Hecho`.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/test/java/com/cremeco/pasteleria/payment/flow/FlowPaymentProviderTest.java` | test | 180 |
| `backend/src/test/java/com/cremeco/pasteleria/payment/flow/FlowWebhookServiceTest.java` | test | 220 |
| `backend/src/test/java/com/cremeco/pasteleria/payment/flow/FlowSignatureVerifierTest.java` | test | 100 |
| `backend/src/test/java/com/cremeco/pasteleria/payment/flow/FlowWebhookControllerTest.java` | test | 130 |
| `backend/src/test/resources/flow/create-payment-response.json` | config | 60 |
| `backend/http/flow-sandbox.http` | config | 90 |
| `docs/integraciones/flow.md` | doc | 190 |
| `.env.example` | config | 90 |

## Casos límite (Edge Cases)
- **Sandbox caído o credenciales expiradas:** la suite automatizada sigue pasando con mocks; el smoke manual se marca bloqueado con causa, sin cambiar el resultado de las pruebas deterministas.
- **Webhook duplicado concurrente:** dos hilos procesan el mismo evento al mismo tiempo; la prueba verifica que la restricción única y el bloqueo del pedido impiden la doble transición.
- **Replay de un webhook antiguo:** un evento válido pero ya procesado se reconoce por su clave de idempotencia y responde 200 sin efectos; no se acepta solo por tener firma correcta.
- **Credenciales rotadas o incompletas:** la API falla temprano al activar Flow y el mensaje indica qué variable falta, sin imprimir el valor.
- **URL de túnel cambiada:** el webhook deja de llegar; la documentación indica actualizar `PAYMENTS_FLOW_WEBHOOK_URL` y reiniciar la API, y el smoke test lo verifica.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] Evidencia adjunta (comandos, salida o captura) en el ticket.
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).

---

# Ticket T82 — PWA offline hardening y conflictos

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 6
- **Rama sugerida:** feature/T82-pwa-offline-hardening
- **Responsable:** Matias
- **Prioridad:** media
- **Depende de:** T69, T73

## Contexto
T69 deja la cola offline del POS y T82 la endurece para operar en condiciones reales: red intermitente, reintentos, ventas duplicadas, stock insuficiente al sincronizar y almacenamiento limitado. El requisito exige sincronización en segundo plano y resolución de conflictos (RF-046, RF-063) con idempotencia (RB-013, RB-015), sin permitir stock negativo (RNF-008) y con estados de UI explícitos (RNF-003).

La cola actual no debe reescribirse: se extiende con un motor de sincronización, backoff, resolución de conflictos y retención. La UI de ventas pendientes vive en el admin (Bootstrap 5), no en el cliente.

**SUPUESTO:** la ruta de la pantalla es `/pos/pendientes` y el detalle de conflicto es un panel o ruta `/pos/conflictos/:ventaId`; se ajusta a la navegación real de T67 sin cambiar el alcance.

## Convenciones aplicables
- CONV-NAM-01
- CONV-NAM-04
- CONV-NAM-06
- CONV-TIP-01
- CONV-TIP-02
- CONV-TIP-03
- CONV-ERR-01
- CONV-ERR-02
- CONV-ERR-04
- CONV-UI-01
- CONV-UI-02
- CONV-UI-03
- CONV-SEG-04
- CONV-DOC-01

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** motor de sincronización con bloqueo entre pestañas; backoff exponencial con jitter; eventos de `online`/`offline`; Background Sync cuando exista y fallback periódico cuando no; UI de ventas pendientes, en curso, conflicto y fallidas; resolución manual con motivo y auditoría; límites y limpieza de almacenamiento; advertencia al cerrar sesión con ventas pendientes.
- **NO:** reescribir la UI del POS ni el contrato de ventas; implementar sincronización nativa en iOS; cambiar la estrategia de caché del shell (T68); agregar ventas offline para el cliente web; resolver conflictos automáticamente sin intervención cuando el stock sea insuficiente.

## Criterios de aceptación
- [ ] Con la red desconectada, una venta POS se guarda en IndexedDB, aparece en la lista de pendientes y sobrevive a recargar la página; la venta no se pierde ni se duplica.
- [ ] Al reconectar, la sincronización envía cada venta una sola vez; un reintento que recibe la respuesta de una venta ya registrada se trata como éxito idempotente y no crea otra venta ni descuenta stock dos veces (RB-013, EC-014).
- [ ] Si el stock es insuficiente al sincronizar, la venta pasa a `CONFLICTO`, el stock nunca queda negativo y la UI muestra el motivo; el usuario puede reintentar o resolver manualmente con un motivo obligatorio que queda auditado (RB-015, RNF-008, RF-052).
- [ ] El backoff usa base 2 s, factor 2, jitter y techo de 5 minutos, con máximo 8 intentos; al agotarlos la venta queda `FALLIDA` con acción de reintento manual y no se reintenta en bucle.
- [ ] El almacenamiento se monitorea con `navigator.storage.estimate()`: aviso al 70 %, bloqueo de nuevas ventas offline al 90 %, error de cuota capturado con mensaje accionable y limpieza de ventas sincronizadas con más de 30 días o al superar 500 eventos.
- [ ] La pantalla de pendientes contempla estados de carga, vacío, error y datos, es usable a 360 px y 768 px, y permite filtrar por estado sin perder la selección.
- [ ] Si el usuario intenta cerrar sesión con ventas pendientes, el sistema advierte y exige confirmación explícita; al confirmar, la cola se conserva para el mismo usuario y no queda visible para otro.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `admin/src/offline/syncEngine.ts` | service | 200 |
| `admin/src/offline/backoff.ts` | util | 70 |
| `admin/src/offline/conflictResolver.ts` | service | 170 |
| `admin/src/offline/retention.ts` | util | 90 |
| `admin/src/pages/pos/VentasPendientes.tsx` | component | 190 |
| `admin/src/components/pos/ConflictoVenta.tsx` | component | 140 |
| `admin/src/hooks/useSyncStatus.ts` | hook | 80 |
| `admin/src/sw.ts` | service | 150 |

**SUPUESTO:** `admin/src/sw.ts` es el service worker de T68. Si T68 usó `vite-plugin-pwa` con `injectManifest`, el archivo mantiene esa ruta y solo se agrega el evento `sync` y la exclusión de `/api/**` de la caché.

## Casos límite (Edge Cases)
- **Venta ya registrada en el servidor (EC-014):** el reintento devuelve la venta existente; la cola la marca sincronizada y no genera un segundo movimiento de stock.
- **Dos pestañas sincronizan a la vez:** el bloqueo de sincronización y la clave de idempotencia evitan el doble envío; la segunda pestaña espera y reconcilia el estado.
- **Stock insuficiente (EC-013):** no se fuerza la venta; se marca conflicto y se ofrece resolución manual con motivo.
- **Producto eliminado o inactivo mientras estaba offline (EC-003):** la venta queda en conflicto con el detalle del producto no disponible; no se sincroniza a ciegas.
- **Precio cambió mientras estaba offline (EC-002):** el backend recalcula y, si el total difiere, la venta queda en conflicto con la diferencia visible para decisión manual.
- **Cuota de almacenamiento agotada:** la operación falla con un mensaje que indica liberar espacio; las ventas ya guardadas no se corrompen y se ofrece exportar o sincronizar antes de limpiar.
- **Service worker sirve un shell viejo (EC-021):** la app detecta una versión nueva y muestra la acción de actualizar; no se fuerza la recarga con ventas en curso.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] Evidencia adjunta (comandos, salida o captura) en el ticket.
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).

---

# Ticket T83 — Endurecimiento de seguridad

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 6
- **Rama sugerida:** feature/T83-endurecimiento-seguridad
- **Responsable:** Nicolas
- **Prioridad:** alta
- **Depende de:** T33, T42, T57, T66

## Contexto
La API ya tiene JWT, RBAC dinámico y auditoría, pero falta la revisión de seguridad de cierre: rate limiting en login, headers, CORS restrictivo, validación de entradas, manejo de secretos y logs sin datos sensibles (RF-068, RNF-002). Los riesgos incluyen fuerza bruta, escalada de privilegios por manipulación del cliente (EC-023), filtración de tokens en logs y configuración CORS demasiado permisiva.

El alcance es local y de una sola instancia; no se agrega infraestructura distribuida. Las decisiones que requieran una dependencia nueva se documentan y se aprueban antes de incorporarla.

**SUPUESTO:** el rate limiting se implementa en memoria con Bucket4j o Caffeine. Si el equipo prefiere no agregar dependencias, se usa un `ConcurrentHashMap` con ventana deslizante y la misma interfaz; la decisión queda en `docs/seguridad/owasp-checklist.md`.

## Convenciones aplicables
- CONV-SEG-01
- CONV-SEG-02
- CONV-SEG-03
- CONV-SEG-04
- CONV-ERR-01
- CONV-ERR-02
- CONV-ERR-04
- CONV-TIP-01
- CONV-GEN-02
- CONV-DOC-01

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** limitar intentos de login y endpoints sensibles; headers de seguridad en la API; CORS por origen explícito; validación de entrada y tamaños máximos; revisión OWASP A01–A10; auditoría de secretos y `.gitignore`; enmascarado de datos en logs; checklist con evidencias.
- **NO:** MFA, OAuth2/OIDC, SSO, WAF, TLS local, pentest externo, rate limiting distribuido con Redis, reescritura de autenticación, cambios de contrato de negocio.

## Criterios de aceptación
- [ ] El login limita a 5 fallos por combinación IP+email en 15 minutos y a 20 fallos por IP en el mismo período; el intento bloqueado responde 429 con `Retry-After`, no revela si el email existe y un login exitoso reinicia el contador de esa combinación.
- [ ] Las respuestas de la API incluyen `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Permissions-Policy` y `Cache-Control: no-store` en auth; `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'` en respuestas de API; HSTS solo si la petición es HTTPS.
- [ ] CORS acepta únicamente los orígenes configurados (`http://localhost:5173`, `http://localhost:5174` en desarrollo), con métodos y headers explícitos; un origen no permitido no recibe `Access-Control-Allow-Origin` y no se usa `*` junto con credenciales.
- [ ] Las entradas inválidas, con tipo incorrecto, tamaño excesivo o JSON malformado responden 400 con el formato de error del proyecto, sin stack trace ni detalles internos; los campos sensibles se validan antes de persistir.
- [ ] Los logs no contienen contraseñas, access/refresh tokens, secretos de Flow ni tokens de pago; los emails se muestran enmascarados y la query de retorno de Flow se registra sin el parámetro `token`.
- [ ] `docs/seguridad/owasp-checklist.md` cubre A01–A10 con estado, evidencia y responsable; no quedan hallazgos altos o críticos abiertos sin mitigación documentada.
- [ ] `.env`, `.env.local` y variantes están en `.gitignore`; `.env.example` solo tiene placeholders; una búsqueda de patrones de claves en el árbol versionado no encuentra secretos.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/java/com/cremeco/pasteleria/security/RateLimitFilter.java` | service | 160 |
| `backend/src/main/java/com/cremeco/pasteleria/security/LoginAttemptService.java` | service | 130 |
| `backend/src/main/java/com/cremeco/pasteleria/security/SecurityHeadersFilter.java` | service | 80 |
| `backend/src/main/java/com/cremeco/pasteleria/config/CorsConfig.java` | config | 80 |
| `backend/src/main/java/com/cremeco/pasteleria/security/SensitiveDataMasker.java` | util | 80 |
| `backend/src/main/resources/application.yml` | config | 140 |
| `backend/src/test/java/com/cremeco/pasteleria/security/HardeningTest.java` | test | 200 |
| `docs/seguridad/owasp-checklist.md` | doc | 180 |
| `.env.example` | config | 90 |

## Casos límite (Edge Cases)
- **Muchos usuarios detrás de una misma IP (NAT):** el límite por IP es más alto que el de IP+email para no bloquear una oficina completa; la prueba cubre 10 usuarios distintos desde la misma IP.
- **Ataque con emails rotados:** aunque cada email tenga pocos intentos, el límite por IP corta la fuerza bruta distribuida por email.
- **IP falsificada con `X-Forwarded-For`:** solo se confía en el header si la petición viene de un proxy configurado; si no, se usa la IP de la conexión.
- **Preflight `OPTIONS` o webhook entrante masivo:** el preflight no consume cuota de login; el webhook tiene un límite propio y alto para no descartar eventos legítimos de Flow.
- **Error con datos sensibles en el mensaje:** un fallo de validación no repite el valor enviado; un fallo de infraestructura no devuelve la excepción ni la ruta interna.
- **Intento de inyección de logs con saltos de línea:** los valores se escapan antes de registrar; no se pueden crear líneas falsas en el log.
- **Token expirado durante una operación (EC-008):** se responde 401 con el formato estándar, se audita el intento y no se filtra el contenido del token.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] Evidencia adjunta (comandos, salida o captura) en el ticket.
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).

---

# Ticket T84 — E2E con Playwright

## Metadatos
- **Tipo:** test
- **Fase / Sprint:** F3 · Sprint 6
- **Rama sugerida:** feature/T84-e2e-playwright
- **Responsable:** Anais
- **Prioridad:** alta
- **Depende de:** T58, T60, T67, T69, T82

## Contexto
Los flujos críticos deben probarse de punta a punta contra las dos apps y la API real local (RF-066): cliente (registro/login, catálogo, checkout, confirmación, perfil), admin (login, roles, catálogo, pedidos, POS) y POS offline. Las pruebas unitarias y de integración no cubren la integración entre React, Spring Boot, MySQL y el service worker; este ticket cubre esa brecha.

**SUPUESTO:** T82 se agrega como dependencia operativa para probar la UI de conflictos offline, aunque el plan solo exige T69. El entorno local debe tener MySQL, API, cliente y admin levantados; Playwright solo automatiza los dos Vite.

Las pruebas deben ser deterministas e independientes del orden: datos semilla idempotentes, emails únicos por ejecución, sin `waitForTimeout` y con limpieza de lo creado.

## Convenciones aplicables
- CONV-NAM-04
- CONV-TIP-01
- CONV-GEN-02
- CONV-ERR-01
- CONV-UI-02
- CONV-SEG-01
- CONV-DOC-01
- CONV-DOC-04

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** configuración de Playwright para cliente/admin; fixtures de autenticación y semilla; specs de compra, cuenta, RBAC, operación admin y POS offline; evidencia de trazas, capturas y reporte HTML; documentación de ejecución y requisitos previos.
- **NO:** pipeline CI/CD; matriz completa de navegadores; pruebas de carga; regresión visual pixel a pixel; pruebas contra Flow real (T81); auditoría de accesibilidad completa (T85); datos de producción.

## Criterios de aceptación
- [ ] `npm run e2e` ejecuta la suite desde un entorno local limpio y termina en verde, con datos semilla idempotentes y sin depender del orden de los tests.
- [ ] El flujo de cliente cubre registro y login, búsqueda y filtro de catálogo, detalle de producto, alta al carrito, checkout, pago simulado, confirmación y perfil/historial; las aserciones verifican código de pedido, total y estado, no solo que la página cargue.
- [ ] El flujo de admin cubre login, creación de rol con permisos, asignación de rol, alta/edición de producto, transición de pedido y venta POS online; un usuario sin permiso que entra por URL directa recibe acceso denegado (EC-011).
- [ ] El flujo POS offline crea una venta sin red, recarga la página, reconecta, sincroniza y verifica que la venta existe una sola vez con el stock descontado una sola vez; una segunda sincronización no duplica (EC-014).
- [ ] La configuración captura traza en el primer reintento, captura de pantalla al fallar y reporte HTML en `e2e/report/`; no se usan esperas fijas y los selectores estables se limitan a `data-testid` cuando el rol o el texto no alcanzan.
- [ ] `e2e/README.md` documenta requisitos previos, puertos, variables, comando de ejecución, cómo regenerar la semilla y cómo interpretar un fallo; las credenciales de prueba vienen de variables de entorno y no están en el repositorio.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `e2e/playwright.config.ts` | config | 100 |
| `e2e/tests/cliente/compra.spec.ts` | test | 200 |
| `e2e/tests/cliente/cuenta.spec.ts` | test | 160 |
| `e2e/tests/admin/rbac.spec.ts` | test | 170 |
| `e2e/tests/admin/operacion.spec.ts` | test | 220 |
| `e2e/tests/admin/pos-offline.spec.ts` | test | 190 |
| `e2e/fixtures/seed.ts` | util | 130 |
| `e2e/fixtures/auth.ts` | util | 80 |
| `e2e/README.md` | doc | 140 |
| `package.json` | config | 80 |

**SUPUESTO:** el `package.json` de la raíz ya es un workspace o el punto de entrada de scripts. Si el proyecto usa scripts separados, el comando `npm run e2e` se define en la raíz y delega en `e2e/`.

## Casos límite (Edge Cases)
- **Doble submit del checkout (EC-005):** un doble clic o reintento de red no crea dos pedidos; la prueba verifica una sola orden y una sola respuesta de confirmación.
- **Pérdida de conexión durante el checkout (EC-020):** la UI muestra un error accionable y el pedido no queda a medias; al reintentar, la idempotencia evita duplicados.
- **Stock agotado durante la compra (EC-001):** el checkout falla con un mensaje claro y no descuenta stock de forma parcial.
- **Service worker con versión vieja (EC-021):** la prueba de POS offline fuerza una recarga y verifica que la cola y la versión del shell sean coherentes.
- **Token expirado en medio de un flujo (EC-008):** la app redirige al login o renueva la sesión sin perder el carrito cuando corresponda.
- **Email ya registrado (EC-024):** el registro muestra el error de dominio y la prueba no deja datos sucios para la siguiente ejecución.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] Evidencia adjunta (comandos, salida o captura) en el ticket.
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).

---

# Ticket T85 — Performance, SEO y Lighthouse

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 6
- **Rama sugerida:** feature/T85-performance-seo-lighthouse
- **Responsable:** Anais
- **Prioridad:** media
- **Depende de:** T48, T49, T58, T59, T76

## Contexto
El cliente debe cargar rápido, ser indexable y mantener la PWA instalable (RF-057, RF-058, RF-067, RNF-010). El build actual concentra el bundle y todavía no hay presupuesto de rendimiento ni metadatos por ruta. Este ticket fija umbrales medibles, divide el bundle por ruta, optimiza imágenes y fuentes, agrega metadatos/JSON-LD, `robots.txt` y `sitemap.xml`, y documenta la medición local.

**SUPUESTO:** no hay SSR ni prerender. El SEO se resuelve en cliente con metadatos por ruta y datos estructurados; el `sitemap.xml` es estático y solo incluye rutas públicas. Lighthouse se ejecuta con Chrome headless, preset móvil y build de producción local.

## Convenciones aplicables
- CONV-GEN-02
- CONV-TIP-01
- CONV-UI-04
- CONV-EST-03
- CONV-NAM-04
- CONV-DOC-01
- CONV-DOC-03

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** lazy loading de rutas; presupuesto de bundle verificable; optimización de imágenes y fuentes; metadatos por ruta; JSON-LD; `robots.txt` y `sitemap.xml`; `noindex` en admin y rutas privadas; script de Lighthouse y documento de resultados con umbrales.
- **NO:** SSR/prerender, CDN, imágenes en la nube, analítica de terceros, rediseño visual, cambios de negocio, optimización del backend, matriz completa de dispositivos.

## Criterios de aceptación
- [ ] `frontend/scripts/check-bundle.mjs` falla con código distinto de 0 si el JS inicial supera 180 KB gzip, el CSS inicial supera 40 KB gzip, un chunk de ruta supera 60 KB gzip o la transferencia inicial total supera 500 KB.
- [ ] Todas las rutas salvo la Home se cargan con `React.lazy` y `Suspense`; el fallback es accesible, no provoca salto de layout y una ruta pesada no bloquea la primera pintura.
- [ ] Las imágenes públicas están en WebP, declaran `width`/`height`, la imagen LCP se precarga y el resto usa `loading="lazy"`; ninguna imagen de catálogo supera 200 KB.
- [ ] Cada ruta pública define `title`, `description`, `canonical` y Open Graph; el detalle de producto y el blog incluyen JSON-LD válido; carrito, checkout, confirmación y perfil quedan `noindex`; el admin queda `noindex,nofollow`.
- [ ] `sitemap.xml` y `robots.txt` son válidos, no listan rutas privadas y el sitemap solo contiene URLs públicas existentes.
- [ ] Lighthouse móvil local, mediana de 3 corridas sobre build de producción: cliente con Performance ≥ 85, Accessibility ≥ 90, Best Practices ≥ 90 y SEO ≥ 90; admin PWA con Performance ≥ 80, Accessibility ≥ 90 y Best Practices ≥ 90.
- [ ] La PWA admin cumple el checklist de instalabilidad: manifest con `name`, `short_name`, iconos 192/512 y maskable, `start_url`, `display: standalone`, service worker controlando la página y shell disponible offline.
- [ ] `docs/calidad/lighthouse.md` registra fecha, build, comandos, resultados por categoría y cualquier desviación con su causa; no se declaran umbrales sin evidencia.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `frontend/src/App.tsx` | component | 140 |
| `frontend/src/components/seo/Seo.tsx` | component | 90 |
| `frontend/index.html` | view | 90 |
| `frontend/public/robots.txt` | config | 20 |
| `frontend/public/sitemap.xml` | config | 80 |
| `frontend/scripts/check-bundle.mjs` | service | 130 |
| `frontend/scripts/lighthouse.mjs` | service | 120 |
| `admin/public/robots.txt` | config | 10 |
| `admin/index.html` | view | 80 |
| `docs/calidad/lighthouse.md` | doc | 160 |

## Casos límite (Edge Cases)
- **Service worker sirve assets viejos después de un build (EC-021):** la medición se hace con caché limpia y el documento explica cómo invalidarla; un score obtenido con caché vieja no se acepta como evidencia.
- **Ruta profunda recargada en preview:** el fallback SPA responde 200 y la ruta renderiza; si el servidor devuelve 404, se documenta la configuración necesaria para el preview local.
- **Red lenta o imagen LCP ausente:** el layout reserva espacio y no hay salto; la imagen faltante no rompe el hero ni el catálogo.
- **Fuentes bloqueadas o `prefers-reduced-motion`:** la app sigue siendo legible y usable sin la fuente de marca y sin animaciones.
- **URL privada indexable por error:** la prueba de metadatos detecta `noindex` en carrito, checkout, confirmación, perfil y admin; una URL privada en el sitemap es un fallo del ticket.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] Evidencia adjunta (comandos, salida o captura) en el ticket.
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).

---

# Ticket T86 — Migración final y eliminación de mockup

## Metadatos
- **Tipo:** refactor
- **Fase / Sprint:** F3 · Sprint 6
- **Rama sugerida:** feature/T86-migracion-final-mockup
- **Responsable:** Anais
- **Prioridad:** media
- **Depende de:** T48, T49, T76

## Contexto
El estado actual de la migración deja Home, Carrito, Checkout y POS en el design system, pero Navbar, Footer y Catálogo todavía dependen de clases del snapshot; `frontend/src/mockup/` sigue presente y `main.tsx` importa `mockup.css` (ver `guias/09-estado-avance.md`). El requisito RF-059 exige eliminar esa carpeta al terminar la migración y RNF-001 prohíbe cargar el CSS legacy en producción.

Este ticket cierra la migración visual sin implementar páginas pendientes: solo reemplaza las clases del snapshot por componentes y tokens de `docs/reglas_ui.md`, y elimina el CSS muerto.

## Convenciones aplicables
- CONV-GEN-02
- CONV-GEN-03
- CONV-NAM-04
- CONV-TIP-04
- CONV-UI-01
- CONV-UI-02
- CONV-UI-03
- CONV-UI-04
- CONV-DOC-01
- CONV-DOC-05

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** migrar Navbar, Footer y Catálogo a componentes/tokens del design system; extraer subcomponentes si se supera el límite; eliminar `frontend/src/mockup/` y el import de `main.tsx`; limpiar comentarios y referencias al snapshot; actualizar el manifiesto PCA; verificar rutas, responsive y foco.
- **NO:** implementar `ProductoDetalle`, `Envio`, `Confirmacion` o `Perfil` (tickets de otros frentes); rediseñar la identidad visual; cambiar contenido o navegación; eliminar `MockUpPasteleria/` de la raíz (solo se elimina la copia en `frontend/src/mockup/`); tocar backend.

## Criterios de aceptación
- [ ] Navbar, Footer y Catálogo usan exclusivamente componentes del design system, tokens de `index.css` y utilidades Tailwind; una búsqueda de las clases del snapshot (`.catalogo-hero`, `.badge`, `.navbar-*`, `.footer-*`, `.btn-*` del mockup) devuelve cero coincidencias en esos archivos.
- [ ] `frontend/src/mockup/` ya no existe, `main.tsx` no importa `mockup.css` y `npm run build` termina sin errores ni CSS huérfano; ninguna ruta existente depende de un archivo eliminado.
- [ ] Las rutas existentes (`/`, `/catalogo`, `/carrito`, `/checkout`, `/envio`, `/producto/:id`, `/blog/:slug`) renderizan a 360, 390, 430, 768, 1024, 1280 y 1440 px sin scroll horizontal ni desbordes.
- [ ] El menú móvil, el drawer de filtros y los enlaces del footer son navegables por teclado, cierran con `Escape` y mantienen el foco dentro del panel cuando corresponde (CONV-UI-03).
- [ ] La paridad visual se verifica contra las capturas de referencia del mockup en los mismos breakpoints; Home, Carrito, Checkout y POS no presentan regresiones y el CSS inicial del cliente disminuye respecto al build previo.
- [ ] `npm run lint`, `npm run build` y `python tools/pca_annotator.py check` terminan sin errores; el manifiesto ya no referencia archivos del mockup.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `frontend/src/components/layout/Navbar.tsx` | component | 180 |
| `frontend/src/components/layout/Footer.tsx` | component | 160 |
| `frontend/src/pages/cliente/Catalogo.tsx` | component | 220 |
| `frontend/src/components/domain/FiltroCheckbox.tsx` | component | 80 |
| `frontend/src/main.tsx` | config | 40 |
| `frontend/src/index.css` | config | 300 |
| `tools/pca.config.json` | config | 400 |

Además, se elimina la carpeta `frontend/src/mockup/` completa (CSS e imágenes del snapshot). No se elimina `MockUpPasteleria/`, que sigue siendo referencia externa.

## Casos límite (Edge Cases)
- **CSS legacy en caché del navegador o del service worker:** la verificación se hace con caché limpia y una recarga forzada; si el service worker sirve el CSS viejo, se invalida antes de medir.
- **Nombre de producto muy largo o precio de 6 cifras:** la tarjeta y el filtro no rompen el layout ni generan scroll horizontal a 360 px.
- **Imagen de producto ausente o con proporción distinta:** se muestra el espacio reservado y el fallback, sin colapsar la grilla.
- **Drawer de filtros con foco atrapado:** al cerrar con `Escape` o con el botón, el foco vuelve al control que lo abrió; el fondo no es focusable.
- **Ruta en `Placeholder` que todavía usa estilos del snapshot:** se detecta con la búsqueda global y se corrige solo si pertenece a este alcance; si pertenece a otro ticket, se reporta como dependencia.
- **Comentario o referencia residual a `mockup`:** `rg "mockup" frontend/src` no debe devolver imports ni rutas; los comentarios históricos se actualizan o eliminan (CONV-GEN-02).

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] Evidencia adjunta (comandos, salida o captura) en el ticket.
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).

---

# Ticket T87 — Documentación final y cicatrices

## Metadatos
- **Tipo:** docs
- **Fase / Sprint:** F3 · Sprint 6
- **Rama sugerida:** feature/T87-documentacion-final
- **Responsable:** Matias
- **Prioridad:** media
- **Depende de:** T84, T85, T86

## Contexto
El proyecto debe poder levantarse y operarse sin ayuda de la persona que escribió el código (RF-069, RNF-007). Hoy la documentación está repartida entre `AGENTS.md`, `docs/estado_proyecto.md`, `docs/plan_sprints.md`, `guias/` y los tickets; falta un README de operación, una referencia de API, una tabla única de variables de entorno, las decisiones arquitectónicas y el registro final de cicatrices.

Este ticket consolida la documentación **después** de que T84–T86 estabilicen pruebas, performance y migración. No cambia comportamiento: documenta lo que existe y elimina ambigüedad.

## Convenciones aplicables
- CONV-DOC-01
- CONV-DOC-02
- CONV-DOC-03
- CONV-DOC-04
- CONV-DOC-05
- CONV-GEN-01
- CONV-GEN-05
- CONV-SEG-01
- CONV-SEG-02
- CONV-NAM-04
- CONV-EST-03

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** README raíz con arranque rápido; manual de operación; documentación de API; tabla de variables de entorno; índice de decisiones (ADR); registro de cicatrices de S6; estado final del proyecto; registro de `@kind(test)` en el diccionario; verificación de enlaces y comandos.
- **NO:** reescribir código o cambiar comportamiento; documentar funcionalidad que no existe; guía de despliegue cloud; duplicar manualmente todo el esquema OpenAPI; incluir credenciales reales; prometer métricas sin evidencia.

## Criterios de aceptación
- [ ] Un integrante distinto al autor sigue el README desde un clon limpio, levanta MySQL, API, cliente y admin, y completa un login en menos de 20 minutos; cualquier paso faltante se corrige en el mismo ticket.
- [ ] `docs/operacion/manual.md` cubre inicio y parada, reset de base de datos, carga de semilla, healthchecks, logs, backup local, puertos, problemas frecuentes, activación/desactivación de Flow y uso del túnel de webhook.
- [ ] `docs/api/README.md` explica autenticación, formato de error, paginación, idempotencia y enlaces a OpenAPI/Swagger; se contrastan al menos tres endpoints (auth, catálogo y pagos) contra el contrato real.
- [ ] `docs/entorno/variables.md` coincide con `.env.example` y con `application.yml`; cada variable indica alcance, obligatoriedad, valor por defecto, si es secreta y un ejemplo seguro; ningún valor es real.
- [ ] `docs/decisiones/README.md` registra las decisiones vigentes: dos apps separadas con Tailwind/Bootstrap, RBAC dinámico, `PaymentProvider` + Flow, POS offline, backend como fuente de verdad y ausencia de SSR.
- [ ] `docs/cicatrices_guerra.md` contiene las cicatrices de S6 en formato `@learn-error` con síntoma, causa, corrección y prevención; `docs/estado_proyecto.md` queda en F5 cerrada con backlog post-MVP y próximo paso.
- [ ] No hay enlaces internos rotos, `python tools/pca_annotator.py check` no reporta problemas y `@kind(test)` quedó registrado en `docs/sistema_anotaciones.md`.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `README.md` | doc | 220 |
| `docs/operacion/manual.md` | doc | 220 |
| `docs/api/README.md` | doc | 200 |
| `docs/entorno/variables.md` | doc | 180 |
| `docs/decisiones/README.md` | doc | 200 |
| `docs/cicatrices_guerra.md` | doc | 300 |
| `docs/estado_proyecto.md` | doc | 200 |
| `docs/sistema_anotaciones.md` | doc | 160 |
| `.env.example` | config | 90 |

## Casos límite (Edge Cases)
- **Comandos distintos en Windows y Unix:** el README marca la variante cuando aplica; los comandos de PowerShell no se mezclan con sintaxis de Bash sin aviso.
- **Puerto ocupado (5173, 5174, 8080 o 3306):** el manual indica cómo detectar el proceso y qué hacer, sin sugerir matar procesos a ciegas.
- **Volumen de MySQL con datos viejos:** el reset documentado advierte que borra datos y exige confirmación; el arranque normal no destruye el volumen.
- **Checksum de Flyway alterado:** el manual explica el error, la causa y la solución correcta (migración nueva), sin recomendar borrar el historial en entornos con datos.
- **Variable de entorno faltante o con espacio:** el arranque falla con un mensaje que indica el nombre de la variable, nunca su valor.
- **Secreto filtrado en la documentación:** la revisión final busca patrones de claves y tokens; si aparece uno, se rota y se reemplaza por placeholder antes de cerrar.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] Evidencia adjunta (comandos, salida o captura) en el ticket.
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).

---

# Ticket T88 — Cierre F4/F5 y extracción de componentes

## Metadatos
- **Tipo:** refactor
- **Fase / Sprint:** F3 · Sprint 6
- **Rama sugerida:** feature/T88-cierre-f4-f5-extraccion
- **Responsable:** Matias
- **Prioridad:** media
- **Depende de:** T87

## Contexto
F4 exige verificar calidad y casos límite con evidencia; F5 exige extraer componentes reutilizables y registrar aprendizajes antes de cerrar (AGENTS.md). Con T87 la documentación está estable, pero todavía falta la matriz de validación, la evidencia consolidada, la extracción de los patrones repetidos detectados en S6 y las lecciones aprendidas.

La extracción no puede convertirse en un rediseño: se limita a componentes con al menos dos consumidores reales y a decisiones documentadas. La UI del cliente (Tailwind) y la del admin (Bootstrap 5) **no comparten componentes visuales** por RNF-001; solo pueden compartir contratos/tipos generados desde OpenAPI.

## Convenciones aplicables
- CONV-GEN-03
- CONV-GEN-05
- CONV-EST-01
- CONV-UI-01
- CONV-TIP-03
- CONV-TIP-04
- CONV-DOC-01
- CONV-DOC-03
- CONV-DOC-04
- CONV-DOC-05

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** matriz F4 requisito → prueba/evidencia; consolidación de resultados de backend, frontend, admin, E2E, Lighthouse y seguridad; inventario F5 de componentes; extracción de 2–3 componentes del admin con al menos dos consumidores; registro de lecciones; actualización del estado final y del manifiesto PCA.
- **NO:** agregar funcionalidad; reescribir módulos completos; forzar un paquete UI compartido entre Tailwind y Bootstrap; cerrar con pruebas rojas; cambiar alcance del backlog para que “cuadre”; extraer componentes con un solo uso o sin pruebas.

## Criterios de aceptación
- [ ] `docs/cierre/f4-validacion.md` contiene una matriz con cada RF, RNF y EC del alcance S6, su prueba o evidencia y su resultado; ninguna fila queda vacía y las brechas tienen responsable y fecha.
- [ ] La validación completa queda registrada con comandos y resultados: `./mvnw test`, `npm run lint` y `npm run build` en cliente y admin, `npm run e2e`, Lighthouse y `python tools/pca_annotator.py check`; no se acepta “pasa” sin salida adjunta.
- [ ] `docs/cierre/f5-extraccion.md` inventaría los componentes reutilizables con ubicación, contrato, consumidores y decisión (extraer, mantener o diferir); cada decisión tiene justificación.
- [ ] Se extraen al menos dos componentes del admin con dos consumidores reales cada uno, con pruebas o evidencia de uso, y la suite sigue verde después de la extracción; no hay regresión visual en Bootstrap.
- [ ] Queda documentado que no se comparten componentes visuales entre cliente y admin por RNF-001, y que `shared/` solo contiene contratos/tipos derivados de OpenAPI; cualquier excepción se justifica.
- [ ] `docs/cicatrices_guerra.md` registra las lecciones de S6 con causa raíz y prevención; `docs/estado_proyecto.md` marca F5 cerrada, resume el estado final y lista el backlog post-MVP.
- [ ] El cierre tiene firma de los tres integrantes (Matias, Nicolas, Anais) con fecha, y el checklist de cierre del sprint queda completo.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `docs/cierre/f4-validacion.md` | doc | 220 |
| `docs/cierre/f5-extraccion.md` | doc | 200 |
| `docs/cicatrices_guerra.md` | doc | 300 |
| `docs/estado_proyecto.md` | doc | 200 |
| `admin/src/components/common/EstadoBadge.tsx` | component | 80 |
| `admin/src/components/common/ConfirmDialog.tsx` | component | 130 |
| `admin/src/hooks/useAsyncAction.ts` | hook | 90 |
| `tools/pca.config.json` | config | 400 |

**SUPUESTO:** `EstadoBadge` y `ConfirmDialog` son los candidatos con más duplicación detectados en pedidos, catálogo y POS. Si el inventario F5 muestra otros con más consumidores, se sustituyen y se registra el cambio en `docs/cierre/f5-extraccion.md`.

## Casos límite (Edge Cases)
- **La extracción rompe estilos de Bootstrap:** el componente extraído conserva las clases y el contrato visual; si no se puede garantizar, no se extrae y se documenta la razón.
- **Import circular entre componentes comunes:** el componente se mueve a una capa inferior o se divide; el build debe fallar antes de aceptar un ciclo.
- **Componente sin pruebas:** se agrega una prueba mínima de render/contrato o se difiere la extracción; no se acepta código sin evidencia.
- **Evidencia F4 desactualizada después de refactorizar:** se vuelven a ejecutar las suites afectadas y se actualiza la matriz; una captura vieja no cuenta.
- **Tiempo de cierre insuficiente:** se priorizan los componentes de mayor duplicación y el resto queda como deuda con ticket post-MVP, nunca como “hecho” sin extracción.
- **E2E inestable en la última corrida:** se investiga y se registra la cicatriz; no se desactiva el test para cerrar el sprint.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] Evidencia adjunta (comandos, salida o captura) en el ticket.
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).

---

# Cierre del Sprint 6

## Evidencias mínimas de cierre

| Evidencia | Comando o fuente | Artefacto esperado |
| :--- | :--- | :--- |
| Backend | `./mvnw test` | Reporte de pruebas y resumen de fallos |
| Cliente | `npm run lint` + `npm run build` | Salida en 0 y presupuesto de bundle |
| Admin | `npm run lint` + `npm run build` | Salida en 0 y build PWA |
| E2E | `npm run e2e` | Reporte HTML y trazas en `e2e/report/` |
| Lighthouse | `npm run lighthouse` | JSON/HTML y tabla en `docs/calidad/lighthouse.md` |
| Seguridad | Suite de T83 y checklist OWASP | `docs/seguridad/owasp-checklist.md` |
| Flow | `./mvnw test -Dtest='Flow*Test'` + smoke sandbox | `docs/integraciones/flow.md` |
| PCA | `python tools/pca_annotator.py check` | 0 sobre-límite, 0 relaciones rotas |
| F4/F5 | Matriz y acta de cierre | `docs/cierre/f4-validacion.md` + `docs/cierre/f5-extraccion.md` |

**SUPUESTO:** los comandos `npm run e2e` y `npm run lighthouse` se definen en T84 y T85 respectivamente. Si cambian, se actualiza esta tabla y el README.

---

## Checklist de cierre del sprint

- [ ] T80–T88 están en `Hecho`, cada uno con sus criterios marcados y su Definition of Done completo.
- [ ] Flow se activa y desactiva solo por configuración; con la bandera apagada la API arranca con el proveedor simulado y con la bandera activa exige credenciales completas (RB-014).
- [ ] El pago simulado sigue funcionando sin cambios de contrato y el checkout puede alternar de proveedor sin tocar el frontend.
- [ ] El webhook de Flow es idempotente: duplicado, fuera de orden, firma inválida y referencia desconocida están probados y no alteran stock ni pedidos.
- [ ] La PWA admin es instalable, carga el shell offline y la cola de ventas sincroniza una sola vez; los conflictos de stock se resuelven manualmente sin stock negativo.
- [ ] La revisión de seguridad no tiene hallazgos altos o críticos abiertos; rate limiting, headers, CORS, validación, secretos y logs están evidenciados.
- [ ] Los flujos E2E de cliente, admin y POS offline pasan en local y el reporte está adjunto.
- [ ] Los umbrales de Lighthouse del cliente y de la PWA se cumplen o tienen una desviación documentada, aprobada y con fecha de corrección.
- [ ] `frontend/src/mockup/` fue eliminado, no quedan imports ni clases del snapshot y el build del cliente no lo referencia.
- [ ] El README, el manual de operación, la API, las variables de entorno, las decisiones, las cicatrices y el estado final están actualizados y sin secretos.
- [ ] F4 está cerrada con matriz de evidencias y F5 con inventario, extracción y lecciones aprendidas.
- [ ] `./mvnw test`, `npm run lint`, `npm run build` (cliente y admin), `npm run e2e` y `python tools/pca_annotator.py check` están en verde.
- [ ] No quedan bugs de prioridad alta abiertos; las limitaciones conocidas están documentadas con responsable y próximo paso.
- [ ] `docs/estado_proyecto.md` refleja el estado final, el backlog post-MVP y la fase siguiente.
- [ ] Los tres integrantes aprobaron el cierre y el commit/merge queda propuesto, no ejecutado por la IA.

---

## Criterios de salida del sprint

El sprint S6 se considera cerrado solo si se cumplen **todos** estos criterios:

1. **Flow conmutable:** activar Flow no requiere cambios de código; desactivarlo vuelve al proveedor simulado; el smoke test de sandbox tiene evidencia y las pruebas de duplicado, firma inválida y cancelación pasan.
2. **PWA instalable y offline confiable:** manifiesto, iconos y service worker cumplen el checklist; el shell carga sin red; las ventas offline se sincronizan una sola vez y los conflictos se resuelven sin stock negativo.
3. **Flujos críticos E2E:** cliente (registro/login, catálogo, checkout, confirmación, perfil), admin (login, roles, catálogo, pedidos, POS) y POS offline pasan en una ejecución limpia y reproducible.
4. **Seguridad revisada:** no hay hallazgos altos o críticos abiertos; login limitado, headers presentes, CORS restrictivo, entradas validadas, secretos fuera del repositorio y logs sin datos sensibles.
5. **Performance y SEO medidos:** los umbrales de Lighthouse y el presupuesto de bundle se cumplen y están documentados con fecha, build y comandos; las rutas privadas no se indexan.
6. **Mockup eliminado:** `frontend/src/mockup/` no existe, no hay referencias en código ni en el manifiesto, y las rutas existentes mantienen su layout en los siete anchos verificados.
7. **Documentación cerrada:** README, operación, API, variables, decisiones, cicatrices y estado final están actualizados, enlazados y sin secretos; otra persona puede levantar el proyecto siguiendo el README.
8. **F4/F5 cerradas:** la matriz de validación no tiene filas vacías, las brechas tienen responsable y fecha, los componentes reutilizables están extraídos o diferidos con justificación, y las lecciones están en `docs/cicatrices_guerra.md`.
9. **Verde antes de cerrar:** backend, cliente, admin, E2E y PCA pasan; no se acepta un cierre con pruebas rojas, tests desactivados o evidencia desactualizada.
10. **Aprobación explícita:** Matias, Nicolas y Anais firman el cierre; el estado del proyecto queda en F5 cerrada y el backlog post-MVP es el único trabajo pendiente.
