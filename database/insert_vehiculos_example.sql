-- Script para insertar datos de ejemplo de vehículos con el campo estado
-- Ejecutar después de agregar el campo estado a la tabla

INSERT IGNORE INTO trmavehiculos (
    clase, marca, modelo, anio, colorp, colors, transmision, placa, 
    scarroceria, smotor, km, peso, unidadpeso, asientos, combustible, 
    npuestos, observacion, estado, fecha_registro, eliminado
) VALUES (
    (SELECT id FROM trmaclase WHERE nombre = 'Automóvil' ORDER BY id LIMIT 1),
    (SELECT id FROM trmamarca WHERE nombre = 'Toyota' ORDER BY id LIMIT 1),
    (SELECT id FROM trmamodelo WHERE nombre = 'Corolla' ORDER BY id LIMIT 1),
    2020,
    (SELECT id FROM trmacolor WHERE nombre = 'Blanco' ORDER BY id LIMIT 1),
    (SELECT id FROM trmacolor WHERE nombre = 'Negro' ORDER BY id LIMIT 1),
    (SELECT id FROM trmatransmision WHERE nombre = 'Automática' ORDER BY id LIMIT 1),
    'ABC123',
    'CH001234567890',
    'MOT1234567890',
    45000,
    1500,
    (SELECT id FROM trmaunidad_peso WHERE nombre = 'kg' ORDER BY id LIMIT 1),
    (SELECT id FROM trmaasientos WHERE nombre = '5' ORDER BY id LIMIT 1),
    (SELECT id FROM trmacombustible WHERE nombre = 'Gasolina' ORDER BY id LIMIT 1),
    4,
    'Vehículo en excelente estado',
    'ACTIVO',
    CURDATE(),
    0
);

INSERT IGNORE INTO trmavehiculos (
    clase, marca, modelo, anio, colorp, colors, transmision, placa, 
    scarroceria, smotor, km, peso, unidadpeso, asientos, combustible, 
    npuestos, observacion, estado, fecha_registro, eliminado
) VALUES (
    (SELECT id FROM trmaclase WHERE nombre = 'Camioneta' ORDER BY id LIMIT 1),
    (SELECT id FROM trmamarca WHERE nombre = 'Ford' ORDER BY id LIMIT 1),
    (SELECT id FROM trmamodelo WHERE nombre = 'Ranger' ORDER BY id LIMIT 1),
    2019,
    (SELECT id FROM trmacolor WHERE nombre = 'Azul' ORDER BY id LIMIT 1),
    (SELECT id FROM trmacolor WHERE nombre = 'Blanco' ORDER BY id LIMIT 1),
    (SELECT id FROM trmatransmision WHERE nombre = 'Manual' ORDER BY id LIMIT 1),
    'XYZ789',
    'CH987654321098',
    'MOT9876543210',
    28000,
    2000,
    (SELECT id FROM trmaunidad_peso WHERE nombre = 'kg' ORDER BY id LIMIT 1),
    (SELECT id FROM trmaasientos WHERE nombre = '5' ORDER BY id LIMIT 1),
    (SELECT id FROM trmacombustible WHERE nombre = 'Diésel' ORDER BY id LIMIT 1),
    2,
    'Vehículo en mantenimiento',
    'MANTENIMIENTO',
    CURDATE(),
    0
);
