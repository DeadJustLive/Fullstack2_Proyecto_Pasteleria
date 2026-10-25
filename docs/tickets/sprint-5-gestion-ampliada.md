# Sprint 5 — Gestión ampliada

> **Fase:** F3 — Ejecución por tickets · **Sprint:** S5 · **Tickets:** T71–T79
> **Backlog:** [`docs/backlog_requisitos.md`](../backlog_requisitos.md) · **Plan:** [`docs/plan_sprints.md`](../plan_sprints.md)
> **Plantilla:** [`docs/plantilla_ticket.md`](../plantilla_ticket.md) · **Convenciones:** [`docs/convenciones.md`](../convenciones.md)

## Propósito

Cerrar la épica **E06 — Gestión ampliada** con el panel de control completo de la PWA:
dashboard de KPIs, reportes con exportación CSV, blog administrable y público, configuración
de tienda clave-valor tipada y auditoría general consultable. El backend Spring Boot es la
única fuente de verdad de métricas, contenidos, configuración y permisos; la PWA solo presenta
y valida UX, y el cliente React consume la API pública del blog.

**Supuestos transversales**

- **SUPUESTO:** la PWA `admin/` organiza el código en `src/pages/`, `src/features/` y
  `src/components/` por dominio, según RF-007 y T27. Si T27 define otra estructura, se ajustan
  las rutas sin cambiar el alcance de los tickets.
- **SUPUESTO:** las migraciones Flyway de S5 se reservan como `V50` (blog), `V51`
  (configuración) y `V52` (índices de auditoría). El coordinador confirma los números antes de
  ejecutar T74, T77 y T78.
- **SUPUESTO:** el contenido del blog se almacena en Markdown y se renderiza con sanitización
  en cliente y PWA. No se permite HTML arbitrario sin sanear.
- **SUPUESTO:** la configuración de horarios no cruza medianoche en el MVP; una jornada que
  termina al día siguiente requiere una decisión funcional posterior.
- **SUPUESTO:** los tipos de archivo `controller`, `repository`, `dto`, `migration`, `page` y
  `test` amplían el vocabulario de `@kind` de `docs/sistema_anotaciones.md`; todos los archivos
  nuevos se registran en `tools/pca.config.json` y se anotan con
  `python tools/pca_annotator.py annotate`.
- **SUPUESTO:** los reportes y la auditoría usan `America/Santiago`, CLP entero y rangos de
  fecha inclusivos por día. Las pruebas fijan `Clock` para no depender de la fecha real.
- **SUPUESTO:** los tests de integración usan MySQL de pruebas según T28 (Testcontainers o
  perfil `test`). Si T28 elige otra estrategia, T79 se adapta sin cambiar los casos.

**Orden de ejecución sugerido**

1. Frente datos: T72 → T71.
2. Frente contenido y configuración: T74 → T77 → T78.
3. Frente PWA y cliente: T75 → T76 → T73.
4. T79 se ejecuta al final, cuando T71–T78 estén en revisión y sus contratos estén congelados.

Máximo tres frentes simultáneos. Los archivos compartidos (`App.tsx`, `pom.xml`,
`admin/package.json`, `application.yml`) se editan de forma secuencial, nunca en paralelo.

## Índice de tickets

| ID | Título | Responsable | Prioridad | Depende de |
| :--- | :--- | :--- | :--- | :--- |
| T71 | Dashboard de KPIs | Matias | Media | T55, T57, T62, T66 |
| T72 | Reportes backend y exportación CSV | Matias | Media | T55, T62, T66 |
| T73 | PWA: reportes y gráficos | Anais | Media | T71, T72 |
| T74 | Blog backend y API pública | Nicolas | Media | T43 |
| T75 | PWA: CRUD del blog | Anais | Media | T74 |
| T76 | Cliente: blog y Home | Anais | Media | T74, T48 |
| T77 | Configuración de tienda y PWA | Nicolas | Media | T30 |
| T78 | Auditoría general y pantalla PWA | Nicolas | Media | T38, T77 |
| T79 | Pruebas de reportes, blog, settings y auditoría | Nicolas | Media | T71–T78 |

---

## Ticket T71 — Dashboard de KPIs

### Metadatos

- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 5
- **Rama sugerida:** feature/T71-dashboard-kpis
- **Responsable:** Matias
- **Prioridad:** Media
- **Depende de:** T55, T57, T62, T66
- **Estado:** Pendiente

### Contexto

El administrador necesita una primera pantalla que resuma la operación real al entrar a la PWA
(RF-047). Hoy `pages/admin/Dashboard.tsx` es un `Placeholder` y no existe backend. Este ticket
expone los KPIs calculados por el backend y los presenta en tarjetas Bootstrap, respetando
`dashboard.view`, la zona horaria `America/Santiago` y la regla de que ventas online y POS no se
cuenten dos veces. Los datos salen de pedidos pagados (T55/T57), inventario (T62) y caja (T66).

### Convenciones aplicables

- CONV-GEN-01
- CONV-GEN-02
- CONV-GEN-03
- CONV-NAM-01
- CONV-NAM-02
- CONV-NAM-05
- CONV-EST-01
- CONV-TIP-01
- CONV-TIP-02
- CONV-TIP-04
- CONV-ERR-01
- CONV-ERR-03
- CONV-ERR-04
- CONV-SEG-03
- CONV-SEG-04
- CONV-UI-01
- CONV-UI-02
- CONV-DOC-01
- CONV-DOC-02

### Alcance (Qué SÍ / Qué NO)

- **SÍ:** endpoint `GET /api/v1/admin/dashboard/kpis`; agregaciones de ventas del día y del mes,
  pedidos pendientes, stock bajo, top 5 de productos del mes y sesión de caja abierta; DTO
  tipado; validación de permiso `dashboard.view`; pantalla PWA con tarjetas Bootstrap, estados
  de carga, vacío, error con reintento y responsive desde 360 px; enlace a los módulos
  relacionados.
- **NO:** lógica nueva de pedidos, pagos, inventario o caja; gráficos y exportación (T73);
  rangos de fecha configurables por el usuario; cálculo de márgenes o costos; caché distribuida.

### Criterios de aceptación

- [ ] `GET /api/v1/admin/dashboard/kpis` responde `200` con `salesToday`, `salesMonth`,
  `pendingOrders`, `lowStockCount`, `topProducts` (máximo 5) y `openCashSession`, calculados en
  `America/Santiago` y en CLP entero.
