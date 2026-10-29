<!-- @pca:start
@id(docs.estado_proyecto)
@kind(doc)
@limit(lines: 200)
@relates(docs.convenciones)
@relates(docs.reglas_ui)
@relates(docs.git)
@desc(Tablero de control: fase, stack, sprints, tickets y próximo paso)
@pca:end -->

# Estado del Proyecto (Anti-Amnesia)

> **Instrucción para la IA:** Lee este archivo al iniciar **cada** sesión, antes de proponer cualquier cambio. Al cerrar la sesión, actualízalo. Este documento es la memoria del proyecto: si no está actualizado, el alumno pierde el contexto y aparece la **amnesia de contexto**.

**Última actualización:** 2026-10-24

---

## 1. Fase actual del flujo

| Campo | Valor |
| :--- | :--- |
| **Fase actual** | F3 — Ejecución por tickets |
| **Siguiente fase** | F4 — Validación / Testing (cuando se complete la migración a design system) |
| **Estado** | En curso — Home migrada al design system y responsividad mobile corregida |

> Fases: F0 Setup → F1 Levantamiento → F2 Sprints → F3 Ejecución → F4 Validación → F5 Cierre. Ver `AGENTS.md`.

---

## 2. Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| Frontend | React 18.3 + TypeScript 5.6 + Vite 5 + React Router 7 + CVA + clsx + tailwind-merge + lucide-react |
| Backend | Spring Boot (Java) + Spring Security + JPA + MySQL 8 — *pendiente* |
| Base de Datos | MySQL 8 (esquema en `docs/` del backend) — *pendiente* |
| Estilos | Tailwind CSS v4 (tokens en `@theme` de `frontend/src/index.css`) + CSS legacy del snapshot en `frontend/src/mockup/` |
| Imágenes | `sharp` (script `frontend/scripts/optimize-images.mjs`) |

### Tokens de color (design system)

`primary #FFC0CB` · `secondary #8B4513` · `tertiary #5D4037` · `neutral #FFF5E1` · `ink #3A2A21` · `inverted #241812`

Detalle completo en [`docs/reglas_ui.md`](./reglas_ui.md).

---

## 3. Resumen del proyecto

**Crème & Co** es una pastelería artesanal ficticia. La app es una tienda online con dos
roles: **cliente** (catálogo, carrito, checkout, seguimiento de envío, perfil, blog) y
**administrador** (POS, pedidos, inventario, usuarios, configuración).

El frontend ya está construido en React + TypeScript con Vite. La migración desde el
mockup HTML/CSS está **en curso**: el equipo viene migrando página por página al
design system de Tailwind v4. **`src/mockup/` sigue presente** y contiene el CSS
legacy que aún usan Navbar, Catálogo, Carrito y Checkout; se elimina cuando termine
la migración.

---

## 4. Sprints

| Sprint | Objetivo | Estado |
| :--- | :--- | :--- |
| Sprint 1 | Base y autenticación | En curso (modales login/registro) |
| Sprint 2 | Base de datos | Pendiente (Spring Boot + MySQL) |
| Sprint 3 | Lógica backend | Pendiente |
| Sprint 4 | Frontend / UI | En curso (migración a design system) |

---

## 5. Tablero de Tickets

