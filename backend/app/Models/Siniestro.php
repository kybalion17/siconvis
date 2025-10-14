<?php

namespace SAGAUT\Models;

use SAGAUT\Utils\Database;

class Siniestro extends BaseModel
{
    protected string $table = 'trdetsiniestro';
    protected string $primaryKey = 'id';
    
    protected array $fillable = [
        'vehiculo',
        'fecha_siniestro',
        'tipo_siniestro',
        'taller',
        'intervino_transito',
        'causa',
        'danos_estimados',
        'fecha_denuncia',
        'numero_denuncia',
        'monto',
        'estado',
        'eliminado'
    ];

    public function getSiniestrosConDetalles(array $filters = [], int $page = 1, int $perPage = 10): array
    {
        $offset = ($page - 1) * $perPage;
        
        $sql = "
            SELECT 
                s.*,
                DATEDIFF(CURDATE(), s.fecha_siniestro) as dias_transcurridos
            FROM {$this->table} s
            WHERE s.eliminado = 0
        ";
        
        $params = [];
        
        if (!empty($filters['estado'])) {
            $sql .= " AND s.estado = ?";
            $params[] = $filters['estado'];
        }
        
        if (!empty($filters['vehiculo'])) {
            $sql .= " AND s.vehiculo = ?";
            $params[] = $filters['vehiculo'];
        }
        
        if (!empty($filters['tipo_siniestro'])) {
            $sql .= " AND s.tipo_siniestro = ?";
            $params[] = $filters['tipo_siniestro'];
        }
        
        if (!empty($filters['fecha_desde'])) {
            $sql .= " AND s.fecha_siniestro >= ?";
            $params[] = $filters['fecha_desde'];
        }
        
        if (!empty($filters['fecha_hasta'])) {
            $sql .= " AND s.fecha_siniestro <= ?";
            $params[] = $filters['fecha_hasta'];
        }
        
        $sql .= " ORDER BY s.fecha_siniestro DESC LIMIT ? OFFSET ?";
        $params[] = $perPage;
        $params[] = $offset;
        
        return Database::fetchAll($sql, $params);
    }

    public function getSiniestroConDetalles(int $id): ?array
    {
        $sql = "
            SELECT 
                s.*,
                DATEDIFF(CURDATE(), s.fecha_siniestro) as dias_transcurridos
            FROM {$this->table} s
            WHERE s.id = ? AND s.eliminado = 0
        ";
        
        return Database::fetchOne($sql, [$id]);
    }

    public function getSiniestrosAbiertos(): array
    {
        $sql = "
            SELECT 
                s.*,
                v.placa,
                cv.nombre as clase_vehiculo,
                DATEDIFF(CURDATE(), s.fecha_ocurrencia) as dias_transcurridos
            FROM {$this->table} s
            LEFT JOIN vehiculos v ON s.vehiculo_id = v.id
            LEFT JOIN clases_vehiculo cv ON v.clase_id = cv.id
            WHERE s.estado IN ('reportado', 'en_investigacion')
            AND s.eliminado = 0
            ORDER BY s.fecha_siniestro DESC
        ";
        
        return Database::fetchAll($sql);
    }

    public function getSiniestrosPorTipo(): array
    {
        $sql = "
            SELECT 
                tipo_siniestro,
                COUNT(*) as total,
                AVG(monto) as costo_promedio
            FROM {$this->table}
            WHERE eliminado = 0
            GROUP BY tipo_siniestro
            ORDER BY total DESC
        ";
        
        return Database::fetchAll($sql);
    }

    public function getEstadisticasSiniestros(): array
    {
        $sql = "
            SELECT 
                estado,
                COUNT(*) as total
            FROM {$this->table}
            WHERE eliminado = 0
            GROUP BY estado
        ";
        
        $estados = Database::fetchAll($sql);
        
        $sql = "
            SELECT 
                tipo_siniestro,
                COUNT(*) as total,
                AVG(monto) as costo_promedio
            FROM {$this->table}
            WHERE eliminado = 0
            GROUP BY tipo_siniestro
            ORDER BY total DESC
        ";
        
        $porTipo = Database::fetchAll($sql);
        
        $sql = "
            SELECT 
                DATE_FORMAT(fecha_siniestro, '%Y-%m') as mes,
                COUNT(*) as total,
                SUM(monto) as costo_total
            FROM {$this->table}
            WHERE eliminado = 0
            AND fecha_siniestro >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(fecha_siniestro, '%Y-%m')
            ORDER BY mes DESC
        ";
        
        $porMes = Database::fetchAll($sql);
        
        return [
            'por_estado' => $estados,
            'por_tipo' => $porTipo,
            'por_mes' => $porMes
        ];
    }

    public function getSiniestrosPorVehiculo(int $vehiculoId): array
    {
        $sql = "
            SELECT 
                s.*,
                t.nombre as taller_nombre,
                DATEDIFF(CURDATE(), s.fecha_ocurrencia) as dias_transcurridos
            FROM {$this->table} s
            LEFT JOIN talleres t ON s.taller_id = t.id
            WHERE s.vehiculo = ? AND s.eliminado = 0
            ORDER BY s.fecha_siniestro DESC
        ";
        
        return Database::fetchAll($sql, [$vehiculoId]);
    }

