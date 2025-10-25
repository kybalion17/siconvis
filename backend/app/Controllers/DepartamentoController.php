<?php

namespace SAGAUT\Controllers;

use SAGAUT\Models\Departamento;
use SAGAUT\Utils\Response;

class DepartamentoController
{
    private Departamento $departamentoModel;

    public function __construct()
    {
        $this->departamentoModel = new Departamento();
    }

    /**
     * Obtener todos los departamentos con paginación
     */
    public function index(): void
    {
        try {
            $page = (int) ($_GET['page'] ?? 1);
            $perPage = (int) ($_GET['per_page'] ?? 10);
            $search = $_GET['search'] ?? '';

            $filters = [];
            if (!empty($search)) {
                $filters['search'] = $search;
            }

            $result = $this->departamentoModel->findAllWithPagination($page, $perPage, $filters);

            Response::paginated(
                $result['data'], 
                $result['pagination']['total'], 
                $page, 
                $perPage, 
                'Departamentos obtenidos exitosamente'
            );
        } catch (\Exception $e) {
            Response::error('Error al obtener departamentos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener todos los departamentos activos (para selects)
     */
    public function activos(): void
    {
        try {
            $departamentos = $this->departamentoModel->findAllActivos();
            Response::success($departamentos, 'Departamentos activos obtenidos exitosamente');
        } catch (\Exception $e) {
            Response::error('Error al obtener departamentos activos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener un departamento por ID
     */
    public function show($id): void
    {
        try {
            if (!$id) {
                Response::error('ID de departamento requerido', 400);
            }

            $departamento = $this->departamentoModel->findWithVisitas($id);
            
            if (!$departamento) {
                Response::error('Departamento no encontrado', 404);
            }

            Response::success($departamento, 'Departamento obtenido exitosamente');
        } catch (\Exception $e) {
            Response::error('Error al obtener departamento: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Crear un nuevo departamento
     */
    public function store(): void
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                Response::error('Datos JSON requeridos', 400);
            }

            // Validar datos
            $errors = $this->departamentoModel->validate($input);
            if (!empty($errors)) {
                Response::error('Datos de validación incorrectos', 422, $errors);
            }

            // Verificar si el nombre ya existe
            if ($this->departamentoModel->nombreExists($input['nombre'])) {
                Response::error('Ya existe un departamento con este nombre', 409);
            }

            // Establecer status por defecto
            if (!isset($input['status'])) {
                $input['status'] = 1;
            }

            // Crear departamento
            $departamentoId = $this->departamentoModel->create($input);
            $departamento = $this->departamentoModel->find($departamentoId);

            Response::success($departamento, 'Departamento creado exitosamente', 201);
        } catch (\Exception $e) {
            Response::error('Error al crear departamento: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar un departamento existente
     */
    public function update($id): void
    {
        try {
            if (!$id) {
                Response::error('ID de departamento requerido', 400);
            }

            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                Response::error('Datos JSON requeridos', 400);
            }

            // Verificar que el departamento existe
            $departamento = $this->departamentoModel->find($id);
            if (!$departamento) {
                Response::error('Departamento no encontrado', 404);
            }

            // Validar datos
            $errors = $this->departamentoModel->validate($input);
            if (!empty($errors)) {
                Response::error('Datos de validación incorrectos', 422, $errors);
            }

            // Verificar si el nombre ya existe en otro departamento
            if ($this->departamentoModel->nombreExists($input['nombre'], $id)) {
                Response::error('Ya existe otro departamento con este nombre', 409);
            }

            // Actualizar departamento
            $success = $this->departamentoModel->update($id, $input);
            
            if (!$success) {
                Response::error('No se pudo actualizar el departamento', 500);
            }

            $departamentoActualizado = $this->departamentoModel->find($id);

            Response::success($departamentoActualizado, 'Departamento actualizado exitosamente');
        } catch (\Exception $e) {
            Response::error('Error al actualizar departamento: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar un departamento (soft delete)
     */
    public function delete($id): void
    {
        try {
            if (!$id) {
                Response::error('ID de departamento requerido', 400);
            }

            // Verificar que el departamento existe
            $departamento = $this->departamentoModel->find($id);
            if (!$departamento) {
                Response::error('Departamento no encontrado', 404);
            }

            // Eliminar departamento (soft delete)
            $success = $this->departamentoModel->softDelete($id);
            
            if (!$success) {
                Response::error('No se pudo eliminar el departamento', 500);
            }

            Response::success([], 'Departamento eliminado exitosamente');
        } catch (\Exception $e) {
            Response::error('Error al eliminar departamento: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Activar departamento
     */
    public function activar($id): void
    {
        try {
            if (!$id) {
                Response::error('ID de departamento requerido', 400);
            }

            // Verificar que el departamento existe
            $departamento = $this->departamentoModel->find($id);
            if (!$departamento) {
                Response::error('Departamento no encontrado', 404);
            }

            $success = $this->departamentoModel->activar($id);
            
            if (!$success) {
                Response::error('No se pudo activar el departamento', 500);
            }

            Response::success([], 'Departamento activado exitosamente');
        } catch (\Exception $e) {
            Response::error('Error al activar departamento: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Desactivar departamento
     */
    public function desactivar($id): void
    {
        try {
            if (!$id) {
                Response::error('ID de departamento requerido', 400);
            }

            // Verificar que el departamento existe
            $departamento = $this->departamentoModel->find($id);
            if (!$departamento) {
                Response::error('Departamento no encontrado', 404);
            }

            $success = $this->departamentoModel->desactivar($id);
            
            if (!$success) {
                Response::error('No se pudo desactivar el departamento', 500);
            }

            Response::success([], 'Departamento desactivado exitosamente');
        } catch (\Exception $e) {
            Response::error('Error al desactivar departamento: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener estadísticas de departamentos
     */
    public function stats(): void
    {
        try {
            $stats = $this->departamentoModel->getStats();
            Response::success($stats, 'Estadísticas obtenidas exitosamente');
        } catch (\Exception $e) {
            Response::error('Error al obtener estadísticas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener departamentos más visitados
     */
    public function masVisitados(): void
    {
        try {
            $limit = (int) ($_GET['limit'] ?? 5);
            $departamentos = $this->departamentoModel->getMasVisitados($limit);
            Response::success($departamentos, 'Departamentos más visitados obtenidos exitosamente');
        } catch (\Exception $e) {
            Response::error('Error al obtener departamentos más visitados: ' . $e->getMessage(), 500);
        }
    }
}
