<!-- @pca:start
@id(docs.tickets.sprint0)
@kind(doc)
@limit(lines: 900)
@relates(docs.tickets.readme, docs.plan_sprints, docs.backlog_requisitos, docs.convenciones)
@desc(Tickets del Sprint 0: fundaciones del monorepo, MySQL, Spring Boot, OpenAPI, PWA admin y pruebas)
@pca:end -->

# Sprint 0 — Fundaciones (T21–T29)

> **Fase:** F3 — Ejecución por tickets · **Sprint:** S0 · **Estado:** Pendiente de aprobación
> **Épica:** E01 Fundaciones (`RF-001` a `RF-009`)
> **Plantilla:** [`docs/plantilla_ticket.md`](../plantilla_ticket.md) · **Plan:** [`docs/plan_sprints.md`](../plan_sprints.md) · **Backlog:** [`docs/backlog_requisitos.md`](../backlog_requisitos.md)

---

## Propósito

Dejar el proyecto listo para construir funcionalidad sin volver a tocar los cimientos: monorepo
ordenado, MySQL 8 reproducible con Docker Compose, API Spring Boot con perfiles y CORS, migraciones
Flyway versionadas, contrato OpenAPI convertido en tipos TypeScript compartidos, una plantilla de
módulo backend con errores RFC 7807, la PWA de administración con su shell visual, pruebas
automatizadas en ambos lados y la documentación viva sincronizada.

Al terminar el sprint debe ser posible ejecutar `docker compose up`, levantar la API con
`./mvnw spring-boot:run`, ver `/actuator/health` en `UP`, consultar `/v3/api-docs`, compilar la
PWA de admin y correr las pruebas de backend y frontend con un solo comando cada una.

**Regla de oro del sprint:** ningún ticket de S0 implementa lógica de negocio. Solo andamiaje,
configuración, contrato y documentación.

---

## Índice de tickets

| ID | Título | Tipo | Responsable | Prioridad | Depende de |
| :--- | :--- | :--- | :--- | :--- | :--- |
| T21 | Estructura del monorepo y documentación base | chore | Matias | Alta | — |
| T22 | MySQL 8 con Docker Compose | chore | Nicolas | Alta | T21 |
| T23 | Esqueleto Spring Boot, perfiles y CORS | feat | Matias | Alta | T21, T22 |
| T24 | Flyway baseline y reglas de migración | feat | Matias | Alta | T23 |
| T25 | OpenAPI y tipos TypeScript compartidos | feat | Matias | Alta | T23 |
| T26 | Plantilla de módulo backend y errores RFC 7807 | feat | Matias | Alta | T23 |
| T27 | PWA admin: Vite, React, Bootstrap y shell | feat | Anais | Alta | T21 |
| T28 | Configuración de pruebas backend y frontend | test | Nicolas | Alta | T23, T27 |
| T29 | Manifiesto PCA, README y docs de estado | docs | Anais | Media | T21–T28 |

## Orden de ejecución y paralelización

```text
T21 → T22 → T23 → T24
                ↘ T25
                ↘ T26
T21 → T27 ──────────────→ T28 → T29
```

- **Secuencial obligatorio:** T21 → T22 → T23 (ruta crítica del sprint).
- **Paralelo permitido:** T24, T25, T26 y T27 una vez cerrados T23 (para los tres primeros) y T21 (para T27).
- **Archivos compartidos:** `backend/pom.xml` lo crea T23 y lo amplía T28 de forma aditiva; `README.md` lo crea T21 y lo cierra T29. No hay dos tickets del sprint escribiendo el mismo archivo al mismo tiempo.

## Puertos y stack de referencia

| Componente | Ruta | Puerto | Stack |
| :--- | :--- | :--- | :--- |
| Tienda cliente | `frontend/` | 5173 | React 18 + TS + Vite + Tailwind v4 |
| PWA administración | `admin/` | 5174 | React 18 + TS + Vite + Bootstrap 5 (sin Tailwind) |
| API | `backend/` | 8080 | Spring Boot 3.5 + Java 21 + Maven Wrapper + JPA + Security + Flyway + MySQL 8 + springdoc |
| Base de datos | `infra/docker-compose.yml` | 3306 | MySQL 8 |
| Tipos compartidos | `shared/` | — | TypeScript generado desde OpenAPI |

---

# Ticket T21 — Estructura del monorepo y documentación base

## Metadatos

- **Tipo:** chore
- **Fase / Sprint:** F3 · Sprint 0
- **Rama sugerida:** `feature/T21-estructura-monorepo`
- **Responsable:** Matias
- **Prioridad:** Alta
- **Depende de:** — (ninguno; es el primer ticket del proyecto)

## Contexto

El repositorio hoy solo contiene `frontend/`, `docs/`, `tools/`, `prompts/`, `guias/` y el material
de referencia. El requisito `RF-001` exige un monorepo con `frontend/`, `admin/`, `backend/`,
`infra/`, `shared/` y `docs/`, y `RNF-007` exige que el entorno local se levante con pocos comandos
documentados. Antes de escribir cualquier configuración hay que fijar el esqueleto de carpetas, el
`.gitignore` raíz y el documento de arranque local, para que T22, T23 y T27 tengan un lugar donde
trabajar sin pisarse.

## Convenciones aplicables

- `CONV-EST-01`
- `CONV-EST-02`
- `CONV-EST-03`
- `CONV-DOC-04`
- `CONV-SEG-02`
- `CONV-GEN-03`

## Alcance (Qué SÍ / Qué NO)

- **SÍ:** crear las carpetas `backend/`, `admin/`, `infra/` y `shared/` con un `README.md` breve
  cada una que declare su propósito y su puerto (cuando aplique); escribir el `README.md` raíz con
  el mapa del monorepo; reescribir el `.gitignore` raíz para Java/Maven, Node y entorno; crear
  `docs/arranque-local.md` con los comandos previstos y la tabla de puertos.
- **NO:** crear `pom.xml`, `package.json`, `docker-compose.yml`, código Java, componentes React ni
  scripts ejecutables. Tampoco se mueve, renombra ni modifica nada dentro de `frontend/`,
  `MockUpPasteleria/`, `ParaEstudiar/`, `guias/`, `prompts/` ni `tools/`.

