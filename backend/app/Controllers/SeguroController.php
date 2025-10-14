<?php

namespace SAGAUT\Controllers;

use SAGAUT\Models\Seguro;
use SAGAUT\Models\Vehiculo;
use SAGAUT\Utils\Response;

class SeguroController
{
    private Seguro $seguroModel;
    private Vehiculo $vehiculoModel;

    public function __construct()
    {
        $this->seguroModel = new Seguro();
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
                'aseguradora' => $_GET['aseguradora'] ?? null,
                'estado_vencimiento' => $_GET['estado_vencimiento'] ?? null,
                'fecha_desde' => $_GET['fecha_desde'] ?? null,
                'fecha_hasta' => $_GET['fecha_hasta'] ?? null,
            ];

            // Limpiar filtros vacíos
            $filters = array_filter($filters, function($value) {
                return $value !== null && $value !== '';
            });

            $seguros = $this->seguroModel->getSegurosConDetalles($filters, $page, $perPage);
            $total = $this->seguroModel->count($filters);

            Response::paginated($seguros, $total, $page, $perPage, 'Seguros obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener seguros: ' . $e->getMessage());
        }
    }

    public function show(string $id): void
    {
        try {
            $seguroId = (int)$id;
            
            if ($seguroId <= 0) {
                Response::error('ID de seguro inválido', 400);
            }

            $seguro = $this->seguroModel->getSeguroConDetalles($seguroId);

            if (!$seguro) {
                Response::notFound('Seguro no encontrado');
            }

            Response::success($seguro, 'Seguro obtenido exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener seguro: ' . $e->getMessage());
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
            $required = ['vehiculo', 'aseguradora', 'numero_poliza', 'fecha_inicio', 'fecha_vencimiento'];
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

            // Validar que el número de póliza no exista
            $existingSeguro = $this->seguroModel->buscarPorNumeroPoliza($input['numero_poliza']);
            if ($existingSeguro) {
                Response::error('Ya existe un seguro con este número de póliza', 409);
            }

            // Validar fechas
            $fechaInicio = \DateTime::createFromFormat('Y-m-d', $input['fecha_inicio']);
            $fechaVencimiento = \DateTime::createFromFormat('Y-m-d', $input['fecha_vencimiento']);
            
            if (!$fechaInicio || $fechaInicio->format('Y-m-d') !== $input['fecha_inicio']) {
                $errors['fecha_inicio'] = 'Formato de fecha inválido (YYYY-MM-DD)';
            }
            
            if (!$fechaVencimiento || $fechaVencimiento->format('Y-m-d') !== $input['fecha_vencimiento']) {
                $errors['fecha_vencimiento'] = 'Formato de fecha inválido (YYYY-MM-DD)';
            } elseif ($fechaVencimiento <= $fechaInicio) {
                $errors['fecha_vencimiento'] = 'La fecha de vencimiento debe ser posterior a la fecha de inicio';
            }

            if (!empty($errors)) {
                Response::validationError($errors);
            }

            // Preparar datos para inserción
            $data = [
                'vehiculo' => (int)$input['vehiculo'],
                'aseguradora' => (int)$input['aseguradora'],
                'numero_poliza' => trim($input['numero_poliza']),
                'fecha_inicio' => $input['fecha_inicio'],
                'fecha_vencimiento' => $input['fecha_vencimiento'],
                'prima' => isset($input['prima']) ? (float)$input['prima'] : null,
                'estado' => $input['estado'] ?? 'activo'
            ];

            $seguroId = $this->seguroModel->create($data);

            if ($seguroId) {
                $seguro = $this->seguroModel->getSeguroConDetalles($seguroId);
                Response::success($seguro, 'Seguro creado exitosamente', 201);
            } else {
                Response::serverError('Error al crear seguro');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al crear seguro: ' . $e->getMessage());
        }
    }

    public function update(string $id): void
    {
        try {
            $seguroId = (int)$id;
            
            if ($seguroId <= 0) {
                Response::error('ID de seguro inválido', 400);
            }

            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input) {
                Response::error('Datos de entrada inválidos', 400);
            }

            // Verificar que el seguro existe
            $existingSeguro = $this->seguroModel->find($seguroId);
            if (!$existingSeguro) {
                Response::notFound('Seguro no encontrado');
            }

            // Si se está cambiando el número de póliza, verificar que no exista otra
            if (isset($input['numero_poliza']) && $input['numero_poliza'] !== $existingSeguro['numero_poliza']) {
                $polizaExists = $this->seguroModel->buscarPorNumeroPoliza($input['numero_poliza']);
                if ($polizaExists && $polizaExists['id'] != $seguroId) {
                    Response::error('Ya existe otro seguro con este número de póliza', 409);
                }
            }

            // Preparar datos para actualización
            $data = [];
            $allowedFields = [
                'vehiculo', 'aseguradora', 'numero_poliza', 'fecha_inicio', 'fecha_vencimiento',
                'prima', 'estado'
            ];

            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    if (in_array($field, ['vehiculo', 'aseguradora'])) {
                        $data[$field] = (int)$input[$field];
                    } elseif (in_array($field, ['prima'])) {
                        $data[$field] = (float)$input[$field];
                    } else {
                        $data[$field] = $input[$field];
                    }
                }
            }

            if (empty($data)) {
                Response::error('No hay datos para actualizar', 400);
            }

            $success = $this->seguroModel->update($seguroId, $data);

            if ($success) {
                $seguro = $this->seguroModel->getSeguroConDetalles($seguroId);
                Response::success($seguro, 'Seguro actualizado exitosamente');
            } else {
                Response::serverError('Error al actualizar seguro');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al actualizar seguro: ' . $e->getMessage());
        }
    }

    public function delete(string $id): void
    {
        try {
            $seguroId = (int)$id;
            
            if ($seguroId <= 0) {
                Response::error('ID de seguro inválido', 400);
            }

            // Verificar que el seguro existe
            $seguro = $this->seguroModel->find($seguroId);
            if (!$seguro) {
                Response::notFound('Seguro no encontrado');
            }

            // Soft delete
            $success = $this->seguroModel->softDelete($seguroId);

            if ($success) {
                Response::success([], 'Seguro eliminado exitosamente');
            } else {
                Response::serverError('Error al eliminar seguro');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al eliminar seguro: ' . $e->getMessage());
        }
    }

    public function porVencer(): void
    {
        try {
            $dias = (int)($_GET['dias'] ?? 30);
            $seguros = $this->seguroModel->getSegurosPorVencer($dias);
            Response::success($seguros, 'Seguros por vencer obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener seguros por vencer: ' . $e->getMessage());
        }
    }

    public function vencidos(): void
    {
        try {
            $seguros = $this->seguroModel->getSegurosVencidos();
            Response::success($seguros, 'Seguros vencidos obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener seguros vencidos: ' . $e->getMessage());
        }
    }

    public function estadisticas(): void
    {
        try {
            $estadisticas = $this->seguroModel->getEstadisticasSeguros();
            Response::success($estadisticas, 'Estadísticas de seguros obtenidas exitosamente');

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

            $seguros = $this->seguroModel->getSegurosPorVehiculo($vehiculoIdInt);
            Response::success($seguros, 'Seguros del vehículo obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener seguros del vehículo: ' . $e->getMessage());
        }
    }

    public function activo(string $vehiculoId): void
    {
        try {
            $vehiculoIdInt = (int)$vehiculoId;
            
            if ($vehiculoIdInt <= 0) {
                Response::error('ID de vehículo inválido', 400);
            }

            $seguro = $this->seguroModel->getSeguroActivo($vehiculoIdInt);
            
            if (!$seguro) {
                Response::success(null, 'El vehículo no tiene seguro activo');
            } else {
                Response::success($seguro, 'Seguro activo obtenido exitosamente');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al obtener seguro activo: ' . $e->getMessage());
        }
    }

    public function renovar(string $id): void
    {
        try {
            $seguroId = (int)$id;
            
            if ($seguroId <= 0) {
                Response::error('ID de seguro inválido', 400);
            }

            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input) {
                Response::error('Datos de entrada inválidos', 400);
            }

            $required = ['nueva_fecha_inicio', 'nueva_fecha_vencimiento'];
            $errors = [];

            foreach ($required as $field) {
                if (!isset($input[$field]) || empty($input[$field])) {
                    $errors[$field] = "El campo {$field} es requerido";
                }
            }

            if (!empty($errors)) {
                Response::validationError($errors);
            }

            $seguro = $this->seguroModel->find($seguroId);
            if (!$seguro) {
                Response::notFound('Seguro no encontrado');
            }

            $nuevoSeguroId = $this->seguroModel->renovarSeguro(
                $seguroId,
                $input['nueva_fecha_inicio'],
                $input['nueva_fecha_vencimiento'],
                isset($input['nueva_prima']) ? (float)$input['nueva_prima'] : null
            );

            if ($nuevoSeguroId) {
                $nuevoSeguro = $this->seguroModel->getSeguroConDetalles($nuevoSeguroId);
                Response::success($nuevoSeguro, 'Seguro renovado exitosamente', 201);
            } else {
                Response::serverError('Error al renovar seguro');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al renovar seguro: ' . $e->getMessage());
        }
    }

    public function alertas(): void
    {
        try {
            $alertas = $this->seguroModel->getAlertasVencimiento();
            Response::success($alertas, 'Alertas de vencimiento obtenidas exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener alertas de vencimiento: ' . $e->getMessage());
        }
    }
}
