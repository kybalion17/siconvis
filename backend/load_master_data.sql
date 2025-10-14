-- Script SQL para cargar datos maestros en SICONFLOT
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
INSERT INTO trmamodelo (marca_id, modelo, eliminado) VALUES
(@ford_id, 'F-150', 0),
(@ford_id, 'F-250', 0),
(@ford_id, 'F-350', 0),
(@ford_id, 'Ranger', 0),
(@ford_id, 'Explorer', 0),
(@ford_id, 'Expedition', 0),
(@ford_id, 'Escape', 0),
(@ford_id, 'Edge', 0),
(@ford_id, 'Bronco', 0),
(@ford_id, 'Bronco Sport', 0),
(@ford_id, 'Mustang', 0),
(@ford_id, 'Mustang Mach-E', 0),
(@ford_id, 'Focus', 0),
(@ford_id, 'Fiesta', 0),
(@ford_id, 'Transit', 0),
(@ford_id, 'Transit Connect', 0),
(@ford_id, 'EcoSport', 0),
(@ford_id, 'Flex', 0);

-- CHEVROLET
INSERT INTO trmamodelo (marca_id, modelo, eliminado) VALUES
(@chevrolet_id, 'Silverado', 0),
(@chevrolet_id, 'Silverado HD', 0),
(@chevrolet_id, 'Colorado', 0),
(@chevrolet_id, 'Tahoe', 0),
(@chevrolet_id, 'Suburban', 0),
(@chevrolet_id, 'Equinox', 0),
(@chevrolet_id, 'Traverse', 0),
(@chevrolet_id, 'Blazer', 0),
(@chevrolet_id, 'Trailblazer', 0),
(@chevrolet_id, 'Malibu', 0),
(@chevrolet_id, 'Impala', 0),
(@chevrolet_id, 'Camaro', 0),
(@chevrolet_id, 'Corvette', 0),
(@chevrolet_id, 'Cruze', 0),
(@chevrolet_id, 'Sonic', 0),
(@chevrolet_id, 'Spark', 0),
(@chevrolet_id, 'Bolt EV', 0),
(@chevrolet_id, 'Express', 0);

-- NISSAN
INSERT INTO trmamodelo (marca_id, modelo, eliminado) VALUES
(@nissan_id, 'Altima', 0),
(@nissan_id, 'Sentra', 0),
(@nissan_id, 'Versa', 0),
(@nissan_id, 'Maxima', 0),
(@nissan_id, 'Rogue', 0),
(@nissan_id, 'Murano', 0),
(@nissan_id, 'Pathfinder', 0),
(@nissan_id, 'Armada', 0),
(@nissan_id, 'Frontier', 0),
(@nissan_id, 'Titan', 0),
(@nissan_id, 'Kicks', 0),
(@nissan_id, '370Z', 0),
(@nissan_id, 'GT-R', 0),
(@nissan_id, 'Leaf', 0),
(@nissan_id, 'Ariya', 0),
(@nissan_id, 'NV200', 0),
(@nissan_id, 'NV Passenger', 0),
(@nissan_id, 'NV Cargo', 0);

-- HONDA
INSERT INTO trmamodelo (marca_id, modelo, eliminado) VALUES
(@honda_id, 'Civic', 0),
(@honda_id, 'Accord', 0),
(@honda_id, 'Insight', 0),
(@honda_id, 'CR-V', 0),
(@honda_id, 'Pilot', 0),
(@honda_id, 'Passport', 0),
(@honda_id, 'Ridgeline', 0),
(@honda_id, 'HR-V', 0),
(@honda_id, 'Fit', 0),
(@honda_id, 'Odyssey', 0),
(@honda_id, 'Element', 0),
(@honda_id, 'S2000', 0),
(@honda_id, 'NSX', 0),
(@honda_id, 'Type R', 0),
(@honda_id, 'Clarity', 0),
(@honda_id, 'e', 0);

