<!-- @pca:start
@id(docs.tickets.sprint9)
@kind(doc)
@limit(lines: 480)
@relates(docs.estado_proyecto)
@relates(docs.convenciones)
@relates(docs.tickets.readme)
@desc(Tickets T106 a T109 para adopcion integral no destructiva del patron FIDA + OPL en frontend, admin-pwa y los 6 microservicios backend restantes)
@pca:end -->
# Sprint 9 — Adopción Integral del Patrón de Diseño FIDA + OPL (Riesgo 0% / No Destructiva)

> **Fase:** F4/F5 — Potenciación Arquitectónica FIDA + OPL · **Sprint:** S9 · **Tickets:** T106–T109
> **Estado:** Hecho (100% completado) · **Última actualización:** 2026-10-31
> **Estrategia de Seguridad:** Composición por Fachada No Destructiva + Triple Compilación (`frontend`, `admin-pwa`, `backend`) + Doble Sello FIDA (`check --strict` + `guard`).

---

## Propósito del Sprint 9

Extender el patrón de diseño **FIDA + OPL** al 100% de las capas del monorepo (**Tienda Clientes `frontend/`**, **Panel `admin-pwa/`** y los **6 microservicios `backend/` restantes**) con **0% de riesgo de regresión funcional**:

1. **Ticket T108 (Orden 1° — Riesgo 0% Absoluto):** Gobernanza FIDA (`docs/fida.module.json`, `docs/decisions.md` y `.snapshot.json` WAL Guard) en los 6 microservicios Spring Boot restantes (`api-gateway`, `service-identity`, `service-catalog`, `service-order`, `service-inventory`, `service-notification`).
2. **Ticket T106 (Orden 2° — Composición FIDA en `frontend/`):** Creación e integración no destructiva de los módulos de dominio FIDA con sus 5 subcarpetas (`interfaces/`, `dependencies/`, `implementation/`, `components/`, `docs/`) en `frontend/src/features/` (`CatalogDiscovery`, `CheckoutSummary`, `CustomerTracking`, `CustomCakeQuote`).
3. **Ticket T107 (Orden 3° — Composición FIDA en `admin-pwa/`):** Creación e integración no destructiva de los módulos FIDA con sus 5 subcarpetas en `admin-pwa/src/features/` (`AdminBoletaSii`, `AdminCriticalStock`, `AdminKardexPos`, `AdminRbacMatrix`).
4. **Ticket T109 (Orden 4° — Autodescubrimiento `bootstrap --apply`, `sync` y Sellado 100%):** Inyección de cabeceras `@pca:start` en todos los archivos restantes del proyecto, sincronización total de manifiestos y validación final con `check --strict`, `guard`, `graph` y compilación de las 3 capas.

---

## Índice de Tickets y Orden de Ejecución Seguro

