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

**Última actualización:** 2026-11-03

---

## 1. Fase actual del flujo

| Campo | Valor |
| :--- | :--- |
| **Fase actual** | F4 — Validación / Testing & Entorno de Producción Docker |
| **Siguiente fase** | F5 — Cierre / Extracción de Componentes Reutilizables |
| **Estado** | Sprints 7, 8, 9 y 10 completados (T89–T116). T117 completado (catálogo en 2 fases con tests). Ticket ADM-03 completado: blindaje de responsividad mobile en Admin PWA (corrección de desbordamiento horizontal Flexbox, header adaptativo con títulos clamp, scrollbar interno visual en tablas y switcher táctil en POS). |

> Fases: F0 Setup → F1 Levantamiento → F2 Sprints → F3 Ejecución → F4 Validación → F5 Cierre. Ver `AGENTS.md`.

---

## 2. Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| Frontend | React 18.3 + TypeScript 5.6 + Vite 5 + React Router 7 + CVA + clsx + tailwind-merge + lucide-react |
| Backend | Spring Boot (Java 17/21) + Spring Cloud Gateway + Apache Kafka + JPA + MySQL 8 + Redis 7 |
| Base de Datos | MySQL 8 (`cremeco_db`) + Redis 7 (`:6379`) |
| Estilos | Tailwind CSS v4 (tokens en `@theme` de `frontend/src/index.css`) + CSS legacy del snapshot en `frontend/src/mockup/` |
| Imágenes | `sharp` (script `frontend/scripts/optimize-images.mjs`) + Compresión WebP en cliente (`admin-pwa`) |

### Tokens de color (design system)

`primary #FFC0CB` · `secondary #8B4513` · `tertiary #5D4037` · `neutral #FFF5E1` · `ink #3A2A21` · `inverted #241812`

Detalle completo en [`docs/reglas_ui.md`](./reglas_ui.md).

---

## 3. Resumen del proyecto

**Crème & Co** es una pastelería artesanal ficticia. La app es una tienda online con dos
roles: **cliente** (catálogo, carrito, checkout, seguimiento de envío, perfil, blog) y
**administrador** (POS, pedidos, inventario, usuarios, configuración).

---

## 4. Sprints

