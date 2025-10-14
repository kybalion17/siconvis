<?php

namespace SAGAUT\Controllers;

use SAGAUT\Models\Mantenimiento;
use SAGAUT\Models\Vehiculo;
use SAGAUT\Utils\Response;

class MantenimientoController
{
    private Mantenimiento $mantenimientoModel;
    private Vehiculo $vehiculoModel;

    public function __construct()
    {
        $this->mantenimientoModel = new Mantenimiento();
        $this->vehiculoModel = new Vehiculo();
    }

    public function index(): void
    {
        try {
            $page = (int)($_GET['page'] ?? 1);
            $perPage = (int)($_GET['per_page'] ?? 10);
            $filters = [
                'estado' => $_GET['estado'] ?? null,
                'vehiculo' => $_GET['vehiculo'] ?? null,
                'tipo_mantenimiento' => $_GET['tipo_mantenimiento'] ?? null,
                'taller' => $_GET['taller'] ?? null,
                'fecha_desde' => $_GET['fecha_desde'] ?? null,
                'fecha_hasta' => $_GET['fecha_hasta'] ?? null,
            ];

            // Limpiar filtros vacíos
            $filters = array_filter($filters, function($value) {
                return $value !== null && $value !== '';
            });

            $mantenimientos = $this->mantenimientoModel->getMantenimientosConDetalles($filters, $page, $perPage);
            $total = $this->mantenimientoModel->count($filters);

            Response::paginated($mantenimientos, $total, $page, $perPage, 'Mantenimientos obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener mantenimientos: ' . $e->getMessage());
        }
    }

    public function show(string $id): void
    {
        try {
            $mantenimientoId = (int)$id;
            
            if ($mantenimientoId <= 0) {
                Response::error('ID de mantenimiento inválido', 400);
            }

            $mantenimiento = $this->mantenimientoModel->getMantenimientoConDetalles($mantenimientoId);

            if (!$mantenimiento) {
                Response::notFound('Mantenimiento no encontrado');
            }

            Response::success($mantenimiento, 'Mantenimiento obtenido exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener mantenimiento: ' . $e->getMessage());
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
            $required = ['vehiculo', 'tipo_mantenimiento', 'fecha_programada'];
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
            $vehiculo = $this->vehiculoModel->find((int)$input['vehiculo']);
            if (!$vehiculo) {
                Response::error('Vehículo no encontrado', 404);
            }

            // Validar fecha
            $fechaMantenimiento = \DateTime::createFromFormat('Y-m-d', $input['fecha_programada']);
            if (!$fechaMantenimiento || $fechaMantenimiento->format('Y-m-d') !== $input['fecha_programada']) {
                $errors['fecha_programada'] = 'Formato de fecha inválido (YYYY-MM-DD)';
            }

            if (!empty($errors)) {
                Response::validationError($errors);
            }

            // Preparar datos para inserción
            $data = [
                'vehiculo' => (int)$input['vehiculo'],
                'tipo_mantenimiento' => (int)$input['tipo_mantenimiento'],
                'taller' => isset($input['taller']) ? (int)$input['taller'] : null,
                'km' => (int)($input['km'] ?? ($vehiculo['km'] ?? 0)),
                'orden_trabajo' => $input['orden_trabajo'] ?? null,
                'fecha_programada' => $input['fecha_programada'],
                'inspector_cedula' => $input['inspector_cedula'] ?? null,
                'inspector_nombre' => $input['inspector_nombre'] ?? null,
                'monto' => isset($input['monto']) ? (float)$input['monto'] : null,
                'descripcion_trabajo' => $input['descripcion_trabajo'] ?? null,
                'estado' => $input['estado'] ?? 'programado'
            ];

            $mantenimientoId = $this->mantenimientoModel->create($data);

            if ($mantenimientoId) {
                $mantenimiento = $this->mantenimientoModel->getMantenimientoConDetalles($mantenimientoId);
                Response::success($mantenimiento, 'Mantenimiento creado exitosamente', 201);
            } else {
                Response::serverError('Error al crear mantenimiento');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al crear mantenimiento: ' . $e->getMessage());
        }
    }

    public function update(string $id): void
    {
        try {
            $mantenimientoId = (int)$id;
            
            if ($mantenimientoId <= 0) {
                Response::error('ID de mantenimiento inválido', 400);
            }

            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input) {
                Response::error('Datos de entrada inválidos', 400);
            }

            // Verificar que el mantenimiento existe
            $existingMantenimiento = $this->mantenimientoModel->find($mantenimientoId);
            if (!$existingMantenimiento) {
                Response::notFound('Mantenimiento no encontrado');
            }

            // Preparar datos para actualización
            $data = [];
            $allowedFields = [
                'vehiculo', 'tipo_mantenimiento', 'taller', 'km',
                'orden_trabajo', 'fecha_programada', 'inspector_cedula', 'inspector_nombre',
                'monto', 'descripcion_trabajo', 'estado'
            ];

            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    if (in_array($field, ['vehiculo', 'tipo_mantenimiento', 'taller', 'km'])) {
                        $data[$field] = (int)$input[$field];
                    } elseif ($field === 'monto') {
                        $data[$field] = (float)$input[$field];
                    } else {
                        $data[$field] = $input[$field];
                    }
                }
            }

