@echo off
echo Reemplazando páginas problemáticas con versiones que funcionan...

REM Hacer backup de las páginas originales
if exist "frontend\src\pages\Visitas.tsx" (
    copy "frontend\src\pages\Visitas.tsx" "frontend\src\pages\Visitas-backup.tsx"
    echo Backup de Visitas.tsx creado
)

if exist "frontend\src\pages\Reportes.tsx" (
    copy "frontend\src\pages\Reportes.tsx" "frontend\src\pages\Reportes-backup.tsx"
    echo Backup de Reportes.tsx creado
)

if exist "frontend\src\pages\Configuracion.tsx" (
    copy "frontend\src\pages\Configuracion.tsx" "frontend\src\pages\Configuracion-backup.tsx"
    echo Backup de Configuracion.tsx creado
)

REM Reemplazar con versiones que funcionan
if exist "frontend\src\pages\Visitas-working.tsx" (
    copy "frontend\src\pages\Visitas-working.tsx" "frontend\src\pages\Visitas.tsx"
    echo Visitas.tsx reemplazado con versión funcional
)

if exist "frontend\src\pages\Reportes-working.tsx" (
    copy "frontend\src\pages\Reportes-working.tsx" "frontend\src\pages\Reportes.tsx"
    echo Reportes.tsx reemplazado con versión funcional
)

if exist "frontend\src\pages\Configuracion-working.tsx" (
    copy "frontend\src\pages\Configuracion-working.tsx" "frontend\src\pages\Configuracion.tsx"
    echo Configuracion.tsx reemplazado con versión funcional
)

echo.
echo ¡Páginas reemplazadas exitosamente!
echo Ahora puedes probar la navegación en el navegador.
echo.
echo Para restaurar las páginas originales, ejecuta: restore-pages.bat
pause
