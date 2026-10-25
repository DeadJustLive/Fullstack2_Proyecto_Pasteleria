# Sprint 2 — Catálogo (T43–T51)

## Propósito

Convertir el catálogo en un módulo real del backend: modelo persistido en MySQL 8, API pública de
solo lectura, API administrativa con permisos `catalog.view` / `catalog.manage`, gestión de imágenes
locales y consumo desde las dos aplicaciones (cliente React y PWA admin).

Al cerrar el sprint, la tienda y la PWA deben mostrar y administrar el mismo catálogo, sin datos
mock, y el contrato OpenAPI debe ser la única fuente de verdad de los DTO.

**Épica:** E03 — Catálogo · **Requisitos:** RF-021 a RF-028 · **Reglas:** RB-001, RB-004, RB-007,
RB-012, RB-020 · **Casos límite:** EC-003, EC-011, EC-017, EC-022, EC-025.

## Contexto técnico aprobado

| Capa | Stack y rutas |
| :--- | :--- |
| Cliente | `frontend/` · React 18 + TypeScript estricto + Vite 5 + React Router 7 + Tailwind v4 |
| Admin PWA | `admin/` · React 18 + TypeScript + Vite + Bootstrap 5 (sin Tailwind) |
| Backend | `backend/` · Spring Boot 3.5 + Java 21 + Maven Wrapper + JPA + Security + Flyway + MySQL 8 |
| Paquete Java | `com.cremeco.pasteleria` |
| Base de datos | MySQL 8 vía `infra/docker-compose.yml` |
| Contrato | springdoc OpenAPI; tipos TypeScript generados en T25 |
| Auth | JWT + RBAC dinámico; permisos `catalog.view` y `catalog.manage` |
| Imágenes | Almacenamiento local del backend, servidas por URL; `sharp` solo en el cliente cuando aplique |
| Puertos | 5173 cliente · 5174 admin · 8080 API · 3306 MySQL |

**Regla transversal:** el backend es la fuente de verdad de precios, stock, disponibilidad y
permisos. El frontend solo presenta y valida UX; nunca decide si un producto es comprable.

## Supuestos del sprint

1. **SUPUESTO:** las versiones Flyway `V20`, `V21` y `V22` quedan reservadas para T43 y T47. El
   coordinador confirma los números antes de abrir las ramas (regla de migraciones secuenciales).
2. **SUPUESTO:** la estructura `admin/src/{pages,services,components}` se crea en T27 y este sprint
   solo agrega las carpetas `catalog/`. Rutas exactas a confirmar al iniciar T50.
3. **SUPUESTO:** los endpoints públicos viven bajo `/api/v1/catalog/**` y los administrativos bajo
   `/api/v1/admin/**`; `SecurityConfig` (T33) habilita los públicos con `permitAll`.
4. **SUPUESTO:** el prefijo de API para el cliente se inyecta con `VITE_API_URL`
   (`http://localhost:8080/api/v1` en desarrollo); el valor real se documenta en `.env.example`.
5. **SUPUESTO:** los archivos de prueba declaran `@kind(test)`. Si el diccionario de
   `docs/sistema_anotaciones.md` aún no incluye ese valor, debe registrarse antes de anotar (T29/T51).
6. **SUPUESTO:** el catálogo del seed son los 11 productos vigentes de `frontend/src/data/products.ts`
   (incluye uno sin categorías y dos que reutilizan la misma fotografía).

## Índice de tickets

| ID | Título | Responsable | Prioridad | Depende de |
| :--- | :--- | :--- | :--- | :--- |
| T43 | Modelo de catálogo y datos semilla | Nicolas | Alta | T24 |
| T44 | API pública de catálogo | Nicolas | Alta | T43 |
| T45 | CRUD admin de categorías (API) | Anais | Alta | T43, T44 |
| T46 | CRUD admin de productos (API) | Anais | Alta | T43, T44 |
| T47 | Gestión de imágenes de producto | Nicolas | Media | T46 |
| T48 | Cliente: catálogo real en Home y Catálogo | Anais | Alta | T44 |
| T49 | Cliente: detalle de producto | Anais | Alta | T44, T48 |
| T50 | PWA: pantalla de catálogo | Anais | Alta | T44–T47 |
| T51 | Pruebas de catálogo y contrato | Nicolas | Media | T43–T50 |

## Orden de ejecución y dependencias

```text
T43 → T44 ─┬→ T45 ──┐
            ├→ T46 → T47 ─┐
            └→ T48 → T49 ─┤
                          └→ T50 → T51
```

Reglas de paralelización aplicables (`docs/plan_sprints.md`):

- T45 y T46 pueden ir en paralelo: no comparten controlador, servicio ni entidad de escritura.
- T48 puede iniciar cuando T44 publique el contrato aprobado, sin esperar T45/T46/T47.
- T47 toca `application.yml`; ningún otro ticket del sprint puede editar ese archivo a la vez.
- Dos tickets no editan el mismo archivo en paralelo (`ProductRepository`, `catalog-api.ts`,
  `Catalogo.tsx`, `ProductoDetalle.tsx` tienen dueño único por ticket).

---

# Ticket T43 — Modelo de catálogo y datos semilla

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 2
- **Rama sugerida:** feature/T43-modelo-catalogo
- **Responsable:** Nicolas
- **Prioridad:** alta
- **Depende de:** T24

