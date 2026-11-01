<!-- @pca:start
@id(admin.feature.boletasii.decisions)
@kind(doc)
@limit(lines: 600)
@relates(admin.feature.boletasii.interface)
@relates(admin.feature.boletasii.dependencies)
@relates(admin.feature.boletasii.view)
@relates(admin.feature.boletasii.taxPill)
@desc(Registro de decisiones arquitectónicas y de diseño del módulo AdminBoletaSii)
@pca:end -->
# Registro de Decisiones (ADR) — AdminBoletaSii

## Información del Módulo
- **Módulo**: `AdminBoletaSii` (`admin.feature.boletasii`)
- **Fecha de creación**: 2026-10-31
- **Última actualización**: 2026-10-31
- **Estado**: 🟢 Activo

---

## Decisiones de Diseño

### DEC-001: Creación del módulo bajo arquitectura FIDA
- **Fecha**: 2026-10-31
- **Contexto**: Se requiere sintetizar el desglose tributario SII (Neto + 19% IVA + Bruto) de las órdenes listadas en el backoffice administrativo bajo fronteras explícitas FIDA.
- **Decisión**: Estructurar el módulo en 5 subcarpetas (`interfaces/`, `dependencies/`, `implementation/`, `components/`, `docs/`) e integrarlo por composición no destructiva en `Ordenes.tsx`.
- **Consecuencias**: Cero acoplamiento con la lógica interna de la tabla de órdenes; cumplimiento estricto de `fida_opl.py`.

---

## Dependencias Externas Justificadas

| Símbolo / Componente | Origen | Razón de uso |
|----------------------|--------|--------------|
| `FileCheck2`, `Receipt`, `ShieldCheck` | `lucide-react` | Iconografía de cumplimiento tributario y folios DTE |

---

## Historial de Cambios Estructurales (WAL)

| Fecha | Tipo de Cambio | Score WAL | Descripción |
|-------|---------------|-----------|-------------|
| 2026-10-31 | Inicialización | 0% | Creación base del módulo `AdminBoletaSii` |
| 2026-10-31 | Contrato + Aduana + Vista | 120% | Implementación de `IAdminBoletaSii`, `SiiTaxPill` y `AdminBoletaSiiView` (DEC-001) |
