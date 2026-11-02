<!-- @pca:start
@id(backend.service_catalog.docs.decisions)
@kind(doc)
@limit(lines: 600)
@desc(Archivo doc auto-registrado por FIDA/OPL bootstrap (decisions.md))
@pca:end -->
# Registro de Decisiones Arquitectonicas (WAL) — `backend.catalog`

## [2026-11-02] Auto-migracion idempotente de columna imagen a MEDIUMTEXT (`T114` / `T115`)

- **Contexto:** Hibernate `ddl-auto: update` no modifica el tipo de datos de columnas preexistentes (por ejemplo de `VARCHAR(255)` a `MEDIUMTEXT`) en bases de datos ya inicializadas, lo que provocaba fallos de truncamiento al guardar Data URLs WebP.
- **Decision:** Implementar `DatabaseSchemaMigrator` con `@PostConstruct` que inspecciona `information_schema.COLUMNS` para la tabla `products` y ejecuta automáticamente `ALTER TABLE products MODIFY imagen MEDIUMTEXT NOT NULL` si el tipo no es `mediumtext`/`longtext`.
- **Consecuencia:** Soporte transparente de imagenes WebP auto-contenidas tanto en bases nuevas como en volumenes heredados o servidores VPS sin requerir scripts manuales.

## [2026-11-01] Integracion activa de Redis (:6379), Spring Cache e invalidacion automatica (`T112`)

- **Contexto:** El contenedor `cremeco-redis` estaba aprovisionado en Docker pero no era consumido activamente por `service-catalog`. Las consultas frecuentes de catalogo, ofertas y categorias requerian aceleracion en memoria con invalidacion inmediata ante cambios y degradacion elegante ante caidas.
- **Decision:** Se integra `spring-boot-starter-data-redis`, configurando `RedisTemplate<String, Object>` y `RedisCacheManager` con serializador JSON polimorfico Jackson (`JavaTimeModule`). Se crea `CatalogService` con `@Cacheable` en consultas y `@CacheEvict` en altas/modificaciones/bajas de productos y categorias. Se anade tolerancia a fallos mediante `CacheErrorHandler` y endpoint de salud `GET /api/catalog/health/redis`.
- **Consecuencia:** Rendimiento sub-milisegundo en lecturas repetidas de catalogo, consistencia garantizada al editar productos desde Admin PWA y cero interrupciones de servicio si Redis se reinicia.

## [2026-10-31] Gobernabilidad FIDA + OPL en `service-catalog` (`T108`)

- **Contexto:** Adopcion integral del patron FIDA + OPL en el ecosistema de microservicios Spring Boot de Pasteleria Creme & Co sin alterar endpoints ni contratos REST existentes.
- **Decision:** Se registra el manifiesto local `docs/fida.module.json` y se anotan los controladores, servicios y repositorios nucleares de `service-catalog` bajo contratos `@id`, `@kind`, `@limit`, `@contract` y `@relates`.
- **Consecuencia:** El microservicio `service-catalog` queda protegido contra regresiones estructurales mediante `fida_opl.py check --strict` y `fida_opl.py guard` con riesgo cero para la logica de negocio.
