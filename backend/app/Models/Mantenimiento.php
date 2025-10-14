<?php

namespace SAGAUT\Models;

use SAGAUT\Utils\Database;

class Mantenimiento extends BaseModel
{
    protected string $table = 'trdetmantenimiento';
    protected string $primaryKey = 'id';
    
    protected array $fillable = [
        'vehiculo',
        'tipo_mantenimiento',
        'taller',
        'km',
        'orden_trabajo',
        'fecha_programada',
        'inspector_cedula',
        'inspector_nombre',
        'monto',
        'descripcion_trabajo',
        'estado',
        'eliminado'
    ];

    public function getMantenimientosConDetalles(array $filters = [], int $page = 1, int $perPage = 10): array
    {
        $offset = ($page - 1) * $perPage;
        
        $sql = "
            SELECT 
                m.*,
                DATEDIFF(CURDATE(), m.fecha_programada) as dias_transcurridos
            FROM {$this->table} m
            WHERE m.eliminado = 0
        ";
        
        $params = [];
        
        if (!empty($filters['estado'])) {
            $sql .= " AND m.estado = ?";
            $params[] = $filters['estado'];
        }
        
        if (!empty($filters['vehiculo'])) {
            $sql .= " AND m.vehiculo = ?";
            $params[] = $filters['vehiculo'];
        }
        
        if (!empty($filters['tipo_mantenimiento'])) {
            $sql .= " AND m.tipo_mantenimiento = ?";
            $params[] = $filters['tipo_mantenimiento'];
        }
        
        if (!empty($filters['taller'])) {
            $sql .= " AND m.taller = ?";
            $params[] = $filters['taller'];
        }
        
        if (!empty($filters['fecha_desde'])) {
            $sql .= " AND m.fecha_programada >= ?";
            $params[] = $filters['fecha_desde'];
        }
        
        if (!empty($filters['fecha_hasta'])) {
            $sql .= " AND m.fecha_programada <= ?";
            $params[] = $filters['fecha_hasta'];
        }
        
        $sql .= " ORDER BY m.fecha_programada DESC LIMIT ? OFFSET ?";
        $params[] = $perPage;
        $params[] = $offset;
        
        return Database::fetchAll($sql, $params);
    }

    public function getMantenimientoConDetalles(int $id): ?array
    {
        $sql = "
            SELECT 
                m.*,
                DATEDIFF(CURDATE(), m.fecha_programada) as dias_transcurridos
            FROM {$this->table} m
            WHERE m.id = ? AND m.eliminado = 0
        ";
        
        return Database::fetchOne($sql, [$id]);
    }

    public function getMantenimientosPendientes(): array
    {
        $sql = "
            SELECT 
                m.*,
                DATEDIFF(m.fecha_programada, CURDATE()) as dias_restantes
            FROM {$this->table} m
            WHERE m.estado IN ('programado', 'en_proceso')
            AND m.eliminado = 0
            ORDER BY m.fecha_programada ASC
        ";
        
        return Database::fetchAll($sql);
    }

    public function getMantenimientosPorVencer(int $dias = 7): array
    {
        $sql = "
            SELECT 
                m.*,
                DATEDIFF(m.fecha_programada, CURDATE()) as dias_restantes
            FROM {$this->table} m
            WHERE m.estado = 'programado'
            AND m.eliminado = 0
            AND m.fecha_programada <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
            ORDER BY m.fecha_programada ASC
        ";
        
        return Database::fetchAll($sql, [$dias]);
    }

    public function getMantenimientosVencidos(): array
    {
        $sql = "
            SELECT 
                m.*,
                DATEDIFF(CURDATE(), m.fecha_programada) as dias_vencido
            FROM {$this->table} m
            WHERE m.estado = 'programado'
            AND m.eliminado = 0
            AND m.fecha_programada < CURDATE()
            ORDER BY m.fecha_programada ASC
        ";
        
        return Database::fetchAll($sql);
    }

    public function getEstadisticasMantenimientos(): array
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
                m.tipo_mantenimiento,
                COUNT(*) as total,
                AVG(m.monto) as costo_promedio
            FROM {$this->table} m
            WHERE m.eliminado = 0
            GROUP BY m.tipo_mantenimiento
            ORDER BY total DESC
        ";
        
