<!-- @pca:start
@id(feature.customertracking.decisions)
@kind(doc)
@limit(lines: 600)
@relates(feature.customertracking.interface)
@relates(feature.customertracking.dependencies)
@relates(feature.customertracking.view)
@relates(feature.customertracking.slaBanner)
@desc(Registro de decisiones arquitectónicas y de diseño del módulo CustomerTracking)
@pca:end -->
# Registro de Decisiones (ADR) — CustomerTracking

## Información del Módulo
- **Módulo**: `CustomerTracking` (`feature.customertracking`)
- **Fecha de creación**: 2026-10-31
- **Última actualización**: 2026-10-31
- **Estado**: 🟢 Activo

---

## Decisiones de Diseño

### DEC-001: Creación del módulo bajo arquitectura FIDA
- **Fecha**: 2026-10-31
- **Contexto**: Se requiere aislar la funcionalidad de `CustomerTracking` con fronteras explícitas para escalar sin deuda técnica.
- **Decisión**: Estructurar el módulo en 5 subcarpetas (`interfaces/`, `dependencies/`, `implementation/`, `components/`, `docs/`) gobernadas por `fida_opl.py`.
- **Consecuencias**: Todo cambio estructural (score >= 60%) exigirá actualizar este documento antes de confirmar el commit (WAL documental).

### DEC-002: Contrato de Protocolo SLA y Subcomponente `TrackingSlaBanner`
- **Fecha**: 2026-10-31
- **Contexto**: En `PerfilSeguimiento.tsx` se necesita informar la garantía de cadena de frío y protocolo de entrega del pedido consultado.
- **Decisión**:
  1. Definir `ICustomerTrackingProps` y `CustomerTrackingContract` en `interfaces/ICustomerTracking.ts`.
  2. Exponer `Snowflake` y `ShieldAlert` exclusivamente a través de `dependencies/dependencies.ts`.
  3. Crear `components/TrackingSlaBanner.tsx` e integrarlo en `implementation/CustomerTracking.view.tsx`.
- **Consecuencias**: Integración no destructiva en `PerfilSeguimiento.tsx`.

---

## Dependencias Externas Justificadas

| Símbolo / Componente | Origen | Razón de uso |
|----------------------|--------|--------------|
| `Snowflake`, `ShieldAlert` | `lucide-react` | Iconografía de cadena de frío y trazabilidad SLA |

---

## Historial de Cambios Estructurales (WAL)

| Fecha | Tipo de Cambio | Score WAL | Descripción |
|-------|---------------|-----------|-------------|
| 2026-10-31 | Inicialización | 0% | Creación base del módulo `CustomerTracking` |
| 2026-10-31 | Contrato + Aduana + Vista | 140% | Implementación de `ICustomerTracking`, `TrackingSlaBanner` y `CustomerTrackingView` (DEC-002) |
