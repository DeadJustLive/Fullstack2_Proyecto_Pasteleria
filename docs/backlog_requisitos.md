<!-- @pca:start
@id(docs.backlog_requisitos)
@kind(doc)
@limit(lines: 400)
@relates(docs.estado_proyecto, docs.plan_sprints, docs.convenciones)
@desc(Backlog F1: actores, epicas, requisitos, reglas de negocio, edge cases y supuestos)
@pca:end -->

# Backlog de Requisitos — Crème & Co

> **Fase:** F1 — Levantamiento · **Estado:** En revisión
> **Alcance:** tienda cliente, PWA de gestión, API Spring Boot y MySQL 8.
> **Regla:** ningún ticket de F3 se ejecuta si no está trazado a un requisito o regla de este documento.

---

## 1. Propósito

Definir qué debe construirse, qué reglas de negocio son obligatorias y qué casos límite deben
resolverse antes de programar. Este documento es la fuente de verdad funcional; el detalle de
ejecución vive en `docs/plan_sprints.md` y en `docs/tickets/`.

---

## 2. Alcance

### Incluido

- Tienda online para clientes: catálogo, detalle, carrito, checkout, confirmación, perfil, historial y blog.
- PWA de gestión separada: dashboard, POS, pedidos, inventario, insumos y recetas, cupones, envíos, usuarios, roles y permisos, reportes, blog, configuración y auditoría.
- Backend Spring Boot + MySQL 8 + Flyway + JWT + RBAC dinámico.
- Pago simulado y abstracción preparada para Flow.
- POS con cola offline en IndexedDB.
- Ejecución local con Docker Compose y dos apps Vite.

### Excluido del MVP

- Integración real con Flow (se prepara el adaptador; se activa en Sprint 6).
- Facturación electrónica, boletas tributarias y contabilidad.
- Multi-sucursal, multi-bodega y franquicias.
- App móvil nativa.
- Envío real de correos (se registra en logs o consola).
- Despliegue cloud; el objetivo es local.

---

## 3. Actores y roles

| Actor | Descripción | Acceso |
| :--- | :--- | :--- |
| Cliente | Compra en la tienda online | Catálogo, carrito, checkout, perfil e historial propios |
| Administrador | Gestiona la operación completa | Todos los módulos de la PWA |
| Cajero | Atiende el POS y pedidos | POS, pedidos y consulta de catálogo |
| Bodeguero | Gestiona stock e insumos | Inventario, insumos, recetas y reportes de stock |
| Contenido | Gestiona blog y configuración editorial | Blog y configuración de tienda |
| Sistema | Webhooks, tareas y sincronización | Endpoints internos autenticados |
| Desarrollador | Mantiene el sistema | No es un rol de negocio; no accede por la UI |

> Los roles no son un `enum` fijo: el administrador puede crear roles nuevos y asignar
> permisos por módulo y acción desde la PWA. `ADMIN` y `CLIENTE` son roles de sistema protegidos.

---

## 4. Épicas y requisitos funcionales

### E01 — Fundaciones

| ID | Requisito |
| :--- | :--- |
| RF-001 | El repositorio debe tener una estructura de monorepo con `frontend/`, `admin/`, `backend/`, `infra/`, `shared/` y `docs/`. |
| RF-002 | MySQL 8 debe levantarse con Docker Compose, volumen persistente, healthcheck y variables de entorno. |
| RF-003 | Spring Boot debe arrancar con perfiles `dev`/`prod`, Actuator, CORS y OpenAPI. |
| RF-004 | Flyway debe versionar el esquema y los datos semilla. |
| RF-005 | El contrato OpenAPI debe generar tipos TypeScript para las dos apps. |
| RF-006 | El backend debe tener un formato único de error y una plantilla de módulo. |
| RF-007 | La PWA admin debe existir con Vite + React + Bootstrap 5 + tema de marca, sin Tailwind. |
| RF-008 | Debe haber pruebas automatizadas configuradas en backend y frontend. |
| RF-009 | El manifiesto PCA debe incluir los nuevos roots y la documentación debe quedar sincronizada. |

### E02 — Identidad y RBAC dinámico