## Contexto
Hoy el catálogo es un arreglo de TypeScript (`frontend/src/data/products.ts`): no se puede
administrar, no tiene stock y no es la fuente de verdad. Este ticket crea el esquema persistido
(`Category`, `Product`, `ProductImage`, relación many-to-many con categorías, variaciones, badge,
destacado, activo, stock y borrado lógico) y carga el seed con los productos actuales.

Traza: RF-021, RF-022, RF-023, RF-028, RB-001, RB-012, RB-020. Sin este ticket, T44–T51 no tienen
contrato de datos y T52 no puede referenciar productos.

## Convenciones aplicables
- CONV-NAM-05
- CONV-NAM-06
- CONV-EST-01
- CONV-TIP-02
- CONV-DOC-01
- CONV-GEN-05

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** entidades JPA del dominio `catalog`, tablas `categories`, `products`, `product_images`,
  `product_categories` y `product_variations`; enum de badge y de variación; precio CLP entero;
  stock inicial; `isFeatured`, `isActive`, `deletedAt`; timestamps; migraciones `V20` y `V21`;
  seed de 5 categorías y 11 productos con sus imágenes, badges, variaciones y destacados;
  `ProductRepository` base con búsqueda por slug y filtros de borrado lógico.
- **NO:** endpoints, DTO, servicios de negocio, subida de imágenes (T47), movimientos de inventario
  (S4), variantes con precio propio, multi-sucursal, jerarquía de categorías.

## Criterios de aceptación
- [ ] Desde una base vacía, `flyway:migrate` crea las cinco tablas con claves foráneas, índices y
      `CHECK` de precio y stock no negativos; `flyway:info` no deja migraciones pendientes.
- [ ] El seed inserta 5 categorías y los 11 productos de `frontend/src/data/products.ts`, con precio
      CLP entero, stock inicial mayor que cero, badge, variaciones, categorías y `destacado`
      equivalentes al mock actual.
- [ ] Un producto con `stock = 0` se persiste correctamente y queda marcado como no comprable por
      la condición de disponibilidad (RB-020), sin romper el seed.
- [ ] `deleted_at` distinto de nulo excluye el producto de las consultas base del repositorio
      (borrado lógico, RB-012) y las imágenes asociadas se conservan.
- [ ] `python tools/pca_annotator.py check` no reporta sobre-límites ni relaciones huérfanas en los
      archivos nuevos.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/resources/db/migration/V20__catalog_schema.sql` | config | 140 |
| `backend/src/main/resources/db/migration/V21__catalog_seed.sql` | config | 220 |
| `backend/src/main/java/com/cremeco/pasteleria/catalog/domain/Product.java` | model | 160 |
| `backend/src/main/java/com/cremeco/pasteleria/catalog/domain/Category.java` | model | 120 |
| `backend/src/main/java/com/cremeco/pasteleria/catalog/domain/ProductImage.java` | model | 100 |
| `backend/src/main/java/com/cremeco/pasteleria/catalog/repository/ProductRepository.java` | service | 60 |

## Casos límite (Edge Cases)
- Producto del seed sin categorías (Caja de Macarons): se inserta con cero filas en
  `product_categories` y sigue siendo válido.
- Dos productos reutilizan la misma imagen (`/imagen/torta.jpg`): se crean dos filas en
  `product_images`; `url` no es única y la relación es por producto.
- El seed se ejecuta dos veces sobre un volumen persistente: no duplica filas gracias a claves
  naturales y a `INSERT ... ON DUPLICATE KEY UPDATE`.
- Categoría repetida con distinta capitalización o con espacios extra: la restricción única sobre
  `name` normalizado la rechaza en la migración, no en el código.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).

---

# Ticket T44 — API pública de catálogo

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 2
- **Rama sugerida:** feature/T44-api-publica-catalogo
- **Responsable:** Nicolas
- **Prioridad:** alta
- **Depende de:** T43

## Contexto
El cliente necesita un catálogo consultable sin autenticación: listado con búsqueda, filtros por
categoría, variación y rango de precio, paginación, orden, destacados y detalle por id o slug.
Solo se exponen productos activos, no eliminados y comprables (RB-020), porque el backend es la
única fuente de verdad de precio y disponibilidad.

Traza: RF-024, RF-025, RF-028, RB-004, RB-020, EC-003.

## Convenciones aplicables
- CONV-GEN-03
- CONV-GEN-04
- CONV-NAM-01
- CONV-TIP-01
- CONV-TIP-02
- CONV-ERR-01
- CONV-ERR-04
- CONV-SEG-03
- CONV-SEG-04

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** `GET /api/v1/catalog/products` (q, category, variation, minPrice, maxPrice, featured,
  sort, page, size), `GET /api/v1/catalog/products/{idOrSlug}`, `GET /api/v1/catalog/filters`;
  DTO de resumen, detalle, página y facets; servicio de lectura; consultas tipadas; anotaciones
  OpenAPI; errores RFC 7807 con campo inválido.
- **NO:** escritura administrativa (T45/T46), imágenes (T47), carrito y precios de pedido (S3),
  búsqueda full-text con motor externo, caché HTTP, frontend.

## Criterios de aceptación
- [ ] El listado devuelve únicamente productos `is_active = true`, `deleted_at IS NULL` y
      `stock > 0`; `totalElements` y `totalPages` coinciden con los filtros aplicados.
- [ ] `q` busca en nombre y descripción sin distinguir mayúsculas ni tildes, y escapa los comodines
      `%` y `_` de SQL `LIKE`.
- [ ] Los filtros `category` y `variation` son repetibles y se combinan con OR dentro del mismo
      tipo y AND entre tipos; `minPrice`/`maxPrice` y `featured` se suman a la misma consulta.
- [ ] La paginación usa `page` base 0, `size` por defecto 12 y máximo 48; una página fuera de rango
      devuelve `200` con `content` vacío, nunca `500`.
- [ ] `sort` acepta solo `recent`, `price_asc`, `price_desc` y `name_asc`; cualquier otro valor
      devuelve `400` con el campo `sort` en el error.
- [ ] El detalle resuelve id numérico o slug; producto inactivo o eliminado devuelve `404`,
      producto con stock 0 devuelve `200` con `isPurchasable = false`.
- [ ] `GET /catalog/filters` entrega categorías activas con conteo, variaciones con conteo y rango
      de precios calculado solo sobre productos comprables.
- [ ] El contrato OpenAPI documenta todos los parámetros y esquemas; los tipos TypeScript
      generados en T25 no requieren ajustes manuales.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/java/com/cremeco/pasteleria/catalog/web/CatalogController.java` | component | 180 |
