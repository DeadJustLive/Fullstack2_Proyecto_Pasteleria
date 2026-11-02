<!-- @pca:start
@id(docs.tickets.sprint10)
@kind(doc)
@limit(lines: 480)
@relates(docs.estado_proyecto)
@relates(docs.convenciones)
@relates(docs.tickets.readme)
@desc(Tickets T110 a T114 para contenedorizacion Docker completa de microservicios en PC, integracion Redis, Flow.cl real con feedback y optimizador WebP en Admin PWA)
@pca:end -->
# Sprint 10 — Entorno de Producción Real en Docker (PC Local), Diagnóstico Flow.cl & Optimizador WebP

> **Fase:** F4 — Validación / Testing & Entorno de Producción Docker · **Sprint:** S10 · **Tickets:** T110–T114
> **Estado:** Completado (12 contenedores operativos, E2E verificado) · **Última actualización:** 2026-11-02
> **Objetivo:** Levantar el 100% de los microservicios de `backend/` dentro de contenedores Docker junto con la infraestructura (`mysql`, `kafka`, `zookeeper`, `kafdrop`, `redis`) para operar en el PC como entorno de producción real con feedback directo, activar redirección real a Flow.cl con diagnóstico explícito e incorporar compresión de imágenes a WebP ligero en `admin-pwa` y `service-catalog`.

---

## Índice de Tickets y Orden de Ejecución