- [ ] Las ventas del día y del mes incluyen pedidos online y ventas POS pagadas, sin duplicar
  una venta que tenga ambos registros; una venta anulada o impaga no suma.
- [ ] `pendingOrders` cuenta solo pedidos en estado `PENDIENTE`; `lowStockCount` cuenta solo
  productos activos con stock menor o igual a su mínimo; `topProducts` ordena por unidades
  vendidas del mes en curso.
- [ ] Un usuario sin `dashboard.view` recibe `403`, no ve el enlace en el menú y no puede entrar
  por URL directa; un usuario con el permiso recibe `200`.
- [ ] La PWA muestra seis tarjetas con skeleton durante la carga, mensaje de error con botón
  "Reintentar", estado de caja "Cerrada" cuando no hay sesión y `aria-busy` mientras carga.
- [ ] La respuesta no incluye costos, márgenes, datos personales de clientes ni tokens.

### Archivos afectados (previstos)

| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/java/com/cremeco/pasteleria/dashboard/DashboardController.java` | controller | 120 |
| `backend/src/main/java/com/cremeco/pasteleria/dashboard/DashboardService.java` | service | 240 |
| `backend/src/main/java/com/cremeco/pasteleria/dashboard/DashboardQueryRepository.java` | repository | 180 |
| `backend/src/main/java/com/cremeco/pasteleria/dashboard/dto/DashboardKpiResponse.java` | dto | 120 |
| `admin/src/pages/DashboardPage.tsx` | page | 200 |
| `admin/src/features/dashboard/dashboardApi.ts` | service | 100 |
| `admin/src/features/dashboard/useDashboardKpis.ts` | hook | 90 |
| `admin/src/components/dashboard/KpiCard.tsx` | component | 90 |
| `admin/src/App.tsx` | config | 160 |
| `backend/src/test/java/com/cremeco/pasteleria/dashboard/DashboardServiceTest.java` | test | 220 |

### Casos límite (Edge Cases)

- Día o mes sin ventas: el endpoint responde `200` con ceros y listas vacías, no `404` ni `null`.
- Cambio de día o de mes en `America/Santiago` mientras el servidor está en UTC: una venta de
  las 23:59 debe caer en el día correcto y no duplicarse en el mes siguiente.
- No hay caja abierta: `openCashSession` es `null` y la PWA muestra "Cerrada" sin romper el layout.
- Usuario con sesión válida pero permiso revocado: la PWA muestra `403` y limpia los KPIs.
- La API tarda más de lo esperado o falla: la pantalla muestra error con reintento y no deja
  tarjetas con datos viejos.

### Definition of Done

- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] Contrato OpenAPI actualizado para el endpoint y el DTO.
- [ ] Permiso `dashboard.view` verificado en la matriz RBAC y en la semilla correspondiente.

---

## Ticket T72 — Reportes backend y exportación CSV

### Metadatos

- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 5
- **Rama sugerida:** feature/T72-reportes-csv
- **Responsable:** Matias
- **Prioridad:** Media
- **Depende de:** T55, T62, T66
- **Estado:** Pendiente

### Contexto

El negocio necesita consultar ventas por período, productos top, stock bajo y movimientos de caja,
y descargar esa información para contabilidad o revisión operativa (RF-048, RF-049, RB-018).
Este ticket construye la capa de consulta y el exportador CSV; la pantalla y los gráficos van en
T73. Los rangos son inclusivos por día y se interpretan en `America/Santiago`.

### Convenciones aplicables

- CONV-GEN-01
- CONV-GEN-03
- CONV-GEN-04
- CONV-NAM-01
- CONV-NAM-05
- CONV-EST-01
- CONV-TIP-02
- CONV-TIP-03
- CONV-TIP-04
- CONV-ERR-01
- CONV-ERR-02
- CONV-ERR-03
- CONV-ERR-04
- CONV-SEG-03
- CONV-SEG-04
- CONV-DOC-01
- CONV-DOC-02
- CONV-DOC-03

### Alcance (Qué SÍ / Qué NO)

- **SÍ:** endpoints de ventas por período, top de productos, stock bajo y movimientos de caja;
  filtros `from`/`to` obligatorios o con valor por defecto documentado; agrupación por día,
  semana o mes; paginación de resultados; exportación CSV por streaming con cabeceras en español,
  separador `;`, UTF-8 con BOM y fechas en ISO-8601; validación de rango y permisos
  `reports.view` y `reports.export`.
- **NO:** pantalla, gráficos ni descarga desde el navegador (T73); envío por correo; reportes
  programados; exportación a Excel o PDF; cálculo de impuestos.

### Criterios de aceptación

- [ ] `GET /api/v1/admin/reports/sales?from=YYYY-MM-DD&to=YYYY-MM-DD&groupBy=day|week|month`
  responde `200` con `date`, `orders`, `grossSales`, `averageTicket` y `currency: "CLP"`, con
  rangos inclusivos y agrupación correcta.
- [ ] `GET /api/v1/admin/reports/top-products`, `/low-stock` y `/cash-movements` respetan los
  mismos filtros de fecha, el límite máximo de filas y el orden descendente documentado.
- [ ] `GET /api/v1/admin/reports/{report}/export.csv` responde `200`, `Content-Type:
  text/csv; charset=UTF-8`, `Content-Disposition: attachment` con nombre seguro, BOM UTF-8,
  cabecera en español y separador `;`.
- [ ] El CSV escapa correctamente campos con `;`, comillas o saltos de línea, y neutraliza
  fórmulas que empiecen con `=`, `+`, `-` o `@` en campos de texto.
- [ ] `from > to`, formato inválido o rango mayor a 366 días responden `400` con detalle por
  campo; no se ejecuta la consulta.
- [ ] Un usuario sin `reports.view` recibe `403` en consultas; sin `reports.export` recibe
  `403` solo en la descarga.
- [ ] Un rango sin datos devuelve `200` con lista vacía y un CSV que contiene solo la cabecera.

### Archivos afectados (previstos)

| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/java/com/cremeco/pasteleria/reports/ReportController.java` | controller | 200 |
| `backend/src/main/java/com/cremeco/pasteleria/reports/ReportService.java` | service | 280 |
| `backend/src/main/java/com/cremeco/pasteleria/reports/CsvExportService.java` | service | 220 |
| `backend/src/main/java/com/cremeco/pasteleria/reports/ReportQueryRepository.java` | repository | 240 |
| `backend/src/main/java/com/cremeco/pasteleria/reports/dto/ReportFilter.java` | dto | 100 |
| `backend/src/main/java/com/cremeco/pasteleria/reports/dto/SalesReportRow.java` | dto | 100 |
| `backend/src/main/java/com/cremeco/pasteleria/reports/dto/TopProductRow.java` | dto | 90 |
| `backend/src/test/java/com/cremeco/pasteleria/reports/ReportQueryRepositoryTest.java` | test | 240 |

