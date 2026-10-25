# Sprint 1 — Identidad y RBAC (T30–T42)

> **Fase:** F3 — Ejecución por tickets · **Sprint:** S1 · **Backlog:** E02 (RF-010 a RF-020)
> **Plan:** [`docs/plan_sprints.md`](../plan_sprints.md) · **Plantilla:** [`docs/plantilla_ticket.md`](../plantilla_ticket.md)
> **Estado del sprint:** Pendiente de inicio · **Regla:** no se abre un ticket si sus dependencias no están cerradas.

## Propósito

Construir la identidad real del sistema: usuarios, roles y permisos persistidos en MySQL, autenticación
con JWT y refresh rotativo, autorización dinámica por permisos en el backend, gestión administrativa de
usuarios y roles, auditoría de cambios y consumo real desde la PWA y el cliente React. Al cerrar el
sprint, el backend es la única fuente de verdad de la identidad y ninguna pantalla puede simular una
sesión o un permiso.

## Supuestos del sprint

- **SUPUESTO:** los endpoints viven bajo `/api/v1`; identidad usa `/api/v1/auth`, `/api/v1/users`, `/api/v1/roles`, `/api/v1/permissions` y `/api/v1/audit-logs`.
- **SUPUESTO:** el paquete Java base es `com.cremeco.pasteleria` y el módulo de identidad es `identity`.
- **SUPUESTO:** T30 reserva las migraciones Flyway `V10` y `V11`; T38 usa `V12`. S0 deja libres `V1` a `V9`.
- **SUPUESTO:** el access token es un JWT de 15 minutos; el refresh token es opaco, aleatorio de 256 bits, dura 7 días, se guarda como hash SHA-256 y rota en cada uso.
- **SUPUESTO:** el refresh token viaja en cookie `HttpOnly`, `SameSite=Lax`, `Path=/api/v1/auth` y `Secure` solo en producción; el access token se mantiene en memoria en las dos apps.
- **SUPUESTO:** la política de contraseña es mínimo 8 caracteres, máximo 72 bytes (límite de BCrypt) y al menos una letra y un número.
- **SUPUESTO:** los permisos usan el formato `<modulo>.<accion>` y las authorities de Spring son el código literal del permiso, por ejemplo `users.manage`.
- **SUPUESTO:** los correos se simulan con logs; no se envía correo real en este sprint.
- **SUPUESTO:** las pruebas de integración usan Testcontainers con MySQL 8, no H2, para validar constraints y `JSON`.

## Índice de tickets

| ID | Título | Responsable | Prioridad | Depende de |
| :--- | :--- | :--- | :--- | :--- |
| T30 | Modelo de usuarios, roles y permisos | Nicolas | Alta | T24, T26 |
| T31 | Registro público de clientes | Nicolas | Alta | T30 |
| T32 | Login con JWT, refresh y logout | Matias | Alta | T30 |
| T33 | SecurityConfig, filtro JWT y authorities | Matias | Alta | T32 |
| T34 | `/auth/me`, perfil y cambio de contraseña | Nicolas | Alta | T33 |
| T35 | CRUD de usuarios (API) | Nicolas | Alta | T30, T33 |
| T36 | CRUD de roles y matriz de permisos (API) | Nicolas | Alta | T30 |
| T37 | Asignación de roles y salvaguardas (API) | Nicolas | Alta | T35, T36 |
| T38 | Auditoría de identidad | Nicolas | Media | T36, T37 |
| T39 | PWA: login, guards y menú por permisos | Anais | Alta | T27, T34 |
| T40 | PWA: pantallas Usuarios y Roles | Anais | Alta | T35–T39 |
| T41 | Cliente React: autenticación real y guards | Anais | Alta | T34, T39 |
| T42 | Pruebas de seguridad y matriz de permisos | Nicolas | Alta | T30–T38 |

## Reglas transversales

1. El backend valida toda operación con `@PreAuthorize`; ocultar un botón o una ruta en el frontend no es autorización.
2. Los errores usan el formato RFC 7807 definido en T26 (`application/problem+json`).
3. Ninguna respuesta, log o traza expone `password_hash`, tokens ni secretos (RNF-002).
4. Los cambios de usuarios, roles, permisos y contraseñas se auditan (RB-011).
5. Las entidades con historial usan borrado lógico; no se eliminan físicamente usuarios con pedidos, auditoría o movimientos (RB-012).
6. Cada ticket actualiza el contrato OpenAPI y los tipos TypeScript si cambia un endpoint o DTO.

---

# Ticket T30 — Modelo de usuarios, roles y permisos

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 1
- **Rama sugerida:** feature/T30-modelo-identidad
- **Responsable:** Nicolas
- **Prioridad:** Alta
- **Depende de:** T24, T26

## Contexto
Es la base del RBAC dinámico. Sin tablas, entidades y datos semilla no se pueden implementar registro,
login ni autorización. Cubre RF-010 a RF-018, RB-007, RB-008, RB-012 y RB-019. `ADMIN` y `CLIENTE`
son roles de sistema protegidos; un usuario puede tener varios roles y cada rol varios permisos.

## Convenciones aplicables
- CONV-NAM-02
- CONV-NAM-05
- CONV-NAM-06
- CONV-EST-01
- CONV-TIP-01
- CONV-TIP-02
- CONV-SEG-03
- CONV-DOC-01

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** entidades `User`, `Role`, `Permission` y `RefreshToken`; tablas `users`, `roles`, `permissions`, `user_roles`, `role_permissions` y `refresh_tokens`; migraciones `V10` y `V11`; seed idempotente de roles de sistema y catálogo de permisos; repositorios JPA.
- **NO:** endpoints, lógica de login, configuración de seguridad, pantallas, auditoría y asignación de roles desde la API.

