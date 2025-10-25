<?php

namespace SAGAUT\Models;

use SAGAUT\Utils\Database;

class Visitante extends BaseModel
{
    protected string $table = 'trmavisitantes';
    protected string $primaryKey = 'id';
    
    protected array $fillable = [
        'nombre',
        'apellido', 
        'cedula',
        'telefono_primario',
        'telefono_secundario',
        'foto',
        'solicitado',
        'eliminado'
    ];
    
    protected array $hidden = [];
    
    protected array $timestamps = ['created_at', 'updated_at'];

    /**
     * Buscar visitante por cédula
     */
    public function findByCedula(string $cedula): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE cedula = ? AND eliminado = 0";
        return Database::fetchOne($sql, [$cedula]);
    }

    /**
     * Obtener todos los visitantes con paginación
     */
    public function findAllWithPagination(int $page = 1, int $perPage = 10, array $filters = []): array
    {
        $offset = ($page - 1) * $perPage;
        $conditions = ['eliminado' => 0];
        
        // Aplicar filtros
        if (!empty($filters['search'])) {
            $search = '%' . $filters['search'] . '%';
            $sql = "SELECT * FROM {$this->table} 
                    WHERE eliminado = 0 
                    AND (nombre LIKE ? OR apellido LIKE ? OR cedula LIKE ?)
                    ORDER BY created_at DESC 
                    LIMIT {$perPage} OFFSET {$offset}";
            $params = [$search, $search, $search];
        } else {
            $sql = "SELECT * FROM {$this->table} WHERE eliminado = 0 ORDER BY created_at DESC LIMIT {$perPage} OFFSET {$offset}";
            $params = [];
        }

        $visitantes = Database::fetchAll($sql, $params);
        
        // Contar total para paginación
        if (!empty($filters['search'])) {
            $countSql = "SELECT COUNT(*) as total FROM {$this->table} 
                        WHERE eliminado = 0 
                        AND (nombre LIKE ? OR apellido LIKE ? OR cedula LIKE ?)";
            $countParams = [$search, $search, $search];
        } else {
            $countSql = "SELECT COUNT(*) as total FROM {$this->table} WHERE eliminado = 0";
            $countParams = [];
        }
        
        $totalResult = Database::fetchOne($countSql, $countParams);
        $total = (int) $totalResult['total'];

        return [
            'data' => $visitantes,
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
     * Obtener visitantes solicitados
     */
    public function findSolicitados(): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE solicitado = 1 AND eliminado = 0 ORDER BY created_at DESC";
        return Database::fetchAll($sql);
    }

    /**
     * Marcar como solicitado
     */
    public function marcarSolicitado(int $id): bool
    {
        return $this->update($id, ['solicitado' => 1]);
    }

    /**
     * Desmarcar como solicitado
     */
    public function desmarcarSolicitado(int $id): bool
    {
        return $this->update($id, ['solicitado' => 0]);
    }

    /**
     * Obtener estadísticas de visitantes
     */
    public function getStats(): array
    {
        $totalSql = "SELECT COUNT(*) as total FROM {$this->table} WHERE eliminado = 0";
        $solicitadosSql = "SELECT COUNT(*) as total FROM {$this->table} WHERE solicitado = 1 AND eliminado = 0";
        $hoySql = "SELECT COUNT(*) as total FROM {$this->table} WHERE DATE(created_at) = CURDATE() AND eliminado = 0";

        $total = Database::fetchOne($totalSql)['total'];
        $solicitados = Database::fetchOne($solicitadosSql)['total'];
        $hoy = Database::fetchOne($hoySql)['total'];

        return [
            'total_visitantes' => (int) $total,
            'visitantes_solicitados' => (int) $solicitados,
            'visitantes_hoy' => (int) $hoy,
            'visitantes_pendientes' => (int) $total - $solicitados
        ];
    }

    /**
     * Validar datos antes de crear/actualizar
     */
    public function validate(array $data): array
    {
        $errors = [];

        if (empty($data['nombre'])) {
            $errors['nombre'][] = 'El nombre es requerido';
        }

        if (empty($data['apellido'])) {
            $errors['apellido'][] = 'El apellido es requerido';
        }

        if (empty($data['cedula'])) {
            $errors['cedula'][] = 'La cédula es requerida';
        } elseif (!is_numeric($data['cedula']) || strlen($data['cedula']) < 7) {
            $errors['cedula'][] = 'La cédula debe ser numérica y tener al menos 7 dígitos';
        }

        if (empty($data['telefono_primario'])) {
            $errors['telefono_primario'][] = 'El teléfono primario es requerido';
        }

        return $errors;
    }

    /**
     * Verificar si la cédula ya existe
     */
    public function cedulaExists(string $cedula, ?int $excludeId = null): bool
    {
        $sql = "SELECT COUNT(*) as total FROM {$this->table} WHERE cedula = ? AND eliminado = 0";
        $params = [$cedula];

        if ($excludeId) {
            $sql .= " AND id != ?";
            $params[] = $excludeId;
        }

        $result = Database::fetchOne($sql, $params);
        return (int) $result['total'] > 0;
    }
}
