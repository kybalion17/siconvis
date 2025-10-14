-- Script SQL FINAL basado exactamente en migrate.sql
-- Ejecutar este script en la base de datos siconflot

-- ==============================================
-- 1. CARGAR MARCAS DE VEHÍCULOS
-- ==============================================

INSERT INTO trmamarca (nombre) VALUES
-- Marcas principales
('Toyota'),
('Ford'),
('Chevrolet'),
('Nissan'),
('Honda'),
('Hyundai'),
('Kia'),
('Mazda'),
('Subaru'),
('Mitsubishi'),
('Suzuki'),
('Isuzu'),
('Daihatsu'),

-- Marcas europeas
('Volkswagen'),
('BMW'),
('Mercedes-Benz'),
('Audi'),
('Peugeot'),
('Renault'),
('Citroën'),
('Fiat'),
('Alfa Romeo'),
('Volvo'),
('Saab'),
('Opel'),
('Seat'),
('Skoda'),

-- Marcas americanas
('Cadillac'),
('Lincoln'),
('Buick'),
('GMC'),
('Chrysler'),
('Dodge'),
('Jeep'),
('Ram'),

-- Marcas de lujo
('Lexus'),
('Infiniti'),
('Acura'),
('Genesis'),
('Porsche'),
('Jaguar'),
('Land Rover'),
('Range Rover'),
('Bentley'),
('Rolls-Royce'),
('Maserati'),
('Ferrari'),
('Lamborghini'),
('Aston Martin'),
('McLaren'),

-- Marcas comerciales
('Iveco'),
('Scania'),
('Volvo Trucks'),
('MAN'),
('Mercedes-Benz Trucks'),
('Freightliner'),
('Peterbilt'),
('Kenworth'),
('Mack'),
('International');

-- ==============================================
-- 2. CARGAR MODELOS DE VEHÍCULOS
-- ==============================================

-- Obtener IDs de marcas para referencias
SET @toyota_id = (SELECT id FROM trmamarca WHERE nombre = 'Toyota' LIMIT 1);
SET @ford_id = (SELECT id FROM trmamarca WHERE nombre = 'Ford' LIMIT 1);
SET @chevrolet_id = (SELECT id FROM trmamarca WHERE nombre = 'Chevrolet' LIMIT 1);
SET @nissan_id = (SELECT id FROM trmamarca WHERE nombre = 'Nissan' LIMIT 1);
SET @honda_id = (SELECT id FROM trmamarca WHERE nombre = 'Honda' LIMIT 1);
SET @hyundai_id = (SELECT id FROM trmamarca WHERE nombre = 'Hyundai' LIMIT 1);
SET @kia_id = (SELECT id FROM trmamarca WHERE nombre = 'Kia' LIMIT 1);
SET @mazda_id = (SELECT id FROM trmamarca WHERE nombre = 'Mazda' LIMIT 1);
SET @volkswagen_id = (SELECT id FROM trmamarca WHERE nombre = 'Volkswagen' LIMIT 1);
SET @bmw_id = (SELECT id FROM trmamarca WHERE nombre = 'BMW' LIMIT 1);
SET @mercedes_id = (SELECT id FROM trmamarca WHERE nombre = 'Mercedes-Benz' LIMIT 1);
SET @audi_id = (SELECT id FROM trmamarca WHERE nombre = 'Audi' LIMIT 1);

-- TOYOTA
INSERT INTO trmamodelo (id_marca, nombre) VALUES
(@toyota_id, 'Corolla'),
(@toyota_id, 'Camry'),
(@toyota_id, 'Prius'),
(@toyota_id, 'RAV4'),
(@toyota_id, 'Highlander'),
(@toyota_id, '4Runner'),
(@toyota_id, 'Tacoma'),
(@toyota_id, 'Tundra'),
(@toyota_id, 'Sienna'),
(@toyota_id, 'Avalon'),
(@toyota_id, 'Yaris'),
(@toyota_id, 'C-HR'),
(@toyota_id, 'Venza'),
(@toyota_id, 'Sequoia'),
(@toyota_id, 'Land Cruiser'),
(@toyota_id, 'Supra'),
(@toyota_id, 'GR86'),
(@toyota_id, 'GR Corolla');