## Criterios de aceptación
- [ ] `V10` crea las seis tablas con claves foráneas, `unique(email)`, `unique(role.code)`, `unique(permission.code)`, `unique(user_id, role_id)` y `unique(role_id, permission_id)`.
- [ ] `users` incluye `password_hash`, `is_active`, `deleted_at`, `created_at` y `updated_at`; nunca se almacena contraseña en texto plano.
- [ ] `V11` crea los roles `ADMIN` y `CLIENTE` con `is_system = true` y el catálogo inicial de permisos por módulo y acción, de forma idempotente.
- [ ] Las entidades modelan la relación muchos-a-muchos de usuarios con roles y de roles con permisos, sin exponer colecciones mutables fuera del agregado.
- [ ] Los repositorios permiten buscar por email sin distinguir mayúsculas, verificar existencia de email, buscar rol o permiso por código y listar permisos de un usuario.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/java/com/cremeco/pasteleria/identity/model/User.java` | model | 160 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/model/Role.java` | model | 100 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/model/Permission.java` | model | 90 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/model/RefreshToken.java` | model | 110 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/repository/UserRepository.java` | model | 70 |
| `backend/src/main/resources/db/migration/V10__identity_schema.sql` | model | 160 |
| `backend/src/main/resources/db/migration/V11__seed_identity.sql` | model | 130 |

## Casos límite (Edge Cases)
- Dos registros con el mismo email en distinta capitalización chocan contra la restricción única, no contra una validación solo de aplicación (EC-024).
- Un rol de sistema no puede eliminarse ni cambiar su código desde el modelo; la protección se refuerza en la capa de servicio (EC-009).
- El seed se ejecuta dos veces por error: no duplica roles ni permisos ni pierde asignaciones existentes.
- MySQL no está disponible al migrar: Flyway falla, la API no arranca y el healthcheck queda en error (EC-025).

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] Las migraciones `V10` y `V11` se aplican desde una base vacía sin errores.
- [ ] El modelo y las tablas quedan reflejados en el contrato OpenAPI cuando exista un DTO asociado.

---

# Ticket T31 — Registro público de clientes

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 1
- **Rama sugerida:** feature/T31-registro-clientes
- **Responsable:** Nicolas
- **Prioridad:** Alta
- **Depende de:** T30

## Contexto
El cliente debe poder crear su cuenta desde la tienda sin intervención del personal. Cubre RF-010,
RB-019 y EC-024. El registro público jamás permite elegir rol: todo usuario nuevo recibe `CLIENTE`.

## Convenciones aplicables
- CONV-SEG-03
- CONV-SEG-04
- CONV-ERR-02
- CONV-ERR-03
- CONV-ERR-04
- CONV-TIP-01
- CONV-TIP-02
- CONV-NAM-01
- CONV-DOC-02

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** `POST /api/v1/auth/register`; validación de nombre, email y contraseña; normalización de email; hash BCrypt; asignación automática del rol `CLIENTE`; respuesta sin datos sensibles.
- **NO:** login automático, envío de correo de verificación, recuperación de contraseña, creación de personal y selección de roles.

## Criterios de aceptación
- [ ] Un registro válido responde `201` con `id`, `name`, `email` y `roles: ["CLIENTE"]`, sin hash ni token.
- [ ] Un email inválido, un nombre vacío o una contraseña que incumple la política responden `400` con errores por campo en formato RFC 7807.
- [ ] Un email ya registrado responde `409` con un mensaje genérico y no revela si la cuenta existe o está activa (EC-024).
- [ ] Enviar `role`, `roles` o `isActive` en el cuerpo no eleva privilegios; el rol asignado siempre es `CLIENTE` (RB-019, EC-023).
- [ ] La contraseña se almacena con BCrypt y el usuario y la asignación de rol se crean en una sola transacción.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/java/com/cremeco/pasteleria/identity/controller/RegistrationController.java` | service | 90 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/service/RegistrationService.java` | service | 150 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/dto/RegisterRequest.java` | model | 70 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/dto/RegisterResponse.java` | model | 50 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/validation/PasswordPolicy.java` | util | 70 |

## Casos límite (Edge Cases)
- Dos solicitudes simultáneas con el mismo email: una gana y la otra recibe `409` por la restricción única, sin dejar usuarios huérfanos.
- El rol `CLIENTE` no existe porque el seed no se ejecutó: la operación falla completa con error controlado y no crea el usuario.
- El email llega con espacios o mayúsculas: se normaliza a minúsculas y sin espacios antes de validar y guardar.
- La contraseña supera los 72 bytes de BCrypt: se rechaza con `400` en lugar de truncarse silenciosamente.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] El endpoint queda documentado en OpenAPI con sus respuestas `201`, `400` y `409`.
- [ ] Existe una prueba que demuestra que enviar un rol en el cuerpo no escala privilegios.

---

# Ticket T32 — Login con JWT, refresh y logout

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 1
- **Rama sugerida:** feature/T32-login-jwt
- **Responsable:** Matias
- **Prioridad:** Alta
- **Depende de:** T30

## Contexto
Implementa la autenticación real del sistema. Cubre RF-011, RF-012 y EC-008. El access token dura
15 minutos; el refresh token dura 7 días, rota en cada uso y se revoca en logout. Un refresh reutilizado
se considera comprometido.

## Convenciones aplicables
- CONV-SEG-01
- CONV-SEG-03
- CONV-SEG-04
- CONV-ERR-04
- CONV-TIP-02
- CONV-NAM-02
- CONV-DOC-02

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** `AuthService`; `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh` y `POST /api/v1/auth/logout`; JWT firmado; refresh opaco con hash, rotación, revocación y detección de reutilización; cookie `HttpOnly`; errores genéricos de credenciales.
- **NO:** autorización por permisos, filtro de seguridad, registro, perfil, recuperación de contraseña y pantallas.