| ID | Título | Fase/Sprint | Estado | Convenciones |
| :--- | :--- | :--- | :--- | :--- |
| T10 | Instalación del kit PCA en la raíz + documentación sincronizada | F3 / S4 | Hecho | `CONV-DOC-01` |
| T11 | Primitivas del design system (`Button`, `ButtonLink`, `LogoCremeCo`, radios) | F3 / S4 | Hecho | `CONV-UI-04` |
| T12 | Migración de Home a componentes (`HeroHome`, `CarouselDestacados`, `SobreNosotros`, `BlogRecientes`) | F3 / S4 | Hecho | `CONV-UI-01`, `CONV-UI-04` |
| T13 | `ProductCard` funcional (carrito real, enlaces reales, a11y) | F3 / S4 | Hecho | `CONV-UI-02`, `CONV-UI-03` |
| T14 | Responsive y a11y (hero, carrusel, menú móvil) | F3 / S4 | Hecho | `CONV-UI-03` |
| T15 | Performance, SEO y limpieza del snapshot | F3 / S4 | Hecho | `CONV-GEN-02` |
| T16 | Migrar Catálogo al design system (elimina `catalogo.css`) | F3 / S4 | Pendiente | `CONV-UI-04` |
| T17 | Migrar Navbar y Footer al design system | F3 / S4 | Pendiente | `CONV-UI-04` |
| T18 | Implementar `ProductoDetalle` (ruta `producto/:id`) | F3 / S4 | Pendiente | `CONV-UI-02` |
| T19 | Eliminar `frontend/src/mockup/` | F3 / S4 | Pendiente | `CONV-GEN-02` |
| T20 | Fix de responsividad: `main` del shell con `max-w-full` + `xl:max-w-page` | F3 / S4 | Hecho | `CONV-UI-03` |
| FE-00 | Estabilizar build (`asChild` → `ButtonLink`, linteo y limpieza de imports) | F3 / FE | Hecho | `CONV-TIP-01`, `CONV-GEN-02` |
| FE-14 | Perfil de usuario (`Perfil.tsx`, `PerfilSidebar.tsx`, modales de edición) | F3 / FE | Hecho | `CONV-UI-01`, `CONV-UI-04` |
| FE-15 | Seguimiento de pedido (`PerfilSeguimiento.tsx`, `LineaTiempoPedido.tsx`, `EstadoPedidoBadge.tsx`) | F3 / FE | Hecho | `CONV-UI-01`, `CONV-UI-04` |
| FE-30 | Personalización de tortas (`Personalizacion.tsx`: porciones, sabores y cotización) | F3 / FE | Hecho | `CONV-UI-01`, `CONV-UI-04` |
| FE-02 | Contratos de dominio/entidades (`frontend/src/interfaces/`) + reglas backend y grafo PCA | F3 / FE | Hecho | `CONV-DOC-01`, `CONV-TIP-01` |
| FE-CVA | Refactorización de legibilidad de componentes de UI y dominio con CVA (`class-variance-authority`) | F3 / FE | Hecho | `CONV-UI-04`, `CONV-TIP-01`, `CONV-GEN-04` |
| DOC-02 | Diccionario técnico de funciones, variables y matriz de impacto Blast Radius (`docs/diccionario_funciones_variables.md`) | F3 / DOC | Hecho | `CONV-DOC-01`, `CONV-GEN-05` |
| ADM-01 | PWA de Administración (`/admin`), Dashboard, Productos, Inventario, Usuarios, Promociones y UI Kit Showcase | F3 / ADM | Hecho | `CONV-UI-01`, `CONV-UI-04`, `CONV-DOC-01` |
| BK-01 | Andamiaje de microservicios Spring Boot, clientes API (`frontend/`, `admin-pwa/`) y script `iniciar_backend.bat` | F3 / BK | Hecho | `CONV-DOC-01`, `CONV-EST-01` |
| BK-02 | Adaptación de pasarela Flow.cl desde Biblioteca-de-Componentes-main (idempotencia en BD, reembolsos, webhooks seguros y suite de pruebas) | F3 / BK | Hecho | `CONV-DOC-01`, `CONV-EST-01` |
| ADM-02 | Sincronización en tiempo real (0ms BroadcastChannel + Storage + API) de disponibilidad entre Admin PWA y Tienda | F3 / ADM | Hecho | `CONV-UI-01`, `CONV-UI-04` |
| FE-31 | Relleno rápido test en Login/Checkout, pasarelas seguras (Flow, Transferencia, MP) y Botón flotante de carrito inferior central | F3 / FE | Hecho | `CONV-UI-01`, `CONV-UI-04` |
| FE-INT-01 | Cliente HTTP con inyección automática de JWT y autenticación real con `service-identity` | F3 / INT | Hecho | `CONV-TIP-01`, `CONV-SEG-01` |
| FE-INT-02 | Catálogo dinámico y detalle de producto conectados con `service-catalog` | F3 / INT | Hecho | `CONV-UI-02`, `CONV-TIP-01` |
| FE-INT-03 | Carrito de compras con validación remota de cupones y control de stock | F3 / INT | Hecho | `CONV-UI-01`, `CONV-TIP-01` |
| FE-INT-04 | Checkout completo, creación de orden y verificación de pasarela Flow.cl | F3 / INT | Pendiente | `CONV-TIP-01`, `CONV-ERR-01` |
| FE-INT-05 | Perfil de cliente, direcciones dinámicas y tracking en tiempo real | F3 / INT | Pendiente | `CONV-UI-02`, `CONV-TIP-01` |
| FE-INT-06 | Cotizaciones de personalización y registro de ventas POS en Kardex | F3 / INT | Pendiente | `CONV-EST-01`, `CONV-TIP-01` |
| T89 | Reglas de negocio transversales: RUT Módulo 11, Región→Comuna y validadores puros | F3 / S7 | Hecho | `CONV-EST-01`, `CONV-TIP-01`, `CONV-TIP-03`, `CONV-ERR-02` |
| T90 | Persistencia JPA MySQL (`cremeco_db`), `DataSeeder` automático y OpenAPI en los 6 microservicios | F3 / S7 | Hecho | `CONV-NAM-05`, `CONV-EST-01`, `CONV-SEG-01` |
| T91 | Vistas `/login` y `/registro` (maquetado previo, validadores puros y guardián de rutas RBAC en `admin-pwa`) | F3 / S7 | Pendiente | `CONV-UI-01`, `CONV-SEG-01`, `CONV-TIP-01` |