## Criterios de aceptación

- [ ] La raíz del repositorio contiene las carpetas `backend/`, `admin/`, `infra/`, `shared/`, `frontend/` y `docs/`, y cada una de las cuatro nuevas tiene un `README.md` con propósito y responsable de su primer ticket.
- [ ] El `.gitignore` raíz cubre `target/`, `*.class`, `node_modules/`, `dist/`, `build/`, `.env`, `.env.local`, `.env.*.local`, `.idea/`, `.vscode/`, `*.log` y `Thumbs.db`, y mantiene versionables los `.env.example`.
- [ ] `git check-ignore -v backend/target/classes/app.class backend/.env admin/node_modules/x` devuelve una regla para cada ruta, y `git check-ignore -v infra/.env.example` no devuelve nada.
- [ ] `docs/arranque-local.md` lista los puertos 5173, 5174, 8080 y 3306 y los comandos previstos por componente, marcando explícitamente como "pendiente" los que dependen de T22, T23 y T27.
- [ ] No se agrega ningún archivo de código ni de build en esta rama: `git status --short` no muestra archivos `.java`, `pom.xml`, `package.json` ni `docker-compose.yml`.

## Archivos afectados (previstos)

| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `README.md` | doc | 150 |
| `.gitignore` | config | 80 |
| `docs/arranque-local.md` | doc | 130 |
| `backend/README.md` | doc | 40 |
| `admin/README.md` | doc | 40 |
| `infra/README.md` | doc | 40 |
| `shared/README.md` | doc | 40 |

## Casos límite (Edge Cases)

- La carpeta `admin/` (o `backend/`) ya existe localmente con archivos sin versionar de una prueba
  anterior: detenerse, revisar `git status` y preguntar antes de reutilizar o vaciar contenido.
- Un patrón demasiado amplio en `.gitignore` (por ejemplo `*.yml` o `*.md`) oculta `application.yml`,
  `docker-compose.yml` o documentación: revisar con `git check-ignore` antes de cerrar el ticket.
- Diferencias de shell entre Windows (PowerShell) y Linux/macOS: los comandos se documentan en ambos
  formatos dentro del mismo documento; no se crean scripts propios de arranque en este ticket.

## Definition of Done

- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación): no aplica suite automática, se valida con `git check-ignore` y revisión de árbol.
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`): `chore(repo): crear estructura base del monorepo`.

---

# Ticket T22 — MySQL 8 con Docker Compose

## Metadatos

- **Tipo:** chore
- **Fase / Sprint:** F3 · Sprint 0
- **Rama sugerida:** `feature/T22-mysql-docker-compose`
- **Responsable:** Nicolas
- **Prioridad:** Alta
- **Depende de:** T21

## Contexto

`RF-002` exige que MySQL 8 se levante con Docker Compose, con volumen persistente, healthcheck y
variables de entorno. Es la base de datos de desarrollo de todo el proyecto y la dependencia dura de
T23 (la API no puede arrancar sin un destino válido). Se necesita un servicio reproducible,
con charset `utf8mb4`, puerto 3306 y sin credenciales versionadas (`CONV-SEG-01`, `CONV-SEG-02`).

## Convenciones aplicables

- `CONV-SEG-01`
- `CONV-SEG-02`
- `CONV-SEG-03`
- `CONV-EST-03`
- `CONV-NAM-05`
- `CONV-GEN-05`

## Alcance (Qué SÍ / Qué NO)

- **SÍ:** crear `infra/docker-compose.yml` con el servicio `mysql` (`mysql:8.0`), volumen nombrado,
  healthcheck con `mysqladmin ping`, puerto `3306:3306` configurable y variables leídas de `.env`;
  `infra/.env.example` con claves y valores de ejemplo; `infra/mysql/conf.d/charset.cnf` con
  `character-set-server=utf8mb4` y collation `utf8mb4_0900_ai_ci`; `infra/README.md` con los
  comandos de arranque, parada, reseteo y verificación.
- **NO:** crear esquema, tablas ni datos semilla (eso es T24/T30). No se conecta la API todavía
  (T23). No se agrega phpMyAdmin ni Adminer salvo que se solicite.

## Criterios de aceptación

- [ ] `docker compose -f infra/docker-compose.yml up -d` deja el contenedor de MySQL en estado `healthy`; `docker compose -f infra/docker-compose.yml ps` lo muestra con el healthcheck en verde.
- [ ] `SHOW VARIABLES LIKE 'character_set_server'` y `SHOW VARIABLES LIKE 'collation_server'` dentro del contenedor devuelven `utf8mb4` y `utf8mb4_0900_ai_ci`.
- [ ] La base de datos `cremeco` existe tras el primer arranque (`MYSQL_DATABASE`) y el usuario definido en `.env` puede conectarse a ella.
- [ ] Persistencia verificada: `docker compose down` sin `-v` seguido de `up -d` conserva una tabla creada manualmente de prueba.
- [ ] `infra/.env.example` está versionado con valores de ejemplo y `infra/.env` está ignorado: `git check-ignore -v infra/.env` devuelve una regla y `git check-ignore -v infra/.env.example` no devuelve nada.
- [ ] Ningún archivo versionado contiene una contraseña real: la búsqueda de la contraseña de ejemplo en `infra/` solo aparece en `.env.example` y en el `README` como marcador.

## Archivos afectados (previstos)

| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `infra/docker-compose.yml` | config | 90 |
| `infra/.env.example` | config | 25 |
| `infra/mysql/conf.d/charset.cnf` | config | 20 |
| `infra/README.md` | doc | 80 |

## Casos límite (Edge Cases)

- **Puerto 3306 ocupado** por un MySQL local u otro contenedor: el arranque falla con
  `port is already allocated`. El documento debe indicar cómo cambiar solo el puerto del host
  (`DB_PORT`) sin tocar el puerto interno ni los valores por defecto de la API.
- **Volumen ya inicializado con credenciales antiguas:** `MYSQL_PASSWORD` no se reaplica cuando el
  volumen existe. El `README` debe explicar que `docker compose down -v` borra los datos y que es
  una operación destructiva (advertencia explícita, nunca sugerida como primer paso).
- **Zona horaria:** el contenedor arranca en UTC por defecto, mientras `RNF-009` fija
  `America/Santiago`. Se documenta y se fija `TZ=America/Santiago`; la API no debe asumir la hora
  del motor.
- **`docker compose` v1 (`docker-compose`)** todavía instalado en algún equipo: se documenta el
  comando v2 como oficial y no se usa la clave `version:` (obsoleta).

## Definition of Done

- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación): arranque limpio y reinicio con volumen, evidencia en el ticket.
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`): `chore(infra): agregar MySQL 8 con docker compose`.