| Sprint | Objetivo | Estado |
| :--- | :--- | :--- |
| Sprint 1–6 | Base, autenticación, catálogo, compras, POS e integraciones | Hecho |
| Sprint 7 | Cumplimiento total Anexo 1 DSY1104, MySQL DataSeeder y Flow | Hecho |
| Sprint 8 | Gobernanza FIDA + OPL (`fida-kit`) y Flow.cl Real E2E | Hecho |
| Sprint 9 | Adopción integral del Patrón FIDA + OPL en Frontend, Admin PWA y Backend | Hecho |
| Sprint 10 | Contenedorización Docker completa en PC, Redis activo, Flow.cl diagnóstico y WebP en Admin | Hecho |
| Sprint 11 | Sincronización real E2E de stock web, reactividad tiempo real y eliminación de datos mock en Dashboard y Reportes | Hecho |
| Sprint 12 | Cohesión E2E de flujos del cliente en `frontend/`: `trackingCode` real en Checkout, `CantidadStepper` en `ProductoDetalle`, reactividad en `Ofertas` y `MiniCarrito` interactivo | Hecho |

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
| ADM-03 | Blindaje de responsividad mobile en Admin PWA: corrección de flexbox horizontal overflow, header dinámico, scroll interno de tablas y switcher mobile en POS | F4 / ADM | Hecho | `CONV-UI-01`, `CONV-UI-03`, `CONV-UI-04` |
| FE-31 | Relleno rápido test en Login/Checkout, pasarelas seguras (Flow, Transferencia, MP) y Botón flotante de carrito inferior central | F3 / FE | Hecho | `CONV-UI-01`, `CONV-UI-04` |
| FE-INT-01 | Cliente HTTP con inyección automática de JWT y autenticación real con `service-identity` | F3 / INT | Hecho | `CONV-TIP-01`, `CONV-SEG-01` |
| FE-INT-02 | Catálogo dinámico y detalle de producto conectados con `service-catalog` | F3 / INT | Hecho | `CONV-UI-02`, `CONV-TIP-01` |
| FE-INT-03 | Carrito de compras con validación remota de cupones y control de stock | F3 / INT | Hecho | `CONV-UI-01`, `CONV-TIP-01` |
| FE-INT-04 | Checkout completo, creación de orden y verificación de pasarela Flow.cl | F3 / INT | Hecho | `CONV-TIP-01`, `CONV-ERR-01` |
| FE-INT-05 | Perfil de cliente, direcciones dinámicas y tracking en tiempo real | F3 / INT | Hecho | `CONV-UI-02`, `CONV-TIP-01` |
| FE-INT-06 | Cotizaciones de personalización y registro de ventas POS en Kardex | F3 / INT | Hecho | `CONV-EST-01`, `CONV-TIP-01` |
| T89 | Reglas de negocio transversales: RUT Módulo 11, Región→Comuna y validadores puros | F3 / S7 | Hecho | `CONV-EST-01`, `CONV-TIP-01`, `CONV-TIP-03`, `CONV-ERR-02` |
| T90 | Persistencia JPA MySQL (`cremeco_db`), `DataSeeder` automático y OpenAPI en los 6 microservicios | F3 / S7 | Hecho | `CONV-NAM-05`, `CONV-EST-01`, `CONV-SEG-01` |
| T91 | Vistas `/login` y `/registro` (validadores puros, autofill demo y guardián de rutas RBAC en `admin-pwa`) | F3 / S7 | Hecho | `CONV-UI-01`, `CONV-SEG-01`, `CONV-TIP-01` |
| T92 | Vistas informativas `/nosotros` y `/contacto` (formulario conectado a `service-notification`) | F3 / S7 | Hecho | `CONV-UI-01`, `CONV-UI-04` |
| T93 | Vistas dinámicas de catálogo `/categorias`, `/categoria/:slug`, `/ofertas` y blog en MySQL | F3 / S7 | Hecho | `CONV-UI-02`, `CONV-TIP-01` |
| T94 | Checkout completo DSY1104, pasarela Flow sandbox, `/pago/exito` (impresión SII) y `/pago/error` | F3 / S7 | Hecho | `CONV-UI-01`, `CONV-ERR-01` |
| T95 | `/perfil` cliente, seguimiento `#CC-XXXX` con cambio de persona RUN Módulo 11 y personalización `#COT-XXXX` | F3 / S7 | Hecho | `CONV-UI-02`, `CONV-TIP-01` |
| T96 | Módulo Admin: Órdenes & Boletas (`/ordenes`) y modal de boleta oficial con desglose 19% IVA SII | F3 / S7 | Hecho | `CONV-UI-01`, `CONV-DOC-01` |
| T97 | Módulo Admin: Productos CRUD (`/productos`), pestaña stock crítico <= 5 y panel de reportes catálogo | F3 / S7 | Hecho | `CONV-UI-01`, `CONV-TIP-01` |
| T98 | Módulo Admin: Categorías CRUD (`/categorias`) y cupones de Promociones persistidos en MySQL | F3 / S7 | Hecho | `CONV-UI-01`, `CONV-TIP-01` |
| T99 | Módulo Admin: Usuarios CRUD completo, RUN Módulo 11, matriz de permisos e historial de compras | F3 / S7 | Hecho | `CONV-UI-01`, `CONV-SEG-01` |
| T100 | Módulos Admin: `/reportes`, `/perfil`, Inventario/POS real conectado y configuración VPS Docker | F3 / S7 | Hecho | `CONV-UI-01`, `CONV-EST-01` |
| T101 | Instalación y calibración de gobernanza FIDA + OPL (`fida-kit`) en la raíz (`.fidaignore`, `fida.config.json`, `selftest` 10/10) | F3 / S8 | Hecho | `CONV-DOC-01`, `CONV-SEG-02` |
| T102 | Carga automática de variables de entorno en Spring Boot (`spring.config.import`) y `iniciar_backend.bat` (`.env` blindado) | F3 / S8 | Hecho | `CONV-SEG-01`, `CONV-ERR-01` |
| T103 | Puente de retorno `POST /api/payments/flow/return` (`303 See Other`) y verificación E2E Flow.cl real | F3 / S8 | Hecho | `CONV-SEG-03`, `CONV-ERR-01` |
| T104 | Integración del Patrón de Diseño FIDA (5 subcarpetas, Aduana `dependencies.ts` y WAL Guard) en módulo `FlowPayment` | F3 / S8 | Hecho | `CONV-EST-01`, `CONV-TIP-02`, `CONV-DOC-01` |
| T105 | Autodescubrimiento global (`bootstrap`), auditoría estricta (`check --strict` + `guard`) y sellado final a producción | F4 / S8 | Hecho | `CONV-DOC-05`, `CONV-TIP-04` |
| T106 | Módulos FIDA de 5 subcarpetas en `frontend/src/features/` (`CatalogDiscovery`, `CheckoutSummary`, `CustomerTracking`, `CustomCakeQuote`) | F5 / S9 | Hecho | `CONV-EST-01`, `CONV-TIP-02` |
| T107 | Módulos FIDA de 5 subcarpetas en `admin-pwa/src/features/` (`AdminBoletaSii`, `AdminCriticalStock`, `AdminKardexPos`, `AdminRbacMatrix`) | F5 / S9 | Hecho | `CONV-EST-01`, `CONV-TIP-02` |
| T108 | Gobernanza FIDA + WAL Guard en los 6 microservicios Backend restantes (`api-gateway`, `identity`, `catalog`, `order`, `inventory`, `notification`) | F5 / S9 | Hecho | `CONV-DOC-01`, `CONV-EST-01` |
| T109 | Autodescubrimiento global (`bootstrap --apply`), sincronización de manifiestos y sellado 100% FIDA + OPL (0 archivos sin anotar) | F5 / S9 | Hecho | `CONV-DOC-05`, `CONV-TIP-04` |
| T110 | `Dockerfile`s de producción para los 7 microservicios Spring Boot en `backend/` | F4 / S10 | Hecho | `CONV-EST-01`, `CONV-SEG-01` |
| T111 | Orquestación Docker Compose de producción local (12 contenedores: 5 infra + 7 microservicios con healthchecks y feedback) | F4 / S10 | Hecho | `CONV-EST-01`, `CONV-ERR-01` |
| T112 | Integración activa del contenedor Redis (`:6379`) con microservicios Backend (`service-catalog` y `service-identity`) | F4 / S10 | Hecho | `CONV-EST-01`, `CONV-ERR-01` |
| T113 | Modo Producción/Sandbox Real de Flow.cl en Docker y endpoint/feedback de diagnóstico de redirección | F4 / S10 | Hecho | `CONV-ERR-01`, `CONV-SEG-01` |
| T114 | Módulo FIDA `AdminImageOptimizer` de compresión a WebP ligero en `admin-pwa` y soporte en `service-catalog` | F4 / S10 | Hecho | `CONV-UI-01`, `CONV-TIP-02` |
| T115 | Blindaje del entorno Docker local, separación `.env.docker`, automigración imagen y auditoría | F4 / S10 | Hecho | `CONV-EST-01`, `CONV-ERR-01`, `CONV-SEG-01` |
| T116 | Suite de pruebas automatizadas (Vitest, Testing Library, jsdom, mocks de localStorage, interacción UI y reporte de cobertura V8) con gobernanza FIDA | F4 / S10 | Hecho | `CONV-DOC-01`, `CONV-TIP-01` |
| T117 | Rediseño de Catálogo en 2 fases (`CatalogHomeView` + Catálogo filtrado con URL params), unificación en Navbar y 31 tests unitarios automáticos | F4 / S10 | Hecho | `CONV-UI-01`, `CONV-UI-02`, `CONV-UI-03`, `CONV-UI-04`, `CONV-TIP-01`, `CONV-TIP-04`, `CONV-DOC-01` |
| T118 | Aplanado y desacoplamiento limpio de `frontend/src/pages/`: eliminación de vestigios admin (`Pos.tsx`, `AdminLayout.tsx`, `components/admin`), aplanado de `cliente/` y build verificado | F4 / S10 | Hecho | `CONV-EST-01`, `CONV-GEN-02`, `CONV-DOC-01`, `CONV-TIP-01` |
| QA-TEST-001 | Incremento de Cobertura de Pruebas: Exclusiones de métrica (AC-1), suite Core `src/lib`, `src/lib/data`, `src/data` al 100%, validadores al 94.9% (AC-2), Features FIDA al 90-100% (AC-4), Context al 67.3%, Layout al 65.5% y `api.ts` al 56%. 95 tests en verde | F4 / S10 | En curso | `CONV-DOC-01`, `CONV-TIP-01`, `CONV-EST-01`, `CONV-ERR-02` |
| T123 | Ajustes UX Carrito: Ocultamiento contextual de `FloatingCartButton` en `/carrito` y `/checkout`/pago, y neutralización de spinners default en `CantidadStepper` | F4 / S10 | Hecho | `CONV-UI-01`, `CONV-UI-04`, `CONV-TIP-01` |
| T119 | Descuento transaccional de stock en venta web y Kardex backend (`service-order`, `catalog`, `inventory`) | F4 / S11 | Hecho | `CONV-EST-01`, `CONV-TIP-01`, `CONV-ERR-01` |
| T120 | Reactividad tiempo real de stock (BroadcastChannel `STOCK_UPDATED`) y sondeo activo en Admin PWA | F4 / S11 | Hecho | `CONV-UI-01`, `CONV-UI-04`, `CONV-TIP-01` |
| T121 | Métricas en vivo y eliminación total de datos mock en Dashboard Admin PWA (`Dashboard.tsx`) | F4 / S11 | Hecho | `CONV-UI-01`, `CONV-UI-04`, `CONV-ERR-01` |
| T122 | Desacoplamiento de mocks en Reportes y consistencia CSV contable (`Reportes.tsx`) | F4 / S11 | Hecho | `CONV-UI-01`, `CONV-ERR-01`, `CONV-TIP-01` |
| T124 | Sincronización E2E del `trackingCode` real de MySQL y pre-llenado de sesión en `Checkout.tsx` | F4 / S12 | Hecho | `CONV-EST-01`, `CONV-TIP-01`, `CONV-ERR-01`, `CONV-UI-01` |
| T125 | Unificación de `ProductoDetalle.tsx` con `CantidadStepper`, tope de stock real y feedback sin redirección forzada | F4 / S12 | Hecho | `CONV-UI-02`, `CONV-UI-04`, `CONV-TIP-01` |
| T126 | Reactividad en tiempo real (`useRealtimeProducts`) y bloqueo de agotados en `Ofertas.tsx` | F4 / S12 | Hecho | `CONV-UI-01`, `CONV-UI-02`, `CONV-TIP-01` |
| T127 | Controles interactivos en `MiniCarrito.tsx` y desacoplamiento de `mockup.css` en `Navbar` y `Footer` | F4 / S12 | Hecho | `CONV-UI-03`, `CONV-UI-04`, `CONV-GEN-02` |

