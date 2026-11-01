<!-- @pca:start
@id(feature.catalogdiscovery.decisions)
@kind(doc)
@limit(lines: 600)
@relates(feature.catalogdiscovery.interface)
@relates(feature.catalogdiscovery.dependencies)
@relates(feature.catalogdiscovery.view)
@relates(feature.catalogdiscovery.filterPill)
@desc(Registro de decisiones arquitectónicas y de diseño del módulo CatalogDiscovery)
@pca:end -->
# Registro de Decisiones (ADR) — CatalogDiscovery

## Información del Módulo
- **Módulo**: `CatalogDiscovery` (`feature.catalogdiscovery`)
- **Fecha de creación**: 2026-10-31
- **Última actualización**: 2026-10-31
- **Estado**: 🟢 Activo

---

## Decisiones de Diseño

### DEC-001: Creación del módulo bajo arquitectura FIDA
- **Fecha**: 2026-10-31
- **Contexto**: Se requiere aislar la funcionalidad de `CatalogDiscovery` con fronteras explícitas para escalar sin deuda técnica.
- **Decisión**: Estructurar el módulo en 5 subcarpetas (`interfaces/`, `dependencies/`, `implementation/`, `components/`, `docs/`) gobernadas por `fida_opl.py`.
- **Consecuencias**: Todo cambio estructural (score >= 60%) exigirá actualizar este documento antes de confirmar el commit (WAL documental).

### DEC-002: Contrato de Resumen de Descubrimiento y Subcomponente `CatalogFilterPill`
- **Fecha**: 2026-10-31
- **Contexto**: La página de catálogo (`Catalogo.tsx`) requiere mostrar una barra de resumen reactiva con el conteo de productos filtrados y acceso rápido para limpiar los filtros activos.
- **Decisión**:
  1. Definir `ICatalogDiscoveryProps` y `CatalogDiscoveryContract` en `interfaces/ICatalogDiscovery.ts`.
  2. Exponer los iconos `Sparkles` y `FilterX` exclusivamente a través de la aduana `dependencies/dependencies.ts`.
  3. Crear `components/CatalogFilterPill.tsx` e integrarlo en `implementation/CatalogDiscovery.view.tsx`.
- **Consecuencias**: Integración por fachada no destructiva en `Catalogo.tsx` cumpliendo las reglas estrictas FIDA.

---

## Dependencias Externas Justificadas

| Símbolo / Componente | Origen | Razón de uso |
|----------------------|--------|--------------|
| `Sparkles`, `FilterX` | `lucide-react` | Iconografía de resumen del catálogo y acción de limpieza de filtros |

---

## Historial de Cambios Estructurales (WAL)

| Fecha | Tipo de Cambio | Score WAL | Descripción |
|-------|---------------|-----------|-------------|
| 2026-10-31 | Inicialización | 0% | Creación base del módulo `CatalogDiscovery` |
| 2026-10-31 | Contrato + Aduana + Vista | 140% | Implementación de `ICatalogDiscovery`, `CatalogFilterPill` y `CatalogDiscoveryView` (DEC-002) |
