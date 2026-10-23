# 🍰 Instancia — ProductoDetalle

Ejecuta [`prompt-base.md`](./prompt-base.md) con estos campos:

- **`{ORIGEN}`**: `MockUpPasteleria/pages/cliente/productos/` (usa los tres ejemplos de producto y su base) + `MockUpPasteleria/pages/cliente/css/producto.css`.
- **`{SALIDA}`**: `frontend/src/pages/cliente/ProductoDetalle.tsx`.

Notas específicas:
- Es la ruta `producto/:id` (hoy `Placeholder` en `App.tsx:17`); resuelve el `Producto` por `id` desde `@/data/products` y maneja el "no encontrado".
- Reutiliza `Badge`, `CantidadStepper` y `Button`; el CTA lleva al carrito vía `CartProvider`.