---

# Ticket T23 — Esqueleto Spring Boot, perfiles y CORS

## Metadatos

- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 0
- **Rama sugerida:** `feature/T23-esqueleto-spring-boot`
- **Responsable:** Matias
- **Prioridad:** Alta
- **Depende de:** T21, T22

## Contexto

`RF-003` exige que Spring Boot arranque con perfiles `dev`/`prod`, Actuator, CORS y OpenAPI. Es el
punto de partida de todo el backend y el archivo `application.yml` que el resto de los tickets
extiende. La API debe escuchar en 8080 y aceptar los orígenes de la tienda cliente (5173) y de la
PWA de administración (5174), sin abrir la puerta a orígenes arbitrarios.

## Convenciones aplicables

- `CONV-GEN-01`
- `CONV-GEN-05`
- `CONV-EST-01`
- `CONV-EST-03`
- `CONV-SEG-01`
- `CONV-ERR-01`
- `CONV-DOC-02`

## Alcance (Qué SÍ / Qué NO)

- **SÍ:** `backend/pom.xml` con Spring Web, Validation, Data JPA, Security, Actuator, Flyway,
  conector MySQL y `springdoc-openapi-starter-webmvc-ui`; Maven Wrapper (`mvnw`, `mvnw.cmd`,
  `.mvn/wrapper/maven-wrapper.properties`); clase principal
  `com.cremeco.pasteleria.PasteleriaApplication`; `application.yml` con puerto, datasource por
  variables de entorno, perfiles `dev`/`prod`, Actuator y springdoc; `WebCorsConfig` con la lista
  explícita de orígenes; paquete base y estructura de carpetas vacía por capas.
- **NO:** endpoints de negocio, entidades JPA, migraciones (T24), contrato OpenAPI definitivo (T25),
  autenticación (S1). No se configura `SecurityConfig` con reglas todavía: solo se deja la
  dependencia declarada.

## Criterios de aceptación

- [ ] `./mvnw -q -DskipTests package` compila el proyecto con Java 21 y genera el jar sin errores ni advertencias de versión de Java.
- [ ] `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev` arranca en el puerto 8080 y `GET /actuator/health` responde 200 con `{"status":"UP"}`.
- [ ] La petición preflight `OPTIONS /api/ping` con `Origin: http://localhost:5173` devuelve `Access-Control-Allow-Origin: http://localhost:5173`; con `Origin: http://localhost:5174` también; con `Origin: http://localhost:9999` no devuelve la cabecera.
- [ ] El perfil `prod` expone solo `health` e `info` en Actuator (los demás endpoints quedan deshabilitados) y no muestra detalles de salud.
- [ ] Ningún `application*.yml` contiene credenciales literales: todos los valores sensibles se resuelven con `${DB_HOST}`, `${DB_PORT}`, `${DB_NAME}`, `${DB_USER}`, `${DB_PASSWORD}` desde variables de entorno.
- [ ] `springdoc-openapi-starter-webmvc-ui` está declarado en `pom.xml` y `GET /v3/api-docs` responde 200 en el perfil `dev`.
- [ ] El paquete base es `com.cremeco.pasteleria` y existe al menos una carpeta por capa (`api`, `domain`, `infrastructure`, `config`) con su `package-info.java` o README.

## Archivos afectados (previstos)

| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/pom.xml` | config | 220 |
| `backend/src/main/resources/application.yml` | config | 100 |
| `backend/src/main/resources/application-dev.yml` | config | 50 |
| `backend/src/main/resources/application-prod.yml` | config | 50 |
| `backend/src/main/java/com/cremeco/pasteleria/PasteleriaApplication.java` | component | 40 |
| `backend/src/main/java/com/cremeco/pasteleria/config/WebCorsConfig.java` | config | 70 |
| `backend/.mvn/wrapper/maven-wrapper.properties` | config | 10 |

## Casos límite (Edge Cases)

- **MySQL no disponible al arrancar (`EC-025`):** el arranque debe fallar con un mensaje que
  identifique host, puerto y base de datos, sin imprimir usuario ni contraseña; el `README` de
  `backend/` indica el comando para levantar `infra/` primero.
- **Puerto 8080 ocupado:** el puerto se puede sobrescribir con `SERVER_PORT`; el arranque falla con
  un mensaje claro y no queda un proceso zombi escuchando.
- **CORS con credenciales:** nunca se combina `allowedOrigins("*")` con `allowCredentials(true)`.
  Si en el futuro se envían cookies o `Authorization` desde otro origen, se agrega ese origen a la
  lista explícita y se documenta.
- **Perfil inexistente** (`--spring.profiles.active=staging`): la aplicación no debe asumir
  configuración de desarrollo por accidente; se documenta que los perfiles válidos son `dev` y
  `prod`, y que el perfil por defecto es `dev` solo en local.

## Definition of Done

- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación): `./mvnw test` (aunque la suite real llegue en T28) y verificación manual de health, CORS y `/v3/api-docs`.
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`): `feat(backend): crear esqueleto spring boot con perfiles y cors`.

---

# Ticket T24 — Flyway baseline y reglas de migración

## Metadatos

- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 0
- **Rama sugerida:** `feature/T24-flyway-baseline`
- **Responsable:** Matias
- **Prioridad:** Alta
- **Depende de:** T23

## Contexto

`RF-004` exige que Flyway versione el esquema y los datos semilla. Sin una baseline y sin reglas
escritas, el primer módulo de negocio (T30) inventará su propio criterio de migración y aparecerán
conflictos de numeración. Este ticket fija la convención, la primera migración y el documento
`docs/reglas_backend.md` que rige a todos los módulos posteriores (capas, validación, errores,
dinero, fechas y migraciones).

