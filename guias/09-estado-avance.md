# 📈 Estado de Avance del Proyecto

Seguimiento del plan de `guias/06-planificacion-scrum.md` y de la estrategia **Snapshot → Extracción → Migración**. Refleja el avance real del código en `frontend/src/` al cierre de este sprint.

> Leyenda: ✅ hecho · 🟡 en progreso · ⏳ pendiente · 🔁 decisión tomada (difiere del plan original).

---

## 🧭 Estrategia de migración (`guias/06`)

| Fase | Estado | Detalle |
| :--- | :--- | :--- |
| **1. Snapshot** (paridad visual) | ✅ | CSS del mockup cliente encolado en `frontend/src/mockup/`: `cliente/*.css` + `mockup.css` (`@import url("./cliente/estilos.css") layer(components)`) + `imagen/fondo_obrador.png`. No se portó el JS del mockup (la interactividad es React). |
| **2. Extracción** | ✅ | Extraídos con clases del mockup donde aplica: `Navbar`, `Footer`, `ProductCard`, `Badge`, `SectionTitle`, `BannerServicios`. |
| **3. Migración a design system** | 🟡 | Carrito, Checkout, POS y todo el panel admin usan tokens + `Button`/`Input`/`Card`/`Badge`/`Modal`. Home y Catálogo aún conservan clases del mockup. `src/mockup/` sigue presente (se elimina al terminar). |

---

## 🧱 Sprint 1 — Los Cimientos y el Sistema de Diseño

### 🍰 Matias
| Componente | Estado | Notas |
| :--- | :--- | :--- |
| `components/ui/Button.tsx` | ✅ | CVA con `variant` (primary/secondary/outline/ghost) y `size` (sm/default/lg). |
| `components/ui/Input.tsx` | ✅ | CVA con `state` (default/error/success) + `label`/`hint`/`error`. Mejorado con `aria-describedby` y `role="alert"` en errores. |
| Configuración de Rutas | ✅ | `react-router-dom` en `App.tsx` con `ClienteLayout`, `AdminLayout` y `RutaAdmin`. |

### 🎨 Anais
| Componente | Estado | Notas |
| :--- | :--- | :--- |
| `components/layout/Navbar.tsx` | ✅ | Menú móvil (hamburguesa), ítem Carrito con badge, menú de perfil y modales de auth. |
| `components/layout/Footer.tsx` | ✅ | Footer modular con `CONTACTOS`, `HORARIOS` y `REDES_SOCIALES`. |
| `components/domain/ProductCard.tsx` | ✅ | Tarjeta con `Badge`; base de clases como constante (sin CVA: no tiene variantes). |

### 🔐 Nicolas
| Componente | Estado | Notas |
| :--- | :--- | :--- |
| `components/layout/AdminSidebar.tsx` | ✅ | Sidebar con navegación, active state, logout y drawer móvil. |
| `components/layout/AdminHeader.tsx` | ✅ | Header con hamburguesa, título por ruta, usuario y acceso a la tienda. |
| `components/ui/Badge.tsx` | ✅ | `Badge` de producto + `EstadoBadge` con tonos success/warning/danger/info/neutral/primary. |
| `components/ui/Card.tsx` | ✅ | CVA con `padding` (none/sm/md/lg). |
| `components/ui/Modal.tsx` | ✅ | Overlay, cierre con Escape/click y tamaños `sm/md/lg`. |
| `components/ui/PillFiltro.tsx` | ✅ | Pill de filtros con estado activo, reutilizado en Pedidos, Inventario y Usuarios. |
| `components/ui/Toast.tsx` | ✅ | Aviso flotante accesible con autocierre y tonos success/error/info. |

---

## 🛍️ Sprint 2 — El Escaparate y Accesos

