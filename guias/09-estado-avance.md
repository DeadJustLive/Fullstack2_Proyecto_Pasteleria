# 📈 Estado de Avance del Proyecto

Seguimiento del plan de `guias/06-planificacion-scrum.md` y de la estrategia **Snapshot → Extracción → Migración**. Refleja el avance real del código en `frontend/src/` al cierre de este sprint.

> Leyenda: ✅ hecho · 🟡 en progreso · ⏳ pendiente · 🔁 decisión tomada (difiere del plan original).

---

## 🧭 Estrategia de migración (`guias/06`)

| Fase | Estado | Detalle |
| :--- | :--- | :--- |
| **1. Snapshot** (paridad visual) | ✅ | CSS del mockup cliente encolado en `frontend/src/mockup/`: `cliente/*.css` + `mockup.css` (`@import url("./cliente/estilos.css") layer(components)`) + `imagen/fondo_obrador.png`. No se portó el JS del mockup (la interactividad es React). |
| **2. Extracción** | ✅ | Extraídos con clases del mockup donde aplica: `Navbar`, `Footer`, `ProductCard`, `Badge`, `SectionTitle`, `BannerServicios`. |
| **3. Migración a design system** | 🟡 | Carrito, Checkout y POS ya usan tokens + `Button`/`Input`/`Card`. Home y Catálogo aún usan clases del mockup. `src/mockup/` sigue presente (se elimina al terminar). |

---

## 🧱 Sprint 1 — Los Cimientos y el Sistema de Diseño

### 🍰 Matias
| Componente | Estado | Notas |
| :--- | :--- | :--- |
| `components/ui/Button.tsx` | ✅ | CVA con `variant` (primary/secondary/outline/ghost) y `size` (sm/default/lg). |
| `components/ui/Input.tsx` | ✅ | CVA con `state` (default/error/success) + `label`/`hint`/`error`. |
| Configuración de Rutas | ✅ | `react-router-dom` en `App.tsx` con `ClienteLayout` y `AdminLayout`. |

### 🎨 Anais
| Componente | Estado | Notas |
| :--- | :--- | :--- |
| `components/layout/Navbar.tsx` | ✅ | Menú móvil (hamburguesa), ítem Carrito con badge, menú de perfil y modales de auth. |
| `components/layout/Footer.tsx` | ✅ | Footer modular con `CONTACTOS`, `HORARIOS` y `REDES_SOCIALES`. |
| `components/domain/ProductCard.tsx` | ✅ | Tarjeta con `Badge`; base de clases como constante (sin CVA: no tiene variantes). |

### 🔐 Nicolas
| Componente | Estado | Notas |
| :--- | :--- | :--- |
| `components/layout/AdminSidebar.tsx` | ⏳ | Hoy `layouts/AdminLayout.tsx` usa `Skeleton` "AdminSidebar". |
| `components/ui/Badge.tsx` | ✅ | CVA con `tipo` (premium/temporada/vendido/personalizable). |
| `components/ui/Card.tsx` | ✅ | Creado en el refactor CVA; CVA con `padding` (none/sm/md/lg). |

---

## 🛍️ Sprint 2 — El Escaparate y Accesos

| Página | Dueño | Estado | Notas |
| :--- | :--- | :--- | :--- |
| `pages/cliente/Home.tsx` | Matias | ✅ | Hero full-bleed, `BannerServicios` (marquee), carrusel de destacados y secciones. |
| `pages/cliente/Catalogo.tsx` | Matias | ✅ | Filtros (búsqueda/categorías/variaciones/precio) con drawer en mobile. |
| `pages/cliente/ProductoDetalle.tsx` | Anais | ⏳ | Ruta `producto/:id` en `Placeholder`. |
| `pages/cliente/Envio.tsx` | Anais | ⏳ | Ruta `envio` en `Placeholder`. |
| `pages/cliente/Login.tsx` | Nicolas | 🔁 | No hay página; se resuelve con `components/domain/ModalLogin.tsx`. |
| `pages/cliente/Registro.tsx` | Nicolas | 🔁 | No hay página; se resuelve con `components/domain/ModalRegistro.tsx`. |

---

## 💳 Sprint 3 — El Flujo Transaccional

