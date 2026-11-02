<!-- @pca:start
@id(backend.payment.decisions)
@kind(doc)
@limit(lines: 600)
@relates(backend.payment.flowController)
@relates(backend.payment.flowWebhookController)
@relates(backend.payment.flowService)
@relates(backend.payment.flowClient)
@relates(backend.payment.flowSignature)
@relates(backend.payment.paymentRecord)
@desc(Registro de decisiones arquitectónicas y de diseño (ADR) del microservicio service-payment-flow)
@pca:end -->
# Registro de Decisiones (ADR) — Microservicio `service-payment-flow`

## Información del Módulo
- **Módulo**: `service-payment-flow` (`backend.payment`)
- **Fecha de creación**: 2026-10-31
- **Última actualización**: 2026-10-31
- **Estado**: 🟢 Activo en Producción / Sandbox Flow.cl

---

## Equivalencia de Capas FIDA en Microservicio Backend (Spring Boot)

| Capa FIDA | Paquete / Clases en `service-payment-flow` | Rol Arquitectónico |
| :--- | :--- | :--- |
| **`interfaces/`** | `dto/PaymentCreateRequest`, `PaymentCreateResponse`, `PaymentStatusDto`, `RefundPaymentRequest` | Contratos DTO de entrada/salida y validación Bean Validation |
| **`dependencies/`** | `service/FlowClientService`, `repository/PaymentRepository`, `KafkaTemplate` | Aduana de comunicación HTTP hacia `flow.cl`, persistencia JPA MySQL e integración Kafka |
| **`implementation/` (`view`)** | `controller/FlowPaymentController`, `controller/FlowWebhookController`, `service/FlowPaymentService` | Proyección HTTP REST (`/create`, `/status`, `/confirm`, `/return` HTTP 303) y orquestación transaccional |
| **`components/`** | `service/FlowSignatureService`, `model/PaymentRecord` | Firma criptográfica HMAC-SHA256 y entidad de idempotencia |
| **`docs/`** | `docs/decisions.md`, `docs/fida.module.json`, `docs/.snapshot.json` | Gobernanza FIDA + OPL y Guardián Transaccional WAL |

---

## Decisiones de Diseño

### DEC-001: Carga automática de `.env` y sanitización de credenciales Flow (`T102`)
- **Fecha**: 2026-10-31
- **Contexto**: Spring Boot requería `spring.config.import` para leer automáticamente `backend/.env` sin exponer secretos.
- **Decisión**: Configurar `optional:file:.env[.properties]` y `optional:file:backend/.env[.properties]`, sanitizando comillas/espacios en `FlowSignatureService` y `FlowClientService`.

### DEC-002: Puente HTTP 303 See Other en `/api/payments/flow/return` (`T103`)
- **Fecha**: 2026-10-31
- **Contexto**: Flow.cl envía un `HTTP POST` con `token` al navegador del comprador al volver de Webpay.
- **Decisión**: Implementar `handleBrowserReturn` en `FlowWebhookController` que consulta `getPaymentStatus(token)` en vivo y redirige mediante `HTTP 303 See Other (GET)` a `/pago/exito` (`status == 2`) o `/pago/error` (`status != 2`).

### DEC-003: Diagnóstico explícito, modo estricto y extracción de FlowUrlHelper (`T113` / `T115`)
- **Fecha**: 2026-11-02
- **Contexto**: FlowPaymentService superaba el umbral de 350 líneas al incorporar diagnóstico y validación de URLs públicas de webhooks.
- **Decisión**: Extraer `FlowUrlHelper` para sanitización, cálculo de URL de simulación y evaluación de accesibilidad de `urlConfirmation`, manteniendo `FlowPaymentService` bajo su `@limit`. Agregar endpoint `/diagnostics` con warnings preventivos si `urlConfirmation` no es una URL pública accesible desde internet.
