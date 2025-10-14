<?php

namespace SAGAUT\Models;

use SAGAUT\Utils\Database;

class Asignacion extends BaseModel
{
    protected string $table = 'trdetasignar';
    protected string $primaryKey = 'id';
    
    protected array $fillable = [
        'vehiculo',
        'chofer',
        'fecha_asignacion',
        'fecha_devolucion',
        'observacion',
        'eliminado'
    ];

    public function getAsignacionesConDetalles(array $filters = [], int $page = 1, int $perPage = 10): array
    {
        $offset = ($page - 1) * $perPage;
        
        $sql = "
            SELECT 
                a.*,
                DATEDIFF(COALESCE(a.fecha_devolucion, CURDATE()), a.fecha_asignacion) as dias_asignacion
            FROM {$this->table} a
            WHERE a.eliminado = 0
        ";
        
        $params = [];
        
        if (!empty($filters['estado'])) {
            $sql .= " AND a.estado = ?";
            $params[] = $filters['estado'];
        }
        
        if (!empty($filters['vehiculo'])) {
            $sql .= " AND a.vehiculo = ?";
            $params[] = $filters['vehiculo'];
        }
        
        if (!empty($filters['chofer'])) {
            $sql .= " AND a.chofer = ?";
            $params[] = $filters['chofer'];
        }
        
        if (!empty($filters['fecha_desde'])) {
            $sql .= " AND a.fecha_asignacion >= ?";
            $params[] = $filters['fecha_desde'];
        }
        
        if (!empty($filters['fecha_hasta'])) {
            $sql .= " AND a.fecha_asignacion <= ?";
            $params[] = $filters['fecha_hasta'];
        }
        
        $sql .= " ORDER BY a.fecha_asignacion DESC LIMIT ? OFFSET ?";
        $params[] = $perPage;
        $params[] = $offset;
        
        return Database::fetchAll($sql, $params);
    }

    public function getAsignacionConDetalles(int $id): ?array
    {
        $sql = "
            SELECT 
                a.*,
                v.placa,
                v.km as vehiculo_kilometraje,
                cv.nombre as clase_vehiculo,
                m.marca as marca_vehiculo,
                mo.modelo as modelo_vehiculo,
                c.cedula as chofer_cedula,
                c.nombre as chofer_nombre,
                c.apellido as chofer_apellido,
                c.licencia as chofer_licencia,
                c.telefono as chofer_telefono,
                DATEDIFF(COALESCE(a.fecha_devolucion, CURDATE()), a.fecha_asignacion) as dias_asignacion
            FROM {$this->table} a
            LEFT JOIN trmavehiculos v ON a.vehiculo = v.id
            LEFT JOIN trmaclase cv ON v.clase = cv.id
            LEFT JOIN trmamarca m ON v.marca = m.id
            LEFT JOIN trmamodelo mo ON v.modelo = mo.id
            LEFT JOIN trmachoferes c ON a.chofer = c.id
            WHERE a.id = ? AND a.eliminado = 0
        ";
        
        return Database::fetchOne($sql, [$id]);
    }

    public function getAsignacionesActivas(): array
    {
        $sql = "
            SELECT 
                a.*,
                v.placa,
                cv.nombre as clase_vehiculo,
                m.marca as marca_vehiculo,
                mo.modelo as modelo_vehiculo,
                c.cedula as chofer_cedula,
                c.nombre as chofer_nombre,
                c.apellido as chofer_apellido,
                DATEDIFF(CURDATE(), a.fecha_asignacion) as dias_transcurridos
            FROM {$this->table} a
            LEFT JOIN trmavehiculos v ON a.vehiculo = v.id
            LEFT JOIN trmaclase cv ON v.clase = cv.id
            LEFT JOIN trmamarca m ON v.marca = m.id
            LEFT JOIN trmamodelo mo ON v.modelo = mo.id
            LEFT JOIN trmachoferes c ON a.chofer = c.id
            WHERE a.fecha_devolucion IS NULL AND a.eliminado = 0
            ORDER BY a.fecha_asignacion DESC
        ";
        
        return Database::fetchAll($sql);
    }

    public function getAsignacionesPorVencer(int $dias = 7): array
    {
        $sql = "
            SELECT 
                a.*,
                v.placa,
                cv.nombre as clase_vehiculo,
                c.cedula as chofer_cedula,
                c.nombre as chofer_nombre,
                c.apellido as chofer_apellido,
                DATEDIFF(a.fecha_devolucion, CURDATE()) as dias_restantes
            FROM {$this->table} a
            LEFT JOIN trmavehiculos v ON a.vehiculo = v.id
            LEFT JOIN trmaclase cv ON v.clase = cv.id
            LEFT JOIN trmachoferes c ON a.chofer = c.id
            WHERE a.eliminado = 0
            AND a.fecha_devolucion IS NOT NULL
            AND a.fecha_devolucion <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
            ORDER BY a.fecha_devolucion ASC
        ";
        
        return Database::fetchAll($sql, [$dias]);
    }