-- FORD
INSERT INTO trmamodelo (id_marca, nombre) VALUES
(@ford_id, 'F-150'),
(@ford_id, 'F-250'),
(@ford_id, 'F-350'),
(@ford_id, 'Ranger'),
(@ford_id, 'Explorer'),
(@ford_id, 'Expedition'),
(@ford_id, 'Escape'),
(@ford_id, 'Edge'),
(@ford_id, 'Bronco'),
(@ford_id, 'Bronco Sport'),
(@ford_id, 'Mustang'),
(@ford_id, 'Mustang Mach-E'),
(@ford_id, 'Focus'),
(@ford_id, 'Fiesta'),
(@ford_id, 'Transit'),
(@ford_id, 'Transit Connect'),
(@ford_id, 'EcoSport'),
(@ford_id, 'Flex');

-- CHEVROLET
INSERT INTO trmamodelo (id_marca, nombre) VALUES
(@chevrolet_id, 'Silverado'),
(@chevrolet_id, 'Silverado HD'),
(@chevrolet_id, 'Colorado'),
(@chevrolet_id, 'Tahoe'),
(@chevrolet_id, 'Suburban'),
(@chevrolet_id, 'Equinox'),
(@chevrolet_id, 'Traverse'),
(@chevrolet_id, 'Blazer'),
(@chevrolet_id, 'Trailblazer'),
(@chevrolet_id, 'Malibu'),
(@chevrolet_id, 'Impala'),
(@chevrolet_id, 'Camaro'),
(@chevrolet_id, 'Corvette'),
(@chevrolet_id, 'Cruze'),
(@chevrolet_id, 'Sonic'),
(@chevrolet_id, 'Spark'),
(@chevrolet_id, 'Bolt EV'),
(@chevrolet_id, 'Express');

-- NISSAN
INSERT INTO trmamodelo (id_marca, nombre) VALUES
(@nissan_id, 'Altima'),
(@nissan_id, 'Sentra'),
(@nissan_id, 'Versa'),
(@nissan_id, 'Maxima'),
(@nissan_id, 'Rogue'),
(@nissan_id, 'Murano'),
(@nissan_id, 'Pathfinder'),
(@nissan_id, 'Armada'),
(@nissan_id, 'Frontier'),
(@nissan_id, 'Titan'),
(@nissan_id, 'Kicks'),
(@nissan_id, '370Z'),
(@nissan_id, 'GT-R'),
(@nissan_id, 'Leaf'),
(@nissan_id, 'Ariya'),
(@nissan_id, 'NV200'),
(@nissan_id, 'NV Passenger'),
(@nissan_id, 'NV Cargo');

-- HONDA
INSERT INTO trmamodelo (id_marca, nombre) VALUES
(@honda_id, 'Civic'),
(@honda_id, 'Accord'),
(@honda_id, 'Insight'),
(@honda_id, 'CR-V'),
(@honda_id, 'Pilot'),
(@honda_id, 'Passport'),
(@honda_id, 'Ridgeline'),
(@honda_id, 'HR-V'),
(@honda_id, 'Fit'),
(@honda_id, 'Odyssey'),
(@honda_id, 'Element'),
(@honda_id, 'S2000'),
(@honda_id, 'NSX'),
(@honda_id, 'Type R'),
(@honda_id, 'Clarity'),
(@honda_id, 'e');

-- HYUNDAI
INSERT INTO trmamodelo (id_marca, nombre) VALUES
(@hyundai_id, 'Elantra'),
(@hyundai_id, 'Sonata'),
(@hyundai_id, 'Accent'),
(@hyundai_id, 'Tucson'),
(@hyundai_id, 'Santa Fe'),
(@hyundai_id, 'Palisade'),
(@hyundai_id, 'Kona'),
(@hyundai_id, 'Venue'),
(@hyundai_id, 'Ioniq'),
(@hyundai_id, 'Ioniq 5'),
(@hyundai_id, 'Ioniq 6'),
(@hyundai_id, 'Genesis'),
(@hyundai_id, 'Veloster'),
(@hyundai_id, 'Nexo');

-- KIA
INSERT INTO trmamodelo (id_marca, nombre) VALUES
(@kia_id, 'Forte'),
(@kia_id, 'Optima'),
(@kia_id, 'K5'),
(@kia_id, 'Sorento'),
(@kia_id, 'Sportage'),
(@kia_id, 'Telluride'),
(@kia_id, 'Soul'),
(@kia_id, 'Niro'),
(@kia_id, 'Stinger'),
(@kia_id, 'Carnival'),
(@kia_id, 'EV6'),
(@kia_id, 'Seltos');