-- HYUNDAI
INSERT INTO trmamodelo (marca_id, modelo, eliminado) VALUES
(@hyundai_id, 'Elantra', 0),
(@hyundai_id, 'Sonata', 0),
(@hyundai_id, 'Accent', 0),
(@hyundai_id, 'Tucson', 0),
(@hyundai_id, 'Santa Fe', 0),
(@hyundai_id, 'Palisade', 0),
(@hyundai_id, 'Kona', 0),
(@hyundai_id, 'Venue', 0),
(@hyundai_id, 'Ioniq', 0),
(@hyundai_id, 'Ioniq 5', 0),
(@hyundai_id, 'Ioniq 6', 0),
(@hyundai_id, 'Genesis', 0),
(@hyundai_id, 'Veloster', 0),
(@hyundai_id, 'Nexo', 0);

-- KIA
INSERT INTO trmamodelo (marca_id, modelo, eliminado) VALUES
(@kia_id, 'Forte', 0),
(@kia_id, 'Optima', 0),
(@kia_id, 'K5', 0),
(@kia_id, 'Sorento', 0),
(@kia_id, 'Sportage', 0),
(@kia_id, 'Telluride', 0),
(@kia_id, 'Soul', 0),
(@kia_id, 'Niro', 0),
(@kia_id, 'Stinger', 0),
(@kia_id, 'Carnival', 0),
(@kia_id, 'EV6', 0),
(@kia_id, 'Seltos', 0);

-- MAZDA
INSERT INTO trmamodelo (marca_id, modelo, eliminado) VALUES
(@mazda_id, 'Mazda3', 0),
(@mazda_id, 'Mazda6', 0),
(@mazda_id, 'CX-3', 0),
(@mazda_id, 'CX-5', 0),
(@mazda_id, 'CX-9', 0),
(@mazda_id, 'CX-30', 0),
(@mazda_id, 'MX-5 Miata', 0),
(@mazda_id, 'MX-30', 0),
(@mazda_id, 'Tribute', 0),
(@mazda_id, 'MPV', 0);

-- VOLKSWAGEN
INSERT INTO trmamodelo (marca_id, modelo, eliminado) VALUES
(@volkswagen_id, 'Jetta', 0),
(@volkswagen_id, 'Passat', 0),
(@volkswagen_id, 'Golf', 0),
(@volkswagen_id, 'Beetle', 0),
(@volkswagen_id, 'Tiguan', 0),
(@volkswagen_id, 'Atlas', 0),
(@volkswagen_id, 'Arteon', 0),
(@volkswagen_id, 'ID.4', 0),
(@volkswagen_id, 'CC', 0),
(@volkswagen_id, 'Touareg', 0);

-- BMW
INSERT INTO trmamodelo (marca_id, modelo, eliminado) VALUES
(@bmw_id, '3 Series', 0),
(@bmw_id, '5 Series', 0),
(@bmw_id, '7 Series', 0),
(@bmw_id, 'X1', 0),
(@bmw_id, 'X3', 0),
(@bmw_id, 'X5', 0),
(@bmw_id, 'X7', 0),
(@bmw_id, 'Z4', 0),
(@bmw_id, 'i3', 0),
(@bmw_id, 'i8', 0),
(@bmw_id, 'iX', 0),
(@bmw_id, 'i4', 0);

-- MERCEDES-BENZ
INSERT INTO trmamodelo (marca_id, modelo, eliminado) VALUES
(@mercedes_id, 'C-Class', 0),
(@mercedes_id, 'E-Class', 0),
(@mercedes_id, 'S-Class', 0),
(@mercedes_id, 'A-Class', 0),
(@mercedes_id, 'CLA', 0),
(@mercedes_id, 'CLS', 0),
(@mercedes_id, 'GLA', 0),
(@mercedes_id, 'GLC', 0),
(@mercedes_id, 'GLE', 0),
(@mercedes_id, 'GLS', 0),
(@mercedes_id, 'G-Class', 0),
(@mercedes_id, 'AMG GT', 0),
(@mercedes_id, 'EQC', 0),
(@mercedes_id, 'EQS', 0);

