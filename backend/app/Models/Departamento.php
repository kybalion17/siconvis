<?php

namespace SAGAUT\Models;

use SAGAUT\Utils\Database;

class Departamento extends BaseModel
{
    protected string $table = 'trmadepartamentos';
    protected string $primaryKey = 'id';
    
    protected array $fillable = [
        'nombre',
        'responsable',
        'telefono_primario',
        'telefono_secundario',
        'status',
        'eliminado'
    ];
    
    protected array $hidden = [];
    
    protected array $timestamps = ['created_at', 'updated_at'];

    /**
     * Obtener todos los departamentos activos
     */
    public function findAllActivos(): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE status = 1 AND eliminado = 0 ORDER BY nombre ASC";
        $departamentos = Database::fetchAll($sql);
        return array_map([$this, 'castTypes'], $departamentos);
    }

    /**
     * Sobrescribir el método find para convertir tipos
     */
    public function find(int $id): ?array
    {
        $departamento = parent::find($id);
        return $departamento ? $this->castTypes($departamento) : null;
    }

    /**
     * Convertir tipos de datos después de recuperar de la base de datos
     */
    private function castTypes(array $departamento): array
    {
        if (isset($departamento['status'])) {
            $departamento['status'] = (int) $departamento['status'];
        }
        if (isset($departamento['eliminado'])) {
            $departamento['eliminado'] = (int) $departamento['eliminado'];
        }
        return $departamento;
    }

    /**
     * Obtener departamentos con paginación
     */
    public function findAllWithPagination(int $page = 1, int $perPage = 10, array $filters = []): array
    {
        $offset = ($page - 1) * $perPage;
        
        // Aplicar filtros
        if (!empty($filters['search'])) {
            $search = '%' . $filters['search'] . '%';
            $sql = "SELECT * FROM {$this->table} 
                    WHERE eliminado = 0 
                    AND (nombre LIKE ? OR responsable LIKE ?)
                    ORDER BY nombre ASC 
                    LIMIT {$perPage} OFFSET {$offset}";
            $params = [$search, $search];
        } else {
            $sql = "SELECT * FROM {$this->table} WHERE eliminado = 0 ORDER BY nombre ASC LIMIT {$perPage} OFFSET {$offset}";
            $params = [];
        }

        $departamentos = Database::fetchAll($sql, $params);
        
        // Convertir tipos de datos
        $departamentos = array_map([$this, 'castTypes'], $departamentos);
        
        // Contar total para paginación
        if (!empty($filters['search'])) {
            $countSql = "SELECT COUNT(*) as total FROM {$this->table} 
                        WHERE eliminado = 0 
                        AND (nombre LIKE ? OR responsable LIKE ?)";
            $countParams = [$search, $search];
        } else {
            $countSql = "SELECT COUNT(*) as total FROM {$this->table} WHERE eliminado = 0";
            $countParams = [];
        }
        
        $totalResult = Database::fetchOne($countSql, $countParams);
        $total = (int) $totalResult['total'];

        return [
            'data' => $departamentos,
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
     * Activar departamento
     */
    public function activar(int $id): bool
    {
        return $this->update($id, ['status' => 1]);
    }

    /**
     * Desactivar departamento
     */
    public function desactivar(int $id): bool
    {
        return $this->update($id, ['status' => 0]);
    }

    /**
     * Obtener estadísticas de departamentos
     */
    public function getStats(): array
    {
        $totalSql = "SELECT COUNT(*) as total FROM {$this->table} WHERE eliminado = 0";
        $activosSql = "SELECT COUNT(*) as total FROM {$this->table} WHERE status = 1 AND eliminado = 0";
        $inactivosSql = "SELECT COUNT(*) as total FROM {$this->table} WHERE status = 0 AND eliminado = 0";

        $total = Database::fetchOne($totalSql)['total'];
        $activos = Database::fetchOne($activosSql)['total'];
        $inactivos = Database::fetchOne($inactivosSql)['total'];

        return [
            'total_departamentos' => (int) $total,
            'departamentos_activos' => (int) $activos,
            'departamentos_inactivos' => (int) $inactivos
        ];
    }

    /**
     * Obtener departamentos más visitados
     */
    public function getMasVisitados(int $limit = 5): array
    {
        $sql = "SELECT d.id, d.nombre, d.responsable, COUNT(v.id) as total_visitas
                FROM {$this->table} d
                LEFT JOIN trdetvisitas v ON d.id = v.departamento_id AND v.eliminado = 0
                WHERE d.eliminado = 0 AND d.status = 1
                GROUP BY d.id, d.nombre, d.responsable
                ORDER BY total_visitas DESC
                LIMIT {$limit}";
        
        return Database::fetchAll($sql);
    }

    /**
     * Validar datos antes de crear/actualizar
     */
    public function validate(array $data): array
    {
        $errors = [];

        if (empty($data['nombre'])) {
            $errors['nombre'][] = 'El nombre del departamento es requerido';
        }

        if (empty($data['responsable'])) {
            $errors['responsable'][] = 'El responsable es requerido';
        }

        if (empty($data['telefono_primario'])) {
            $errors['telefono_primario'][] = 'El teléfono primario es requerido';
        }

        if (!empty($data['telefono_primario']) && !is_numeric($data['telefono_primario'])) {
            $errors['telefono_primario'][] = 'El teléfono primario debe ser numérico';
        }

        if (!empty($data['telefono_secundario']) && !is_numeric($data['telefono_secundario'])) {
            $errors['telefono_secundario'][] = 'El teléfono secundario debe ser numérico';
        }

        return $errors;
    }

    /**
     * Verificar si el nombre del departamento ya existe
     */
    public function nombreExists(string $nombre, ?int $excludeId = null): bool
    {
        $sql = "SELECT COUNT(*) as total FROM {$this->table} WHERE nombre = ? AND eliminado = 0";
        $params = [$nombre];

        if ($excludeId) {
            $sql .= " AND id != ?";
            $params[] = $excludeId;
        }

        $result = Database::fetchOne($sql, $params);
        return (int) $result['total'] > 0;
    }

    /**
     * Obtener departamento con información de visitas
     */
    public function findWithVisitas(int $id): ?array
    {
        $sql = "SELECT d.*, 
                       COUNT(v.id) as total_visitas,
                       COUNT(CASE WHEN v.estado = 'activa' THEN 1 END) as visitas_activas,
                       COUNT(CASE WHEN DATE(v.fecha_entrada) = CURDATE() THEN 1 END) as visitas_hoy
                FROM {$this->table} d
                LEFT JOIN trdetvisitas v ON d.id = v.departamento_id AND v.eliminado = 0
                WHERE d.id = ? AND d.eliminado = 0
                GROUP BY d.id";
        
        $departamento = Database::fetchOne($sql, [$id]);
        return $departamento ? $this->castTypes($departamento) : null;
    }
}