| Orden | ID | Título | Capa Principal | Prioridad | Depende de | Estado |
| :---: | :--- | :--- | :--- | :---: | :--- | :---: |
| **1°** | [T110](#ticket-t110--dockerfiles-de-producción-para-los-7-microservicios-spring-boot) | `Dockerfile`s de producción para los 7 microservicios Spring Boot | `backend/*/Dockerfile` | **Alta** | T109 | **Completado** |
| **2°** | [T111](#ticket-t111--orquestación-docker-compose-de-producción-local-con-feedback-y-healthchecks) | Orquestación Docker Compose de producción local con feedback y healthchecks | `docker-compose.prod.yml`, `backend/docker-compose.yml` | **Alta** | T110 | **Completado** |
| **3°** | [T112](#ticket-t112--integración-activa-del-contenedor-redis-6379-con-microservicios-backend) | Integración activa del contenedor Redis (`:6379`) con microservicios Backend | `backend/service-catalog`, `backend/service-identity` | **Media** | T111 | **Completado** |
| **4°** | [T113](#ticket-t113--modo-producciónsandbox-real-de-flowcl-en-docker-y-diagnóstico-de-redirección) | Modo Producción/Sandbox Real de Flow.cl en Docker y diagnóstico de redirección | `backend/service-payment-flow`, `frontend/src/pages/cliente/Checkout.tsx` | **Alta** | T111 | **Completado** |
| **5°** | [T114](#ticket-t114--módulo-fida-de-compresión-a-webp-ligero-en-admin-pwa-y-soporte-en-service-catalog) | Módulo FIDA de compresión a WebP ligero en `admin-pwa` y soporte en `service-catalog` | `admin-pwa/src/features/AdminImageOptimizer`, `backend/service-catalog` | **Media** | T111 | **Completado** |
| **6°** | [T115](#ticket-t115--blindaje-del-entorno-docker-local-separación-envdocker-automigración-imagen-y-auditoría) | Blindaje del entorno Docker local, separación `.env.docker`, automigración imagen y auditoría | Monorepo / Docker | **Alta** | T110–T114 | **Completado** |

---

## Detalle de Tickets (Plantilla Oficial PCA + FIDA)

### Ticket T110 — `Dockerfile`s de producción para los 7 microservicios Spring Boot

#### Metadatos
- **Tipo:** `feat`
- **Fase / Sprint:** F4 · Sprint 10
- **Rama sugerida:** `feature/T110-dockerfiles-microservicios`
- **Prioridad:** Alta

#### Análisis PCA
- **P (Por qué):** Actualmente `docker-compose.prod.yml` declara `dockerfile: <servicio>/Dockerfile` para los 7 microservicios (`api-gateway`, `service-identity`, `service-catalog`, `service-order`, `service-payment-flow`, `service-inventory`, `service-notification`), pero ningún archivo `Dockerfile` existe físicamente en `backend/`, lo que impide construir y levantar los microservicios como contenedores en Docker.
- **C (Cómo):** Crear los 7 archivos `Dockerfile` optimizados basados en `eclipse-temurin:21-jre-alpine`, configurando zona horaria `America/Santiago`, copia del artefacto `.jar` compilado en `target/`, exposición de su puerto respectivo (`8080`–`8086`) y punto de entrada con parámetros de memoria acotados para correr fluidamente en el PC local.
- **A (A qué afecta):** `backend/api-gateway/Dockerfile`, `backend/service-identity/Dockerfile`, `backend/service-catalog/Dockerfile`, `backend/service-order/Dockerfile`, `backend/service-payment-flow/Dockerfile`, `backend/service-inventory/Dockerfile`, `backend/service-notification/Dockerfile` y `.fidaignore`.

#### Convenciones aplicables
- `CONV-EST-01`, `CONV-EST-03`, `CONV-SEG-01`, `CONV-DOC-01`

#### Alcance (Qué SÍ / Qué NO)
- **SÍ:** Creación de los 7 `Dockerfile`s y `.dockerignore` en `backend/` para empaquetado rápido y ligero.
- **NO:** Modificación de lógica de negocio en código Java.

#### Criterios de aceptación
- [x] Existen los 7 `Dockerfile`s en cada carpeta de microservicio dentro de `backend/`.
- [x] `docker compose -f docker-compose.prod.yml build` construye las 7 imágenes sin errores.
- [x] Cada imagen utiliza variables de entorno externas sin credenciales hardcodeadas.

#### Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/api-gateway/Dockerfile` | config | 50 |
| `backend/service-identity/Dockerfile` | config | 50 |
| `backend/service-catalog/Dockerfile` | config | 50 |
| `backend/service-order/Dockerfile` | config | 50 |
| `backend/service-payment-flow/Dockerfile` | config | 50 |
| `backend/service-inventory/Dockerfile` | config | 50 |
| `backend/service-notification/Dockerfile` | config | 50 |

#### Casos límite (Edge Cases)
- El archivo `.jar` en `target/` no ha sido compilado previamente: el script o multi-stage garantiza que exista antes de empaquetar.
- Exceso de consumo de RAM al correr 7 JVMs en simultáneo en el PC: se limita cada contenedor con `-Xms64m -Xmx256m`.

#### Definition of Done
- [x] Imágenes Docker construidas y verificadas con `docker images`.
- [x] `fida_opl.py check --strict` y `guard` en verde.
- [x] `docs/estado_proyecto.md` actualizado.

---

### Ticket T111 — Orquestación Docker Compose de producción local con feedback y healthchecks

#### Metadatos
- **Tipo:** `feat`
- **Fase / Sprint:** F4 · Sprint 10
- **Rama sugerida:** `feature/T111-orquestacion-docker-produccion-local`
- **Prioridad:** Alta

#### Análisis PCA
- **P (Por qué):** En Docker Desktop solo aparecen los 5 contenedores de infraestructura (`mysql`, `zookeeper`, `kafka`, `kafdrop`, `redis`) porque `backend/docker-compose.yml` no incluía los microservicios, y `docker-compose.prod.yml` no exponía los puertos individuales (`8081`–`8086`) ni incluía `kafdrop` (`:9000`) ni scripts de verificación de salud para dar feedback en tiempo real en el PC del desarrollador.
- **C (Cómo):** Unificar y sincronizar la topología en `docker-compose.prod.yml` (y actualizar `iniciar_backend.bat`) para que levante los **12 contenedores correlacionados** (`cremeco-mysql`, `cremeco-zookeeper`, `cremeco-kafka`, `cremeco-kafdrop`, `cremeco-redis` + los 7 microservicios `cremeco-api-gateway`, `cremeco-service-identity`, `cremeco-service-catalog`, `cremeco-service-order`, `cremeco-service-payment`, `cremeco-service-inventory`, `cremeco-service-notification`), exponiendo sus puertos `8080:8080` a `8086:8086` y agregando healthchecks y un comando/endpoint de estado para recibir feedback inmediato de qué contenedor está arriba y saludable.
- **A (A qué afecta):** `docker-compose.prod.yml`, `backend/docker-compose.yml` e `iniciar_backend.bat`.

#### Convenciones aplicables
- `CONV-EST-01`, `CONV-ERR-01`, `CONV-SEG-01`, `CONV-DOC-05`

#### Alcance (Qué SÍ / Qué NO)
- **SÍ:** Levantar los 12 contenedores en la misma red Docker, exponer puertos `8080`–`8086` a `localhost`, configurar espera de `mysql` y `kafka` saludables antes de iniciar los microservicios, y proveer feedback claro por consola/Docker Desktop.
- **NO:** Despliegue en nube externa (se ejecuta 100% en el Docker local del PC).

#### Criterios de aceptación
- [x] Al ejecutar `docker compose -f docker-compose.prod.yml up -d --build`, en Docker Desktop aparecen tanto los 5 contenedores base como los 7 contenedores correspondientes a cada carpeta de `backend/`.
- [x] El API Gateway (`http://localhost:8080`) enruta hacia los nombres de servicio internos de Docker (`http://service-catalog:8082`, etc.) y cada microservicio también responde en su puerto local (`8081`–`8086`) para diagnóstico.
- [x] MySQL (`cremeco_db`) ejecuta el `DataSeeder` automáticamente dentro de los contenedores.

#### Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `docker-compose.prod.yml` | config | 260 |
| `backend/docker-compose.yml` | config | 240 |
| `iniciar_backend.bat` | config | 160 |

#### Casos límite (Edge Cases)
- Colisión de puertos si había procesos `java.exe` sueltos corriendo fuera de Docker en los puertos `8080`–`8086`: el script verifica o detiene instancias previas antes de levantar los contenedores.
- Arranque de microservicios antes de que MySQL 8 acepte conexiones TCP: se controla con `depends_on` + `condition: service_healthy`.

#### Definition of Done
- [x] Los 12 contenedores corriendo en estado `Up` / `healthy` en Docker.
- [x] `fida_opl.py check --strict` y `guard` en verde.
- [x] `docs/estado_proyecto.md` actualizado.

---

### Ticket T112 — Integración activa del contenedor Redis (`:6379`) con microservicios Backend

#### Metadatos
- **Tipo:** `feat`
- **Fase / Sprint:** F4 · Sprint 10
- **Rama sugerida:** `feature/T112-integracion-redis-backend`
- **Prioridad:** Media

#### Análisis PCA
- **P (Por qué):** El contenedor `cremeco-redis` (`redis:7-alpine` en puerto `6379:6379`) está corriendo en Docker pero ningún microservicio en `backend/` lo consume actualmente, generando confusión sobre su rol real en la arquitectura.
- **C (Cómo):** Incorporar `spring-boot-starter-data-redis` y configuración de conexión (`SPRING_DATA_REDIS_HOST` / `PORT`) en `service-catalog` y `service-identity` (con degradación elegante si Redis no responde) para caché de catálogo/promociones y control de sesiones/tokens, más un indicador de estado de conexión a Redis en el endpoint de salud/diagnóstico.
- **A (A qué afecta):** `backend/service-catalog/pom.xml`, `backend/service-catalog/src/main/resources/application.yml`, `backend/service-identity/pom.xml`, `backend/service-identity/src/main/resources/application.yml` y `docker-compose.prod.yml`.

#### Convenciones aplicables
- `CONV-EST-01`, `CONV-ERR-01`, `CONV-SEG-01`, `CONV-DOC-01`

#### Alcance (Qué SÍ / Qué NO)
- **SÍ:** Conectar `service-catalog` y `service-identity` a `cremeco-redis:6379`, registrar ping/estado de Redis y cachear lecturas frecuentes con invalidación automática al crear/editar productos.
- **NO:** Bloquear el arranque del sistema si Redis se reinicia (se mantiene tolerancia a fallos).

#### Criterios de aceptación
- [x] `service-catalog` y `service-identity` se conectan a `cremeco-redis:6379` dentro de la red Docker.
- [x] Al consultar el endpoint de diagnóstico o revisar `redis-cli MONITOR`, se observa actividad real en el contenedor `cremeco-redis`.

#### Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/service-catalog/src/main/resources/application.yml` | config | 80 |
| `backend/service-identity/src/main/resources/application.yml` | config | 80 |
| `backend/service-catalog/src/main/java/com/cremeco/catalog/config/RedisConfig.java` | config | 130 |
| `backend/service-catalog/src/main/java/com/cremeco/catalog/service/CatalogService.java` | service | 180 |
| `backend/service-identity/src/main/java/com/cremeco/identity/config/RedisConfig.java` | config | 80 |

#### Casos límite (Edge Cases)
- Si un administrador actualiza un producto o su disponibilidad en `admin-pwa`, la caché de Redis se limpia de inmediato (`@CacheEvict`) para no servir datos desactualizados.

#### Definition of Done
- [x] Conexión verificada contra `cremeco-redis:6379`.
- [x] `fida_opl.py check --strict` y `guard` en verde (con actualización de `decisions.md` y snapshot WAL).

---

### Ticket T113 — Modo Producción/Sandbox Real de Flow.cl en Docker y diagnóstico de redirección

#### Metadatos
- **Tipo:** `fix`
- **Fase / Sprint:** F4 · Sprint 10
- **Rama sugerida:** `feature/T113-flow-real-docker-diagnostico`
- **Prioridad:** Alta

#### Análisis PCA
- **P (Por qué):** Al intentar pagar en el Checkout, el usuario es enviado a la pantalla de simulación (`/pago/flow-gateway`) en lugar de la pasarela externa de Flow.cl porque: (1) en `docker-compose.prod.yml` las URLs por defecto apuntaban al dominio ficticio `https://pasteleriacremeco.cl` en vez de `http://localhost:8080/api/payments/flow/return` y `http://localhost:5173`, y (2) si `FlowClientService` recibe un error de la API de Flow (o no tiene llaves reales cargadas en `.env`), `FlowPaymentService` captura la excepción en silencio y devuelve la URL del simulador sin avisar por qué no redirigió a Flow real.
- **C (Cómo):**
  1. Configurar en `docker-compose.prod.yml` el paso directo de variables desde `.env` al contenedor `cremeco-service-payment`, con defaults válidos para producción local (`STORE_URL=http://localhost:5173`, `FLOW_URL_RETURN=http://localhost:8080/api/payments/flow/return`).
  2. Agregar el endpoint `GET /api/payments/flow/diagnostics` en `service-payment-flow` e incluir en la respuesta de `POST /api/payments/flow/create` los campos `mode` (`"REAL_FLOW"` vs `"LOCAL_SIMULATOR"`) y `diagnosticReason`, para que tanto en consola como en la UI tengas feedback exacto de si están activas las credenciales reales o si Flow.cl rechazó algún parámetro.
  3. Permitir forzar modo estricto (`FLOW_STRICT_REAL_MODE=true`) para que, cuando quieras probar exclusivamente contra Flow.cl real, no caiga silenciosamente al simulador sino que muestre el detalle exacto de la respuesta de Flow.
- **A (A qué afecta):** `backend/service-payment-flow`, `docker-compose.prod.yml` y `frontend/src/pages/cliente/Checkout.tsx`.

#### Convenciones aplicables
- `CONV-ERR-01`, `CONV-ERR-04`, `CONV-SEG-01`, `CONV-SEG-03`

#### Alcance (Qué SÍ / Qué NO)
- **SÍ:** Redirección real a `sandbox.flow.cl` / `www.flow.cl` desde el contenedor `cremeco-service-payment`, puente HTTP 303 en `/api/payments/flow/return` hacia `http://localhost:5173/pago/exito`, y endpoint/feedback de diagnóstico.
- **NO:** Hardcodear llaves privadas de Flow en el repositorio (se leen siempre desde `.env`).

#### Criterios de aceptación
- [x] `GET http://localhost:8080/api/payments/flow/diagnostics` informa si las credenciales `FLOW_API_KEY` y `FLOW_SECRET_KEY` están cargadas en el contenedor y a qué URL (`FLOW_API_URL`) apunta.
- [x] Con credenciales reales en `.env`, el Checkout redirige directamente a la página de Flow.cl (`window.location.href`).
- [x] Si Flow.cl rechaza la creación de la orden (ej. por credenciales inválidas o `urlConfirmation` no pública), el microservicio entrega el motivo exacto del error en el log y en el payload de diagnóstico.

#### Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `backend/service-payment-flow/src/main/java/com/cremeco/payment/flow/service/FlowPaymentService.java` | service | 350 |
| `backend/service-payment-flow/src/main/java/com/cremeco/payment/flow/controller/FlowPaymentController.java` | controller | 120 |
| `frontend/src/pages/cliente/Checkout.tsx` | page | 700 |

#### Casos límite (Edge Cases)
- Flow.cl exige en ciertos entornos que `urlConfirmation` (el webhook servidor-a-servidor) sea un dominio válido y rechaza `localhost`: `FlowClientService` detecta este rechazo HTTP 400 de Flow y explica cómo usar un túnel o URL válida sin ocultar el error.

#### Definition of Done
- [x] Diagnóstico y redirección probados contra el contenedor `cremeco-service-payment`.
- [x] `fida_opl.py check --strict` y `guard` en verde.
- [x] `docs/estado_proyecto.md` actualizado.

---

### Ticket T114 — Módulo FIDA de compresión a WebP ligero en `admin-pwa` y soporte en `service-catalog`

#### Metadatos
- **Tipo:** `feat`
- **Fase / Sprint:** F4 · Sprint 10
- **Rama sugerida:** `feature/T114-admin-webp-image-optimizer`
- **Prioridad:** Media

#### Análisis PCA
- **P (Por qué):** En `service-catalog`, `ProductEntity.imagen` estaba limitado a `VARCHAR(255)` (solo permitía pegar URLs externas) y en `admin-pwa` (`Productos.tsx`) no existía un módulo para subir fotografías desde el dispositivo y convertirlas automáticamente a formato ligero (`WebP`) para reducir el consumo de almacenamiento y ancho de banda en la base de datos.
- **C (Cómo):**
  1. Inicializar con `fida_opl.py init AdminImageOptimizer --lang ts --dest admin-pwa/src/features` un módulo FIDA de 5 subcarpetas (`interfaces/`, `dependencies/`, `implementation/`, `components/`, `docs/`).
  2. Implementar en dicho módulo la compresión y redimensionamiento automático en el navegador (HTML5 `Canvas` + `toDataURL('image/webp', 0.78)`, redimensionando a máx. `800px` de ancho para que cada foto pese apenas `~15 KB – 45 KB`), mostrando al administrador el peso original vs. el peso optimizado en WebP y porcentaje de ahorro.
  3. Integrar el componente en los modales de **Crear Producto** y **Editar Producto** en `admin-pwa/src/pages/Productos.tsx`.
  4. Ampliar la columna `imagen` en `ProductEntity.java` (`columnDefinition = "MEDIUMTEXT"`) en `service-catalog` para soportar tanto rutas/URLs como imágenes WebP ligeras auto-contenidas sin fallar por límite de 255 caracteres.
- **A (A qué afecta):** `admin-pwa/src/features/AdminImageOptimizer/**`, `admin-pwa/src/pages/Productos.tsx` y `backend/service-catalog/src/main/java/com/cremeco/catalog/model/ProductEntity.java`.

#### Convenciones aplicables
- `CONV-UI-01`, `CONV-TIP-01`, `CONV-TIP-02`, `CONV-NAM-05`, `CONV-DOC-01`

#### Alcance (Qué SÍ / Qué NO)
- **SÍ:** Subida de archivos de imagen (JPG, PNG, WebP) en `admin-pwa`, conversión automática en el navegador a `WebP` ligero, vista previa con métricas de ahorro en KB y persistencia real en MySQL (`service-catalog`) visible inmediatamente en la Tienda Web (`frontend/`).
- **NO:** Almacenar imágenes pesadas sin comprimir en la base de datos.

#### Criterios de aceptación
- [x] El módulo `AdminImageOptimizer` cumple las 5 subcarpetas FIDA y pasa `check --strict` con 0 violaciones de Aduana.
- [x] En `admin-pwa` (`/productos`), al crear o editar un producto se puede subir una imagen local (PNG/JPG de varios MB) y el módulo la convierte automáticamente a WebP ligero (< 60 KB) mostrando el porcentaje de reducción.
- [x] El producto guardado en `service-catalog` persiste en MySQL y su imagen WebP se visualiza tanto en `admin-pwa` como en el catálogo de clientes (`frontend/`).

#### Archivos afectados (previstos)
| Archivo | @kind | @limit |
| :--- | :--- | :--- |
| `admin-pwa/src/features/AdminImageOptimizer/interfaces/AdminImageOptimizer.types.ts` | interface | 100 |
| `admin-pwa/src/features/AdminImageOptimizer/dependencies/dependencies.ts` | service | 100 |
| `admin-pwa/src/features/AdminImageOptimizer/components/OptimizationMetricsBadge.tsx` | component | 120 |
| `admin-pwa/src/features/AdminImageOptimizer/components/ImagePreviewCard.tsx` | component | 100 |
| `admin-pwa/src/features/AdminImageOptimizer/implementation/AdminImageOptimizer.view.tsx` | component | 300 |
| `admin-pwa/src/pages/Productos.tsx` | page | 720 |
| `backend/service-catalog/src/main/java/com/cremeco/catalog/model/ProductEntity.java` | component | 200 |

#### Casos límite (Edge Cases)
- Usuario intenta subir un archivo que no es imagen (ej. `.pdf` o `.exe`) o una imagen corrupta: se rechaza antes de procesar con mensaje descriptivo.
- El usuario prefiere seguir usando una URL externa o una ruta local (`/imagen/...`): el componente soporta modo dual (Subir archivo optimizado a WebP o ingresar URL).

#### Definition of Done
- [x] Módulo FIDA validado con `check --strict` y `guard`.
- [x] Builds de `admin-pwa`, `frontend` y `backend` exitosos.
- [x] `docs/estado_proyecto.md` actualizado.

---

### Ticket T115 — Blindaje del entorno Docker local, separación `.env.docker`, automigración imagen y auditoría

#### Metadatos
- **Tipo:** `fix`
- **Fase / Sprint:** F4 · Sprint 10
- **Rama sugerida:** `fix/T115-docker-prod-env`
- **Prioridad:** Alta

#### Análisis PCA
- **P (Por qué):** La auditoría técnica del Sprint 10 detectó 3 fallas críticas: (1) `iniciar_backend.bat` inyectaba `localhost:3306` desde `backend/.env` hacia los contenedores sobrescribiendo los hostnames de red Docker; (2) Docker Compose no leía credenciales de Flow al no tener `.env` en la raíz; (3) Los contenedores corrían con JARs obsoletos por no compilar antes de empaquetar. Adicionalmente, las BDs existentes requerían migración de `imagen` a `MEDIUMTEXT`, `Productos.tsx` descartaba errores en silencio, y `FlowPaymentService` superaba su límite de líneas.
- **C (Cómo):** Separar entornos mediante `.env.docker` y `.env.docker.example` con variables limpias; fijar hostnames en `docker-compose.prod.yml` y eliminar el duplicado desfasado `backend/docker-compose.yml`; forzar compilación Maven previa en `iniciar_backend.bat`; implementar `DatabaseSchemaMigrator` para auto-migrar la columna `imagen` a `MEDIUMTEXT`; extraer `FlowUrlHelper` reduciendo `FlowPaymentService` bajo su límite; y notificar/revertir optimísticamente errores en `Productos.tsx`.
- **A (A qué afecta):** `docker-compose.prod.yml`, `iniciar_backend.bat`, `backend/service-catalog/**`, `backend/service-payment-flow/**`, `admin-pwa/src/pages/Productos.tsx`.

#### Criterios de aceptación
- [x] `.env.docker` configurado con llaves de Flow Sandbox y excluido por `.gitignore`.
- [x] `docker-compose.prod.yml` es la única fuente de verdad con proyecto `cremeco`.
- [x] `iniciar_backend.bat` compila siempre con Maven antes de construir imágenes Docker.
- [x] `DatabaseSchemaMigrator` asegura tipo `MEDIUMTEXT` en cualquier BD MySQL.
- [x] `FlowPaymentService` factorizado con `FlowUrlHelper` y bajo límite de 350 líneas.
- [x] `Productos.tsx` muestra errores del servidor y revierte cambios fallidos.

#### Definition of Done
- [x] Validación E2E contra los 12 contenedores Docker.
- [x] `python fida-kit/tools/fida_opl.py check --strict` y `guard` en verde.
- [x] `docs/estado_proyecto.md` y `docs/cicatrices_guerra.md` actualizados.