### Casos límite (Edge Cases)

- Rango de fechas invertido o con formato `dd/MM/yyyy`: se rechaza con `400` y mensaje claro,
  sin consultar la base.
- Rango que cruza el cambio de horario de verano de Chile: no se pierde ni se duplica ningún día.
- Rango muy grande o sin datos: se responde lista vacía o error de validación, nunca un `500`.
- Nombres de producto con `;`, comillas o saltos de línea: el CSV sigue siendo parseable.
- Exportación de muchas filas: se usa streaming y no se carga todo el resultado en memoria.

### Definition of Done

- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] Contrato OpenAPI actualizado para los endpoints y parámetros.
- [ ] Permisos `reports.view` y `reports.export` verificados en RBAC.

---

## Ticket T73 — PWA: reportes y gráficos

### Metadatos

- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 5
- **Rama sugerida:** feature/T73-pwa-reportes-graficos
- **Responsable:** Anais
- **Prioridad:** Media
- **Depende de:** T71, T72
- **Estado:** Pendiente

### Contexto

Con los endpoints de T71/T72 listos, la PWA necesita una pantalla operativa para filtrar
reportes, leer la tabla, ver una tendencia liviana y descargar el CSV (RF-048, RF-049). La
pantalla debe respetar `reports.view` para consultar y `reports.export` para descargar, y
funcionar con Bootstrap 5 sin Tailwind.

### Convenciones aplicables

- CONV-GEN-01
- CONV-GEN-02
- CONV-GEN-03
- CONV-NAM-01
- CONV-NAM-02
- CONV-NAM-04
- CONV-NAM-06
- CONV-TIP-01
- CONV-TIP-02
- CONV-TIP-04
- CONV-ERR-01
- CONV-ERR-04
- CONV-UI-01
- CONV-UI-02
- CONV-UI-03
- CONV-UI-04
- CONV-SEG-04
- CONV-DOC-01

### Alcance (Qué SÍ / Qué NO)

- **SÍ:** ruta `/admin/reportes`; filtros de tipo de reporte, `from`, `to` y agrupación; tabla
  paginada; gráfico de líneas para ventas y barras para top productos usando `chart.js` de forma
  directa y liviana; exportación CSV por blob; estados de carga, vacío, error y sin permiso;
  sincronización de filtros con la URL.
- **NO:** nuevos endpoints o agregaciones (T72); edición de datos; exportación a PDF/Excel;
  gráficos 3D o librerías pesadas; reportes programados.

### Criterios de aceptación

- [ ] `/admin/reportes` muestra filtros, tabla y gráficos solo con `reports.view`; sin el permiso,
  la ruta redirige a una pantalla `403` y el menú no muestra el enlace.
- [ ] Al cambiar filtros se consulta T72 con `AbortController`, se actualiza la URL y no se
  muestran respuestas de peticiones antiguas.
- [ ] La tabla muestra las columnas del contrato, formatea CLP y fechas en `America/Santiago`,
  y contempla carga, vacío, error con reintento y paginación.
- [ ] El gráfico de ventas usa `chart.js` con controladores registrados explícitamente, se
  destruye al desmontar, se adapta al contenedor y no se renderiza si no hay datos.
- [ ] El botón "Exportar CSV" solo aparece con `reports.export`, descarga el archivo con el
  nombre del `Content-Disposition` y muestra error si el backend responde `403` o `500`.
- [ ] En 360 px los filtros se apilan, la tabla permite scroll horizontal y los gráficos no
  generan desborde de la página.

### Archivos afectados (previstos)

| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `admin/src/pages/ReportsPage.tsx` | page | 220 |
| `admin/src/features/reports/reportsApi.ts` | service | 150 |
| `admin/src/features/reports/useReportQuery.ts` | hook | 120 |
| `admin/src/components/reports/ReportFilters.tsx` | component | 140 |
| `admin/src/components/reports/ReportTable.tsx` | component | 180 |
| `admin/src/components/reports/SalesChart.tsx` | component | 160 |
| `admin/src/components/reports/TopProductsChart.tsx` | component | 140 |
| `admin/src/App.tsx` | config | 160 |
| `admin/package.json` | config | 140 |

> `admin/src/App.tsx` se edita en secuencia con T75 y T78. T73 registra la ruta de reportes y
> agrega solo la dependencia `chart.js`; no se usa `react-chartjs-2`.

### Casos límite (Edge Cases)

- Reporte sin datos: se muestra `EmptyState`, la tabla queda vacía y los gráficos se ocultan;
  el botón de exportar sigue disponible y descarga solo cabeceras.
- El usuario pierde `reports.export` con la pantalla abierta: la descarga responde `403` y se
  muestra un aviso, sin dejar un archivo corrupto.
- Cambio rápido de filtros: se aborta la petición anterior y no se mezclan resultados.
- Pantalla en 360 px o con zoom alto: filtros y tabla siguen siendo usables.
- El backend devuelve fechas o montos nulos: la tabla muestra un guion y no rompe el render.

### Definition of Done

- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] `npm run lint` y `npm run build` de `admin/` en 0.
- [ ] Permisos `reports.view` y `reports.export` probados en la PWA.

---

## Ticket T74 — Blog backend y API pública

### Metadatos

- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 5
- **Rama sugerida:** feature/T74-blog-backend
- **Responsable:** Nicolas
- **Prioridad:** Media
- **Depende de:** T43
- **Estado:** Pendiente

### Contexto

El blog existe solo como datos mock en `frontend/src/data/articles.ts`. Este ticket crea el
modelo `BlogPost`/`BlogCategory`, la administración backend y la API pública paginada por slug
(RF-050, RB-016). Un artículo solo es visible si está `PUBLISHED` y tiene slug único. La PWA
(T75) y el cliente (T76) consumen estos contratos; aquí no se implementa UI.

### Convenciones aplicables

- CONV-GEN-01
- CONV-GEN-03
- CONV-GEN-05
- CONV-NAM-01
- CONV-NAM-02
- CONV-NAM-05
- CONV-EST-01
- CONV-TIP-01
- CONV-TIP-02
- CONV-TIP-04
- CONV-ERR-01
- CONV-ERR-02
- CONV-ERR-03
- CONV-ERR-04
- CONV-SEG-03
- CONV-DOC-01
- CONV-DOC-02

