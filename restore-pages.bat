@echo off
echo Restaurando páginas originales...

REM Restaurar páginas desde backup
if exist "frontend\src\pages\Visitas-backup.tsx" (
    copy "frontend\src\pages\Visitas-backup.tsx" "frontend\src\pages\Visitas.tsx"
    echo Visitas.tsx restaurado desde backup
)

if exist "frontend\src\pages\Reportes-backup.tsx" (
    copy "frontend\src\pages\Reportes-backup.tsx" "frontend\src\pages\Reportes.tsx"
    echo Reportes.tsx restaurado desde backup
)

if exist "frontend\src\pages\Configuracion-backup.tsx" (
    copy "frontend\src\pages\Configuracion-backup.tsx" "frontend\src\pages\Configuracion.tsx"
    echo Configuracion.tsx restaurado desde backup
)

echo.
echo ¡Páginas originales restauradas!
pause
