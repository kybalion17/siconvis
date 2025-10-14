<?php

namespace SAGAUT\Models;

use SAGAUT\Utils\Database;

abstract class BaseModel
{
    protected string $table;
    protected string $primaryKey = 'id';
    protected array $fillable = [];
    protected array $hidden = [];
    protected array $timestamps = ['created_at', 'updated_at'];

    public function find(int $id): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE {$this->primaryKey} = ?";
        return Database::fetchOne($sql, [$id]);
    }

    public function findAll(array $conditions = [], string $orderBy = '', int $limit = 0, int $offset = 0): array
    {
        $sql = "SELECT * FROM {$this->table}";
        $params = [];

        if (!empty($conditions)) {
            $whereClause = [];
            foreach ($conditions as $field => $value) {
                $whereClause[] = "{$field} = ?";
                $params[] = $value;
            }
            $sql .= " WHERE " . implode(' AND ', $whereClause);
        }

        if ($orderBy) {
            $sql .= " ORDER BY {$orderBy}";
        }

        if ($limit > 0) {
            $sql .= " LIMIT {$limit}";
            if ($offset > 0) {
                $sql .= " OFFSET {$offset}";
            }
        }

        return Database::fetchAll($sql, $params);
    }

    public function create(array $data): int
    {
        $data = $this->filterFillable($data);
        $data = $this->addTimestamps($data, 'create');

        $fields = array_keys($data);
        $placeholders = array_fill(0, count($fields), '?');
        
        $sql = "INSERT INTO {$this->table} (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")";
        
        Database::query($sql, array_values($data));
        return (int) Database::lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $data = $this->filterFillable($data);
        $data = $this->addTimestamps($data, 'update');

        $fields = array_keys($data);
        $setClause = array_map(fn($field) => "{$field} = ?", $fields);
        
        $sql = "UPDATE {$this->table} SET " . implode(', ', $setClause) . " WHERE {$this->primaryKey} = ?";
        
        $params = array_values($data);
        $params[] = $id;
        
        $stmt = Database::query($sql, $params);
        return $stmt->rowCount() > 0;
    }

    public function delete(int $id): bool
    {
        $sql = "DELETE FROM {$this->table} WHERE {$this->primaryKey} = ?";
        $stmt = Database::query($sql, [$id]);
        return $stmt->rowCount() > 0;
    }

    public function softDelete(int $id): bool
    {
        return $this->update($id, ['eliminado' => 1]);
    }

    public function count(array $conditions = []): int
    {
        $sql = "SELECT COUNT(*) as total FROM {$this->table}";
        $params = [];
        $whereClause = [];

        // Siempre incluir condición de eliminado
        $whereClause[] = "eliminado = 0";
        
        if (!empty($conditions)) {
            foreach ($conditions as $field => $value) {
                $whereClause[] = "{$field} = ?";
                $params[] = $value;
            }
        }
        
        $sql .= " WHERE " . implode(' AND ', $whereClause);

        $result = Database::fetchOne($sql, $params);
        return (int) $result['total'];
    }

    protected function filterFillable(array $data): array
    {
        if (empty($this->fillable)) {
            return $data;
        }

        return array_intersect_key($data, array_flip($this->fillable));
    }

    protected function addTimestamps(array $data, string $operation): array
    {
        if (empty($this->timestamps)) {
            return $data;
        }

        $now = date('Y-m-d H:i:s');

        if ($operation === 'create') {
            foreach ($this->timestamps as $field) {
                if (!isset($data[$field])) {
                    $data[$field] = $now;
                }
            }
        } elseif ($operation === 'update') {
            if (in_array('updated_at', $this->timestamps)) {
                $data['updated_at'] = $now;
            }
        }

        return $data;
    }

    protected function hideFields(array $data): array
    {
        if (empty($this->hidden)) {
            return $data;
        }

        return array_diff_key($data, array_flip($this->hidden));
    }
}