### Alcance (Qué SÍ / Qué NO)

- **SÍ:** entidades `BlogPost` y `BlogCategory`; migración Flyway `V50`; CRUD administrativo de
  artículos y categorías; slug único normalizado; estados `DRAFT`/`PUBLISHED`; portada;
  contenido Markdown; fecha de publicación; API pública paginada con filtro por categoría y
  búsqueda; detalle público por slug; permisos `blog.view` y `blog.manage`; validación de
  entradas y errores `400`, `404`, `409`.
- **NO:** pantallas de la PWA (T75); consumo desde el cliente (T76); editor WYSIWYG; comentarios;
  likes; newsletter; carga real de imágenes (se reutiliza T47).

### Criterios de aceptación

- [ ] `GET /api/v1/public/blog?page=0&size=9&category=&q=` responde solo artículos `PUBLISHED`
  con `publishedAt <= now`, paginados, ordenados por `publishedAt` descendente y con metadatos
  de paginación.
- [ ] `GET /api/v1/public/blog/{slug}` devuelve el detalle de un artículo publicado; un borrador,
  un artículo futuro o un slug inexistente responde `404` sin filtrar su existencia.
- [ ] `POST /api/v1/admin/blog/posts` y `PUT /api/v1/admin/blog/posts/{id}` validan título,
  slug, categoría, contenido y portada; un slug duplicado responde `409` con un slug sugerido.
- [ ] El slug se normaliza a minúsculas, sin tildes ni espacios, con longitud máxima 140; el
  slug de un artículo ya publicado no se puede cambiar y responde `409`.
- [ ] Publicar fija `publishedAt`; despublicar lo quita de la API pública sin borrar el registro;
  el borrado es lógico (RB-012) y conserva el slug.
- [ ] Las rutas administrativas exigen `blog.view` para leer y `blog.manage` para crear, editar,
  publicar o despublicar; un usuario sin permiso recibe `403`.
- [ ] La categoría de un artículo no puede eliminarse si tiene artículos asociados: responde
  `409` con la lista de dependencias.

### Archivos afectados (previstos)

| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/java/com/cremeco/pasteleria/blog/BlogPost.java` | model | 180 |
| `backend/src/main/java/com/cremeco/pasteleria/blog/BlogCategory.java` | model | 120 |
| `backend/src/main/java/com/cremeco/pasteleria/blog/BlogPostRepository.java` | repository | 140 |
| `backend/src/main/java/com/cremeco/pasteleria/blog/BlogCategoryRepository.java` | repository | 100 |
| `backend/src/main/java/com/cremeco/pasteleria/blog/BlogService.java` | service | 280 |
| `backend/src/main/java/com/cremeco/pasteleria/blog/PublicBlogController.java` | controller | 140 |
| `backend/src/main/java/com/cremeco/pasteleria/blog/AdminBlogController.java` | controller | 200 |
| `backend/src/main/java/com/cremeco/pasteleria/blog/dto/BlogPostSummaryResponse.java` | dto | 100 |
| `backend/src/main/resources/db/migration/V50__create_blog_tables.sql` | migration | 180 |
| `backend/src/test/java/com/cremeco/pasteleria/blog/PublicBlogControllerTest.java` | test | 220 |

> **SUPUESTO:** `V50` se reserva para este ticket. Si el coordinador asigna otro número, se
> renombra el archivo antes de ejecutar la migración.

### Casos límite (Edge Cases)

- Dos editores publican el mismo slug a la vez: la restricción única de base de datos gana y el
  segundo recibe `409`, sin crear duplicados.
- Artículo despublicado o programado: la API pública responde `404`; el administrador sí lo ve
  en el listado interno.
- Categoría inexistente o inactiva al crear/editar: responde `400` y no guarda el artículo.
- Contenido vacío, portada con URL inválida o título demasiado largo: `400` con detalle por campo.
- Artículo eliminado lógicamente: deja de aparecer en público y conserva su slug para no
  reutilizarlo accidentalmente.
- Slugs con tildes, `ñ` o mayúsculas: se normalizan de forma determinista y no generan colisiones
  silenciosas.

### Definition of Done

- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] Contrato OpenAPI actualizado para los endpoints públicos y administrativos.
- [ ] Migración `V50` aplicada desde una base limpia y con `flyway repair` verificado.

---

## Ticket T75 — PWA: CRUD del blog

### Metadatos

- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 5
- **Rama sugerida:** feature/T75-pwa-crud-blog
- **Responsable:** Anais
- **Prioridad:** Media
- **Depende de:** T74
- **Estado:** Pendiente

### Contexto

El equipo de contenido necesita administrar el blog sin tocar la base de datos (RF-050). La PWA
debe listar, crear, editar, publicar, despublicar y previsualizar artículos, además de gestionar
categorías, respetando `blog.view` y `blog.manage`. La API y las reglas de slug ya existen en T74.

### Convenciones aplicables

- CONV-GEN-01
- CONV-GEN-02
- CONV-GEN-03
- CONV-NAM-01
- CONV-NAM-02
- CONV-NAM-04
- CONV-NAM-06
- CONV-TIP-01
- CONV-TIP-04
- CONV-ERR-01
- CONV-ERR-04
- CONV-UI-01
- CONV-UI-02
- CONV-UI-03
- CONV-SEG-03
- CONV-SEG-04
- CONV-DOC-01

### Alcance (Qué SÍ / Qué NO)

- **SÍ:** rutas `/admin/blog`, `/admin/blog/nuevo` y `/admin/blog/:id`; listado con búsqueda,
  filtro por estado/categoría y paginación; formulario con título, slug, categoría, extracto,
  portada, contenido Markdown y estado; generación y edición de slug antes de publicar; preview
  sanitizado; publicar/despublicar con confirmación; CRUD de categorías en modal; guard de
  cambios sin guardar; estados de carga, vacío, error y `403`.
- **NO:** renderizado público (T76); editor WYSIWYG; historial de versiones; programación de
  publicaciones; carga de archivos nuevos (se usa el uploader de T47); comentarios.

### Criterios de aceptación

- [ ] `/admin/blog` lista artículos con título, categoría, estado, fecha y autor; permite buscar,
  filtrar, paginar y muestra estados de carga, vacío y error con reintento.
- [ ] Crear y editar validan los campos requeridos en cliente y muestran los errores `400`/`409`
  del backend junto al campo correspondiente, sin perder lo escrito.
- [ ] El slug se autogenera desde el título, se puede editar mientras el artículo es borrador y
  queda bloqueado después de publicar; el intento de cambiarlo muestra la regla de T74.
- [ ] Publicar y despublicar piden confirmación, actualizan el listado y respetan `blog.manage`;
  sin permiso, los botones no aparecen y la ruta directa muestra `403`.
- [ ] La previsualización renderiza el Markdown sanitizado y muestra portada, categoría y fecha
  de publicación sin enviar el borrador a la API pública.
- [ ] Salir con cambios sin guardar muestra confirmación; el borrador se conserva en
  `sessionStorage` si falla la red y se recupera al volver al editor.
- [ ] La gestión de categorías permite crear, renombrar y desactivar; una categoría con artículos
  no se elimina y muestra el mensaje de T74.

### Archivos afectados (previstos)

| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `admin/src/pages/BlogListPage.tsx` | page | 220 |
| `admin/src/pages/BlogEditorPage.tsx` | page | 280 |
| `admin/src/features/blog/blogApi.ts` | service | 180 |
| `admin/src/features/blog/useBlogDraft.ts` | hook | 120 |
| `admin/src/components/blog/BlogForm.tsx` | component | 240 |
| `admin/src/components/blog/BlogPreview.tsx` | component | 140 |
| `admin/src/components/blog/CategoryModal.tsx` | component | 160 |
| `admin/src/App.tsx` | config | 160 |

> `admin/src/App.tsx` se edita después de T73 y antes de T78. No se ejecuta en paralelo con
> ninguno de los dos.

### Casos límite (Edge Cases)

- Slug duplicado al guardar: se muestra `409` inline, se sugiere un slug alternativo y el
  formulario conserva todos los campos.
- Sesión expirada durante el guardado: se conserva el borrador local, se pide reautenticación y
  se reintenta sin duplicar el artículo.
- Navegación fuera del editor con cambios pendientes: se pide confirmación.
- Artículo borrador abierto por URL directa: se muestra el editor, nunca el contenido público.
- Imagen de portada rota o URL inválida: se muestra placeholder y el error de validación.
- Usuario sin `blog.manage` con `blog.view`: puede listar y previsualizar, pero no guardar ni
  publicar.

### Definition of Done

- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] `npm run lint` y `npm run build` de `admin/` en 0.
- [ ] Permisos `blog.view` y `blog.manage` probados en la PWA.

---

## Ticket T76 — Cliente: blog y Home

### Metadatos

- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 5
- **Rama sugerida:** feature/T76-cliente-blog-home
- **Responsable:** Anais
- **Prioridad:** Media
- **Depende de:** T74, T48
- **Estado:** Pendiente

### Contexto

El cliente React muestra artículos desde `frontend/src/data/articles.ts`, un mock que debe
desaparecer. Este ticket conecta el listado y el detalle a la API pública de T74, reemplaza el
mock e integra los artículos recientes en la Home (RF-050, RF-056). La tienda solo presenta y
valida UX; el backend decide qué es público.

### Convenciones aplicables

- CONV-GEN-01
- CONV-GEN-02
- CONV-GEN-03
- CONV-NAM-01
- CONV-NAM-02
- CONV-NAM-04
- CONV-TIP-01
- CONV-TIP-04
- CONV-ERR-01
- CONV-ERR-02
- CONV-ERR-04
- CONV-UI-01
- CONV-UI-02
- CONV-UI-03
- CONV-UI-04
- CONV-SEG-03
- CONV-DOC-01

### Alcance (Qué SÍ / Qué NO)

- **SÍ:** rutas `/blog` y `/blog/:slug`; listado paginado con filtro por categoría y búsqueda;
  detalle con Markdown sanitizado, portada, fecha y metadatos; sección `BlogRecientes` de la Home
  alimentada por la API; estados de carga, vacío, error y `404`; eliminación de
  `data/articles.ts` y de sus imports; enlaces reales y SEO básico.
- **NO:** edición o publicación desde el cliente; comentarios; newsletter; paginación infinita
  con scroll; redirecciones de slugs antiguos; cambios en el diseño global de la Home.

### Criterios de aceptación

- [ ] `/blog` consume `GET /api/v1/public/blog` con paginación y filtro por categoría; muestra
  skeleton, estado vacío, error con reintento y tarjetas con enlace real a `/blog/:slug`.
- [ ] `/blog/:slug` consume `GET /api/v1/public/blog/{slug}`; un slug inexistente, un borrador o
  un artículo futuro muestra una página `404` con enlace de vuelta al blog.
- [ ] El contenido Markdown se renderiza sanitizado, sin `dangerouslySetInnerHTML` sin sanitizar;
  un intento de inyectar HTML o script no se ejecuta.
- [ ] `BlogRecientes` de la Home muestra máximo 3 artículos publicados desde la API y enlaza al
  detalle; si la API falla, la Home sigue funcionando y muestra un estado de error discreto.
- [ ] `frontend/src/data/articles.ts` ya no tiene imports y se elimina al cerrar el ticket; no
  quedan datos mock de blog en el cliente.
- [ ] Los estados de carga, vacío y error no rompen el layout en 360, 768, 1024 y 1280 px.
- [ ] El título y la meta descripción de cada artículo se actualizan sin dejar metadatos de la
  página anterior.

### Archivos afectados (previstos)

| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `frontend/src/pages/cliente/Blog.tsx` | page | 180 |
| `frontend/src/pages/cliente/BlogDetalle.tsx` | page | 200 |
| `frontend/src/services/blog.ts` | service | 140 |
| `frontend/src/types/blog.ts` | model | 90 |
| `frontend/src/components/domain/BlogCard.tsx` | component | 110 |
| `frontend/src/components/domain/BlogRecientes.tsx` | component | 140 |
| `frontend/src/data/articles.ts` | util | 60 |
| `frontend/src/App.tsx` | config | 160 |

> `frontend/src/data/articles.ts` se elimina al cerrar T76; se lista para dejar evidencia del
> archivo reemplazado. `frontend/src/App.tsx` se edita solo en este ticket de S5.

### Casos límite (Edge Cases)

- La API del blog no responde: el listado muestra error con reintento y la Home conserva el resto
  de sus secciones.
- Blog sin artículos publicados: se muestra un estado vacío, no una página en blanco ni un error.
- Artículo con contenido muy largo o portada ausente: el layout no se desborda y se usa un
  placeholder accesible.
- Slug que dejó de ser público: se muestra `404`, no un detalle vacío.
- Contenido con caracteres especiales o intento de XSS: se sanea y se muestra como texto seguro.
- Navegación directa a `/blog/:slug` con sesión de API expirada: como el endpoint es público, la
  página sigue funcionando; si cambia el contrato, se muestra error controlado.

### Definition of Done

- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] `npm run lint` y `npm run build` de `frontend/` en 0.
- [ ] Búsqueda de imports de `data/articles.ts` sin resultados.

---

## Ticket T77 — Configuración de tienda y PWA

### Metadatos

- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 5
- **Rama sugerida:** feature/T77-configuracion-tienda
- **Responsable:** Nicolas
- **Prioridad:** Media
- **Depende de:** T30
- **Estado:** Pendiente

### Contexto

Los datos de tienda, horarios, envío y métodos de pago no pueden quedar hardcodeados (RF-051,
RB-017). Este ticket crea una configuración clave-valor tipada, validada y auditable, con API
administrativa y pública, más la pantalla Bootstrap para editarla. `settings.manage` es el único
permiso que permite escribir; `settings.view` permite leer.

### Convenciones aplicables

- CONV-GEN-01
- CONV-GEN-03
- CONV-GEN-05
- CONV-NAM-01
- CONV-NAM-02
- CONV-NAM-05
- CONV-NAM-06
- CONV-EST-01
- CONV-TIP-01
- CONV-TIP-02
- CONV-TIP-03
- CONV-TIP-04
- CONV-ERR-01
- CONV-ERR-02
- CONV-ERR-03
- CONV-ERR-04
- CONV-SEG-03
- CONV-SEG-04
- CONV-UI-02
- CONV-UI-03
- CONV-DOC-01
- CONV-DOC-02

### Alcance (Qué SÍ / Qué NO)

- **SÍ:** entidad `StoreSetting` con clave única, valor, tipo (`STRING`, `INTEGER`, `DECIMAL`,
  `BOOLEAN`, `TIME`, `JSON`), grupo (`STORE`, `HOURS`, `SHIPPING`, `PAYMENTS`), visibilidad
  pública y versión; migración `V51`; API administrativa agrupada y API pública filtrada;
  validación por tipo y por grupo; actualización transaccional con control de concurrencia;
  auditoría de cambios; pantalla PWA con pestañas, formularios Bootstrap, guardado por grupo,
  estados de carga/error y confirmación de cambios sin guardar.
- **NO:** CRUD de zonas de envío (T54); CRUD de métodos de pago reales (T56); subida de logos o
  archivos; secretos de Flow; configuración multi-sucursal; cambio de horarios que cruce medianoche.

### Criterios de aceptación

- [ ] `GET /api/v1/admin/settings` devuelve la configuración agrupada y tipada, con `key`,
  `value`, `type`, `group`, `isPublic` y `version`; requiere `settings.view`.
- [ ] `PUT /api/v1/admin/settings` guarda un grupo completo de forma atómica; si un valor es
  inválido no persiste ningún cambio y responde `400` con el detalle por clave.
- [ ] Las validaciones cubren email, teléfono, horas `HH:mm`, apertura menor que cierre, umbral
  de envío mayor o igual a 0, CLP entero y al menos un método de pago habilitado.
- [ ] `GET /api/v1/public/settings` devuelve solo claves con `isPublic = true` y nunca expone
  configuración interna, credenciales ni datos de auditoría.
- [ ] Dos administradores que editan el mismo grupo reciben conflicto de versión `409`; el
  segundo debe recargar antes de guardar.
- [ ] Cada cambio guarda `updatedBy`, `updatedAt` y un registro de auditoría con valores antes y
  después; los campos sensibles se enmascaran.
- [ ] La pantalla `/admin/configuracion` muestra pestañas por grupo, campos adecuados al tipo,
  errores inline, estado de carga, error con reintento y confirmación al salir con cambios.
- [ ] Sin `settings.manage` los formularios son de solo lectura; sin `settings.view` la ruta
  muestra `403`.

### Archivos afectados (previstos)

| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/java/com/cremeco/pasteleria/settings/StoreSetting.java` | model | 170 |
| `backend/src/main/java/com/cremeco/pasteleria/settings/StoreSettingRepository.java` | repository | 100 |
| `backend/src/main/java/com/cremeco/pasteleria/settings/SettingService.java` | service | 280 |
| `backend/src/main/java/com/cremeco/pasteleria/settings/SettingController.java` | controller | 180 |
| `backend/src/main/java/com/cremeco/pasteleria/settings/dto/SettingGroupResponse.java` | dto | 120 |
| `backend/src/main/resources/db/migration/V51__create_store_settings.sql` | migration | 180 |
| `admin/src/pages/SettingsPage.tsx` | page | 260 |
| `admin/src/features/settings/settingsApi.ts` | service | 140 |
| `admin/src/components/settings/SettingGroupForm.tsx` | component | 220 |
| `admin/src/components/settings/SettingField.tsx` | component | 140 |
| `backend/src/test/java/com/cremeco/pasteleria/settings/SettingControllerTest.java` | test | 220 |

