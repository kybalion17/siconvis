@echo off
echo ========================================
echo    SICONFLOT - Instalacion
echo ========================================
echo.

echo [1/6] Verificando requisitos...
php --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: PHP no esta instalado o no esta en el PATH
    pause
    exit /b 1
)

composer --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Composer no esta instalado o no esta en el PATH
    pause
    exit /b 1
)

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado o no esta en el PATH
    pause
    exit /b 1
)

echo ✓ Requisitos verificados
echo.

echo [2/6] Configurando Backend...
cd backend
if not exist .env (
    copy env.example .env
    echo ✓ Archivo .env creado
) else (
    echo ✓ Archivo .env ya existe
)

echo Instalando dependencias de PHP...
composer install --no-dev --optimize-autoloader
if %errorlevel% neq 0 (
    echo ERROR: Error instalando dependencias de PHP
    pause
    exit /b 1
)
echo ✓ Dependencias de PHP instaladas
cd ..
echo.

echo [3/6] Configurando Base de Datos...
echo IMPORTANTE: Asegurate de que MySQL este ejecutandose
echo y que tengas acceso con las credenciales configuradas en .env
echo.
set /p continue="¿Continuar con la configuracion de la base de datos? (y/n): "
if /i "%continue%" neq "y" (
    echo Saltando configuracion de base de datos...
    goto :frontend
)

echo Ejecutando migracion de base de datos...
mysql -u root -p < database/migrate.sql
if %errorlevel% neq 0 (
    echo ERROR: Error ejecutando migracion de base de datos
    echo Verifica que MySQL este ejecutandose y las credenciales sean correctas
    pause
    exit /b 1
)
echo ✓ Base de datos configurada
echo.

:frontend
echo [4/6] Configurando Frontend...
cd frontend
if not exist package.json (
    echo Inicializando proyecto React...
    npx create-react-app . --template typescript
    if %errorlevel% neq 0 (
        echo ERROR: Error creando proyecto React
        pause
        exit /b 1
    )
) else (
    echo ✓ Proyecto React ya existe
)

echo Instalando dependencias de Node.js...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Error instalando dependencias de Node.js
    pause
    exit /b 1
)
echo ✓ Dependencias de Node.js instaladas
cd ..
echo.

echo [5/6] Creando directorios necesarios...
if not exist "backend\logs" mkdir "backend\logs"
if not exist "backend\uploads" mkdir "backend\uploads"
if not exist "frontend\public\images" mkdir "frontend\public\images"
echo ✓ Directorios creados
echo.

echo [6/6] Configuracion completada!
echo.
echo ========================================
echo    SAGAUT Modern - Listo para usar
echo ========================================
echo.
echo Para iniciar el sistema:
echo.
echo 1. Backend (Terminal 1):
echo    cd backend
echo    composer serve
echo.
echo 2. Frontend (Terminal 2):
echo    cd frontend
echo    npm start
echo.
echo 3. Acceder a:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8000
echo.
echo Credenciales por defecto:
echo    Usuario: admin
echo    Contraseña: password
echo.
echo ========================================
pause
