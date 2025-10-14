<?php

namespace SAGAUT\Controllers;

use SAGAUT\Models\Asignacion;
use SAGAUT\Models\Vehiculo;
use SAGAUT\Models\Chofer;
use SAGAUT\Utils\Response;

class AsignacionController
{
    private Asignacion $asignacionModel;
    private Vehiculo $vehiculoModel;
    private Chofer $choferModel;

    public function __construct()
    {
        $this->asignacionModel = new Asignacion();
        $this->vehiculoModel = new Vehiculo();
        $this->choferModel = new Chofer();
    }

    public function index(): void
    {
        try {
            $page = (int)($_GET['page'] ?? 1);
            $perPage = (int)($_GET['per_page'] ?? 10);
            $filters = [
                'vehiculo' => $_GET['vehiculo'] ?? null,
                'chofer' => $_GET['chofer'] ?? null,
                'fecha_desde' => $_GET['fecha_desde'] ?? null,
                'fecha_hasta' => $_GET['fecha_hasta'] ?? null,
            ];

            // Limpiar filtros vacíos
            $filters = array_filter($filters, function($value) {
                return $value !== null && $value !== '';
            });

            $asignaciones = $this->asignacionModel->getAsignacionesConDetalles($filters, $page, $perPage);
            $total = $this->asignacionModel->count($filters);

            Response::paginated($asignaciones, $total, $page, $perPage, 'Asignaciones obtenidas exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener asignaciones: ' . $e->getMessage());
        }
    }

    public function show(string $id): void
    {
        try {
            $asignacionId = (int)$id;
            
            if ($asignacionId <= 0) {
                Response::error('ID de asignación inválido', 400);
            }

            $asignacion = $this->asignacionModel->getAsignacionConDetalles($asignacionId);

            if (!$asignacion) {
                Response::notFound('Asignación no encontrada');
            }

            Response::success($asignacion, 'Asignación obtenida exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener asignación: ' . $e->getMessage());
        }
    }

