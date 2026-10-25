@echo off
chcp 65001 >nul
title Crème & Co - Lanzador de Microservicios Backend
color 0E

echo ======================================================================
echo           CRÈME & CO - ORQUESTADOR DE BACKEND Y MICROSERVICIOS
echo ======================================================================
echo.

:: 1. Verificar Java
echo [1/4] Verificando instalación de Java JDK 17/21...
where java >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] No se encontró Java en el PATH. Instala JDK 17 o 21 para continuar.
    pause
    exit /b 1
)
java -version 2>&1 | findstr /i "version"
echo [OK] Java detectado correctamente.
echo.

:: 2. Detectar Maven
echo [2/4] Detectando Maven para compilación...
set "MVN_CMD=mvn"
where mvn >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    if exist "C:\Program Files\Apache NetBeans\java\maven\bin\mvn.cmd" (
        set "MVN_CMD=C:\Program Files\Apache NetBeans\java\maven\bin\mvn.cmd"
        echo [OK] Maven detectado en NetBeans: %MVN_CMD%
    ) else (
        echo [AVISO] 'mvn' no está en el PATH global. Se usarán los JARs precompilados.
    )
) else (
    echo [OK] Maven detectado en el PATH global.
)
echo.

:: 3. Levantar Contenedores Docker (MySQL, Kafka, Zookeeper, Kafdrop, Redis)
echo [3/4] Levantando infraestructura en Docker (MySQL, Kafka, Kafdrop, Redis)...
where docker >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    docker compose -f backend\docker-compose.yml up -d
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Contenedores Docker iniciados correctamente.
        echo      - Kafdrop (Monitor Kafka): http://localhost:9000
        echo      - MySQL 8: localhost:3306 (BD: cremeco_db)
        echo      - Redis: localhost:6379
    ) else (
        echo [AVISO] Docker no pudo iniciar los contenedores o ya están corriendo.
    )
) else (
    echo [AVISO] Docker no está disponible en este entorno. Continuando con microservicios locales...
)
echo.

:: 4. Lanzar Microservicios Spring Boot
echo [4/4] Iniciando microservicios en ventanas independientes...
echo.

:: Verificar si los JARs existen, si no existen, compilar con Maven
if not exist "backend\api-gateway\target\api-gateway-1.0.0-SNAPSHOT.jar" (
    echo [AVISO] Compilando proyectos por primera vez...
    call "%MVN_CMD%" -f backend\pom.xml install -DskipTests
)

echo Iniciando API Gateway (:8080)...
start "Crème & Co - API Gateway (:8080)" cmd /k "title API Gateway :8080 && color 0B && java -jar backend\api-gateway\target\api-gateway-1.0.0-SNAPSHOT.jar"
timeout /t 3 >nul

echo Iniciando Service Identity (:8081)...
start "Crème & Co - Service Identity (:8081)" cmd /k "title Service Identity :8081 && color 0A && java -jar backend\service-identity\target\service-identity-1.0.0-SNAPSHOT.jar"

echo Iniciando Service Catalog (:8082)...
start "Crème & Co - Service Catalog (:8082)" cmd /k "title Service Catalog :8082 && color 0D && java -jar backend\service-catalog\target\service-catalog-1.0.0-SNAPSHOT.jar"

echo Iniciando Service Order (:8083)...
start "Crème & Co - Service Order (:8083)" cmd /k "title Service Order :8083 && color 0E && java -jar backend\service-order\target\service-order-1.0.0-SNAPSHOT.jar"

echo Iniciando Service Payment Flow (:8084)...
start "Crème & Co - Service Payment Flow (:8084)" cmd /k "title Service Payment Flow :8084 && color 0C && java -jar backend\service-payment-flow\target\service-payment-flow-1.0.0-SNAPSHOT.jar"

echo Iniciando Service Inventory & POS (:8085)...
start "Crème & Co - Service Inventory (:8085)" cmd /k "title Service Inventory :8085 && color 09 && java -jar backend\service-inventory\target\service-inventory-1.0.0-SNAPSHOT.jar"

echo Iniciando Service Notification (:8086)...
start "Crème & Co - Service Notification (:8086)" cmd /k "title Service Notification :8086 && color 0F && java -jar backend\service-notification\target\service-notification-1.0.0-SNAPSHOT.jar"

echo.
echo ======================================================================
echo           TODOS LOS SERVICIOS HAN SIDO LANZADOS CON ÉXITO
echo ======================================================================
echo.
echo  * API Gateway:              http://localhost:8080
echo  * Service Identity (RBAC):  http://localhost:8081
echo  * Service Catalog:          http://localhost:8082
echo  * Service Order & Tracking: http://localhost:8083
echo  * Service Payment Flow.cl:  http://localhost:8084
echo  * Service Inventory & POS:  http://localhost:8085
echo  * Service Notification:     http://localhost:8086
echo  * Kafdrop (Kafka Monitor):  http://localhost:9000
echo.
echo  Para conectar los frontends:
echo  - Tienda Web Clientes:      npm --prefix frontend run dev   (:5173)
echo  - Aplicación Admin PWA:     npm --prefix admin-pwa run dev  (:5174)
echo.
echo Presiona cualquier tecla para cerrar este asistente (los servicios seguirán corriendo)...
pause >nul
