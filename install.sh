#!/bin/bash

echo "========================================"
echo "    SICONVIS - Instalación"
echo "========================================"
echo

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar errores
error() {
    echo -e "${RED}ERROR: $1${NC}"
    exit 1
}

# Función para mostrar éxito
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Función para mostrar advertencias
warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

echo "[1/6] Verificando requisitos..."

# Verificar PHP
if ! command -v php &> /dev/null; then
    error "PHP no está instalado o no está en el PATH"
fi

# Verificar Composer
if ! command -v composer &> /dev/null; then
    error "Composer no está instalado o no está en el PATH"
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    error "Node.js no está instalado o no está en el PATH"
fi

# Verificar MySQL
if ! command -v mysql &> /dev/null; then
    warning "MySQL no está instalado o no está en el PATH"
fi

success "Requisitos verificados"
echo

echo "[2/6] Configurando Backend..."
cd backend

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    cp env.example .env
    success "Archivo .env creado"
else
    success "Archivo .env ya existe"
fi

# Instalar dependencias de PHP
echo "Instalando dependencias de PHP..."
if ! composer install --no-dev --optimize-autoloader; then
    error "Error instalando dependencias de PHP"
fi
success "Dependencias de PHP instaladas"

cd ..
echo

echo "[3/6] Configurando Base de Datos..."
echo "IMPORTANTE: Asegúrate de que MySQL esté ejecutándose"
echo "y que tengas acceso con las credenciales configuradas en .env"
echo

read -p "¿Continuar con la configuración de la base de datos? (y/n): " continue
if [[ $continue != "y" && $continue != "Y" ]]; then
    echo "Saltando configuración de base de datos..."
else
    echo "Ejecutando migración de base de datos..."
    if ! mysql -u root -p < database/migrate.sql; then
        error "Error ejecutando migración de base de datos. Verifica que MySQL esté ejecutándose y las credenciales sean correctas"
    fi
    success "Base de datos configurada"
fi
echo

echo "[4/6] Configurando Frontend..."
cd frontend

# Crear proyecto React si no existe
if [ ! -f package.json ]; then
    echo "Inicializando proyecto React..."
    if ! npx create-react-app . --template typescript; then
        error "Error creando proyecto React"
    fi
else
    success "Proyecto React ya existe"
fi

# Instalar dependencias de Node.js
echo "Instalando dependencias de Node.js..."
if ! npm install; then
    error "Error instalando dependencias de Node.js"
fi
success "Dependencias de Node.js instaladas"

cd ..
echo

echo "[5/6] Creando directorios necesarios..."
mkdir -p backend/logs
mkdir -p backend/uploads
mkdir -p frontend/public/images
success "Directorios creados"
echo

echo "[6/6] Configuración completada!"
echo
echo "========================================"
echo "    SICONVIS - Listo para usar"
echo "========================================"
echo
echo "Para iniciar el sistema:"
echo
echo "1. Backend (Terminal 1):"
echo "   cd backend"
echo "   composer serve"
echo
echo "2. Frontend (Terminal 2):"
echo "   cd frontend"
echo "   npm start"
echo
echo "3. Acceder a:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo
echo "Credenciales por defecto:"
echo "   Usuario: admin"
echo "   Contraseña: password"
echo
echo "========================================"
