<!-- @pca:start
@id(docs.reglas_backend)
@kind(doc)
@limit(lines: 300)
@relates(docs.convenciones)
@relates(docs.estado_proyecto)
@desc(Reglas de backend: arquitectura modular Spring Boot, JPA, Flyway, RFC 7807 y convenciones de BD)
@pca:end -->

# Reglas de Backend y Base de Datos — Crème & Co

> **Instrucción para la IA:** Consulta este documento antes de modelar entidades,
> migraciones SQL, endpoints REST o lógica de negocio en Spring Boot.

---

## 1. Stack Tecnológico del Backend

| Componente | Tecnología | Versión / Convención |
| :--- | :--- | :--- |
| **Lenguaje** | Java | 21 (LTS) |
| **Framework** | Spring Boot | 3.3+ (Web, Security, Data JPA, Validation) |
| **Base de Datos** | MySQL | 8.0+ |
| **Migraciones** | Flyway | Nomenclatura `V<num>__<descripcion>.sql` |
| **Seguridad** | Spring Security + Nimbus JWT | Tokens de acceso (15 min) + Refresh tokens (7 días rotativos) |
| **Documentación API**| SpringDoc OpenAPI | OpenAPI 3.0 (`/v3/api-docs` y Swagger UI) |

---

## 2. Convenciones de Base de Datos (MySQL 8)

1. **Codificación:** Todas las tablas se crean explícitamente con:
   ```sql
   ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
   ```
2. **Nomenclatura:**
   * Tablas: plural en snake_case (`users`, `products`, `orders`, `order_items`).
   * Columnas: snake_case (`created_at`, `password_hash`, `codigo_seguimiento`).
   * Clave primaria: siempre `id BIGINT AUTO_INCREMENT PRIMARY KEY`.
   * Claves foráneas: `<singular_tabla>_id` (ej. `user_id`, `product_id`).
3. **Manejo de Dinero:**
   * **Prohibido el uso de `FLOAT` o `DOUBLE`** para valores monetarios.
   * La moneda oficial es **Pesos Chilenos (CLP)** sin decimales.
   * Se almacena como `BIGINT` en MySQL y `Long` en Java (en TypeScript como `number` entero).
4. **Fechas y Tiempos:**
   * Guardadas en UTC o con zona horaria oficial `America/Santiago`.
   * En JPA usar `Instant` o `OffsetDateTime`, serializados como strings ISO-8601.
5. **Auditoría:**
   * Toda tabla transaccional debe incluir `created_at DATETIME NOT NULL` y `updated_at DATETIME NOT NULL`.
   * Borrado lógico cuando aplique con `deleted_at DATETIME NULL`.

---

## 3. Arquitectura por Capas

El backend se organiza en módulos de dominio cohesivos bajo el paquete `com.cremeco.pasteleria`:

```text
com.cremeco.pasteleria/
  common/             -> BaseEntity, ProblemDetail, GlobalExceptionHandler, PageResponse
  identity/           -> Autenticación JWT, Usuarios, Roles, Permisos, Auditoría
  catalog/            -> Productos, Categorías, Variaciones, Opciones de personalización
  orders/             -> Máquina de estados de pedidos, checkout, seguimiento, recogida
  payments/           -> Pasarelas Webpay/Flow, webhooks, cupones de descuento
  inventory/          -> Control de stock, movimientos de inventario, caja POS
  content/            -> Artículos de blog, recetas y publicaciones de Home
```

Cada módulo sigue internamente:
* `controller/`: Controladores REST con Bean Validation (`@Valid`).
* `service/`: Interfaces de servicio e implementaciones con `@Transactional`.
* `repository/`: Repositorios Spring Data JPA (`JpaRepository`).
* `model/`: Entidades JPA anotadas (`@Entity`, `@Table`).
* `dto/`: Records o clases inmutables para request y response.

---

## 4. Respuestas de Error (RFC 7807)

Los errores de la API se responden siempre con formato `ProblemDetail`:

```json
{
  "type": "about:blank",
  "title": "Error de validación",
  "status": 400,
  "detail": "El formato del RUT ingresado no es válido.",
  "instance": "/api/v1/orders/CC-2025-001234/pickup",
  "code": "INVALID_RUT",
  "timestamp": "2026-10-24T17:30:00Z"
}
```

---

## 5. Autorización y Permisos (RBAC)

* La autorización se basa en **permisos** (`modulo.accion`), no únicamente en roles.
* El token JWT contiene en sus claims la lista de authorities del usuario.
* En los controladores se aplica seguridad declarativa:
  ```java
  @PreAuthorize("hasAuthority('orders.manage')")
  ```