-- MAZDA
INSERT INTO trmamodelo (id_marca, nombre) VALUES
(@mazda_id, 'Mazda3'),
(@mazda_id, 'Mazda6'),
(@mazda_id, 'CX-3'),
(@mazda_id, 'CX-5'),
(@mazda_id, 'CX-9'),
(@mazda_id, 'CX-30'),
(@mazda_id, 'MX-5 Miata'),
(@mazda_id, 'MX-30'),
(@mazda_id, 'Tribute'),
(@mazda_id, 'MPV');

-- VOLKSWAGEN
INSERT INTO trmamodelo (id_marca, nombre) VALUES
(@volkswagen_id, 'Jetta'),
(@volkswagen_id, 'Passat'),
(@volkswagen_id, 'Golf'),
(@volkswagen_id, 'Beetle'),
(@volkswagen_id, 'Tiguan'),
(@volkswagen_id, 'Atlas'),
(@volkswagen_id, 'Arteon'),
(@volkswagen_id, 'ID.4'),
(@volkswagen_id, 'CC'),
(@volkswagen_id, 'Touareg');

-- BMW
INSERT INTO trmamodelo (id_marca, nombre) VALUES
(@bmw_id, '3 Series'),
(@bmw_id, '5 Series'),
(@bmw_id, '7 Series'),
(@bmw_id, 'X1'),
(@bmw_id, 'X3'),
(@bmw_id, 'X5'),
(@bmw_id, 'X7'),
(@bmw_id, 'Z4'),
(@bmw_id, 'i3'),
(@bmw_id, 'i8'),
(@bmw_id, 'iX'),
(@bmw_id, 'i4');

-- MERCEDES-BENZ
INSERT INTO trmamodelo (id_marca, nombre) VALUES
(@mercedes_id, 'C-Class'),
(@mercedes_id, 'E-Class'),
(@mercedes_id, 'S-Class'),
(@mercedes_id, 'A-Class'),
(@mercedes_id, 'CLA'),
(@mercedes_id, 'CLS'),
(@mercedes_id, 'GLA'),
(@mercedes_id, 'GLC'),
(@mercedes_id, 'GLE'),
(@mercedes_id, 'GLS'),
(@mercedes_id, 'G-Class'),
(@mercedes_id, 'AMG GT'),
(@mercedes_id, 'EQC'),
(@mercedes_id, 'EQS');

-- AUDI
INSERT INTO trmamodelo (id_marca, nombre) VALUES
(@audi_id, 'A3'),
(@audi_id, 'A4'),
(@audi_id, 'A6'),
(@audi_id, 'A8'),
(@audi_id, 'Q3'),
(@audi_id, 'Q5'),
(@audi_id, 'Q7'),
(@audi_id, 'Q8'),
(@audi_id, 'TT'),
(@audi_id, 'R8'),
(@audi_id, 'e-tron'),
(@audi_id, 'e-tron GT');

-- ==============================================
-- 3. CARGAR CLASES DE VEHÍCULOS
-- ==============================================

INSERT INTO trmaclase (nombre) VALUES
('Automóvil'),
('Camioneta'),
('SUV'),
('Pickup'),
('Van'),
('Minivan'),
('Convertible'),
('Coupé'),
('Sedán'),
('Hatchback'),
('Wagon'),
('Crossover'),
('Deportivo'),
('Lujo'),
('Comercial'),
('Bus'),
('Camión'),
('Motocicleta'),
('Cuatrimoto'),
('Bicicleta');

-- ==============================================
-- 4. CARGAR COLORES
-- ==============================================

INSERT INTO trmacolor (nombre) VALUES
('Blanco'),
('Negro'),
('Azul'),
('Rojo'),
('Verde'),
('Gris'),
('Plateado'),
('Dorado'),
('Amarillo'),
('Naranja'),
('Morado'),
('Beige'),
('Marfil'),
('Café'),
('Vino'),
('Azul Marino'),
('Verde Oliva'),
('Gris Oscuro'),
('Gris Claro'),
('Champán');

-- ==============================================
-- 5. CARGAR COMBUSTIBLES
-- ==============================================