| Página | Dueño | Estado | Notas |
| :--- | :--- | :--- | :--- |
| `pages/cliente/Home.tsx` | Matias | ✅ | Hero full-bleed, `BannerServicios` (marquee), carrusel de destacados y secciones. |
| `pages/cliente/Catalogo.tsx` | Matias | ✅ | Filtros (búsqueda/categorías/variaciones/precio) con drawer en mobile. |
| `pages/cliente/ProductoDetalle.tsx` | Anais | ✅ | Detalle con imagen, ingredientes, notas, cantidad y relacionados. |
| `pages/cliente/Envio.tsx` | Anais | ✅ | Seguimiento con stepper, mapa, resumen y soporte. |
| `pages/cliente/Login.tsx` | Nicolas | ✅ | Página completa con validación, `?redirect=` seguro y acceso demo admin. Comparte formulario con `ModalLogin`. |
| `pages/cliente/Registro.tsx` | Nicolas | ✅ | Página completa con nombre, correo, contraseña segura, confirmación y términos. Comparte formulario con `ModalRegistro`. |

---

## 💳 Sprint 3 — El Flujo Transaccional

| Página | Dueño | Estado | Notas |
| :--- | :--- | :--- | :--- |
| `pages/cliente/Carrito.tsx` | Matias | ✅ | Stepper de cantidad, cupón y resumen; usa `Card`/`OrderSummary`/`PageHero`. |
| `pages/cliente/Checkout.tsx` | Matias | ✅ | Facturación + método de pago + resumen; usa `Card`/`OrderSummary`/`PageHero`. |
| `pages/cliente/Confirmacion.tsx` | Anais | ✅ | Confirmación con resumen del pedido y datos de pago. |
| `pages/cliente/Perfil.tsx` | Anais | ✅ | Datos personales, preferencias, historial y recomendaciones. |
| `pages/admin/Pedidos.tsx` | Nicolas | ✅ | Tarjetas con filtros, búsqueda, modal de detalle y avance de estados persistente. |

---

## 📊 Sprint 4 — El Cerebro / Admin

| Página | Dueño | Estado | Notas |
| :--- | :--- | :--- | :--- |
| `pages/admin/Pos.tsx` | Matias | ✅ | Punto de Venta con 3 modales (Ticket/Pago/Éxito) y `FilaTicket`. Ver `guias/08`. |
| `pages/admin/Dashboard.tsx` | Anais | ✅ | Métricas reales de pedidos, gráfico por periodo, notificaciones y top de ventas. |
| `pages/admin/Configuracion.tsx` | Anais | ✅ | Datos de la tienda, banner, switch de Flow y API Key solo en memoria. |
| `pages/admin/Inventario.tsx` | Nicolas | ✅ | Resumen de stock, filtros, búsqueda, tabla y modales de crear/editar/eliminar. |
| `pages/admin/Usuarios.tsx` | Nicolas | ✅ | Búsqueda, filtros por rol/estado, edición de rol, suspender/reactivar y protecciones. |

---

## 🔐 Cierre de Autenticación y Panel Admin (Nicolas)

### Autenticación
| Elemento | Estado | Notas |
| :--- | :--- | :--- |
| `context/auth.ts` + `AuthProvider.tsx` | ✅ | Sesión simulada con `rol` (`cliente`/`admin`), persistida en `cremeco-sesion`. No guarda contraseñas. |
| `components/domain/auth/FormularioLogin.tsx` | ✅ | Formulario compartido por página y modal. |
| `components/domain/auth/FormularioRegistro.tsx` | ✅ | Validación de nombre, email, contraseña y términos. |
| `lib/validacion.ts` | ✅ | Reglas compartidas de email, nombre y contraseña segura. |
| `lib/redireccion.ts` | ✅ | Evita redirecciones externas en `?redirect=`. |
| `components/domain/auth/RutaAdmin.tsx` | ✅ | Protege `/admin`: sin sesión redirige a `/login`; con rol cliente muestra “Acceso restringido”. |

**Acceso demo administrador:** `admin@cremeco.cl` / `admin123`.
También tienen acceso admin `matias@ejemplo.com` y `nicolas@ejemplo.com` con la misma clave demo.