Estados: `Pendiente` · `En curso` · `En revisión` · `Hecho`.

---

## 6. Próximo paso

> Rama activa de desarrollo: `feature/T122-reportes-reales-csv`.

- **Sprint 11 — Sincronización Real E2E de Stock & Dashboard Vivo (F4) — COMPLETADO:**
  1. **T119 Hecho**: Descuento transaccional de stock conectado en `service-order` (validación de stock disponible, actualización atómica en `products`, sincronización en `inventory_items` y registro de movimiento `VENTA_ONLINE` en `kardex_movements`). Soporte de `productId` en `Checkout.tsx` y `api.ts`, propagación de error `STOCK_INSUFICIENTE` y llamada de invalidación de caché Redis en `service-catalog`. 101 tests pasando en verde.
  2. **T120 Hecho**: Reactividad en tiempo real de stock (eventos `STOCK_UPDATED`, `STOCK_DECREMENTED`, `ORDER_PLACED` en `BroadcastChannel`), sondeo periódico inteligente cada 5s en `Productos.tsx` e `Inventario.tsx`, emisión bidireccional desde Checkout y reposición rápida en Admin, y bitácora de mejoras UI registrada en `docs/mejoras_flujo_ui.md`.
  3. **T121 Hecho**: Eliminación total de datos mock y constantes quemadas en `Dashboard.tsx`. Métricas 100% dinámicas: ingresos y órdenes reales de MySQL, gráfico semanal proyectado desde órdenes de los últimos 7 días, insumos críticos enlazados a stock `<=` 5 (con empty state amigable) y ranking de productos más vendidos computado desde transacciones reales.
  4. **T122 Hecho**: Eliminación de datos mock en `Reportes.tsx`, cálculo dinámico de ingresos, ticket promedio, cumplimiento y métodos de pago; gráfico de ventas semanales con montos reales; ranking de productos por unidades y recaudación; exportación de CSV para Excel con UTF-8 BOM y sincronización viva vía BroadcastChannel y sondeo.
