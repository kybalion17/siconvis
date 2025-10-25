<?php

namespace SAGAUT\Controllers;

use SAGAUT\Models\Visita;
use SAGAUT\Models\Visitante;
use SAGAUT\Models\Departamento;
use SAGAUT\Utils\Response;

class VisitaController
{
    private Visita $visitaModel;

    public function __construct()
    {
        $this->visitaModel = new Visita();
    }

    /**
     * Obtener lista de visitas
     */
    public function index(): void
    {
        try {
            $page = (int)($_GET['page'] ?? 1);
            $perPage = (int)($_GET['per_page'] ?? 10);
            $search = $_GET['search'] ?? '';
            $estado = $_GET['estado'] ?? '';
            $departamento_id = $_GET['departamento_id'] ?? '';
            $fecha_inicio = $_GET['fecha_inicio'] ?? '';
            $fecha_fin = $_GET['fecha_fin'] ?? '';

            $filters = [];
            if (!empty($search)) $filters['search'] = $search;
            if (!empty($estado)) $filters['estado'] = $estado;
            if (!empty($departamento_id)) $filters['departamento_id'] = $departamento_id;
            if (!empty($fecha_inicio)) $filters['fecha_inicio'] = $fecha_inicio;
            if (!empty($fecha_fin)) $filters['fecha_fin'] = $fecha_fin;

            $result = $this->visitaModel->getVisitasConDetalles($page, $perPage, $filters);

            Response::paginated(
                $result['data'], 
                $result['pagination']['total'], 
                $page, 
                $perPage, 
                'Visitas obtenidas exitosamente'
            );
        } catch (\Exception $e) {
            Response::error('Error al obtener visitas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener una visita específica
     */
    public function show($id): void
    {
        try {
            if (!$id) {
                Response::error('ID de visita requerido', 400);
            }

            $visita = $this->visitaModel->find($id);
            if (!$visita) {
                Response::error('Visita no encontrada', 404);
            }

            Response::success($visita, 'Visita obtenida exitosamente');
        } catch (\Exception $e) {
            Response::error('Error al obtener visita: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Crear nueva visita
     */
    public function store(): void
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                Response::error('Datos inválidos', 400);
            }

            // Validar datos
            $errors = $this->visitaModel->validate($input);
            if (!empty($errors)) {
                Response::error('Datos de validación incorrectos', 422, $errors);
            }

            // Verificar que el visitante existe
            $visitanteModel = new Visitante();
            $visitante = $visitanteModel->find($input['visitante_id']);
            if (!$visitante) {
                Response::error('Visitante no encontrado', 404);
            }

            // Verificar que el departamento existe
            $departamentoModel = new Departamento();
            $departamento = $departamentoModel->find($input['departamento_id']);
            if (!$departamento) {
                Response::error('Departamento no encontrado', 404);
            }

            // Verificar si el visitante ya tiene una visita activa
            if ($this->visitaModel->visitanteTieneVisitaActiva($input['visitante_id'])) {
                Response::error('El visitante ya tiene una visita activa', 400);
            }

            // Preparar datos para inserción
            $visitaData = [
                'visitante_id' => $input['visitante_id'],
                'departamento_id' => $input['departamento_id'],
                'motivo_visita' => $input['motivo_visita'],
                'fecha_entrada' => null, // Se establecerá automáticamente con NOW() en la base de datos
                'estado' => 'activa',
                'observaciones' => $input['observaciones'] ?? null,
                'eliminado' => 0
            ];

            $visitaId = $this->visitaModel->create($visitaData);
            $visita = $this->visitaModel->find($visitaId);

            Response::success($visita, 'Visita registrada exitosamente', 201);
        } catch (\Exception $e) {
            Response::error('Error al registrar visita: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar visita
     */
    public function update($id): void
    {
        try {
            if (!$id) {
                Response::error('ID de visita requerido', 400);
            }

            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                Response::error('Datos inválidos', 400);
            }

            $visita = $this->visitaModel->find($id);
            if (!$visita) {
                Response::error('Visita no encontrada', 404);
            }

            // Solo permitir actualizar ciertos campos
            $allowedFields = ['motivo_visita', 'observaciones'];
            $updateData = [];
            
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    $updateData[$field] = $input[$field];
                }
            }

            if (empty($updateData)) {
                Response::error('No hay datos válidos para actualizar', 400);
            }

            $success = $this->visitaModel->update($id, $updateData);
            if (!$success) {
                Response::error('No se pudo actualizar la visita', 500);
            }

            $visitaActualizada = $this->visitaModel->find($id);
            Response::success($visitaActualizada, 'Visita actualizada exitosamente');
        } catch (\Exception $e) {
            Response::error('Error al actualizar visita: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar visita (soft delete)
     */
    public function delete($id): void
    {
        try {
            if (!$id) {
                Response::error('ID de visita requerido', 400);
            }

            $visita = $this->visitaModel->find($id);
            if (!$visita) {
                Response::error('Visita no encontrada', 404);
            }

            $success = $this->visitaModel->softDelete($id);
            if (!$success) {
                Response::error('No se pudo eliminar la visita', 500);
            }

            Response::success([], 'Visita eliminada exitosamente');
        } catch (\Exception $e) {
            Response::error('Error al eliminar visita: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Finalizar visita
     */
    public function finalizarVisita($id): void
    {
        try {
            if (!$id) {
                Response::error('ID de visita requerido', 400);
            }

            $visita = $this->visitaModel->find($id);
            if (!$visita) {
                Response::error('Visita no encontrada', 404);
            }

            if ($visita['estado'] !== 'activa') {
                Response::error('Solo se pueden finalizar visitas activas', 400);
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $observaciones = $input['observaciones'] ?? null;

            $success = $this->visitaModel->finalizarVisita($id, $observaciones);
            if (!$success) {
                Response::error('No se pudo finalizar la visita', 500);
            }

            Response::success([], 'Visita finalizada exitosamente');
        } catch (\Exception $e) {
            Response::error('Error al finalizar visita: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Cancelar visita
     */
    public function cancelarVisita($id): void
    {
        try {
            if (!$id) {
                Response::error('ID de visita requerido', 400);
            }

            $visita = $this->visitaModel->find($id);
            if (!$visita) {
                Response::error('Visita no encontrada', 404);
            }

            if ($visita['estado'] !== 'activa') {
                Response::error('Solo se pueden cancelar visitas activas', 400);
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $observaciones = $input['observaciones'] ?? null;

            $success = $this->visitaModel->cancelarVisita($id, $observaciones);
            if (!$success) {
                Response::error('No se pudo cancelar la visita', 500);
            }

            Response::success([], 'Visita cancelada exitosamente');
        } catch (\Exception $e) {
            Response::error('Error al cancelar visita: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener estadísticas de visitas
     */
    public function getStats(): void
    {
        try {
            $stats = $this->visitaModel->getStats();
            Response::success($stats, 'Estadísticas obtenidas exitosamente');
        } catch (\Exception $e) {
            Response::error('Error al obtener estadísticas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener visitas activas
     */
    public function getVisitasActivas(): void
    {
        try {
            $visitas = $this->visitaModel->getVisitasActivas();
            Response::success($visitas, 'Visitas activas obtenidas exitosamente');
        } catch (\Exception $e) {
            Response::error('Error al obtener visitas activas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener visitas del día
     */
    public function getVisitasHoy(): void
    {
        try {
            $visitas = $this->visitaModel->getVisitasHoy();
            Response::success($visitas, 'Visitas del día obtenidas exitosamente');
        } catch (\Exception $e) {
            Response::error('Error al obtener visitas del día: ' . $e->getMessage(), 500);
        }
    }
}