## Convenciones aplicables

- `CONV-NAM-05`
- `CONV-DOC-01`
- `CONV-DOC-03`
- `CONV-GEN-05`
- `CONV-EST-01`
- `CONV-SEG-03`

## Alcance (Qué SÍ / Qué NO)

- **SÍ:** `V1__baseline.sql` que crea una tabla mínima de control (`app_metadata`) con charset
  `utf8mb4` y collation explícita; `db/migration/README.md` con la convención de nombres
  (`V<n>__<descripcion_snake_case>.sql`), la regla de una migración por ticket y la prohibición de
  editar migraciones aplicadas; `docs/reglas_backend.md` con capas, validación de entrada, formato
  de error, manejo de dinero (CLP entero), fechas y migraciones.
- **NO:** tablas de usuarios, roles, catálogo o pedidos (S1 en adelante). No se tocan datos semilla
  de negocio. No se reescribe `application.yml` (propiedad de T23): aquí solo se verifica que la
  configuración de Flyway exista y, si requiere ajuste, se coordina con el dueño del archivo.

## Criterios de aceptación

- [ ] Al arrancar la API en `dev` contra la base de `infra/`, Flyway aplica `V1` y `flyway_schema_history` contiene una fila con `version = 1` y `success = 1`.
- [ ] Un segundo arranque no reaplica la migración ni falla por checksum: el log de Flyway indica el esquema actualizado y `flyway_schema_history` sigue con una sola fila de la versión 1.
- [ ] `V1__baseline.sql` solo crea `app_metadata` (clave, valor, `created_at`, `updated_at`) con `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`, sin tablas de negocio.
- [ ] `docs/reglas_backend.md` documenta como mínimo: separación `api` / `domain` / `infrastructure`, validación con Bean Validation en el borde, formato de error RFC 7807 (referencia a T26), dinero en CLP entero (sin decimales ni `double`), fechas en `America/Santiago` serializadas en ISO-8601 y reglas de migración.
- [ ] La regla de numeración dice explícitamente que cada ticket reserva un número único y que una migración aplicada nunca se edita.
- [ ] `db/migration/README.md` y `docs/reglas_backend.md` están anotados con su bloque PCA y registrados en el manifiesto cuando corresponda.

## Archivos afectados (previstos)

| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/resources/db/migration/V1__baseline.sql` | model | 60 |
| `backend/src/main/resources/db/migration/README.md` | doc | 90 |
| `docs/reglas_backend.md` | doc | 260 |
| `backend/src/test/java/com/cremeco/pasteleria/migration/FlywayBaselineTest.java` | component | 70 |

## Casos límite (Edge Cases)

- **Migración ya aplicada modificada:** Flyway detecta checksum distinto y aborta el arranque. La
  regla es crear `V<n+1>__correccion_<detalle>.sql`; el documento explica cómo leer el error y por
  qué no se usa `flyway repair` en local sin revisar antes la causa.
- **Base de datos con esquema preexistente creado a mano:** `baseline-on-migrate` y
  `baseline-version` deben estar decididos y documentados; el ticket deja explícito si aplica y con
  qué versión, para no marcar como migrado un esquema incompleto.
- **Lock de Flyway tras un corte:** el documento indica cómo verificar `flyway_schema_history` y
  que el lock se libera solo en local, nunca en un entorno con datos reales.
- **Charset distinto en un dump externo:** `V1` declara charset y collation en cada `CREATE TABLE`
  para no heredar el default del servidor.

## Definition of Done

- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación): prueba de migración contra MySQL de Testcontainers o contra `infra/`, con evidencia del historial.
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`): `feat(backend): agregar baseline flyway y reglas de migracion`.

---

# Ticket T25 — OpenAPI y tipos TypeScript compartidos

## Metadatos

- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 0
- **Rama sugerida:** `feature/T25-openapi-tipos-compartidos`
- **Responsable:** Matias
- **Prioridad:** Alta
- **Depende de:** T23

## Contexto

`RF-005` exige que el contrato OpenAPI genere tipos TypeScript para las dos apps. Sin este paso, el
cliente y la PWA inventarían sus propios tipos y se desincronizarían del backend, que es la fuente de
verdad. Este ticket deja publicado `/v3/api-docs`, documenta Swagger UI y automatiza la generación de
`shared/api-types.ts`, que ambas apps consumirán en los sprints siguientes.

## Convenciones aplicables

- `CONV-TIP-01`
- `CONV-TIP-02`
- `CONV-DOC-02`
- `CONV-GEN-05`
- `CONV-ERR-04`
- `CONV-NAM-04`

## Alcance (Qué SÍ / Qué NO)

- **SÍ:** `OpenApiConfig` con metadatos del contrato (título, versión, descripción, servidor local
  8080); script `generate:api-types` en `shared/package.json` que convierte `/v3/api-docs` en
  `shared/api-types.ts`; `shared/README.md` con el comando y la política de regeneración;
  `docs/contrato-openapi.md` con la regla de versionado del contrato.
- **NO:** endpoints de negocio ni DTOs definitivos (llegan con cada módulo). No se escriben tipos a
  mano: `shared/api-types.ts` es generado. No se agrega un cliente HTTP todavía (eso es de S1/S2).

## Criterios de aceptación

- [ ] `GET /v3/api-docs` responde 200 con un JSON válido cuyo campo `openapi` empieza con `3.` y cuyos `info.title`, `info.version` y `info.description` coinciden con los declarados en `OpenApiConfig`.
- [ ] `GET /swagger-ui/index.html` responde 200 en el perfil `dev`; en `prod` se deshabilita y la ruta devuelve 404.
- [ ] `npm --prefix shared run generate:api-types` con la API levantada regenera `shared/api-types.ts` y `npx tsc --noEmit --strict shared/api-types.ts` termina sin errores.
- [ ] El archivo generado no contiene la palabra `any` y su cabecera indica la versión del contrato y el comando que lo regenera.
- [ ] Si la API no está disponible, el script termina con código distinto de cero, muestra un mensaje que indica el puerto esperado y no deja `shared/api-types.ts` truncado ni vacío.
- [ ] `docs/contrato-openapi.md` establece que un cambio de endpoint o DTO sube `info.version` y se regenera en el mismo ticket, y que el archivo generado nunca se edita a mano.

