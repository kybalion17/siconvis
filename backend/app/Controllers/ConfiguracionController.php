<?php

namespace SAGAUT\Controllers;

use SAGAUT\Models\Configuracion;
use SAGAUT\Utils\Response;
use SAGAUT\Utils\Database;

class ConfiguracionController
{
    private $db;
    private $response;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->response = new Response();
    }

    /**
     * Obtener lista de configuraciones
     */
    public function index()
    {
        try {
            $page = (int)($_GET['page'] ?? 1);
            $perPage = (int)($_GET['per_page'] ?? 10);
            $search = $_GET['search'] ?? '';
            $activo = $_GET['activo'] ?? '';
            $tipo = $_GET['tipo'] ?? '';
            $sortBy = $_GET['sort_by'] ?? 'clave';
            $sortOrder = $_GET['sort_order'] ?? 'asc';

            $offset = ($page - 1) * $perPage;

            // Construir consulta base
            $whereConditions = [];
            $params = [];

            if ($search) {
                $whereConditions[] = "(clave LIKE :search OR descripcion LIKE :search OR valor LIKE :search)";
                $params[':search'] = "%{$search}%";
            }

            if ($activo !== '') {
                $whereConditions[] = "activo = :activo";
                $params[':activo'] = $activo === 'true' ? 1 : 0;
            }

            if ($tipo) {
                $whereConditions[] = "tipo = :tipo";
                $params[':tipo'] = $tipo;
            }

            $whereClause = empty($whereConditions) ? '' : 'WHERE ' . implode(' AND ', $whereConditions);

            // Contar total
            $countSql = "SELECT COUNT(*) as total FROM trmaconfiguracion {$whereClause}";
            $countStmt = $this->db->prepare($countSql);
            foreach ($params as $key => $value) {
                $countStmt->bindValue($key, $value);
            }
            $countStmt->execute();
            $total = $countStmt->fetch()['total'];

            // Obtener datos
            $sql = "SELECT * FROM trmaconfiguracion {$whereClause} ORDER BY {$sortBy} {$sortOrder} LIMIT :limit OFFSET :offset";
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
            return $this->response->error('Error al obtener configuraciones: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener una configuración específica
     */
    public function show($id)
    {
        try {
            $sql = "SELECT * FROM trmaconfiguracion WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
            $stmt->execute();

            $data = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$data) {
                return $this->response->error('Configuración no encontrada', 404);
            }

            return $this->response->success($data);

        } catch (\Exception $e) {
            return $this->response->error('Error al obtener configuración: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Crear nueva configuración
     */
    public function store()
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                return $this->response->error('Datos inválidos', 400);
            }

            // Validar campos requeridos
            $requiredFields = ['clave', 'valor', 'tipo'];
            foreach ($requiredFields as $field) {
                if (!isset($input[$field]) || empty($input[$field])) {
                    return $this->response->error("El campo '{$field}' es requerido", 400);
                }
            }

            // Verificar que la clave no exista
            $existingConfig = Configuracion::where('clave', $input['clave'])->first();
            if ($existingConfig) {
                return $this->response->error('Ya existe una configuración con esta clave', 400);
            }

            // Validar tipo de dato
            $validTypes = ['string', 'number', 'boolean', 'json'];
            if (!in_array($input['tipo'], $validTypes)) {
                return $this->response->error('Tipo de dato no válido', 400);
            }

            // Validar valor según el tipo
            if (!$this->validateValueByType($input['valor'], $input['tipo'])) {
                return $this->response->error('El valor no es válido para el tipo especificado', 400);
            }

            // Preparar datos para inserción
            $configData = [
                'clave' => $input['clave'],
                'valor' => $input['valor'],
                'descripcion' => $input['descripcion'] ?? null,
                'tipo' => $input['tipo'],
                'activo' => $input['activo'] ?? true
            ];

            $config = new Configuracion();
            $config->fill($configData);
            $config->save();

            return $this->response->success([
                'id' => $config->id,
                'message' => 'Configuración creada exitosamente'
            ], 201);

        } catch (\Exception $e) {
            return $this->response->error('Error al crear configuración: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar configuración
     */
    public function update($id)
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                return $this->response->error('Datos inválidos', 400);
            }

            $config = Configuracion::find($id);
            if (!$config) {
                return $this->response->error('Configuración no encontrada', 404);
            }

            // Verificar que la clave no exista en otra configuración
            if (isset($input['clave']) && $input['clave'] !== $config->clave) {
                $existingConfig = Configuracion::where('clave', $input['clave'])
                                             ->where('id', '!=', $id)
                                             ->first();
                if ($existingConfig) {
                    return $this->response->error('Ya existe una configuración con esta clave', 400);
                }
            }

            // Validar tipo de dato si se proporciona
            if (isset($input['tipo'])) {
                $validTypes = ['string', 'number', 'boolean', 'json'];
                if (!in_array($input['tipo'], $validTypes)) {
                    return $this->response->error('Tipo de dato no válido', 400);
                }
            }

            // Validar valor según el tipo si se proporciona
            if (isset($input['valor']) && isset($input['tipo'])) {
                if (!$this->validateValueByType($input['valor'], $input['tipo'])) {
                    return $this->response->error('El valor no es válido para el tipo especificado', 400);
                }
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

            $config->fill($updateData);
            $config->save();

            return $this->response->success([
                'message' => 'Configuración actualizada exitosamente'
            ]);

        } catch (\Exception $e) {
            return $this->response->error('Error al actualizar configuración: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar configuración
     */
    public function delete($id)
    {
        try {
            $config = Configuracion::find($id);
            if (!$config) {
                return $this->response->error('Configuración no encontrada', 404);
            }

            $config->delete();

            return $this->response->success([
                'message' => 'Configuración eliminada exitosamente'
            ]);

        } catch (\Exception $e) {
            return $this->response->error('Error al eliminar configuración: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Validar valor según el tipo de dato
     */
    private function validateValueByType($valor, $tipo)
    {
        switch ($tipo) {
            case 'number':
                return is_numeric($valor);
            case 'boolean':
                return in_array($valor, ['true', 'false', '1', '0', true, false]);
            case 'json':
                json_decode($valor);
                return json_last_error() === JSON_ERROR_NONE;
            case 'string':
            default:
                return is_string($valor);
        }
    }

    /**
     * Obtener configuración por clave
     */
    public function getByClave($clave)
    {
        try {
            $sql = "SELECT * FROM trmaconfiguracion WHERE clave = :clave AND activo = 1";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':clave', $clave);
            $stmt->execute();

            $data = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$data) {
                return $this->response->error('Configuración no encontrada', 404);
            }

            return $this->response->success($data);

        } catch (\Exception $e) {
            return $this->response->error('Error al obtener configuración: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener todas las configuraciones activas
     */
    public function getActivas()
    {
        try {
            $sql = "SELECT * FROM trmaconfiguracion WHERE activo = 1 ORDER BY clave";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();

            $data = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            return $this->response->success($data);

        } catch (\Exception $e) {
            return $this->response->error('Error al obtener configuraciones activas: ' . $e->getMessage(), 500);
        }
    }
}
