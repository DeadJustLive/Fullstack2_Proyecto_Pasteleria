<!-- @pca:start
@id(backend.api_gateway.docs.decisions)
@kind(doc)
@limit(lines: 600)
@desc(Archivo doc auto-registrado por FIDA/OPL bootstrap (decisions.md))
@pca:end -->
# Registro de Decisiones Arquitectonicas (WAL) — `backend.apiGateway`

## [2026-10-31] Gobernabilidad FIDA + OPL en `api-gateway` (`T108`)

- **Contexto:** Adopcion integral del patron FIDA + OPL en el ecosistema de microservicios Spring Boot de Pasteleria Creme & Co sin alterar endpoints ni contratos REST existentes.
- **Decision:** Se registra el manifiesto local `docs/fida.module.json` y se anotan los controladores, servicios y repositorios nucleares de `api-gateway` bajo contratos `@id`, `@kind`, `@limit`, `@contract` y `@relates`.
- **Consecuencia:** El microservicio `api-gateway` queda protegido contra regresiones estructurales mediante `fida_opl.py check --strict` y `fida_opl.py guard` con riesgo cero para la logica de negocio.
