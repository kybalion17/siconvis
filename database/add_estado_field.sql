-- Script para agregar el campo estado a la tabla trmavehiculos
-- Ejecutar este script en la base de datos existente

ALTER TABLE trmavehiculos 
ADD COLUMN estado ENUM('ACTIVO', 'INACTIVO', 'MANTENIMIENTO', 'SINIESTRADO') 
DEFAULT 'ACTIVO' 
AFTER observacion;

-- Actualizar todos los registros existentes para que tengan estado 'ACTIVO'
UPDATE trmavehiculos SET estado = 'ACTIVO' WHERE estado IS NULL;
