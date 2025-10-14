<?php

namespace SAGAUT\Models;

use SAGAUT\Utils\Database;

class Vehiculo extends BaseModel
{
    protected string $table = 'trmavehiculos';
    protected string $primaryKey = 'id';
    
    protected array $fillable = [
        'clase',
        'marca',
        'modelo',
        'anio',
        'colorp',
        'colors',
        'transmision',
        'placa',
        'scarroceria',
        'smotor',
        'km',
        'peso',
        'unidadpeso',
        'asientos',
        'combustible',
        'npuestos',
        'observacion',
        'estado',
        'fecha_registro',
        'eliminado'
    ];

    public function getVehiculosConDetalles(array $filters = [], int $page = 1, int $perPage = 10): array
    {
        $offset = ($page - 1) * $perPage;
        
        $sql = "
            SELECT 
                v.*,
                cv.nombre as clase_nombre,
                m.nombre as marca_nombre,
                mo.nombre as modelo_nombre,
                c1.nombre as color_principal_nombre,
                c2.nombre as color_secundario_nombre,
                tc.nombre as combustible_nombre,
                tt.nombre as transmision_nombre
            FROM {$this->table} v
            LEFT JOIN trmaclase cv ON v.clase = cv.id
            LEFT JOIN trmamarca m ON v.marca = m.id
            LEFT JOIN trmamodelo mo ON v.modelo = mo.id
            LEFT JOIN trmacolor c1 ON v.colorp = c1.id
            LEFT JOIN trmacolor c2 ON v.colors = c2.id
            LEFT JOIN trmacombustible tc ON v.combustible = tc.id
            LEFT JOIN trmatransmision tt ON v.transmision = tt.id
            WHERE v.eliminado = 0
        ";
        
        $params = [];
        
        if (!empty($filters['estado'])) {
            $sql .= " AND v.estado = ?";
            $params[] = $filters['estado'];
        }
        
        if (!empty($filters['marca'])) {
            $sql .= " AND v.marca = ?";
            $params[] = $filters['marca'];
        }
        
        if (!empty($filters['clase'])) {
            $sql .= " AND v.clase = ?";
            $params[] = $filters['clase'];
        }
        
        if (!empty($filters['placa'])) {
            $sql .= " AND v.placa LIKE ?";
            $params[] = '%' . $filters['placa'] . '%';
        }
        
        $sql .= " ORDER BY v.created_at DESC LIMIT ? OFFSET ?";
        $params[] = $perPage;
        $params[] = $offset;
        
        return Database::fetchAll($sql, $params);
    }

    public function getVehiculoConDetalles(int $id): ?array
    {
        $sql = "
            SELECT 
                v.*,
                cv.nombre as clase_nombre,
                m.nombre as marca_nombre,
                mo.nombre as modelo_nombre,
                c1.nombre as color_principal_nombre,
                c2.nombre as color_secundario_nombre,
                tc.nombre as combustible_nombre,
                tt.nombre as transmision_nombre
            FROM {$this->table} v
            LEFT JOIN trmaclase cv ON v.clase = cv.id
            LEFT JOIN trmamarca m ON v.marca = m.id
            LEFT JOIN trmamodelo mo ON v.modelo = mo.id
            LEFT JOIN trmacolor c1 ON v.colorp = c1.id
            LEFT JOIN trmacolor c2 ON v.colors = c2.id
            LEFT JOIN trmacombustible tc ON v.combustible = tc.id
            LEFT JOIN trmatransmision tt ON v.transmision = tt.id
            WHERE v.id = ? AND v.eliminado = 0
        ";
        
        return Database::fetchOne($sql, [$id]);
    }

    public function getVehiculosDisponibles(): array
    {
        $sql = "
            SELECT 
                v.id,
                v.placa,
                cv.nombre as clase_nombre,
                m.nombre as marca_nombre,
                mo.nombre as modelo_nombre,
                v.anio
            FROM {$this->table} v
            LEFT JOIN trmaclase cv ON v.clase = cv.id
            LEFT JOIN trmamarca m ON v.marca = m.id
            LEFT JOIN trmamodelo mo ON v.modelo = mo.id
            WHERE v.eliminado = 0
            AND v.id NOT IN (
                SELECT id_vehiculo 
                FROM trdetasignar 
                WHERE fecha_devolucion IS NULL 
                AND eliminado = 0
            )
            ORDER BY v.placa
        ";
        
        return Database::fetchAll($sql);
    }

    public function getEstadisticasVehiculos(): array
    {
        $sql = "
            SELECT 
                'activo' as estado,
                COUNT(*) as total
            FROM {$this->table}
            WHERE eliminado = 0
        ";
        
        $activos = Database::fetchOne($sql);
        
        $sql = "
            SELECT 
                cv.nombre as clase,
                COUNT(*) as total
            FROM {$this->table} v
            LEFT JOIN trmaclase cv ON v.clase = cv.id
            WHERE v.eliminado = 0
            GROUP BY v.clase, cv.nombre
            ORDER BY total DESC
        ";
        
        $clases = Database::fetchAll($sql);
        
        return [
            'por_estado' => [$activos],
            'por_clase' => $clases
        ];
    }

    public function getVehiculosPorVencerMantenimiento(int $dias = 30): array
    {
        $sql = "
            SELECT 
                v.id,
                v.placa,
                cv.nombre as clase_nombre,
                m.nombre as marca_nombre,
                mo.nombre as modelo_nombre,
                v.km as kilometraje
            FROM {$this->table} v
            LEFT JOIN trmaclase cv ON v.clase = cv.id
            LEFT JOIN trmamarca m ON v.marca = m.id
            LEFT JOIN trmamodelo mo ON v.modelo = mo.id
            WHERE v.eliminado = 0
            ORDER BY v.km ASC
        ";
        
        return Database::fetchAll($sql);
    }

    public function buscarPorPlaca(string $placa): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE placa = ? AND eliminado = 0";
        return Database::fetchOne($sql, [$placa]);
    }

    public function getHistorialMantenimientos(int $vehiculoId): array
    {
        $sql = "
            SELECT 
                m.*,
                tm.nombre as tipo_mantenimiento_nombre,
                t.nombre as taller_nombre
            FROM trdetmantenimiento m
            LEFT JOIN trmatipo_mantenimiento tm ON m.tipo_mantenimiento = tm.id
            LEFT JOIN trmatalleres t ON m.taller = t.id
            WHERE m.id_vehiculo = ? AND m.eliminado = 0
            ORDER BY m.fecha_mantenimiento DESC
        ";
        
        return Database::fetchAll($sql, [$vehiculoId]);
    }

    public function getHistorialAsignaciones(int $vehiculoId): array
    {
        $sql = "
            SELECT 
                a.*,
                c.nombre as chofer_nombre,
                c.apellido as chofer_apellido
            FROM trdetasignar a
            LEFT JOIN trmachoferes c ON a.chofer = c.id
            WHERE a.id_vehiculo = ? AND a.eliminado = 0
            ORDER BY a.fecha_asignacion DESC
        ";
        
        return Database::fetchAll($sql, [$vehiculoId]);
    }
}