- **Siguiente Paso — Sprint 13 / Deuda Crítica (`docs/mejoras_flujo_ui.md`):**
  1. **CORR-01**: Corrección de cálculo y renderizado en `BoletaModal.tsx` (desglose SII y formato visual).
  2. **CORR-02**: Carga dual de imágenes en `Categorias.tsx` (archivo local WebP + URL).
  3. **CORR-03**: Prototipado y rediseño de Punto de Venta POS en HTML limpio antes de migración React.
  4. **CORR-04**: Retiro definitivo del enlace "UI Kit & Modales" (`/componentes`) de la navegación en `AdminLayout.tsx`.
- **REQUISITO ESTRICTO DE ENTREGA (Protocolo Anti-Fricción de Defensa):** En el commit final de entrega para la presentación académica (F5), se debe ejecutar la purga completa de herramientas internas propias (`fida-kit/`, scripts de `tools/`, archivos de configuración de metadatos y comentarios `@pca:start`) para que el repositorio quede en estándar curricular puro (React/Spring Boot), protegiendo a los compañeros de preguntas sobre herramientas no oficiales.

---

## 7. Notas y decisiones

- **Deuda Crítica Registrada para Próximos Sprints (`docs/mejoras_flujo_ui.md`):**
  1. *Boleta Corrupta:* Auditoría de cálculo y renderizado en `BoletaModal.tsx`.
  2. *Carga de Fotos en Categorías:* Soporte dual de archivo local WebP + URL en `Categorias.tsx`.
  3. *Rediseño Estético POS:* Reestructuración preliminar en HTML limpio antes de volver a montar en React.
  4. *Retiro de UI Kit:* Eliminación del acceso de menú a `/componentes` en `AdminLayout.tsx` por ser vista exclusiva de desarrollo.
- **Protocolo de Protección de Defensa Grupal (Mandato Estricto):** Todo el andamiaje interno de gobernanza (FIDA / PCA) sirvió como acelerador de desarrollo riguroso. Sin embargo, para la presentación oral grupal ante el profesor, el repositorio público de entrega debe estar libre de estos artefactos para garantizar que cualquier miembro del equipo pueda defender el código con total seguridad basándose exclusivamente en el temario oficial de la asignatura.
- **Flujo Guiado de Catálogo (T117):** Inspirado en el patrón mobile de `catalog_home.html`, el catálogo opera en 2 fases: Fase 1 (Catalog Home: buscador rápido, tarjetas de especialidad con contador y botón "Ver todo") y Fase 2 (Exploración con filtros laterales y botón "Volver a todas las categorías").
- **Unificación de Navegación:** Retirado el ítem redundante "Categorías" del Navbar; ahora "Catálogo" es la única puerta de entrada y `/categorias` redirige a `/catalogo`.
- **Desacoplamiento de Filtros (`CatalogoFiltros.tsx`):** Extraído el drawer/sidebar para cumplir estrictamente la regla `@limit(lines: 300)` de `Catalogo.tsx`.