-- AUDI
INSERT INTO trmamodelo (marca_id, modelo, eliminado) VALUES
(@audi_id, 'A3', 0),
(@audi_id, 'A4', 0),
(@audi_id, 'A6', 0),
(@audi_id, 'A8', 0),
(@audi_id, 'Q3', 0),
(@audi_id, 'Q5', 0),
(@audi_id, 'Q7', 0),
(@audi_id, 'Q8', 0),
(@audi_id, 'TT', 0),
(@audi_id, 'R8', 0),
(@audi_id, 'e-tron', 0),
(@audi_id, 'e-tron GT', 0);

-- ==============================================
-- 3. CARGAR CLASES DE VEHÍCULOS
-- ==============================================

INSERT INTO trmaclase (nombre, eliminado) VALUES
('Automóvil', 0),
('Camioneta', 0),
('SUV', 0),
('Pickup', 0),
('Van', 0),
('Minivan', 0),
('Convertible', 0),
('Coupé', 0),
('Sedán', 0),
('Hatchback', 0),
('Wagon', 0),
('Crossover', 0),
('Deportivo', 0),
('Lujo', 0),
('Comercial', 0),
('Bus', 0),
('Camión', 0),
('Motocicleta', 0),
('Cuatrimoto', 0),
('Bicicleta', 0);

-- ==============================================
-- 4. CARGAR TIPOS DE TRANSMISIÓN
-- ==============================================

INSERT INTO trmatransmision (nombre, eliminado) VALUES
('Manual', 0),
('Automática', 0),
('CVT', 0),
('Semi-automática', 0),
('Automática de doble embrague', 0),
('Automática secuencial', 0),
('Manual secuencial', 0);

-- ==============================================
-- 5. CARGAR TIPOS DE ASIENTOS
-- ==============================================

INSERT INTO trmaasientos (nombre, eliminado) VALUES
('Tela', 0),
('Cuero', 0),
('Semi-cuero', 0),
('Alcantara', 0),
('Vinilo', 0),
('Tela premium', 0),
('Cuero perforado', 0),
('Cuero Nappa', 0),
('Tela deportiva', 0),
('Cuero deportivo', 0);

-- ==============================================
-- 6. CARGAR UNIDADES DE PESO
-- ==============================================

INSERT INTO trmaunidadpeso (nombre, eliminado) VALUES
('Kg', 0),
('Lb', 0),
('Ton', 0),
('Tonelada', 0),
('Gramos', 0),
('Onzas', 0),
('Libras', 0);

-- ==============================================
-- 7. CARGAR TIPOS DE MANTENIMIENTO
-- ==============================================

INSERT INTO trmatipomantenimiento (nombre, eliminado) VALUES
('Preventivo', 0),
('Correctivo', 0),
('Predictivo', 0),
('Rutinario', 0),
('Mayor', 0),
('Menor', 0),
('Emergencia', 0),
('Programado', 0),
('Inspección', 0),
('Calibración', 0),
('Lubricación', 0),
('Filtros', 0),
('Frenos', 0),
('Suspensión', 0),
('Motor', 0),
('Transmisión', 0),
('Sistema eléctrico', 0),
('Aire acondicionado', 0),
('Neumáticos', 0),
('Batería', 0);

-- ==============================================
-- 8. CARGAR ORGANISMOS
-- ==============================================

INSERT INTO trmaorganismos (nombre, eliminado) VALUES
('GNB', 0),
('CICPC', 0),
('POLICIA MUNICIPAL', 0),
('FISCALIA', 0),
('BOMBEROS', 0),
('PROTECCIÓN CIVIL', 0),
('GUARDIA NACIONAL', 0),
('EJÉRCITO', 0),
('ARMADA', 0),
('AVIACIÓN', 0),
('GUARDIA DE HONOR', 0),
('INTELIGENCIA', 0),
('SEBIN', 0),
('DGCIM', 0),
('PFA', 0),
('PNB', 0),
('POLICÍA CIENTÍFICA', 0),
('POLICÍA DE INVESTIGACIÓN', 0),
('POLICÍA DE TRÁNSITO', 0),
('POLICÍA TÉCNICA JUDICIAL', 0);