    public function store(): void
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input) {
                Response::error('Datos de entrada inválidos', 400);
            }

            // Validar datos requeridos
            $required = ['vehiculo', 'fecha_asignacion'];
            $errors = [];

            foreach ($required as $field) {
                if (!isset($input[$field]) || empty($input[$field])) {
                    $errors[$field] = "El campo {$field} es requerido";
                }
            }

            if (!empty($errors)) {
                Response::validationError($errors);
            }

            // Validar que el vehículo existe
            $vehiculo = $this->vehiculoModel->find($input['vehiculo']);
            if (!$vehiculo) {
                Response::error('Vehículo no encontrado', 404);
            }

            // Validar que el chofer existe (si se proporciona)
            if (!empty($input['chofer'])) {
                $chofer = $this->choferModel->find($input['chofer']);
                if (!$chofer) {
                    Response::error('Chofer no encontrado', 404);
                }
            }

            // Validar fechas
            $fechaAsignacion = \DateTime::createFromFormat('Y-m-d', $input['fecha_asignacion']);
            if (!$fechaAsignacion || $fechaAsignacion->format('Y-m-d') !== $input['fecha_asignacion']) {
                $errors['fecha_asignacion'] = 'Formato de fecha inválido (YYYY-MM-DD)';
            }

            if (isset($input['fecha_devolucion']) && !empty($input['fecha_devolucion'])) {
                $fechaDevolucion = \DateTime::createFromFormat('Y-m-d', $input['fecha_devolucion']);
                if (!$fechaDevolucion || $fechaDevolucion->format('Y-m-d') !== $input['fecha_devolucion']) {
                    $errors['fecha_devolucion'] = 'Formato de fecha inválido (YYYY-MM-DD)';
                } elseif ($fechaDevolucion < $fechaAsignacion) {
                    $errors['fecha_devolucion'] = 'La fecha de devolución debe ser posterior a la fecha de asignación';
                }
            }

            if (!empty($errors)) {
                Response::validationError($errors);
            }

            // Verificar disponibilidad del vehículo
            $fechaFin = $input['fecha_devolucion'] ?? $input['fecha_asignacion'];
            if (!$this->asignacionModel->verificarDisponibilidadVehiculo($input['vehiculo'], $input['fecha_asignacion'], $fechaFin)) {
                Response::error('El vehículo no está disponible en las fechas seleccionadas', 409);
            }

            // Verificar disponibilidad del chofer (si se proporciona)
            if (!empty($input['chofer'])) {
                if (!$this->asignacionModel->verificarDisponibilidadChofer($input['chofer'], $input['fecha_asignacion'], $fechaFin)) {
                    Response::error('El chofer no está disponible en las fechas seleccionadas', 409);
                }
            }

            // Preparar datos para inserción
            $data = [
                'vehiculo' => (int)$input['vehiculo'],
                'chofer' => !empty($input['chofer']) ? (int)$input['chofer'] : null,
                'fecha_asignacion' => $input['fecha_asignacion'],
                'fecha_devolucion' => $input['fecha_devolucion'] ?? null,
                'observacion' => $input['observacion'] ?? null
            ];

            $asignacionId = $this->asignacionModel->create($data);

            if ($asignacionId) {
                $asignacion = $this->asignacionModel->getAsignacionConDetalles($asignacionId);
                Response::success($asignacion, 'Asignación creada exitosamente', 201);
            } else {
                Response::serverError('Error al crear asignación');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al crear asignación: ' . $e->getMessage());
        }
    }

    public function update(string $id): void
    {
        try {
            $asignacionId = (int)$id;
            
            if ($asignacionId <= 0) {
                Response::error('ID de asignación inválido', 400);
            }

            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input) {
                Response::error('Datos de entrada inválidos', 400);
            }

            // Verificar que la asignación existe
            $existingAsignacion = $this->asignacionModel->find($asignacionId);
            if (!$existingAsignacion) {
                Response::notFound('Asignación no encontrada');
            }

            // Si la asignación ya tiene fecha de devolución, no se puede modificar
            if (!empty($existingAsignacion['fecha_devolucion'])) {
                Response::error('No se puede modificar una asignación que ya ha sido devuelta', 409);
            }

            // Preparar datos para actualización
            $data = [];
            $allowedFields = [
                'vehiculo', 'chofer', 'fecha_asignacion', 'fecha_devolucion', 'observacion'
            ];

            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    if (in_array($field, ['vehiculo', 'chofer'])) {
                        $data[$field] = (int)$input[$field];
                    } else {
                        $data[$field] = $input[$field];
                    }
                }
            }

            if (empty($data)) {
                Response::error('No hay datos para actualizar', 400);
            }

            // Si se está cambiando el vehículo o las fechas, verificar disponibilidad
            if (isset($data['vehiculo']) || isset($data['fecha_asignacion']) || isset($data['fecha_devolucion'])) {
                $vehiculoId = $data['vehiculo'] ?? $existingAsignacion['vehiculo'];
                $fechaInicio = $data['fecha_asignacion'] ?? $existingAsignacion['fecha_asignacion'];
                $fechaFin = $data['fecha_devolucion'] ?? $existingAsignacion['fecha_devolucion'] ?? $fechaInicio;

                if (!$this->asignacionModel->verificarDisponibilidadVehiculo($vehiculoId, $fechaInicio, $fechaFin, $asignacionId)) {
                    Response::error('El vehículo no está disponible en las fechas seleccionadas', 409);
                }
            }

            // Si se está cambiando el chofer o las fechas, verificar disponibilidad del chofer
            if (isset($data['chofer']) || isset($data['fecha_asignacion']) || isset($data['fecha_devolucion'])) {
                $choferId = $data['chofer'] ?? $existingAsignacion['chofer'];
                if ($choferId) {
                    $fechaInicio = $data['fecha_asignacion'] ?? $existingAsignacion['fecha_asignacion'];
                    $fechaFin = $data['fecha_devolucion'] ?? $existingAsignacion['fecha_devolucion'] ?? $fechaInicio;

                    if (!$this->asignacionModel->verificarDisponibilidadChofer($choferId, $fechaInicio, $fechaFin, $asignacionId)) {
                        Response::error('El chofer no está disponible en las fechas seleccionadas', 409);
                    }
                }
            }

            $success = $this->asignacionModel->update($asignacionId, $data);

            if ($success) {
                $asignacion = $this->asignacionModel->getAsignacionConDetalles($asignacionId);
                Response::success($asignacion, 'Asignación actualizada exitosamente');
            } else {
                Response::serverError('Error al actualizar asignación');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al actualizar asignación: ' . $e->getMessage());
        }
    }

    public function delete(string $id): void
    {
        try {
            $asignacionId = (int)$id;
            
            if ($asignacionId <= 0) {
                Response::error('ID de asignación inválido', 400);
            }

            // Verificar que la asignación existe
            $asignacion = $this->asignacionModel->find($asignacionId);
            if (!$asignacion) {
                Response::notFound('Asignación no encontrada');
            }

            // Si la asignación no tiene fecha de devolución, no se puede eliminar directamente
            if (empty($asignacion['fecha_devolucion'])) {
                Response::error('No se puede eliminar una asignación activa. Debe finalizarla primero', 409);
            }

            // Soft delete
            $success = $this->asignacionModel->softDelete($asignacionId);

            if ($success) {
                Response::success([], 'Asignación eliminada exitosamente');
            } else {
                Response::serverError('Error al eliminar asignación');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al eliminar asignación: ' . $e->getMessage());
        }
    }

    public function finalizar(string $id): void
    {
        try {
            $asignacionId = (int)$id;
            
            if ($asignacionId <= 0) {
                Response::error('ID de asignación inválido', 400);
            }

            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input || !isset($input['fecha_devolucion'])) {
                Response::error('La fecha de devolución es requerida', 400);
            }

            $asignacion = $this->asignacionModel->find($asignacionId);
            if (!$asignacion) {
                Response::notFound('Asignación no encontrada');
            }

            if (!empty($asignacion['fecha_devolucion'])) {
                Response::error('Esta asignación ya ha sido finalizada', 409);
            }

            $success = $this->asignacionModel->finalizarAsignacion(
                $asignacionId,
                $input['fecha_devolucion'],
                $input['observaciones'] ?? null
            );

            if ($success) {
                $asignacion = $this->asignacionModel->getAsignacionConDetalles($asignacionId);
                Response::success($asignacion, 'Asignación finalizada exitosamente');
            } else {
                Response::serverError('Error al finalizar asignación');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al finalizar asignación: ' . $e->getMessage());
        }
    }

    public function cancelar(string $id): void
    {
        try {
            $asignacionId = (int)$id;
            
            if ($asignacionId <= 0) {
                Response::error('ID de asignación inválido', 400);
            }

            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input || !isset($input['motivo'])) {
                Response::error('El motivo de cancelación es requerido', 400);
            }

            $asignacion = $this->asignacionModel->find($asignacionId);
            if (!$asignacion) {
                Response::notFound('Asignación no encontrada');
            }

            if (!empty($asignacion['fecha_devolucion'])) {
                Response::error('Esta asignación ya ha sido finalizada', 409);
            }

            $success = $this->asignacionModel->cancelarAsignacion($asignacionId, $input['motivo']);

            if ($success) {
                $asignacion = $this->asignacionModel->getAsignacionConDetalles($asignacionId);
                Response::success($asignacion, 'Asignación cancelada exitosamente');
            } else {
                Response::serverError('Error al cancelar asignación');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al cancelar asignación: ' . $e->getMessage());
        }
    }

    public function activas(): void
    {
        try {
            $asignaciones = $this->asignacionModel->getAsignacionesActivas();
            Response::success($asignaciones, 'Asignaciones activas obtenidas exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener asignaciones activas: ' . $e->getMessage());
        }
    }

    public function porVencer(): void
    {
        try {
            $dias = (int)($_GET['dias'] ?? 7);
            $asignaciones = $this->asignacionModel->getAsignacionesPorVencer($dias);
            Response::success($asignaciones, 'Asignaciones por vencer obtenidas exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener asignaciones por vencer: ' . $e->getMessage());
        }
    }

    public function vencidas(): void
    {
        try {
            $asignaciones = $this->asignacionModel->getAsignacionesVencidas();
            Response::success($asignaciones, 'Asignaciones vencidas obtenidas exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener asignaciones vencidas: ' . $e->getMessage());
        }
    }

    public function estadisticas(): void
    {
        try {
            $estadisticas = $this->asignacionModel->getEstadisticasAsignaciones();
            Response::success($estadisticas, 'Estadísticas de asignaciones obtenidas exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener estadísticas: ' . $e->getMessage());
        }
    }
}
