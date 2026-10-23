<!-- @pca:start
@id(docs.plan_sprints)
@kind(doc)
@limit(lines: 500)
@relates(docs.backlog_requisitos, docs.estado_proyecto, docs.convenciones, docs.git)
@desc(Plan F2: olas, sprints, tablero de tickets, dependencias y reglas de paralelizacion)
@pca:end -->

# Plan de Sprints — Crème & Co

> **Fase:** F2 — Plan de Sprints · **Estado:** En revisión
> **Backlog:** [`docs/backlog_requisitos.md`](./backlog_requisitos.md)
> **Tickets detallados:** [`docs/tickets/`](./tickets/)
> **Regla:** no se inicia un ticket si sus dependencias no están cerradas y aprobadas.

---

## 1. Principios de ejecución

1. **Un ticket = una unidad verificable.** No se mezclan módulos en una misma rama.
2. **Contratos primero.** Si un ticket cambia un DTO, endpoint o tabla, actualiza el contrato antes del código.
3. **Sin solapamiento de archivos.** Dos tickets no editan el mismo archivo en paralelo.
4. **Migraciones secuenciales.** Flyway asigna un número de versión único por ticket.
5. **Verde antes de cerrar.** `mvnw test`, `npm run lint`, `npm run build` y pruebas del módulo deben pasar.
6. **Evidencia.** Cada ticket deja criterios marcados, pruebas y actualización de `docs/estado_proyecto.md`.
7. **Aprobación.** F1 y F2 se aprueban antes de pasar a F3. La IA no avanza sola.

---

## 2. Olas y sprints

| Sprint | Objetivo | Tickets | Criterio de salida |
| :--- | :--- | :--- | :--- |
| **S0 — Fundaciones** | Monorepo, MySQL, Spring Boot, OpenAPI, PWA base y pruebas | T21–T29 | `docker compose up`, API con healthcheck, OpenAPI publicado, PWA compila, tests configurados |
| **S1 — Identidad y RBAC** | Auth JWT, usuarios, roles, permisos, auditoría y guards | T30–T42 | Login real, matriz de permisos editable, PWA y cliente autenticados, tests de seguridad |
| **S2 — Catálogo** | Productos, categorías, imágenes y consumo real en cliente/PWA | T43–T51 | Catálogo administrable y visible desde la API, sin datos mock |
| **S3 — Compra** | Cupones, envíos, pedidos, pagos simulados y checkout | T52–T61 | Compra de punta a punta con stock, idempotencia y confirmación |
| **S4 — POS e inventario** | Caja, POS, stock, insumos, recetas y offline | T62–T70 | Venta POS online/offline sincronizada y stock consistente |
| **S5 — Gestión ampliada** | Dashboard, reportes, blog, configuración y auditoría | T71–T79 | Panel completo con métricas, exportación y contenido |
| **S6 — Integraciones y cierre** | Flow, seguridad, E2E, performance y documentación | T80–T88 | Flujos críticos E2E, PWA instalable, Flow conmutable y docs cerradas |

---

## 3. Tablero de tickets

Estados: `Pendiente` · `En curso` · `En revisión` · `Hecho` · `Bloqueado`.

