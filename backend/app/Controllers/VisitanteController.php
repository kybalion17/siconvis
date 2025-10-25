<?php

namespace SAGAUT\Controllers;

use SAGAUT\Models\Visitante;
use SAGAUT\Utils\Response;

class VisitanteController
{
    private Visitante $visitanteModel;

    public function __construct()
    {
        $this->visitanteModel = new Visitante();
    }

    /**
     * Obtener todos los visitantes con paginación
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

            $result = $this->visitanteModel->findAllWithPagination($page, $perPage, $filters);

            Response::paginated(
                $result['data'], 
                $result['pagination']['total'], 
                $page, 
                $perPage, 
                'Visitantes obtenidos exitosamente'
            );
        } catch (\Exception $e) {
            Response::error('Error al obtener visitantes: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener un visitante por ID
     */
    public function show($id): void
    {
        try {
            if (!$id) {
                Response::error('ID de visitante requerido', 400);
            }

            $visitante = $this->visitanteModel->find($id);
            
            if (!$visitante) {
                Response::error('Visitante no encontrado', 404);
            }

            Response::success($visitante, 'Visitante obtenido exitosamente');
        } catch (\Exception $e) {
            Response::error('Error al obtener visitante: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Crear un nuevo visitante
     */
    public function store(): void
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                Response::error('Datos JSON requeridos', 400);
            }

            // Validar datos
            $errors = $this->visitanteModel->validate($input);
            if (!empty($errors)) {
                Response::error('Datos de validación incorrectos', 422, $errors);
            }

            // Verificar si la cédula ya existe
            if ($this->visitanteModel->cedulaExists($input['cedula'])) {
                Response::error('Ya existe un visitante con esta cédula', 409);
            }

            // Limpiar y validar URL de foto si existe
            if (!empty($input['foto'])) {
                $input['foto'] = $this->sanitizePhotoUrl($input['foto']);
            }

            // Crear visitante
            $visitanteId = $this->visitanteModel->create($input);
            $visitante = $this->visitanteModel->find($visitanteId);

            Response::success($visitante, 'Visitante creado exitosamente', 201);
        } catch (\Exception $e) {
            Response::error('Error al crear visitante: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar un visitante existente
     */
    public function update($id): void
    {
        try {
            if (!$id) {
                Response::error('ID de visitante requerido', 400);
            }

            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                Response::error('Datos JSON requeridos', 400);
            }

            // Verificar que el visitante existe
            $visitante = $this->visitanteModel->find($id);
            if (!$visitante) {
                Response::error('Visitante no encontrado', 404);
            }

            // Validar datos
            $errors = $this->visitanteModel->validate($input);
            if (!empty($errors)) {
                Response::error('Datos de validación incorrectos', 422, $errors);
            }

            // Verificar si la cédula ya existe en otro visitante
            if ($this->visitanteModel->cedulaExists($input['cedula'], $id)) {
                Response::error('Ya existe otro visitante con esta cédula', 409);
            }

            // Limpiar y validar URL de foto si existe
            if (!empty($input['foto'])) {
                $input['foto'] = $this->sanitizePhotoUrl($input['foto']);
            }

            // Actualizar visitante
            $success = $this->visitanteModel->update($id, $input);
            
            if (!$success) {
                Response::error('No se pudo actualizar el visitante', 500);
            }

            $visitanteActualizado = $this->visitanteModel->find($id);
            Response::success($visitanteActualizado, 'Visitante actualizado exitosamente');
        } catch (\Exception $e) {
            Response::error('Error al actualizar visitante: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar un visitante (soft delete)
     */
    public function delete($id): void
    {
        try {
            if (!$id) {
                Response::error('ID de visitante requerido', 400);
            }

            // Verificar que el visitante existe
            $visitante = $this->visitanteModel->find($id);
            if (!$visitante) {
                Response::error('Visitante no encontrado', 404);
            }

            // Eliminar visitante (soft delete)
            $success = $this->visitanteModel->softDelete($id);
            
            if (!$success) {
                Response::error('No se pudo eliminar el visitante', 500);
            }

            Response::success([], 'Visitante eliminado exitosamente');
        } catch (\Exception $e) {
            Response::error('Error al eliminar visitante: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Buscar visitante por cédula
     */
    public function findByCedula(): void
    {
        try {
            $cedula = $_GET['cedula'] ?? '';
            
            if (empty($cedula)) {
                Response::error('Cédula requerida', 400);
            }

            $visitante = $this->visitanteModel->findByCedula($cedula);
            
            if (!$visitante) {
                Response::error('Visitante no encontrado', 404);
            }

            Response::success($visitante, 'Visitante encontrado exitosamente');
        } catch (\Exception $e) {
            Response::error('Error al buscar visitante: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener visitantes solicitados
     */
    public function solicitados(): void
    {
        try {
            $visitantes = $this->visitanteModel->findSolicitados();
            Response::success($visitantes, 'Visitantes solicitados obtenidos exitosamente');
        } catch (\Exception $e) {
            Response::error('Error al obtener visitantes solicitados: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Marcar visitante como solicitado
     */
    public function marcarSolicitado($id): void
    {
        try {
            if (!$id) {
                Response::error('ID de visitante requerido', 400);
            }

            // Verificar que el visitante existe
            $visitante = $this->visitanteModel->find($id);
            if (!$visitante) {
                Response::error('Visitante no encontrado', 404);
            }

            $success = $this->visitanteModel->marcarSolicitado($id);
            
            if (!$success) {
                Response::error('No se pudo marcar como solicitado', 500);
            }

            Response::success([], 'Visitante marcado como solicitado exitosamente');
        } catch (\Exception $e) {
            Response::error('Error al marcar como solicitado: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Marcar visitante como solicitado (ruta con guión)
     */
    public function marcarSolicitadoConGuion($id): void
    {
        $this->marcarSolicitado($id);
    }

    /**
     * Desmarcar visitante como solicitado
     */
    public function desmarcarSolicitado($id): void
    {
        try {
            if (!$id) {
                Response::error('ID de visitante requerido', 400);
            }

            // Verificar que el visitante existe
            $visitante = $this->visitanteModel->find($id);
            if (!$visitante) {
                Response::error('Visitante no encontrado', 404);
            }

            $success = $this->visitanteModel->desmarcarSolicitado($id);
            
            if (!$success) {
                Response::error('No se pudo desmarcar como solicitado', 500);
            }

            Response::success([], 'Visitante desmarcado como solicitado exitosamente');
        } catch (\Exception $e) {
            Response::error('Error al desmarcar como solicitado: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Desmarcar visitante como solicitado (ruta con guión)
     */
    public function desmarcarSolicitadoConGuion($id): void
    {
        $this->desmarcarSolicitado($id);
    }

    /**
     * Obtener estadísticas de visitantes
     */
    public function stats(): void
    {
        try {
            $stats = $this->visitanteModel->getStats();
            Response::success($stats, 'Estadísticas obtenidas exitosamente');
        } catch (\Exception $e) {
            Response::error('Error al obtener estadísticas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Sanitizar URL de foto
     */
    private function sanitizePhotoUrl(string $url): string
    {
        // Si es una URL de data (base64), mantenerla tal como está
        if (strpos($url, 'data:image/') === 0) {
            return $url;
        }

        // Si es una URL externa, validar que sea segura
        if (filter_var($url, FILTER_VALIDATE_URL)) {
            $parsedUrl = parse_url($url);
            $allowedSchemes = ['http', 'https'];
            $allowedHosts = ['localhost', '127.0.0.1']; // Agregar más hosts según necesidad
            
            if (in_array($parsedUrl['scheme'] ?? '', $allowedSchemes) && 
                in_array($parsedUrl['host'] ?? '', $allowedHosts)) {
                return $url;
            }
        }

        // Si es una ruta relativa, asegurar que sea segura
        $url = ltrim($url, '/');
        if (strpos($url, '..') === false && strpos($url, 'uploads/') === 0) {
            return $url;
        }

        // Si no es válida, devolver cadena vacía
        return '';
    }
}
