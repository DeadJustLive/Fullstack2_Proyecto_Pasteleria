<!-- @pca:start
@id(docs.tickets.sprint8)
@kind(doc)
@limit(lines: 480)
@relates(docs.estado_proyecto)
@relates(docs.convenciones)
@relates(fida.tools.opl)
@desc(Tickets T101 a T105 con metodologia PCA y arquitectura FIDA + OPL para cierre de pasarela Flow.cl real y paso a produccion)
@pca:end -->
# Sprint 8 — Integración Real Flow.cl, Patrón de Diseño FIDA + OPL y Sellado a Producción

> **Fase:** F3/F4 — Ejecución y Validación por tickets · **Sprint:** S8 · **Tickets:** T101–T105
> **Estado:** Listo para ejecución · **Última actualización:** 2026-10-31
> **Herramienta rectora:** [`fida-kit/tools/fida_opl.py`](../../fida-kit/tools/fida_opl.py) · **Guía FIDA:** [`fida-kit/AGENTS.md`](../../fida-kit/AGENTS.md) · **Plantilla:** [`docs/plantilla_ticket.md`](../plantilla_ticket.md)

---

## Propósito del Sprint 8

Finalizar el **6% restante** del proyecto Crème & Co aplicando rigurosamente la metodología **PCA (Por qué, Cómo, A qué afecta)** y el kit de arquitectura **FIDA + OPL (`fida-kit`)**:

1. **Gobernanza Unificada FIDA + OPL (`T101`):** Instalar y calibrar `fida-kit` en la raíz del proyecto (`.fidaignore`, `fida.config.json`, `selftest` 10/10 PASS), asegurando que ningún archivo sensible (`.env`) sea leído ni tocado jamás.
2. **Carga Automática de Entorno en Backend (`T102`):** Garantizar que Spring Boot (`service-payment-flow` y demás microservicios) e `iniciar_backend.bat` / `iniciar_backend.sh` inyecten automáticamente las variables de `backend/.env` sin exponer secretos.
3. **Ciclo Completo E2E de Flow.cl Real (`T103`):** Resolver el retorno `HTTP POST` de Flow.cl mediante el endpoint puente `/api/payments/flow/return` que verifica el estado real (`getStatus` con firma HMAC-SHA256) y redirige vía `HTTP 303 (GET)` a `/pago/exito` o `/pago/error`.
4. **Adopción del Patrón de Diseño FIDA (`T104`):** Potenciar la arquitectura del frontend integrando módulos bajo el estándar de **5 subcarpetas FIDA** (`interfaces/`, `dependencies/`, `implementation/`, `components/`, `docs/`) con Aduana de Importaciones (`dependencies.ts`), ADR (`decisions.md`) y Guardián Transaccional WAL (`guard`).
5. **Autodescubrimiento, Auditoría Estricta y Sellado Final (`T105`):** Ejecutar `bootstrap --apply`, `sync`, `check --strict`, `guard` y `graph`, verificando builds de producción en las 3 capas (`frontend`, `admin-pwa`, `backend`).

---

## Índice de Tickets y Orden de Ejecución