> **SUPUESTO:** `V51` se reserva para este ticket y la tabla se siembra con las claves mínimas
> de tienda, horarios, envío y pagos. Los valores reales quedan en la migración, no en el código.

### Casos límite (Edge Cases)

- Valor `"abc"` en una clave `INTEGER` o negativo en el umbral de envío: `400`, sin guardado
  parcial.
- Hora de cierre menor o igual a la de apertura: `400`; si el negocio necesita cruzar medianoche,
  se detiene y se pregunta antes de inventar una regla.
- Todos los métodos de pago deshabilitados: `400` con mensaje que indique al menos uno requerido.
- Dos ediciones concurrentes: `409` por versión y recarga obligatoria antes de reintentar.
- Clave desconocida o intento de modificar una clave interna por la API pública: `404`/`403`,
  sin filtrar el valor.
- Cadena vacía frente a `null`: se define explícitamente por tipo y se prueba; no se guarda un
  `null` que rompa el consumo público.

### Definition of Done

- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] Contrato OpenAPI actualizado para settings administrativos y públicos.
- [ ] Migración `V51` aplicada y permisos `settings.view`/`settings.manage` verificados.

---

## Ticket T78 — Auditoría general y pantalla PWA

### Metadatos

- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 5
- **Rama sugerida:** feature/T78-auditoria-general
- **Responsable:** Nicolas
- **Prioridad:** Media
- **Depende de:** T38, T77
- **Estado:** Pendiente

