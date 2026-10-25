@echo off
chcp 65001 >nul
title Crème & Co - Validador de Pasarela Flow.cl e Idempotencia
color 0B

echo ======================================================================
echo           CRÈME & CO - VALIDACIÓN INTEGRAL DE FLOW.CL
echo ======================================================================
echo.

echo [1/2] Ejecutando Tests Automatizados Unitarios y de Idempotencia en Spring Boot...
if exist "C:\Program Files\Apache NetBeans\java\maven\bin\mvn.cmd" (
    call "C:\Program Files\Apache NetBeans\java\maven\bin\mvn.cmd" -f backend\service-payment-flow\pom.xml test
) else (
    call mvn -f backend\service-payment-flow\pom.xml test
)

echo.
echo [2/2] Ejecutando Validador de Criptografía, Idempotencia y Resiliencia...
node Biblioteca-de-Componentes-main\validar_flujo_completo.mjs

echo.
echo Presiona cualquier tecla para salir...
pause >nul
