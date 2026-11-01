<!-- @pca:start
@id(feature.checkoutsummary.decisions)
@kind(doc)
@limit(lines: 600)
@relates(feature.checkoutsummary.interface)
@relates(feature.checkoutsummary.dependencies)
@relates(feature.checkoutsummary.view)
@relates(feature.checkoutsummary.securityBadge)
@desc(Registro de decisiones arquitectónicas y de diseño del módulo CheckoutSummary)
@pca:end -->
# Registro de Decisiones (ADR) — CheckoutSummary

## Información del Módulo
- **Módulo**: `CheckoutSummary` (`feature.checkoutsummary`)
- **Fecha de creación**: 2026-10-31
- **Última actualización**: 2026-10-31
- **Estado**: 🟢 Activo

---

## Decisiones de Diseño

### DEC-001: Creación del módulo bajo arquitectura FIDA
- **Fecha**: 2026-10-31
- **Contexto**: Se requiere aislar la funcionalidad de `CheckoutSummary` con fronteras explícitas para escalar sin deuda técnica.
- **Decisión**: Estructurar el módulo en 5 subcarpetas (`interfaces/`, `dependencies/`, `implementation/`, `components/`, `docs/`) gobernadas por `fida_opl.py`.
- **Consecuencias**: Todo cambio estructural (score >= 60%) exigirá actualizar este documento antes de confirmar el commit (WAL documental).

### DEC-002: Contrato de Resumen Seguro de Checkout y Subcomponente `CheckoutSecurityBadge`
- **Fecha**: 2026-10-31
- **Contexto**: En la vista `Checkout.tsx` se necesita presentar un bloque compacto de garantía transaccional junto al resumen financiero con el protocolo de seguridad del medio de pago seleccionado.
- **Decisión**:
  1. Definir `ICheckoutSummaryProps` y `CheckoutSummaryContract` en `interfaces/ICheckoutSummary.ts`.
  2. Exponer `formatPrecio` y los iconos `ShieldCheck`, `Lock` a través de `dependencies/dependencies.ts`.
  3. Crear `components/CheckoutSecurityBadge.tsx` e integrarlo en `implementation/CheckoutSummary.view.tsx`.
- **Consecuencias**: Composición limpia sin mutar el flujo de pago en `Checkout.tsx`.

---

## Dependencias Externas Justificadas

| Símbolo / Componente | Origen | Razón de uso |
|----------------------|--------|--------------|
| `ShieldCheck`, `Lock` | `lucide-react` | Iconografía de respaldo y cifrado de pasarela |
| `formatPrecio` | `@/lib/utils` | Formateo de monto total en CLP |

---

## Historial de Cambios Estructurales (WAL)

| Fecha | Tipo de Cambio | Score WAL | Descripción |
|-------|---------------|-----------|-------------|
| 2026-10-31 | Inicialización | 0% | Creación base del módulo `CheckoutSummary` |
| 2026-10-31 | Contrato + Aduana + Vista | 140% | Implementación de `ICheckoutSummary`, `CheckoutSecurityBadge` y `CheckoutSummaryView` (DEC-002) |
