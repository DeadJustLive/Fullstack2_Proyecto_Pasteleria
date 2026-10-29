# Sprint 7 — Cumplimiento DSY1104 (Anexo 1), Persistencia Total MySQL y Paso a Producción (VPS)

> **Fase:** F3 — Ejecución por tickets · **Sprint:** S7 · **Tickets:** T89–T100
> **Estado:** Listo para ejecución · **Última actualización:** 2026-10-28
> **Plan:** [`docs/plan_sprints.md`](../plan_sprints.md) · **Backlog:** [`docs/backlog_requisitos.md`](../backlog_requisitos.md) · **Plantilla:** [`docs/plantilla_ticket.md`](../plantilla_ticket.md)

---

## Propósito

Cerrar el 100% de las brechas entre el estado actual del proyecto, los requerimientos académicos del documento **"DSY1104 Evaluación Parcial 2 - Anexo 1 Instrucciones.pdf"** y el despliegue real en producción (Docker / VPS Linux) sin datos mockup en memoria:

1. **Reglas de Negocio Transversales (Chile / DSY1104):** Validación de RUN/RUT con algoritmo Módulo 11, selectores anidados Región → Comuna de Chile, validación de dominios de correo y separación estricta entre lógica de negocio y presentación (`CONV-EST-01`, `CONV-UI-01`).
2. **Protocolo de 4 Micro-Fases para Vistas:** Toda vista nueva o incompleta pasa primero por **1) Maquetado HTML5 + CSS básico** en `MockUpPasteleria/validacion/`, **2) Reglas de negocio y contratos desacoplados**, **3) Componente React presentacional** y **4) Conexión a MySQL 8**.
3. **Persistencia Total en MySQL 8 (`cremeco_db`) + `DataSeeder` + OpenAPI 3:** Migrar los microservicios (`service-identity`, `service-catalog`, `service-order`, `service-inventory`, `service-payment-flow`, `service-notification`) de listas en memoria a entidades JPA reales con poblado automático inicial (`DataSeeder`) y Swagger UI (`/swagger-ui.html`).
4. **Flujo Completo de Compra y Escenarios Flow.cl Sandbox:** Creación previa de orden en BD, pasarela Flow con botonera de autocompletado de tarjetas de prueba (Aprobada, Rechazada/Sin Cupo, Error Bancario) y vistas de Pago Correcto / Pago con Error con resumen íntegro de la compra.
5. **Seguridad JWT + Guardián RBAC en `admin-pwa` y Preparación para VPS Linux:** Protección de rutas administrativas por rol, inyección de JWT y parametrización total por variables de entorno (`.env` y `docker-compose.prod.yml`) sin `localhost` ni `.bat` hardcodeados.

---

## Índice de tickets y Orden de Ejecución