-- ==============================================
-- 9. CARGAR TALLERES
-- ==============================================

INSERT INTO trmatalleres (nombre, direccion, telefono, eliminado) VALUES
('Taller Central SICONFLOT', 'Av. Principal #123, Caracas', '0212-1234567', 0),
('AutoServicio Plus', 'Calle Secundaria #456, Caracas', '0212-7654321', 0),
('Mecánica Rápida', 'Zona Industrial, Caracas', '0212-9876543', 0),
('Taller Especializado', 'Centro Comercial, Caracas', '0212-4567890', 0),
('Serviteca Automotriz', 'Av. Libertador, Caracas', '0212-2345678', 0),
('Taller de Frenos', 'Calle Comercial, Caracas', '0212-3456789', 0),
('Mecánica Diesel', 'Zona Portuaria, La Guaira', '0212-4567890', 0),
('Taller de Transmisiones', 'Av. Fuerzas Armadas, Caracas', '0212-5678901', 0),
('Servicio Express', 'Centro de la Ciudad, Caracas', '0212-6789012', 0),
('Taller Integral', 'Zona Residencial, Caracas', '0212-7890123', 0);

-- ==============================================
-- 10. CARGAR ASEGURADORAS
-- ==============================================

INSERT INTO trmaaseguradoras (nombre, rif_completo, direccion, eliminado) VALUES
('Seguros Altamira', 'J-12345678-9', 'Av. Libertador, Caracas', 0),
('Mapfre Seguros', 'J-87654321-0', 'Centro Financiero, Caracas', 0),
('Seguros Mercantil', 'J-11223344-5', 'Torre Mercantil, Caracas', 0),
('Seguros La Seguridad', 'J-55667788-9', 'Plaza Venezuela, Caracas', 0),
('Seguros Horizonte', 'J-99887766-5', 'Chacaíto, Caracas', 0),
('Seguros Venezuela', 'J-44332211-0', 'Centro Comercial, Caracas', 0),
('Seguros Caracas', 'J-77665544-3', 'Av. Francisco de Miranda, Caracas', 0),
('Seguros Nacional', 'J-22110099-8', 'Zona Industrial, Caracas', 0),
('Seguros Internacional', 'J-55443322-1', 'Torre Parque Cristal, Caracas', 0),
('Seguros del Sur', 'J-88776655-4', 'Valencia, Carabobo', 0);

-- ==============================================
-- 11. CARGAR LICENCIAS
-- ==============================================

INSERT INTO trmalicencia (nombre, eliminado) VALUES
('Tipo A - Motocicletas', 0),
('Tipo B - Automóviles', 0),
('Tipo C - Camiones ligeros', 0),
('Tipo D - Camiones pesados', 0),
('Tipo E - Buses', 0),
('Tipo F - Vehículos especiales', 0),
('Tipo G - Maquinaria pesada', 0),
('Tipo H - Vehículos de emergencia', 0),
('Tipo I - Vehículos militares', 0),
('Tipo J - Vehículos diplomáticos', 0);

-- ==============================================
-- 12. CARGAR PERFILES DE USUARIO
-- ==============================================

INSERT INTO trmaperfil (nombre, eliminado) VALUES
('Administrador', 0),
('Supervisor', 0),
('Operador', 0),
('Mecánico', 0),
('Chofer', 0),
('Mantenimiento', 0),
('Seguridad', 0),
('Contabilidad', 0),
('Recursos Humanos', 0),
('Gerencia', 0);

-- ==============================================
-- 13. CARGAR SEXOS
-- ==============================================

INSERT INTO trmasexo (nombre, eliminado) VALUES
('Masculino', 0),
('Femenino', 0),
('No especificado', 0);

-- ==============================================
-- 14. CARGAR DEPARTAMENTOS
-- ==============================================

INSERT INTO trmadepartamentos (nombre, eliminado) VALUES
('Gerencia General', 0),
('Recursos Humanos', 0),
('Contabilidad', 0),
('Mantenimiento', 0),
('Operaciones', 0),
('Seguridad', 0),
('Administración', 0),
('Tecnología', 0),
('Logística', 0),
('Compras', 0);