## Criterios de aceptación
- [ ] Un login válido responde `200` con access token de 15 minutos, refresh token de 7 días y datos mínimos del usuario; el refresh se entrega en cookie `HttpOnly`.
- [ ] Credenciales incorrectas, email inexistente o usuario desactivado responden `401` con el mismo mensaje "Credenciales inválidas" y sin distinguir la causa.
- [ ] `refresh` válido rota el token: revoca el anterior, emite uno nuevo y encadena `replaced_by_id`; reutilizar el anterior responde `401` y revoca la cadena activa.
- [ ] `logout` revoca el refresh presentado, limpia la cookie y un `refresh` posterior responde `401`.
- [ ] Las contraseñas se comparan con BCrypt y nunca se registran en logs ni se devuelven en la respuesta.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/java/com/cremeco/pasteleria/identity/service/AuthService.java` | service | 190 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/security/JwtService.java` | service | 140 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/service/RefreshTokenService.java` | service | 160 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/controller/AuthController.java` | service | 140 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/dto/LoginRequest.java` | model | 50 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/dto/TokenResponse.java` | model | 70 |

## Casos límite (Edge Cases)
- El access token expira durante una operación: la API responde `401` con código `TOKEN_EXPIRED` para que el cliente intente un refresh una sola vez (EC-008).
- El refresh token expiró o fue revocado: no se emite un nuevo par y el usuario debe volver a iniciar sesión.
- Dos pestañas refrescan al mismo tiempo con el mismo token: solo una rotación gana y la otra recibe `401` sin bloquear la sesión ganadora.
- El usuario es desactivado después de iniciar sesión: el refresh se rechaza y el acceso deja de renovarse.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] El contrato OpenAPI documenta login, refresh, logout y sus códigos de error.
- [ ] Existe una prueba de rotación y otra de reutilización de refresh token.

---

# Ticket T33 — SecurityConfig, filtro JWT y authorities

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 1
- **Rama sugerida:** feature/T33-security-jwt
- **Responsable:** Matias
- **Prioridad:** Alta
- **Depende de:** T32

## Contexto
Convierte el token en una identidad autorizada. Cubre RB-007, EC-011 y EC-023. La API es stateless,
valida el JWT en cada solicitud, carga roles y permisos desde la base de datos y aplica `@PreAuthorize`
en los controladores. El frontend nunca decide permisos por sí solo.

## Convenciones aplicables
- CONV-SEG-03
- CONV-SEG-04
- CONV-ERR-04
- CONV-TIP-01
- CONV-TIP-02
- CONV-EST-01
- CONV-DOC-02

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** `SecurityFilterChain` stateless; desactivación de sesión y CSRF para API; filtro JWT; carga de authorities; caché de permisos con evicción; CORS con credenciales; manejadores JSON de `401` y `403`; rutas públicas y privadas.
- **NO:** endpoints de negocio, pantallas, pruebas de matriz completa (T42) y endurecimiento avanzado de rate limiting (T83).

## Criterios de aceptación
- [ ] Las rutas públicas `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/refresh`, `/actuator/health` y `/v3/api-docs/**` son accesibles sin token; el resto responde `401` sin autenticación.
- [ ] El filtro valida firma y expiración, extrae el `sub`, carga al usuario y construye authorities con los códigos de permiso y los roles (`ROLE_ADMIN`, `ROLE_CLIENTE`).
- [ ] Un usuario autenticado sin el permiso requerido recibe `403` en JSON, no un redirect ni una página HTML (EC-011).
- [ ] CORS permite exactamente `http://localhost:5173` y `http://localhost:5174`, con `credentials`, `Authorization` y los métodos `GET`, `POST`, `PUT`, `PATCH`, `DELETE` y `OPTIONS`.
- [ ] La caché de permisos se invalida al cambiar roles, permisos, estado del usuario o contraseña, y expone una operación de evicción reutilizable por T35, T36 y T37.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/java/com/cremeco/pasteleria/identity/security/SecurityConfig.java` | config | 160 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/security/JwtAuthenticationFilter.java` | service | 130 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/security/UserAuthorityService.java` | service | 120 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/security/AuthorityCacheService.java` | service | 100 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/security/RestAuthenticationEntryPoint.java` | config | 70 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/security/RestAccessDeniedHandler.java` | config | 70 |

## Casos límite (Edge Cases)
- Token con firma válida pero usuario eliminado o desactivado: se responde `401` y se evicta su entrada de caché.
- Cabecera `Authorization` malformada o con un esquema distinto de `Bearer`: se responde `401` controlado, nunca `500`.
- Un administrador cambia permisos de un rol mientras el usuario tiene sesión activa: la siguiente solicitud refleja el cambio tras la evicción.
- Origen no permitido en preflight: CORS rechaza la solicitud sin ejecutar el controlador.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] La configuración no duplica el bean CORS de T23; lo extiende o lo reemplaza de forma explícita.
- [ ] Existe una prueba de `401` sin token y otra de `403` con token válido sin permiso.

---

# Ticket T34 — `/auth/me`, perfil y cambio de contraseña

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 1
- **Rama sugerida:** feature/T34-perfil-password
- **Responsable:** Nicolas
- **Prioridad:** Alta
- **Depende de:** T33

## Contexto
El usuario necesita ver su identidad efectiva, editar sus datos y cambiar su contraseña. Cubre
RF-013 y EC-008. `/auth/me` es la fuente que usan las dos apps para construir menús y guards, por lo
que debe devolver roles y permisos vigentes, no los del token.

## Convenciones aplicables
- CONV-SEG-03
- CONV-SEG-04
- CONV-ERR-02
- CONV-ERR-03
- CONV-ERR-04
- CONV-TIP-01
- CONV-TIP-02
- CONV-NAM-01
- CONV-DOC-02

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** `GET /api/v1/auth/me`; `PATCH /api/v1/auth/me` para nombre y teléfono; `POST /api/v1/auth/me/password`; validación de contraseña actual y política; revocación de sesiones tras el cambio.
- **NO:** cambio de email, verificación por correo, recuperación de contraseña olvidada, edición de roles y avatar.