| Orden | ID | Título | Capa Principal | Riesgo | Depende de | Estado |
| :---: | :--- | :--- | :--- | :---: | :--- | :---: |
| **1°** | [T108](#ticket-t108--gobernanza-fida--wal-guard-en-los-6-microservicios-backend-restantes) | Gobernanza FIDA + WAL Guard en los 6 microservicios Backend restantes | `backend/*/docs/` | **0% (Nulo)** | T105 | Hecho |
| **2°** | [T106](#ticket-t106--módulos-fida-de-5-subcarpetas-en-frontendsrcfeatures-composición-no-destructiva) | Módulos FIDA de 5 subcarpetas en `frontend/src/features/` (Composición no destructiva) | `frontend/src/features/` | **0% (Fachada)** | T108 | Hecho |
| **3°** | [T107](#ticket-t107--módulos-fida-de-5-subcarpetas-en-admin-pwasrcfeatures-composición-no-destructiva) | Módulos FIDA de 5 subcarpetas en `admin-pwa/src/features/` (Composición no destructiva) | `admin-pwa/src/features/` | **0% (Fachada)** | T108 | Hecho |
| **4°** | [T109](#ticket-t109--autodescubrimiento-global-bootstrap---apply-sync-y-sellado-total-100-fida) | Autodescubrimiento global (`bootstrap --apply`), `sync` y sellado total 100% FIDA | Monorepo Completo | **0% (Nulo)** | T106, T107, T108 | Hecho |

---

## Detalle de Tickets (Metodología PCA + FIDA)

### Ticket T108 — Gobernanza FIDA + WAL Guard en los 6 microservicios Backend restantes

#### Análisis PCA
- **P (Por qué):** Actualmente solo `service-payment-flow` cuenta con manifiesto modular `docs/fida.module.json`, registro ADR `docs/decisions.md` y snapshot criptográfico `.snapshot.json`. Necesitamos que los otros 6 servicios (`api-gateway`, `service-identity`, `service-catalog`, `service-order`, `service-inventory`, `service-notification`) también estén protegidos por el Guardián WAL (`fida_opl.py guard`).
- **C (Cómo):** Anotar las clases Java de los 6 servicios con sus cabeceras `@pca:start`, generar en cada servicio su carpeta `docs/` con `decisions.md` y `fida.module.json`, registrarlos en `fida.config.json` y sellar sus snapshots con `fida_opl.py guard --update-snapshot`.
- **A (A qué afecta):** `backend/api-gateway`, `backend/service-identity`, `backend/service-catalog`, `backend/service-order`, `backend/service-inventory`, `backend/service-notification` y `fida.config.json`.

#### Criterios de aceptación
- [ ] Los 7 microservicios de `backend/` aparecen en `python fida-kit/tools/fida_opl.py guard` con estado `🟢 OK`.
- [ ] `mvn -f backend/pom.xml package -DskipTests` compila los 9 módulos con `BUILD SUCCESS`.

---

### Ticket T106 — Módulos FIDA de 5 subcarpetas en `frontend/src/features/` (Composición no destructiva)

#### Análisis PCA
- **P (Por qué):** Dotar a los dominios principales de la tienda (`CatalogDiscovery`, `CheckoutSummary`, `CustomerTracking`, `CustomCakeQuote`) de la anatomía FIDA de 5 subcarpetas (`interfaces/`, `dependencies/`, `implementation/`, `components/`, `docs/`) sin alterar rutas de React Router ni romper páginas existentes.
- **C (Cómo):** Crear los 4 módulos con `fida_opl.py init`, definir sus contratos puros en `interfaces/`, sus aduanas en `dependencies/dependencies.ts`, sus subcomponentes en `components/`, sus vistas en `implementation/`, sus ADRs en `docs/decisions.md`, e integrarlos por composición en las páginas correspondientes (`Catalogo.tsx`, `Checkout.tsx`, `PerfilSeguimiento.tsx`, `Personalizacion.tsx`).
- **A (A qué afecta):** `frontend/src/features/**`, páginas consumidoras y `fida.config.json`.

#### Criterios de aceptación
- [ ] Cada nuevo módulo en `frontend/src/features/` cumple las 3 reglas de aduana (`fida/interface-no-implementation`, `fida/no-unused-dependencies`, `fida/view-imports-through-gateway`) con `0` violaciones en `check --strict`.
- [ ] `npm --prefix frontend run build` finaliza con éxito.

---

### Ticket T107 — Módulos FIDA de 5 subcarpetas en `admin-pwa/src/features/` (Composición no destructiva)

#### Análisis PCA
- **P (Por qué):** Incorporar el patrón de diseño FIDA en la aplicación administrativa `admin-pwa/` creando la capa `admin-pwa/src/features/` con módulos gobernados por aduana de importaciones y WAL Guard.
- **C (Cómo):** Inicializar con `fida_opl.py init --dest admin-pwa/src/features` los módulos `AdminBoletaSii`, `AdminCriticalStock`, `AdminKardexPos` y `AdminRbacMatrix`, definiendo sus 5 subcarpetas reglamentarias, conectándolos de forma no destructiva en `admin-pwa/src/pages/` y sellando sus snapshots WAL.
- **A (A qué afecta):** `admin-pwa/src/features/**`, páginas administrativas y `fida.config.json`.

#### Criterios de aceptación
- [ ] Todos los módulos de `admin-pwa/src/features/` pasan `check --strict` (0 violaciones de aduana, 0 dependencias huérfanas) y `guard` (`🟢 OK`).
- [ ] `npm --prefix admin-pwa run build` finaliza con éxito.

---

### Ticket T109 — Autodescubrimiento global (`bootstrap --apply`), `sync` y sellado total 100% FIDA

#### Análisis PCA
- **P (Por qué):** Asegurar que ningún archivo de código o documentación dentro del alcance del proyecto quede sin su cabecera `@pca:start`, sincronizando todos los manifiestos modulares (`fida.module.json`) y el índice central (`fida.config.json`).
- **C (Cómo):** Ejecutar `bootstrap --apply`, ajustar límites si algún archivo existente supera el umbral por defecto, ejecutar `check --strict`, `guard` y `graph`, y verificar las 3 compilaciones de producción (`frontend`, `admin-pwa`, `backend`).
- **A (A qué afecta):** Todo el grafo de impacto del monorepo (`grafo.json`, `grafo.mmd`, `fida.config.json`).

#### Criterios de aceptación
- [ ] `python fida-kit/tools/fida_opl.py bootstrap` reporta **0 archivos sin anotación**.
- [ ] `python fida-kit/tools/fida_opl.py check --strict` y `guard` salen con código `0`.
- [ ] Los builds de `frontend`, `admin-pwa` y `backend` pasan al 100%.