Estados: `Pendiente` · `En curso` · `En revisión` · `Hecho`.

---

## 6. Próximo paso

> Un solo ticket concreto a la vez. Rama activa de desarrollo: `dev`.

- **T91 — Vistas `/login` y `/registro` (maquetado previo, validadores puros y guardián de rutas RBAC en `admin-pwa`):**
  1. Diseñar maquetado base HTML/CSS en `MockUpPasteleria/validacion/` para las vistas de autenticación según DSY1104.
  2. Implementar/conectar formularios con `auth.validator.ts` y servicio de identidad (`POST /api/identity/login`, `POST /api/identity/register`).
  3. Incorporar botones de relleno rápido para pruebas (Administrador, Pastelero, Repartidor, Cliente con historial María González).
  4. Implementar guardián de rutas RBAC estricto en `admin-pwa` para restringir acceso exclusivamente a usuarios con rol ADMIN o STAFF.

---

## 7. Notas y decisiones

- **El mockup (`MockUpPasteleria/`) es solo referencial.** La estructura final es
  React-idiomática: no se copian clases del snapshot, se usan componentes del design system.
- **Navegación:** Se reemplazó el enlace de "Seguimiento" en Navbar por "Personalización" (`/personalizacion`). El acceso a seguimiento queda centralizado dentro del perfil del cliente tras iniciar sesión (en `MenuPerfil` y dentro de `Perfil`).
- **PWA de Administración desacoplada (`admin-pwa/`):** Por decisión arquitectónica explícita para evitar colisiones de estilos entre Bootstrap 5 y Tailwind CSS v4, la aplicación de administración se separó en su propia carpeta independiente `admin-pwa/` (HTML5, Bootstrap 5, CSS nativo, Service Worker `sw.js` y `manifest.json`), mientras que `frontend/` permanece 100% limpio en Tailwind v4 para la tienda de clientes. La PWA de administración incluye Dashboard, Catálogo con regla de productos vendidos, Inventario Kardex, RBAC, Cupones, POS y UI Kit de Componentes.
- **Arquitectura de Microservicios & Kafka (`backend/`):** Se definió en `docs/arquitectura_microservicios_kafka.md` la topología distribuida basada en Apache Kafka y Spring Boot. Se inicializó la infraestructura con `docker compose -f backend/docker-compose.yml up -d` (MySQL 8 :3306, Apache Kafka :9092, Zookeeper :2181, Kafdrop :9000, Redis :6379), se compilaron los 9 módulos con Maven y se crearon los clientes de integración en `frontend/src/services/api.ts` y `admin-pwa/src/services/api.ts`. Orquestación automatizada en `iniciar_backend.bat`.
- **Estandarización y Legibilidad con CVA (`class-variance-authority`):** Se auditaron y refactorizaron los componentes del frontend para reemplazar lógica condicional imperativa y ternarios dispersos en JSX por variantes declarativas fuertemente tipadas:
  - `EstadoPedidoBadge.tsx`: Variantes semánticas por estado (`pendiente`, `preparacion`, `listo`, `entregado`, `cancelado`) y tamaños (`sm`, `default`, `lg`), con normalización automática de tildes.
  - `Modal.tsx`: Variante de tamaños (`sm`, `md`, `lg`, `xl`) eliminando mapeos manuales de objetos.
  - `SectionTitle.tsx`: Variantes de alineación (`center`, `left`) y espaciado (`compact`, `default`, `spacious`).
  - `EmptyState.tsx`: Variantes de espaciado (`compact`, `default`, `spacious`).
  - `BlogCard.tsx`: Variantes (`default`, `featured`) para contenedor, imagen y tipografía unificadas.
  - `LineaTiempoPedido.tsx`: Variantes sincronizadas para marcadores de estado, tarjetas y títulos.
  - `ProductCard.tsx`: Variantes de elevación (`flat`, `subtle`, `hoverable`).
  - `Input.tsx`: Variantes de tamaño (`sm`, `default`, `lg`) y estado (`default`, `error`, `success`).
  - Cero warnings de React Fast Refresh y cero errores de TypeScript/ESLint.