| ID | Requisito |
| :--- | :--- |
| RF-010 | Un cliente puede registrarse con nombre, email y contraseña. |
| RF-011 | Un usuario puede iniciar sesión y recibir access token + refresh token. |
| RF-012 | El refresh token debe rotar y el logout debe revocarlo. |
| RF-013 | El usuario puede consultar y editar su perfil y cambiar su contraseña. |
| RF-014 | El administrador puede crear, editar, activar, desactivar y resetear usuarios. |
| RF-015 | El administrador puede crear, editar y eliminar roles personalizados. |
| RF-016 | El administrador puede asignar permisos por módulo y acción a cada rol. |
| RF-017 | Un usuario puede tener uno o varios roles. |
| RF-018 | Los cambios de roles y permisos deben auditarse. |
| RF-019 | La PWA debe construir el menú y proteger rutas según los permisos del usuario. |
| RF-020 | El cliente React debe reemplazar la sesión simulada por autenticación real. |

### E03 — Catálogo

| ID | Requisito |
| :--- | :--- |
| RF-021 | El administrador puede gestionar categorías. |
| RF-022 | El administrador puede gestionar productos con precio, descripción, categorías y variaciones. |
| RF-023 | El administrador puede subir y ordenar imágenes de producto. |
| RF-024 | El catálogo público debe permitir listar, buscar, filtrar y paginar. |
| RF-025 | El cliente puede ver el detalle de un producto. |
| RF-026 | La PWA debe tener una pantalla de catálogo con CRUD. |
| RF-027 | La tienda cliente debe consumir el catálogo real desde la API. |
| RF-028 | El catálogo debe contemplar productos destacados y no disponibles. |

### E04 — Compra

| ID | Requisito |
| :--- | :--- |
| RF-029 | El administrador puede gestionar cupones con vigencia, mínimo y usos. |
| RF-030 | El administrador puede gestionar zonas y tarifas de envío; el cliente puede cotizar. |
| RF-031 | El cliente puede crear un pedido desde el checkout. |
| RF-032 | El pedido debe tener estados, historial y transiciones auditables. |
| RF-033 | El pago simulado debe soportar efectivo, tarjeta y transferencia, con fallos controlados. |
| RF-034 | El checkout debe validar stock, precios, cupón, envío y datos del cliente. |
| RF-035 | El cliente debe ver una pantalla de confirmación con el resumen del pedido. |
| RF-036 | El cliente debe ver su perfil, historial y seguimiento. |
| RF-037 | El administrador debe ver pedidos, filtrarlos y cambiar su estado. |
| RF-038 | La creación de pedidos debe ser idempotente y resistente a doble submit. |

### E05 — POS e inventario

| ID | Requisito |
| :--- | :--- |
| RF-039 | El inventario debe controlar stock por producto y alertas de stock bajo. |
| RF-040 | Los movimientos de stock deben registrar tipo, cantidad, motivo y usuario. |
| RF-041 | El administrador puede gestionar insumos con unidad de medida y stock mínimo. |
| RF-042 | El administrador puede gestionar recetas y registrar producción o merma. |
| RF-043 | El cajero puede abrir y cerrar una sesión de caja con arqueo. |
| RF-044 | El POS debe registrar ventas presenciales y descontar stock. |
| RF-045 | La PWA debe tener una pantalla POS usable en móvil y tablet. |
| RF-046 | El POS debe encolar ventas offline y sincronizarlas con idempotencia. |

### E06 — Gestión ampliada

| ID | Requisito |
| :--- | :--- |
| RF-047 | El dashboard debe mostrar KPIs de ventas, pedidos, stock y caja. |
| RF-048 | Los reportes deben filtrar por fecha y agrupar ventas, productos y stock. |
| RF-049 | Los reportes deben exportarse a CSV. |
| RF-050 | El administrador puede gestionar artículos y categorías del blog. |
| RF-051 | El administrador puede configurar datos de tienda, horarios y parámetros. |
| RF-052 | La auditoría debe registrar acciones críticas de todos los módulos. |

### E07 — Integraciones

| ID | Requisito |
| :--- | :--- |
| RF-053 | El pago debe implementarse tras una interfaz `PaymentProvider` con implementación simulada. |
| RF-054 | El adaptador de Flow debe crear pagos, recibir webhooks y confirmar pedidos. |
| RF-055 | La configuración de Flow debe venir por variables de entorno, nunca en código. |

### E08 — Cliente

| ID | Requisito |
| :--- | :--- |
| RF-056 | Completar las páginas pendientes: producto, envío, confirmación, login, registro, perfil y blog. |
| RF-057 | Mantener SEO, metadatos y datos estructurados donde aplique. |
| RF-058 | Mantener responsive y accesibilidad en todos los breakpoints documentados. |
| RF-059 | Eliminar `frontend/src/mockup/` al terminar la migración. |

