@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
cd /d "%~dp0"
title "Creme and Co - Ejecutor de Pruebas Unitarias"
color 0B

echo ======================================================================
echo           CREME AND CO - SUITE DE PRUEBAS AUTOMATIZADAS (VITEST)
echo ======================================================================
echo.

where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] No se encontro Node.js / npm en el sistema.
    echo Asegurate de tener Node.js instalado y agregado al PATH.
    echo.
    pause
    exit /b 1
)

echo Selecciona la modalidad de pruebas:
echo   [1] Ejecutar todas las pruebas unitarias (npm run test) [RECOMENDADO]
echo   [2] Ejecutar pruebas con reporte de cobertura V8 (npm run test:coverage)
echo   [3] Modo observador interactivo en tiempo real (npm run test:watch)
echo   [4] Abrir reporte visual de cobertura HTML en el navegador
echo   [6] Salir
echo.

set /p OPCION="Elige una opcion (1-6) [por defecto 1]: "
if "!OPCION!"=="" set "OPCION=1"
echo.

if "!OPCION!"=="1" goto MODO_TEST
if "!OPCION!"=="2" goto MODO_COVERAGE
if "!OPCION!"=="3" goto MODO_WATCH
if "!OPCION!"=="4" goto MODO_OPEN_HTML
if "!OPCION!"=="5" goto MODO_FIDA
if "!OPCION!"=="6" goto MODO_SALIR
goto MODO_TEST

:MODO_TEST
echo [EJECUTANDO] Corriendo la suite completa de pruebas unitarias en frontend/...
echo.
call npm --prefix frontend test
echo.
if %ERRORLEVEL% EQU 0 (
    echo ======================================================================
    echo  [EXITO] Todas las pruebas pasaron satisfactoriamente en verde.
    echo ======================================================================
) else (
    echo ======================================================================
    echo  [FALLO] Se detectaron errores en la suite de pruebas.
    echo ======================================================================
)
goto FIN

:MODO_COVERAGE
echo [EJECUTANDO] Generando reporte detallado de cobertura con motor V8...
echo.
call npm --prefix frontend run test:coverage
echo.
if exist "frontend\coverage\index.html" (
    echo [INFO] Reporte HTML generado en: frontend\coverage\index.html
    echo Abriendo reporte en el navegador...
    start "" "frontend\coverage\index.html"
)
goto FIN

:MODO_WATCH
echo [EJECUTANDO] Iniciando Vitest en modo observador (Watcher)...
echo Presiona 'q' para salir.
echo.
call npm --prefix frontend run test:watch
goto FIN

:MODO_OPEN_HTML
if exist "frontend\coverage\index.html" (
    echo [INFO] Abriendo reporte visual interactivo en el navegador...
    start "" "frontend\coverage\index.html"
) else (
    echo [AVISO] El reporte HTML aun no existe. Generandolo ahora...
    echo.
    call npm --prefix frontend run test:coverage
    if exist "frontend\coverage\index.html" (
        start "" "frontend\coverage\index.html"
    )
)
goto FIN

:MODO_FIDA
echo.
goto FIN

:FIN
echo.
pause
exit /b 0

:MODO_SALIR
exit /b 0