- **Grafo de impacto PCA:** 48 nodos y 110 relaciones validadas sin errores ni FK huérfanas.
- **Escala de breakpoints:** solo Tailwind (`sm` 640, `md` 768, `lg` 1024, `xl` 1280).
  Se eliminaron los 900/960/1200 del snapshot.
- **Full-bleed:** se mantiene `100cqi` (nunca `100vw`, que incluye la scrollbar).
- **Botones:** `rounded-full` (píldora) en `Button` → afecta Carrito, Checkout y POS.
- **Colores de CTA:** el `primary` del design system (rosa) es el color de acción;
  el marrón `secondary` del snapshot era el color del botón en HTML.
- **Marquee de `BannerServicios`:** se conserva (mejora de UX; el mockup no lo tenía).
- **Imagenes:** PNG → WebP y JPG re-codificados. `public/imagen/` bajó de 3,3 MB a 767 KB.
- **Marcadores de posición:** las rutas sin página real (`/blog/:slug`, `/producto/:id`)
  usan `pages/Placeholder.tsx`, nunca `to="#"`.
- **Evidencia de T12–T15:** smoke test SSR temporal de la Home (27/27 comprobaciones OK:
  sin `href="#"`, sin clases del snapshot, todas las imágenes referenciadas existen). El
  andamiaje se eliminó al cerrar el ticket; el error de aserción queda registrado como
  `FRONT-012` en `docs/cicatrices_guerra.md`.
- **Evidencia de T20:** medición real en Edge headless (CDP) sobre el build de producción,
  antes y después del fix, en 7 anchos (360 / 390 / 430 / 768 / 1024 / 1280 / 1440) y
  5 rutas (`/`, `/catalogo`, `/carrito`, `/checkout`, `/envio`).
  - **Home:** `main` pasa de 1080px fijos a `clientWidth` del viewport; el hero pasa de
    estar fuera de pantalla (`x=360..720` en 360px) a ocupar el viewport completo
    (`x=0..360`). Sin scroll horizontal ni desbordes en ninguna medida.
  - **1280 / 1440:** `main` = 1080px y hero = `0..1265` / `0..1425`, **idénticos** al
    estado previo → sin regresión en escritorio.
  - **Catálogo / Carrito / Checkout / Envío:** `main` con el mismo ancho que antes del
    fix en los 7 anchos → el cambio no afecta a las páginas aún no migradas.
  - **Menú móvil (390px):** el panel se abre dentro del viewport.
  - La causa raíz y el porqué del `margin-inline: auto` quedan registrados como
    `FRONT-013` en `docs/cicatrices_guerra.md`.
- **Grafo PCA:** al añadir `ClienteLayout.tsx` al manifiesto se detectó que el anotador
  **truncaba las relaciones** de cada nodo (sobrevivía solo la última línea `@relates`):
  el grafo declaraba 23 relaciones para 23 nodos, cuando el manifiesto define 42. Corregido
  en `tools/pca_annotator.py` y registrado como `FRONT-014`. `impact` ahora devuelve los
  dependientes reales (p. ej. `frontend.pages.cliente.home` → `frontend.layouts.clienteLayout`).
- **Orden del hero en móvil (refinamiento de T12/T14):** por debajo de 768px el logo va
  arriba y el CTA "Ver Catálogo" queda por debajo del logo (antes el botón quedaba arriba
  y el logo cerraba el hero). Medido en el navegador:
  - 360 / 390 / 430px → logo `y=121..`, título por debajo, botón `y=628..676`; el hero
    **mantiene su altura** (651px en 390px).
  - 768 / 1024 / 1280 / 1440px → **idéntico** a antes (texto a la izquierda, logo a la
    derecha, mismas coordenadas).
  - El **orden del DOM no cambia** (`p > h1 > p > a[Ver Catálogo] > svg`): el logo es
    decorativo y no focusable, así que lectura y foco siguen siendo título → CTA.
- **Pendiente de validación manual:** checklist responsive 360 / 390 / 430 / 768 / 1024 /
  1280 / 1440 (sección 7 de `docs/reglas_ui.md`).