| `backend/src/main/java/com/cremeco/pasteleria/catalog/service/CatalogQueryService.java` | service | 200 |
| `backend/src/main/java/com/cremeco/pasteleria/catalog/repository/ProductQueryRepository.java` | service | 160 |
| `backend/src/main/java/com/cremeco/pasteleria/catalog/dto/ProductSummaryResponse.java` | model | 80 |
| `backend/src/main/java/com/cremeco/pasteleria/catalog/dto/ProductDetailResponse.java` | model | 110 |
| `backend/src/main/java/com/cremeco/pasteleria/catalog/dto/PageResponse.java` | model | 60 |
| `backend/src/main/java/com/cremeco/pasteleria/catalog/dto/CatalogFiltersResponse.java` | model | 80 |

## Casos límite (Edge Cases)
- Se solicita `page=99` con 3 elementos: la respuesta es `200` con lista vacía y metadatos
  correctos, para que el cliente pueda retroceder sin error.
- `minPrice` mayor que `maxPrice`: `400` con mensaje que indica ambos campos, sin ejecutar consulta.
- Categoría o variación inexistente: `200` con resultado vacío (no `404`), para no romper enlaces
  compartidos ni filtros guardados.
- El producto se desactiva entre el listado y el detalle (EC-003): el detalle responde `404` y el
  cliente debe ofrecer volver al catálogo.
- `size` negativo, cero o mayor que 48: se normaliza al rango permitido, no se lanza excepción de
  infraestructura.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).

---

# Ticket T45 — CRUD admin de categorías (API)

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 2
- **Rama sugerida:** feature/T45-crud-categorias
- **Responsable:** Anais
- **Prioridad:** alta
- **Depende de:** T43, T44

## Contexto
La PWA necesita administrar las categorías del catálogo sin tocar la base de datos. Este ticket
expone el CRUD administrativo con validación de nombre único, slug estable y activación lógica;
los permisos son `catalog.view` para lectura y `catalog.manage` para escritura.

Traza: RF-021, RB-007, RB-012, EC-011.

## Convenciones aplicables
- CONV-ERR-01
- CONV-ERR-02
- CONV-ERR-03
- CONV-ERR-04
- CONV-SEG-03
- CONV-SEG-04
- CONV-TIP-02
- CONV-NAM-06

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** `GET /api/v1/admin/categories` (incluye inactivas, orden por `sortOrder` y nombre),
  `POST`, `PUT /{id}` y `PATCH /{id}/status`; generación de slug; validación de nombre único sin
  distinguir mayúsculas; DTO de entrada/salida; 409 ante duplicados; 404 ante id inexistente.
- **NO:** borrado físico, jerarquía o subcategorías, asignación de productos (T46), pantalla de la
  PWA (T50), auditoría (T78), asignación masiva.

## Criterios de aceptación
- [ ] `GET /admin/categories` devuelve activas e inactivas ordenadas y exige `catalog.view`;
      sin token responde `401` y sin permiso `403`.
- [ ] `POST` y `PUT` exigen `catalog.manage`; crear una categoría válida devuelve `201` con el
      recurso y su slug normalizado.
- [ ] Un nombre repetido sin distinguir mayúsculas ni espacios devuelve `409` con el campo `name`
      en el cuerpo de error (RFC 7807).
- [ ] `PATCH /{id}/status` activa o desactiva sin borrar la categoría ni sus asociaciones, y la
      categoría desactivada deja de aparecer en los filtros públicos (T44).