-- ==============================================
-- 15. CARGAR ZONAS
-- ==============================================

INSERT INTO trmazona (nombre, eliminado) VALUES
('Zona Norte', 0),
('Zona Sur', 0),
('Zona Este', 0),
('Zona Oeste', 0),
('Centro', 0),
('Zona Industrial', 0),
('Zona Residencial', 0),
('Zona Comercial', 0),
('Zona Portuaria', 0),
('Zona Aeroportuaria', 0);

-- ==============================================
-- 16. CARGAR ITEMS DE MANTENIMIENTO
-- ==============================================

INSERT INTO trmaitems_mantenimiento (nombre, eliminado) VALUES
('Cambio de aceite', 0),
('Filtro de aceite', 0),
('Filtro de aire', 0),
('Filtro de combustible', 0),
('Filtro de habitáculo', 0),
('Bujías', 0),
('Correa de distribución', 0),
('Correa de accesorios', 0),
('Tensores', 0),
('Bomba de agua', 0),
('Termostato', 0),
('Radiador', 0),
('Mangueras', 0),
('Líquido refrigerante', 0),
('Pastillas de freno', 0),
('Discos de freno', 0),
('Líquido de frenos', 0),
('Amortiguadores', 0),
('Muelles', 0),
('Bujes', 0),
('Rótulas', 0),
('Terminales', 0),
('Neumáticos', 0),
('Batería', 0),
('Alternador', 0),
('Motor de arranque', 0),
('Fusibles', 0),
('Cables', 0),
('Luces', 0),
('Parabrisas', 0);

-- ==============================================
-- 17. CARGAR ITEMS DE VERIFICACIÓN
-- ==============================================

INSERT INTO trmaitems_verificacion (nombre, eliminado) VALUES
('Luces delanteras', 0),
('Luces traseras', 0),
('Luces de freno', 0),
('Luces de giro', 0),
('Luces de emergencia', 0),
('Luces de reversa', 0),
('Luces de posición', 0),
('Luces de neblina', 0),
('Frenos', 0),
('Suspensión', 0),
('Dirección', 0),
('Neumáticos', 0),
('Batería', 0),
('Motor', 0),
('Transmisión', 0),
('Escape', 0),
('Espejos', 0),
('Parabrisas', 0),
('Cinturones de seguridad', 0),
('Airbags', 0),
('Sistema eléctrico', 0),
('Aire acondicionado', 0),
('Calefacción', 0),
('Radio', 0),
('GPS', 0),
('Cámara de reversa', 0),
('Sensores', 0),
('Alarma', 0),
('Inmovilizador', 0),
('Documentación', 0);

-- ==============================================
-- 18. CARGAR TIPOS DE DOCUMENTOS
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
-- 19. CARGAR LETRAS DE RIF
-- ==============================================

INSERT INTO trmaletra_rif (nombre, eliminado) VALUES
('V', 0),
('E', 0),
('J', 0),
('P', 0),
('G', 0);

-- ==============================================
-- 20. CARGAR CÓDIGOS DE TELÉFONO FIJO
-- ==============================================

INSERT INTO trmacod_tlf_fijo (ciudad, codigo, eliminado) VALUES
('Caracas', '0212', 0),
('Maracay', '0243', 0),
('Valencia', '0241', 0),
('Barquisimeto', '0251', 0),
('Maracaibo', '0261', 0),
('Ciudad Guayana', '0286', 0),
('Maturín', '0291', 0),
('Cumana', '0293', 0),
('San Cristóbal', '0276', 0),
('Mérida', '0274', 0),
('Trujillo', '0272', 0),
('Coro', '0268', 0),
('Puerto La Cruz', '0281', 0),
('Barcelona', '0281', 0),
('Lechería', '0281', 0),
('Porlamar', '0295', 0),
('Punto Fijo', '0269', 0),
('Cabimas', '0264', 0),
('Ciudad Ojeda', '0265', 0),
('El Tigre', '0283', 0);

