-- Script SQL CORREGIDO para cargar datos maestros en SICONFLOT
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
-- 4. CARGAR TIPOS DE TRANSMISIÓN
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
-- 5. CARGAR TIPOS DE ASIENTOS
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
-- 6. CARGAR UNIDADES DE PESO
-- ==============================================

INSERT INTO trmaunidadpeso (nombre) VALUES
('Kg'),
('Lb'),
('Ton'),
('Tonelada'),
('Gramos'),
('Onzas'),
('Libras');

-- ==============================================
-- 7. CARGAR TIPOS DE MANTENIMIENTO
-- ==============================================

INSERT INTO trmatipomantenimiento (nombre) VALUES
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
-- 8. CARGAR ORGANISMOS
-- ==============================================

INSERT INTO trmaorganismos (nombre) VALUES
('GNB'),
('CICPC'),
('POLICIA MUNICIPAL'),
('FISCALIA'),
('BOMBEROS'),
('PROTECCIÓN CIVIL'),
('GUARDIA NACIONAL'),
('EJÉRCITO'),
('ARMADA'),
('AVIACIÓN'),
('GUARDIA DE HONOR'),
('INTELIGENCIA'),
('SEBIN'),
('DGCIM'),
('PFA'),
('PNB'),
('POLICÍA CIENTÍFICA'),
('POLICÍA DE INVESTIGACIÓN'),
('POLICÍA DE TRÁNSITO'),
('POLICÍA TÉCNICA JUDICIAL');

-- ==============================================
-- 9. CARGAR TALLERES
-- ==============================================

INSERT INTO trmatalleres (nombre, direccion, telefono) VALUES
('Taller Central SICONFLOT', 'Av. Principal #123, Caracas', '0212-1234567'),
('AutoServicio Plus', 'Calle Secundaria #456, Caracas', '0212-7654321'),
('Mecánica Rápida', 'Zona Industrial, Caracas', '0212-9876543'),
('Taller Especializado', 'Centro Comercial, Caracas', '0212-4567890'),
('Serviteca Automotriz', 'Av. Libertador, Caracas', '0212-2345678'),
('Taller de Frenos', 'Calle Comercial, Caracas', '0212-3456789'),
('Mecánica Diesel', 'Zona Portuaria, La Guaira', '0212-4567890'),
('Taller de Transmisiones', 'Av. Fuerzas Armadas, Caracas', '0212-5678901'),
('Servicio Express', 'Centro de la Ciudad, Caracas', '0212-6789012'),
('Taller Integral', 'Zona Residencial, Caracas', '0212-7890123');

-- ==============================================
-- 10. CARGAR ASEGURADORAS
-- ==============================================

INSERT INTO trmaaseguradoras (nombre, rif_completo, direccion) VALUES
('Seguros Altamira', 'J-12345678-9', 'Av. Libertador, Caracas'),
('Mapfre Seguros', 'J-87654321-0', 'Centro Financiero, Caracas'),
('Seguros Mercantil', 'J-11223344-5', 'Torre Mercantil, Caracas'),
('Seguros La Seguridad', 'J-55667788-9', 'Plaza Venezuela, Caracas'),
('Seguros Horizonte', 'J-99887766-5', 'Chacaíto, Caracas'),
('Seguros Venezuela', 'J-44332211-0', 'Centro Comercial, Caracas'),
('Seguros Caracas', 'J-77665544-3', 'Av. Francisco de Miranda, Caracas'),
('Seguros Nacional', 'J-22110099-8', 'Zona Industrial, Caracas'),
('Seguros Internacional', 'J-55443322-1', 'Torre Parque Cristal, Caracas'),
('Seguros del Sur', 'J-88776655-4', 'Valencia, Carabobo');

-- ==============================================
-- 11. CARGAR LICENCIAS
-- ==============================================

