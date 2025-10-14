@echo off
echo ========================================
echo    SICONFLOT - Iniciar Backend
echo ========================================
echo.

cd backend
echo Iniciando servidor PHP en puerto 8000...
echo.
echo URL: http://localhost:8000
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

php -S 0.0.0.0:8000 -t public