- [ ] Se validan nombre de 2 a 80 caracteres, slug con patrón `[a-z0-9-]+` y `sortOrder >= 0`;
      los errores se devuelven por campo y juntos, no uno a la vez (CONV-ERR-03).

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/java/com/cremeco/pasteleria/catalog/web/AdminCategoryController.java` | component | 160 |
| `backend/src/main/java/com/cremeco/pasteleria/catalog/service/CategoryService.java` | service | 180 |
| `backend/src/main/java/com/cremeco/pasteleria/catalog/repository/CategoryRepository.java` | service | 60 |
| `backend/src/main/java/com/cremeco/pasteleria/catalog/dto/CategoryRequest.java` | model | 70 |
| `backend/src/main/java/com/cremeco/pasteleria/catalog/dto/CategoryResponse.java` | model | 70 |

## Casos límite (Edge Cases)
- Se desactiva la única categoría de un producto: el producto sigue visible en el catálogo público
  (sin categoría), siempre que esté activo y con stock.
- Dos administradores crean "Tortas" al mismo tiempo: la restricción única de base de datos se
  traduce a `409`, no a `500`.
- Nombre con espacios al inicio o al final: se aplica `trim` antes de validar y de comparar
  unicidad; el valor guardado no conserva los espacios.
- Acceso por URL directa sin `catalog.manage` (EC-011): `403` del backend aunque la UI oculte el
  botón.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).

---

# Ticket T46 — CRUD admin de productos (API)

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 2
- **Rama sugerida:** feature/T46-crud-productos
- **Responsable:** Anais
- **Prioridad:** alta
- **Depende de:** T43, T44

## Contexto
El administrador debe poder crear, editar, listar, activar/desactivar y eliminar lógicamente
productos, asignando categorías, variaciones, badge y destacado. Precio y stock se validan en el
backend porque son fuente de verdad para la tienda y, más adelante, para pedidos y POS.

Traza: RF-022, RB-001, RB-012, RB-020, EC-017.

## Convenciones aplicables
- CONV-GEN-03
- CONV-ERR-02
- CONV-ERR-03
- CONV-ERR-04
- CONV-NAM-06
- CONV-SEG-03
- CONV-SEG-04
- CONV-TIP-01
- CONV-TIP-02

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** `GET /api/v1/admin/products` con búsqueda, estado y borrado lógico; `POST`, `PUT /{id}`,
  `PATCH /{id}/status`, `PATCH /{id}/featured` y `DELETE /{id}` (borrado lógico); asignación de
  categorías many-to-many, variaciones y badge; validación de precio CLP entero y stock;
  generación de slug único; DTO administrativos.
- **NO:** imágenes (T47), movimientos y ajustes de inventario (T62–T63), variantes con precio
  propio, edición masiva, importación CSV, pantalla de la PWA (T50), auditoría (T78).

## Criterios de aceptación
- [ ] `POST /admin/products` crea el producto con al menos un nombre, precio CLP entero mayor que
      cero y stock mayor o igual a cero; devuelve `201` con id, slug y estado.
- [ ] `PUT /{id}` reemplaza datos, categorías y variaciones en una sola transacción; no quedan
      filas huérfanas en `product_categories` ni en `product_variations`.
- [ ] Un precio negativo, cero, decimal o mayor que 9.999.999 devuelve `400` con el campo `price`;
      un stock negativo devuelve `400` con el campo `stock` (EC-017), y la base también lo rechaza.
- [ ] `DELETE /{id}` marca `deleted_at` y `is_active = false` sin borrar la fila ni sus imágenes;
      el producto desaparece de la API pública y del listado administrativo por defecto.
- [ ] `GET /admin/products` lista activos e inactivos, permite filtrar por `q`, `category`,
      `isActive` y `includeDeleted`, y exige `catalog.view`.
- [ ] Toda escritura exige `catalog.manage`; sin permiso responde `403` y sin token `401`.
- [ ] Un slug o nombre que genere un slug ya existente devuelve `409` indicando el slug en
      conflicto, sin autogenerar sufijos silenciosos.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/java/com/cremeco/pasteleria/catalog/web/AdminProductController.java` | component | 220 |
| `backend/src/main/java/com/cremeco/pasteleria/catalog/service/ProductService.java` | service | 240 |
| `backend/src/main/java/com/cremeco/pasteleria/catalog/dto/ProductRequest.java` | model | 110 |
| `backend/src/main/java/com/cremeco/pasteleria/catalog/dto/AdminProductResponse.java` | model | 90 |
| `backend/src/main/java/com/cremeco/pasteleria/catalog/repository/ProductRepository.java` | service | 90 |

## Casos límite (Edge Cases)
- Producto con `stock = 0`: se guarda y se administra, pero la API pública no lo lista como
  comprable y el detalle lo marca `isPurchasable = false` (RB-020).
- Categoría inexistente o inactiva en el payload: `422` con el id ofensor; no se crea el producto
  a medias ni se descarta la categoría en silencio.
- Se edita un producto eliminado lógicamente: `404` (o `410` si se documenta en OpenAPI), nunca se
  "revive" por accidente.
- Dos productos con el mismo nombre pero distinto slug: se permite; la unicidad es del slug, no del
  nombre comercial.
- Producto sin categorías ni variaciones: válido; el catálogo lo muestra igual (caso Macarons).

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).

---

# Ticket T47 — Gestión de imágenes de producto

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 2
- **Rama sugerida:** feature/T47-imagenes-producto
- **Responsable:** Nicolas
- **Prioridad:** media
- **Depende de:** T46

## Contexto
Los productos necesitan varias imágenes ordenadas y una principal. Se almacenan en el backend y se
sirven por URL (supuesto aprobado 10 del backlog), con validación estricta de tipo y tamaño para
evitar ejecución de archivos y consumo excesivo de disco.

Traza: RF-023, EC-022, RNF-002, CONV-SEG-04.

## Convenciones aplicables
- CONV-ERR-01
- CONV-ERR-04
- CONV-GEN-03
- CONV-SEG-01
- CONV-SEG-02
- CONV-SEG-03
- CONV-SEG-04
- CONV-TIP-02

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** subida `multipart` por producto; validación de tipo real (magic bytes), tamaño máximo
  5 MB y dimensiones mínimas; nombres UUID; almacenamiento local bajo `${MEDIA_ROOT}`; servido
  estático de solo lectura en `/media/products/**`; orden, imagen principal y eliminación segura;
  alternativa de URL externa; migración `V22` con columnas de origen y metadatos.
