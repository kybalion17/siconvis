<?php

namespace SAGAUT\Models;

use SAGAUT\Utils\Database;

class Seguro extends BaseModel
{
    protected string $table = 'trdetpoliza';
    protected string $primaryKey = 'id';
    
    protected array $fillable = [
        'vehiculo',
        'aseguradora',
        'numero_poliza',
        'fecha_inicio',
        'fecha_vencimiento',
        'prima',
        'estado',
        'eliminado'
    ];

    public function getSegurosConDetalles(array $filters = [], int $page = 1, int $perPage = 10): array
    {
        $offset = ($page - 1) * $perPage;
        
        $sql = "
            SELECT 
                s.*,
                DATEDIFF(s.fecha_vencimiento, CURDATE()) as dias_restantes,
                CASE 
                    WHEN s.fecha_vencimiento < CURDATE() THEN 'vencido'
                    WHEN s.fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'por_vencer'
                    ELSE 'vigente'
                END as estado_vencimiento
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
        
        if (!empty($filters['aseguradora'])) {
            $sql .= " AND s.aseguradora = ?";
            $params[] = $filters['aseguradora'];
        }
        
        if (!empty($filters['estado_vencimiento'])) {
            switch ($filters['estado_vencimiento']) {
                case 'vencido':
                    $sql .= " AND s.fecha_vencimiento < CURDATE()";
                    break;
                case 'por_vencer':
                    $sql .= " AND s.fecha_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)";
                    break;
                case 'vigente':
                    $sql .= " AND s.fecha_vencimiento > DATE_ADD(CURDATE(), INTERVAL 30 DAY)";
                    break;
            }
        }
        
        if (!empty($filters['fecha_desde'])) {
            $sql .= " AND s.fecha_inicio >= ?";
            $params[] = $filters['fecha_desde'];
        }
        
        if (!empty($filters['fecha_hasta'])) {
            $sql .= " AND s.fecha_vencimiento <= ?";
            $params[] = $filters['fecha_hasta'];
        }
        
        $sql .= " ORDER BY s.fecha_vencimiento ASC LIMIT ? OFFSET ?";
        $params[] = $perPage;
        $params[] = $offset;
        
        return Database::fetchAll($sql, $params);
    }

    public function getSeguroConDetalles(int $id): ?array
    {
        $sql = "
            SELECT 
                s.*,
                DATEDIFF(s.fecha_vencimiento, CURDATE()) as dias_restantes,
                CASE 
                    WHEN s.fecha_vencimiento < CURDATE() THEN 'vencido'
                    WHEN s.fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'por_vencer'
                    ELSE 'vigente'
                END as estado_vencimiento
            FROM {$this->table} s
            WHERE s.id = ? AND s.eliminado = 0
        ";
        
        return Database::fetchOne($sql, [$id]);
    }

    public function getSegurosPorVencer(int $dias = 30): array
    {
        $sql = "
            SELECT 
                s.*,
                DATEDIFF(s.fecha_vencimiento, CURDATE()) as dias_restantes
            FROM {$this->table} s
            WHERE s.estado = 'activo'
            AND s.eliminado = 0
            AND s.fecha_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
            ORDER BY s.fecha_vencimiento ASC
        ";
        
        return Database::fetchAll($sql, [$dias]);
    }

    public function getSegurosVencidos(): array
    {
        $sql = "
            SELECT 
                s.*,
                DATEDIFF(CURDATE(), s.fecha_vencimiento) as dias_vencido
            FROM {$this->table} s
            WHERE s.estado = 'activo'
            AND s.eliminado = 0
            AND s.fecha_vencimiento < CURDATE()
            ORDER BY s.fecha_vencimiento ASC
        ";
        
        return Database::fetchAll($sql);
    }

    public function getEstadisticasSeguros(): array
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
                s.aseguradora as aseguradora_id,
                COUNT(*) as total,
                AVG(s.prima) as prima_promedio
            FROM {$this->table} s
            WHERE s.eliminado = 0
            GROUP BY s.aseguradora
            ORDER BY total DESC
        ";
        
        $porAseguradora = Database::fetchAll($sql);
        