            if (empty($data)) {
                Response::error('No hay datos para actualizar', 400);
            }

            $success = $this->mantenimientoModel->update($mantenimientoId, $data);

            if ($success) {
                $mantenimiento = $this->mantenimientoModel->getMantenimientoConDetalles($mantenimientoId);
                Response::success($mantenimiento, 'Mantenimiento actualizado exitosamente');
            } else {
                Response::serverError('Error al actualizar mantenimiento');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al actualizar mantenimiento: ' . $e->getMessage());
        }
    }

    public function delete(string $id): void
    {
        try {
            $mantenimientoId = (int)$id;
            
            if ($mantenimientoId <= 0) {
                Response::error('ID de mantenimiento inválido', 400);
            }

            // Verificar que el mantenimiento existe
            $mantenimiento = $this->mantenimientoModel->find($mantenimientoId);
            if (!$mantenimiento) {
                Response::notFound('Mantenimiento no encontrado');
            }

            // Si el mantenimiento está en proceso, no se puede eliminar
            if ($mantenimiento['estado'] === 'en_proceso') {
                Response::error('No se puede eliminar un mantenimiento en proceso', 409);
            }

            // Soft delete
            $success = $this->mantenimientoModel->softDelete($mantenimientoId);

            if ($success) {
                Response::success([], 'Mantenimiento eliminado exitosamente');
            } else {
                Response::serverError('Error al eliminar mantenimiento');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al eliminar mantenimiento: ' . $e->getMessage());
        }
    }

    public function iniciar(string $id): void
    {
        try {
            $mantenimientoId = (int)$id;
            
            if ($mantenimientoId <= 0) {
                Response::error('ID de mantenimiento inválido', 400);
            }

            $input = json_decode(file_get_contents('php://input'), true);

            $mantenimiento = $this->mantenimientoModel->find($mantenimientoId);
            if (!$mantenimiento) {
                Response::notFound('Mantenimiento no encontrado');
            }

            if ($mantenimiento['estado'] !== 'programado') {
                Response::error('Solo se pueden iniciar mantenimientos programados', 409);
            }

            $success = $this->mantenimientoModel->iniciarMantenimiento(
                $mantenimientoId,
                $input['orden_trabajo'] ?? null,
                $input['inspector_cedula'] ?? null,
                $input['inspector_nombre'] ?? null
            );

            if ($success) {
                $mantenimiento = $this->mantenimientoModel->getMantenimientoConDetalles($mantenimientoId);
                Response::success($mantenimiento, 'Mantenimiento iniciado exitosamente');
            } else {
                Response::serverError('Error al iniciar mantenimiento');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al iniciar mantenimiento: ' . $e->getMessage());
        }
    }

    public function completar(string $id): void
    {
        try {
            $mantenimientoId = (int)$id;
            
            if ($mantenimientoId <= 0) {
                Response::error('ID de mantenimiento inválido', 400);
            }

            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input || !isset($input['monto'])) {
                Response::error('El monto es requerido para completar el mantenimiento', 400);
            }

            $mantenimiento = $this->mantenimientoModel->find($mantenimientoId);
            if (!$mantenimiento) {
                Response::notFound('Mantenimiento no encontrado');
            }

            if ($mantenimiento['estado'] !== 'en_proceso') {
                Response::error('Solo se pueden completar mantenimientos en proceso', 409);
            }

            $success = $this->mantenimientoModel->completarMantenimiento(
                $mantenimientoId,
                (float)$input['monto'],
                $input['descripcion_trabajo'] ?? null
            );

            if ($success) {
                $mantenimiento = $this->mantenimientoModel->getMantenimientoConDetalles($mantenimientoId);
                Response::success($mantenimiento, 'Mantenimiento completado exitosamente');
            } else {
                Response::serverError('Error al completar mantenimiento');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al completar mantenimiento: ' . $e->getMessage());
        }
    }

    public function cancelar(string $id): void
    {
        try {
            $mantenimientoId = (int)$id;
            
            if ($mantenimientoId <= 0) {
                Response::error('ID de mantenimiento inválido', 400);
            }

            $input = json_decode(file_get_contents('php://input'), true);

            $mantenimiento = $this->mantenimientoModel->find($mantenimientoId);
            if (!$mantenimiento) {
                Response::notFound('Mantenimiento no encontrado');
            }

            if (in_array($mantenimiento['estado'], ['completado', 'cancelado'])) {
                Response::error('No se puede cancelar un mantenimiento ' . $mantenimiento['estado'], 409);
            }

            $success = $this->mantenimientoModel->cancelarMantenimiento(
                $mantenimientoId,
                $input['motivo'] ?? null
            );

            if ($success) {
                $mantenimiento = $this->mantenimientoModel->getMantenimientoConDetalles($mantenimientoId);
                Response::success($mantenimiento, 'Mantenimiento cancelado exitosamente');
            } else {
                Response::serverError('Error al cancelar mantenimiento');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al cancelar mantenimiento: ' . $e->getMessage());
        }
    }

    public function pendientes(): void
    {
        try {
            $mantenimientos = $this->mantenimientoModel->getMantenimientosPendientes();
            Response::success($mantenimientos, 'Mantenimientos pendientes obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener mantenimientos pendientes: ' . $e->getMessage());
        }
    }

    public function porVencer(): void
    {
        try {
            $dias = (int)($_GET['dias'] ?? 7);
            $mantenimientos = $this->mantenimientoModel->getMantenimientosPorVencer($dias);
            Response::success($mantenimientos, 'Mantenimientos por vencer obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener mantenimientos por vencer: ' . $e->getMessage());
        }
    }

    public function vencidos(): void
    {
        try {
            $mantenimientos = $this->mantenimientoModel->getMantenimientosVencidos();
            Response::success($mantenimientos, 'Mantenimientos vencidos obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener mantenimientos vencidos: ' . $e->getMessage());
        }
    }

    public function estadisticas(): void
    {
        try {
            $estadisticas = $this->mantenimientoModel->getEstadisticasMantenimientos();
            Response::success($estadisticas, 'Estadísticas de mantenimientos obtenidas exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener estadísticas: ' . $e->getMessage());
        }
    }

    public function porVehiculo(string $vehiculoId): void
    {
        try {
            $vehiculoIdInt = (int)$vehiculoId;
            
            if ($vehiculoIdInt <= 0) {
                Response::error('ID de vehículo inválido', 400);
            }

            $limit = (int)($_GET['limit'] ?? 10);
            $mantenimientos = $this->mantenimientoModel->getMantenimientosPorVehiculo($vehiculoIdInt, $limit);
            Response::success($mantenimientos, 'Mantenimientos del vehículo obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener mantenimientos del vehículo: ' . $e->getMessage());
        }
    }

    public function proximos(string $vehiculoId): void
    {
        try {
            $vehiculoIdInt = (int)$vehiculoId;
            
            if ($vehiculoIdInt <= 0) {
                Response::error('ID de vehículo inválido', 400);
            }

            $proximos = $this->mantenimientoModel->getProximosMantenimientos($vehiculoIdInt);
            Response::success($proximos, 'Próximos mantenimientos del vehículo obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener próximos mantenimientos: ' . $e->getMessage());
        }
    }

    public function programar(): void
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input) {
                Response::error('Datos de entrada inválidos', 400);
            }

            $required = ['vehiculo', 'tipo_mantenimiento', 'fecha_programada'];
            $errors = [];

            foreach ($required as $field) {
                if (!isset($input[$field]) || empty($input[$field])) {
                    $errors[$field] = "El campo {$field} es requerido";
                }
            }

            if (!empty($errors)) {
                Response::validationError($errors);
            }

            $mantenimientoId = $this->mantenimientoModel->programarMantenimiento(
                (int)$input['vehiculo'],
                (int)$input['tipo_mantenimiento'],
                $input['fecha_programada'],
                isset($input['taller']) ? (int)$input['taller'] : null,
                $input['observaciones'] ?? null
            );

            if ($mantenimientoId) {
                $mantenimiento = $this->mantenimientoModel->getMantenimientoConDetalles($mantenimientoId);
                Response::success($mantenimiento, 'Mantenimiento programado exitosamente', 201);
            } else {
                Response::serverError('Error al programar mantenimiento');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al programar mantenimiento: ' . $e->getMessage());
        }
    }
}