INSERT INTO trmalicencia (nombre) VALUES
('Tipo A - Motocicletas'),
('Tipo B - Automóviles'),
('Tipo C - Camiones ligeros'),
('Tipo D - Camiones pesados'),
('Tipo E - Buses'),
('Tipo F - Vehículos especiales'),
('Tipo G - Maquinaria pesada'),
('Tipo H - Vehículos de emergencia'),
('Tipo I - Vehículos militares'),
('Tipo J - Vehículos diplomáticos');

-- ==============================================
-- 12. CARGAR PERFILES DE USUARIO
-- ==============================================

INSERT INTO trmaperfil (nombre) VALUES
('Administrador'),
('Supervisor'),
('Operador'),
('Mecánico'),
('Chofer'),
('Mantenimiento'),
('Seguridad'),
('Contabilidad'),
('Recursos Humanos'),
('Gerencia');

-- ==============================================
-- 13. CARGAR SEXOS
-- ==============================================

INSERT INTO trmasexo (nombre) VALUES
('Masculino'),
('Femenino'),
('No especificado');

-- ==============================================
-- 14. CARGAR DEPARTAMENTOS
-- ==============================================

INSERT INTO trmadepartamentos (nombre) VALUES
('Gerencia General'),
('Recursos Humanos'),
('Contabilidad'),
('Mantenimiento'),
('Operaciones'),
('Seguridad'),
('Administración'),
('Tecnología'),
('Logística'),
('Compras');

-- ==============================================
-- 15. CARGAR ZONAS
-- ==============================================

INSERT INTO trmazona (nombre) VALUES
('Zona Norte'),
('Zona Sur'),
('Zona Este'),
('Zona Oeste'),
('Centro'),
('Zona Industrial'),
('Zona Residencial'),
('Zona Comercial'),
('Zona Portuaria'),
('Zona Aeroportuaria');

-- ==============================================
-- 16. CARGAR ITEMS DE MANTENIMIENTO
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
-- 17. CARGAR ITEMS DE VERIFICACIÓN
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
-- 18. CARGAR TIPOS DE DOCUMENTOS
-- ==============================================

INSERT INTO trmadocumentos (nombre) VALUES
('Cédula de Identidad'),
('Pasaporte'),
('Licencia de Conducir'),
('Certificado Médico'),
('Certificado de Antecedentes'),
('Póliza de Seguro'),
('Tarjeta de Circulación'),
('Certificado de Propiedad'),
('Factura de Compra'),
('Certificado de Importación'),
('Certificado de Homologación'),
('Certificado de Emisiones'),
('Certificado de Ruido'),
('Certificado de Seguridad'),
('Certificado de Calidad'),
('Manual de Usuario'),
('Manual de Mantenimiento'),
('Garantía'),
('Contrato de Arrendamiento'),
('Contrato de Compraventa');

-- ==============================================
-- 19. CARGAR LETRAS DE RIF
-- ==============================================

INSERT INTO trmaletra_rif (nombre) VALUES
('V'),
('E'),
('J'),
('P'),
('G');

-- ==============================================
-- 20. CARGAR CÓDIGOS DE TELÉFONO FIJO
-- ==============================================

INSERT INTO trmacod_tlf_fijo (ciudad, codigo) VALUES
('Caracas', '0212'),
('Maracay', '0243'),
('Valencia', '0241'),
('Barquisimeto', '0251'),
('Maracaibo', '0261'),
('Ciudad Guayana', '0286'),
('Maturín', '0291'),
('Cumana', '0293'),
('San Cristóbal', '0276'),
('Mérida', '0274'),
('Trujillo', '0272'),
('Coro', '0268'),
('Puerto La Cruz', '0281'),
('Barcelona', '0281'),
('Lechería', '0281'),
('Porlamar', '0295'),
('Punto Fijo', '0269'),
('Cabimas', '0264'),
('Ciudad Ojeda', '0265'),
('El Tigre', '0283');

-- ==============================================
-- 21. CARGAR REGISTROS GEOGRÁFICOS
-- ==============================================

