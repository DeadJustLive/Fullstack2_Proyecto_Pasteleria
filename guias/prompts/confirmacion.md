# ✅ Instancia — Confirmacion

Ejecuta [`prompt-base.md`](./prompt-base.md) con estos campos:

- **`{ORIGEN}`**: `MockUpPasteleria/pages/cliente/confirmacion.html` + `MockUpPasteleria/pages/cliente/js/confirmacion.js`.
- **`{SALIDA}`**: `frontend/src/pages/cliente/Confirmacion.tsx`.

Notas específicas:
- Es la ruta `confirmacion` (hoy `Placeholder` en `App.tsx:21`).
- Lee el último pedido desde `CartProvider`/`localStorage` (`@/lib/storage`); si no hay pedido, muestra `EmptyState`.
- Reutiliza `OrderSummary` para el detalle y `Button` para volver al catálogo.