## Criterios de aceptación
- [ ] `/auth/me` devuelve `id`, `name`, `email`, `phone`, `isActive`, `roles` y `permissions` del usuario autenticado, sin `password_hash` ni tokens.
- [ ] `PATCH /auth/me` valida y persiste nombre y teléfono; el email es inmutable en este ticket y un intento de cambiarlo responde `400`.
- [ ] El cambio de contraseña exige la contraseña actual correcta, aplica la política y rechaza una nueva igual a la actual.
- [ ] Un cambio exitoso revoca todos los refresh tokens del usuario y responde `204`; el access token actual sigue vigente hasta su expiración de 15 minutos.
- [ ] La contraseña actual incorrecta responde `400` con mensaje genérico y sin revelar detalles del hash.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/java/com/cremeco/pasteleria/identity/controller/ProfileController.java` | service | 120 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/service/ProfileService.java` | service | 170 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/dto/MeResponse.java` | model | 80 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/dto/UpdateProfileRequest.java` | model | 60 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/dto/ChangePasswordRequest.java` | model | 60 |

## Casos límite (Edge Cases)
- El usuario es desactivado mientras tiene el perfil abierto: la siguiente llamada responde `401` y la app debe cerrar sesión.
- La nueva contraseña excede 72 bytes o no cumple la política: se rechaza antes de tocar la base de datos.
- Dos cambios de contraseña simultáneos: el segundo exige la contraseña actual ya cambiada o falla, sin dejar hashes inconsistentes.
- El teléfono llega vacío o con caracteres no permitidos: se valida y se devuelve `400` con el campo señalado.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] OpenAPI documenta `/auth/me`, el perfil y el cambio de contraseña con sus errores.
- [ ] Existe una prueba de que el cambio de contraseña invalida los refresh tokens previos.

---

# Ticket T35 — CRUD de usuarios (API)

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 1
- **Rama sugerida:** feature/T35-crud-usuarios-api
- **Responsable:** Nicolas
- **Prioridad:** Alta
- **Depende de:** T30, T33

## Contexto
El personal administrativo necesita gestionar cuentas sin tocar la base de datos. Cubre RF-014,
RB-008, RB-012 y EC-010. Toda operación exige el permiso `users.manage`. El título del plan se ajusta:
la pantalla de la PWA se implementa en T40.

## Convenciones aplicables
- CONV-SEG-03
- CONV-SEG-04
- CONV-ERR-02
- CONV-ERR-03
- CONV-ERR-04
- CONV-TIP-01
- CONV-TIP-02
- CONV-NAM-01
- CONV-NAM-06
- CONV-DOC-02

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** `GET /api/v1/users` paginado con búsqueda y filtros por rol y estado; `POST`, `PUT`, `PATCH /{id}/status` y `POST /{id}/reset-password`; borrado lógico; revocación de sesiones al desactivar o resetear.
- **NO:** asignar o quitar roles (T37), eliminar físicamente usuarios, editar la propia cuenta por esta vía, pantallas y envío real de correo.

## Criterios de aceptación
- [ ] El listado responde paginado, ordenado por nombre y filtrable por texto, rol y estado, sin incluir `password_hash` ni tokens.
- [ ] Crear un usuario valida email único, nombre y política de contraseña, y exige al menos un rol existente.
- [ ] Editar un usuario actualiza nombre, email y teléfono con validación de unicidad; la contraseña solo cambia por reset.
- [ ] Desactivar responde `204`, marca `is_active = false`, revoca refresh tokens y evicta la caché de permisos; el login posterior queda bloqueado.
- [ ] Resetear contraseña genera una temporal aleatoria, guarda su hash, revoca sesiones y la devuelve una sola vez en la respuesta (SUPUESTO: sin envío de correo).
- [ ] Eliminar un usuario con historial responde `409`; si no tiene historial, se aplica borrado lógico con `deleted_at` (RB-012).

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/java/com/cremeco/pasteleria/identity/controller/UserAdminController.java` | service | 170 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/service/UserAdminService.java` | service | 220 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/dto/UserCreateRequest.java` | model | 80 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/dto/UserUpdateRequest.java` | model | 70 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/dto/UserResponse.java` | model | 80 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/repository/UserSpecification.java` | util | 100 |

## Casos límite (Edge Cases)
- Un administrador intenta desactivarse a sí mismo: se rechaza con `409` para no perder la sesión de gestión.
- Se intenta desactivar al último usuario activo con permiso `roles.manage`: se rechaza con `409` (EC-010, RB-008).
- Se solicita una página fuera de rango: se devuelve una página vacía con metadatos válidos, no un error.
- Dos altas simultáneas con el mismo email: una responde `201` y la otra `409` por la restricción única.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] OpenAPI documenta paginación, filtros y códigos `400`, `401`, `403`, `404` y `409`.
- [ ] Las operaciones de escritura quedan preparadas para emitir el evento de auditoría de T38.

---

# Ticket T36 — CRUD de roles y matriz de permisos (API)

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 1
- **Rama sugerida:** feature/T36-crud-roles-permisos
- **Responsable:** Nicolas
- **Prioridad:** Alta
- **Depende de:** T30

## Contexto
El RBAC es dinámico: el administrador crea roles personalizados y decide qué permisos tiene cada uno.
Cubre RF-015, RF-016, RB-008 y EC-009. `ADMIN` y `CLIENTE` son roles de sistema: no se eliminan ni se
renombran. El permiso `roles.manage` es obligatorio para todas las operaciones.

## Convenciones aplicables
- CONV-SEG-03
- CONV-SEG-04
- CONV-ERR-02
- CONV-ERR-03
- CONV-ERR-04
- CONV-TIP-01
- CONV-TIP-02
- CONV-NAM-01
- CONV-NAM-06
- CONV-DOC-02

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** `GET/POST/PUT/DELETE /api/v1/roles`; `GET /api/v1/permissions`; `PUT /api/v1/roles/{id}/permissions`; catálogo de permisos agrupado por módulo; protección de roles de sistema; borrado lógico o bloqueo de roles asignados.
- **NO:** asignar roles a usuarios (T37), crear permisos desde la API, pantallas y auditoría persistente (T38).

## Criterios de aceptación
- [ ] El listado de roles incluye `id`, `code`, `name`, `description`, `isSystem` y cantidad de permisos y usuarios asignados.
- [ ] Crear un rol personalizado exige código y nombre únicos y permite asignar permisos existentes; un permiso inexistente responde `400`.
- [ ] Editar un rol personalizado permite cambiar nombre, descripción y permisos; el código no cambia una vez creado.
- [ ] `ADMIN` y `CLIENTE` no se pueden eliminar ni renombrar; quitar `roles.manage` o `users.manage` de `ADMIN` responde `409` para evitar el bloqueo total.
- [ ] Eliminar un rol asignado a usuarios responde `409`; un rol personalizado sin usuarios se elimina con borrado lógico (RB-008, EC-009).
- [ ] La matriz de permisos se reemplaza en una transacción y evicta la caché de todos los usuarios afectados.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/java/com/cremeco/pasteleria/identity/controller/RoleAdminController.java` | service | 150 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/service/RoleAdminService.java` | service | 220 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/controller/PermissionCatalogController.java` | service | 80 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/dto/RoleRequest.java` | model | 70 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/dto/PermissionMatrixRequest.java` | model | 60 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/dto/RoleResponse.java` | model | 80 |

## Casos límite (Edge Cases)
- Se elimina un rol mientras otro administrador lo asigna: la transacción y la restricción de integridad dejan un solo resultado consistente y el perdedor recibe `409`.
- Se intenta dejar `ADMIN` sin `roles.manage`: se bloquea, porque dejaría el sistema sin forma de administrar roles.
- Se crea un rol con nombre que difiere solo en mayúsculas de uno existente: se rechaza por unicidad case-insensitive.
- Un rol personalizado queda sin permisos: es válido, pero sus usuarios solo podrán acceder a rutas públicas y a su propio perfil.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] OpenAPI documenta el catálogo de permisos y la matriz de roles.
- [ ] Existe una prueba que demuestra que un rol de sistema no se puede eliminar ni renombrar.

---

# Ticket T37 — Asignación de roles y salvaguardas (API)

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 1
- **Rama sugerida:** feature/T37-asignacion-roles
- **Responsable:** Nicolas
- **Prioridad:** Alta
- **Depende de:** T35, T36

## Contexto
Asignar roles es la operación de mayor riesgo del sprint. Cubre RF-017, RB-008, EC-009, EC-010 y
EC-023. Un error aquí permite escalar privilegios o dejar el sistema sin administradores. Toda
asignación se valida en el backend y se audita.

## Convenciones aplicables
- CONV-SEG-03
- CONV-SEG-04
- CONV-ERR-02
- CONV-ERR-03
- CONV-ERR-04
- CONV-TIP-01
- CONV-TIP-02
- CONV-NAM-01
- CONV-NAM-06
- CONV-DOC-02

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** `PUT /api/v1/users/{id}/roles` y `DELETE /api/v1/users/{id}/roles/{roleId}`; asignación múltiple; validación de roles existentes; salvaguarda del último administrador; prevención de auto-degradación total; evicción de caché; evento de auditoría.
- **NO:** crear roles, editar permisos, eliminar usuarios, pantallas y auditoría persistente (T38).

## Criterios de aceptación
- [ ] Asignar un conjunto de roles reemplaza los roles del usuario en una transacción, valida que existan y exige al menos uno.
- [ ] Quitar el último rol que otorga `roles.manage` al último usuario activo con ese permiso responde `409` (RB-008, EC-010).
- [ ] Un administrador no puede quitarse a sí mismo el acceso que lo deja sin `roles.manage` si es el último; el intento responde `409`.
- [ ] Asignar un rol inexistente responde `404` y no modifica los roles actuales.
- [ ] Cada cambio registra actor, usuario objetivo, roles anteriores y roles nuevos, y evicta la caché de permisos del usuario.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/java/com/cremeco/pasteleria/identity/controller/UserRoleController.java` | service | 110 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/service/UserRoleService.java` | service | 200 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/service/AdminSafeguardService.java` | service | 120 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/dto/AssignRolesRequest.java` | model | 60 |

## Casos límite (Edge Cases)
- Dos administradores se degradan mutuamente al mismo tiempo: el bloqueo de la transacción permite que solo una operación deje al menos un administrador válido.
- Se asigna un rol que el usuario ya tenía: la operación es idempotente y no duplica la relación.
- Se intenta asignar roles a un usuario desactivado: responde `409` y no se modifica nada.
- El rol se elimina entre la validación y la escritura: la restricción de integridad revierte la transacción y responde `409`.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] Existe una prueba del último administrador y otra de asignación idempotente.
- [ ] El cambio deja un evento de auditoría consumible por T38.

---

# Ticket T38 — Auditoría de identidad

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 1
- **Rama sugerida:** feature/T38-auditoria-identidad
- **Responsable:** Nicolas
- **Prioridad:** Media
- **Depende de:** T36, T37

## Contexto
Los cambios de identidad deben poder investigarse. Cubre RF-018, RF-052, RB-011 y EC-009/EC-010.
La auditoría es append-only: no se edita ni se elimina desde la API. El endpoint de consulta exige
`audit.read`.

## Convenciones aplicables
- CONV-SEG-03
- CONV-SEG-04
- CONV-ERR-01
- CONV-ERR-02
- CONV-ERR-04
- CONV-TIP-01
- CONV-TIP-02
- CONV-NAM-05
- CONV-NAM-06
- CONV-DOC-01
- CONV-DOC-02

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** entidad y tabla `audit_logs` (`V12`); servicio de registro; eventos de login exitoso y fallido, cambios de usuario, rol, permisos y contraseña; `GET /api/v1/audit-logs` paginado y filtrable; edición mínima de T35, T36 y T37 para publicar eventos.
- **NO:** auditoría de pedidos, inventario o configuración (S5), edición o borrado de registros, exportación y pantalla PWA (T78).

## Criterios de aceptación
- [ ] `V12` crea `audit_logs` con `actor_id` nullable, `action`, `entity_type`, `entity_id`, `metadata` JSON, `ip_address`, `user_agent` y `created_at`, sin claves foráneas que impidan conservar el historial.
- [ ] Login exitoso y fallido generan registro; el fallido guarda el email enmascarado y nunca la contraseña ni el token.
- [ ] Crear, editar, desactivar, resetear usuarios, crear/editar/eliminar roles, cambiar permisos y asignar roles generan un registro con valores anteriores y nuevos.
- [ ] `GET /api/v1/audit-logs` responde paginado y descendente por fecha, con filtros por actor, acción, entidad y rango de fechas inclusivo.
- [ ] Un usuario sin `audit.read` recibe `403`; la consulta no permite modificar ni eliminar registros.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/java/com/cremeco/pasteleria/identity/model/AuditLog.java` | model | 140 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/repository/AuditLogRepository.java` | model | 70 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/service/AuditLogService.java` | service | 140 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/controller/AuditLogController.java` | service | 110 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/audit/AuditRecorder.java` | util | 70 |
| `backend/src/main/resources/db/migration/V12__audit_logs.sql` | model | 100 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/service/UserAdminService.java` | service | 230 |
| `backend/src/main/java/com/cremeco/pasteleria/identity/service/RoleAdminService.java` | service | 230 |

## Casos límite (Edge Cases)
- El actor fue eliminado después de la acción: el registro se conserva con `actor_id` nulo y el email o identificador histórico en `metadata`.
- Falla la escritura de auditoría en un cambio administrativo: la transacción completa se revierte para no dejar cambios sin trazabilidad.
- Falla la auditoría de un login: el login continúa y el error se registra en logs, porque la disponibilidad de autenticación prevalece (SUPUESTO).
- Se consulta un rango de fechas invertido o sin datos: se valida y se devuelve `400` o una página vacía, respectivamente.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] `V12` se aplica desde una base vacía y desde una base con datos de identidad.
- [ ] OpenAPI documenta el endpoint de auditoría y sus filtros.

---

# Ticket T39 — PWA: login, guards y menú por permisos

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 1
- **Rama sugerida:** feature/T39-pwa-auth-guards
- **Responsable:** Anais
- **Prioridad:** Alta
- **Depende de:** T27, T34

## Contexto
La PWA debe autenticarse contra la API y construir su navegación desde los permisos reales. Cubre
RF-019, EC-011 y EC-023. Ocultar un ítem no es autorización: cada ruta se protege y el backend vuelve
a validar. El access token vive en memoria y el refresh en cookie `HttpOnly`.

## Convenciones aplicables
- CONV-UI-01
- CONV-UI-02
- CONV-UI-03
- CONV-UI-04
- CONV-SEG-01
- CONV-SEG-03
- CONV-SEG-04
- CONV-TIP-01
- CONV-TIP-02
- CONV-NAM-01
- CONV-NAM-02
- CONV-DOC-01

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** `AuthProvider` de admin; login; restauración de sesión con refresh; `useAuth`; `ProtectedRoute`; guard por permiso; menú generado desde `/auth/me`; pantalla de acceso denegado; interceptor de `401` con refresh único.
- **NO:** pantallas de Usuarios y Roles (T40), autenticación del cliente (T41), service worker, offline y recuperación de contraseña.

## Criterios de aceptación
- [ ] El login contra `/api/v1/auth/login` guarda el access token solo en memoria, programa su renovación antes de los 15 minutos y no usa `localStorage` para tokens.
- [ ] Al recargar, la app intenta `/auth/refresh` con la cookie; si falla, queda como invitada y redirige a `/login`.
- [ ] Una ruta privada sin sesión redirige a `/login` conservando `returnTo`; con sesión pero sin permiso redirige a `/acceso-denegado`.
- [ ] El menú se construye desde los permisos de `/auth/me`; un ítem sin permiso no se muestra y su ruta sigue protegida por guard.
- [ ] Ante un `401`, el cliente intenta un único refresh y reintenta la solicitud; si falla, limpia la sesión y redirige al login sin bucles.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `admin/src/auth/AuthProvider.tsx` | hook | 180 |
| `admin/src/auth/useAuth.ts` | hook | 70 |
| `admin/src/components/routing/ProtectedRoute.tsx` | component | 100 |
| `admin/src/components/layout/AppMenu.tsx` | component | 140 |
| `admin/src/pages/Login.tsx` | view | 150 |
| `admin/src/pages/AccesoDenegado.tsx` | view | 80 |
| `admin/src/api/client.ts` | util | 140 |
| `admin/src/config/navigation.ts` | config | 100 |

## Casos límite (Edge Cases)
- Enlace profundo a una ruta privada con access token vencido: se refresca, se restaura la sesión y se continúa; si el refresh falla, se vuelve al login (EC-008).
- Varias solicitudes reciben `401` a la vez: comparten una sola promesa de refresh y no disparan renovaciones en paralelo.
- Un administrador cambia permisos durante la sesión: la siguiente respuesta `403` muestra acceso denegado y fuerza a recargar `/auth/me`.
- El backend no responde al iniciar: la PWA muestra error de conexión y no deja una sesión a medias.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] `npm run lint` y `npm run build` en `admin/` terminan en 0.
- [ ] La PWA no incorpora Tailwind ni estilos del cliente (RNF-001).

---

# Ticket T40 — PWA: pantallas Usuarios y Roles

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 1
- **Rama sugerida:** feature/T40-pwa-usuarios-roles
- **Responsable:** Anais
- **Prioridad:** Alta
- **Depende de:** T35, T36, T37, T38, T39

## Contexto
El administrador necesita operar el RBAC sin usar Postman. Cubre RF-014, RF-015, RF-016, RF-019 y
RNF-003. Usa Bootstrap 5 y los servicios de la API, sin Tailwind. Toda acción destructiva pide
confirmación y muestra el error real del backend.

## Convenciones aplicables
- CONV-UI-01
- CONV-UI-02
- CONV-UI-03
- CONV-UI-04
- CONV-TIP-01
- CONV-TIP-02
- CONV-NAM-01
- CONV-NAM-02
- CONV-NAM-06
- CONV-ERR-04
- CONV-SEG-03
- CONV-SEG-04

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** pantalla Usuarios con tabla paginada, búsqueda, filtros, alta, edición, activar/desactivar y reset de contraseña; pantalla Roles con CRUD y matriz de permisos por módulo; modal de asignación de roles; estados de carga, vacío y error.
- **NO:** autenticación y guards (T39), auditoría visual (T78), permisos personalizados fuera del catálogo, exportación y edición masiva.

## Criterios de aceptación
- [ ] La tabla de usuarios pagina, busca por nombre o email, filtra por rol y estado y muestra badges de activo/inactivo.
- [ ] Crear y editar usuarios usa un formulario Bootstrap validado; desactivar y resetear piden confirmación y muestran la contraseña temporal una sola vez.
- [ ] La pantalla de roles lista roles de sistema y personalizados, permite crear y editar los personalizados y muestra la matriz de permisos agrupada por módulo.
- [ ] La matriz guarda solo los cambios y refleja errores `409` de salvaguarda sin perder la selección del usuario.
- [ ] El modal de asignación de roles muestra los roles disponibles y presenta el mensaje del backend cuando se intenta dejar el sistema sin administrador.
- [ ] Cada vista contempla carga, vacío, error y datos; las acciones están etiquetadas y son navegables por teclado.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `admin/src/pages/Usuarios.tsx` | view | 240 |
| `admin/src/pages/Roles.tsx` | view | 260 |
| `admin/src/components/users/UserFormModal.tsx` | component | 170 |
| `admin/src/components/roles/PermissionMatrix.tsx` | component | 170 |
| `admin/src/components/roles/RoleAssignmentModal.tsx` | component | 140 |
| `admin/src/api/users.api.ts` | util | 110 |
| `admin/src/api/roles.api.ts` | util | 110 |

## Casos límite (Edge Cases)
- El backend rechaza quitar el último administrador: el modal muestra el mensaje y mantiene los roles previos seleccionados (EC-010).
- Otro administrador editó el mismo rol: al guardar se recibe `409` y se ofrece recargar sin sobrescribir cambios ajenos.
- La búsqueda no tiene resultados: se muestra estado vacío con opción de limpiar filtros, no una tabla en blanco.
- Se navega fuera de la matriz con cambios sin guardar: se advierte antes de descartar.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] `npm run lint` y `npm run build` en `admin/` terminan en 0.
- [ ] Las pantallas usan Bootstrap 5 y no importan Tailwind ni componentes del cliente.

---

# Ticket T41 — Cliente React: autenticación real y guards

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 1
- **Rama sugerida:** feature/T41-cliente-auth-real
- **Responsable:** Anais
- **Prioridad:** Alta
- **Depende de:** T34, T39

## Contexto
El cliente usa hoy una sesión simulada en `localStorage`. Cubre RF-020, RF-013, RF-056 y EC-008,
EC-020, EC-023. Debe reemplazarse por la API real sin romper carrito ni navegación. El cliente solo
presenta y valida UX; el backend decide permisos y estado de la cuenta.

## Convenciones aplicables
- CONV-UI-01
- CONV-UI-02
- CONV-UI-03
- CONV-SEG-01
- CONV-SEG-03
- CONV-SEG-04
- CONV-TIP-01
- CONV-TIP-02
- CONV-NAM-01
- CONV-NAM-02
- CONV-ERR-02
- CONV-ERR-04
- CONV-DOC-01

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** reemplazo del `AuthProvider` simulado; login y registro contra la API; logout; refresh silencioso; guards de `/perfil` y `/checkout`; manejo central de `401`; persistencia del carrito; eliminación de la sesión falsa.
- **NO:** guards de confirmación de pedido e historial (S3), recuperación de contraseña, verificación de email y rediseño visual de las páginas.

## Criterios de aceptación
- [ ] `AuthProvider` usa `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/logout` y `/auth/me`; deja de usar la sesión simulada de `cremeco-sesion`.
- [ ] Un registro exitoso crea la cuenta y deja al cliente autenticado o lo envía al login con el email precargado (SUPUESTO: autologin).
- [ ] `/perfil` y `/checkout` exigen sesión; sin sesión redirigen al login y, al autenticarse, vuelven a la ruta solicitada.
- [ ] Logout revoca el refresh, limpia el estado y mantiene el carrito intacto.
- [ ] Un `401` dispara un único refresh y reintenta una vez; si falla, cierra sesión y muestra "Tu sesión expiró" sin perder el carrito (EC-008, EC-020).

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `frontend/src/context/AuthProvider.tsx` | hook | 180 |
| `frontend/src/context/auth.ts` | hook | 90 |
| `frontend/src/lib/api.ts` | util | 150 |
| `frontend/src/components/auth/RequireAuth.tsx` | component | 90 |
| `frontend/src/components/domain/ModalLogin.tsx` | component | 140 |
| `frontend/src/components/domain/ModalRegistro.tsx` | component | 140 |

## Casos límite (Edge Cases)
- El token expira durante el checkout: el refresh conserva el formulario y reintenta; si falla, se muestra sesión expirada sin borrar el carrito.
- El usuario cierra sesión en otra pestaña: la siguiente solicitud recibe `401`, limpia el estado local y pide login.
- El backend está caído al iniciar: la tienda sigue usable como invitada y muestra error solo al intentar autenticarse.
- Llega un `403` por cambio de permisos o cuenta desactivada: se muestra el mensaje del backend y no se reintenta en bucle.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] `npm run lint` y `npm run build` en `frontend/` terminan en 0.
- [ ] No queda ninguna referencia funcional a la sesión simulada ni tokens en `localStorage`.

---

# Ticket T42 — Pruebas de seguridad y matriz de permisos

## Metadatos
- **Tipo:** test
- **Fase / Sprint:** F3 · Sprint 1
- **Rama sugerida:** feature/T42-pruebas-seguridad
- **Responsable:** Nicolas
- **Prioridad:** Alta
- **Depende de:** T30, T31, T32, T33, T34, T35, T36, T37, T38

## Contexto
El RBAC debe demostrarse con pruebas, no con inspección visual. Cubre RF-064, RF-068 y EC-008,
EC-010, EC-011 y EC-023. La suite valida autenticación, autorización, escalada, salvaguardas, roles
dinámicos y CORS; será la evidencia de salida del sprint.

## Convenciones aplicables
- CONV-SEG-03
- CONV-SEG-04
- CONV-ERR-04
- CONV-TIP-01
- CONV-TIP-02
- CONV-DOC-01
- CONV-DOC-02

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** pruebas de integración con MySQL 8 en Testcontainers; login válido e inválido; token expirado, ausente y manipulado; `403` por permiso; escalada de rol; último administrador; roles dinámicos; rotación y reutilización de refresh; CORS; fixtures y documento de matriz endpoint-permiso.
- **NO:** pruebas E2E de navegador (T84), pruebas de carga, rate limiting (T83) y pruebas de módulos fuera de identidad.

## Criterios de aceptación
- [ ] La suite cubre login válido, credenciales inválidas, token ausente, token expirado y token con firma manipulada, con los códigos `200` o `401` esperados.
- [ ] Existe una matriz documentada endpoint-permiso y una prueba que recorre cada fila: con permiso responde `2xx` o `4xx` de negocio, sin permiso responde `403`.
- [ ] Enviar `role: ADMIN` en el registro o intentar asignarse roles sin `users.manage` no escala privilegios (EC-023).
- [ ] Quitar el último usuario con `roles.manage`, eliminar el rol `ADMIN` o eliminar un rol asignado responde `409` y no altera la base (EC-010, RB-008).
- [ ] Cambiar los permisos de un rol personalizado se refleja en la siguiente solicitud sin reiniciar la API, gracias a la evicción de caché.
- [ ] El preflight CORS acepta solo los orígenes `5173` y `5174`; un origen desconocido no recibe cabeceras de permiso.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/test/java/com/cremeco/pasteleria/identity/AuthSecurityIT.java` | test | 220 |
| `backend/src/test/java/com/cremeco/pasteleria/identity/RbacMatrixIT.java` | test | 240 |
| `backend/src/test/java/com/cremeco/pasteleria/identity/AdminSafeguardsIT.java` | test | 200 |
| `backend/src/test/java/com/cremeco/pasteleria/identity/CorsIT.java` | test | 110 |
| `backend/src/test/resources/application-test.yml` | config | 70 |
| `backend/src/test/resources/fixtures/identity-test-data.sql` | model | 100 |

