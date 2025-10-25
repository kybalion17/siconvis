@echo off
echo ========================================
echo    INSERTANDO DATOS DE PRUEBA
echo ========================================
echo.

echo Opciones disponibles:
echo 1. Ejecutar script PHP (recomendado)
echo 2. Ejecutar script SQL directamente
echo 3. Solo mostrar el script SQL
echo.

set /p choice="Selecciona una opción (1-3): "

if "%choice%"=="1" (
    echo.
    echo Ejecutando script PHP...
    cd backend\public
    php insert-test-data.php
    echo.
    echo ¡Datos insertados exitosamente!
    pause
) else if "%choice%"=="2" (
    echo.
    echo Ejecutando script SQL...
    echo NOTA: Asegúrate de tener MySQL configurado y la base de datos 'siconvis' creada
    echo.
    mysql -u root -p siconvis < database\insert_test_data.sql
    echo.
    echo ¡Script SQL ejecutado!
    pause
) else if "%choice%"=="3" (
    echo.
    echo Mostrando contenido del script SQL:
    echo ========================================
    type database\insert_test_data.sql
    echo ========================================
    echo.
    echo Para ejecutar este script, usa:
    echo mysql -u root -p siconvis ^< database\insert_test_data.sql
    pause
) else (
    echo Opción inválida. Saliendo...
    pause
)