- **NO:** CDN o almacenamiento cloud, recorte o redimensión en backend (`sharp` es del cliente),
  antivirus, borrado físico masivo, imágenes de blog (T74), galería de la PWA (T50).

## Criterios de aceptación
- [ ] `POST /admin/products/{id}/images` acepta JPEG, PNG y WebP de hasta 5 MB; cualquier otro tipo
      devuelve `415` y el exceso de tamaño `413`, ambos con mensaje RFC 7807 y sin escribir archivo.
- [ ] La validación usa magic bytes y no la extensión ni el `Content-Type` declarado: un ejecutable
      renombrado a `.jpg` se rechaza.
- [ ] El archivo se guarda con nombre UUID bajo `products/{productId}/` y se sirve en
      `/media/products/...` con `Content-Type` correcto, `Cache-Control` y solo método `GET`.
- [ ] Existe como máximo una imagen principal por producto; marcar una nueva degrada la anterior en
      la misma transacción y siempre queda una principal mientras haya imágenes.
- [ ] Reordenar exige el conjunto completo de imágenes del producto; ids ajenos devuelven `400` y no
      modifican ningún `sort_order`.
- [ ] Eliminar la imagen principal promueve la de menor `sort_order`; al eliminar la última, el
      producto queda sin imagen y el catálogo muestra el placeholder local.
