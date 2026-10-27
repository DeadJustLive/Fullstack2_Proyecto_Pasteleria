<!-- @pca:start
@id(docs.proximo_paso_integracion)
@kind(doc)
@limit(lines: 150)
@relates(docs.estado_proyecto)
@relates(docs.plantilla_ticket)
@relates(docs.elementos_pendientes_conexion_backend)
@desc(Ficha de próximo paso técnico: Ticket FE-INT-04 Checkout y Pasarela Flow.cl)
@pca:end -->

# Próximo Paso de Integración: Ticket FE-INT-04

> **Instrucción para la IA al retomar:** Lee este documento junto con `docs/estado_proyecto.md` para proseguir de inmediato con la integración de la orden de compra y el flujo de pago.

---

## Ticket FE-INT-04 — Integración Completa de Checkout y Pasarela Flow.cl

### Metadatos
- **Tipo:** `feat`
- **Fase / Sprint:** F3 · Sprint 3 (Integración / Compra)
- **Rama sugerida:** `feature/FE-INT-04-checkout-flow`
- **Prioridad:** Alta (Crítica para el flujo de ventas)

### Contexto
Con la autenticación (`FE-INT-01`), el catálogo (`FE-INT-02`) y el carrito con control de stock y cupones (`FE-INT-03`) ya operativos, el siguiente paso indispensable es completar el embudo de compra: registrar la orden en `service-order` (`:8083`) con todos los datos de despacho y procesar el cobro en la pasarela Flow.cl (`service-payment-flow` `:8084`), validando el estado del pago al volver a la tienda.

### Convenciones aplicables
- `CONV-TIP-01` — Tipado estricto sin `any`.
- `CONV-ERR-01` — Manejo explícito de errores y fallos de pasarela.
- `CONV-SEG-01` — Idempotencia en pagos y sin exposición de credenciales.
- `CONV-UI-02` — Estados de carga y error en la pantalla de confirmación.

### Alcance (Qué SÍ / Qué NO)
- **SÍ:**
  - Enviar payload completo de entrega a `POST /api/orders` (nombre, email, teléfono, dirección, comuna, items, cupón, costo de envío, total).
  - Generar sesión de pago en Flow vía `POST /api/payments/flow/create` con URL de retorno hacia `/confirmacion`.
  - En `/confirmacion` y `/pago/exito`, validar criptográfica/oficialmente el token de Flow consultando `GET /api/payments/flow/status?token={token}`.
  - Vaciar el carrito únicamente cuando la orden/pago se inicien con éxito.
  - En caso de pago rechazado, redirigir a `/pago/error` preservando los items del carrito para reintento.
- **NO:**
  - Modificar el módulo de Kardex o inventario POS (corresponde a `FE-INT-06`).
  - Modificar la vista de perfil de usuario (corresponde a `FE-INT-05`).

### Criterios de aceptación
- [ ] Al seleccionar Flow y presionar "Pagar", se crea la orden en `service-order` y se obtiene la URL de redirección a Flow.
- [ ] La URL de retorno (`urlReturn`) apunta a `/confirmacion` con el token generado.
- [ ] La página `/confirmacion` consulta el estado de la transacción a `api.payments.getStatus(token)`.
- [ ] Si el pago está pagado/aprobado, muestra el resumen de orden y número de folio.
- [ ] Si el pago es cancelado o rechazado, redirige a `/pago/error` mostrando el motivo y permitiendo reintentar.
- [ ] Al seleccionar Transferencia, se registra la orden con estado `PENDIENTE_PAGO` y se muestran los datos bancarios.

### Archivos afectados (previstos)
| Archivo | @kind | Propósito |
| :--- | :--- | :--- |
| `frontend/src/services/api.ts` | service | Asegurar payload completo en `orders.create` y validación en `payments.getStatus` |
| `frontend/src/pages/cliente/Checkout.tsx` | page | Recopilación completa de datos de despacho y orquestación con Flow |
| `frontend/src/pages/cliente/Confirmacion.tsx` | page | Verificación asíncrona del token de pago antes de confirmar la compra |
| `frontend/src/pages/cliente/pago/Exito.tsx` | page | Sincronización con estado real devuelto por la pasarela |
| `frontend/src/pages/cliente/pago/Error.tsx` | page | Opción de reintento de pago recuperando los productos |

### Casos límite (Edge Cases)
- El usuario cierra la pestaña de Flow o cancela la transacción en el portal bancario.
- La red falla durante el retorno del webhook.
- El token de pago en la URL está vacío o expiró.

### Definition of Done
- [ ] Flujo end-to-end de compra probado localmente con el backend activo.
- [ ] `npm --prefix frontend run build` pasa limpio (0 errores de TypeScript).
- [ ] `docs/estado_proyecto.md` actualizado al finalizar.