    public function getEstadisticasAsignaciones(): array
    {
        $sql = "
            SELECT 
                CASE 
                    WHEN fecha_devolucion IS NULL THEN 'activa'
                    ELSE 'finalizada'
                END as estado,
                COUNT(*) as total
            FROM {$this->table}
            WHERE eliminado = 0
            GROUP BY CASE 
                WHEN fecha_devolucion IS NULL THEN 'activa'
                ELSE 'finalizada'
            END
        ";
        
        $estados = Database::fetchAll($sql);
        
        $sql = "
            SELECT 
                DATE_FORMAT(fecha_asignacion, '%Y-%m') as mes,
                COUNT(*) as total
            FROM {$this->table}
            WHERE eliminado = 0
            AND fecha_asignacion >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(fecha_asignacion, '%Y-%m')
            ORDER BY mes DESC
        ";
        
        $porMes = Database::fetchAll($sql);
        
        $sql = "
            SELECT 
                cv.nombre as clase_vehiculo,
                COUNT(*) as total
            FROM {$this->table} a
            LEFT JOIN trmavehiculos v ON a.vehiculo = v.id
            LEFT JOIN trmaclase cv ON v.clase = cv.id
            WHERE a.eliminado = 0
            GROUP BY v.clase, cv.nombre
            ORDER BY total DESC
        ";
        
        $porClase = Database::fetchAll($sql);
        
        return [
            'por_estado' => $estados,
            'por_mes' => $porMes,
            'por_clase' => $porClase
        ];
    }

    public function verificarDisponibilidadVehiculo(int $vehiculoId, string $fechaInicio, string $fechaFin, int $excludeAsignacionId = null): bool
    {
        $sql = "
            SELECT COUNT(*) as total
            FROM {$this->table}
            WHERE vehiculo = ?
            AND eliminado = 0
            AND (
                (fecha_asignacion <= ? AND (fecha_devolucion IS NULL OR fecha_devolucion >= ?))
                OR (fecha_asignacion <= ? AND (fecha_devolucion IS NULL OR fecha_devolucion >= ?))
            )
        ";
        
        $params = [$vehiculoId, $fechaInicio, $fechaInicio, $fechaFin, $fechaFin];
        
        if ($excludeAsignacionId) {
            $sql .= " AND id != ?";
            $params[] = $excludeAsignacionId;
        }
        
        $result = Database::fetchOne($sql, $params);
        return (int)$result['total'] === 0;
    }

    public function verificarDisponibilidadChofer(int $choferId, string $fechaInicio, string $fechaFin, int $excludeAsignacionId = null): bool
    {
        $sql = "
            SELECT COUNT(*) as total
            FROM {$this->table}
            WHERE chofer = ?
            AND eliminado = 0
            AND (
                (fecha_asignacion <= ? AND (fecha_devolucion IS NULL OR fecha_devolucion >= ?))
                OR (fecha_asignacion <= ? AND (fecha_devolucion IS NULL OR fecha_devolucion >= ?))
            )
        ";
        
        $params = [$choferId, $fechaInicio, $fechaInicio, $fechaFin, $fechaFin];
        
        if ($excludeAsignacionId) {
            $sql .= " AND id != ?";
            $params[] = $excludeAsignacionId;
        }
        
        $result = Database::fetchOne($sql, $params);
        return (int)$result['total'] === 0;
    }

    public function finalizarAsignacion(int $asignacionId, string $fechaDevolucion, string $observaciones = null): bool
    {
        $data = [
            'fecha_devolucion' => $fechaDevolucion
        ];
        
        if ($observaciones) {
            $data['observacion'] = $observaciones;
        }
        
        return $this->update($asignacionId, $data);
    }

    public function cancelarAsignacion(int $asignacionId, string $motivo): bool
    {
        $data = [
            'observacion' => $motivo
        ];
        
        return $this->update($asignacionId, $data);
    }

    public function getAsignacionesVencidas(): array
    {
        $sql = "
            SELECT 
                a.*,
                v.placa,
                c.cedula as chofer_cedula,
                c.nombre as chofer_nombre,
                c.apellido as chofer_apellido,
                DATEDIFF(CURDATE(), a.fecha_devolucion) as dias_vencida
            FROM {$this->table} a
            LEFT JOIN trmavehiculos v ON a.vehiculo = v.id
            LEFT JOIN trmachoferes c ON a.chofer = c.id
            WHERE a.eliminado = 0
            AND a.fecha_devolucion IS NOT NULL
            AND a.fecha_devolucion < CURDATE()
            ORDER BY a.fecha_devolucion ASC
        ";
        
        return Database::fetchAll($sql);
    }
}