- [ ] La alternativa de URL externa acepta solo `http`/`https` de hasta 500 caracteres y rechaza
      esquemas como `javascript:` o `data:` sin descargar la URL en el servidor.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/main/java/com/cremeco/pasteleria/catalog/web/ProductImageController.java` | component | 180 |
| `backend/src/main/java/com/cremeco/pasteleria/catalog/service/ProductImageService.java` | service | 220 |
| `backend/src/main/java/com/cremeco/pasteleria/catalog/storage/LocalImageStorage.java` | service | 160 |
| `backend/src/main/java/com/cremeco/pasteleria/config/MediaResourceConfig.java` | config | 60 |
| `backend/src/main/resources/application.yml` | config | 90 |
| `backend/src/main/resources/db/migration/V22__product_image_storage.sql` | config | 60 |

## Casos límite (Edge Cases)
- Imagen de 8 MB o formato GIF/HEIC (EC-022): se rechaza antes de escribir en disco y el error
  indica el límite y los formatos permitidos.
- Archivo corrupto con extensión `.png`: la detección de tipo falla y se responde `400`, sin dejar
  archivo huérfano.
- Nombre original con `../../application.yml` o caracteres de control: se descarta y se usa el UUID;
  nunca se concatena la ruta del cliente.
- Dos administradores marcan imagen principal al mismo tiempo: la restricción de unicidad y la
  transacción dejan una sola principal, sin error `500`.
- El borrado del archivo en disco falla después del commit: se registra en log y el archivo queda
  para limpieza controlada; la base no apunta a una fila inexistente.
- Producto eliminado lógicamente: sus imágenes dejan de exponerse en el catálogo, pero los archivos
  no se borran (histórico, RB-012).

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).

---

# Ticket T48 — Cliente: catálogo real en Home y Catálogo

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 2
- **Rama sugerida:** feature/T48-catalogo-real-cliente
- **Responsable:** Anais
- **Prioridad:** alta
- **Depende de:** T44

## Contexto
`Home.tsx` y `Catalogo.tsx` importan `data/products.ts`. Este ticket reemplaza esa fuente por el
servicio tipado de la API pública, conserva el diseño Tailwind y los componentes existentes
(`ProductCard`, `FiltroCheckbox`, `Skeleton`, `EmptyState`) y cubre los estados de carga, vacío y
error exigidos por RNF-003.

Traza: RF-024, RF-027, RF-028, RNF-001, RNF-003, RNF-010, EC-003, EC-025.

## Convenciones aplicables
- CONV-ERR-01
- CONV-ERR-04
- CONV-GEN-02
- CONV-GEN-03
- CONV-NAM-01
- CONV-NAM-04
- CONV-TIP-01
- CONV-TIP-02
- CONV-UI-01
- CONV-UI-02
- CONV-UI-04

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** `services/catalog-api.ts` tipado desde OpenAPI; `VITE_API_URL`; hook `useCatalog` con
  debounce, `AbortController` y reintento; Home con destacados reales; Catálogo con búsqueda,
  categoría, variación, precio, orden y paginación contra la API; filtros sincronizados con la URL;
  estados loading/empty/error/data; fallback de imagen; eliminación del import de
  `data/products.ts`.
- **NO:** detalle de producto (T49), carrito y checkout, login, rediseño visual o migración de CSS
  legacy (`src/mockup/`), SEO avanzado (T85), caché offline (T68).

## Criterios de aceptación
- [ ] Home obtiene los destacados desde `GET /catalog/products?featured=true&size=8`; si la API
      falla, muestra error con reintento y nunca cae de vuelta a datos mock.
- [ ] Catálogo envía búsqueda (debounce 300 ms), categorías, variaciones, rango de precio, orden y
      página a la API; cancela la petición anterior al cambiar de filtro.
- [ ] Los filtros y la página se reflejan en la query string: recargar, compartir el enlace o usar
      atrás/adelante del navegador reproduce el mismo resultado.
- [ ] Toda vista cubre loading (skeleton), vacío (`EmptyState` con "limpiar filtros"), error
      (mensaje + reintento) y datos, con grid responsive de 360 a 1440 px.
- [ ] `grep -r "data/products" frontend/src` no devuelve imports; el archivo se elimina si no queda
      ningún consumidor (si lo conserva otro módulo, se anota en `docs/estado_proyecto.md`).
- [ ] No se usan tipos locales duplicados ni `any`: los DTO vienen de los tipos generados y el
      mapeo a la vista es explícito (CONV-TIP-01, CONV-TIP-02).
- [ ] `npm run lint` y `npm run build` terminan en 0; no se agregan clases del snapshot.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `frontend/src/services/catalog-api.ts` | service | 150 |
| `frontend/src/hooks/useCatalog.ts` | hook | 130 |
| `frontend/src/pages/cliente/Catalogo.tsx` | component | 240 |
| `frontend/src/pages/cliente/Home.tsx` | component | 90 |
| `frontend/src/components/domain/ProductCard.tsx` | component | 130 |
| `frontend/.env.example` | config | 10 |

## Casos límite (Edge Cases)
- API caída o timeout (EC-025): se muestra error con reintento; no se renderiza una lista vacía
  como si el catálogo no tuviera productos.
- El catálogo real tiene 0 productos: estado vacío con CTA, filtros aún utilizables y contador en 0.
- Se cambia de filtro estando en la página 4 y el nuevo total tiene 1 página: se resetea a la
  página 0 para no pedir una página inexistente.
- Producto desactivado entre dos páginas (EC-003): el total baja y el grid se reacomoda sin
  elementos fantasma ni claves duplicadas de React.
- Imagen que responde 404: se muestra el placeholder local, sin ícono roto.
- Búsqueda con tildes o mayúsculas: el resultado coincide con el criterio del backend (T44).

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).

---

# Ticket T49 — Cliente: detalle de producto

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 2
- **Rama sugerida:** feature/T49-detalle-producto
- **Responsable:** Anais
- **Prioridad:** alta
- **Depende de:** T44, T48

## Contexto
La ruta `producto/:id` existe pero hoy apunta a `Placeholder`. El detalle debe cargar el producto
real por id o slug, mostrar imagen principal y galería, descripción, precio CLP, variaciones,
cantidad y agregar al carrito respetando stock, con estados de carga y 404.

Traza: RF-025, RF-028, RB-004, RB-020, RNF-003, RNF-010, EC-003.

## Convenciones aplicables
- CONV-ERR-01
- CONV-ERR-04
- CONV-GEN-03
- CONV-NAM-01
- CONV-TIP-01
- CONV-UI-02
- CONV-UI-03
- CONV-UI-04

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** `ProductoDetalle.tsx`, hook `useProductDetail`, galería con imagen principal primero,
  breadcrumb, badge, categorías y variaciones, precio con `formatPrecio`, `CantidadStepper`
  limitado por stock, alta real en `useCart`, estados loading/error/404, `document.title` y meta
  description, responsive y accesibilidad.
- **NO:** reseñas, productos relacionados, zoom avanzado, carrito nuevo, checkout, blog, SEO
  estructurado (T85), cambios de diseño fuera del detalle.

## Criterios de aceptación
- [ ] `producto/:id` carga el producto por id numérico o slug y muestra nombre, descripción,
      precio CLP, badge, categorías, variaciones e imágenes ordenadas con la principal primero.
- [ ] Mientras carga se muestra un skeleton con la estructura del detalle; un fallo de red muestra
      error con reintento, sin pantalla en blanco.
- [ ] Un id inexistente, un slug inválido o un producto inactivo/eliminado muestra 404 con enlace
      "Volver al catálogo" (EC-003).
- [ ] La cantidad se limita al stock disponible; el botón de agregar usa `useCart` y queda
      deshabilitado con mensaje cuando `isPurchasable = false` o el stock es 0 (RB-020).
- [ ] Navegar entre dos productos sin desmontar la página (cambio de `:id`) recarga los datos y
      reinicia la cantidad a 1.
- [ ] El título y la meta description se actualizan con el producto y se restauran al desmontar
      (RF-057), sin dejar metadatos del producto anterior.
- [ ] La vista es usable de 360 a 1440 px, con `alt` descriptivo, foco visible y navegación por
      teclado en galería y selector de cantidad.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `frontend/src/pages/cliente/ProductoDetalle.tsx` | component | 260 |
| `frontend/src/hooks/useProductDetail.ts` | hook | 100 |
| `frontend/src/components/domain/ProductGallery.tsx` | component | 120 |
| `frontend/src/components/domain/ProductNotFound.tsx` | component | 60 |
| `frontend/src/services/catalog-api.ts` | service | 180 |

## Casos límite (Edge Cases)
- El producto se desactiva mientras el cliente lo mira y recarga: 404 con CTA, sin agregar al
  carrito un producto no comprable.
- Stock 0 pero producto activo: se muestra como no disponible y el botón queda deshabilitado.
- El usuario fuerza `cantidad = 99` desde el stepper o el teclado: se ajusta al stock y se informa.
- Producto sin imágenes: se muestra el placeholder, sin galería vacía ni controles huérfanos.
- `:id` no numérico y sin coincidencia de slug: 404, no `500` ni pantalla de error genérica.
- Recarga directa sobre `/producto/{slug}`: funciona igual que con id.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).

---

# Ticket T50 — PWA: pantalla de catálogo

## Metadatos
- **Tipo:** feat
- **Fase / Sprint:** F3 · Sprint 2
- **Rama sugerida:** feature/T50-pwa-catalogo
- **Responsable:** Anais
- **Prioridad:** alta
- **Depende de:** T44–T47

## Contexto
La PWA admin necesita una pantalla de catálogo con tabla Bootstrap 5, filtros, creación y edición
de productos, gestión de imágenes y administración de categorías, respetando los permisos
`catalog.view` y `catalog.manage` definidos en T39.

Traza: RF-019, RF-021, RF-022, RF-023, RF-026, RB-007, EC-011, EC-022.

## Convenciones aplicables
- CONV-ERR-01
- CONV-ERR-04
- CONV-GEN-03
- CONV-NAM-02
- CONV-SEG-04
- CONV-TIP-01
- CONV-UI-02
- CONV-UI-03

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** `pages/catalog/CatalogPage.tsx`; tabla con paginación server-side; filtros por texto,
  categoría y estado; modales de crear/editar producto y categoría; gestor de imágenes (subir,
  principal, reordenar, eliminar, URL externa); estados loading/empty/error; visibilidad de
  acciones según permisos; confirmaciones de borrado lógico.
- **NO:** Tailwind, rediseño del shell, POS, inventario, blog, pedidos, edición masiva, drag and
  drop con librerías nuevas, auditoría (T78).

## Criterios de aceptación
- [ ] La tabla muestra nombre, categorías, precio CLP formateado, stock, estado, destacado y
      acciones; pagina y filtra contra la API, no en memoria.
- [ ] Crear y editar validan en el cliente para UX y muestran los errores `400`/`409` del backend
      por campo; un error de negocio nunca se oculta con un mensaje genérico.
- [ ] El gestor de imágenes permite subir, marcar principal, reordenar, eliminar y usar URL
      externa; los errores `413`/`415` se muestran junto al campo.
- [ ] Sin `catalog.view` no se accede a la ruta ni al menú (guard de T39); sin `catalog.manage` no
      se renderizan los botones de escritura y el backend además responde `403`.
- [ ] La pantalla cubre loading (spinner), vacío (mensaje + CTA "Crear producto") y error (alert
      con reintento), sin depender de recargar el navegador.
- [ ] Usa solo Bootstrap 5 y el tema del admin: 0 clases Tailwind y 0 componentes del cliente.
- [ ] La tabla es usable en 360 px mediante `table-responsive` y acciones accesibles por teclado y
      lector de pantalla.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `admin/src/pages/catalog/CatalogPage.tsx` | component | 220 |
| `admin/src/services/catalog-api.ts` | service | 170 |
| `admin/src/components/catalog/ProductFormModal.tsx` | component | 200 |
| `admin/src/components/catalog/CatalogTable.tsx` | component | 140 |
| `admin/src/components/catalog/CategoryManager.tsx` | component | 150 |
| `admin/src/components/catalog/ProductImageManager.tsx` | component | 180 |

## Casos límite (Edge Cases)
- Acceso por URL directa sin permiso (EC-011): el guard redirige con mensaje; el backend responde
  `403` aunque se fuerce la petición.
- Token expirado a mitad de una edición (EC-008): la capa HTTP detecta `401`, cierra sesión y avisa
  sin perder silenciosamente el formulario.
- Se cierra un modal con cambios sin guardar: se pide confirmación explícita.
- Otro administrador elimina el producto que se está editando: al guardar llega `404`/`409` y la
  lista se recarga para reflejar el estado real.
- Categoría duplicada al crearla: `409` visible en el campo `name`, con el formulario aún abierto.
- Imagen mayor a 5 MB: se avisa antes de enviar y, si se fuerza la petición, se muestra el `413`.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).

---

# Ticket T51 — Pruebas de catálogo y contrato

## Metadatos
- **Tipo:** test
- **Fase / Sprint:** F3 · Sprint 2
- **Rama sugerida:** feature/T51-pruebas-catalogo
- **Responsable:** Nicolas
- **Prioridad:** media
- **Depende de:** T43–T50

## Contexto
El sprint cierra con evidencia automatizada de que el catálogo público, el CRUD, las imágenes y los
permisos se comportan como dicen el backlog y el contrato. Sin estas pruebas no se puede declarar
cumplido el criterio de salida del sprint ni habilitar T52.

Traza: RF-064, RF-065, RNF-005, EC-011, EC-017, EC-022, EC-025.

## Convenciones aplicables
- CONV-DOC-05
- CONV-ERR-01
- CONV-GEN-02
- CONV-GEN-05
- CONV-TIP-01
- CONV-TIP-02

## Alcance (Qué SÍ / Qué NO)
- **SÍ:** pruebas de integración del listado, filtros, paginación, orden y detalle; CRUD y permisos
  (`401`/`403`); imágenes (tipo, tamaño, principal, borrado, servido estático); validación del
  documento OpenAPI; pruebas de los servicios y componentes del cliente (lista y detalle).
- **NO:** pruebas E2E con Playwright (T84), pruebas de pedidos o concurrencia de stock (T61),
  performance/Lighthouse (T85), pruebas del POS (T70), auditoría (T78).

## Criterios de aceptación
- [ ] `CatalogApiIT` cubre combinaciones de búsqueda, categoría, variación, rango de precio,
      destacado, orden y paginación, y verifica que productos inactivos, eliminados o sin stock no
      aparezcan.
- [ ] `ProductAdminIT` cubre creación, edición, activación, borrado lógico y validaciones
      (`400` por precio/stock, `409` por slug) además de `401` sin token y `403` sin
      `catalog.manage`.
- [ ] `ProductImageIT` cubre subida válida, `415` por formato, `413` por tamaño, principal única,
      reordenamiento, eliminación con promoción de principal y servido estático (`200` y `404`).
- [ ] `OpenApiContractTest` valida la especificación generada por springdoc y falla de forma
      explícita si un endpoint o DTO cambia sin actualizar el contrato.
- [ ] Pruebas de cliente: `catalog-api` (parámetros, error, 404), `Catalogo` (loading, vacío,
      error, datos, cambio de filtro) y `ProductoDetalle` (404, stock 0, agregar al carrito).
- [ ] `mvnw test` y `npm run test -- --run` pasan en local desde una base limpia; ninguna prueba
      depende del orden de ejecución ni deja datos mutados en el seed.
- [ ] Cobertura mínima del módulo: **SUPUESTO** 70 % en `catalog.service` y 60 % en `catalog.web`;
      el umbral se configura en T28 y se documenta si cambia.

## Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/src/test/java/com/cremeco/pasteleria/catalog/CatalogApiIT.java` | test | 220 |
| `backend/src/test/java/com/cremeco/pasteleria/catalog/ProductAdminIT.java` | test | 240 |
| `backend/src/test/java/com/cremeco/pasteleria/catalog/ProductImageIT.java` | test | 200 |
| `backend/src/test/java/com/cremeco/pasteleria/contract/OpenApiContractTest.java` | test | 140 |
| `frontend/src/services/catalog-api.test.ts` | test | 150 |
| `frontend/src/pages/cliente/Catalogo.test.tsx` | test | 170 |
| `frontend/src/pages/cliente/ProductoDetalle.test.tsx` | test | 160 |

