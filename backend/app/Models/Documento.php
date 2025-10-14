<?php

namespace SAGAUT\Models;

use SAGAUT\Utils\Database;

class Documento extends BaseModel
{
    protected string $table = 'documentos';
    protected string $primaryKey = 'id';
    
    protected array $fillable = [
        'tipo_documento',
        'entidad_tipo',
        'entidad_id',
        'nombre_archivo',
        'nombre_original',
        'ruta_archivo',
        'tipo_mime',
        'tamano_archivo',
        'descripcion',
        'categoria',
        'etiquetas',
        'fecha_vencimiento',
        'estado',
        'eliminado'
    ];

    public function getDocumentosConDetalles(array $filters = [], int $page = 1, int $perPage = 10): array
    {
        $offset = ($page - 1) * $perPage;
        
        $sql = "
            SELECT 
                d.*,
                CASE 
                    WHEN d.entidad_tipo = 'vehiculo' THEN v.placa
                    WHEN d.entidad_tipo = 'chofer' THEN CONCAT(c.nombre, ' ', c.apellido)
                    WHEN d.entidad_tipo = 'asignacion' THEN CONCAT('Asignación #', a.id)
                    WHEN d.entidad_tipo = 'mantenimiento' THEN CONCAT('Mantenimiento #', m.id)
                    WHEN d.entidad_tipo = 'seguro' THEN CONCAT('Seguro #', s.id)
                    WHEN d.entidad_tipo = 'siniestro' THEN CONCAT('Siniestro #', sin.id)
                    ELSE 'General'
                END as entidad_nombre,
                DATEDIFF(COALESCE(d.fecha_vencimiento, '2099-12-31'), CURDATE()) as dias_restantes,
                CASE 
                    WHEN d.fecha_vencimiento IS NULL THEN 'sin_vencimiento'
                    WHEN d.fecha_vencimiento < CURDATE() THEN 'vencido'
                    WHEN d.fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'por_vencer'
                    ELSE 'vigente'
                END as estado_vencimiento
            FROM {$this->table} d
            LEFT JOIN trmavehiculos v ON d.entidad_tipo = 'vehiculo' AND d.entidad_id = v.id
            LEFT JOIN trmachoferes c ON d.entidad_tipo = 'chofer' AND d.entidad_id = c.id
            LEFT JOIN trdetasignar a ON d.entidad_tipo = 'asignacion' AND d.entidad_id = a.id
            LEFT JOIN trdetmantenimiento m ON d.entidad_tipo = 'mantenimiento' AND d.entidad_id = m.id
            LEFT JOIN trdetpoliza s ON d.entidad_tipo = 'seguro' AND d.entidad_id = s.id
            LEFT JOIN trdetsiniestro sin ON d.entidad_tipo = 'siniestro' AND d.entidad_id = sin.id
            WHERE d.eliminado = 0
        ";
        
        $params = [];
        
        if (!empty($filters['tipo_documento'])) {
            $sql .= " AND d.tipo_documento = ?";
            $params[] = $filters['tipo_documento'];
        }
        
        if (!empty($filters['entidad_tipo'])) {
            $sql .= " AND d.entidad_tipo = ?";
            $params[] = $filters['entidad_tipo'];
        }
        
        if (!empty($filters['entidad_id'])) {
            $sql .= " AND d.entidad_id = ?";
            $params[] = $filters['entidad_id'];
        }
        
        if (!empty($filters['categoria'])) {
            $sql .= " AND d.categoria = ?";
            $params[] = $filters['categoria'];
        }
        
        if (!empty($filters['estado_vencimiento'])) {
            switch ($filters['estado_vencimiento']) {
                case 'vencido':
                    $sql .= " AND d.fecha_vencimiento < CURDATE()";
                    break;
                case 'por_vencer':
                    $sql .= " AND d.fecha_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)";
                    break;
                case 'vigente':
                    $sql .= " AND d.fecha_vencimiento > DATE_ADD(CURDATE(), INTERVAL 30 DAY)";
                    break;
                case 'sin_vencimiento':
                    $sql .= " AND d.fecha_vencimiento IS NULL";
                    break;
            }
        }
        
        if (!empty($filters['busqueda'])) {
            $sql .= " AND (d.nombre_original LIKE ? OR d.descripcion LIKE ? OR d.etiquetas LIKE ?)";
            $busqueda = '%' . $filters['busqueda'] . '%';
            $params[] = $busqueda;
            $params[] = $busqueda;
            $params[] = $busqueda;
        }
        
        $sql .= " ORDER BY d.created_at DESC LIMIT ? OFFSET ?";
        $params[] = $perPage;
        $params[] = $offset;
        
        return Database::fetchAll($sql, $params);
    }

