<!-- @pca:start
@id(docs.elementos_pendientes_conexion_backend)
@kind(doc)
@limit(lines: 400)
@relates(docs.estado_proyecto)
@relates(docs.especificacion_microservicios)
@relates(docs.plantilla_ticket)
@desc(Auditoría y levantamiento de elementos frontend pendientes de conexión con el backend para generación de tickets)
@pca:end -->

# Auditoría Técnica de Frontend: Elementos Pendientes de Integración con Backend

Este documento detalla los componentes, vistas y módulos del [`frontend`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend) que actualmente funcionan con mocks, datos estáticos locales o lógica simulada, y que deben conectarse a los microservicios Spring Boot (`:8080`) para lograr funcionalidad 100% real de extremo a extremo.

---

## 1. Resumen Ejecutivo de la Brecha Técnica

| Capa / Dominio | Estado Actual en Frontend | Microservicio Backend | Nivel de Dependencia |
| :--- | :--- | :--- | :--- |
| **Autenticación y Sesión** | Mock en `localStorage` (sin token, sin password, sin validación) | `service-identity` (:8081) | **Crítico (Bloqueante)** |
| **Catálogo y Productos** | Estático en `products.ts`, sólo sincroniza disponibilidad booleana | `service-catalog` (:8082) | **Alto** |
| **Detalle de Producto** | Búsqueda síncrona en array estático, sin fetch por ID | `service-catalog` (:8082) | **Alto** |
| **Carrito y Promociones** | Descuentos fijos hardcodeados en cliente (`CUPONES`) | `service-catalog` (:8082) | **Medio** |
| **Checkout y Pedidos** | Payload parcial; fallback offline automático sin manejo de errores | `service-order` (:8083) | **Crítico** |
| **Pasarela Flow / Pagos** | Fallback a vista simulada interna y query params sin verificar status | `service-payment-flow` (:8084) | **Crítico** |
| **Perfil y Direcciones** | Datos y direcciones en `useState` volátil; pedidos hardcodeados | `service-identity` + `service-order` | **Alto** |
| **Seguimiento (Tracking)** | Datos quemados (#CC-2025-001234), no lee `:id` de ruta ni API | `service-order` (:8083) | **Alto** |
| **Personalización de Tortas** | Formulario no envía cotización ni genera pedido/evento | `service-order` / `service-notification` | **Medio** |
| **Punto de Venta POS** | Venta simulada en modal, no registra en Kardex ni descuenta stock | `service-inventory` (:8085) | **Alto** |
| **Cliente HTTP (`api.ts`)** | Faltan cabeceras `Authorization: Bearer <token>` y métodos CRUD | `api-gateway` (:8080) | **Crítico (Transversal)** |

---

## 2. Diagnóstico Detallado Módulo por Módulo

### 2.1. Autenticación, Sesión y Control de Acceso
- **Archivos:**
  - [`frontend/src/context/AuthProvider.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/context/AuthProvider.tsx)
  - [`frontend/src/context/auth.ts`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/context/auth.ts)
  - [`frontend/src/components/domain/ModalLogin.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/components/domain/ModalLogin.tsx)
  - [`frontend/src/components/domain/ModalRegistro.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/components/domain/ModalRegistro.tsx)
  - [`frontend/src/App.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/App.tsx#L40-L41)
- **Estado Actual:**
  - En [`AuthProvider.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/context/AuthProvider.tsx#L23-L26), el método `login` sólo extrae el nombre antes del `@` (`email.split("@")[0]`), no recibe contraseña, no invoca a la API y no almacena ningún token JWT.
  - [`ModalLogin.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/components/domain/ModalLogin.tsx#L30-L35) descarta el password en el submit y no maneja estados de carga (`isLoading`) ni errores de credenciales (HTTP 401).
  - [`ModalRegistro.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/components/domain/ModalRegistro.tsx#L20-L27) no envía datos a [`api.auth.register`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/services/api.ts#L74-L78).
  - Las rutas directas `/login` y `/registro` en [`App.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/App.tsx#L40-L41) renderizan `<Placeholder />`.
- **Endpoints Backend a Integrar:**
  - `POST /api/identity/auth/login` (recibe `{ email, password }`, retorna `{ token, usuario: { id, nombre, email, rol, estado } }`).
  - `POST /api/identity/auth/register` (recibe `{ nombre, email, password, telefono }`).
- **Qué falta para volverlo funcional:**
  1. Guardar y renovar el token JWT en almacenamiento persistente (`localStorage`).
  2. Inyectar automáticamente el header `Authorization: Bearer <token>` en todas las peticiones protegidas.
  3. Manejo de feedback de error (usuario/clave incorrectos, correo duplicado).
  4. Soporte para roles (`CLIENTE`, `ADMIN`, `PASTELERO`, `VENDEDOR`) en el contexto.

---

### 2.2. Catálogo Dinámico y Detalle de Producto
- **Archivos:**
  - [`frontend/src/pages/cliente/Catalogo.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/pages/cliente/Catalogo.tsx)
  - [`frontend/src/pages/cliente/ProductoDetalle.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/pages/cliente/ProductoDetalle.tsx)
  - [`frontend/src/hooks/useRealtimeProducts.ts`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/hooks/useRealtimeProducts.ts)
- **Estado Actual:**
  - [`useRealtimeProducts.ts`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/hooks/useRealtimeProducts.ts#L33-L49) inicializa la lista desde un archivo estático en disco (`@/data/products.ts`) y sólo sobreescribe la propiedad `disponible`. Nuevos productos creados en backend o modificaciones de precios/nombres no se reflejan.
  - [`ProductoDetalle.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/pages/cliente/ProductoDetalle.tsx#L22) busca únicamente en el array estático local con `find(p => p.id === Number(id))`. Si el usuario accede a una URL directa de un producto no hardcodeado, muestra "Producto no encontrado".
- **Endpoints Backend a Integrar:**
  - `GET /api/catalog/products` (listado completo de productos desde BD).
  - `GET /api/catalog/products/{id}` (detalle individual con stock y especificaciones).
- **Qué falta para volverlo funcional:**
  1. Cargar el catálogo completo desde `service-catalog` con estado de carga (`Skeleton`) y fallback de error.
  2. Implementar consulta por ID en [`ProductoDetalle.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/pages/cliente/ProductoDetalle.tsx) ante recarga directa de página.
  3. Sincronización en tiempo real del stock y disponibilidad.

---

### 2.3. Carrito y Validación de Cupones / Stock
- **Archivos:**
  - [`frontend/src/context/CartProvider.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/context/CartProvider.tsx)
  - [`frontend/src/context/cart.ts`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/context/cart.ts)
  - [`frontend/src/pages/cliente/Carrito.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/pages/cliente/Carrito.tsx)
- **Estado Actual:**
  - Los cupones están quemados en el cliente ([`cart.ts#L27-L30`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/context/cart.ts#L27-L30): `CREME10`, `DULCE15`). No valida contra las promociones activas registradas en `service-catalog` (`DULCE10`, `CREME20`, `BIENVENIDA`).
  - No valida el límite de stock antes de agregar o incrementar cantidades en el carrito.
- **Endpoints Backend a Integrar:**
  - `GET /api/catalog/promotions` (consulta y validación de cupones).
  - Verificación de stock contra `service-inventory` o `service-catalog`.
- **Qué falta para volverlo funcional:**
  1. Reemplazar la validación síncrona en memoria por consulta asíncrona al microservicio de promociones.
  2. Limitar el incremento de cantidad al stock disponible del producto.

---

### 2.4. Checkout, Órdenes y Pasarela Flow.cl
- **Archivos:**
  - [`frontend/src/pages/cliente/Checkout.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/pages/cliente/Checkout.tsx)
  - [`frontend/src/pages/cliente/pago/FlowGateway.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/pages/cliente/pago/FlowGateway.tsx)
  - [`frontend/src/pages/cliente/Confirmacion.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/pages/cliente/Confirmacion.tsx)
  - [`frontend/src/pages/cliente/pago/Exito.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/pages/cliente/pago/Exito.tsx)
- **Estado Actual:**
  - En [`Checkout.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/pages/cliente/Checkout.tsx#L53-L67), ante cualquier fallo o timeout en la creación de pago Flow, redirige silenciosamente a una pasarela mockeada localmente ([`FlowGateway.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/pages/cliente/pago/FlowGateway.tsx)) que resuelve mediante un `setTimeout` hacia `/pago/exito`.
  - El registro de la orden en [`api.orders.create`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/pages/cliente/Checkout.tsx#L82-L94) ignora campos clave de entrega: `direccion`, `comuna`, `telefono`, `metodoPago` y `costoEnvio`.
  - En [`Confirmacion.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/pages/cliente/Confirmacion.tsx) y [`Exito.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/pages/cliente/pago/Exito.tsx), los datos mostrados son leídos exclusivamente de los query parameters de la URL, sin validar con el backend si la orden o la transacción de pago se completaron con éxito.
- **Endpoints Backend a Integrar:**
  - `POST /api/orders` (creación de orden con modelo completo).
  - `POST /api/payments/flow/create` (creación de sesión en pasarela Flow con idempotencia).
  - `GET /api/payments/flow/status?token={token}` (verificación criptográfica/oficial del estado de pago).
- **Qué falta para volverlo funcional:**
  1. Enviar el modelo completo de entrega a `service-order`.
  2. Implementar verificación real del pago en [`Exito.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/pages/cliente/pago/Exito.tsx) mediante `api.payments.getStatus(token)`.
  3. Redirigir a `/pago/error` con causas reales en caso de rechazo del pago en Flow.

---

### 2.5. Perfil de Cliente e Historial de Pedidos
- **Archivos:**
  - [`frontend/src/pages/cliente/Perfil.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/pages/cliente/Perfil.tsx)
  - [`frontend/src/components/domain/PerfilSidebar.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/components/domain/PerfilSidebar.tsx)
- **Estado Actual:**
  - [`Perfil.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/pages/cliente/Perfil.tsx#L28-L43) inicializa datos personales y de dirección con strings hardcodeados ("María González Pérez", "Av. Providencia 1234"). Al editar mediante modales, sólo actualiza el `useState` local; los cambios se pierden al recargar la página.
  - La sección "Últimos Pedidos" ([`Perfil.tsx#L230-L270`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/pages/cliente/Perfil.tsx#L230-L270)) contiene una tarjeta HTML fija con el pedido `#CC-2025-001234`, sin consultar el historial real de órdenes.
- **Endpoints Backend a Integrar:**
  - `GET /api/identity/users` o endpoint de usuario autenticado para leer datos de perfil.
  - `PUT /api/identity/users/{id}` (o endpoint de actualización de datos de cliente y direcciones).
  - `GET /api/orders?email={email}` o `GET /api/orders` filtrado por cliente.
- **Qué falta para volverlo funcional:**
  1. Cargar la información del cliente desde el token/servicio de identidad.
  2. Persistir cambios de datos personales y direcciones en el backend.
  3. Listar dinámicamente las órdenes reales del cliente con sus estados y montos actualizados.

---

### 2.6. Seguimiento de Pedidos (Tracking en Tiempo Real)
- **Archivos:**
  - [`frontend/src/pages/cliente/PerfilSeguimiento.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/pages/cliente/PerfilSeguimiento.tsx)
  - [`frontend/src/components/domain/LineaTiempoPedido.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/components/domain/LineaTiempoPedido.tsx)
- **Estado Actual:**
  - [`PerfilSeguimiento.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/pages/cliente/PerfilSeguimiento.tsx#L27-L63) contiene un array fijo `HITOS_SEGUIMIENTO` y muestra siempre el pedido `#CC-2025-001234`.
  - No captura el parámetro de ruta `:id` configurado en `App.tsx` (`/perfil/seguimiento/:id`), ni invoca a [`api.orders.getByTrackingCode`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/services/api.ts#L38-L41).
  - Los datos de la persona que retira el pedido se guardan en un `useState` local.
- **Endpoints Backend a Integrar:**
  - `GET /api/orders/tracking/{code}` (recupera pedido, items, estado de cocina/despacho y fechas).
- **Qué falta para volverlo funcional:**
  1. Extraer el código de seguimiento desde la URL (`useParams<{ id: string }>()`) o input de búsqueda.
  2. Consultar el estado real de la orden en `service-order`.
  3. Mapear dinámicamente los estados del backend (`RECIBIDO`, `EN_PREPARACION`, `LISTO_RETIRO`, `ENTREGADO`, `CANCELADO`) a los pasos de [`LineaTiempoPedido.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/components/domain/LineaTiempoPedido.tsx).

---

### 2.7. Personalización y Cotizaciones de Tortas
- **Archivos:**
  - [`frontend/src/pages/cliente/Personalizacion.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/pages/cliente/Personalizacion.tsx)
- **Estado Actual:**
  - El formulario interactivo calcula opciones de porciones, sabores y cotización aproximada, pero [`handleEnviar`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/pages/cliente/Personalizacion.tsx#L53-L56) únicamente invoca `setModalEnviado(true)`. No se envía ninguna solicitud al backend.
- **Endpoints Backend a Integrar:**
  - `POST /api/orders` (con tipo de orden especial/personalizada) o endpoint dedicado en `service-order` o `service-notification`.
- **Qué falta para volverlo funcional:**
  1. Generar payload con la cotización (porciones, sabores, notas, fecha evento, contacto del cliente).
  2. Enviar la solicitud a la API y notificar al cliente con código de cotización o confirmación por correo.

---

### 2.8. Punto de Venta POS (Administración / Cajero)
- **Archivos:**
  - [`frontend/src/pages/admin/Pos.tsx`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/pages/admin/Pos.tsx)
- **Estado Actual:**
  - Lee productos desde `@/data/products`.
  - Al completar la venta en cualquiera de los métodos de cobro ([`Pos.tsx#L122-L134`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/pages/admin/Pos.tsx#L122-L134)), sólo abre el modal de éxito sin contactar al backend. No descuenta stock ni emite boleta.
- **Endpoints Backend a Integrar:**
  - `GET /api/catalog/products` (catálogo y stock en vivo).
  - `POST /api/inventory/pos/sale` (registra la venta en Kardex, genera número de boleta y reduce inventario).
- **Qué falta para volverlo funcional:**
  1. Cargar stock en tiempo real.
  2. Enviar el ticket de venta a `service-inventory` para registrar boleta y movimiento de inventario.

---

### 2.9. Capa de Servicios HTTP (`frontend/src/services/api.ts`)
- **Archivos:**
  - [`frontend/src/services/api.ts`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/frontend/src/services/api.ts)
- **Estado Actual:**
  - No incluye interceptor para inyectar token JWT (`Authorization: Bearer ...`).
  - Faltan métodos de integración para:
    - `catalog`: `getProductById`, `createProduct`, `updateProduct`, `deleteProduct`.
    - `orders`: `listOrders`, `getOrderById`, `updateStatus`.
    - `inventory`: `getKardex`, `registerPosSale`, `registerMerma`.
    - `identity`: `getUsers`, `getRoles`, `changeRole`, `updateProfile`.

---

## 3. Propuesta de Tickets para Ejecución (Backlog F3)

A continuación se propone el desglose en tickets normalizados según [`docs/plantilla_ticket.md`](file:///C:/Users/retma/OneDrive/Escritorio/Fullstack2_Proyecto_Pasteleria/docs/plantilla_ticket.md) para ejecutar ordenadamente la integración:

### Ticket 1: `FE-INT-01` — Cliente HTTP y Autenticación JWT Real
- **Dominio:** Transversal / Identidad.
- **Alcance:**
  - Actualizar `api.ts` con inyección de cabecera `Authorization: Bearer <token>`.
  - Conectar `AuthProvider`, `ModalLogin` y `ModalRegistro` con `POST /api/identity/auth/login` y `/register`.
  - Manejar almacenamiento seguro del token y persistencia de sesión con rol de usuario.
- **Definition of Done:** Login y registro funcionan contra `service-identity` (:8081); errores 401/409 se muestran en UI; token se envía en requests protegidos.

### Ticket 2: `FE-INT-02` — Catálogo y Detalle de Producto Conectados a Backend
- **Dominio:** Catálogo de Productos.
- **Alcance:**
  - Modificar `useRealtimeProducts` para cargar la lista completa desde `GET /api/catalog/products`.
  - Actualizar `ProductoDetalle.tsx` para consultar `GET /api/catalog/products/{id}` ante carga directa.
  - Añadir estados visuales de carga (Skeletons) y mensaje de error cuando la API esté caída.
- **Definition of Done:** Nuevos productos creados en backend aparecen en el catálogo y detalle sin recargar archivos locales.

### Ticket 3: `FE-INT-03` — Carrito y Validación de Cupones con Backend
- **Dominio:** Carrito / Promociones.
- **Alcance:**
  - Reemplazar constantes locales `CUPONES` por consulta a `GET /api/catalog/promotions`.
  - Validar cantidades contra el stock disponible antes de aumentar ítems en el carrito.
- **Definition of Done:** Cupones como `DULCE10` o `CREME20` del backend se aplican correctamente con su porcentaje respectivo; no se permite superar stock máximo.

### Ticket 4: `FE-INT-04` — Integración Completa de Checkout y Pasarela Flow.cl
- **Dominio:** Checkout / Pagos / Órdenes.
- **Alcance:**
  - Enviar datos completos de despacho en `POST /api/orders`.
  - Crear cobro en Flow mediante `POST /api/payments/flow/create` con URL de retorno a `/confirmacion`.
  - En `/confirmacion` y `/pago/exito`, consultar `GET /api/payments/flow/status?token={token}` para confirmar estado antes de mostrar éxito.
- **Definition of Done:** Flujo completo de compra genera pedido en BD de órdenes y valida estado de pago con Flow.

### Ticket 5: `FE-INT-05` — Perfil de Usuario y Seguimiento de Pedidos Dinámico
- **Dominio:** Cuenta de Cliente / Tracking.
- **Alcance:**
  - Conectar `Perfil.tsx` con datos del usuario autenticado y permitir actualizar dirección y teléfono.
  - Listar pedidos reales del cliente consultando `GET /api/orders`.
  - En `PerfilSeguimiento.tsx`, leer `:id` de la URL y consultar `GET /api/orders/tracking/{code}` para renderizar hitos de `LineaTiempoPedido` en tiempo real.
- **Definition of Done:** El usuario ve sus propios pedidos; el timeline refleja el estado de cocina/despacho real del backend.

### Ticket 6: `FE-INT-06` — Conexión de Cotizaciones (Personalización) y Ventas POS
- **Dominio:** Servicios Especiales y POS.
- **Alcance:**
  - Conectar formulario de `Personalizacion.tsx` para generar solicitud de cotización registrada en backend.
  - Conectar `Pos.tsx` con `POST /api/inventory/pos/sale` para registrar ventas en Kardex y descontar stock automáticamente.
- **Definition of Done:** La venta en POS descuenta stock en `service-inventory`; la cotización personalizada se registra y genera folio.
