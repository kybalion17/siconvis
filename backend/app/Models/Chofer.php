<?php

namespace SAGAUT\Models;

use SAGAUT\Utils\Database;

class Chofer extends BaseModel
{
    protected string $table = 'trmachoferes';
    protected string $primaryKey = 'id';
    
    protected array $fillable = [
        'cedula',
        'nombre',
        'apellido',
        'fecha_nacimiento',
        'sexo',
        'telefono',
        'direccion',
        'email',
        'observaciones',
        'licencia',
        'fecha_lic_ven',
        'fecha_cer_ven',
        'eliminado'
    ];

    public function getChoferesConDetalles(array $filters = [], int $page = 1, int $perPage = 10): array
    {
        $offset = ($page - 1) * $perPage;
        
        $sql = "
            SELECT 
                c.*,
                s.nombre as sexo_nombre,
                l.nombre as licencia_nombre,
                (SELECT COUNT(*) FROM trdetasignar a WHERE a.chofer = c.id AND a.fecha_devolucion > CURDATE()) as asignaciones_activas,
                (SELECT COUNT(*) FROM trdetasignar a WHERE a.chofer = c.id AND a.eliminado = 0) as total_asignaciones
            FROM {$this->table} c
            LEFT JOIN trmasexo s ON c.sexo = s.id
            LEFT JOIN trmalicencia l ON c.licencia = l.id
            WHERE c.eliminado = 0
        ";
        
        $params = [];
        
        if (!empty($filters['estado'])) {
            $sql .= " AND c.estado = ?";
            $params[] = $filters['estado'];
        }
        
        if (!empty($filters['cedula'])) {
            $sql .= " AND c.cedula LIKE ?";
            $params[] = '%' . $filters['cedula'] . '%';
        }
        
        if (!empty($filters['nombre'])) {
            $sql .= " AND (c.nombre LIKE ? OR c.apellido LIKE ?)";
            $params[] = '%' . $filters['nombre'] . '%';
            $params[] = '%' . $filters['nombre'] . '%';
        }
        
        $sql .= " ORDER BY c.nombre, c.apellido LIMIT ? OFFSET ?";
        $params[] = $perPage;
        $params[] = $offset;
        
        return Database::fetchAll($sql, $params);
    }

    public function getChoferConDetalles(int $id): ?array
    {
        $sql = "
            SELECT 
                c.*,
                s.nombre as sexo_nombre,
                l.nombre as licencia_nombre,
                (SELECT COUNT(*) FROM trdetasignar a WHERE a.chofer = c.id AND a.fecha_devolucion > CURDATE()) as asignaciones_activas,
                (SELECT COUNT(*) FROM trdetasignar a WHERE a.chofer = c.id AND a.eliminado = 0) as total_asignaciones
            FROM {$this->table} c
            LEFT JOIN trmasexo s ON c.sexo = s.id
            LEFT JOIN trmalicencia l ON c.licencia = l.id
            WHERE c.id = ? AND c.eliminado = 0
        ";
        
        return Database::fetchOne($sql, [$id]);
    }

    public function getChoferesDisponibles(): array
    {
        $sql = "
            SELECT 
                c.id,
                c.cedula,
                c.nombre,
                c.apellido,
                c.licencia,
                c.fecha_lic_ven,
                s.nombre as sexo_nombre,
                l.nombre as licencia_nombre
            FROM {$this->table} c
            LEFT JOIN trmasexo s ON c.sexo = s.id
            LEFT JOIN trmalicencia l ON c.licencia = l.id
            WHERE c.eliminado = 0
            AND c.fecha_lic_ven > CURDATE()
            AND c.fecha_cer_ven > CURDATE()
            AND c.id NOT IN (
                SELECT chofer 
                FROM trdetasignar 
                WHERE fecha_devolucion > CURDATE() 
                AND eliminado = 0
            )
            ORDER BY c.nombre, c.apellido
        ";
        
        return Database::fetchAll($sql);
    }