INSERT INTO trmacombustible (nombre) VALUES
('Gasolina'),
('Gas'),
('Híbrido (Gasolina - Gas)'),
('Eléctrico'),
('Diesel'),
('Híbrido (Gasolina - Eléctrico)'),
('Híbrido (Diesel - Eléctrico)'),
('Hidrógeno'),
('Etanol'),
('Biodiesel');

-- ==============================================
-- 6. CARGAR TIPOS DE TRACCIÓN
-- ==============================================

INSERT INTO trmatraccion (nombre) VALUES
('Tracción delantera'),
('Tracción trasera'),
('Tracción en las cuatro ruedas'),
('Tracción integral'),
('Tracción total'),
('Tracción híbrida');

-- ==============================================
-- 7. CARGAR TIPOS DE TRANSMISIÓN
-- ==============================================

INSERT INTO trmatransmision (nombre) VALUES
('Manual'),
('Automática'),
('CVT'),
('Semi-automática'),
('Automática de doble embrague'),
('Automática secuencial'),
('Manual secuencial');

-- ==============================================
-- 8. CARGAR TIPOS DE ASIENTOS
-- ==============================================

INSERT INTO trmaasientos (nombre) VALUES
('Tela'),
('Cuero'),
('Semi-cuero'),
('Alcantara'),
('Vinilo'),
('Tela premium'),
('Cuero perforado'),
('Cuero Nappa'),
('Tela deportiva'),
('Cuero deportivo');

-- ==============================================
-- 9. CARGAR UNIDADES DE PESO
-- ==============================================

INSERT INTO trmaunidad_peso (nombre) VALUES
('Kg'),
('Lb'),
('Ton'),
('Tonelada'),
('Gramos'),
('Onzas'),
('Libras');

-- ==============================================
-- 10. CARGAR TIPOS DE MANTENIMIENTO
-- ==============================================

INSERT INTO trmatipo_mantenimiento (nombre) VALUES
('Preventivo'),
('Correctivo'),
('Predictivo'),
('Rutinario'),
('Mayor'),
('Menor'),
('Emergencia'),
('Programado'),
('Inspección'),
('Calibración'),
('Lubricación'),
('Filtros'),
('Frenos'),
('Suspensión'),
('Motor'),
('Transmisión'),
('Sistema eléctrico'),
('Aire acondicionado'),
('Neumáticos'),
('Batería');

-- ==============================================
-- 11. CARGAR ITEMS DE MANTENIMIENTO
-- ==============================================

INSERT INTO trmaitems_mantenimiento (nombre) VALUES
('Cambio de aceite'),
('Filtro de aceite'),
('Filtro de aire'),
('Filtro de combustible'),
('Filtro de habitáculo'),
('Bujías'),
('Correa de distribución'),
('Correa de accesorios'),
('Tensores'),
('Bomba de agua'),
('Termostato'),
('Radiador'),
('Mangueras'),
('Líquido refrigerante'),
('Pastillas de freno'),
('Discos de freno'),
('Líquido de frenos'),
('Amortiguadores'),
('Muelles'),
('Bujes'),
('Rótulas'),
('Terminales'),
('Neumáticos'),
('Batería'),
('Alternador'),
('Motor de arranque'),
('Fusibles'),
('Cables'),
('Luces'),
('Parabrisas');

-- ==============================================
-- 12. CARGAR ITEMS DE VERIFICACIÓN
-- ==============================================

INSERT INTO trmaitems_verificacion (nombre) VALUES
('Luces delanteras'),
('Luces traseras'),
('Luces de freno'),
('Luces de giro'),
('Luces de emergencia'),
('Luces de reversa'),
('Luces de posición'),
('Luces de neblina'),
('Frenos'),
('Suspensión'),
('Dirección'),
('Neumáticos'),
('Batería'),
('Motor'),
('Transmisión'),
('Escape'),
('Espejos'),
('Parabrisas'),
('Cinturones de seguridad'),
('Airbags'),
('Sistema eléctrico'),
('Aire acondicionado'),
('Calefacción'),
('Radio'),
('GPS'),
('Cámara de reversa'),
('Sensores'),
('Alarma'),
('Inmovilizador'),
('Documentación');

-- ==============================================
-- 13. CARGAR TIPOS DE DOCUMENTOS
-- ==============================================