        $porTipo = Database::fetchAll($sql);
        
        $sql = "
            SELECT 
                DATE_FORMAT(fecha_programada, '%Y-%m') as mes,
                COUNT(*) as total,
                SUM(monto) as costo_total
            FROM {$this->table}
            WHERE eliminado = 0
            AND fecha_programada >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(fecha_programada, '%Y-%m')
            ORDER BY mes DESC
        ";
        
        $porMes = Database::fetchAll($sql);
        
        return [
            'por_estado' => $estados,
            'por_tipo' => $porTipo,
            'por_mes' => $porMes
        ];
    }

    public function getMantenimientosPorVehiculo(int $vehiculoId, int $limit = 10): array
    {
        $sql = "
            SELECT 
                m.*,
                DATEDIFF(CURDATE(), m.fecha_programada) as dias_transcurridos
            FROM {$this->table} m
            WHERE m.vehiculo = ? AND m.eliminado = 0
            ORDER BY m.fecha_programada DESC
            LIMIT ?
        ";
        
        return Database::fetchAll($sql, [$vehiculoId, $limit]);
    }

    public function getProximosMantenimientos(int $vehiculoId): array
    {
        // Simplificado: devolver últimos registros programados para el vehículo
        $sql = "
            SELECT 
                m.*
            FROM {$this->table} m
            WHERE m.vehiculo = ? AND m.eliminado = 0
            ORDER BY m.fecha_programada DESC
            LIMIT 5
        ";
        
        return Database::fetchAll($sql, [$vehiculoId]);
    }

    public function programarMantenimiento(int $vehiculoId, int $tipoMantenimientoId, string $fechaProgramada, int $tallerId = null, string $observaciones = null): int
    {
        // Obtener km actual del vehículo según esquema sagaut
        $vehiculo = Database::fetchOne("SELECT km FROM trmavehiculos WHERE id = ?", [$vehiculoId]);
        $kilometrajeActual = $vehiculo ? (int)$vehiculo['km'] : 0;

        $data = [
            'vehiculo' => $vehiculoId,
            'tipo_mantenimiento' => $tipoMantenimientoId,
            'taller' => $tallerId,
            'km' => $kilometrajeActual,
            'fecha_programada' => $fechaProgramada,
            'descripcion_trabajo' => $observaciones,
            'estado' => 'programado'
        ];

        return $this->create($data);
    }

    public function iniciarMantenimiento(int $mantenimientoId, string $ordenTrabajo = null, string $inspectorCedula = null, string $inspectorNombre = null): bool
    {
        $data = [
            'estado' => 'en_proceso',
            'orden_trabajo' => $ordenTrabajo,
            'inspector_cedula' => $inspectorCedula,
            'inspector_nombre' => $inspectorNombre
        ];

        return $this->update($mantenimientoId, $data);
    }

    public function completarMantenimiento(int $mantenimientoId, float $costo, string $descripcionTrabajo = null): bool
    {
        $data = [
            'estado' => 'completado',
            'monto' => $costo,
            'descripcion_trabajo' => $descripcionTrabajo
        ];

        return $this->update($mantenimientoId, $data);
    }

    public function cancelarMantenimiento(int $mantenimientoId, string $motivo = null): bool
    {
        $data = [
            'estado' => 'cancelado',
            'descripcion_trabajo' => $motivo
        ];

        return $this->update($mantenimientoId, $data);
    }

    public function getCostoTotalMantenimientos(int $vehiculoId, string $fechaInicio = null, string $fechaFin = null): float
    {
        $sql = "
            SELECT SUM(monto) as total
            FROM {$this->table}
            WHERE vehiculo = ? AND eliminado = 0 AND monto IS NOT NULL
        ";
        
        $params = [$vehiculoId];
        
        if ($fechaInicio) {
            $sql .= " AND fecha_programada >= ?";
            $params[] = $fechaInicio;
        }
        
        if ($fechaFin) {
            $sql .= " AND fecha_programada <= ?";
            $params[] = $fechaFin;
        }
        
        $result = Database::fetchOne($sql, $params);
        return (float)($result['total'] ?? 0);
    }
}