| ID | Título | Sprint | Responsable | Prioridad | Depende de | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| T21 | Estructura del monorepo y documentación base | S0 | Matias | Alta | — | Pendiente |
| T22 | MySQL 8 con Docker Compose | S0 | Nicolas | Alta | T21 | Pendiente |
| T23 | Esqueleto Spring Boot, perfiles y CORS | S0 | Matias | Alta | T21, T22 | Pendiente |
| T24 | Flyway baseline y reglas de migración | S0 | Matias | Alta | T23 | Pendiente |
| T25 | OpenAPI y tipos TypeScript compartidos | S0 | Matias | Alta | T23 | Pendiente |
| T26 | Plantilla de módulo backend y errores RFC 7807 | S0 | Matias | Alta | T23 | Pendiente |
| T27 | PWA admin: Vite, React, Bootstrap y shell | S0 | Anais | Alta | T21 | Pendiente |
| T28 | Configuración de pruebas backend y frontend | S0 | Nicolas | Alta | T23, T27 | Pendiente |
| T29 | Manifiesto PCA, README y docs de estado | S0 | Anais | Media | T21–T28 | Pendiente |
| T30 | Modelo de usuarios, roles y permisos | S1 | Nicolas | Alta | T24, T26 | Pendiente |
| T31 | Registro público de clientes | S1 | Nicolas | Alta | T30 | Pendiente |
| T32 | Login con JWT, refresh y logout | S1 | Matias | Alta | T30 | Pendiente |
| T33 | SecurityConfig, filtro JWT y authorities | S1 | Matias | Alta | T32 | Pendiente |
| T34 | `/auth/me`, perfil y cambio de contraseña | S1 | Nicolas | Alta | T33 | Pendiente |
| T35 | CRUD de usuarios en la PWA | S1 | Nicolas | Alta | T30, T33 | Pendiente |
| T36 | CRUD de roles y matriz de permisos | S1 | Nicolas | Alta | T30 | Pendiente |
| T37 | Asignación de roles y salvaguardas | S1 | Nicolas | Alta | T35, T36 | Pendiente |
| T38 | Auditoría de identidad | S1 | Nicolas | Media | T36, T37 | Pendiente |
| T39 | PWA: login, guards y menú por permisos | S1 | Anais | Alta | T27, T34 | Pendiente |
| T40 | PWA: pantallas Usuarios y Roles | S1 | Anais | Alta | T35–T39 | Pendiente |
| T41 | Cliente React: autenticación real y guards | S1 | Anais | Alta | T34, T39 | Pendiente |
| T42 | Pruebas de seguridad y matriz de permisos | S1 | Nicolas | Alta | T30–T38 | Pendiente |
| T43 | Modelo de catálogo y datos semilla | S2 | Nicolas | Alta | T24 | Pendiente |
| T44 | API pública de catálogo | S2 | Nicolas | Alta | T43 | Pendiente |
| T45 | CRUD admin de categorías | S2 | Anais | Alta | T43, T44 | Pendiente |
| T46 | CRUD admin de productos | S2 | Anais | Alta | T43, T44 | Pendiente |
| T47 | Gestión de imágenes de producto | S2 | Nicolas | Media | T46 | Pendiente |
| T48 | Cliente: catálogo real en Home y Catálogo | S2 | Anais | Alta | T44 | Pendiente |
| T49 | Cliente: detalle de producto | S2 | Anais | Alta | T44, T48 | Pendiente |
| T50 | PWA: pantalla de catálogo | S2 | Anais | Alta | T44–T47 | Pendiente |
| T51 | Pruebas de catálogo y contrato | S2 | Nicolas | Media | T43–T50 | Pendiente |
| T52 | Modelo de pedidos, cupones, envíos y pagos | S3 | Matias | Alta | T24, T43 | Pendiente |
| T53 | API de cupones y CRUD admin | S3 | Nicolas | Alta | T52 | Pendiente |
| T54 | API de zonas, tarifas y cotización | S3 | Nicolas | Alta | T52 | Pendiente |
| T55 | OrderService, estados e idempotencia | S3 | Matias | Alta | T52 | Pendiente |
| T56 | PaymentProvider simulado y webhook base | S3 | Matias | Alta | T52, T55 | Pendiente |
| T57 | Checkout backend y validación transaccional | S3 | Matias | Alta | T53–T56 | Pendiente |
| T58 | Cliente: checkout real y confirmación | S3 | Anais | Alta | T48, T57 | Pendiente |
| T59 | Cliente: perfil, historial y seguimiento | S3 | Anais | Alta | T57, T58 | Pendiente |
| T60 | PWA: pantalla de pedidos y transiciones | S3 | Anais | Alta | T55, T57 | Pendiente |
| T61 | Pruebas de compra, concurrencia y doble submit | S3 | Nicolas | Alta | T53–T60 | Pendiente |
| T62 | Modelo de inventario de productos | S4 | Nicolas | Alta | T43 | Pendiente |
| T63 | API de inventario y pantalla PWA | S4 | Nicolas | Alta | T62 | Pendiente |
| T64 | Modelo de insumos y recetas | S4 | Matias | Alta | T43 | Pendiente |
| T65 | API de insumos, recetas y producción | S4 | Matias | Alta | T64 | Pendiente |
| T66 | POS backend: caja, ventas y arqueo | S4 | Matias | Alta | T55, T57, T62 | Pendiente |
| T67 | PWA POS: UI, ticket y cobro | S4 | Anais | Alta | T66 | Pendiente |
| T68 | PWA: manifest, service worker y caché | S4 | Anais | Media | T27 | Pendiente |
| T69 | POS offline: IndexedDB, cola y sincronización | S4 | Matias | Alta | T67, T68 | Pendiente |
| T70 | Pruebas de POS y offline | S4 | Nicolas | Alta | T66–T69 | Pendiente |
| T71 | Dashboard de KPIs | S5 | Matias | Media | T55, T57, T62, T66 | Pendiente |
| T72 | Reportes backend y exportación CSV | S5 | Matias | Media | T55, T62, T66 | Pendiente |
| T73 | PWA: reportes y gráficos | S5 | Anais | Media | T71, T72 | Pendiente |
| T74 | Blog backend y API pública | S5 | Nicolas | Media | T43 | Pendiente |
| T75 | PWA: CRUD del blog | S5 | Anais | Media | T74 | Pendiente |
| T76 | Cliente: blog y Home | S5 | Anais | Media | T74, T48 | Pendiente |
| T77 | Configuración de tienda y PWA | S5 | Nicolas | Media | T30 | Pendiente |
| T78 | Auditoría general y pantalla PWA | S5 | Nicolas | Media | T38, T77 | Pendiente |
| T79 | Pruebas de reportes, blog, settings y auditoría | S5 | Nicolas | Media | T71–T78 | Pendiente |
| T80 | Adaptador Flow y webhook | S6 | Matias | Alta | T56, T57 | Pendiente |
| T81 | Pruebas de Flow y documentación | S6 | Nicolas | Alta | T80 | Pendiente |
| T82 | PWA offline hardening y conflictos | S6 | Matias | Media | T69, T73 | Pendiente |
| T83 | Endurecimiento de seguridad | S6 | Nicolas | Alta | T33, T42, T57, T66 | Pendiente |
| T84 | E2E con Playwright | S6 | Anais | Alta | T58, T60, T67, T69 | Pendiente |
| T85 | Performance, SEO y Lighthouse | S6 | Anais | Media | T48, T49, T58, T59, T76 | Pendiente |
| T86 | Migración final y eliminación de mockup | S6 | Anais | Media | T48, T49, T76 | Pendiente |
| T87 | Documentación final y cicatrices | S6 | Matias | Media | T84–T86 | Pendiente |
| T88 | Cierre F4/F5 y extracción de componentes | S6 | Matias | Media | T87 | Pendiente |