### Panel admin
| Elemento | Estado | Notas |
| :--- | :--- | :--- |
| `AdminSidebar` + `AdminHeader` | ✅ | Navegación del panel, responsive y logout. |
| `EstadoBadge` | ✅ | Estados de pedidos, stock, roles y cuentas. |
| `PillFiltro` + `Toast` | ✅ | Filtros reutilizables y feedback de acciones. |
| `RutaAdmin` | ✅ | Única puerta de entrada a `/admin/**`. |

---

## 🧩 Extras fuera del plan de `guias/06`

| Área | Archivos | Notas |
| :--- | :--- | :--- |
| Datos y tipos | `data/products.ts`, `data/pedidos.ts`, `data/inventario.ts`, `data/usuarios.ts`, `types/product.ts`, `types/pedido.ts`, `types/ticket.ts`, `types/inventario.ts`, `types/usuario.ts` | Catálogo, pedidos, inventario y usuarios tipados. |
| Estado global | `context/cart.ts` + `CartProvider.tsx`, `context/auth.ts` + `AuthProvider.tsx` | Carrito y sesión simulados en `localStorage`. |
| Persistencia | `lib/storage.ts`, `lib/pedidos.ts`, `lib/inventario.ts`, `lib/usuarios.ts` | Claves: `cremeco-carrito`, `cremeco-sesion`, `cremeco-pedidos`, `cremeco-pedidos-estados`, `cremeco-inventario`, `cremeco-usuarios`. |
| UI de dominio | `components/domain/MiniCarrito.tsx`, `ModalLogin.tsx`, `ModalRegistro.tsx`, `MenuPerfil.tsx` | Mini-carrito, autenticación y menú de perfil. |
| Utilidades | `lib/utils.ts`, `lib/validacion.ts`, `lib/redireccion.ts`, `hooks/useMediaQuery.ts` | `cn`, `formatPrecio` (CLP), validaciones, redirección segura y `matchMedia`. |
| Layouts | `layouts/ClienteLayout.tsx`, `layouts/AdminLayout.tsx`, `pages/Placeholder.tsx` | Shell de cliente/admin; `Placeholder` queda solo para 404. |
| Responsividad mobile | `Navbar`, `Catalogo`, `Home`, `Carrito`, `AdminSidebar`, `index.css` | Hamburguesa, drawer de filtros, drawer admin y overrides en `@layer utilities`. |

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
| `components/ui/PillFiltro.tsx` | Filtros de Pedidos/Inventario/Usuarios | `active` |
| `components/ui/Toast.tsx` | Feedback de acciones del admin | `tono` |
| `components/ui/Badge.tsx` | Badge de producto + estados del admin | `tipo` / `tono` |
| `components/ui/Modal.tsx` | Modales de POS/Inventario/Usuarios/Pedidos | `size` |
| `components/domain/OrderSummary.tsx` | Resumen de Carrito/Checkout/Envio | — |
| `components/domain/FiltroCheckbox.tsx` | Filtros de Catálogo | — |
| `components/admin/pos/PillCategoria.tsx` | Pills de categoría del POS | `active` |
| `components/admin/inventario/FormularioProducto.tsx` | Formulario de alta/edición de inventario | — |

Además: `ProductCard` perdió el `cva` sin variantes; se quitó `cn()` de un solo string en `FilaTicket`/`TarjetaProducto`; los comentarios de `index.css` y `mockup.css` quedaron sin tildes (el snapshot `mockup/cliente/**` y los textos de UI se mantienen intactos).

---

## ✅ Verificación

- `npm run lint` → **0 problemas**.
- `npm run build` (`tsc -b && vite build`) → **OK**.
- Validación manual en navegador:
  - Login/Registro con validaciones y redirección.
  - Acceso admin con credenciales demo.
  - Redirección de `/admin` sin sesión y bloqueo para rol cliente.
  - Pedidos: filtros, búsqueda, detalle y persistencia de estados.
  - Inventario: alta, edición, eliminación, filtros y persistencia.
  - Usuarios: roles, suspensión/reactivación y protecciones de último admin/cuenta propia.
  - Sidebar/header responsive y modales del POS sin regresiones.