-- ==============================================
-- 21. CARGAR REGISTROS GEOGRÁFICOS
-- ==============================================

INSERT INTO trmageografica (nombre_parroquia, nombre_municipio, nombre_estado, eliminado) VALUES
('Catedral', 'Libertador', 'Distrito Capital', 0),
('San José', 'Libertador', 'Distrito Capital', 0),
('Santa Teresa', 'Libertador', 'Distrito Capital', 0),
('Candelaria', 'Libertador', 'Distrito Capital', 0),
('San Juan', 'Libertador', 'Distrito Capital', 0),
('La Pastora', 'Libertador', 'Distrito Capital', 0),
('Altagracia', 'Libertador', 'Distrito Capital', 0),
('San Pedro', 'Libertador', 'Distrito Capital', 0),
('El Recreo', 'Libertador', 'Distrito Capital', 0),
('San Bernardino', 'Libertador', 'Distrito Capital', 0),
('La Vega', 'Libertador', 'Distrito Capital', 0),
('Antímano', 'Libertador', 'Distrito Capital', 0),
('Macarao', 'Libertador', 'Distrito Capital', 0),
('Caricuao', 'Libertador', 'Distrito Capital', 0),
('El Paraíso', 'Libertador', 'Distrito Capital', 0),
('El Valle', 'Libertador', 'Distrito Capital', 0),
('Coche', 'Libertador', 'Distrito Capital', 0),
('Santa Rosalía', 'Libertador', 'Distrito Capital', 0),
('El Junquito', 'Libertador', 'Distrito Capital', 0),
('Sucre', 'Libertador', 'Distrito Capital', 0);

-- ==============================================
-- 22. CARGAR INSPECTORES
-- ==============================================

INSERT INTO trmainspeccion (nombre_inspector, cedula, telefono, especialidad, eliminado) VALUES
('Juan Pérez', '12345678', '0412-1234567', 'Mecánica General', 0),
('María González', '87654321', '0414-7654321', 'Sistema Eléctrico', 0),
('Carlos Rodríguez', '11223344', '0416-7890123', 'Frenos y Suspensión', 0),
('Ana Martínez', '55667788', '0424-3456789', 'Motor y Transmisión', 0),
('Luis Hernández', '99887766', '0426-5678901', 'Sistema de Frenos', 0),
('Carmen López', '44332211', '0412-2345678', 'Sistema Eléctrico', 0),
('Roberto Silva', '77665544', '0414-4567890', 'Mecánica General', 0),
('Isabel Torres', '22110099', '0416-6789012', 'Frenos y Suspensión', 0),
('Miguel Vargas', '55443322', '0424-8901234', 'Motor y Transmisión', 0),
('Patricia Ruiz', '88776655', '0426-0123456', 'Sistema de Frenos', 0);

-- ==============================================
-- 23. CARGAR IMÁGENES DE CHOFERES (PLACEHOLDER)
-- ==============================================

INSERT INTO trmaimgchofer (nombre_archivo, ruta, chofer_id, eliminado) VALUES
('chofer_default.jpg', '/uploads/choferes/', 0, 0);

-- ==============================================
-- 24. CARGAR IMÁGENES DE VEHÍCULOS (PLACEHOLDER)
-- ==============================================

INSERT INTO trmaimgvehiculo (nombre_archivo, ruta, vehiculo_id, eliminado) VALUES
('vehiculo_default.jpg', '/uploads/vehiculos/', 0, 0);

-- ==============================================
-- 25. CARGAR USUARIOS DEL SISTEMA
-- ==============================================

INSERT INTO trmausuarios (login, password, nombre, apellido, perfil_id, activo, eliminado) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'Sistema', 1, 1, 0),
('supervisor', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Supervisor', 'General', 2, 1, 0),
('operador', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Operador', 'Sistema', 3, 1, 0),
('mecanico', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mecánico', 'Principal', 4, 1, 0),
('chofer', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Chofer', 'Prueba', 5, 1, 0);

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
