-- ==============================================
-- SICONFLOT - Sistema de Gestión de Flota Vehicular
-- Base de datos basada en el esquema original SAGAUT
-- ==============================================

-- Configuración inicial
SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

-- ==============================================
-- TABLA DE USUARIOS
-- ==============================================

CREATE TABLE IF NOT EXISTS trmausuarios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    cedula DECIMAL(10,0) NOT NULL,
    login VARCHAR(255) NOT NULL,
    clave VARCHAR(255) NOT NULL,
    perfil DECIMAL(10,0) NOT NULL,
    primer_ingreso DECIMAL(10,0) NOT NULL DEFAULT 0,
    status DECIMAL(10,0) NOT NULL DEFAULT 0,
    cuenta INT UNSIGNED DEFAULT 0,
    eliminado INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_cedula (cedula),
    UNIQUE KEY unique_login (login),
    INDEX idx_perfil (perfil),
    INDEX idx_status (status),
    INDEX idx_eliminado (eliminado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE CLASES DE VEHÍCULOS
-- ==============================================

CREATE TABLE IF NOT EXISTS trmaclase (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE MARCAS DE VEHÍCULOS
-- ==============================================

CREATE TABLE IF NOT EXISTS trmamarca (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE MODELOS DE VEHÍCULOS
-- ==============================================

CREATE TABLE IF NOT EXISTS trmamodelo (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_marca INT UNSIGNED NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_marca (id_marca),
    FOREIGN KEY (id_marca) REFERENCES trmamarca(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE COLORES
-- ==============================================

CREATE TABLE IF NOT EXISTS trmacolor (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE TIPOS DE COMBUSTIBLE
-- ==============================================

CREATE TABLE IF NOT EXISTS trmacombustible (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE TIPOS DE TRACCIÓN
-- ==============================================

CREATE TABLE IF NOT EXISTS trmatraccion (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE TIPOS DE TRANSMISIÓN
-- ==============================================

CREATE TABLE IF NOT EXISTS trmatransmision (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE TIPOS DE ASIENTOS
-- ==============================================

CREATE TABLE IF NOT EXISTS trmaasientos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE UNIDADES DE PESO
-- ==============================================

CREATE TABLE IF NOT EXISTS trmaunidad_peso (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE VEHÍCULOS
-- ==============================================

CREATE TABLE IF NOT EXISTS trmavehiculos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    clase INT UNSIGNED NOT NULL,
    marca INT UNSIGNED NOT NULL,
    modelo INT UNSIGNED NOT NULL,
    anio INT UNSIGNED NOT NULL,
    colorp INT UNSIGNED NOT NULL,
    colors INT UNSIGNED NOT NULL,
    transmision INT UNSIGNED NOT NULL,
    placa VARCHAR(45) NOT NULL,
    scarroceria VARCHAR(100) NOT NULL,
    smotor VARCHAR(100) NOT NULL,
    km INT UNSIGNED NOT NULL DEFAULT 0,
    peso INT UNSIGNED NOT NULL,
    unidadpeso INT UNSIGNED NOT NULL,
    asientos INT UNSIGNED NOT NULL,
    combustible INT UNSIGNED NOT NULL,
    npuestos INT UNSIGNED NOT NULL,
    observacion TEXT,
    estado ENUM('ACTIVO', 'INACTIVO', 'MANTENIMIENTO', 'SINIESTRADO') DEFAULT 'ACTIVO',
    fecha_registro DATE NOT NULL,
    eliminado INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_placa (placa),
    INDEX idx_clase (clase),
    INDEX idx_marca (marca),
    INDEX idx_modelo (modelo),
    INDEX idx_anio (anio),
    INDEX idx_eliminado (eliminado),
    FOREIGN KEY (clase) REFERENCES trmaclase(id),
    FOREIGN KEY (marca) REFERENCES trmamarca(id),
    FOREIGN KEY (modelo) REFERENCES trmamodelo(id),
    FOREIGN KEY (colorp) REFERENCES trmacolor(id),
    FOREIGN KEY (colors) REFERENCES trmacolor(id),
    FOREIGN KEY (transmision) REFERENCES trmatransmision(id),
    FOREIGN KEY (asientos) REFERENCES trmaasientos(id),
    FOREIGN KEY (combustible) REFERENCES trmacombustible(id),
    FOREIGN KEY (unidadpeso) REFERENCES trmaunidad_peso(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE CHOFERES
-- ==============================================

CREATE TABLE IF NOT EXISTS trmachoferes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cedula INT UNSIGNED NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    sexo INT UNSIGNED NOT NULL,
    movil INT UNSIGNED NOT NULL,
    direccion TEXT NOT NULL,
    fecha_registro DATE NOT NULL,
    licencia INT UNSIGNED NOT NULL,
    fecha_lic_exp DATE NOT NULL,
    fecha_lic_ven DATE NOT NULL,
    certificado VARCHAR(45) NOT NULL,
    fecha_cer_exp DATE NOT NULL,
    fecha_cer_ven DATE NOT NULL,
    eliminado INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_cedula (cedula),
    INDEX idx_eliminado (eliminado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE DIRECCIONES/DEPARTAMENTOS
-- ==============================================

CREATE TABLE IF NOT EXISTS trmadirecciones (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre TEXT NOT NULL,
    codfijo1 INT UNSIGNED NOT NULL,
    tlfofic1 INT UNSIGNED NOT NULL,
    codfijo2 INT UNSIGNED NOT NULL,
    tlfofic2 INT UNSIGNED NOT NULL,
    direccion TEXT NOT NULL,
    fecha_registro DATE NOT NULL,
    eliminado INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_eliminado (eliminado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA GEOGRÁFICA
-- ==============================================

CREATE TABLE IF NOT EXISTS trmageografica (
    cod_estado DOUBLE DEFAULT NULL,
    cod_municipio DOUBLE DEFAULT NULL,
    cod_parroquia DOUBLE DEFAULT NULL,
    estado VARCHAR(45) DEFAULT NULL,
    municipio VARCHAR(45) DEFAULT NULL,
    parroquia VARCHAR(45) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_estado (cod_estado),
    INDEX idx_municipio (cod_municipio),
    INDEX idx_parroquia (cod_parroquia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE TIPOS DE DOCUMENTOS
-- ==============================================

CREATE TABLE IF NOT EXISTS trmadocumentos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    eliminado INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_eliminado (eliminado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE ASEGURADORAS
-- ==============================================

CREATE TABLE IF NOT EXISTS trmaaseguradoras (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    letrarif INT UNSIGNED NOT NULL,
    nrorif INT UNSIGNED NOT NULL,
    nrofinalrif INT UNSIGNED NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    codfijo1 INT UNSIGNED NOT NULL,
    tlfofic1 INT UNSIGNED NOT NULL,
    direccion TEXT NOT NULL,
    fecha_registro DATE NOT NULL,
    rif_completo VARCHAR(100) NOT NULL,
    compatible_aseguradora TEXT,
    eliminado INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_eliminado (eliminado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE TALLERES
-- ==============================================

CREATE TABLE IF NOT EXISTS trmatalleres (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    letrarif INT UNSIGNED NOT NULL,
    nrorif INT UNSIGNED NOT NULL,
    nrofinalrif INT UNSIGNED NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    codfijo1 INT UNSIGNED NOT NULL,
    tlfofic1 INT UNSIGNED NOT NULL,
    direccion TEXT NOT NULL,
    fecha_registro DATE NOT NULL,
    rif_completo VARCHAR(100) NOT NULL,
    compatible_aseguradora TEXT,
    eliminado INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_eliminado (eliminado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE TIPOS DE MANTENIMIENTO
-- ==============================================

CREATE TABLE IF NOT EXISTS trmatipo_mantenimiento (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE ITEMS DE MANTENIMIENTO
-- ==============================================

CREATE TABLE IF NOT EXISTS trmaitems_mantenimiento (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(75) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE ITEMS DE VERIFICACIÓN
-- ==============================================

CREATE TABLE IF NOT EXISTS trmaitems_verificacion (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(75) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE ASIGNACIONES
-- ==============================================

CREATE TABLE IF NOT EXISTS trdetasignar (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(45) NOT NULL,
    fecha_asignacion DATE NOT NULL,
    fecha_devolucion DATE,
    nro_inspeccion INT UNSIGNED NOT NULL,
    direccion INT UNSIGNED NOT NULL,
    unidad INT UNSIGNED NOT NULL,
    solicitante VARCHAR(100) NOT NULL,
    ced_sol INT UNSIGNED NOT NULL,
    movil INT UNSIGNED NOT NULL,
    responsable_manejo INT UNSIGNED NOT NULL,
    chofer INT UNSIGNED NOT NULL,
    id_vehiculo INT UNSIGNED NOT NULL,
    observacion TEXT,
    fecha_registro DATE NOT NULL,
    eliminado INT UNSIGNED DEFAULT 0,
    documentos TEXT,
    municipio INT UNSIGNED NOT NULL,
    parroquia INT UNSIGNED NOT NULL,
    comuna TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_placa (placa),
    INDEX idx_fecha_asignacion (fecha_asignacion),
    INDEX idx_chofer (chofer),
    INDEX idx_vehiculo (id_vehiculo),
    INDEX idx_eliminado (eliminado),
    FOREIGN KEY (chofer) REFERENCES trmachoferes(id),
    FOREIGN KEY (id_vehiculo) REFERENCES trmavehiculos(id),
    FOREIGN KEY (direccion) REFERENCES trmadirecciones(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE MANTENIMIENTOS
-- ==============================================

CREATE TABLE IF NOT EXISTS trdetmantenimiento (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(45) NOT NULL,
    tipo_mantenimiento INT UNSIGNED NOT NULL,
    kmactual INT UNSIGNED NOT NULL,
    taller INT UNSIGNED NOT NULL,
    ordende TEXT,
    eliminado INT UNSIGNED DEFAULT 0,
    fecha_registro DATE NOT NULL,
    id_vehiculo INT UNSIGNED NOT NULL,
    fecha_mantenimiento DATE NOT NULL,
    cedula_inspector DECIMAL(10,0) NOT NULL,
    nombre_inspector VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_placa (placa),
    INDEX idx_fecha_mantenimiento (fecha_mantenimiento),
    INDEX idx_vehiculo (id_vehiculo),
    INDEX idx_eliminado (eliminado),
    FOREIGN KEY (id_vehiculo) REFERENCES trmavehiculos(id),
    FOREIGN KEY (tipo_mantenimiento) REFERENCES trmatipo_mantenimiento(id),
    FOREIGN KEY (taller) REFERENCES trmatalleres(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE PÓLIZAS/SEGUROS
-- ==============================================

CREATE TABLE IF NOT EXISTS trdetpoliza (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(45) NOT NULL,
    aseguradora INT UNSIGNED NOT NULL,
    nro_poliza VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    monto DECIMAL(15,2) NOT NULL,
    cobertura TEXT,
    observaciones TEXT,
    fecha_registro DATE NOT NULL,
    eliminado INT UNSIGNED DEFAULT 0,
    id_vehiculo INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_placa (placa),
    INDEX idx_fecha_vencimiento (fecha_vencimiento),
    INDEX idx_vehiculo (id_vehiculo),
    INDEX idx_eliminado (eliminado),
    FOREIGN KEY (id_vehiculo) REFERENCES trmavehiculos(id),
    FOREIGN KEY (aseguradora) REFERENCES trmaaseguradoras(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE SINIESTROS
-- ==============================================

CREATE TABLE IF NOT EXISTS trdetsiniestro (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(45) NOT NULL,
    fecha_siniestro DATE NOT NULL,
    lugar_siniestro TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    daños_estimados DECIMAL(15,2) DEFAULT 0,
    estado ENUM('reportado', 'en_proceso', 'cerrado') DEFAULT 'reportado',
    observaciones TEXT,
    fecha_registro DATE NOT NULL,
    eliminado INT UNSIGNED DEFAULT 0,
    id_vehiculo INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_placa (placa),
    INDEX idx_fecha_siniestro (fecha_siniestro),
    INDEX idx_estado (estado),
    INDEX idx_vehiculo (id_vehiculo),
    INDEX idx_eliminado (eliminado),
    FOREIGN KEY (id_vehiculo) REFERENCES trmavehiculos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE INSPECCIONES
-- ==============================================

CREATE TABLE IF NOT EXISTS trmainspeccion (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ci_inspector DECIMAL(10,0) NOT NULL,
    nombre_inspector VARCHAR(100) NOT NULL,
    itemsbuenos TEXT,
    itemsregulares TEXT,
    itemsmalos TEXT,
    placa VARCHAR(45) NOT NULL,
    fecha_inspeccion DATE NOT NULL,
    id_vehiculo DECIMAL(10,0) NOT NULL,
    eliminado INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_placa (placa),
    INDEX idx_fecha_inspeccion (fecha_inspeccion),
    INDEX idx_eliminado (eliminado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE IMÁGENES DE VEHÍCULOS
-- ==============================================

CREATE TABLE IF NOT EXISTS trmaimgvehiculo (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_vehiculo INT UNSIGNED NOT NULL,
    ruta_original TEXT NOT NULL,
    ruta_pequena TEXT NOT NULL,
    principal INT UNSIGNED DEFAULT 0,
    fecha_registro DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_vehiculo (id_vehiculo),
    INDEX idx_principal (principal),
    FOREIGN KEY (id_vehiculo) REFERENCES trmavehiculos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE IMÁGENES DE CHOFERES
-- ==============================================

CREATE TABLE IF NOT EXISTS trmaimgchofer (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_chofer INT UNSIGNED NOT NULL,
    ruta_original TEXT NOT NULL,
    ruta_pequena TEXT NOT NULL,
    principal INT UNSIGNED DEFAULT 0,
    fecha_registro DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_chofer (id_chofer),
    INDEX idx_principal (principal),
    FOREIGN KEY (id_chofer) REFERENCES trmachoferes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE DOCUMENTOS
-- ==============================================

CREATE TABLE IF NOT EXISTS documentos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tipo_documento VARCHAR(100) NOT NULL,
    entidad_tipo ENUM('vehiculo', 'chofer', 'asignacion', 'mantenimiento', 'seguro', 'siniestro', 'general') NOT NULL,
    entidad_id INT UNSIGNED,
    nombre_archivo VARCHAR(255) NOT NULL,
    nombre_original VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tipo_mime VARCHAR(100),
    tamano_archivo INT UNSIGNED DEFAULT 0,
    descripcion TEXT,
    categoria VARCHAR(100),
    etiquetas TEXT,
    fecha_vencimiento DATE,
    estado ENUM('activo', 'inactivo', 'archivado') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    eliminado TINYINT(1) DEFAULT 0,

    INDEX idx_entidad (entidad_tipo, entidad_id),
    INDEX idx_tipo_documento (tipo_documento),
    INDEX idx_categoria (categoria),
    INDEX idx_fecha_vencimiento (fecha_vencimiento),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- DATOS INICIALES
-- ==============================================

-- Insertar datos básicos de clases de vehículos
INSERT INTO trmaclase (id, nombre) VALUES 
(1, 'Camioneta'),
(2, 'Moto'),
(3, 'Automovil'),
(4, 'Camion'),
(5, 'Minibus'),
(6, 'Bus'),
(7, 'Moto'),
(8, 'Rustico');

-- Insertar datos básicos de colores
INSERT INTO trmacolor (id, nombre) VALUES 
(1, 'Blanco'),
(2, 'Negro'),
(3, 'Azul'),
(4, 'Rojo'),
(5, 'Verde'),
(6, 'Amarillo'),
(7, 'Gris'),
(8, 'Plateado'),
(9, 'Dorado'),
(10, 'Beige'),
(11, 'Marrón'),
(12, 'Naranja'),
(13, 'Rosa'),
(14, 'Morado'),
(15, 'Café'),
(16, 'Coral'),
(17, 'Turquesa'),
(18, 'Lila'),
(19, 'Oro'),
(20, 'Bronce');

-- Insertar datos básicos de combustibles
INSERT INTO trmacombustible (id, nombre) VALUES 
(1, 'Gasolina'),
(2, 'Diesel'),
(3, 'Gas'),
(4, 'Eléctrico'),
(5, 'Híbrido');

-- Insertar datos básicos de tracción
INSERT INTO trmatraccion (id, nombre) VALUES 
(1, '4x4'),
(2, '4x2'),
(3, 'Unica');

-- Insertar datos básicos de transmisión
INSERT INTO trmatransmision (id, nombre) VALUES 
(1, 'Sincronica'),
(2, 'Automatica'),
(3, 'Secuencial');

-- Insertar datos básicos de asientos
INSERT INTO trmaasientos (id, nombre) VALUES 
(1, 'Tela'),
(2, 'Cuero');

-- Insertar datos básicos de unidades de peso
INSERT INTO trmaunidad_peso (id, nombre) VALUES 
(1, 'Kilogramos'),
(2, 'Toneladas');

-- Insertar datos básicos de tipos de mantenimiento
INSERT INTO trmatipo_mantenimiento (id, nombre) VALUES 
(1, 'Mantenimiento Preventivo'),
(2, 'Mantenimiento Correctivo'),
(3, 'Mantenimiento Predictivo');

-- Insertar datos básicos de items de mantenimiento
INSERT INTO trmaitems_mantenimiento (id, nombre) VALUES 
(1, 'Frenos'),
(2, 'Fajas y Bandas'),
(3, 'Llantas'),
(4, 'Bateria'),
(5, 'Cambio de Aceites'),
(6, 'Radiador'),
(7, 'Afinamiento'),
(8, 'Bujias'),
(9, 'Aire Acondicionado'),
(10, 'Luces, Partes Electricas'),
(11, 'Lubricacion (Lavado y Engrase)'),
(12, 'Filtro de Aire');

-- Insertar datos básicos de tipos de documentos
INSERT INTO trmadocumentos (id, nombre) VALUES 
(1, 'TITULO DE PROPIEDAD'),
(2, 'CARNET DE CIRCULACION'),
(3, 'SEGURO RCV'),
(4, 'CERTIFICADO DE ORIGEN');

-- Insertar usuario administrador por defecto
INSERT INTO trmausuarios (id, nombre, apellido, cedula, login, clave, perfil, primer_ingreso, status, cuenta, eliminado) VALUES 
(1, 'Administrador', 'Sistema', 12345678, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 0, 0, 0, 0);

-- Restaurar configuración
SET foreign_key_checks = 1;