## Casos límite (Edge Cases)
- La base de datos no responde al arrancar las pruebas (EC-025): el fallo se reporta con causa
  explícita; si se usa Testcontainers sin Docker, la suite se omite de forma visible, nunca en
  silencio (CONV-ERR-01).
- El contrato OpenAPI cambia sin actualizar el snapshot: el test muestra el diff del campo o
  endpoint afectado, no un error genérico.
- Producto del seed sin imágenes o sin categorías: se usa como caso de prueba del placeholder y de
  relaciones vacías, sin fabricar datos que oculten el problema.
- Se ejecutan dos veces los `IT` sobre el mismo esquema: gracias al rollback por prueba, los
  conteos del seed no cambian.

## Definition of Done
- [ ] La tarea cumple todos los criterios de aceptación.
- [ ] Se respetan las convenciones listadas.
- [ ] Se respetan los `@limit` de los archivos tocados.
- [ ] Pruebas pasadas (ver F4 — Validación).
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Si hubo un bug resuelto, está registrado en `docs/cicatrices_guerra.md`.
- [ ] Commit propuesto (la IA no commitea sola — ver `docs/git.md`).

---

## Checklist de cierre del sprint

- [ ] T43 a T51 tienen todos sus criterios de aceptación marcados y evidencia adjunta.
- [ ] Las migraciones `V20`, `V21` y `V22` se aplican desde una base vacía con `docker compose up`
      y `flyway:migrate`, sin pasos manuales.