| Orden | ID | Título | Capa Principal | Prioridad | Depende de | Estado |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| **1°** | [T89](#ticket-t89--reglas-de-negocio-transversales-rut-módulo-11-región-comuna-y-validadores) | Reglas de negocio transversales: RUT Módulo 11, Región→Comuna y validadores puros | `frontend/` + `admin-pwa/` | Alta | — | Pendiente |
| **2°** | [T90](#ticket-t90--persistencia-jpa-mysql-cremeco_db-dataseeder-automático-y-openapi-en-microservicios) | Persistencia JPA MySQL (`cremeco_db`), `DataSeeder` automático y OpenAPI en los 6 microservicios | `backend/` | Alta | — | Pendiente |
| **3°** | [T91](#ticket-t91--vistas-públicas-de-autenticación-login-y-registro- + -guardián-rbac-en-admin-pwa) | Vistas públicas `/login` y `/registro` + Guardián RBAC y JWT en `admin-pwa` | `MockUp` → `frontend/` + `admin-pwa/` | Alta | T89, T90 | Pendiente |
| **4°** | [T92](#ticket-t92--vistas-informativas-públicas-nosotros-y-contacto-conectado-a-bd) | Vistas informativas públicas: `/nosotros` y `/contacto` conectado a BD | `MockUp` → `frontend/` + `backend/` | Alta | T89, T90 | Pendiente |
| **5°** | [T93](#ticket-t93--vistas-públicas-de-categorías-ofertas-y-blogs-desde-mysql) | Vistas públicas de `/categorias`, `/categorias/:slug`, `/ofertas` y Blogs desde MySQL | `MockUp` → `frontend/` + `service-catalog` | Alta | T90 | Pendiente |
| **6°** | [T94](#ticket-t94--checkout-completo-dsy1104-escenarios-de-tarjetas-flow-sandbox-y-vistas-éxitoerror) | Checkout completo DSY1104, escenarios de tarjetas Flow Sandbox y vistas Éxito/Error con resumen | `MockUp` → `frontend/` + `service-order` + `service-payment-flow` | Alta | T89, T90 | Pendiente |
| **7°** | [T95](#ticket-t95--perfil-de-cliente-seguimiento-real-y-cotizaciones-de-personalización-en-bd) | Perfil de cliente, seguimiento real `#CC-XXXX` y cotizaciones de personalización en BD | `frontend/` + `service-identity` + `service-order` | Alta | T90, T94 | Pendiente |
| **8°** | [T96](#ticket-t96--módulo-admin-órdenes-y-vista-mostrar-boleta) | Módulo Admin: Órdenes y vista imprimible Mostrar Boleta (`/ordenes`) | `MockUp` → `admin-pwa/` + `service-order` | Alta | T90, T91 | Pendiente |
| **9°** | [T97](#ticket-t97--módulo-admin-productos-completo-mostrar-editar-críticos-y-reportes) | Módulo Admin: Productos completo (Mostrar, Editar, Listado Críticos y Reportes) | `MockUp` → `admin-pwa/` + `service-catalog` | Alta | T90, T91 | Pendiente |
| **10°** | [T98](#ticket-t98--módulo-admin-crud-de-categorías-y-promociones-en-mysql) | Módulo Admin: CRUD de Categorías (`/categorias`) y Promociones en MySQL | `MockUp` → `admin-pwa/` + `service-catalog` | Media | T90, T93 | Pendiente |
| **11°** | [T99](#ticket-t99--módulo-admin-usuarios-completo-nuevo-mostrar-editar-e-historial-de-compras) | Módulo Admin: Usuarios completo (Nuevo, Mostrar, Editar e Historial de Compras) | `MockUp` → `admin-pwa/` + `service-identity` + `service-order` | Alta | T89, T90, T96 | Pendiente |
| **12°** | [T100](#ticket-t100--módulos-admin-reportes-perfil-admin-inventariopos-real-y-despliegue-vps-docker) | Módulos Admin: `/reportes`, `/perfil`, Inventario/POS real y configuración VPS Docker | `MockUp` → `admin-pwa/` + `backend/` + `docker` | Alta | T96, T97, T99 | Pendiente |

---

## Detalle de Tickets

### Ticket T89 — Reglas de negocio transversales: RUT Módulo 11, Región→Comuna y validadores puros

#### Metadatos
- **Tipo:** `feat`
- **Fase / Sprint:** F3 · Sprint 7 (Orden 1°)
- **Rama sugerida:** `feature/T89-reglas-negocio-validadores`
- **Prioridad:** Alta

#### Contexto
Antes de maquetar y construir las vistas de Login, Registro, Checkout, Contacto y Administración de Usuarios/Productos, necesitamos una capa de **funciones puras de negocio** (100% desacoplada de React y del DOM) que implemente las validaciones exigidas por DSY1104 en Chile: algoritmo Módulo 11 para RUN/RUT, catálogo oficial anidado de Regiones y Comunas de Chile, validación de correos y reglas de montos/stock.

#### Convenciones aplicables
- `CONV-EST-01` (Separación por capas)
- `CONV-TIP-01` (Sin `any`)
- `CONV-TIP-03` (Funciones puras)
- `CONV-ERR-02` y `CONV-ERR-03` (Validación temprana de entradas)

#### Alcance (Qué SÍ / Qué NO)
- **SÍ:**
  - Validador y formateador de RUN/RUT chileno (`validarRut`, `formatearRut`) con cálculo de dígito verificador Módulo 11 (`0-9` y `K`).
  - Mapa tipado de `REGIONES_Y_COMUNAS_CHILE` y helper `obtenerComunasPorRegion(regionCodigo)`.
  - Validadores puros para formularios de Autenticación, Checkout (nombre, apellidos, correo, calle, depto, región, comuna, indicaciones), Contacto y Productos/Usuarios Admin.
  - Pruebas unitarias rápidas de los validadores.
- **NO:** Modificar aún componentes visuales `.tsx` (eso ocurre en T91–T99).

#### Criterios de aceptación
- [ ] `validarRut("11.111.111-1")` retorna `true` y `validarRut("11.111.111-2")` retorna `false`.
- [ ] `obtenerComunasPorRegion("RM")` devuelve la lista de comunas de la Región Metropolitana; cambia dinámicamente para todas las regiones de Chile.
- [ ] Todos los validadores retornan un objeto tipado `{ valido: boolean; errores: Record<string, string> }` sin depender de React.

#### Archivos afectados (previstos)
| Archivo | `@kind` | `@limit` |
| :--- | :--- | :--- |
| `frontend/src/lib/validators/rut.validator.ts` | util | 90 |
| `frontend/src/lib/data/regiones-chile.ts` | util | 180 |
| `frontend/src/lib/validators/checkout.validator.ts` | util | 120 |
| `frontend/src/lib/validators/auth.validator.ts` | util | 100 |
| `admin-pwa/src/lib/validators.ts` | util | 140 |

#### Casos límite (Edge Cases)
- RUT ingresado sin puntos ni guion (`123456785`), con `k` minúscula o con todos los dígitos iguales (`11111111-1` vs secuencias inválidas vacías).
- Región seleccionada que cambia después de haber elegido una comuna: el validador debe exigir que la comuna pertenezca a la región actual.

#### Definition of Done
- [ ] Criterios de aceptación cumplidos y tipado estricto verificado (`tsc --noEmit`).
- [ ] Convenciones y límites de líneas respetados.
- [ ] `docs/estado_proyecto.md` actualizado.

---

### Ticket T90 — Persistencia JPA MySQL (`cremeco_db`), `DataSeeder` automático y OpenAPI en los 6 microservicios

#### Metadatos
- **Tipo:** `feat`
- **Fase / Sprint:** F3 · Sprint 7 (Orden 2°)
- **Rama sugerida:** `feature/T90-mysql-jpa-dataseeder`
- **Prioridad:** Alta

#### Contexto
Actualmente solo `service-payment-flow` persiste en MySQL (`cremeco_db`), mientras que `service-identity`, `service-catalog`, `service-order`, `service-inventory` y `service-notification` usan `ArrayList` en memoria. Para que tanto el desarrollo local en Docker como la futura subida a VPS funcionen con datos reales desde el primer arranque sin inserción manual, todos los microservicios deben usar JPA + MySQL 8 y contar con un `DataSeeder` idempotente (que solo inserta datos de demostración si la tabla está vacía) y documentación Swagger/OpenAPI.

#### Convenciones aplicables
- `CONV-NAM-05` (Tablas plural `snake_case`, columnas `snake_case`)
- `CONV-EST-01` (Controller → Service → Repository → Entity)
- `CONV-SEG-01` (Variables de entorno con fallback local para Docker/VPS)

#### Alcance (Qué SÍ / Qué NO)
- **SÍ:**
  - Añadir `spring-boot-starter-data-jpa`, `mysql-connector-j`, `spring-security-crypto` (`BCryptPasswordEncoder`) y `springdoc-openapi-starter-webmvc-ui` en el `backend/pom.xml` y subtareas.
  - Configurar `application.yml` de todos los servicios con variables `${SPRING_DATASOURCE_URL:...}`, `${SPRING_DATASOURCE_USERNAME:...}`, `${SPRING_DATASOURCE_PASSWORD:...}`.
  - **`service-identity` (:8081):** Entidades `UserEntity` (`users` con nombre, apellidos, rut, email, password_hash, telefono, calle, departamento, region, comuna, rol, estado, created_at) y `RoleEntity`. Endpoints CRUD de usuarios, perfil (`GET/PUT /api/identity/profile`) y login/registro con BCrypt y token JWT firmado.
  - **`service-catalog` (:8082):** Entidades `CategoryEntity` (`categories`), `ProductEntity` (`products` con soporte de precio oferta/descuento y stock crítico), `PromotionEntity` (`promotions`) y `BlogPostEntity` (`blog_posts`).
  - **`service-order` (:8083):** Entidades `OrderEntity` (`orders` con todos los campos DSY1104: nombre, apellidos, email, telefono, calle, departamento, region, comuna, indicaciones, metodo_pago, subtotal, descuento, envio, total, estado, datos de recogedor), `OrderItemEntity` (`order_items`) y `CustomQuoteEntity` (`custom_quotes`). Consumidor Kafka `@KafkaListener` para actualizar a `PAGADO` cuando Flow confirma el cobro.
  - **`service-inventory` (:8085):** Entidades `InventoryItemEntity` (`inventory_items`) y `KardexMovementEntity` (`kardex_movements`). Descuento real de stock en ventas POS y órdenes web.
  - **`service-notification` (:8086):** Entidad `ContactMessageEntity` (`contact_messages`) para guardar los mensajes del formulario `/contacto` y logs de notificaciones de compra.
  - **`DataSeeder` automático en cada servicio:** Si `repository.count() == 0`, poblar automáticamente usuarios de todos los roles, las 5 categorías, los 12 productos (incluyendo productos en oferta, productos con stock crítico y un borrador con 0 ventas), artículos de blog, cupones, insumos, movimientos Kardex y órdenes históricas con boletas.
- **NO:** Cambiar estilos del frontend en este ticket.

#### Criterios de aceptación
- [ ] Al levantar MySQL y los microservicios, se crean todas las tablas en `cremeco_db` y se pueblan solas si están vacías.
- [ ] Al reiniciar cualquier microservicio, los productos, usuarios, órdenes y movimientos creados persisten en MySQL.
- [ ] Swagger UI responde en cada microservicio (`/swagger-ui.html`).

---

### Ticket T91 — Vistas públicas de Autenticación (`/login` y `/registro`) + Guardián RBAC en `admin-pwa`

#### Metadatos
- **Tipo:** `feat`
- **Fase / Sprint:** F3 · Sprint 7 (Orden 3°)
- **Rama sugerida:** `feature/T91-auth-vistas-rbac`
- **Prioridad:** Alta

#### Contexto
Cumplir con las vistas de **Iniciar Sesión** y **Registro de Usuario** del diagrama público de DSY1104 y asegurar que el panel administrativo (`admin-pwa`) tenga control de acceso real por rol y envío de JWT.

#### Ejecución en 4 Micro-Fases
1. **Maquetado HTML/CSS:** Crear `MockUpPasteleria/validacion/auth-cliente.html` y `MockUpPasteleria/validacion/css/auth-cliente.css` con el diseño de las páginas `/login` y `/registro` (incluyendo RUN, nombre, apellidos, correo, teléfono, región/comuna y contraseña) y revisar el maquetado de login admin en `MockUpPasteleria/validacion/admin/auth.html`.
2. **Reglas de Negocio:** Conectar `auth.validator.ts` y `rut.validator.ts` (de T89) y agregar en `admin-pwa/src/services/api.ts` la inyección automática de `Authorization: Bearer <token>` y verificación de rol (`ADMIN`, `PASTELERO`, `VENDEDOR`).
3. **Componentes React:** Crear `frontend/src/pages/cliente/Login.tsx`, `frontend/src/pages/cliente/Registro.tsx` y `admin-pwa/src/pages/LoginAdmin.tsx` (guardián de sesión en `AdminLayout.tsx` + botón de cierre de sesión y nombre real del usuario logueado).
4. **Conexión BD:** Autenticación y registro reales contra `service-identity` (:8081) sobre la tabla `users` en MySQL.

#### Criterios de aceptación
- [ ] `/login` y `/registro` ya no muestran `Placeholder.tsx` sino páginas completas validadas con RUT Módulo 11 y Región→Comuna.
- [ ] Si un usuario con rol `ADMIN` inicia sesión, ve un botón directo al Dashboard Administrativo.
- [ ] `admin-pwa` exige sesión activa con rol administrativo y muestra el nombre y rol real del usuario desde la BD.

---

### Ticket T92 — Vistas informativas públicas: `/nosotros` y `/contacto` conectado a BD

#### Metadatos
- **Tipo:** `feat`
- **Fase / Sprint:** F3 · Sprint 7 (Orden 4°)
- **Rama sugerida:** `feature/T92-nosotros-contacto`
- **Prioridad:** Alta

#### Contexto
El Anexo 1 de DSY1104 exige vistas públicas dedicadas para **Nosotros** y **Contacto**.

#### Ejecución en 4 Micro-Fases
1. **Maquetado HTML/CSS:** Crear `MockUpPasteleria/validacion/nosotros.html`, `MockUpPasteleria/validacion/contacto.html` y `MockUpPasteleria/validacion/css/informativas.css`.
2. **Reglas de Negocio:** Crear `frontend/src/hooks/useContactForm.ts` con validación de nombre, correo, teléfono, asunto y mensaje (mínimo 10 caracteres, máximo 500) y envío a `POST /api/notifications/contact`.
3. **Componentes React:** Crear `frontend/src/pages/cliente/Nosotros.tsx` y `frontend/src/pages/cliente/Contacto.tsx`, registrando las rutas `/nosotros` y `/contacto` en `App.tsx`, `Navbar.tsx` y `Footer.tsx`.
4. **Conexión BD:** Persistir los mensajes de contacto en la tabla `contact_messages` de MySQL y devolver comprobante con folio.

---

### Ticket T93 — Vistas públicas de `/categorias`, `/categorias/:slug`, `/ofertas` y Blogs desde MySQL

#### Metadatos
- **Tipo:** `feat`
- **Fase / Sprint:** F3 · Sprint 7 (Orden 5°)
- **Rama sugerida:** `feature/T93-categorias-ofertas-blogs-db`
- **Prioridad:** Alta

#### Contexto
El Anexo 1 de DSY1104 exige:
- Una vista principal de **Categorías** que derive a las diferentes **Categorías específicas**.
- Una vista de **Ofertas**.
- Que **Blogs** y **Detalle Blog** se alimenten desde la base de datos sin depender de archivos estáticos.

#### Ejecución en 4 Micro-Fases
1. **Maquetado HTML/CSS:** Crear `MockUpPasteleria/validacion/categorias.html` y `MockUpPasteleria/validacion/ofertas.html` con tarjetas de categorías, vista filtrada por categoría y grilla de ofertas con precios anteriores tachados y cupones copiables.
2. **Reglas de Negocio:** Crear `frontend/src/hooks/useCategoriesAndOffers.ts` y `frontend/src/hooks/useBlogPosts.ts` desacoplando el filtrado, cálculo de porcentaje de ahorro y consumo de `/api/catalog/categories`, `/api/catalog/products` y `/api/catalog/blogs`.
3. **Componentes React:** Crear `frontend/src/pages/cliente/Categorias.tsx`, `frontend/src/pages/cliente/Ofertas.tsx` y conectar `Blog.tsx`, `BlogDetalle.tsx` y `BlogRecientes.tsx` al hook de BD.
4. **Conexión BD:** Consumo 100% desde las tablas `categories`, `products`, `promotions` y `blog_posts` en MySQL.

---

### Ticket T94 — Checkout completo DSY1104, escenarios de tarjetas Flow Sandbox y vistas Éxito/Error

#### Metadatos
- **Tipo:** `feat`
- **Fase / Sprint:** F3 · Sprint 7 (Orden 6°)
- **Rama sugerida:** `feature/T94-checkout-flow-escenarios`
- **Prioridad:** Alta

#### Contexto
Alinear al 100% el apartado **2. Proceso de Compra (Checkout)** del Anexo 1 DSY1104 y conectar la pasarela Flow Sandbox con tarjetas de prueba autocompletables para demostrar escenarios reales.

#### Ejecución en 4 Micro-Fases
1. **Maquetado HTML/CSS:** Crear `MockUpPasteleria/validacion/checkout-completo.html` con:
   - Formulario Checkout con **Nombre**, **Apellidos**, **Correo**, **Teléfono**, **Calle**, **Departamento (opcional)**, selector **Región**, selector dependiente **Comuna** e **Indicaciones de entrega (opcional)**.
   - Pasarela Flow con selector rápido de **3 Escenarios de Tarjetas de Prueba** (🟢 *Tarjeta Aprobada*, 🔴 *Tarjeta Rechazada / Sin Fondos*, 🟡 *Fallo / Expiración de Sesión*).
   - Vista de **Pago Correcto** y **Vista de Pago con Error** mostrando ambas el código de orden, datos del comprador, dirección de envío, detalle de productos y total.
2. **Reglas de Negocio:** Crear `frontend/src/hooks/useCheckoutProcess.ts`:
   - Primero guarda la orden en MySQL (`POST /api/orders`) con estado `PENDIENTE_PAGO`.
   - Luego inicia el pago en Flow (`POST /api/payments/flow/create`) con el `orderId` real.
   - **No vacía el carrito** hasta confirmar que el pago fue aprobado; si el pago falla, conserva los productos y permite reintentar el pago sobre la misma orden desde `/pago/error`.
3. **Componentes React:** Actualizar `Checkout.tsx`, `FlowGateway.tsx`, `Exito.tsx`, `Confirmacion.tsx` y `Error.tsx`.
4. **Conexión BD:** Actualizar `FlowPaymentService` y `OrderController` para que la confirmación del pago actualice `flow_payments` (`completed` o `failed`) y `orders` (`PAGADO` o `PAGO_FALLIDO`) en MySQL, descontando el stock real en `service-inventory`.

---

### Ticket T95 — Perfil de cliente, seguimiento real `#CC-XXXX` y cotizaciones de personalización en BD

#### Metadatos
- **Tipo:** `feat`
- **Fase / Sprint:** F3 · Sprint 7 (Orden 7°)
- **Rama sugerida:** `feature/T95-perfil-seguimiento-cotizaciones-db`
- **Prioridad:** Alta

#### Contexto
Eliminar todos los datos hardcodeados de `Perfil.tsx` (`"María González"`), `PerfilSeguimiento.tsx` (`"#CC-2025-001234"`) y `Personalizacion.tsx`.

#### Ejecución
- Conectar `Perfil.tsx` a `GET/PUT /api/identity/profile` y `GET /api/orders/my-orders`.
- Conectar `PerfilSeguimiento.tsx` a `GET /api/orders/tracking/{code}` y `PUT /api/orders/{id}/pickup` (cambio de persona que retira validado con RUT Módulo 11).
- Conectar `Personalizacion.tsx` a `POST /api/orders/quotes` guardando la cotización en la tabla `custom_quotes` de MySQL.

---

### Ticket T96 — Módulo Admin: Órdenes y vista imprimible Mostrar Boleta (`/ordenes`)

#### Metadatos
- **Tipo:** `feat`
- **Fase / Sprint:** F3 · Sprint 7 (Orden 8°)
- **Rama sugerida:** `feature/T96-admin-ordenes-boleta`
- **Prioridad:** Alta

#### Contexto
El Anexo 1 exige en el sistema administrativo la sección **Órdenes: Vista de las boletas con la capacidad de Mostrar Boleta**.

#### Ejecución en 4 Micro-Fases
1. **Maquetado HTML/CSS:** Crear `MockUpPasteleria/validacion/admin/ordenes-boleta.html` con el listado de órdenes/boletas, filtros por estado y el modal/vista de **Mostrar Boleta** (formato de boleta electrónica con RUT, datos del comprador, dirección de entrega, tabla de ítems, neto, IVA 19%, envío y total).
2. **Reglas de Negocio:** Crear `admin-pwa/src/hooks/useOrdersAdmin.ts` con cálculo de desglose de IVA, filtro por código/cliente/estado y actualización de estado (`PUT /api/orders/{id}/status`).
3. **Componente React:** Crear `admin-pwa/src/pages/Ordenes.tsx` y registrarlo en `admin-pwa/src/App.tsx` y `AdminLayout.tsx`.
4. **Conexión BD:** Lectura y actualización en vivo sobre la tabla `orders` y `order_items` en MySQL.

---

### Ticket T97 — Módulo Admin: Productos completo (Mostrar, Editar, Listado Críticos y Reportes)

#### Metadatos
- **Tipo:** `feat`
- **Fase / Sprint:** F3 · Sprint 7 (Orden 9°)
- **Rama sugerida:** `feature/T97-admin-productos-completo`
- **Prioridad:** Alta

#### Contexto
Completar en `admin-pwa/src/pages/Productos.tsx` todas las capacidades pedidas por el Anexo 1: **Nuevo Producto**, **Mostrar Producto**, **Editar Producto**, **Listado de Productos Críticos** y **Reportes**, conectadas 100% a MySQL.

#### Ejecución en 4 Micro-Fases
1. **Maquetado HTML/CSS:** Actualizar `MockUpPasteleria/validacion/admin/productos.html` agregando el filtro/pestaña de *Productos Críticos*, el modal *Mostrar Producto*, el modal *Editar Producto* y la vista/exportación de *Reporte de Productos*.
2. **Reglas de Negocio:** Crear `admin-pwa/src/hooks/useProductsAdmin.ts` conectado a `adminApi.products` (`GET`, `POST`, `PUT`, `DELETE`) manteniendo la sincronización `BroadcastChannel` con la tienda web y la regla de no eliminar productos con ventas históricas.
3. **Componente React:** Refactorizar `admin-pwa/src/pages/Productos.tsx` eliminando `PRODUCTOS_INICIALES` estático.
4. **Conexión BD:** CRUD real contra la tabla `products` en MySQL (`service-catalog`).

---

### Ticket T98 — Módulo Admin: CRUD de Categorías (`/categorias`) y Promociones en MySQL

#### Metadatos
- **Tipo:** `feat`
- **Fase / Sprint:** F3 · Sprint 7 (Orden 10°)
- **Rama sugerida:** `feature/T98-admin-categorias-promociones`
- **Prioridad:** Media

#### Contexto
El Anexo 1 exige en el panel administrativo la sección **Categorías: Opciones para crear una Nueva Categoría y editarlas**, además de persistir los cupones de `Promociones.tsx` en MySQL.

#### Ejecución en 4 Micro-Fases
1. **Maquetado HTML/CSS:** Crear `MockUpPasteleria/validacion/admin/categorias.html` con listado de categorías, formulario de **Nueva Categoría** y modal de **Editar Categoría**.
2. **Reglas de Negocio:** Crear `admin-pwa/src/hooks/useCategoriesAdmin.ts` (generación de slug, validación y conteo de productos por categoría).
3. **Componente React:** Crear `admin-pwa/src/pages/Categorias.tsx`, agregarlo al sidebar de `AdminLayout.tsx` y conectar `Promociones.tsx` a `adminApi.promotions`.
4. **Conexión BD:** CRUD real sobre las tablas `categories` y `promotions` en MySQL.

---

### Ticket T99 — Módulo Admin: Usuarios completo (Nuevo, Mostrar, Editar e Historial de Compras)

#### Metadatos
- **Tipo:** `feat`
- **Fase / Sprint:** F3 · Sprint 7 (Orden 11°)
- **Rama sugerida:** `feature/T99-admin-usuarios-historial`
- **Prioridad:** Alta

#### Contexto
El Anexo 1 exige en **Usuarios**: vistas para agregar un **Nuevo Usuario**, **Mostrar Usuario**, **Editar Usuario** y revisar su **Historial de Compras**.

#### Ejecución en 4 Micro-Fases
1. **Maquetado HTML/CSS:** Actualizar `MockUpPasteleria/validacion/admin/usuarios.html` con los modales/vistas de *Nuevo Usuario* (con RUN, Región y Comuna), *Editar Usuario*, *Mostrar Ficha de Usuario* y la tabla de *Historial de Compras del Usuario* con acceso a cada boleta.
2. **Reglas de Negocio:** Crear `admin-pwa/src/hooks/useUsersAdmin.ts` con validación de RUN Módulo 11, Región→Comuna y consulta cruzada de órdenes por cliente (`GET /api/orders?email=...`).
3. **Componente React:** Refactorizar `admin-pwa/src/pages/Usuarios.tsx` eliminando `USUARIOS_INICIALES` estático.
4. **Conexión BD:** CRUD completo en `service-identity` (`users`) y lectura de compras reales desde `service-order` (`orders`).

---

### Ticket T100 — Módulos Admin: `/reportes`, `/perfil`, Inventario/POS real y configuración VPS Docker

#### Metadatos
- **Tipo:** `feat`
- **Fase / Sprint:** F3 · Sprint 7 (Orden 12°)
- **Rama sugerida:** `feature/T100-reportes-perfil-vps`
- **Prioridad:** Alta

#### Contexto
Cumplir con el último punto del Anexo 1 (**Reportes y Perfil: Secciones independientes para métricas generales y la gestión de la cuenta del administrador**), conectar `Dashboard.tsx`, `Inventario.tsx` y `Pos.tsx` a MySQL, y dejar lista la configuración de producción para VPS Linux sin `localhost` hardcodeado.

#### Ejecución en 4 Micro-Fases
1. **Maquetado HTML/CSS:** Revisar `MockUpPasteleria/validacion/admin/reportes.html` y crear `MockUpPasteleria/validacion/admin/perfil.html`.
2. **Reglas de Negocio:** Crear hooks para métricas reales en `Dashboard.tsx` y `Reportes.tsx` (calculadas desde órdenes, productos e inventario reales), edición de cuenta en `PerfilAdmin.tsx`, y registro real de ventas POS y mermas en `Pos.tsx` e `Inventario.tsx`.
3. **Componentes React:** Crear `admin-pwa/src/pages/Reportes.tsx` y `admin-pwa/src/pages/PerfilAdmin.tsx`; conectar `Dashboard.tsx`, `Inventario.tsx` y `Pos.tsx`.
4. **Configuración VPS / Producción:**
   - Reemplazar toda referencia fija a `http://localhost:5173` / `http://localhost:808X` por variables de entorno (`VITE_API_URL`, `VITE_STORE_URL`, `FLOW_URL_RETURN`, `FLOW_URL_CONFIRMATION`).
   - Crear `.env.example`, script `iniciar_backend.sh` para Linux y `docker-compose.prod.yml` listo para desplegar en VPS.
