<!-- @pca:start
@id(feature.flowpayment.decisions)
@kind(doc)
@limit(lines: 600)
@relates(feature.flowpayment.interface)
@relates(feature.flowpayment.dependencies)
@relates(feature.flowpayment.view)
@relates(feature.flowpayment.statusBadge)
@desc(Registro de decisiones arquitectónicas y de diseño del módulo FlowPayment)
@pca:end -->
# Registro de Decisiones (ADR) — FlowPayment

## Información del Módulo
- **Módulo**: `FlowPayment` (`feature.flowpayment`)
- **Fecha de creación**: 2026-10-31
- **Última actualización**: 2026-10-31
- **Estado**: 🟢 Activo

---

## Decisiones de Diseño

### DEC-001: Creación del módulo bajo arquitectura FIDA
- **Fecha**: 2026-10-31
- **Contexto**: Se requiere aislar la funcionalidad de `FlowPayment` con fronteras explícitas para escalar sin deuda técnica.
- **Decisión**: Estructurar el módulo en 5 subcarpetas (`interfaces/`, `dependencies/`, `implementation/`, `components/`, `docs/`) gobernadas por `fida_opl.py`.
- **Consecuencias**: Todo cambio estructural (score >= 60%) exigirá actualizar este documento antes de confirmar el commit (WAL documental).

### DEC-002: Contrato de Verificación Híbrida Flow.cl y Subcomponente `FlowStatusBadge`
- **Fecha**: 2026-10-31
- **Contexto**: Al retornar desde `flow.cl` vía `POST /api/payments/flow/return` (`303 See Other`), la vista de comprobante (`Exito.tsx`) necesita verificar el `token` contra el backend (`api.payments.getStatus`) y mostrar una insignia de verificación criptográfica diferenciando pagos reales en Flow.cl de simulaciones locales.
- **Decisión**:
  1. Definir `FlowVerificationState`, `IFlowPaymentProps` y `IFlowPaymentEvents` en `interfaces/IFlowPayment.ts`.
  2. Exponer `api`, `formatPrecio` y los iconos `ShieldCheck`, `CheckCircle2`, `RefreshCw` exclusivamente a través de la aduana `dependencies/dependencies.ts`.
  3. Crear `components/FlowStatusBadge.tsx` e integrarlo en `implementation/FlowPayment.view.tsx`.
- **Consecuencias**: Cero acoplamiento directo entre la vista FIDA y servicios externos; validación automática mediante `fida_opl.py check --strict` y `guard`.

---

## Dependencias Externas Justificadas

| Símbolo / Componente | Origen | Razón de uso |
|----------------------|--------|--------------|
| `ShieldCheck`, `CheckCircle2`, `RefreshCw` | `lucide-react` | Iconografía de estado de verificación bancaria |
| `api` | `@/services/api` | Consulta de estado de transacción `/payments/flow/status` |
| `formatPrecio` | `@/lib/utils` | Formateo de moneda CLP en insignia de comprobante |

---

## Historial de Cambios Estructurales (WAL)

| Fecha | Tipo de Cambio | Score WAL | Descripción |
|-------|---------------|-----------|-------------|
| 2026-10-31 | Inicialización | 0% | Creación base del módulo `FlowPayment` |
| 2026-10-31 | Contrato + Aduana + Vista | 140% | Implementación de `IFlowPayment`, `FlowStatusBadge` y `FlowPaymentView` (DEC-002) |