    public function getSiniestrosPorPeriodo(string $fechaInicio, string $fechaFin): array
    {
        $sql = "
            SELECT 
                s.*,
                v.placa,
                cv.nombre as clase_vehiculo,
                t.nombre as taller_nombre,
                DATEDIFF(s.fecha_ocurrencia, ?) as dias_desde_inicio
            FROM {$this->table} s
            LEFT JOIN vehiculos v ON s.vehiculo_id = v.id
            LEFT JOIN clases_vehiculo cv ON v.clase_id = cv.id
            LEFT JOIN talleres t ON s.taller_id = t.id
            WHERE s.eliminado = 0
            AND s.fecha_siniestro BETWEEN ? AND ?
            ORDER BY s.fecha_siniestro ASC
        ";
        
        return Database::fetchAll($sql, [$fechaInicio, $fechaInicio, $fechaFin]);
    }

    public function getCostoTotalSiniestros(int $vehiculoId, string $fechaInicio = null, string $fechaFin = null): float
    {
        $sql = "
            SELECT SUM(monto) as total
            FROM {$this->table}
            WHERE vehiculo = ? AND eliminado = 0 AND monto IS NOT NULL
        ";
        
        $params = [$vehiculoId];
        
        if ($fechaInicio) {
            $sql .= " AND fecha_ocurrencia >= ?";
            $params[] = $fechaInicio;
        }
        
        if ($fechaFin) {
            $sql .= " AND fecha_ocurrencia <= ?";
            $params[] = $fechaFin;
        }
        
        $result = Database::fetchOne($sql, $params);
        return (float)($result['total'] ?? 0);
    }

    public function getSiniestrosConTransito(): array
    {
        $sql = "
            SELECT 
                s.*,
                v.placa,
                cv.nombre as clase_vehiculo,
                DATEDIFF(CURDATE(), s.fecha_ocurrencia) as dias_transcurridos
            FROM {$this->table} s
            LEFT JOIN vehiculos v ON s.vehiculo_id = v.id
            LEFT JOIN clases_vehiculo cv ON v.clase_id = cv.id
            WHERE s.intervino_transito = 1
            AND s.eliminado = 0
            ORDER BY s.fecha_siniestro DESC
        ";
        
        return Database::fetchAll($sql);
    }

    public function getSiniestrosConDenuncia(): array
    {
        $sql = "
            SELECT 
                s.*,
                v.placa,
                cv.nombre as clase_vehiculo,
                DATEDIFF(CURDATE(), s.fecha_ocurrencia) as dias_transcurridos
            FROM {$this->table} s
            LEFT JOIN vehiculos v ON s.vehiculo_id = v.id
            LEFT JOIN clases_vehiculo cv ON v.clase_id = cv.id
            WHERE s.numero_denuncia IS NOT NULL
            AND s.eliminado = 0
            ORDER BY s.fecha_siniestro DESC
        ";
        
        return Database::fetchAll($sql);
    }

    public function cerrarSiniestro(int $siniestroId, string $observaciones = null): bool
    {
        $data = [
            'estado' => 'cerrado'
        ];

        return $this->update($siniestroId, $data);
    }

    public function archivarSiniestro(int $siniestroId, string $motivo = null): bool
    {
        $data = [
            'estado' => 'archivado'
        ];

        return $this->update($siniestroId, $data);
    }

    public function getSiniestrosPorTaller(int $tallerId): array
    {
        $sql = "
            SELECT 
                s.*,
                v.placa,
                cv.nombre as clase_vehiculo,
                DATEDIFF(CURDATE(), s.fecha_ocurrencia) as dias_transcurridos
            FROM {$this->table} s
            LEFT JOIN vehiculos v ON s.vehiculo_id = v.id
            LEFT JOIN clases_vehiculo cv ON v.clase_id = cv.id
            WHERE s.taller = ? AND s.eliminado = 0
            ORDER BY s.fecha_siniestro DESC
        ";
        
        return Database::fetchAll($sql, [$tallerId]);
    }

    public function getSiniestrosPorMes(int $año, int $mes): array
    {
        $sql = "
            SELECT 
                s.*,
                v.placa,
                cv.nombre as clase_vehiculo,
                t.nombre as taller_nombre
            FROM {$this->table} s
            LEFT JOIN vehiculos v ON s.vehiculo_id = v.id
            LEFT JOIN clases_vehiculo cv ON v.clase_id = cv.id
            LEFT JOIN talleres t ON s.taller_id = t.id
            WHERE s.eliminado = 0
            AND YEAR(s.fecha_siniestro) = ?
            AND MONTH(s.fecha_siniestro) = ?
            ORDER BY s.fecha_siniestro DESC
        ";
        
        return Database::fetchAll($sql, [$año, $mes]);
    }
}
