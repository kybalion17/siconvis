-- ==============================================
-- SICONVIS - Sistema de Control de Visitas
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
-- TABLA DE DEPARTAMENTOS
-- ==============================================

CREATE TABLE IF NOT EXISTS trmadepartamentos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    responsable VARCHAR(255) NOT NULL,
    telefono_primario VARCHAR(255) NOT NULL,
    telefono_secundario VARCHAR(255) NOT NULL,
    status DECIMAL(10,0) NOT NULL DEFAULT '0',
    eliminado INT UNSIGNED DEFAULT '0',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_eliminado (eliminado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE VISITANTES
-- ==============================================

CREATE TABLE IF NOT EXISTS trmavisitantes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    cedula DECIMAL(10,0) NOT NULL,
    telefono_primario VARCHAR(255) NOT NULL,
    telefono_secundario VARCHAR(255) NOT NULL,
    foto VARCHAR(255) NOT NULL,
    solicitado INT UNSIGNED DEFAULT '0',
    eliminado INT UNSIGNED DEFAULT '0',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_cedula (cedula),
    INDEX idx_solicitado (solicitado),
    INDEX idx_eliminado (eliminado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE RELACIÓN VISITANTES-DEPARTAMENTOS
-- ==============================================

CREATE TABLE IF NOT EXISTS trmavisitantes_relationship (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    visitantes_id INT UNSIGNED DEFAULT '0',
    departamentos_id INT UNSIGNED DEFAULT '0',
    motivo_visita VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_visitante (visitantes_id),
    INDEX idx_departamento (departamentos_id),
    FOREIGN KEY (visitantes_id) REFERENCES trmavisitantes(id) ON DELETE CASCADE,
    FOREIGN KEY (departamentos_id) REFERENCES trmadepartamentos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE REGISTRO DE VISITAS
-- ==============================================

CREATE TABLE IF NOT EXISTS trdetvisitas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    visitante_id INT UNSIGNED NOT NULL,
    departamento_id INT UNSIGNED NOT NULL,
    motivo_visita VARCHAR(255) NOT NULL,
    fecha_entrada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_salida TIMESTAMP NULL,
    observaciones TEXT,
    estado ENUM('activa', 'finalizada', 'cancelada') DEFAULT 'activa',
    eliminado INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_visitante (visitante_id),
    INDEX idx_departamento (departamento_id),
    INDEX idx_fecha_entrada (fecha_entrada),
    INDEX idx_estado (estado),
    INDEX idx_eliminado (eliminado),
    FOREIGN KEY (visitante_id) REFERENCES trmavisitantes(id),
    FOREIGN KEY (departamento_id) REFERENCES trmadepartamentos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE DOCUMENTOS DE VISITANTES
-- ==============================================

CREATE TABLE IF NOT EXISTS trdetdocumentos_visitantes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    visitante_id INT UNSIGNED NOT NULL,
    tipo_documento VARCHAR(100) NOT NULL,
    numero_documento VARCHAR(255),
    fecha_emision DATE,
    fecha_vencimiento DATE,
    archivo_ruta VARCHAR(500),
    observaciones TEXT,
    estado ENUM('activo', 'vencido', 'inactivo') DEFAULT 'activo',
    eliminado INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_visitante (visitante_id),
    INDEX idx_tipo_documento (tipo_documento),
    INDEX idx_fecha_vencimiento (fecha_vencimiento),
    INDEX idx_estado (estado),
    INDEX idx_eliminado (eliminado),
    FOREIGN KEY (visitante_id) REFERENCES trmavisitantes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE HISTORIAL DE VISITAS
-- ==============================================

CREATE TABLE IF NOT EXISTS trdethistorial_visitas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    visitante_id INT UNSIGNED NOT NULL,
    departamento_id INT UNSIGNED NOT NULL,
    motivo_visita VARCHAR(255) NOT NULL,
    fecha_entrada TIMESTAMP NOT NULL,
    fecha_salida TIMESTAMP,
    duracion_minutos INT UNSIGNED DEFAULT 0,
    observaciones TEXT,
    estado_final ENUM('completada', 'cancelada', 'abandonada') DEFAULT 'completada',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_visitante (visitante_id),
    INDEX idx_departamento (departamento_id),
    INDEX idx_fecha_entrada (fecha_entrada),
    INDEX idx_estado_final (estado_final),
    FOREIGN KEY (visitante_id) REFERENCES trmavisitantes(id),
    FOREIGN KEY (departamento_id) REFERENCES trmadepartamentos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- TABLA DE CONFIGURACIÓN DEL SISTEMA
-- ==============================================

CREATE TABLE IF NOT EXISTS trmaconfiguracion (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(100) NOT NULL,
    valor TEXT,
    descripcion TEXT,
    tipo ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_clave (clave),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ==============================================
-- DATOS INICIALES
-- ==============================================

-- Insertar usuario administrador por defecto
INSERT INTO trmausuarios (id, nombre, apellido, cedula, login, clave, perfil, primer_ingreso, status, cuenta, eliminado) VALUES 
(1, 'Administrador', 'Sistema', 12345678, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 0, 0, 0, 0);

-- Insertar departamentos de ejemplo
INSERT INTO trmadepartamentos (nombre, responsable, telefono_primario, telefono_secundario, status, eliminado) VALUES 
('Recursos Humanos', 'María González', '0212-555-0101', '0212-555-0102', 1, 0),
('Contabilidad', 'Carlos Rodríguez', '0212-555-0201', '0212-555-0202', 1, 0),
('Gerencia General', 'Ana Martínez', '0212-555-0301', '0212-555-0302', 1, 0),
('Tecnología', 'Luis Pérez', '0212-555-0401', '0212-555-0402', 1, 0),
('Ventas', 'Carmen López', '0212-555-0501', '0212-555-0502', 1, 0);

-- Insertar configuración inicial del sistema
INSERT INTO trmaconfiguracion (clave, valor, descripcion, tipo) VALUES 
('empresa_nombre', 'SICONVIS', 'Nombre de la empresa', 'string'),
('empresa_direccion', 'Caracas, Venezuela', 'Dirección de la empresa', 'string'),
('empresa_telefono', '0212-555-0000', 'Teléfono principal de la empresa', 'string'),
('visitas_max_diarias', '100', 'Máximo número de visitas por día', 'number'),
('tiempo_max_visita_horas', '8', 'Tiempo máximo de visita en horas', 'number'),
('requiere_foto', 'true', 'Si se requiere foto del visitante', 'boolean'),
('motivos_visita', '["Reunión", "Entrevista", "Entrega", "Recogida", "Mantenimiento", "Otro"]', 'Motivos de visita disponibles', 'json');

-- Restaurar configuración
SET foreign_key_checks = 1;