INSERT INTO trmadocumentos (nombre, eliminado) VALUES
('Cédula de Identidad', 0),
('Pasaporte', 0),
('Licencia de Conducir', 0),
('Certificado Médico', 0),
('Certificado de Antecedentes', 0),
('Póliza de Seguro', 0),
('Tarjeta de Circulación', 0),
('Certificado de Propiedad', 0),
('Factura de Compra', 0),
('Certificado de Importación', 0),
('Certificado de Homologación', 0),
('Certificado de Emisiones', 0),
('Certificado de Ruido', 0),
('Certificado de Seguridad', 0),
('Certificado de Calidad', 0),
('Manual de Usuario', 0),
('Manual de Mantenimiento', 0),
('Garantía', 0),
('Contrato de Arrendamiento', 0),
('Contrato de Compraventa', 0);

-- ==============================================
-- 14. CARGAR ASEGURADORAS
-- ==============================================

INSERT INTO trmaaseguradoras (letrarif, nrorif, nrofinalrif, nombre, codfijo1, tlfofic1, direccion, fecha_registro, rif_completo, compatible_aseguradora, eliminado) VALUES
(1, 12345678, 9, 'Seguros Altamira', 212, 1234567, 'Av. Libertador, Caracas', '2024-01-01', 'J-12345678-9', 'Compatible con todos los vehículos', 0),
(1, 87654321, 0, 'Mapfre Seguros', 212, 7654321, 'Centro Financiero, Caracas', '2024-01-01', 'J-87654321-0', 'Especialista en vehículos comerciales', 0),
(1, 11223344, 5, 'Seguros Mercantil', 212, 1122334, 'Torre Mercantil, Caracas', '2024-01-01', 'J-11223344-5', 'Cobertura nacional', 0),
(1, 55667788, 9, 'Seguros La Seguridad', 212, 5566778, 'Plaza Venezuela, Caracas', '2024-01-01', 'J-55667788-9', 'Seguros de vehículos oficiales', 0),
(1, 99887766, 5, 'Seguros Horizonte', 212, 9988776, 'Chacaíto, Caracas', '2024-01-01', 'J-99887766-5', 'Seguros de lujo', 0);

-- ==============================================
-- 15. CARGAR TALLERES
-- ==============================================

INSERT INTO trmatalleres (letrarif, nrorif, nrofinalrif, nombre, codfijo1, tlfofic1, direccion, fecha_registro, rif_completo, compatible_aseguradora, eliminado) VALUES
(1, 11111111, 1, 'Taller Central SICONFLOT', 212, 1111111, 'Av. Principal #123, Caracas', '2024-01-01', 'J-11111111-1', 'Todos los seguros', 0),
(1, 22222222, 2, 'AutoServicio Plus', 212, 2222222, 'Calle Secundaria #456, Caracas', '2024-01-01', 'J-22222222-2', 'Mapfre, Mercantil', 0),
(1, 33333333, 3, 'Mecánica Rápida', 212, 3333333, 'Zona Industrial, Caracas', '2024-01-01', 'J-33333333-3', 'Todos los seguros', 0),
(1, 44444444, 4, 'Taller Especializado', 212, 4444444, 'Centro Comercial, Caracas', '2024-01-01', 'J-44444444-4', 'Seguros de lujo', 0),
(1, 55555555, 5, 'Serviteca Automotriz', 212, 5555555, 'Av. Libertador, Caracas', '2024-01-01', 'J-55555555-5', 'Todos los seguros', 0);

-- ==============================================
-- 16. CARGAR REGISTROS GEOGRÁFICOS
-- ==============================================