### E09 — PWA

| ID | Requisito |
| :--- | :--- |
| RF-060 | La PWA debe tener manifest, iconos y service worker. |
| RF-061 | La PWA debe ser instalable en escritorio y móvil. |
| RF-062 | El shell debe cargar offline y mostrar el estado de conexión. |
| RF-063 | Las ventas offline deben sincronizarse en segundo plano y resolver conflictos. |

### E10 — Calidad

| ID | Requisito |
| :--- | :--- |
| RF-064 | Backend con pruebas unitarias, de integración y de seguridad. |
| RF-065 | Frontend con pruebas de componentes y servicios. |
| RF-066 | Flujos críticos cubiertos con Playwright. |
| RF-067 | Lighthouse mínimo: PWA instalable y rendimiento aceptable en local. |
| RF-068 | Revisión de seguridad: JWT, RBAC, validación, secretos, headers y rate limiting. |
| RF-069 | Documentación viva: API, operación, README, estado y cicatrices. |

---

## 5. Requisitos no funcionales

| ID | Requisito |
| :--- | :--- |
| RNF-001 | El cliente no debe cargar Bootstrap ni la PWA debe cargar Tailwind. |
| RNF-002 | El backend no expone datos sensibles ni secretos en respuestas o logs. |
| RNF-003 | Toda vista contempla estados de carga, vacío, error y datos. |
| RNF-004 | Las operaciones críticas son transaccionales e idempotentes. |
| RNF-005 | TypeScript estricto, sin `any`; Java con tipos explícitos y DTOs. |
| RNF-006 | Logs estructurados y Actuator para salud y métricas básicas. |
| RNF-007 | El entorno local debe levantarse con pocos comandos documentados. |
| RNF-008 | El stock no puede quedar negativo; las compras concurrentes se resuelven con bloqueo o reintento. |
| RNF-009 | Moneda CLP entera y fechas en `America/Santiago`, serializadas en ISO-8601. |
| RNF-010 | Compatibilidad con navegadores modernos y viewports de 360 px en adelante. |

---

## 6. Reglas de negocio

| ID | Regla |
| :--- | :--- |
| RB-001 | Los precios se expresan en CLP entero y se asumen con IVA incluido. |
| RB-002 | Un cupón tiene tipo (porcentaje o monto fijo), mínimo de compra, vigencia y usos máximos; no se acumula con otro cupón. |
| RB-003 | El envío puede ser retiro en tienda (gratis) o domicilio según zona; puede existir umbral de envío gratis. |
| RB-004 | El stock de producto se descuenta al confirmar el pago o la venta POS; el carrito no reserva stock. |
| RB-005 | Estados de pedido: `PENDIENTE`, `PAGADO`, `EN_PREPARACION`, `LISTO`, `ENVIADO`, `ENTREGADO`, `CANCELADO`. |
| RB-006 | Estados de pago: `PENDING`, `AUTHORIZED`, `PAID`, `FAILED`, `CANCELLED`, `REFUNDED`. |
| RB-007 | Un usuario solo accede a un módulo si su rol tiene el permiso correspondiente; el backend siempre valida. |
| RB-008 | No se puede eliminar el último usuario con permiso `roles.manage` ni un rol asignado a usuarios. |
| RB-009 | La sesión de caja se abre y cierra por cajero; el arqueo registra monto esperado, contado y diferencia. |
| RB-010 | La producción consume insumos y aumenta stock de producto; la venta consume stock de producto. |
| RB-011 | Toda acción crítica de usuarios, roles, pedidos, pagos, inventario y configuración se audita. |
| RB-012 | Las entidades maestras usan borrado lógico cuando tienen historial asociado. |
| RB-013 | La creación de pedidos y la sincronización POS usan una clave de idempotencia. |
| RB-014 | Flow se activa por configuración; sin credenciales se usa el proveedor simulado. |
| RB-015 | Una venta offline se sincroniza una sola vez; si el stock es insuficiente queda en conflicto para revisión. |
| RB-016 | Un artículo de blog solo es público si está publicado y tiene slug único. |
| RB-017 | La configuración de tienda es clave-valor tipada y solo editable con `settings.manage`. |
| RB-018 | Los reportes usan la zona horaria de la tienda y rangos inclusivos por día. |
| RB-019 | El registro público solo crea usuarios con rol `CLIENTE`; el personal se crea desde la PWA. |
| RB-020 | Un producto sin stock o inactivo no se muestra como comprable en la tienda. |