### Contexto

La auditoría de identidad existe desde T38, pero el administrador necesita consultar las
acciones críticas de todos los módulos en una sola pantalla (RF-052, RB-011). Este ticket expone
una consulta paginada de `AuditLog` con filtros por usuario, módulo, acción y fecha, más el
detalle antes/después. La auditoría es de solo lectura y exige `audit.view`.

### Convenciones aplicables

- CONV-GEN-01
- CONV-GEN-03
- CONV-NAM-01
- CONV-NAM-02
- CONV-NAM-05
- CONV-EST-01
- CONV-TIP-01
- CONV-TIP-02
- CONV-TIP-04
- CONV-ERR-01
- CONV-ERR-02
- CONV-ERR-03
- CONV-ERR-04
- CONV-SEG-04
- CONV-UI-02
- CONV-UI-03
- CONV-DOC-01
- CONV-DOC-02

### Alcance (Qué SÍ / Qué NO)

- **SÍ:** endpoint paginado `GET /api/v1/admin/audit` con filtros `userId`, `userEmail`,
  `module`, `action`, `from` y `to`; detalle `GET /api/v1/admin/audit/{id}`; orden descendente
  por fecha; índice de consulta; DTO con datos del actor y del recurso; enmascaramiento de
  secretos; pantalla `/admin/auditoria` con filtros, tabla, paginación y modal de detalle
  antes/después; permiso `audit.view`.
- **NO:** edición o borrado de registros; exportación CSV; alertas en tiempo real; retención
  automática; reconstrucción de estados; auditoría de lecturas no críticas.

### Criterios de aceptación

- [ ] `GET /api/v1/admin/audit` responde `200` con `content`, `page`, `size`, `totalElements` y
  `totalPages`, ordenado por `createdAt` descendente y con tamaño máximo de página 100.
- [ ] Los filtros por usuario, módulo, acción y rango de fechas son opcionales y combinables;
  las fechas son inclusivas en `America/Santiago`; un rango invertido responde `400`.
- [ ] `GET /api/v1/admin/audit/{id}` devuelve `before` y `after` como JSON, el actor, el módulo,
  la acción, la entidad afectada, la IP y el `createdAt`; un id inexistente responde `404`.
- [ ] Los campos `password`, `passwordHash`, `token`, `refreshToken`, `authorization` y
  `secret` se muestran como `***` tanto en la respuesta como en la pantalla.
- [ ] Un usuario sin `audit.view` recibe `403` y no ve el enlace en el menú; no existe endpoint
  de escritura para auditoría.
- [ ] La pantalla muestra filtros, tabla, paginación, estados de carga/error/vacío y un modal con
  las secciones "Antes" y "Después"; el JSON se presenta legible y sin romper el layout en 360 px.
- [ ] La consulta usa índices para `created_at`, `user_id`, `module` y `action`; un filtro por
  fecha no hace un escaneo completo de la tabla.

### Archivos afectados (previstos)

| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/java/com/cremeco/pasteleria/audit/AuditLogController.java` | controller | 160 |
| `backend/src/main/java/com/cremeco/pasteleria/audit/AuditQueryService.java` | service | 220 |
| `backend/src/main/java/com/cremeco/pasteleria/audit/AuditLogRepository.java` | repository | 160 |
| `backend/src/main/java/com/cremeco/pasteleria/audit/dto/AuditLogResponse.java` | dto | 130 |
| `backend/src/main/java/com/cremeco/pasteleria/audit/dto/AuditFilter.java` | dto | 100 |
| `backend/src/main/resources/db/migration/V52__audit_log_indexes.sql` | migration | 120 |
| `admin/src/pages/AuditPage.tsx` | page | 240 |
| `admin/src/features/audit/auditApi.ts` | service | 120 |
| `admin/src/components/audit/AuditDetailModal.tsx` | component | 170 |
| `admin/src/components/audit/AuditFilters.tsx` | component | 150 |
| `admin/src/App.tsx` | config | 160 |

> **SUPUESTO:** la tabla `audit_logs` y el servicio de escritura provienen de T38. `V52` solo
> agrega columnas faltantes e índices; si la tabla no existe, se detiene y se coordina con T38.

### Casos límite (Edge Cases)

- Rango de fechas invertido o con formato inválido: `400` con detalle, sin consultar la base.
- `page` fuera del total o `size` mayor a 100: página vacía o `400` según contrato, nunca un
  `500` ni una consulta sin límite.
- Usuario eliminado: el registro conserva el email o nombre del actor en el momento de la acción.
- `before` o `after` nulos (creación o borrado): el modal muestra "Sin datos" en la sección
  correspondiente.
- JSON con campos sensibles anidados: el enmascaramiento es recursivo y no deja secretos.
- Muchos registros con el mismo filtro: la paginación y el índice mantienen tiempos aceptables.

### Definition of Done

- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] Contrato OpenAPI actualizado para consulta y detalle.
- [ ] Migración `V52` aplicada y permiso `audit.view` verificado en RBAC.

---

## Ticket T79 — Pruebas de reportes, blog, settings y auditoría

### Metadatos

- **Tipo:** test
- **Fase / Sprint:** F3 · Sprint 5
- **Rama sugerida:** feature/T79-pruebas-gestion-ampliada
- **Responsable:** Nicolas
- **Prioridad:** Media
- **Depende de:** T71–T78
- **Estado:** Pendiente

### Contexto

Cerrar S5 exige evidencia de que las agregaciones, exportaciones, reglas de contenido,
configuración y auditoría funcionan en casos normales y límite (RF-064, RF-065). Este ticket no
agrega funcionalidad: agrega pruebas deterministas y verifica permisos, validaciones y
regresiones de los tickets T71–T78.

### Convenciones aplicables

- CONV-GEN-01
- CONV-GEN-02
- CONV-GEN-03
- CONV-NAM-01
- CONV-NAM-02
- CONV-TIP-01
- CONV-TIP-02
- CONV-TIP-03
- CONV-TIP-04
- CONV-ERR-01
- CONV-ERR-02
- CONV-SEG-04
- CONV-DOC-01
- CONV-DOC-03

### Alcance (Qué SÍ / Qué NO)

- **SÍ:** pruebas de agregaciones de ventas y KPIs con `Clock` fijo y `America/Santiago`;
  pruebas de CSV (cabecera, BOM, separador, escape, inyección de fórmulas, rango vacío); pruebas
  de blog (slug duplicado, normalización, borrador no público, slug bloqueado tras publicar);
  pruebas de settings (tipo inválido, validación de horas, guardado atómico, conflicto de
  versión, exposición pública); pruebas de auditoría (filtros, paginación, enmascaramiento,
  permisos); pruebas de seguridad `401`/`403` para cada permiso nuevo.
- **NO:** cambios de contrato o de comportamiento; pruebas E2E de navegador (T84); pruebas de
  carga o performance; datos reales de producción; corrección de bugs de otros tickets sin
  registrarlos antes.

### Criterios de aceptación

- [ ] `./mvnw test` (o `mvnw.cmd test` en Windows) pasa en verde con las pruebas nuevas y las
  existentes, sin depender de la fecha real ni del orden de ejecución.
- [ ] Las pruebas de reportes cubren día, mes, rango inclusivo, cambio de horario de verano,
  venta duplicada online/POS y rango sin datos.
- [ ] Las pruebas de CSV verifican cabeceras en español, BOM UTF-8, separador `;`, escape de
  comillas/saltos de línea y neutralización de celdas que empiezan con `=`, `+`, `-` o `@`.
- [ ] Las pruebas de blog demuestran que un slug duplicado devuelve `409`, que un borrador no
  aparece en público y que un slug publicado no se puede cambiar.
- [ ] Las pruebas de settings demuestran que un valor inválido no guarda nada, que el conflicto
  de versión devuelve `409` y que la API pública no expone claves internas.
- [ ] Las pruebas de auditoría demuestran filtros combinados, paginación, rango invertido `400`,
  detalle `404` y enmascaramiento recursivo de secretos.
- [ ] Cada permiso nuevo (`dashboard.view`, `reports.view`, `reports.export`, `blog.view`,
  `blog.manage`, `settings.view`, `settings.manage`, `audit.view`) tiene al menos una prueba
  `403` sin permiso y una `200` con permiso.
- [ ] La suite deja evidencia en el ticket: comando ejecutado, número de pruebas y resultado.

### Archivos afectados (previstos)

| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/test/java/com/cremeco/pasteleria/reports/ReportServiceTest.java` | test | 280 |
| `backend/src/test/java/com/cremeco/pasteleria/reports/CsvExportServiceTest.java` | test | 220 |
| `backend/src/test/java/com/cremeco/pasteleria/blog/BlogServiceTest.java` | test | 260 |
| `backend/src/test/java/com/cremeco/pasteleria/settings/SettingServiceTest.java` | test | 280 |
| `backend/src/test/java/com/cremeco/pasteleria/audit/AuditQueryServiceTest.java` | test | 240 |
| `backend/src/test/java/com/cremeco/pasteleria/security/ManagementPermissionsTest.java` | test | 240 |
| `admin/src/features/reports/reportsApi.test.ts` | test | 180 |