- [ ] El contrato OpenAPI está actualizado y los tipos TypeScript regenerados sin `any`.
- [ ] `mvnw test`, `npm run lint`, `npm run test -- --run` y `npm run build` pasan en cliente y
      admin (0 errores y 0 advertencias nuevas).
- [ ] Ningún archivo del cliente importa `data/products.ts`; el catálogo visible proviene de la API.
- [ ] Las dos apps consumen el mismo catálogo: un producto creado en la PWA aparece en la tienda
      tras recargar, y uno desactivado desaparece de la tienda.
- [ ] Los permisos `catalog.view` y `catalog.manage` están probados en API y verificados en la PWA
      (menú, ruta y botones).
- [ ] `python tools/pca_annotator.py check` no reporta sobre-límites ni relaciones huérfanas.
- [ ] `docs/estado_proyecto.md`, `docs/cicatrices_guerra.md` y el tablero de `docs/plan_sprints.md`
      reflejan el estado real del sprint.
- [ ] Cada ticket dejó su mensaje de commit propuesto; los merges a `develop` fueron revisados por
      otro integrante.

## Criterios de salida

1. Catálogo administrable de punta a punta: categorías, productos, imágenes y estados gestionados
   desde la PWA contra la API, sin editar la base de datos.
2. Catálogo visible desde la API: Home y Catálogo del cliente muestran datos reales, con búsqueda,
   filtros, orden, paginación y detalle por id o slug, y sin datos mock.
3. Reglas de negocio verificadas: precio CLP entero (RB-001), borrado lógico (RB-012), producto
   inactivo o sin stock no comprable (RB-020) y permisos validados en el backend (RB-007).
4. Calidad y contrato: pruebas de listado, CRUD, imágenes y permisos en verde, OpenAPI validado y
   migraciones reproducibles desde cero.
5. Sin regresiones en el diseño: el cliente conserva Tailwind y su design system, la PWA conserva
   Bootstrap 5 y ninguna app carga el framework de la otra (RNF-001).

> Cierre habilitado para T52 (modelo de pedidos) solo con aprobación explícita del equipo y el
> sprint marcado como `Hecho` en `docs/plan_sprints.md`.
