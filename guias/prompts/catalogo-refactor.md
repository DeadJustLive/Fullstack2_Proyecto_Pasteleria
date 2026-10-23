# 🗂️ Instancia — Refactor Catálogo (Fase 2)

La base ya existe (`Catalogo.tsx`), así que este prompt ejecuta **solo la Fase 2** de [`prompt-base.md`](./prompt-base.md): migrar de clases del snapshot a design system, sin cambiar el diseño.

- **`{ORIGEN}`**: `MockUpPasteleria/pages/cliente/catalogo.html` (paridad visual) + `frontend/src/pages/cliente/Catalogo.tsx` actual.
- **`{SALIDA}`**: `frontend/src/pages/cliente/Catalogo.tsx` (migrado).

Notas específicas:
- Reutiliza `FiltroCheckbox`, `ProductCard` y `EmptyState`; mantén el drawer de filtros en mobile.
- Elimina las clases del mockup quedan sin uso; no introduzcas `cva` sin variantes reales.
