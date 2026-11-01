<!-- @pca:start
@id(admin.feature.rbacmatrix.decisions)
@kind(doc)
@limit(lines: 600)
@relates(admin.feature.rbacmatrix.interface)
@relates(admin.feature.rbacmatrix.dependencies)
@relates(admin.feature.rbacmatrix.view)
@relates(admin.feature.rbacmatrix.roleBadge)
@desc(Registro de decisiones arquitectónicas y de diseño del módulo AdminRbacMatrix)
@pca:end -->
# Registro de Decisiones (ADR) — AdminRbacMatrix

## Información del Módulo
- **Módulo**: `AdminRbacMatrix` (`admin.feature.rbacmatrix`)
- **Fecha de creación**: 2026-10-31
- **Última actualización**: 2026-10-31
- **Estado**: 🟢 Activo

---

## Decisiones de Diseño

### DEC-001: Creación del módulo bajo arquitectura FIDA
- **Fecha**: 2026-10-31
- **Contexto**: Se requiere presentar un resumen ejecutivo del estado de seguridad RBAC y distribución de roles activos en la vista de usuarios administrativos bajo fronteras FIDA.
- **Decisión**: Estructurar el módulo en 5 subcarpetas (`interfaces/`, `dependencies/`, `implementation/`, `components/`, `docs/`) e integrarlo por composición en `Usuarios.tsx`.
- **Consecuencias**: Trazabilidad clara de roles privilegiados y alternancia directa con la matriz de permisos sin acoplamiento directo.

---

## Dependencias Externas Justificadas

| Símbolo / Componente | Origen | Razón de uso |
|----------------------|--------|--------------|
| `KeyRound`, `Lock`, `ShieldCheck` | `lucide-react` | Iconografía de control de acceso y roles RBAC |

---

## Historial de Cambios Estructurales (WAL)

| Fecha | Tipo de Cambio | Score WAL | Descripción |
|-------|---------------|-----------|-------------|
| 2026-10-31 | Inicialización | 0% | Creación base del módulo `AdminRbacMatrix` |
| 2026-10-31 | Contrato + Aduana + Vista | 120% | Implementación de `IAdminRbacMatrix`, `RbacRoleBadge` y `AdminRbacMatrixView` (DEC-001) |