        $sql = "
            SELECT 
                DATE_FORMAT(fecha_inicio, '%Y-%m') as mes,
                COUNT(*) as total,
                SUM(prima) as prima_total
            FROM {$this->table}
            WHERE eliminado = 0
            AND fecha_inicio >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(fecha_inicio, '%Y-%m')
            ORDER BY mes DESC
        ";
        
        $porMes = Database::fetchAll($sql);
        
        return [
            'por_estado' => $estados,
            'por_aseguradora' => $porAseguradora,
            'por_mes' => $porMes
        ];
    }

    public function getSegurosPorVehiculo(int $vehiculoId): array
    {
        $sql = "
            SELECT 
                s.*,
                DATEDIFF(s.fecha_vencimiento, CURDATE()) as dias_restantes,
                CASE 
                    WHEN s.fecha_vencimiento < CURDATE() THEN 'vencido'
                    WHEN s.fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'por_vencer'
                    ELSE 'vigente'
                END as estado_vencimiento
            FROM {$this->table} s
            WHERE s.vehiculo = ? AND s.eliminado = 0
            ORDER BY s.fecha_inicio DESC
        ";
        
        return Database::fetchAll($sql, [$vehiculoId]);
    }

    public function getSeguroActivo(int $vehiculoId): ?array
    {
        $sql = "
            SELECT 
                s.*,
                DATEDIFF(s.fecha_vencimiento, CURDATE()) as dias_restantes
            FROM {$this->table} s
            WHERE s.vehiculo = ? 
            AND s.estado = 'activo' 
            AND s.eliminado = 0
            ORDER BY s.fecha_inicio DESC
            LIMIT 1
        ";
        
        return Database::fetchOne($sql, [$vehiculoId]);
    }

    public function renovarSeguro(int $seguroId, string $nuevaFechaInicio, string $nuevaFechaVencimiento, float $nuevaPrima = null): int
    {
        // Obtener datos del seguro actual
        $seguroActual = $this->find($seguroId);
        if (!$seguroActual) {
            return 0;
        }

        // Crear nuevo seguro basado en el actual
        $data = [
            'vehiculo' => $seguroActual['vehiculo'],
            'aseguradora' => $seguroActual['aseguradora'],
            'numero_poliza' => $seguroActual['numero_poliza'] . '-R', // Agregar sufijo de renovación
            'fecha_inicio' => $nuevaFechaInicio,
            'fecha_vencimiento' => $nuevaFechaVencimiento,
            'prima' => $nuevaPrima ?? $seguroActual['prima'],
            'estado' => 'activo'
        ];

        // Marcar el seguro actual como vencido
        $this->update($seguroId, ['estado' => 'vencido']);

        // Crear el nuevo seguro
        return $this->create($data);
    }

    public function getCostoTotalSeguros(int $vehiculoId, string $fechaInicio = null, string $fechaFin = null): float
    {
        $sql = "
            SELECT SUM(prima) as total
            FROM {$this->table}
            WHERE vehiculo = ? AND eliminado = 0 AND prima IS NOT NULL
        ";
        
        $params = [$vehiculoId];
        
        if ($fechaInicio) {
            $sql .= " AND fecha_inicio >= ?";
            $params[] = $fechaInicio;
        }
        
        if ($fechaFin) {
            $sql .= " AND fecha_vencimiento <= ?";
            $params[] = $fechaFin;
        }
        
        $result = Database::fetchOne($sql, $params);
        return (float)($result['total'] ?? 0);
    }

    public function buscarPorNumeroPoliza(string $numeroPoliza): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE numero_poliza = ? AND eliminado = 0";
        return Database::fetchOne($sql, [$numeroPoliza]);
    }

    public function getAlertasVencimiento(): array
    {
        $sql = "
            SELECT 
                s.*,
                DATEDIFF(s.fecha_vencimiento, CURDATE()) as dias_restantes
            FROM {$this->table} s
            WHERE s.estado = 'activo'
            AND s.eliminado = 0
            AND s.fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 60 DAY)
            ORDER BY s.fecha_vencimiento ASC
        ";
        
        return Database::fetchAll($sql);
    }
}
