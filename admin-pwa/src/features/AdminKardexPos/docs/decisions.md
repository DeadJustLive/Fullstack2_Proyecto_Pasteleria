<!-- @pca:start
@id(admin.feature.kardexpos.decisions)
@kind(doc)
@limit(lines: 600)
@relates(admin.feature.kardexpos.interface)
@relates(admin.feature.kardexpos.dependencies)
@relates(admin.feature.kardexpos.view)
@relates(admin.feature.kardexpos.syncBadge)
@desc(Registro de decisiones arquitectónicas y de diseño del módulo AdminKardexPos)
@pca:end -->
# Registro de Decisiones (ADR) — AdminKardexPos

## Información del Módulo
- **Módulo**: `AdminKardexPos` (`admin.feature.kardexpos`)
- **Fecha de creación**: 2026-10-31
- **Última actualización**: 2026-10-31
- **Estado**: 🟢 Activo

---

## Decisiones de Diseño

### DEC-001: Creación del módulo bajo arquitectura FIDA
- **Fecha**: 2026-10-31
- **Contexto**: Se requiere sintetizar en tiempo real la trazabilidad de movimientos Kardex y ventas POS en la vista de inventario administrativo bajo arquitectura FIDA.
- **Decisión**: Estructurar el módulo en 5 subcarpetas (`interfaces/`, `dependencies/`, `implementation/`, `components/`, `docs/`) e integrarlo por composición en `Inventario.tsx`.
- **Consecuencias**: Trazabilidad clara de movimientos POS y mermas con aislamiento estricto de dependencias.

---

## Dependencias Externas Justificadas

| Símbolo / Componente | Origen | Razón de uso |
|----------------------|--------|--------------|
| `Activity`, `CheckCircle2`, `Radio` | `lucide-react` | Iconografía de sincronización en vivo de Kardex y POS |

---

## Historial de Cambios Estructurales (WAL)

| Fecha | Tipo de Cambio | Score WAL | Descripción |
|-------|---------------|-----------|-------------|
| 2026-10-31 | Inicialización | 0% | Creación base del módulo `AdminKardexPos` |
| 2026-10-31 | Contrato + Aduana + Vista | 120% | Implementación de `IAdminKardexPos`, `KardexSyncBadge` y `AdminKardexPosView` (DEC-001) |