    public function buscarPorCedula(string $cedula): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE cedula = ? AND eliminado = 0";
        return Database::fetchOne($sql, [$cedula]);
    }

    public function getEstadisticasChoferes(): array
    {
        $sql = "SELECT COUNT(*) as total FROM {$this->table} WHERE eliminado = 0";
        $total = Database::fetchOne($sql)['total'];
        
        $sql = "SELECT COUNT(*) as activos FROM {$this->table} WHERE eliminado = 0 AND fecha_lic_ven > CURDATE() AND fecha_cer_ven > CURDATE()";
        $activos = Database::fetchOne($sql)['activos'];
        
        $sql = "SELECT COUNT(*) as licencias_vencidas FROM {$this->table} WHERE eliminado = 0 AND fecha_lic_ven <= CURDATE()";
        $licenciasVencidas = Database::fetchOne($sql)['licencias_vencidas'];
        
        $sql = "SELECT COUNT(*) as certificados_vencidos FROM {$this->table} WHERE eliminado = 0 AND fecha_cer_ven <= CURDATE()";
        $certificadosVencidos = Database::fetchOne($sql)['certificados_vencidos'];
        
        return [
            'total' => (int)$total,
            'activos' => (int)$activos,
            'licencias_vencidas' => (int)$licenciasVencidas,
            'certificados_vencidos' => (int)$certificadosVencidos
        ];
    }

    public function getChoferesConLicenciasPorVencer(int $dias = 30): array
    {
        $sql = "
            SELECT 
                c.id,
                c.cedula,
                c.nombre,
                c.apellido,
                c.licencia,
                c.fecha_lic_ven,
                s.nombre as sexo_nombre,
                l.nombre as licencia_nombre,
                DATEDIFF(c.fecha_lic_ven, CURDATE()) as dias_restantes
            FROM {$this->table} c
            LEFT JOIN trmasexo s ON c.sexo = s.id
            LEFT JOIN trmalicencia l ON c.licencia = l.id
            WHERE c.eliminado = 0
            AND c.fecha_lic_ven IS NOT NULL
            AND c.fecha_lic_ven <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
            AND c.fecha_lic_ven > CURDATE()
            ORDER BY c.fecha_lic_ven ASC
        ";
        
        return Database::fetchAll($sql, [$dias]);
    }

    public function getChoferesConCertificadosPorVencer(int $dias = 30): array
    {
        $sql = "
            SELECT 
                c.id,
                c.cedula,
                c.nombre,
                c.apellido,
                c.fecha_cer_ven,
                s.nombre as sexo_nombre,
                l.nombre as licencia_nombre,
                DATEDIFF(c.fecha_cer_ven, CURDATE()) as dias_restantes
            FROM {$this->table} c
            LEFT JOIN trmasexo s ON c.sexo = s.id
            LEFT JOIN trmalicencia l ON c.licencia = l.id
            WHERE c.eliminado = 0
            AND c.fecha_cer_ven IS NOT NULL
            AND c.fecha_cer_ven <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
            AND c.fecha_cer_ven > CURDATE()
            ORDER BY c.fecha_cer_ven ASC
        ";
        
        return Database::fetchAll($sql, [$dias]);
    }

    public function getHistorialAsignaciones(int $choferId): array
    {
        $sql = "
            SELECT 
                a.*,
                v.placa,
                v.scarroceria,
                v.smotor,
                m.marca as marca_nombre,
                mo.modelo as modelo_nombre
            FROM trdetasignar a
            LEFT JOIN trmavehiculos v ON a.vehiculo = v.id
            LEFT JOIN trmamarca m ON v.marca = m.id
            LEFT JOIN trmamodelo mo ON v.modelo = mo.id
            WHERE a.chofer = ? AND a.eliminado = 0
            ORDER BY a.fecha_asignacion DESC
        ";
        
        return Database::fetchAll($sql, [$choferId]);
    }

    public function getAsignacionActual(int $choferId): ?array
    {
        $sql = "
            SELECT 
                a.*,
                v.placa,
                v.scarroceria,
                v.smotor,
                m.marca as marca_nombre,
                mo.modelo as modelo_nombre
            FROM trdetasignar a
            LEFT JOIN trmavehiculos v ON a.vehiculo = v.id
            LEFT JOIN trmamarca m ON v.marca = m.id
            LEFT JOIN trmamodelo mo ON v.modelo = mo.id
            WHERE a.chofer = ? 
            AND a.fecha_devolucion > CURDATE() 
            AND a.eliminado = 0
            ORDER BY a.fecha_asignacion DESC
            LIMIT 1
        ";
        
        return Database::fetchOne($sql, [$choferId]);
    }

    public function validarLicencia(int $choferId): array
    {
        $chofer = $this->find($choferId);
        
        if (!$chofer) {
            return ['valida' => false, 'mensaje' => 'Chofer no encontrado'];
        }

        if (!$chofer['licencia'] || !$chofer['fecha_lic_ven']) {
            return ['valida' => false, 'mensaje' => 'No tiene licencia registrada'];
        }

        $fechaVencimiento = new \DateTime($chofer['fecha_lic_ven']);
        $hoy = new \DateTime();
        
        if ($fechaVencimiento < $hoy) {
            return ['valida' => false, 'mensaje' => 'Licencia vencida'];
        }

        $diasRestantes = $hoy->diff($fechaVencimiento)->days;
        
        if ($diasRestantes <= 30) {
            return ['valida' => true, 'mensaje' => "Licencia vence en {$diasRestantes} días", 'advertencia' => true];
        }

        return ['valida' => true, 'mensaje' => 'Licencia vigente'];
    }
}