## Archivos afectados (previstos)

| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/java/com/cremeco/pasteleria/config/OpenApiConfig.java` | config | 60 |
| `shared/package.json` | config | 40 |
| `shared/api-types.ts` | model | 300 |
| `shared/README.md` | doc | 70 |
| `docs/contrato-openapi.md` | doc | 100 |

## Casos límite (Edge Cases)

- **API apagada al generar tipos:** el script no debe escribir un archivo parcial. Escribe en un
  temporal y mueve solo si la generación fue exitosa; si falla, deja el archivo anterior intacto.
- **Esquemas con nombres genéricos** (`Error`, `Response`) que colisionan entre módulos: se
  prefijan en el backend (`ApiError`, `SampleResponse`), nunca se parchean a mano en el generado.
- **Enums y `oneOf`** que el generador puede mapear a uniones amplias o a `unknown`: el ticket
  incluye una revisión manual del resultado y documenta el criterio en `docs/contrato-openapi.md`.
- **Diferencias de salto de línea** entre Windows y Linux que ensucian el diff del archivo
  generado: SUPUESTO: `shared/**` se fija a LF mediante `.gitattributes` en el mismo commit.

## Definition of Done

- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación): generación reproducible dos veces seguidas con diff vacío la segunda vez.
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`): `feat(api): publicar openapi y generar tipos compartidos`.

---

# Ticket T26 — Plantilla de módulo backend y errores RFC 7807

## Metadatos

- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 0
- **Rama sugerida:** `feature/T26-plantilla-modulo-errores`
- **Responsable:** Matias
- **Prioridad:** Alta
- **Depende de:** T23

## Contexto

`RF-006` exige un formato único de error y una plantilla de módulo. Sin esto, cada módulo de S1 en
adelante inventaría su estructura de paquetes, sus DTOs y su forma de responder errores, y el
frontend tendría que adaptarse a cada variante. Este ticket crea la plantilla y la prueba con un
módulo de ejemplo mínimo.

## Convenciones aplicables

- `CONV-ERR-01`
- `CONV-ERR-02`
- `CONV-ERR-03`
- `CONV-ERR-04`
- `CONV-TIP-02`
- `CONV-EST-02`
- `CONV-DOC-02`

## Alcance (Qué SÍ / Qué NO)

- **SÍ:** estructura por módulo (`<modulo>/api`, `<modulo>/domain`, `<modulo>/infrastructure`) con un
  módulo `sample` de ejemplo; `ApiError` basado en `ProblemDetail` con campos `type`, `title`,
  `status`, `detail`, `instance`, `code` y `timestamp`; `GlobalExceptionHandler` con
  `@RestControllerAdvice`; `BaseEntity` (`@MappedSuperclass` con `id`, `createdAt`, `updatedAt`);
  `PageResponse<T>`; DTOs de ejemplo; una prueba MockMvc del manejador de errores;
  `docs/plantilla-modulo-backend.md` con el paso a paso para crear un módulo nuevo.
- **NO:** lógica de negocio real, entidades de dominio, seguridad, autenticación ni migraciones de
  negocio. El módulo `sample` no se expone en `prod`.

## Criterios de aceptación

- [ ] `GET /api/sample/boom` responde con `Content-Type: application/problem+json` y cuerpo con `type`, `title`, `status`, `detail`, `instance`, `code` y `timestamp`; el `status` es 500 y no incluye stacktrace.
- [ ] `POST /api/sample` con un body inválido responde 400 con `code = VALIDATION_ERROR` y una lista `errors` con `field` y `message` por cada campo inválido (no solo el primero).
- [ ] `GET /api/sample/page?page=0&size=5` devuelve `content`, `page`, `size`, `totalElements` y `totalPages`; un `size` mayor al máximo permitido se acota en lugar de fallar.
- [ ] `BaseEntity` aporta `id`, `createdAt` y `updatedAt` con auditoría JPA activa y se reutiliza en el módulo `sample`.
- [ ] `./mvnw test -Dtest=GlobalExceptionHandlerTest` pasa y cubre al menos un caso 400, un 404 y un 500.
- [ ] El log registra el detalle técnico de la excepción y la respuesta HTTP no expone mensajes internos, rutas de archivo ni nombres de clase.
- [ ] `docs/plantilla-modulo-backend.md` describe los paquetes, la regla de DTOs, el formato de error y el checklist para un módulo nuevo.

## Archivos afectados (previstos)

| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/java/com/cremeco/pasteleria/common/error/ApiError.java` | model | 60 |
| `backend/src/main/java/com/cremeco/pasteleria/common/error/GlobalExceptionHandler.java` | component | 130 |
| `backend/src/main/java/com/cremeco/pasteleria/common/domain/BaseEntity.java` | model | 50 |
| `backend/src/main/java/com/cremeco/pasteleria/common/web/PageResponse.java` | model | 50 |
| `backend/src/main/java/com/cremeco/pasteleria/sample/api/SampleController.java` | component | 60 |
| `backend/src/test/java/com/cremeco/pasteleria/common/error/GlobalExceptionHandlerTest.java` | component | 90 |
| `docs/plantilla-modulo-backend.md` | doc | 160 |

## Casos límite (Edge Cases)

- **Excepción no controlada:** debe mapearse a 500 con `code = INTERNAL_ERROR` y mensaje genérico;
  el detalle real va solo al log.
- **JSON malformado en el body:** debe responder 400 (`MALFORMED_JSON`), nunca 500.
- **Varios campos inválidos a la vez:** se devuelven todos los errores de validación, ordenados por
  campo, para que la UI pueda marcarlos juntos.
- **Recurso inexistente:** 404 con `code` estable (`RESOURCE_NOT_FOUND`), nunca 200 con cuerpo vacío.
- **`size` desmedido en paginación** (por ejemplo 10000): se acota al máximo documentado y la
  respuesta indica el tamaño efectivo.

## Definition of Done

- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación): `./mvnw test` en verde con la prueba del manejador.
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`): `feat(backend): crear plantilla de modulo y errores rfc 7807`.

---

# Ticket T27 — PWA admin: Vite, React, Bootstrap y shell

## Metadatos

- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 0
- **Rama sugerida:** `feature/T27-pwa-admin-shell`
- **Responsable:** Anais
- **Prioridad:** Alta
- **Depende de:** T21

## Contexto

`RF-007` exige una PWA de administración con Vite + React + Bootstrap 5 y tema de marca, sin
Tailwind, y `RNF-001` prohíbe que el admin cargue Tailwind. La app no existe todavía: hoy el admin
vive dentro de `frontend/src/pages/admin` como referencia y será reemplazado. Este ticket crea la app
real (`admin/`), su tema con variables CSS, el shell con sidebar y header, el router base y el
manifiesto provisional para que sea instalable más adelante (T68).

## Convenciones aplicables

- `CONV-UI-01`
- `CONV-UI-02`
- `CONV-UI-03`
- `CONV-UI-04`
- `CONV-TIP-01`
- `CONV-GEN-03`
- `CONV-NAM-02`
- `CONV-NAM-04`

## Alcance (Qué SÍ / Qué NO)

- **SÍ:** `admin/` con Vite + React 18 + TypeScript estricto + Bootstrap 5 (sin Tailwind);
  `theme.css` con las variables de marca (`--cremeco-primary`, `--cremeco-secondary`,
  `--cremeco-tertiary`, `--cremeco-neutral`, `--cremeco-ink`, `--cremeco-inverted`) aplicadas sobre
  las variables de Bootstrap; `AdminShell` con sidebar colapsable, header y área de contenido;
  `AppRouter` con rutas base (`/`, `/pedidos`, `/inventario`, `/usuarios`, `/configuracion`) usando
  placeholders con estados de carga, vacío y error; `manifest.webmanifest` provisional;
  scripts `dev`, `build`, `lint`, `preview` con `--port 5174`.
- **NO:** pantallas funcionales, autenticación, guards por permisos (S1), service worker (T68),
  consumo de API y gráficos. No se copia CSS del cliente ni se importa nada desde `frontend/`.

## Criterios de aceptación

- [ ] `npm --prefix admin install` y `npm --prefix admin run build` terminan sin errores y con `tsc` en modo `strict` (sin `any`, sin `@ts-ignore`).
- [ ] `npm --prefix admin run dev` sirve la app en `http://localhost:5174` y muestra el shell con sidebar, header y contenido en las cinco rutas base.
- [ ] `npm --prefix admin ls tailwindcss` no encuentra el paquete y una búsqueda de `tailwind` dentro de `admin/src` y `admin/package.json` no devuelve resultados.
- [ ] El CSS de marca se carga después de Bootstrap y las variables `--cremeco-*` se aplican al shell y a los botones primarios, verificable en el inspector.
- [ ] En 360 px, 768 px y 1280 px el layout no produce scroll horizontal; bajo 992 px el sidebar se colapsa y se abre con un botón accesible por teclado (`aria-expanded` actualizado).
- [ ] `admin/public/manifest.webmanifest` se sirve en `/manifest.webmanifest` con `name`, `short_name`, `start_url`, `display: "standalone"`, `theme_color` y `background_color`.
- [ ] `npm --prefix admin run lint` termina con 0 problemas.

## Archivos afectados (previstos)

| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `admin/package.json` | config | 60 |
| `admin/vite.config.ts` | config | 40 |
| `admin/src/main.tsx` | component | 40 |
| `admin/src/styles/theme.css` | config | 120 |
| `admin/src/layouts/AdminShell.tsx` | component | 120 |
| `admin/src/router/AppRouter.tsx` | component | 100 |
| `admin/public/manifest.webmanifest` | config | 30 |

## Casos límite (Edge Cases)

- **Recarga profunda** en una ruta (`/pedidos/123`) contra el servidor de Vite funciona, pero en un
  build servido estáticamente puede dar 404. Se documenta el fallback de hosting y se aclara que en
  S0 todavía no hay service worker.
- **Choque de estilos:** el reset de Bootstrap pisa estilos de marca si `theme.css` se carga antes;
  el orden de importación queda fijado en `main.tsx` y comentado con el porqué.
- **Manifiesto sin iconos definitivos:** el navegador no lo marcará instalable todavía; se acepta en
  S0 y se cierra en T68. El `manifest` no debe apuntar a iconos inexistentes.
- **Sidebar abierto en 360 px:** no debe tapar el header ni generar scroll horizontal; el panel se
  cierra con `Esc` y al navegar.

## Definition of Done

- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación): `npm --prefix admin run build` y `npm --prefix admin run lint` en 0; revisión responsive 360/768/1280.
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`): `feat(admin): crear pwa base con vite react y bootstrap`.

---

# Ticket T28 — Configuración de pruebas backend y frontend

## Metadatos

- **Tipo:** test
- **Fase / Sprint:** F3 · Sprint 0
- **Rama sugerida:** `feature/T28-configuracion-pruebas`
- **Responsable:** Nicolas
- **Prioridad:** Alta
- **Depende de:** T23, T27

## Contexto

`RF-008` exige pruebas automatizadas configuradas en backend y frontend, y `RF-064`/`RF-065` las
detallan para S6. Sin una base en S0, cada módulo posterior agregaría su propia configuración y el
equipo no tendría una señal confiable antes de cada merge. Este ticket deja JUnit 5 + MockMvc +
Testcontainers en `backend/` y Vitest + Testing Library en `admin/` y `frontend/`, con un ejemplo
real que pasa en cada proyecto.

## Convenciones aplicables

- `CONV-TIP-01`
- `CONV-ERR-01`
- `CONV-DOC-04`
- `CONV-GEN-02`
- `CONV-GEN-05`

## Alcance (Qué SÍ / Qué NO)

- **SÍ:** dependencias de prueba en `backend/pom.xml` (`spring-boot-starter-test`,
  `spring-security-test`, `testcontainers-mysql`, `testcontainers-junit-jupiter`) de forma aditiva
  sobre lo creado en T23; `IntegrationTestBase` con MySQL de Testcontainers y `@ServiceConnection`;
  una prueba de contexto y una MockMvc que pasen; Vitest con `jsdom` y Testing Library en `admin/`
  y `frontend/`; scripts `test`, `test:watch` y `test:coverage`; `docs/testing.md` con comandos y
  convención de nombres.
- **NO:** pruebas E2E con Playwright (S6), pruebas de seguridad (T42), cobertura mínima obligatoria
  como bloqueo de build ni datos semilla para pruebas. No se reescribe la suite de ejemplo de T26:
  se integra.

## Criterios de aceptación

- [ ] `./mvnw test` ejecuta y pasa `PasteleriaApplicationTests` (contexto carga) y, como mínimo, una prueba MockMvc; el reporte queda en `target/surefire-reports/`.
- [ ] `IntegrationTestBase` levanta MySQL con Testcontainers (`mysql:8.0`) y ejecuta Flyway contra ese contenedor, sin depender de la base de `infra/`; si Docker no está disponible, la clase se omite y el build no falla por ello.
- [ ] `npm --prefix admin test -- --run` y `npm --prefix frontend test -- --run` pasan con al menos una prueba de componente o utilidad cada uno, y `npm test` no queda en modo watch.
- [ ] Las pruebas no dependen del orden de ejecución ni de datos previos: correr la suite dos veces seguidas da el mismo resultado.
- [ ] `docs/testing.md` documenta los comandos (`mvnw test`, `npm test`, `npm run test:coverage`), la convención de nombres (`*Test.java`, `*.test.ts`, `*.test.tsx`) y la política de Docker para Testcontainers.
- [ ] Ningún archivo de prueba deja logs de depuración ni `console.log` en la entrega (`CONV-GEN-02`).

## Archivos afectados (previstos)

| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/pom.xml` | config | 260 |
| `backend/src/test/java/com/cremeco/pasteleria/support/IntegrationTestBase.java` | component | 80 |
| `backend/src/test/java/com/cremeco/pasteleria/PasteleriaApplicationTests.java` | component | 40 |
| `admin/vitest.config.ts` | config | 40 |
| `admin/src/test/setup.ts` | config | 30 |
| `frontend/vitest.config.ts` | config | 40 |
| `frontend/src/test/setup.ts` | config | 30 |
| `docs/testing.md` | doc | 120 |

## Casos límite (Edge Cases)

- **Docker no disponible en el equipo:** Testcontainers no puede iniciar el contenedor; las pruebas
  de integración se omiten con `disabledWithoutDocker = true` y `docs/testing.md` explica cómo
  correr solo las unitarias. El build no debe quedar en rojo por el entorno.
- **`npm test` en modo watch cuelga la integración continua:** el script `test` usa `vitest run` y el
  modo interactivo queda en `test:watch`.
- **Zona horaria:** el contenedor y las pruebas se fijan a `America/Santiago` para que las
  aserciones de fecha no dependan de la hora del host.
- **Puerto de Testcontainers vs `infra/`:** la prueba usa un puerto aleatorio mapeado; nunca se
  conecta al 3306 local para no ensuciar la base de desarrollo.

## Definition of Done

- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación): `./mvnw test`, `npm --prefix admin test -- --run` y `npm --prefix frontend test -- --run` en verde.
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`): `test(repo): configurar junit mockmvc testcontainers y vitest`.

---

# Ticket T29 — Manifiesto PCA, README y docs de estado

## Metadatos

- **Tipo:** docs
- **Fase / Sprint:** F3 · Sprint 0
- **Rama sugerida:** `feature/T29-manifiesto-pca-docs`
- **Responsable:** Anais
- **Prioridad:** Media
- **Depende de:** T21–T28

## Contexto

`RF-009` exige que el manifiesto PCA incluya los nuevos roots y que la documentación quede
sincronizada. Hoy `tools/pca.config.json` solo cubre `docs`, `tools` y `frontend`, y `AGENTS.md`
describe un stack sin backend ni PWA de admin. Si el sprint cierra sin esto, el grafo de impacto
ignora `backend/`, `admin/`, `infra/` y `shared/`, y el siguiente agente arranca con contexto falso.

## Convenciones aplicables

- `CONV-GEN-05`
- `CONV-DOC-01`
- `CONV-DOC-04`
- `CONV-DOC-05`
- `CONV-EST-02`
- `CONV-NAM-04`

## Alcance (Qué SÍ / Qué NO)

- **SÍ:** ampliar `roots` a `backend`, `admin`, `infra`, `shared` y los patrones de `include` para
  Java, SQL, YAML y XML; agregar al manifiesto los `@id` de los archivos críticos creados en el
  sprint; actualizar `AGENTS.md` (stack real, rutas, puertos, regla de no solapamiento);
  `docs/estado_proyecto.md` (Sprint 0 cerrado, stack y próximo paso); `docs/convenciones.md`
  (solo agregados o correcciones, sin cambiar IDs existentes); `README.md` raíz y
  `docs/arranque-local.md` con comandos definitivos.
- **NO:** cambiar el comportamiento de `tools/pca_annotator.py` salvo que aparezca un bug
  bloqueante (en ese caso se registra la cicatriz). No se renumeran tickets ni se editan los
  archivos de sprints S1–S6.

## Criterios de aceptación

- [ ] `python tools/pca_annotator.py check` reporta 0 archivos sobre su `@limit`, 0 relaciones rotas y 0 archivos anotables sin bloque en los roots nuevos.
- [ ] `python tools/pca_annotator.py annotate` es idempotente: una segunda ejecución consecutiva no produce cambios (`git diff` vacío sobre los archivos anotados).
- [ ] `python tools/pca_annotator.py impact backend.config.webCors --transitive` devuelve los dependientes reales y no un grafo vacío.
- [ ] El `README.md` raíz documenta estructura del monorepo, puertos 5173/5174/8080/3306, comandos de arranque, comandos de prueba y la regla de que el backend es la fuente de verdad.
- [ ] `AGENTS.md` refleja el stack real (Spring Boot 3.5 / Java 21 / Maven Wrapper, PWA admin con Bootstrap 5, cliente con Tailwind v4) y advierte que el admin no carga Tailwind.
- [ ] `docs/estado_proyecto.md` marca los tickets T21–T29 como `Hecho` y define el próximo paso (T30).
- [ ] `docs/convenciones.md` conserva intactos todos los IDs existentes y cualquier regla nueva tiene ID con el mismo formato.

## Archivos afectados (previstos)

| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `tools/pca.config.json` | config | 420 |
| `AGENTS.md` | doc | 200 |
| `docs/estado_proyecto.md` | doc | 200 |
| `docs/convenciones.md` | doc | 110 |
| `README.md` | doc | 170 |
| `docs/arranque-local.md` | doc | 150 |

## Casos límite (Edge Cases)

- **Anotar archivos generados** (`shared/api-types.ts`) o de build (`target/`, `dist/`,
  `node_modules/`): se excluyen del manifiesto y, si se documentan, se marcan como generados; de lo
  contrario `annotate` reescribe archivos que no deben tocarse.
- **`@id` duplicado entre apps** (por ejemplo `ui.button` en `admin` y en `frontend`): todos los IDs
  nuevos se prefijan por app (`admin.*`, `frontend.*`, `backend.*`); `check` debe quedar en 0
  relaciones rotas.
- **Roots con material ajeno** (`MockUpPasteleria/`, `ParaEstudiar/`, `guias/`): no se agregan a
  `roots`, para no anotar cientos de archivos de referencia y romper `check`.
- **Archivos nuevos sin `@limit` declarado en el manifiesto:** el chequeo no los valida; se declara
  límite explícito para cada archivo crítico agregado.

## Definition of Done

- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación): `check`, `annotate` idempotente e `impact` verificados con su salida adjunta.
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`): `docs(pca): sincronizar manifiesto readme y estado del sprint 0`.

---

## Supuestos del sprint

1. **SUPUESTO:** el servicio de MySQL usa la imagen `mysql:8.0` y la base se llama `cremeco`.
2. **SUPUESTO:** los perfiles de Spring son exactamente `dev` y `prod`; `dev` es el perfil por
   defecto en local.
3. **SUPUESTO:** `V1__baseline.sql` solo crea una tabla de control (`app_metadata`); las tablas de
   negocio empiezan en `V2` con T30.
4. **SUPUESTO:** la generación de tipos usa `openapi-typescript` como `devDependency` de
   `shared/package.json`.
5. **SUPUESTO:** la PWA admin usa Bootstrap 5 por CSS y componentes propios; la incorporación de
   `react-bootstrap` se decide en un ticket posterior si aporta valor.
6. **SUPUESTO:** las pruebas con Testcontainers reutilizan la imagen `mysql:8.0` y se omiten cuando
   Docker no está disponible.
7. **SUPUESTO:** `@kind(component)` se reutiliza para clases de prueba y `@kind(model)` para los
   scripts SQL, hasta que el diccionario de `docs/sistema_anotaciones.md` incorpore valores propios
   (`test`, `migration`).
8. **SUPUESTO:** los archivos compartidos (`pom.xml`, `application.yml`, `README.md`,
   `pca.config.json`, `estado_proyecto.md`) tienen un único dueño por ticket y se editan en
   secuencia, nunca en paralelo.
9. **SUPUESTO:** no se versiona ningún `.env`; solo `.env.example` con valores de ejemplo.
10. **SUPUESTO:** el trabajo local es Windows o Linux/macOS y los comandos se documentan en ambos
    formatos.

## Checklist de cierre del sprint

- [ ] Los nueve tickets (T21–T29) están en estado `Hecho` en `docs/plan_sprints.md` y en `docs/estado_proyecto.md`.
- [ ] Cada ticket tiene sus criterios de aceptación marcados con evidencia verificable (comandos y salida).
- [ ] `docs/estado_proyecto.md` refleja el Sprint 0 cerrado, el stack real y el próximo paso (T30).
- [ ] `docs/cicatrices_guerra.md` contiene las cicatrices de los bugs resueltos durante el sprint.
- [ ] `docs/reglas_backend.md`, `docs/testing.md`, `docs/contrato-openapi.md`, `docs/arranque-local.md` y `docs/plantilla-modulo-backend.md` existen y están enlazados desde el `README.md` raíz.
- [ ] `tools/pca.config.json` incluye `backend`, `admin`, `infra` y `shared`, y `python tools/pca_annotator.py check` reporta 0 problemas.
- [ ] Ningún ticket del sprint dejó código de negocio, datos semilla de negocio ni secretos versionados.
- [ ] No hay archivos sobre su `@limit` en los roots anotados.
- [ ] Se propusieron los nueve mensajes de commit y el equipo los aprobó (la IA no commiteó sola).
- [ ] Las ramas `feature/T21-*` a `feature/T29-*` fueron integradas a `develop` con revisión de otro integrante.

## Criterios de salida del sprint

1. `docker compose -f infra/docker-compose.yml up -d` deja MySQL 8 en estado `healthy`, con volumen persistente, charset `utf8mb4` y credenciales fuera del repositorio.
2. `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev` levanta la API en 8080 y `/actuator/health` responde `UP`; CORS acepta 5173 y 5174 y rechaza orígenes no listados.
3. `/v3/api-docs` está publicado y `shared/api-types.ts` se regenera con un comando documentado, sin `any` y versionado junto al contrato.
4. Flyway aplica `V1` en una base limpia y en un reinicio posterior, con `flyway_schema_history` consistente y reglas de migración escritas.
5. La plantilla de módulo y el formato de error RFC 7807 están probados: 400 con `errors[]`, 404 y 500 sin filtrar detalles internos.
6. `npm --prefix admin run build` y `npm --prefix admin run lint` terminan en 0, la PWA se sirve en 5174 con su shell y sin Tailwind.
7. `./mvnw test`, `npm --prefix admin test -- --run` y `npm --prefix frontend test -- --run` pasan en un equipo con Docker disponible.
8. `python tools/pca_annotator.py check` reporta 0 problemas y la documentación de estado, convenciones y arranque local describe el proyecto real.
