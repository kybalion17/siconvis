<?php

namespace SAGAUT\Controllers;

use SAGAUT\Utils\Response;
use SAGAUT\Utils\Database;

class MaestroController
{
    private $db;
    private $response;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->response = new Response();
    }

    /**
     * Obtener lista de elementos de una tabla maestra
     */
    public function index($table)
    {
        try {
            $page = (int)($_GET['page'] ?? 1);
            $perPage = (int)($_GET['per_page'] ?? 10);
            // Limitar el número máximo de elementos por página para evitar problemas de rendimiento
            $perPage = min($perPage, 1000);
            $search = $_GET['search'] ?? '';
            $sortBy = $_GET['sort_by'] ?? 'id';
            $sortOrder = $_GET['sort_order'] ?? 'asc';

            $offset = ($page - 1) * $perPage;

            // Validar tabla
            $allowedTables = $this->getAllowedTables();
            if (!in_array($table, $allowedTables)) {
                return $this->response->error('Tabla no válida', 400);
            }

            // Construir consulta base
            $whereClause = '';
            $params = [];

            if ($search) {
                $whereClause = "WHERE nombre LIKE :search OR id LIKE :search";
                $params[':search'] = "%{$search}%";
            }

            // Contar total
            $countSql = "SELECT COUNT(*) as total FROM {$table} {$whereClause}";
            $countStmt = $this->db->prepare($countSql);
            foreach ($params as $key => $value) {
                $countStmt->bindValue($key, $value);
            }
            $countStmt->execute();
            $total = $countStmt->fetch()['total'];

            // Obtener datos
            $sql = "SELECT * FROM {$table} {$whereClause} ORDER BY {$sortBy} {$sortOrder} LIMIT :limit OFFSET :offset";
            $stmt = $this->db->prepare($sql);
            
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->bindValue(':limit', $perPage, \PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
            $stmt->execute();

            $data = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            $totalPages = ceil($total / $perPage);

            return $this->response->success([
                'data' => $data,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $perPage,
                    'total' => $total,
                    'total_pages' => $totalPages,
                    'has_next' => $page < $totalPages,
                    'has_prev' => $page > 1
                ]
            ]);

        } catch (\Exception $e) {
            return $this->response->error('Error al obtener datos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener un elemento específico
     */
    public function show($table, $id)
    {
        try {
            $allowedTables = $this->getAllowedTables();
            if (!in_array($table, $allowedTables)) {
                return $this->response->error('Tabla no válida', 400);
            }

            $sql = "SELECT * FROM {$table} WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
            $stmt->execute();

            $data = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$data) {
                return $this->response->error('Registro no encontrado', 404);
            }

            return $this->response->success($data);

        } catch (\Exception $e) {
            return $this->response->error('Error al obtener registro: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Crear nuevo elemento
     */
    public function store($table)
    {
        try {
            $allowedTables = $this->getAllowedTables();
            if (!in_array($table, $allowedTables)) {
                return $this->response->error('Tabla no válida', 400);
            }

            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                return $this->response->error('Datos inválidos', 400);
            }

            // Validar campos requeridos
            $requiredFields = $this->getRequiredFields($table);
            foreach ($requiredFields as $field) {
                if (!isset($input[$field]) || empty($input[$field])) {
                    return $this->response->error("El campo '{$field}' es requerido", 400);
                }
            }

            // Preparar datos para inserción
            $fields = array_keys($input);
            $placeholders = ':' . implode(', :', $fields);
            $fieldsList = implode(', ', $fields);

            $sql = "INSERT INTO {$table} ({$fieldsList}) VALUES ({$placeholders})";
            $stmt = $this->db->prepare($sql);

            foreach ($input as $key => $value) {
                $stmt->bindValue(':' . $key, $value);
            }

            $stmt->execute();

            $newId = $this->db->lastInsertId();

            return $this->response->success([
                'id' => $newId,
                'message' => 'Registro creado exitosamente'
            ], 201);

        } catch (\Exception $e) {
            return $this->response->error('Error al crear registro: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar elemento existente
     */
    public function update($table, $id)
    {
        try {
            $allowedTables = $this->getAllowedTables();
            if (!in_array($table, $allowedTables)) {
                return $this->response->error('Tabla no válida', 400);
            }

            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                return $this->response->error('Datos inválidos', 400);
            }

            // Verificar que el registro existe
            $checkSql = "SELECT id FROM {$table} WHERE id = :id";
            $checkStmt = $this->db->prepare($checkSql);
            $checkStmt->bindValue(':id', $id, \PDO::PARAM_INT);
            $checkStmt->execute();

            if (!$checkStmt->fetch()) {
                return $this->response->error('Registro no encontrado', 404);
            }

            // Filtrar campos que no deben ser actualizados
            $excludedFields = ['id', 'created_at', 'updated_at'];
            $updateData = [];
            foreach ($input as $key => $value) {
                if (!in_array($key, $excludedFields)) {
                    $updateData[$key] = $value;
                }
            }

            if (empty($updateData)) {
                return $this->response->error('No hay datos válidos para actualizar', 400);
            }

            // Preparar datos para actualización
            $fields = [];
            foreach ($updateData as $key => $value) {
                $fields[] = "{$key} = :{$key}";
            }

            $sql = "UPDATE {$table} SET " . implode(', ', $fields) . " WHERE id = :id";
            $stmt = $this->db->prepare($sql);

            foreach ($updateData as $key => $value) {
                $stmt->bindValue(':' . $key, $value);
            }
            $stmt->bindValue(':id', $id, \PDO::PARAM_INT);

            if ($stmt->execute()) {
                return $this->response->success([
                    'message' => 'Registro actualizado exitosamente'
                ]);
            } else {
                $errorInfo = $stmt->errorInfo();
                return $this->response->error('Error al ejecutar la actualización: ' . $errorInfo[2], 500);
            }

        } catch (\Exception $e) {
            error_log("Error en update: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return $this->response->error('Error al actualizar registro: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar elemento
     */
    public function destroy($table, $id)
    {
        try {
            $allowedTables = $this->getAllowedTables();
            if (!in_array($table, $allowedTables)) {
                return $this->response->error('Tabla no válida', 400);
            }

            // Verificar que el registro existe
            $checkSql = "SELECT id FROM {$table} WHERE id = :id";
            $checkStmt = $this->db->prepare($checkSql);
            $checkStmt->bindValue(':id', $id, \PDO::PARAM_INT);
            $checkStmt->execute();

            if (!$checkStmt->fetch()) {
                return $this->response->error('Registro no encontrado', 404);
            }

            // Verificar si la tabla tiene campo 'eliminado' para soft delete
            $columns = $this->getTableColumns($table);
            if (in_array('eliminado', $columns)) {
                $sql = "UPDATE {$table} SET eliminado = 1 WHERE id = :id";
            } else {
                $sql = "DELETE FROM {$table} WHERE id = :id";
            }

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
            $stmt->execute();

            return $this->response->success([
                'message' => 'Registro eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            return $this->response->error('Error al eliminar registro: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener lista de tablas maestras permitidas
     */
    private function getAllowedTables()
    {
        return [
            'trmaaseguradoras',
            'trmaasientos',
            'trmaclase',
            'trmacolor',
            'trmacombustible',
            'trmalicencia',
            'trmamarca',
            'trmamodelo',
            'trmaorganismos',
            'trmaperfil',
            'trmasexo',
            'trmatalleres',
            'trmatipomantenimiento',
            'trmatransmision',
            'trmaunidad_peso',
            'trmadocumentos',
            'trmaitems_mantenimiento',
            'trmaitems_verificacion',
            'trmaletra_rif',
            'trmadepartamentos',
            'trmadirecciones'
        ];
    }

    /**
     * Obtener campos requeridos para cada tabla
     */
    private function getRequiredFields($table)
    {
        $requiredFields = [
            'trmaaseguradoras' => ['nombre', 'rif_completo'],
            'trmaasientos' => ['nombre'],
            'trmaclase' => ['nombre'],
            'trmacolor' => ['nombre'],
            'trmacombustible' => ['nombre'],
            'trmalicencia' => ['nombre'],
            'trmamarca' => ['marca'],
            'trmamodelo' => ['modelo', 'marca_id'],
            'trmaorganismos' => ['nombre'],
            'trmaperfil' => ['nombre'],
            'trmasexo' => ['nombre'],
            'trmatalleres' => ['nombre'],
            'trmatipomantenimiento' => ['nombre'],
            'trmatransmision' => ['nombre'],
            'trmaunidadpeso' => ['nombre'],
            'trmadocumentos' => ['nombre'],
            'trmaitems_mantenimiento' => ['nombre'],
            'trmaitems_verificacion' => ['nombre', 'tipo_item'],
            'trmaletra_rif' => ['nombre'],
            'trmadepartamentos' => ['nombre'],
            'trmadirecciones' => ['nombre']
        ];

        return $requiredFields[$table] ?? ['nombre'];
    }

    /**
     * Obtener columnas de una tabla
     */
    private function getTableColumns($table)
    {
        $sql = "SHOW COLUMNS FROM {$table}";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        $columns = $stmt->fetchAll(\PDO::FETCH_COLUMN);
        return $columns;
    }

    /**
     * Obtener opciones para dropdowns (método específico para frontend)
     */
    public function getOptions($table)
    {
        try {
            $allowedTables = $this->getAllowedTables();
            if (!in_array($table, $allowedTables)) {
                return $this->response->error('Tabla no válida', 400);
            }

            // Determinar el nombre de la columna principal según la tabla
            $nameColumn = $this->getNameColumn($table);
            
            // Verificar si la tabla tiene columna eliminado
            $columns = $this->getTableColumns($table);
            $whereClause = '';
            if (in_array('eliminado', $columns)) {
                $whereClause = ' WHERE eliminado = 0 OR eliminado IS NULL';
            }
            
            $sql = "SELECT id, {$nameColumn} as nombre FROM {$table}{$whereClause} ORDER BY {$nameColumn}";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();

            $data = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            return $this->response->success($data);

        } catch (\Exception $e) {
            return $this->response->error('Error al obtener opciones: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener el nombre de la columna principal para cada tabla
     */
    private function getNameColumn($table)
    {
        $nameColumns = [
            'trmamarca' => 'nombre',
            'trmamodelo' => 'nombre',
            'trmaaseguradoras' => 'nombre',
            'trmatalleres' => 'nombre',
            'trmadepartamentos' => 'nombre',
            'trmadirecciones' => 'nombre'
        ];

        return $nameColumns[$table] ?? 'nombre';
    }

    /**
     * Obtener estadísticas de una tabla maestra
     */
    public function getStats($table)
    {
        try {
            $allowedTables = $this->getAllowedTables();
            if (!in_array($table, $allowedTables)) {
                return $this->response->error('Tabla no válida', 400);
            }

            $sql = "SELECT 
                        COUNT(*) as total,
                        COUNT(CASE WHEN eliminado = 0 OR eliminado IS NULL THEN 1 END) as activos,
                        COUNT(CASE WHEN eliminado = 1 THEN 1 END) as eliminados
                    FROM {$table}";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();

            $stats = $stmt->fetch(\PDO::FETCH_ASSOC);

            return $this->response->success($stats);

        } catch (\Exception $e) {
            return $this->response->error('Error al obtener estadísticas: ' . $e->getMessage(), 500);
        }
    }

    // Métodos específicos para compatibilidad con rutas existentes
    public function clases()
    {
        return $this->getOptions('trmaclase');
    }

    public function marcas()
    {
        return $this->getOptions('trmamarca');
    }

    public function modelos()
    {
        $marcaId = $_GET['marca_id'] ?? null;
        if ($marcaId) {
            $sql = "SELECT id, nombre  FROM trmamodelo WHERE id_marca = :marca_id ORDER BY nombre";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':marca_id', $marcaId, \PDO::PARAM_INT);
            $stmt->execute();
            $data = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            return $this->response->success($data);
        }
        return $this->getOptions('trmamodelo');
    }

    public function colores()
    {
        return $this->getOptions('trmacolor');
    }

    public function combustibles()
    {
        return $this->getOptions('trmacombustible');
    }

    public function transmisiones()
    {
        return $this->getOptions('trmatransmision');
    }

    public function asientos()
    {
        return $this->getOptions('trmaasientos');
    }

    public function unidadesPeso()
    {
        return $this->getOptions('trmaunidad_peso');
    }

    public function choferes()
    {
        return $this->getOptions('trmachoferes');
    }

    public function organismos()
    {
        return $this->getOptions('trmaorganismos');
    }

    public function talleres()
    {
        return $this->getOptions('trmatalleres');
    }

    public function aseguradoras()
    {
        return $this->getOptions('trmaaseguradoras');
    }

    public function tiposMantenimiento()
    {
        return $this->getOptions('trmatipomantenimiento');
    }

    public function sexos()
    {
        return $this->getOptions('trmasexo');
    }

    public function licencias()
    {
        return $this->getOptions('trmalicencia');
    }

    public function perfiles()
    {
        return $this->getOptions('trmaperfil');
    }
}