---

## 4. Ruta crítica

```text
T21 → T22 → T23 → T24 → T30 → T32 → T33 → T34 → T39 → T41
                                      ↘ T35 → T37
T24 → T43 → T44 → T48 → T49
T43 → T52 → T55 → T56 → T57 → T58 → T59
T43 → T62 → T66 → T67 → T69 → T82 → T84
T80 → T81 → T84 → T87 → T88
```

La ruta crítica pasa por **fundaciones → identidad → catálogo → pedidos → POS**. Cualquier retraso
en T23, T30, T43, T52 o T66 retrasa el cierre.

---

## 5. Reglas de paralelización

### Permitido en paralelo

- Migraciones de módulos distintos, siempre con números Flyway reservados por el coordinador.
- Un ticket backend y uno frontend que solo se comunican por contrato ya acordado.
- Pantallas de la PWA de módulos distintos (cada una en su carpeta de `admin/src/pages/`).
- Tickets de pruebas que solo agregan archivos nuevos en carpetas distintas.

### Prohibido en paralelo

- Dos tickets que editan `App.tsx`, `application.yml`, `pom.xml`, `package.json`, `pca.config.json` o `docs/estado_proyecto.md`.
- Dos migraciones Flyway con el mismo número.
- Dos tickets que tocan el mismo servicio, controlador o entidad.
- Implementar frontend contra un contrato que aún no está aprobado.

### Límite operativo

- Máximo **3 frentes simultáneos** (uno por integrante) para mantener revisión y merges sanos.
- Cada frente abre su rama desde `develop` según `docs/git.md`.
- Antes de aceptar un ticket: revisión de otro integrante + validación automática.

---

## 6. Definition of Done global

- [ ] Criterios de aceptación del ticket marcados.
- [ ] Convenciones de `docs/convenciones.md` respetadas.
- [ ] `@limit` respetados y anotaciones PCA actualizadas.
- [ ] Pruebas del módulo pasando.
- [ ] `npm run lint` y `npm run build` en 0 (frontend/admin) o `mvnw test` (backend).
- [ ] Contrato OpenAPI actualizado si cambió un endpoint o DTO.
- [ ] Migración Flyway incluida si cambió el esquema.
- [ ] `docs/estado_proyecto.md` actualizado.
- [ ] Cicatriz registrada en `docs/cicatrices_guerra.md` si hubo bug.
- [ ] Mensaje de commit propuesto; la IA no commitea sola.

---

## 7. Riesgos del plan

| Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- |
| Alcance amplio (68 tickets) | Alto | Olas cerradas; no se abre un sprint sin cerrar el anterior |
| RBAC dinámico mal diseñado | Alto | T30/T36/T42 con matriz de permisos y pruebas dedicadas |
| POS offline complejo | Alto | Aislado en T69/T82; idempotencia y cola de conflictos |
| Flow acoplado a pedidos | Medio | Interfaz `PaymentProvider` desde T56 |
| Migraciones Flyway en conflicto | Medio | Coordinador asigna versión única por ticket |
| Dos apps y CORS | Medio | T23/T27 configuran orígenes desde el inicio |
| Archivos compartidos | Medio | Regla de no solapamiento y merges frecuentes |
| Cambios de alcance | Medio | Se reflejan primero en backlog y luego en tickets |

---

## 8. Validación antes de aceptar F2

1. Cada ticket tiene bloque completo según `docs/plantilla_ticket.md`.
2. Los IDs son únicos y consecutivos desde T21.
3. Las dependencias existen y no hay ciclos.
4. Cada ticket declara archivos, edge cases y DoD.
5. La tabla de este plan coincide con los archivos de `docs/tickets/`.
6. `python tools/pca_annotator.py check` no reporta problemas en los documentos anotados.

---

## 9. Próximo paso

Aprobación explícita de F1/F2. Después se habilita F3 y se comienza por **T21 — Estructura del
monorepo**, seguido de T22, T23 y los frentes paralelos permitidos.
