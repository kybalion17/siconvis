@echo off
echo ========================================
echo    SICONFLOT - Sistema Control de Flota
echo ========================================
echo.

echo Iniciando SICONFLOT...
echo.

REM Verificar si PHP esta disponible
php --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: PHP no esta disponible
    echo Por favor instala PHP 8.1+ y agregalo al PATH
    pause
    exit /b 1
)

REM Verificar si Node.js esta disponible
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta disponible
    echo Por favor instala Node.js 18+ y agregalo al PATH
    pause
    exit /b 1
)

echo ✓ PHP y Node.js encontrados
echo.

echo Iniciando backend en puerto 8000...
start "SICONFLOT Backend" cmd /k "cd /d %~dp0backend && php -S localhost:8000 -t public"

echo Esperando 3 segundos para que el backend inicie...
timeout /t 3 /nobreak >nul

echo Iniciando frontend en puerto 3000...
start "SICONFLOT Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo    SICONFLOT INICIADO EXITOSAMENTE
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Credenciales por defecto:
echo Usuario: admin@siconflot.com
echo Contraseña: admin123
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
