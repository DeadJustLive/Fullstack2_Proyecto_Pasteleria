<!-- @pca:start
@id(backend.service_identity.docs.decisions)
@kind(doc)
@limit(lines: 600)
@desc(Archivo doc auto-registrado por FIDA/OPL bootstrap (decisions.md))
@pca:end -->
# Registro de Decisiones Arquitectonicas (WAL) — `backend.identity`

## [2026-11-01] Integracion activa de conexion Redis (:6379) y diagnostico de salud (`T112`)

- **Contexto:** Se requeria correlacionar `service-identity` con el contenedor `cremeco-redis` en el puerto `6379` para preparar sesiones/tokens centralizados y verificacion de estado de la infraestructura en caliente.
- **Decision:** Se anade `spring-boot-starter-data-redis` en `pom.xml`, configuracion de host y puerto en `application.yml`, bean `RedisTemplate<String, Object>` en `RedisConfig` y endpoint de diagnostico de salud `GET /api/identity/health/redis` con ping reactivo al factory de conexiones.
- **Consecuencia:** Monitorizacion directa del estado de Redis desde el microservicio de identidad y trazabilidad de conectividad dentro de la red Docker.

## [2026-10-31] Gobernabilidad FIDA + OPL en `service-identity` (`T108`)

- **Contexto:** Adopcion integral del patron FIDA + OPL en el ecosistema de microservicios Spring Boot de Pasteleria Creme & Co sin alterar endpoints ni contratos REST existentes.
- **Decision:** Se registra el manifiesto local `docs/fida.module.json` y se anotan los controladores, servicios y repositorios nucleares de `service-identity` bajo contratos `@id`, `@kind`, `@limit`, `@contract` y `@relates`.
- **Consecuencia:** El microservicio `service-identity` queda protegido contra regresiones estructurales mediante `fida_opl.py check --strict` y `fida_opl.py guard` con riesgo cero para la logica de negocio.