    public function getDocumentoConDetalles(int $id): ?array
    {
        $sql = "
            SELECT 
                d.*,
                CASE 
                    WHEN d.entidad_tipo = 'vehiculo' THEN v.placa
                    WHEN d.entidad_tipo = 'chofer' THEN CONCAT(c.nombre, ' ', c.apellido)
                    WHEN d.entidad_tipo = 'asignacion' THEN CONCAT('Asignación #', a.id)
                    WHEN d.entidad_tipo = 'mantenimiento' THEN CONCAT('Mantenimiento #', m.id)
                    WHEN d.entidad_tipo = 'seguro' THEN CONCAT('Seguro #', s.id)
                    WHEN d.entidad_tipo = 'siniestro' THEN CONCAT('Siniestro #', sin.id)
                    ELSE 'General'
                END as entidad_nombre,
                DATEDIFF(COALESCE(d.fecha_vencimiento, '2099-12-31'), CURDATE()) as dias_restantes,
                CASE 
                    WHEN d.fecha_vencimiento IS NULL THEN 'sin_vencimiento'
                    WHEN d.fecha_vencimiento < CURDATE() THEN 'vencido'
                    WHEN d.fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'por_vencer'
                    ELSE 'vigente'
                END as estado_vencimiento
            FROM {$this->table} d
            LEFT JOIN trmavehiculos v ON d.entidad_tipo = 'vehiculo' AND d.entidad_id = v.id
            LEFT JOIN trmachoferes c ON d.entidad_tipo = 'chofer' AND d.entidad_id = c.id
            LEFT JOIN trdetasignar a ON d.entidad_tipo = 'asignacion' AND d.entidad_id = a.id
            LEFT JOIN trdetmantenimiento m ON d.entidad_tipo = 'mantenimiento' AND d.entidad_id = m.id
            LEFT JOIN trdetpoliza s ON d.entidad_tipo = 'seguro' AND d.entidad_id = s.id
            LEFT JOIN trdetsiniestro sin ON d.entidad_tipo = 'siniestro' AND d.entidad_id = sin.id
            WHERE d.id = ? AND d.eliminado = 0
        ";
        
        return Database::fetchOne($sql, [$id]);
    }

    public function getDocumentosPorEntidad(string $entidadTipo, int $entidadId): array
    {
        $sql = "
            SELECT 
                d.*,
                DATEDIFF(COALESCE(d.fecha_vencimiento, '2099-12-31'), CURDATE()) as dias_restantes,
                CASE 
                    WHEN d.fecha_vencimiento IS NULL THEN 'sin_vencimiento'
                    WHEN d.fecha_vencimiento < CURDATE() THEN 'vencido'
                    WHEN d.fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'por_vencer'
                    ELSE 'vigente'
                END as estado_vencimiento
            FROM {$this->table} d
            WHERE d.entidad_tipo = ? AND d.entidad_id = ? AND d.eliminado = 0
            ORDER BY d.created_at DESC
        ";
        
        return Database::fetchAll($sql, [$entidadTipo, $entidadId]);
    }

    public function getDocumentosPorVencer(int $dias = 30): array
    {
        $sql = "
            SELECT 
                d.*,
                CASE 
                    WHEN d.entidad_tipo = 'vehiculo' THEN v.placa
                    WHEN d.entidad_tipo = 'chofer' THEN CONCAT(c.nombre, ' ', c.apellido)
                    WHEN d.entidad_tipo = 'asignacion' THEN CONCAT('Asignación #', a.id)
                    WHEN d.entidad_tipo = 'mantenimiento' THEN CONCAT('Mantenimiento #', m.id)
                    WHEN d.entidad_tipo = 'seguro' THEN CONCAT('Seguro #', s.id)
                    WHEN d.entidad_tipo = 'siniestro' THEN CONCAT('Siniestro #', sin.id)
                    ELSE 'General'
                END as entidad_nombre,
                DATEDIFF(d.fecha_vencimiento, CURDATE()) as dias_restantes
            FROM {$this->table} d
            LEFT JOIN trmavehiculos v ON d.entidad_tipo = 'vehiculo' AND d.entidad_id = v.id
            LEFT JOIN trmachoferes c ON d.entidad_tipo = 'chofer' AND d.entidad_id = c.id
            LEFT JOIN trdetasignar a ON d.entidad_tipo = 'asignacion' AND d.entidad_id = a.id
            LEFT JOIN trdetmantenimiento m ON d.entidad_tipo = 'mantenimiento' AND d.entidad_id = m.id
            LEFT JOIN trdetpoliza s ON d.entidad_tipo = 'seguro' AND d.entidad_id = s.id
            LEFT JOIN trdetsiniestro sin ON d.entidad_tipo = 'siniestro' AND d.entidad_id = sin.id
            WHERE d.eliminado = 0
            AND d.fecha_vencimiento IS NOT NULL
            AND d.fecha_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
            ORDER BY d.fecha_vencimiento ASC
        ";
        
        return Database::fetchAll($sql, [$dias]);
    }