## Casos límite (Edge Cases)
- Token que expira justo en el límite: la prueba usa un reloj controlado para evitar fallos intermitentes por milisegundos.
- Dos refrescos concurrentes con el mismo token: una prueba dedicada verifica que solo uno gane y que la cadena no quede reutilizable.
- Las pruebas comparten contenedor de MySQL: cada clase limpia y recrea sus datos para no depender del orden de ejecución.
- Un test de CORS con credenciales desde un origen no permitido no debe recibir `Access-Control-Allow-Origin` comodín.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] `mvnw test` ejecuta la suite completa en verde y la evidencia queda adjunta al ticket.
- [ ] La matriz endpoint-permiso se guarda en la documentación del sprint.

---

# Checklist de cierre del sprint

- [ ] T30 — Modelo de usuarios, roles y permisos aprobado.
- [ ] T31 — Registro público de clientes aprobado.
- [ ] T32 — Login con JWT, refresh y logout aprobado.
- [ ] T33 — SecurityConfig, filtro JWT y authorities aprobado.
- [ ] T34 — `/auth/me`, perfil y cambio de contraseña aprobado.
- [ ] T35 — CRUD de usuarios (API) aprobado.
- [ ] T36 — CRUD de roles y matriz de permisos (API) aprobado.
- [ ] T37 — Asignación de roles y salvaguardas (API) aprobado.
- [ ] T38 — Auditoría de identidad aprobado.
- [ ] T39 — PWA: login, guards y menú por permisos aprobado.
- [ ] T40 — PWA: pantallas Usuarios y Roles aprobado.
- [ ] T41 — Cliente React: autenticación real y guards aprobado.
- [ ] T42 — Pruebas de seguridad y matriz de permisos aprobado.
- [ ] `mvnw test` en verde, incluyendo pruebas de integración con MySQL 8.
- [ ] `npm run lint` y `npm run build` en 0 en `frontend/` y `admin/`.
- [ ] OpenAPI actualizado y tipos TypeScript regenerados sin errores.
- [ ] Flyway aplica `V10`, `V11` y `V12` desde una base vacía.
- [ ] Ningún secreto, token o contraseña en código, logs o repositorio (CONV-SEG-01, CONV-SEG-02).
- [ ] La matriz endpoint-permiso queda documentada y enlazada desde `docs/estado_proyecto.md`.
- [ ] No quedan referencias a la sesión simulada del cliente ni tokens en `localStorage`.
- [ ] `docs/estado_proyecto.md` y `docs/cicatrices_guerra.md` actualizados.
- [ ] Commits propuestos por ticket; la IA no ejecutó ninguno.

## Criterios de salida

1. Un cliente puede registrarse y luego iniciar sesión contra la API real.
2. El login entrega access token de 15 minutos y refresh rotativo de 7 días; el logout revoca la sesión.
3. La PWA y el cliente React restauran la sesión sin guardar tokens en `localStorage`.
4. El menú de la PWA se genera desde permisos reales y una ruta sin permiso muestra acceso denegado.
5. El administrador puede crear roles, editar la matriz de permisos y asignar roles con salvaguardas activas.
6. Un usuario sin permiso recibe `403` del backend aunque conozca la URL (EC-011).
7. El último usuario con `roles.manage` y los roles de sistema están protegidos (RB-008).
8. Los cambios de identidad quedan auditados y consultables con `audit.read`.
9. La suite de T42 demuestra autenticación, autorización, escalada, último administrador, roles dinámicos y CORS.
10. `docs/estado_proyecto.md` refleja el cierre del sprint y el siguiente ticket habilitado (T43).