INSERT INTO trmageografica (cod_estado, cod_municipio, cod_parroquia, estado, municipio, parroquia) VALUES
(1, 1, 1, 'Distrito Capital', 'Libertador', 'Catedral'),
(1, 1, 2, 'Distrito Capital', 'Libertador', 'San José'),
(1, 1, 3, 'Distrito Capital', 'Libertador', 'Santa Teresa'),
(1, 1, 4, 'Distrito Capital', 'Libertador', 'Candelaria'),
(1, 1, 5, 'Distrito Capital', 'Libertador', 'San Juan'),
(1, 1, 6, 'Distrito Capital', 'Libertador', 'La Pastora'),
(1, 1, 7, 'Distrito Capital', 'Libertador', 'Altagracia'),
(1, 1, 8, 'Distrito Capital', 'Libertador', 'San Pedro'),
(1, 1, 9, 'Distrito Capital', 'Libertador', 'El Recreo'),
(1, 1, 10, 'Distrito Capital', 'Libertador', 'San Bernardino'),
(1, 1, 11, 'Distrito Capital', 'Libertador', 'La Vega'),
(1, 1, 12, 'Distrito Capital', 'Libertador', 'Antímano'),
(1, 1, 13, 'Distrito Capital', 'Libertador', 'Macarao'),
(1, 1, 14, 'Distrito Capital', 'Libertador', 'Caricuao'),
(1, 1, 15, 'Distrito Capital', 'Libertador', 'El Paraíso'),
(1, 1, 16, 'Distrito Capital', 'Libertador', 'El Valle'),
(1, 1, 17, 'Distrito Capital', 'Libertador', 'Coche'),
(1, 1, 18, 'Distrito Capital', 'Libertador', 'Santa Rosalía'),
(1, 1, 19, 'Distrito Capital', 'Libertador', 'El Junquito'),
(1, 1, 20, 'Distrito Capital', 'Libertador', 'Sucre');

-- ==============================================
-- 17. CARGAR INSPECTORES
-- ==============================================

INSERT INTO trmainspeccion (ci_inspector, nombre_inspector, itemsbuenos, itemsregulares, itemsmalos, placa, fecha_inspeccion, id_vehiculo, eliminado) VALUES
(12345678, 'Juan Pérez', 'Luces, frenos, neumáticos', 'Suspensión', 'Ninguno', 'ABC-1234', '2024-01-15', 1, 0),
(87654321, 'María González', 'Motor, transmisión', 'Luces traseras', 'Ninguno', 'XYZ-5678', '2024-01-16', 2, 0),
(11223344, 'Carlos Rodríguez', 'Frenos, suspensión', 'Ninguno', 'Ninguno', 'DEF-9012', '2024-01-17', 3, 0),
(55667788, 'Ana Martínez', 'Sistema eléctrico', 'Neumáticos', 'Ninguno', 'GHI-3456', '2024-01-18', 4, 0),
(99887766, 'Luis Hernández', 'Todos los sistemas', 'Ninguno', 'Ninguno', 'JKL-7890', '2024-01-19', 5, 0);

-- ==============================================
-- 18. CARGAR USUARIOS DEL SISTEMA
-- ==============================================

INSERT INTO trmausuarios (nombre, apellido, cedula, login, clave, perfil, primer_ingreso, status, cuenta, eliminado) VALUES
('Administrador', 'Sistema', 12345678, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 0, 1, 0, 0),
('Supervisor', 'General', 87654321, 'supervisor', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 0, 1, 0, 0),
('Operador', 'Sistema', 11223344, 'operador', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, 0, 1, 0, 0),
('Mecánico', 'Principal', 55667788, 'mecanico', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, 0, 1, 0, 0),
('Chofer', 'Prueba', 99887766, 'chofer', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 5, 0, 1, 0, 0);

-- ==============================================
-- FIN DEL SCRIPT
-- ==============================================

-- Verificar datos cargados
SELECT 'Marcas cargadas:' as info, COUNT(*) as cantidad FROM trmamarca;
SELECT 'Modelos cargados:' as info, COUNT(*) as cantidad FROM trmamodelo;
SELECT 'Colores cargados:' as info, COUNT(*) as cantidad FROM trmacolor;
SELECT 'Combustibles cargados:' as info, COUNT(*) as cantidad FROM trmacombustible;
SELECT 'Clases cargadas:' as info, COUNT(*) as cantidad FROM trmaclase;
SELECT 'Transmisiones cargadas:' as info, COUNT(*) as cantidad FROM trmatransmision;
SELECT 'Asientos cargados:' as info, COUNT(*) as cantidad FROM trmaasientos;
SELECT 'Unidades de peso cargadas:' as info, COUNT(*) as cantidad FROM trmaunidad_peso;
SELECT 'Talleres cargados:' as info, COUNT(*) as cantidad FROM trmatalleres;
SELECT 'Aseguradoras cargadas:' as info, COUNT(*) as cantidad FROM trmaaseguradoras;
SELECT 'Usuarios cargados:' as info, COUNT(*) as cantidad FROM trmausuarios;