| Página | Dueño | Estado | Notas |
| :--- | :--- | :--- | :--- |
| `pages/cliente/Carrito.tsx` | Matias | ✅ | Stepper de cantidad, cupón y resumen; usa `Card`/`OrderSummary`/`PageHero`. |
| `pages/cliente/Checkout.tsx` | Matias | ✅ | Facturación + método de pago + resumen; usa `Card`/`OrderSummary`/`PageHero`. |
| `pages/cliente/Confirmacion.tsx` | Anais | ⏳ | Ruta `confirmacion` en `Placeholder`. |
| `pages/cliente/Perfil.tsx` | Anais | ⏳ | Ruta `perfil` en `Placeholder`. |
| `pages/admin/Pedidos.tsx` | Nicolas | ⏳ | Ruta `admin/pedidos` en `Placeholder`. |

---

## 📊 Sprint 4 — El Cerebro / Admin

| Página | Dueño | Estado | Notas |
| :--- | :--- | :--- | :--- |
| `pages/admin/Pos.tsx` | Matias | ✅ | Punto de Venta con 3 modales (Ticket/Pago/Éxito) y `FilaTicket`. Ver `guias/08`. |
| `pages/admin/Dashboard.tsx` | Anais | ⏳ | Ruta `admin` (index) en `Placeholder`. |
| `pages/admin/Configuracion.tsx` | Anais | ⏳ | Ruta `admin/configuracion` en `Placeholder`. |
| `pages/admin/Inventario.tsx` | Nicolas | ⏳ | Ruta `admin/inventario` en `Placeholder`. |
| `pages/admin/Usuarios.tsx` | Nicolas | ⏳ | Ruta `admin/usuarios` en `Placeholder`. |

---

## 🧩 Extras fuera del plan de `guias/06`

Estos archivos no estaban mapeados en el plan pero ya existen y sostienen el flujo actual.

| Área | Archivos | Notas |
| :--- | :--- | :--- |
| Datos y tipos | `data/products.ts`, `types/product.ts`, `types/ticket.ts` | Catálogo tipado (`Producto`, `BadgeTipo`) y `ItemTicket`. |
| Estado global | `context/cart.ts` + `CartProvider.tsx`, `context/auth.ts` + `AuthProvider.tsx` | Carrito y sesión simulada, persistidos en `localStorage` (`cremeco-carrito`, `cremeco-sesion`). |
| UI de dominio | `components/domain/MiniCarrito.tsx`, `ModalLogin.tsx`, `ModalRegistro.tsx`, `MenuPerfil.tsx` | Mini-carrito modal, autenticación y menú de perfil. |
| Utilidades | `lib/utils.ts`, `lib/storage.ts`, `hooks/useMediaQuery.ts` | `cn`, `formatPrecio` (CLP), helpers de `localStorage`, hook `matchMedia`. |
| Layouts | `layouts/ClienteLayout.tsx`, `layouts/AdminLayout.tsx`, `pages/Placeholder.tsx`, `components/dev/Skeleton.tsx` | Shell de cliente/admin y placeholders por responsable. |
| Responsividad mobile (cliente) | `Navbar`, `Catalogo`, `Home`, `Carrito`, `index.css` | Hamburguesa, drawer de filtros, overrides en `@layer utilities`. Solo cliente. |

---

## 🔁 Refactor CVA (`guias/07`)

Aplicado el patrón **"se limpia al publicar"**: se promovieron a componentes los bloques repetidos 2+ veces.

| Componente nuevo | Reemplaza | CVA |
| :--- | :--- | :--- |
| `components/ui/Card.tsx` | Paneles de Carrito/Checkout/Placeholder | `padding` |
| `components/ui/CantidadStepper.tsx` | Steppers de Carrito y POS | `variant` (pill/compact) |
| `components/ui/PasswordInput.tsx` | Input con ojo de Login/Registro | — (sin variantes) |
| `components/ui/PageHero.tsx` | Hero de Carrito/Checkout | `align` (left/center) |
| `components/ui/EmptyState.tsx` | Carrito vacío (MiniCarrito/Carrito/Checkout/POS) | — |
| `components/domain/OrderSummary.tsx` | Resumen de Carrito/Checkout | — |
| `components/domain/FiltroCheckbox.tsx` | Filtros de Catálogo | — |
| `components/admin/pos/PillCategoria.tsx` | Pills de categoría del POS | `active` |

Además: `ProductCard` perdió el `cva` sin variantes; se quitó `cn()` de un solo string en `FilaTicket`/`TarjetaProducto`; los comentarios de `index.css` y `mockup.css` quedaron sin tildes (el snapshot `mockup/cliente/**` y los textos de UI se mantienen intactos).

---

## ✅ Verificación

- `npm run lint` → 0 problemas.
- `npm run build` (`tsc -b && vite build`) → OK.
- Validación visual pendiente por el equipo en el dev server.