| Orden | ID | Título | Capa Principal | Prioridad | Depende de | Estado |
| :---: | :--- | :--- | :--- | :---: | :--- | :---: |
| **1°** | [T101](#ticket-t101--instalación-y-calibración-de-gobernanza-fida--opl-fida-kit-en-la-raíz) | Instalación y calibración de gobernanza FIDA + OPL (`fida-kit`) en la raíz | `fida-kit/` + Raíz | Alta | — | Hecho |
| **2°** | [T102](#ticket-t102--carga-automática-de-variables-de-entorno-en-spring-boot-y-orquestadores) | Carga automática de variables de entorno en Spring Boot y orquestadores (`.env` blindado) | `backend/` + Scripts | Alta | T101 | Hecho |
| **3°** | [T103](#ticket-t103--puente-de-retorno-post-apipaymentsflowreturn-y-verificación-e2e-flowcl) | Puente de retorno `POST /api/payments/flow/return` y verificación E2E Flow.cl | `service-payment-flow` + `frontend/` | Alta | T102 | Pendiente |
| **4°** | [T104](#ticket-t104--integración-del-patrón-de-diseño-fida-5-subcarpetas-aduana-y-wal-guard) | Integración del Patrón de Diseño FIDA (5 subcarpetas, Aduana y WAL Guard) | `frontend/src/features/` | Alta | T101, T103 | Pendiente |
| **5°** | [T105](#ticket-t105--autodescubrimiento-global-bootstrap-auditoría-estricta-y-sellado-a-producción) | Autodescubrimiento global (`bootstrap`), auditoría estricta y sellado a producción | Monorepo Completo | Alta | T103, T104 | Pendiente |

---

## Detalle de Tickets (Metodología PCA + FIDA)

### Ticket T101 — Instalación y calibración de gobernanza FIDA + OPL (`fida-kit`) en la raíz

#### Metadatos
- **Tipo:** `chore` | `feat`
- **Fase / Sprint:** F3/F4 · Sprint 8 (Orden 1°)
- **Rama activa:** `dev` (o `feature/T101-fida-kit-setup`)
- **Prioridad:** Alta

#### Análisis PCA (Razonamiento Previo)
- **P (Por qué):** El proyecto incorporó `fida-kit/` como evolución del antiguo `tools/pca_annotator.py`. Necesitamos que `fida_opl.py selftest` pase al 100% en Windows (actualmente falla 1 de 10 pruebas porque `.fidaignore` no se genera si el archivo oculto no existía previamente en `fida-kit/`) y necesitamos instalar `.fidaignore` y `fida.config.json` en la raíz del proyecto protegiendo `.env` y carpetas de compilación.
- **C (Cómo):**
  1. En `fida-kit/tools/fida_opl_templates.py`, hacer que `install_project_kit` escriba una plantilla predeterminada segura de `.fidaignore` cuando `kit_root / ".fidaignore"` no exista en disco.
  2. Ejecutar `python fida-kit/tools/fida_opl.py selftest` y comprobar `10 PASS, 0 FAIL`.
  3. Configurar `.fidaignore` y `fida.config.json` en la raíz del proyecto, migrando los nodos de `tools/pca.config.json` y añadiendo scripts NPM en el `package.json` raíz si aplica.
- **A (A qué afecta):** `fida.tools.templates`, manifiesto raíz `fida.config.json` y reglas de exclusión `.fidaignore`.

#### Convenciones aplicables
- `CONV-DOC-01` (Bloques de anotación `@pca:start`)
- `CONV-DOC-05` (Grafo actualizado)
- `CONV-SEG-01` y `CONV-SEG-02` (Prohibido leer o exponer `.env`; `.env` en `.fidaignore` y `.gitignore`)

#### Alcance (Qué SÍ / Qué NO)
- **SÍ:** Reparar generación de `.fidaignore` en `fida_opl_templates.py`, pasar `selftest` 10/10, crear `.fidaignore` y `fida.config.json` en la raíz del proyecto.
- **NO:** Modificar lógica de negocio de pagos o vistas React (eso corresponde a T102–T104).

#### Criterios de aceptación
- [ ] `python fida-kit/tools/fida_opl.py selftest` devuelve `10 PASS, 0 FAIL`.
- [ ] `.fidaignore` en la raíz excluye explícitamente `.env`, `.env.*`, `**/.env`, `node_modules/`, `dist/`, `target/`, `MockUpPasteleria/`.
- [ ] `python fida-kit/tools/fida_opl.py check` se ejecuta directamente desde la raíz sin requerir `--config tools/pca.config.json`.

#### Archivos afectados (previstos)
| Archivo | `@kind` | `@limit` |
| :--- | :--- | :--- |
| `fida-kit/tools/fida_opl_templates.py` | service | 350 |
| `.fidaignore` | config | 100 |
| `fida.config.json` | config | 1200 |

#### Casos límite (Edge Cases)
- Ejecución en Windows donde archivos ocultos `.fidaignore` pudieron ser omitidos al copiar carpetas: `install_project_kit` debe sintetizar `.fidaignore` automáticamente.
- Protección absoluta de archivos `.env`: `.fidaignore` impide que `bootstrap` o `scan_project_files` inspeccione jamás archivos `.env`.

#### Definition of Done
- [ ] `selftest` en 10/10 PASS.
- [ ] `python fida-kit/tools/fida_opl.py check` operativo en raíz con 0 errores.
- [ ] `docs/estado_proyecto.md` actualizado.

---

### Ticket T102 — Carga automática de variables de entorno en Spring Boot y orquestadores (`.env` blindado)

#### Metadatos
- **Tipo:** `fix` | `feat`
- **Fase / Sprint:** F3/F4 · Sprint 8 (Orden 2°)
- **Rama activa:** `dev`
- **Prioridad:** Alta

#### Análisis PCA (Razonamiento Previo)
- **P (Por qué):** El usuario configuró sus credenciales reales en `backend/.env` (archivo que tenemos prohibido leer). Sin embargo, Spring Boot por defecto no carga archivos `.env` salvo que se declare `spring.config.import: optional:file:...` en `application.yml` o que el script lanzador (`iniciar_backend.bat` / `iniciar_backend.sh`) cargue las variables en el entorno del proceso antes de ejecutar `java -jar`. Por eso `service-payment-flow` caía en el valor por defecto `FLOW_SANDBOX_API_KEY`.
- **C (Cómo):**
  1. Agregar `spring.config.import: optional:file:.env[.properties],optional:file:backend/.env[.properties],optional:file:../.env[.properties]` en los `application.yml` de los microservicios (`service-payment-flow`, `service-identity`, `service-catalog`, `service-order`, `service-inventory`, `service-notification`, `api-gateway`).
  2. Actualizar `iniciar_backend.bat` para que, si existe `backend\.env` o `.env`, cargue sus pares `KEY=VALUE` como variables de entorno de sesión (`for /f ... set`) **sin hacer `echo` de los valores**, y además ofrezca o fuerce la actualización de los JARs cuando el código fuente haya cambiado.
  3. Añadir un log seguro al iniciar `FlowClientService.java` que indique únicamente si las llaves Flow están configuradas en modo Real/Sandbox autenticado o en modo Simulador Offline (sin imprimir jamás el valor de `apiKey` ni `secretKey`).
- **A (A qué afecta):** Configuración de arranque de los 7 módulos Spring Boot y scripts de orquestación.

#### Convenciones aplicables
- `CONV-SEG-01` y `CONV-SEG-02` (Prohibido leer `.env` o imprimir secretos en logs)
- `CONV-ERR-01` (Nunca fallar en silencio: informar en log de backend el motivo exacto si Flow API rechaza una petición)

#### Alcance (Qué SÍ / Qué NO)
- **SÍ:** `spring.config.import` en `application.yml`, carga silenciosa de variables en `iniciar_backend.bat` / `iniciar_backend.sh`, y recompilación Maven de los JARs.
- **NO:** Leer ni tocar ningún archivo `.env`.

#### Criterios de aceptación
- [ ] Todos los `application.yml` incluyen `spring.config.import` apuntando de forma opcional a `.env` y `backend/.env`.
- [ ] `iniciar_backend.bat` carga variables de `backend\.env` en memoria sin mostrarlas por pantalla.
- [ ] `mvn clean package -DskipTests` en `backend/` genera los JARs actualizados con los cambios.

#### Archivos afectados (previstos)
| Archivo | `@kind` | `@limit` |
| :--- | :--- | :--- |
| `backend/service-payment-flow/src/main/resources/application.yml` | config | 80 |
| `backend/service-payment-flow/src/main/java/com/cremeco/payment/flow/service/FlowClientService.java` | service | 200 |
| `iniciar_backend.bat` | config | 150 |
| `iniciar_backend.sh` | config | 150 |

#### Casos límite (Edge Cases)
- Líneas comentadas (`#`) o vacías o con comillas alrededor del valor dentro de `.env`: tanto `spring.config.import` como el bucle en `iniciar_backend.bat` deben manejarlas sin romperse.
- Ejecución desde la raíz del repositorio vs. desde la carpeta `backend/`: las rutas relativas opcionales (`optional:file:.env[.properties]`, `optional:file:backend/.env[.properties]`) cubren ambos directorios de trabajo.

#### Definition of Done
- [ ] Microservicios cargan automáticamente variables de entorno de `backend/.env` sin intervención manual.
- [ ] Cero lectura o exposición de `.env`.
- [ ] JARs recompilados exitosamente.

---

### Ticket T103 — Puente de retorno `POST /api/payments/flow/return` y verificación E2E Flow.cl

#### Metadatos
- **Tipo:** `feat` | `fix`
- **Fase / Sprint:** F3/F4 · Sprint 8 (Orden 3°)
- **Rama activa:** `dev`
- **Prioridad:** Alta

#### Análisis PCA (Razonamiento Previo)
- **P (Por qué):** En la pasarela real de Flow Chile (`sandbox.flow.cl` y `www.flow.cl`), cuando el comprador finaliza o anula el pago en Webpay/Servipag, Flow redirige el navegador del usuario enviando un **`HTTP POST` (`application/x-www-form-urlencoded` con `token=...`)** a `urlReturn`. Una SPA en Vite/React (`http://localhost:5173/pago/exito`) no puede recibir el body de un `POST` ni distinguir si el pago fue aprobado (`status = 2`) o rechazado/anulado (`status = 3` o `4`).
- **C (Cómo):**
  1. En `FlowWebhookController.java`, crear el endpoint `@RequestMapping(value = "/return", method = {RequestMethod.POST, RequestMethod.GET})` que reciba el `token` enviado por Flow.
  2. Consultar en vivo el estado del pago mediante `flowPaymentService.processWebhook(token)`:
     - Si el estado es `completed` (`status == 2` en Flow), responder con `HTTP 303 See Other` (`Location: ${storeUrl}/pago/exito?token=...&orderId=...&flowOrder=...&total=...`).
     - Si el estado es `failed`, `rejected` o `cancelled` (`status == 3` o `4` o error), responder con `HTTP 303 See Other` (`Location: ${storeUrl}/pago/error?reason=bank_rejected&orderId=...&token=...`).
  3. Actualizar `flow.url-return` por defecto en `application.yml` a `${FLOW_URL_RETURN:http://localhost:8080/api/payments/flow/return}` (y si en `.env` estuviera apuntando directo a `:5173/pago/exito`, en `FlowClientService.java` normalizar o permitir que el puente reciba el POST).
  4. En `frontend/src/pages/cliente/pago/Exito.tsx`, cuando exista `?token=` en la URL, invocar `api.payments.verifyFlowStatus(token)` para mostrar el número de orden oficial de Flow (`flowOrder`) y estado verificado en la boleta electrónica SII.
- **A (A qué afecta):** `FlowWebhookController.java`, `FlowPaymentService.java`, `FlowClientService.java`, `application.yml` y `frontend/src/pages/cliente/pago/Exito.tsx`.

#### Convenciones aplicables
- `CONV-ERR-01` y `CONV-ERR-04` (Manejo explícito de rechazos bancarios y redirección segura)
- `CONV-SEG-03` (Validar `token` contra la API de Flow firmada con HMAC-SHA256 antes de dar por pagada una orden)
- `CONV-TIP-01` (Sin `any` en TypeScript)

#### Alcance (Qué SÍ / Qué NO)
- **SÍ:** Endpoint `POST/GET /api/payments/flow/return` con redirección `303 See Other` según resultado real de Flow, normalización inteligente de `urlReturn` si apunta al frontend estático, y verificación de estado en `PagoExito`.
- **NO:** Eliminar el fallback híbrido para cuando se trabaja 100% sin internet.

#### Criterios de aceptación
- [ ] Al recibir un `POST /api/payments/flow/return` con `token=...`, el backend consulta Flow, actualiza la orden en MySQL y redirige con `303 See Other` a `/pago/exito` (si `status == 2`) o `/pago/error` (si `status != 2`).
- [ ] Si `urlReturn` configurado apunta por error a `:5173/pago/exito`, `FlowClientService` redirige `urlReturn` hacia el endpoint `/api/payments/flow/return` del backend para que el navegador nunca reciba un error 405/404 al volver de Flow.cl.
- [ ] En `/pago/exito`, la boleta electrónica muestra el código de autorización / `flowOrder` verificado.

#### Archivos afectados (previstos)
| Archivo | `@kind` | `@limit` |
| :--- | :--- | :--- |
| `backend/service-payment-flow/src/main/java/com/cremeco/payment/flow/controller/FlowWebhookController.java` | controller | 120 |
| `backend/service-payment-flow/src/main/java/com/cremeco/payment/flow/service/FlowClientService.java` | service | 200 |
| `backend/service-payment-flow/src/main/java/com/cremeco/payment/flow/service/FlowPaymentService.java` | service | 300 |
| `frontend/src/pages/cliente/pago/Exito.tsx` | page | 280 |

#### Casos límite (Edge Cases)
- El usuario presiona "Anular y volver al comercio" en la página de Flow.cl: Flow envía el POST a `urlReturn` con un token cuyo `status` es `3` o `4`; el puente debe enviarlo a `/pago/error` (no a `/pago/exito`) y conservar su carrito intacto.
- El usuario recarga `/pago/exito?token=...`: la consulta `GET /api/payments/flow/status/{token}` es idempotente y mantiene los datos de su boleta.

#### Definition of Done
- [ ] Pruebas del endpoint `/api/payments/flow/return` (POST y GET) verificadas.
- [ ] JAR de `service-payment-flow` recompilado.
- [ ] Build de `frontend` sin errores de TypeScript.

---

### Ticket T104 — Integración del Patrón de Diseño FIDA (5 subcarpetas, Aduana y WAL Guard)

#### Metadatos
- **Tipo:** `refactor` | `feat`
- **Fase / Sprint:** F3/F4 · Sprint 8 (Orden 4°)
- **Rama activa:** `dev`
- **Prioridad:** Alta

#### Análisis PCA (Razonamiento Previo)
- **P (Por qué):** Para potenciar la mantenibilidad y escalabilidad del proyecto aplicando el estándar arquitectónico de `fida-kit`, necesitamos estructurar módulos reales en `frontend/src/features/` bajo la **Anatomía FIDA de 5 subcarpetas** (`interfaces/`, `dependencies/`, `implementation/`, `components/`, `docs/`). Esto activa las **3 Aduanas Automáticas de FIDA** (`fida/interface-no-implementation`, `fida/no-unused-dependencies`, `fida/view-imports-through-gateway`) y el **Guardián Transaccional WAL** (`fida_opl.py guard` con `.snapshot.json` y `decisions.md`).
- **C (Cómo):**
  1. Usar `python fida-kit/tools/fida_opl.py init FlowPayment --lang ts --dest frontend/src/features` para crear el módulo FIDA canónico de pasarela y verificación de pagos Flow.
  2. Definir en `frontend/src/features/FlowPayment/interfaces/IFlowPayment.ts` los contratos puros (`IFlowPaymentStatus`, `IFlowOrderReceipt`, `IFlowGatewayMode`, `IFlowPaymentBannerProps`) sin lógica ejecutable.
  3. Configurar la aduana en `frontend/src/features/FlowPayment/dependencies/dependencies.ts` re-exportando únicamente las dependencias utilizadas por el módulo (`api`, `formatPrecio`, iconos `lucide-react`, contratos).
  4. Implementar en `frontend/src/features/FlowPayment/implementation/FlowPayment.view.tsx` y `components/` el verificador de transacción en vivo y badge de estado de pasarela Flow (conectado con `Checkout.tsx` y `Exito.tsx`), importando **exclusivamente** desde `../dependencies/dependencies`.
  5. Documentar la decisión arquitectónica en `frontend/src/features/FlowPayment/docs/decisions.md` y sellar el snapshot criptográfico con `python fida-kit/tools/fida_opl.py guard --update-snapshot`.
- **A (A qué afecta):** Nuevo directorio `frontend/src/features/FlowPayment/**`, integración en `Checkout.tsx` y `Exito.tsx`, e índice `fida.config.json`.

#### Convenciones aplicables
- `CONV-EST-01` y `CONV-EST-02` (Separación estricta por capas y módulos FIDA)
- `CONV-TIP-01` y `CONV-TIP-02` (Contratos primero, cero `any`)
- `CONV-DOC-01` y `CONV-DOC-05` (Sincronización con `fida_opl.py sync`, `check --strict` y `guard`)

#### Alcance (Qué SÍ / Qué NO)
- **SÍ:** Creación e integración del módulo FIDA `FlowPayment` con sus 5 subcarpetas reglamentarias, consumo real en el flujo de pago (`Checkout` / `Exito`), validación de aduanas FIDA y snapshot WAL.
- **NO:** Romper las rutas existentes de React Router ni los tests actuales.

#### Criterios de aceptación
- [ ] El módulo `frontend/src/features/FlowPayment/` cuenta con las 5 subcarpetas (`interfaces/`, `dependencies/`, `implementation/`, `components/`, `docs/`).
- [ ] `python fida-kit/tools/fida_opl.py check --strict` reporta **0 violaciones de Aduana FIDA** (`boundary_violations: 0`) y **0 dependencias huérfanas**.
- [ ] `python fida-kit/tools/fida_opl.py guard` reporta el módulo `FlowPayment` en estado **`OK`** con su snapshot WAL sincronizado y documentado en `docs/decisions.md`.

#### Archivos afectados (previstos)
| Archivo | `@kind` | `@limit` |
| :--- | :--- | :--- |
| `frontend/src/features/FlowPayment/interfaces/IFlowPayment.ts` | interface | 150 |
| `frontend/src/features/FlowPayment/dependencies/dependencies.ts` | dependencies | 120 |
| `frontend/src/features/FlowPayment/implementation/FlowPayment.view.tsx` | view | 300 |
| `frontend/src/features/FlowPayment/components/FlowStatusBadge.tsx` | component | 200 |
| `frontend/src/features/FlowPayment/docs/decisions.md` | doc | 600 |
| `frontend/src/features/FlowPayment/docs/fida.module.json` | config | 300 |

#### Casos límite (Edge Cases)
- Si `implementation/` importa directamente de `lucide-react` o `@/services/api` saltándose `dependencies/dependencies.ts`, `fida_opl.py check --strict` fallará con `fida/view-imports-through-gateway`.
- Si `dependencies/dependencies.ts` exporta un símbolo que no se usa en `implementation/` o `components/`, `fida_opl.py check --strict` fallará con `fida/no-unused-dependencies`.

#### Definition of Done
- [ ] Módulo FIDA integrado en la UI real de pagos y verificado con `tsc --noEmit` + `vite build`.
- [ ] `fida_opl.py check --strict` y `fida_opl.py guard` en verde (`EXIT_OK`).

---

### Ticket T105 — Autodescubrimiento global (`bootstrap`), auditoría estricta y sellado a producción

#### Metadatos
- **Tipo:** `chore` | `test` | `docs`
- **Fase / Sprint:** F4/F5 · Sprint 8 (Orden 5°)
- **Rama activa:** `dev`
- **Prioridad:** Alta

#### Análisis PCA (Razonamiento Previo)
- **P (Por qué):** Para cerrar formalmente el desarrollo antes del paso a producción, todos los archivos nuevos creados durante los Sprints 7 y 8 deben estar anotados y sincronizados en `fida.config.json`, el grafo de impacto (`grafo.json` / `grafo.mmd`) debe reflejar la arquitectura real al 100%, ningún archivo debe exceder su `@limit`, y los builds productivos de `frontend/`, `admin-pwa/` y `backend/` deben estar validados.
- **C (Cómo):**
  1. Ejecutar `python fida-kit/tools/fida_opl.py bootstrap --apply` y `python fida-kit/tools/fida_opl.py sync`.
  2. Ajustar límites o refactorizar cualquier archivo que supere su `@limit` y corregir cualquier relación `@relates` huérfana.
  3. Ejecutar `python fida-kit/tools/fida_opl.py check --strict`, `python fida-kit/tools/fida_opl.py guard` y `python fida-kit/tools/fida_opl.py graph`.
  4. Ejecutar `npm --prefix frontend run build` y `npm --prefix admin-pwa run build`.
  5. Actualizar `docs/estado_proyecto.md` y `docs/cicatrices_guerra.md` dejando el proyecto al **100%** listo para producción.
- **A (A qué afecta):** Todos los nodos del grafo FIDA/OPL (`grafo.json`, `grafo.mmd`), `fida.config.json`, `docs/estado_proyecto.md` y `docs/cicatrices_guerra.md`.

#### Convenciones aplicables
- `CONV-DOC-01` y `CONV-DOC-05`
- `CONV-TIP-04` (Respeto estricto de `@limit`)
- `CONV-GEN-02` (Sin código muerto)

#### Alcance (Qué SÍ / Qué NO)
- **SÍ:** Anotación completa del proyecto con `bootstrap --apply`, sincronización de `fida.config.json`, generación del grafo final, validación `check --strict` + `guard` y builds de producción.
- **NO:** Tocar ni leer archivos `.env`.

#### Criterios de aceptación
- [ ] `python fida-kit/tools/fida_opl.py check --strict` finaliza con código `0` (0 sobre límite, 0 relaciones rotas, 0 sin anotación, 0 IDs duplicados, 0 violaciones de aduana).
- [ ] `python fida-kit/tools/fida_opl.py guard` finaliza con código `0` (todos los módulos FIDA en estado `OK`).
- [ ] `frontend` (`vite build`), `admin-pwa` (`vite build`) y `backend` (`mvn package -DskipTests`) compilan sin errores.

#### Archivos afectados (previstos)
| Archivo | `@kind` | `@limit` |
| :--- | :--- | :--- |
| `fida.config.json` | config | 1500 |
| `grafo.json` / `grafo.mmd` | doc | — |
| `docs/estado_proyecto.md` | doc | 220 |
| `docs/cicatrices_guerra.md` | doc | 350 |

#### Casos límite (Edge Cases)
- Archivos de código con funciones internas que tienen paréntesis en `@contract(...)`: el nuevo parser de paréntesis balanceados de `fida_opl_core.py` (`iter_balanced_tags`) los procesa sin truncar.

#### Definition of Done
- [ ] Todos los criterios de aceptación cumplidos.
- [ ] `docs/estado_proyecto.md` actualizado al 100% de avance.
- [ ] Propuesta de commit lista en `dev`.