    public function getDocumentosVencidos(): array
    {
        $sql = "
            SELECT 
                d.*,
                CASE 
                    WHEN d.entidad_tipo = 'vehiculo' THEN v.placa
                    WHEN d.entidad_tipo = 'chofer' THEN CONCAT(c.nombre, ' ', c.apellido)
                    WHEN d.entidad_tipo = 'asignacion' THEN CONCAT('Asignación #', a.id)
                    WHEN d.entidad_tipo = 'mantenimiento' THEN CONCAT('Mantenimiento #', m.id)
                    WHEN d.entidad_tipo = 'seguro' THEN CONCAT('Seguro #', s.id)
                    WHEN d.entidad_tipo = 'siniestro' THEN CONCAT('Siniestro #', sin.id)
                    ELSE 'General'
                END as entidad_nombre,
                DATEDIFF(CURDATE(), d.fecha_vencimiento) as dias_vencido
            FROM {$this->table} d
            LEFT JOIN trmavehiculos v ON d.entidad_tipo = 'vehiculo' AND d.entidad_id = v.id
            LEFT JOIN trmachoferes c ON d.entidad_tipo = 'chofer' AND d.entidad_id = c.id
            LEFT JOIN trdetasignar a ON d.entidad_tipo = 'asignacion' AND d.entidad_id = a.id
            LEFT JOIN trdetmantenimiento m ON d.entidad_tipo = 'mantenimiento' AND d.entidad_id = m.id
            LEFT JOIN trdetpoliza s ON d.entidad_tipo = 'seguro' AND d.entidad_id = s.id
            LEFT JOIN trdetsiniestro sin ON d.entidad_tipo = 'siniestro' AND d.entidad_id = sin.id
            WHERE d.eliminado = 0
            AND d.fecha_vencimiento IS NOT NULL
            AND d.fecha_vencimiento < CURDATE()
            ORDER BY d.fecha_vencimiento ASC
        ";
        
        return Database::fetchAll($sql);
    }

    public function getEstadisticasDocumentos(): array
    {
        $sql = "
            SELECT 
                tipo_documento,
                COUNT(*) as total
            FROM {$this->table}
            WHERE eliminado = 0
            GROUP BY tipo_documento
            ORDER BY total DESC
        ";
        
        $porTipo = Database::fetchAll($sql);
        
        $sql = "
            SELECT 
                entidad_tipo,
                COUNT(*) as total
            FROM {$this->table}
            WHERE eliminado = 0
            GROUP BY entidad_tipo
            ORDER BY total DESC
        ";
        
        $porEntidad = Database::fetchAll($sql);
        
        $sql = "
            SELECT 
                categoria,
                COUNT(*) as total
            FROM {$this->table}
            WHERE eliminado = 0 AND categoria IS NOT NULL
            GROUP BY categoria
            ORDER BY total DESC
        ";
        
        $porCategoria = Database::fetchAll($sql);
        
        $sql = "
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as mes,
                COUNT(*) as total,
                SUM(tamano_archivo) as tamano_total
            FROM {$this->table}
            WHERE eliminado = 0
            AND created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY mes DESC
        ";
        
        $porMes = Database::fetchAll($sql);
        
        return [
            'por_tipo' => $porTipo,
            'por_entidad' => $porEntidad,
            'por_categoria' => $porCategoria,
            'por_mes' => $porMes
        ];
    }

    public function buscarDocumentos(string $termino): array
    {
        $sql = "
            SELECT 
                d.*,
                CASE 
                    WHEN d.entidad_tipo = 'vehiculo' THEN v.placa
                    WHEN d.entidad_tipo = 'chofer' THEN CONCAT(c.nombre, ' ', c.apellido)
                    WHEN d.entidad_tipo = 'asignacion' THEN CONCAT('Asignación #', a.id)
                    WHEN d.entidad_tipo = 'mantenimiento' THEN CONCAT('Mantenimiento #', m.id)
                    WHEN d.entidad_tipo = 'seguro' THEN CONCAT('Seguro #', s.id)
                    WHEN d.entidad_tipo = 'siniestro' THEN CONCAT('Siniestro #', sin.id)
                    ELSE 'General'
                END as entidad_nombre
            FROM {$this->table} d
            LEFT JOIN trmavehiculos v ON d.entidad_tipo = 'vehiculo' AND d.entidad_id = v.id
            LEFT JOIN trmachoferes c ON d.entidad_tipo = 'chofer' AND d.entidad_id = c.id
            LEFT JOIN trdetasignar a ON d.entidad_tipo = 'asignacion' AND d.entidad_id = a.id
            LEFT JOIN trdetmantenimiento m ON d.entidad_tipo = 'mantenimiento' AND d.entidad_id = m.id
            LEFT JOIN trdetpoliza s ON d.entidad_tipo = 'seguro' AND d.entidad_id = s.id
            LEFT JOIN trdetsiniestro sin ON d.entidad_tipo = 'siniestro' AND d.entidad_id = sin.id
            WHERE d.eliminado = 0
            AND (
                d.nombre_original LIKE ? 
                OR d.descripcion LIKE ? 
                OR d.etiquetas LIKE ?
                OR d.tipo_documento LIKE ?
                OR d.categoria LIKE ?
            )
            ORDER BY d.created_at DESC
        ";
        
        $busqueda = '%' . $termino . '%';
        $params = [$busqueda, $busqueda, $busqueda, $busqueda, $busqueda];
        
        return Database::fetchAll($sql, $params);
    }

