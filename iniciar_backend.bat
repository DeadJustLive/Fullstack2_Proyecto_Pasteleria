@echo off
chcp 65001 >nul
title Crème & Co - Orquestador Docker y Microservicios Backend
color 0E

echo ======================================================================
echo           CRÈME & CO - ORQUESTADOR DE BACKEND Y MICROSERVICIOS
echo ======================================================================
echo.

:: 1. Detectar Maven para compilaciones
set "MVN_CMD=mvn"
where mvn >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    if exist "C:\Program Files\Apache NetBeans\java\maven\bin\mvn.cmd" (
        set "MVN_CMD=C:\Program Files\Apache NetBeans\java\maven\bin\mvn.cmd"
    )
)

:: 2. Menú interactivo de arranque
echo Selecciona el modo de ejecución:
echo   [1] Modo Producción Completo en Docker (12 Contenedores: 5 Infra + 7 Microservicios) [RECOMENDADO]
echo   [2] Modo Híbrido (Docker para Infraestructura + Microservicios en ventanas CMD locales)
echo   [3] Solo Infraestructura Docker (MySQL, Kafka, Zookeeper, Kafdrop, Redis)
echo   [4] Ver estado de salud y feedback de los 12 contenedores (docker ps)
echo   [5] Detener todos los contenedores (docker compose down)
echo.
choice /c 12345 /t 5 /d 1 /m "Elige una opción (arranque automático en 5s)"
set "OPCION=%ERRORLEVEL%"
echo.

if "%OPCION%"=="1" goto MODO_DOCKER_PROD
if "%OPCION%"=="2" goto MODO_HIBRIDO
if "%OPCION%"=="3" goto MODO_SOLO_INFRA
if "%OPCION%"=="4" goto MODO_STATUS
if "%OPCION%"=="5" goto MODO_DOWN

:: ============================================================================
:: [1] MODO PRODUCCIÓN COMPLETO EN DOCKER (12 CONTENEDORES)
:: ============================================================================
:MODO_DOCKER_PROD
if not exist ".env.docker" (
    if exist ".env.docker.example" (
        echo [AVISO] Creando .env.docker desde .env.docker.example...
        copy .env.docker.example .env.docker >nul
    ) else (
        echo [ERROR] Falta archivo .env.docker para configurar Docker.
        pause
        exit /b 1
    )
)

echo [1/3] Compilando microservicios con Maven (garantiza JARs actualizados)...
call "%MVN_CMD%" -f backend\pom.xml package -DskipTests
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Falló la compilación Maven. Revisa los errores anteriores.
    pause
    exit /b 1
)

echo [2/3] Levantando y construyendo los 12 contenedores en Docker Desktop...
docker compose -f docker-compose.prod.yml up -d --build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Falló el levantamiento con Docker Compose. Revisa si Docker Desktop está abierto.
    pause
    exit /b 1
)

echo [3/3] Esperando estabilización de salud de los servicios (6 segundos)...
timeout /t 6 >nul

:MODO_STATUS
echo.
echo ======================================================================
echo           ESTADO ACTUAL DE LOS CONTENEDORES (HEALTH & PORTS)
echo ======================================================================
docker ps -a --filter "name=cremeco-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo.
echo  Puntos de acceso en tu PC (Host Local):
echo  * API Gateway:              http://localhost:8080
echo  * Service Identity (RBAC):  http://localhost:8081
echo  * Service Catalog:          http://localhost:8082
echo  * Service Order & Tracking: http://localhost:8083
echo  * Service Payment Flow.cl:  http://localhost:8084
echo  * Service Inventory & POS:  http://localhost:8085
echo  * Service Notification:     http://localhost:8086
echo  * Kafdrop (Kafka Monitor):  http://localhost:9000
echo  * MySQL 8 (BD cremeco_db): localhost:3306
echo  * Redis 7 (Caché):          localhost:6379
echo.
echo  Frontends:
echo  - Tienda Web Clientes:      npm --prefix frontend run dev   (:5173)
echo  - Aplicación Admin PWA:     npm --prefix admin-pwa run dev  (:5174)
echo.
pause
exit /b 0

:: ============================================================================
:: [2] MODO HÍBRIDO (INFRA EN DOCKER + JAVA LOCAL)
:: ============================================================================
:MODO_HIBRIDO
if exist ".env" (
    for /f "usebackq eol=# tokens=1,* delims==" %%A in (".env") do (
        if not "%%A"=="" set "%%A=%%~B"
    )
)
if exist "backend\.env" (
    for /f "usebackq eol=# tokens=1,* delims==" %%A in ("backend\.env") do (
        if not "%%A"=="" set "%%A=%%~B"
    )
)

echo Levantando 5 contenedores de infraestructura en Docker...
docker compose -f docker-compose.prod.yml up -d mysql-db zookeeper kafka kafdrop redis
if %ERRORLEVEL% NEQ 0 (
    echo [AVISO] Error al levantar contenedores de infraestructura.
)

if not exist "backend\api-gateway\target\api-gateway-1.0.0-SNAPSHOT.jar" (
    echo [AVISO] Compilando proyectos por primera vez...
    call "%MVN_CMD%" -f backend\pom.xml install -DskipTests
)

echo Lanzando microservicios en ventanas independientes...
start "Crème & Co - API Gateway (:8080)" cmd /k "title API Gateway :8080 && color 0B && java -jar backend\api-gateway\target\api-gateway-1.0.0-SNAPSHOT.jar"
timeout /t 3 >nul
start "Crème & Co - Service Identity (:8081)" cmd /k "title Service Identity :8081 && color 0A && java -jar backend\service-identity\target\service-identity-1.0.0-SNAPSHOT.jar"
start "Crème & Co - Service Catalog (:8082)" cmd /k "title Service Catalog :8082 && color 0D && java -jar backend\service-catalog\target\service-catalog-1.0.0-SNAPSHOT.jar"
start "Crème & Co - Service Order (:8083)" cmd /k "title Service Order :8083 && color 0E && java -jar backend\service-order\target\service-order-1.0.0-SNAPSHOT.jar"
start "Crème & Co - Service Payment Flow (:8084)" cmd /k "title Service Payment Flow :8084 && color 0C && java -jar backend\service-payment-flow\target\service-payment-flow-1.0.0-SNAPSHOT.jar"
start "Crème & Co - Service Inventory (:8085)" cmd /k "title Service Inventory :8085 && color 09 && java -jar backend\service-inventory\target\service-inventory-1.0.0-SNAPSHOT.jar"
start "Crème & Co - Service Notification (:8086)" cmd /k "title Service Notification :8086 && color 0F && java -jar backend\service-notification\target\service-notification-1.0.0-SNAPSHOT.jar"
goto MODO_STATUS

:: ============================================================================
:: [3] SOLO INFRAESTRUCTURA DOCKER
:: ============================================================================
:MODO_SOLO_INFRA
echo Levantando únicamente infraestructura (MySQL, Kafka, Zookeeper, Kafdrop, Redis)...
docker compose -f docker-compose.prod.yml up -d mysql-db zookeeper kafka kafdrop redis
goto MODO_STATUS

:: ============================================================================
:: [5] DETENER CONTENEDORES
:: ============================================================================
:MODO_DOWN
echo Deteniendo todos los contenedores de Crème & Co...
docker compose -f docker-compose.prod.yml down
echo [OK] Contenedores detenidos y red liberada.
pause
exit /b 0
