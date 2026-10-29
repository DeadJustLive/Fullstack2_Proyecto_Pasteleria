#!/usr/bin/env bash
# ==============================================================================
# Script de Despliegue y Arranque de Producción — Crème & Co Pastelería (VPS Linux)
# ==============================================================================
set -e

echo "🍰 ========================================================"
echo "   Iniciando Despliegue de Backend & Servicios Crème & Co"
echo "   Pastelería Artesanal Chilena — Evaluación DSY1104"
echo "========================================================"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# 1. Verificar archivo de variables de entorno
if [ ! -f ".env" ]; then
    echo "⚠️  No se encontró archivo .env. Copiando desde .env.example..."
    cp .env.example .env
    echo "✅ Archivo .env creado. Por favor revise sus credenciales de Flow y MySQL si es necesario."
fi

# 2. Verificar dependencias de compilación
if command -v mvn &> /dev/null; then
    echo "📦 Compilando microservicios Spring Boot con Maven..."
    mvn -f backend/pom.xml clean package -DskipTests
elif [ -f "/opt/maven/bin/mvn" ]; then
    echo "📦 Compilando microservicios Spring Boot con Maven (/opt/maven)..."
    /opt/maven/bin/mvn -f backend/pom.xml clean package -DskipTests
else
    echo "ℹ️  Maven no encontrado en PATH local. Los servicios se compilarán en contenedor multi-stage."
fi

# 3. Levantar infraestructura con Docker Compose
echo "🚀 Levantando contenedores de producción (MySQL 8, Kafka, Redis, Microservicios)..."
if docker compose version &> /dev/null; then
    docker compose -f docker-compose.prod.yml up -d --build
elif command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.prod.yml up -d --build
else
    echo "❌ Error: Docker Compose no está instalado en este servidor VPS."
    exit 1
fi

echo "⏳ Esperando estabilización de MySQL 8 y API Gateway (15 segundos)..."
sleep 15

# 4. Verificación de salud de servicios
echo "🔍 Comprobando estado de contenedores..."
docker ps --filter "name=cremeco-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🎉 ========================================================"
echo "   ¡Despliegue completado exitosamente!"
echo "   API Gateway:        http://localhost:8080"
echo "   MySQL 8:            localhost:3306 (cremeco_db)"
echo "   Kardex & POS:       Activos con rebaja de stock automática"
echo "   Boletas SII:        Activas con cálculo de 19% IVA"
echo "========================================================"