INSERT INTO trmageografica (nombre_parroquia, nombre_municipio, nombre_estado) VALUES
('Catedral', 'Libertador', 'Distrito Capital'),
('San José', 'Libertador', 'Distrito Capital'),
('Santa Teresa', 'Libertador', 'Distrito Capital'),
('Candelaria', 'Libertador', 'Distrito Capital'),
('San Juan', 'Libertador', 'Distrito Capital'),
('La Pastora', 'Libertador', 'Distrito Capital'),
('Altagracia', 'Libertador', 'Distrito Capital'),
('San Pedro', 'Libertador', 'Distrito Capital'),
('El Recreo', 'Libertador', 'Distrito Capital'),
('San Bernardino', 'Libertador', 'Distrito Capital'),
('La Vega', 'Libertador', 'Distrito Capital'),
('Antímano', 'Libertador', 'Distrito Capital'),
('Macarao', 'Libertador', 'Distrito Capital'),
('Caricuao', 'Libertador', 'Distrito Capital'),
('El Paraíso', 'Libertador', 'Distrito Capital'),
('El Valle', 'Libertador', 'Distrito Capital'),
('Coche', 'Libertador', 'Distrito Capital'),
('Santa Rosalía', 'Libertador', 'Distrito Capital'),
('El Junquito', 'Libertador', 'Distrito Capital'),
('Sucre', 'Libertador', 'Distrito Capital');

-- ==============================================
-- 22. CARGAR INSPECTORES
-- ==============================================

INSERT INTO trmainspeccion (nombre_inspector, cedula, telefono, especialidad) VALUES
('Juan Pérez', '12345678', '0412-1234567', 'Mecánica General'),
('María González', '87654321', '0414-7654321', 'Sistema Eléctrico'),
('Carlos Rodríguez', '11223344', '0416-7890123', 'Frenos y Suspensión'),
('Ana Martínez', '55667788', '0424-3456789', 'Motor y Transmisión'),
('Luis Hernández', '99887766', '0426-5678901', 'Sistema de Frenos'),
('Carmen López', '44332211', '0412-2345678', 'Sistema Eléctrico'),
('Roberto Silva', '77665544', '0414-4567890', 'Mecánica General'),
('Isabel Torres', '22110099', '0416-6789012', 'Frenos y Suspensión'),
('Miguel Vargas', '55443322', '0424-8901234', 'Motor y Transmisión'),
('Patricia Ruiz', '88776655', '0426-0123456', 'Sistema de Frenos');

-- ==============================================
-- 23. CARGAR IMÁGENES DE CHOFERES (PLACEHOLDER)
-- ==============================================

INSERT INTO trmaimgchofer (nombre_archivo, ruta, chofer_id) VALUES
('chofer_default.jpg', '/uploads/choferes/', 0);

-- ==============================================
-- 24. CARGAR IMÁGENES DE VEHÍCULOS (PLACEHOLDER)
-- ==============================================

INSERT INTO trmaimgvehiculo (nombre_archivo, ruta, vehiculo_id) VALUES
('vehiculo_default.jpg', '/uploads/vehiculos/', 0);

-- ==============================================
-- 25. CARGAR USUARIOS DEL SISTEMA
-- ==============================================

INSERT INTO trmausuarios (login, password, nombre, apellido, perfil_id, activo) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'Sistema', 1, 1),
('supervisor', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Supervisor', 'General', 2, 1),
('operador', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Operador', 'Sistema', 3, 1),
('mecanico', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mecánico', 'Principal', 4, 1),
('chofer', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Chofer', 'Prueba', 5, 1);

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
SELECT 'Unidades de peso cargadas:' as info, COUNT(*) as cantidad FROM trmaunidadpeso;
SELECT 'Talleres cargados:' as info, COUNT(*) as cantidad FROM trmatalleres;
SELECT 'Aseguradoras cargadas:' as info, COUNT(*) as cantidad FROM trmaaseguradoras;
SELECT 'Usuarios cargados:' as info, COUNT(*) as cantidad FROM trmausuarios;
