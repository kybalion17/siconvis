<?php

namespace SAGAUT\Models;

use SAGAUT\Utils\Database;

class Visita extends BaseModel
{
    protected string $table = 'trdetvisitas';
    protected string $primaryKey = 'id';
    
    protected array $fillable = [
        'visitante_id', 'departamento_id', 'motivo_visita', 'fecha_entrada', 'fecha_salida', 'estado', 'observaciones', 'eliminado'
    ];
    
    protected array $hidden = [];
    
    /**
     * Crear nueva visita con fecha_entrada automática
     */
    public function create(array $data): int
    {
        // Si fecha_entrada es null, usar NOW() de MySQL
        if (isset($data['fecha_entrada']) && $data['fecha_entrada'] === null) {
            unset($data['fecha_entrada']); // Remover del array para que se use el valor por defecto
        }
        
        $data = $this->filterFillable($data);
        $data = $this->addTimestamps($data, 'create');

        $fields = array_keys($data);
        $placeholders = array_fill(0, count($fields), '?');
        
        // Si fecha_entrada no está en los datos, agregarlo con NOW()
        if (!in_array('fecha_entrada', $fields)) {
            $fields[] = 'fecha_entrada';
            $placeholders[] = 'NOW()';
        }
        
        $sql = "INSERT INTO {$this->table} (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")";
        
        Database::query($sql, array_values($data));
        return (int) Database::lastInsertId();
    }

    /**
     * Obtener visitas con detalles completos (con paginación)
     */
    public function getVisitasConDetalles(int $page = 1, int $perPage = 10, array $filters = []): array
    {
        $offset = ($page - 1) * $perPage;
        $params = [];
        $where = "1=1";

        if (!empty($filters['search'])) {
            $search = '%' . $filters['search'] . '%';
            $where .= " AND (vis.nombre LIKE :search OR vis.apellido LIKE :search OR vis.cedula LIKE :search OR d.nombre LIKE :search OR v.motivo_visita LIKE :search)";
            $params[':search'] = $search;
        }
        
        if (!empty($filters['departamento_id'])) {
            $where .= " AND v.departamento_id = :departamento_id";
            $params[':departamento_id'] = $filters['departamento_id'];
        }

        // Contar total
        $countSql = "SELECT COUNT(*) FROM trdetvisitas v 
                     LEFT JOIN trmavisitantes vis ON v.visitante_id = vis.id
                     LEFT JOIN trmadepartamentos d ON v.departamento_id = d.id
                     WHERE {$where}";
        $total = Database::fetchOne($countSql, $params)['COUNT(*)'];

        // Obtener datos
        $sql = "SELECT v.*, 
                       vis.nombre as visitante_nombre, 
                       vis.apellido as visitante_apellido, 
                       vis.cedula as visitante_cedula,
                       d.nombre as departamento_nombre
                FROM trdetvisitas v
                LEFT JOIN trmavisitantes vis ON v.visitante_id = vis.id
                LEFT JOIN trmadepartamentos d ON v.departamento_id = d.id
                WHERE {$where}
                ORDER BY v.created_at DESC
                LIMIT :limit OFFSET :offset";

        $params[':limit'] = $perPage;
        $params[':offset'] = $offset;

        $data = Database::fetchAll($sql, $params);

        return [
            'data' => $data,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => ceil($total / $perPage),
                'has_next' => $page < ceil($total / $perPage),
                'has_prev' => $page > 1
            ]
        ];
    }

    /**
     * Obtener visitas activas (simplificado para trmavisitantes_relationship)
     */
    public function getVisitasActivas(): array
    {
        $sql = "SELECT vr.*, 
                       vis.nombre as visitante_nombre, 
                       vis.apellido as visitante_apellido, 
                       vis.cedula as visitante_cedula,
                       d.nombre as departamento_nombre
                FROM trmavisitantes_relationship vr
                LEFT JOIN trmavisitantes vis ON vr.visitantes_id = vis.id
                LEFT JOIN trmadepartamentos d ON vr.departamentos_id = d.id
                ORDER BY vr.created_at DESC";
        
        return Database::fetchAll($sql);
    }

    /**
     * Obtener visitas del día (simplificado para trmavisitantes_relationship)
     */
    public function getVisitasHoy(): array
    {
        $sql = "SELECT vr.*, 
                       vis.nombre as visitante_nombre, 
                       vis.apellido as visitante_apellido, 
                       vis.cedula as visitante_cedula,
                       d.nombre as departamento_nombre
                FROM trmavisitantes_relationship vr
                LEFT JOIN trmavisitantes vis ON vr.visitantes_id = vis.id
                LEFT JOIN trmadepartamentos d ON vr.departamentos_id = d.id
                WHERE DATE(vr.created_at) = CURDATE()
                ORDER BY vr.created_at DESC";
        
        return Database::fetchAll($sql);
    }

    /**
     * Obtener estadísticas de visitas (simplificado para trmavisitantes_relationship)
     */
    public function getStats(): array
    {
        $sql = "SELECT 
                    COUNT(*) as total_visitas,
                    SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as visitas_hoy
                FROM trmavisitantes_relationship";
        
        $result = Database::fetchOne($sql);
        
        return [
            'total_visitas' => (int)$result['total_visitas'],
            'visitas_activas' => 0, // No aplicable en este esquema
            'visitas_finalizadas' => 0, // No aplicable en este esquema
            'visitas_canceladas' => 0, // No aplicable en este esquema
            'visitas_hoy' => (int)$result['visitas_hoy']
        ];
    }

    /**
     * Finalizar visita activa
     */
    public function finalizarVisita(int $id, string $observaciones = null): bool
    {
        try {
            $sql = "UPDATE {$this->table} SET estado = 'finalizada', fecha_salida = NOW()";
            
            if ($observaciones) {
                $sql .= ", observaciones = ?";
                $params = [$observaciones, $id];
            } else {
                $params = [$id];
            }
            
            $sql .= " WHERE id = ? AND estado = 'activa' AND eliminado = 0";
            
            Database::query($sql, $params);
            
            return Database::rowCount() > 0;
        } catch (\Exception $e) {
            error_log('Error al finalizar visita: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Cancelar visita (no aplicable en trmavisitantes_relationship)
     */
    public function cancelarVisita(int $id, string $observaciones = null): bool
    {
        // No aplicable en este esquema simplificado
        return true;
    }

    /**
     * Validar datos antes de crear/actualizar
     */
    public function validate(array $data): array
    {
        $errors = [];

        if (empty($data['visitante_id'])) {
            $errors['visitante_id'][] = 'El visitante es requerido';
        }

        if (empty($data['departamento_id'])) {
            $errors['departamento_id'][] = 'El departamento es requerido';
        }

        if (empty($data['motivo_visita'])) {
            $errors['motivo_visita'][] = 'El motivo de la visita es requerido';
        }

        return $errors;
    }

    /**
     * Verificar si un visitante tiene una visita activa
     */
    public function visitanteTieneVisitaActiva(int $visitanteId): bool
    {
        $sql = "SELECT COUNT(*) FROM trdetvisitas WHERE visitante_id = ? AND estado = 'activa' AND eliminado = 0";
        $result = Database::fetchOne($sql, [$visitanteId]);
        return $result['COUNT(*)'] > 0;
    }

    /**
     * Obtener visita activa de un visitante
     */
    public function getVisitaActivaDelVisitante(int $visitanteId): ?array
    {
        $sql = "SELECT * FROM trdetvisitas WHERE visitante_id = ? AND estado = 'activa' AND eliminado = 0 LIMIT 1";
        return Database::fetchOne($sql, [$visitanteId]);
    }
}
