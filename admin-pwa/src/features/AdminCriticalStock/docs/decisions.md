<!-- @pca:start
@id(admin.feature.criticalstock.decisions)
@kind(doc)
@limit(lines: 600)
@relates(admin.feature.criticalstock.interface)
@relates(admin.feature.criticalstock.dependencies)
@relates(admin.feature.criticalstock.view)
@relates(admin.feature.criticalstock.alertBadge)
@desc(Registro de decisiones arquitectónicas y de diseño del módulo AdminCriticalStock)
@pca:end -->
# Registro de Decisiones (ADR) — AdminCriticalStock

## Información del Módulo
- **Módulo**: `AdminCriticalStock` (`admin.feature.criticalstock`)
- **Fecha de creación**: 2026-10-31
- **Última actualización**: 2026-10-31
- **Estado**: 🟢 Activo

---

## Decisiones de Diseño

### DEC-001: Creación del módulo bajo arquitectura FIDA
- **Fecha**: 2026-10-31
- **Contexto**: Se requiere un indicador ejecutivo de alerta de productos críticos (`stock <= 5`) en el catálogo administrativo bajo arquitectura FIDA de 5 subcarpetas.
- **Decisión**: Estructurar el módulo en 5 subcarpetas (`interfaces/`, `dependencies/`, `implementation/`, `components/`, `docs/`) e integrarlo por composición en `Productos.tsx`.
- **Consecuencias**: Visibilidad inmediata de quiebres inminentes de stock y acción rápida de filtrado sin alterar la lógica existente de productos.

---

## Dependencias Externas Justificadas

| Símbolo / Componente | Origen | Razón de uso |
|----------------------|--------|--------------|
| `AlertTriangle`, `CheckCircle2`, `PackageOpen` | `lucide-react` | Iconografía de alerta de stock crítico y abastecimiento |

---

## Historial de Cambios Estructurales (WAL)

| Fecha | Tipo de Cambio | Score WAL | Descripción |
|-------|---------------|-----------|-------------|
| 2026-10-31 | Inicialización | 0% | Creación base del módulo `AdminCriticalStock` |
| 2026-10-31 | Contrato + Aduana + Vista | 120% | Implementación de `IAdminCriticalStock`, `CriticalAlertBadge` y `AdminCriticalStockView` (DEC-001) |