---

## 7. Casos límite

| ID | Caso |
| :--- | :--- |
| EC-001 | Dos clientes compran la última unidad al mismo tiempo. |
| EC-002 | El precio cambia entre el carrito y el checkout. |
| EC-003 | El producto se elimina o desactiva mientras está en el carrito. |
| EC-004 | El cupón expira o no alcanza el mínimo. |
| EC-005 | El usuario envía dos veces el checkout por doble clic o reintento de red. |
| EC-006 | El pago queda pendiente y el webhook llega duplicado o fuera de orden. |
| EC-007 | El webhook de Flow tiene firma inválida o referencia desconocida. |
| EC-008 | El token expira durante una operación. |
| EC-009 | Un rol es eliminado o modificado mientras un usuario lo tiene asignado. |
| EC-010 | Se intenta eliminar el último administrador. |
| EC-011 | Un usuario sin permiso accede por URL directa a un módulo. |
| EC-012 | La zona de envío no cubre la dirección del cliente. |
| EC-013 | El POS registra una venta sin stock suficiente. |
| EC-014 | El POS sincroniza una venta offline que ya fue registrada. |
| EC-015 | Dos cajas cierran la misma sesión o hay ventas mixtas online/offline. |
| EC-016 | Se produce un lote sin insumos suficientes. |
| EC-017 | Se ajusta stock manualmente a un valor negativo. |
| EC-018 | El reporte se pide en un rango sin datos o con fechas invertidas. |
| EC-019 | El blog recibe un slug duplicado. |
| EC-020 | El usuario pierde conexión durante el checkout. |
| EC-021 | El service worker sirve una versión vieja del shell. |
| EC-022 | Se sube una imagen demasiado grande o con formato no permitido. |
| EC-023 | Un usuario intenta escalar privilegios modificando el rol en el cliente. |
| EC-024 | El correo ya está registrado. |
| EC-025 | La base de datos no está disponible al arrancar la API. |

---

## 8. Supuestos y decisiones abiertas

### Supuestos aprobados

1. La PWA admin es una app separada con React + Bootstrap 5; el cliente conserva Tailwind.
2. El backend es la única fuente de verdad para precios, stock, pedidos y permisos.
3. MySQL 8 se ejecuta con Docker Compose en local.
4. Java 21 + Spring Boot 3.5 + Maven Wrapper.
5. JWT: access token de 15 minutos y refresh token de 7 días con rotación.
6. Flow se integra en una etapa posterior; ahora solo se prepara la abstracción.
7. Los roles y permisos son datos editables; `ADMIN` y `CLIENTE` son roles de sistema.
8. El POS puede vender offline y sincronizar después.
9. Los correos se simulan con logs; no hay proveedor SMTP en el MVP.
10. Las imágenes se almacenan localmente en el backend y se sirven por URL.

### Decisiones que deben confirmarse al aprobar F1

- ¿El IVA se declara en el precio o se calcula aparte? Supuesto: incluido.
- ¿El stock de producto se descuenta al crear el pedido o al confirmar el pago? Supuesto: al confirmar.
- ¿La producción descuenta insumos y aumenta stock de producto? Supuesto: sí.
- ¿El POS puede operar sin una sesión de caja abierta? Supuesto: no.
- ¿Un cliente puede cancelar un pedido pagado? Supuesto: solo antes de `EN_PREPARACION` y con reembolso simulado.

---

## 9. Trazabilidad épica → sprint → tickets

| Épica | Sprint | Tickets |
| :--- | :--- | :--- |
| E01 Fundaciones | S0 | T21–T29 |
| E02 Identidad y RBAC | S1 | T30–T42 |
| E03 Catálogo | S2 | T43–T51 |
| E04 Compra | S3 | T52–T61 |
| E05 POS e inventario | S4 | T62–T70 |
| E06 Gestión ampliada | S5 | T71–T79 |
| E07 Integraciones | S6 | T80–T81 |
| E08 Cliente | S2, S3, S5, S6 | T48–T49, T58–T59, T76, T86 |
| E09 PWA | S4, S6 | T68–T69, T82 |
| E10 Calidad | S6 | T83–T88 |

---

## 10. Próximo paso

1. Aprobar este backlog y el `docs/plan_sprints.md`.
2. Validar la estructura de tickets en `docs/tickets/`.
3. Iniciar F3 por el Sprint 0, respetando el orden de dependencias.
