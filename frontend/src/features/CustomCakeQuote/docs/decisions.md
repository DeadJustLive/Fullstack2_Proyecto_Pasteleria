<!-- @pca:start
@id(feature.customcakequote.decisions)
@kind(doc)
@limit(lines: 600)
@relates(feature.customcakequote.interface)
@relates(feature.customcakequote.dependencies)
@relates(feature.customcakequote.view)
@relates(feature.customcakequote.portionBadge)
@desc(Registro de decisiones arquitectónicas y de diseño del módulo CustomCakeQuote)
@pca:end -->
# Registro de Decisiones (ADR) — CustomCakeQuote

## Información del Módulo
- **Módulo**: `CustomCakeQuote` (`feature.customcakequote`)
- **Fecha de creación**: 2026-10-31
- **Última actualización**: 2026-10-31
- **Estado**: 🟢 Activo

---

## Decisiones de Diseño

### DEC-001: Creación del módulo bajo arquitectura FIDA
- **Fecha**: 2026-10-31
- **Contexto**: Se requiere aislar la funcionalidad de `CustomCakeQuote` con fronteras explícitas para escalar sin deuda técnica.
- **Decisión**: Estructurar el módulo en 5 subcarpetas (`interfaces/`, `dependencies/`, `implementation/`, `components/`, `docs/`) gobernadas por `fida_opl.py`.
- **Consecuencias**: Todo cambio estructural (score >= 60%) exigirá actualizar este documento antes de confirmar el commit (WAL documental).

### DEC-002: Contrato de Ficha Técnica de Cotización y Subcomponente `CakePortionBadge`
- **Fecha**: 2026-10-31
- **Contexto**: En `Personalizacion.tsx` se necesita mostrar el desglose técnico de pisos sugeridos y costo unitario por porción en el panel lateral de resumen.
- **Decisión**:
  1. Definir `ICustomCakeQuoteProps` y `CustomCakeQuoteContract` en `interfaces/ICustomCakeQuote.ts`.
  2. Exponer `formatPrecio` y los iconos `CakeSlice`, `Sparkles` exclusivamente a través de `dependencies/dependencies.ts`.
  3. Crear `components/CakePortionBadge.tsx` e integrarlo en `implementation/CustomCakeQuote.view.tsx`.
- **Consecuencias**: Composición por fachada sin alterar la lógica del formulario de personalización.

---

## Dependencias Externas Justificadas

| Símbolo / Componente | Origen | Razón de uso |
|----------------------|--------|--------------|
| `CakeSlice`, `Sparkles` | `lucide-react` | Iconografía de estructura de pisos y ficha pastelera |
| `formatPrecio` | `@/lib/utils` | Formateo de valor referencial por porción en CLP |

---

## Historial de Cambios Estructurales (WAL)

| Fecha | Tipo de Cambio | Score WAL | Descripción |
|-------|---------------|-----------|-------------|
| 2026-10-31 | Inicialización | 0% | Creación base del módulo `CustomCakeQuote` |
| 2026-10-31 | Contrato + Aduana + Vista | 140% | Implementación de `ICustomCakeQuote`, `CakePortionBadge` y `CustomCakeQuoteView` (DEC-002) |
