@echo off
echo ========================================
echo    SICONFLOT - Instalacion Windows
echo ========================================
echo.

echo [1/8] Verificando requisitos del sistema...
echo.

REM Verificar PHP
php --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: PHP no esta instalado o no esta en el PATH
    echo Por favor instala PHP 8.1+ desde https://windows.php.net/download/
    echo Asegurate de agregar PHP al PATH del sistema
    pause
    exit /b 1
) else (
    echo ✓ PHP encontrado
)

REM Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado o no esta en el PATH
    echo Por favor instala Node.js 18+ desde https://nodejs.org/
    echo Asegurate de agregar Node.js al PATH del sistema
    pause
    exit /b 1
) else (
    echo ✓ Node.js encontrado
)

REM Verificar npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm no esta disponible
    echo Por favor reinstala Node.js
    pause
    exit /b 1
) else (
    echo ✓ npm encontrado
)

REM Verificar MySQL
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ADVERTENCIA: MySQL no encontrado en PATH
    echo Asegurate de tener MySQL 5.6+ instalado y configurado
    echo Puedes continuar pero necesitaras configurar la base de datos manualmente
) else (
    echo ✓ MySQL encontrado
)

echo.
echo [2/8] Creando archivos de configuracion...
echo.

REM Crear archivo .env para backend
if not exist "backend\.env" (
    copy "backend\env.example" "backend\.env" >nul
    echo ✓ Archivo .env creado para backend
) else (
    echo ✓ Archivo .env ya existe para backend
)

REM Crear archivo .env para frontend
if not exist "frontend\.env" (
    copy "frontend\env.example" "frontend\.env" >nul
    echo ✓ Archivo .env creado para frontend
) else (
    echo ✓ Archivo .env ya existe para frontend
)

echo.
echo [3/8] Instalando dependencias del backend...
echo.

cd backend
if exist "composer.json" (
    composer install --no-dev --optimize-autoloader
    if %errorlevel% neq 0 (
        echo ERROR: Fallo la instalacion de dependencias PHP
        echo Asegurate de tener Composer instalado: https://getcomposer.org/
        pause
        exit /b 1
    ) else (
        echo ✓ Dependencias PHP instaladas
    )
) else (
    echo ADVERTENCIA: composer.json no encontrado
)

cd ..

echo.
echo [4/8] Instalando dependencias del frontend...
echo.

cd frontend
if exist "package.json" (
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Fallo la instalacion de dependencias Node.js
        pause
        exit /b 1
    ) else (
        echo ✓ Dependencias Node.js instaladas
    )
) else (
    echo ADVERTENCIA: package.json no encontrado
)

cd ..

echo.
echo [5/8] Creando directorios necesarios...
echo.

REM Crear directorio de uploads
if not exist "backend\uploads" (
    mkdir "backend\uploads" >nul
    mkdir "backend\uploads\documentos" >nul
    echo ✓ Directorio de uploads creado
) else (
    echo ✓ Directorio de uploads ya existe
)

REM Crear directorio de logs
if not exist "backend\logs" (
    mkdir "backend\logs" >nul
    echo ✓ Directorio de logs creado
) else (
    echo ✓ Directorio de logs ya existe
)

echo.
echo [6/8] Configurando base de datos...
echo.

echo IMPORTANTE: Necesitas configurar la base de datos manualmente
echo.
echo 1. Abre phpMyAdmin o tu cliente MySQL preferido
echo 2. Crea una base de datos llamada 'siconflot'
echo 3. Importa el archivo: database\migrate.sql
echo 4. Configura las credenciales en: backend\.env
echo.
echo Base de datos: siconflot
echo Usuario: root (o el que prefieras)
echo Contraseña: (la que uses en tu MySQL)
echo.

echo [7/8] Compilando frontend...
echo.

cd frontend
if exist "package.json" (
    npm run build
    if %errorlevel% neq 0 (
        echo ADVERTENCIA: Fallo la compilacion del frontend
        echo Puedes compilar manualmente con: npm run build
    ) else (
        echo ✓ Frontend compilado exitosamente
    )
) else (
    echo ADVERTENCIA: No se pudo compilar el frontend
)

cd ..

echo.
echo [8/8] Configuracion final...
echo.

echo ========================================
echo    INSTALACION COMPLETADA
echo ========================================
echo.
echo SICONFLOT ha sido instalado exitosamente!
echo.
echo PRÓXIMOS PASOS:
echo.
echo 1. Configura la base de datos MySQL:
echo    - Crea la base de datos 'siconflot'
echo    - Importa database\migrate.sql
echo    - Actualiza backend\.env con tus credenciales
echo.
echo 2. Inicia el servidor PHP:
echo    cd backend
echo    php -S localhost:8000 -t public
echo.
echo 3. En otra terminal, inicia el frontend:
echo    cd frontend
echo    npm run dev
echo.
echo 4. Abre tu navegador en:
echo    http://localhost:3000
echo.
echo CREDENCIALES POR DEFECTO:
echo Usuario: admin@siconflot.com
echo Contraseña: admin123
echo.
echo ========================================
echo.

pause
