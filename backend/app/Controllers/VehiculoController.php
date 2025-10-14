<?php

namespace SAGAUT\Controllers;

use SAGAUT\Models\Vehiculo;
use SAGAUT\Utils\Response;
use SAGAUT\Utils\JWT;

class VehiculoController
{
    private Vehiculo $vehiculoModel;

    public function __construct()
    {
        $this->vehiculoModel = new Vehiculo();
    }

    public function index(): void
    {
        try {
            $page = (int)($_GET['page'] ?? 1);
            $perPage = (int)($_GET['per_page'] ?? 10);
            $filters = [
                'placa' => $_GET['placa'] ?? '',
                'marca' => $_GET['marca'] ?? '',
                'clase' => $_GET['clase'] ?? '',
                'anio' => $_GET['anio'] ?? ''
            ];

            $vehiculos = $this->vehiculoModel->getVehiculosConDetalles($filters, $page, $perPage);
            
            Response::success($vehiculos, 'Vehículos obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener vehículos: ' . $e->getMessage());
        }
    }

    public function show($id): void
    {
        try {
            $id = (int)$id;
            
            if (!$id) {
                Response::error('ID de vehículo requerido', 400);
            }

            $vehiculo = $this->vehiculoModel->getVehiculoConDetalles($id);
            
            if (!$vehiculo) {
                Response::error('Vehículo no encontrado', 404);
            }

            Response::success($vehiculo, 'Vehículo obtenido exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener vehículo: ' . $e->getMessage());
        }
    }

