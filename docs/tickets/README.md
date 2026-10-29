<!-- @pca:start
@id(docs.tickets.readme)
@kind(doc)
@limit(lines: 160)
@relates(docs.plantilla_ticket, docs.plan_sprints, docs.backlog_requisitos)
@desc(Indice y reglas de los tickets detallados por sprint)
@pca:end -->

# Tickets de Ejecución — Índice

> **Fase:** F3 — Ejecución por tickets
> **Plantilla obligatoria:** [`docs/plantilla_ticket.md`](../plantilla_ticket.md)
> **Plan:** [`docs/plan_sprints.md`](../plan_sprints.md)
> **Backlog:** [`docs/backlog_requisitos.md`](../backlog_requisitos.md)

Cada archivo agrupa los tickets de un sprint. Un ticket solo se inicia cuando sus dependencias
están cerradas y F1/F2 están aprobados.

| Sprint | Archivo | Tickets | Objetivo |
| :--- | :--- | :--- | :--- |
| S0 | [`sprint-0-fundaciones.md`](./sprint-0-fundaciones.md) | T21–T29 | Monorepo, MySQL, Spring Boot, OpenAPI, PWA base y pruebas |
| S1 | [`sprint-1-identidad-rbac.md`](./sprint-1-identidad-rbac.md) | T30–T42 | Auth JWT, usuarios, roles, permisos y auditoría |
| S2 | [`sprint-2-catalogo.md`](./sprint-2-catalogo.md) | T43–T51 | Catálogo administrable y consumo real |
| S3 | [`sprint-3-compra.md`](./sprint-3-compra.md) | T52–T61 | Cupones, envíos, pedidos, pagos y checkout |
| S4 | [`sprint-4-pos-inventario.md`](./sprint-4-pos-inventario.md) | T62–T70 | POS, caja, stock, insumos, recetas y offline |
| S5 | [`sprint-5-gestion-ampliada.md`](./sprint-5-gestion-ampliada.md) | T71–T79 | Dashboard, reportes, blog, configuración y auditoría |
| S6 | [`sprint-6-integraciones-cierre.md`](./sprint-6-integraciones-cierre.md) | T80–T88 | Flow, seguridad, E2E, performance y cierre |
| S7 | [`sprint-7-dsy1104-produccion.md`](./sprint-7-dsy1104-produccion.md) | T89–T100 | Cumplimiento total Anexo 1 DSY1104 (Maquetado HTML/CSS -> Reglas -> React), MySQL DataSeeder, Escenarios Flow y VPS |

## Reglas de uso

1. No editar el `@id` ni el título del ticket sin actualizar el plan.
2. Si cambia el alcance, primero se actualiza el backlog y luego el ticket.
3. Los archivos compartidos (`App.tsx`, `application.yml`, `pom.xml`, `package.json`,
   `pca.config.json`, `estado_proyecto.md`) se asignan a un solo ticket a la vez.
4. Cada ticket usa una rama `feature/<ID>-<descripcion>` desde `develop`.
5. La IA propone el commit; no lo ejecuta sin aprobación.

## Validación automática

Antes de aceptar un sprint se comprueba que:

- Cada bloque tenga las secciones de la plantilla.
- Los IDs sean únicos y coincidan con `docs/plan_sprints.md`.
- Las dependencias existan y no formen ciclos.
- Cada ticket declare archivos, edge cases y Definition of Done.
- No haya dos tickets del mismo sprint con el mismo archivo principal.