    public function getDocumentosPorCategoria(string $categoria): array
    {
        $sql = "
            SELECT 
                d.*,
                CASE 
                    WHEN d.entidad_tipo = 'vehiculo' THEN v.placa
                    WHEN d.entidad_tipo = 'chofer' THEN CONCAT(c.nombre, ' ', c.apellido)
                    WHEN d.entidad_tipo = 'asignacion' THEN CONCAT('Asignación #', a.id)
                    WHEN d.entidad_tipo = 'mantenimiento' THEN CONCAT('Mantenimiento #', m.id)
                    WHEN d.entidad_tipo = 'seguro' THEN CONCAT('Seguro #', s.id)
                    WHEN d.entidad_tipo = 'siniestro' THEN CONCAT('Siniestro #', sin.id)
                    ELSE 'General'
                END as entidad_nombre
            FROM {$this->table} d
            LEFT JOIN vehiculos v ON d.entidad_tipo = 'vehiculo' AND d.entidad_id = v.id
            LEFT JOIN choferes c ON d.entidad_tipo = 'chofer' AND d.entidad_id = c.id
            LEFT JOIN asignaciones a ON d.entidad_tipo = 'asignacion' AND d.entidad_id = a.id
            LEFT JOIN mantenimientos m ON d.entidad_tipo = 'mantenimiento' AND d.entidad_id = m.id
            LEFT JOIN seguros s ON d.entidad_tipo = 'seguro' AND d.entidad_id = s.id
            LEFT JOIN siniestros sin ON d.entidad_tipo = 'siniestro' AND d.entidad_id = sin.id
            WHERE d.eliminado = 0 AND d.categoria = ?
            ORDER BY d.created_at DESC
        ";
        
        return Database::fetchAll($sql, [$categoria]);
    }

    public function getTamanoTotalArchivos(): int
    {
        $sql = "SELECT SUM(tamano_archivo) as total FROM {$this->table} WHERE eliminado = 0";
        $result = Database::fetchOne($sql);
        return (int)($result['total'] ?? 0);
    }

    public function getDocumentosRecientes(int $limit = 10): array
    {
        $sql = "
            SELECT 
                d.*,
                CASE 
                    WHEN d.entidad_tipo = 'vehiculo' THEN v.placa
                    WHEN d.entidad_tipo = 'chofer' THEN CONCAT(c.nombre, ' ', c.apellido)
                    WHEN d.entidad_tipo = 'asignacion' THEN CONCAT('Asignación #', a.id)
                    WHEN d.entidad_tipo = 'mantenimiento' THEN CONCAT('Mantenimiento #', m.id)
                    WHEN d.entidad_tipo = 'seguro' THEN CONCAT('Seguro #', s.id)
                    WHEN d.entidad_tipo = 'siniestro' THEN CONCAT('Siniestro #', sin.id)
                    ELSE 'General'
                END as entidad_nombre
            FROM {$this->table} d
            LEFT JOIN vehiculos v ON d.entidad_tipo = 'vehiculo' AND d.entidad_id = v.id
            LEFT JOIN choferes c ON d.entidad_tipo = 'chofer' AND d.entidad_id = c.id
            LEFT JOIN asignaciones a ON d.entidad_tipo = 'asignacion' AND d.entidad_id = a.id
            LEFT JOIN mantenimientos m ON d.entidad_tipo = 'mantenimiento' AND d.entidad_id = m.id
            LEFT JOIN seguros s ON d.entidad_tipo = 'seguro' AND d.entidad_id = s.id
            LEFT JOIN siniestros sin ON d.entidad_tipo = 'siniestro' AND d.entidad_id = sin.id
            WHERE d.eliminado = 0
            ORDER BY d.created_at DESC
            LIMIT ?
        ";
        
        return Database::fetchAll($sql, [$limit]);
    }
}