> **SUPUESTO:** el runner de pruebas de `admin/` es Vitest + Testing Library según T28. Si T28
> define otra herramienta, se conserva el caso y se adapta el archivo.

### Casos límite (Edge Cases)

- Prueba ejecutada en una fecha distinta a la del fixture: debe pasar por `Clock` fijo, no por
  la fecha del sistema.
- Rango que cruza el cambio de horario de verano: se verifica que no falte ni sobre un día.
- CSV con celdas `=SUM(A1:A2)`, `+1`, `-1` o `@cmd`: se neutralizan sin romper el formato.
- Dos publicaciones simultáneas del mismo slug: una gana y la otra recibe `409`.
- Configuración con un valor inválido en medio del grupo: no se guarda ningún cambio.
- Auditoría con JSON anidado y claves sensibles: el enmascaramiento llega a todos los niveles.
- Usuario sin permiso que llama al endpoint directamente: `403`, sin datos en el cuerpo.

### Definition of Done

- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).
- [ ] Evidencia de ejecución adjunta al ticket (comando y resumen).
- [ ] Si una prueba revela un bug, el ticket afectado se reabre y la cicatriz se registra.

---

## Checklist de cierre del sprint

- [ ] T71 a T79 están en estado `Hecho` o `En revisión` con sus criterios marcados.
- [ ] El dashboard muestra KPIs reales de ventas, pedidos, stock y caja, sin datos mock.
- [ ] Los reportes filtran por fecha, respetan `America/Santiago` y exportan CSV válido.
- [ ] El blog tiene CRUD administrativo, API pública paginada y consumo real en el cliente.
- [ ] La configuración de tienda es clave-valor tipada, validada, versionada y auditable.
- [ ] La auditoría permite consultar, filtrar y ver el detalle antes/después con `audit.view`.
- [ ] Los permisos nuevos están en RBAC, probados con `200` y `403`, y el menú de la PWA los
  respeta.
- [ ] `./mvnw test` en verde; `npm run lint` y `npm run build` en 0 para `admin/` y `frontend/`.
- [ ] Contratos OpenAPI actualizados y tipos TypeScript regenerados si cambió un DTO.
- [ ] Migraciones `V50`, `V51` y `V52` aplicadas desde una base limpia y sin conflictos.
- [ ] `python tools/pca_annotator.py annotate` y `check` sin relaciones rotas ni archivos sin
  anotación; `graph` regenerado.
- [ ] `docs/estado_proyecto.md`, `docs/plan_sprints.md` y `docs/tickets/README.md` sincronizados.
- [ ] `docs/cicatrices_guerra.md` actualizado con los bugs resueltos.
- [ ] Commits propuestos por ticket; ningún commit, push ni merge ejecutado por la IA.
- [ ] Demostración funcional revisada por otro integrante y aprobada por el equipo.

## Criterios de salida

1. El panel de gestión muestra métricas reales y permite operar sin acceso a la base de datos.
2. Un administrador puede filtrar reportes y descargar el CSV con datos correctos y seguros.
3. Un editor puede crear, publicar, despublicar y previsualizar artículos; el cliente los lee
   desde la API pública y ya no usa `data/articles.ts`.
4. La configuración de tienda se edita desde la PWA con validación, concurrencia y auditoría.
5. La auditoría general es consultable por usuario, módulo, acción y fecha, con detalle
   antes/después y secretos enmascarados.
6. Las pruebas de T79 cubren agregaciones, CSV, blog, settings, auditoría y permisos, y pasan de
   forma determinista.
7. El sprint se considera cerrado solo cuando los siete puntos anteriores tienen evidencia y
   F1/F2 siguen aprobados. Cualquier cambio de alcance se refleja primero en el backlog.