    public function store(): void
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validar datos requeridos
            $required = ['clase', 'marca', 'modelo', 'anio', 'colorp', 'colors', 'transmision', 'placa', 'scarroceria', 'smotor', 'peso', 'unidadpeso', 'asientos', 'combustible', 'npuestos', 'estado'];
            foreach ($required as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    Response::error("Campo requerido: {$field}", 400);
                }
            }

            // Validar que la placa no exista
            $existing = $this->vehiculoModel->buscarPorPlaca($data['placa']);
            if ($existing) {
                Response::error('Ya existe un vehículo con esta placa', 400);
            }

            // Preparar datos
            $vehiculoData = [
                'clase' => (int)$data['clase'],
                'marca' => (int)$data['marca'],
                'modelo' => (int)$data['modelo'],
                'anio' => (int)$data['anio'],
                'colorp' => (int)$data['colorp'],
                'colors' => (int)$data['colors'],
                'transmision' => (int)$data['transmision'],
                'placa' => strtoupper(trim($data['placa'])),
                'scarroceria' => trim($data['scarroceria']),
                'smotor' => trim($data['smotor']),
                'km' => (int)($data['km'] ?? 0),
                'peso' => (int)$data['peso'],
                'unidadpeso' => (int)$data['unidadpeso'],
                'asientos' => (int)$data['asientos'],
                'combustible' => (int)$data['combustible'],
                'npuestos' => (int)$data['npuestos'],
                'observacion' => $data['observacion'] ?? '',
                'estado' => strtoupper(trim($data['estado'])),
                'fecha_registro' => date('Y-m-d'),
                'eliminado' => 0
            ];

            $id = $this->vehiculoModel->create($vehiculoData);
            
            if ($id) {
                $vehiculo = $this->vehiculoModel->getVehiculoConDetalles($id);
                Response::success($vehiculo, 'Vehículo creado exitosamente', 201);
            } else {
                Response::error('Error al crear vehículo', 500);
            }

        } catch (\Exception $e) {
            Response::serverError('Error al crear vehículo: ' . $e->getMessage());
        }
    }

    public function update($id): void
    {
        try {
            $id = (int)$id;
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$id) {
                Response::error('ID de vehículo requerido', 400);
            }

            // Verificar que el vehículo existe
            $existing = $this->vehiculoModel->find($id);
            if (!$existing) {
                Response::error('Vehículo no encontrado', 404);
            }

            // Validar datos requeridos
            $required = ['clase', 'marca', 'modelo', 'anio', 'colorp', 'colors', 'transmision', 'placa', 'scarroceria', 'smotor', 'peso', 'unidadpeso', 'asientos', 'combustible', 'npuestos', 'estado'];
            foreach ($required as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    Response::error("Campo requerido: {$field}", 400);
                }
            }

            // Validar que la placa no exista en otro vehículo
            $placaExists = $this->vehiculoModel->buscarPorPlaca($data['placa']);
            if ($placaExists && $placaExists['id'] != $id) {
                Response::error('Ya existe otro vehículo con esta placa', 400);
            }

            // Preparar datos
            $vehiculoData = [
                'clase' => (int)$data['clase'],
                'marca' => (int)$data['marca'],
                'modelo' => (int)$data['modelo'],
                'anio' => (int)$data['anio'],
                'colorp' => (int)$data['colorp'],
                'colors' => (int)$data['colors'],
                'transmision' => (int)$data['transmision'],
                'placa' => strtoupper(trim($data['placa'])),
                'scarroceria' => trim($data['scarroceria']),
                'smotor' => trim($data['smotor']),
                'km' => (int)($data['km'] ?? 0),
                'peso' => (int)$data['peso'],
                'unidadpeso' => (int)$data['unidadpeso'],
                'asientos' => (int)$data['asientos'],
                'combustible' => (int)$data['combustible'],
                'npuestos' => (int)$data['npuestos'],
                'observacion' => $data['observacion'] ?? '',
                'estado' => strtoupper(trim($data['estado']))
            ];

            $success = $this->vehiculoModel->update($id, $vehiculoData);
            
            if ($success) {
                $vehiculo = $this->vehiculoModel->getVehiculoConDetalles($id);
                Response::success($vehiculo, 'Vehículo actualizado exitosamente');
            } else {
                Response::error('Error al actualizar vehículo', 500);
            }

        } catch (\Exception $e) {
            Response::serverError('Error al actualizar vehículo: ' . $e->getMessage());
        }
    }

    public function delete($id): void
    {
        try {
            $id = (int)$id;
            
            // Debug log
            error_log("DELETE request - ID: " . $id);
            
            if (!$id) {
                Response::error('ID de vehículo requerido', 400);
            }

            // Verificar que el vehículo existe
            $existing = $this->vehiculoModel->find($id);
            if (!$existing) {
                Response::error('Vehículo no encontrado', 404);
            }

            // Soft delete
            $success = $this->vehiculoModel->update($id, ['eliminado' => 1]);
            
            if ($success) {
                Response::success(null, 'Vehículo eliminado exitosamente');
            } else {
                Response::error('Error al eliminar vehículo', 500);
            }

        } catch (\Exception $e) {
            Response::serverError('Error al eliminar vehículo: ' . $e->getMessage());
        }
    }

    public function disponibles(): void
    {
        try {
            $vehiculos = $this->vehiculoModel->getVehiculosDisponibles();
            Response::success($vehiculos, 'Vehículos disponibles obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener vehículos disponibles: ' . $e->getMessage());
        }
    }

    public function estadisticas(): void
    {
        try {
            $stats = $this->vehiculoModel->getEstadisticasVehiculos();
            Response::success($stats, 'Estadísticas de vehículos obtenidas exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener estadísticas: ' . $e->getMessage());
        }
    }

    public function mantenimientos(): void
    {
        try {
            $id = (int)$_GET['id'];
            
            if (!$id) {
                Response::error('ID de vehículo requerido', 400);
            }

            $mantenimientos = $this->vehiculoModel->getHistorialMantenimientos($id);
            Response::success($mantenimientos, 'Historial de mantenimientos obtenido exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener historial de mantenimientos: ' . $e->getMessage());
        }
    }

    public function asignaciones(): void
    {
        try {
            $id = (int)$_GET['id'];
            
            if (!$id) {
                Response::error('ID de vehículo requerido', 400);
            }

            $asignaciones = $this->vehiculoModel->getHistorialAsignaciones($id);
            Response::success($asignaciones, 'Historial de asignaciones obtenido exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener historial de asignaciones: ' . $e->getMessage());
        }
    }

    public function buscarPorPlaca(): void
    {
        try {
            $placa = $_GET['placa'] ?? '';
            
            if (empty($placa)) {
                Response::error('Placa requerida', 400);
            }

            $vehiculo = $this->vehiculoModel->buscarPorPlaca(strtoupper(trim($placa)));
            
            if (!$vehiculo) {
                Response::error('Vehículo no encontrado', 404);
            }

            Response::success($vehiculo, 'Vehículo encontrado exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al buscar vehículo: ' . $e->getMessage());
        }
    }
}