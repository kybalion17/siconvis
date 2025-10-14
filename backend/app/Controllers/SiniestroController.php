<?php

namespace SAGAUT\Controllers;

use SAGAUT\Models\Siniestro;
use SAGAUT\Models\Vehiculo;
use SAGAUT\Utils\Response;

class SiniestroController
{
    private Siniestro $siniestroModel;
    private Vehiculo $vehiculoModel;

    public function __construct()
    {
        $this->siniestroModel = new Siniestro();
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
                'tipo_siniestro' => $_GET['tipo_siniestro'] ?? null,
                'fecha_desde' => $_GET['fecha_desde'] ?? null,
                'fecha_hasta' => $_GET['fecha_hasta'] ?? null,
            ];

            // Limpiar filtros vacíos
            $filters = array_filter($filters, function($value) {
                return $value !== null && $value !== '';
            });

            $siniestros = $this->siniestroModel->getSiniestrosConDetalles($filters, $page, $perPage);
            $total = $this->siniestroModel->count($filters);

            Response::paginated($siniestros, $total, $page, $perPage, 'Siniestros obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener siniestros: ' . $e->getMessage());
        }
    }

    public function show(string $id): void
    {
        try {
            $siniestroId = (int)$id;
            
            if ($siniestroId <= 0) {
                Response::error('ID de siniestro inválido', 400);
            }

            $siniestro = $this->siniestroModel->getSiniestroConDetalles($siniestroId);

            if (!$siniestro) {
                Response::notFound('Siniestro no encontrado');
            }

            Response::success($siniestro, 'Siniestro obtenido exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener siniestro: ' . $e->getMessage());
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
            $required = ['vehiculo', 'fecha_siniestro', 'tipo_siniestro'];
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
            $fechaOcurrencia = \DateTime::createFromFormat('Y-m-d', $input['fecha_siniestro']);
            if (!$fechaOcurrencia || $fechaOcurrencia->format('Y-m-d') !== $input['fecha_siniestro']) {
                $errors['fecha_siniestro'] = 'Formato de fecha inválido (YYYY-MM-DD)';
            }

            // Validar tipo de siniestro
            $tiposValidos = ['colision', 'volcamiento', 'choque', 'atropello', 'otro'];
            if (!in_array($input['tipo_siniestro'], $tiposValidos)) {
                $errors['tipo_siniestro'] = 'Tipo de siniestro inválido';
            }

            if (!empty($errors)) {
                Response::validationError($errors);
            }

            // Preparar datos para inserción
            $data = [
                'vehiculo' => (int)$input['vehiculo'],
                'fecha_siniestro' => $input['fecha_siniestro'],
                'tipo_siniestro' => $input['tipo_siniestro'],
                'taller' => isset($input['taller']) ? (int)$input['taller'] : null,
                'intervino_transito' => isset($input['intervino_transito']) ? (bool)$input['intervino_transito'] : false,
                'causa' => $input['causa'] ?? null,
                'danos_estimados' => isset($input['danos_estimados']) ? (float)$input['danos_estimados'] : null,
                'fecha_denuncia' => $input['fecha_denuncia'] ?? null,
                'numero_denuncia' => $input['numero_denuncia'] ?? null,
                'monto' => isset($input['monto']) ? (float)$input['monto'] : null,
                'estado' => $input['estado'] ?? 'reportado'
            ];

            $siniestroId = $this->siniestroModel->create($data);

            if ($siniestroId) {
                $siniestro = $this->siniestroModel->getSiniestroConDetalles($siniestroId);
                Response::success($siniestro, 'Siniestro creado exitosamente', 201);
            } else {
                Response::serverError('Error al crear siniestro');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al crear siniestro: ' . $e->getMessage());
        }
    }

    public function update(string $id): void
    {
        try {
            $siniestroId = (int)$id;
            
            if ($siniestroId <= 0) {
                Response::error('ID de siniestro inválido', 400);
            }

            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input) {
                Response::error('Datos de entrada inválidos', 400);
            }

            // Verificar que el siniestro existe
            $existingSiniestro = $this->siniestroModel->find($siniestroId);
            if (!$existingSiniestro) {
                Response::notFound('Siniestro no encontrado');
            }

            // Preparar datos para actualización
            $data = [];
            $allowedFields = [
                'vehiculo', 'fecha_siniestro', 'tipo_siniestro', 'taller',
                'intervino_transito', 'causa', 'danos_estimados',
                'fecha_denuncia', 'numero_denuncia', 'monto', 'estado'
            ];

            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    if (in_array($field, ['vehiculo', 'taller'])) {
                        $data[$field] = (int)$input[$field];
                    } elseif (in_array($field, ['monto', 'danos_estimados'])) {
                        $data[$field] = (float)$input[$field];
                    } elseif (in_array($field, ['intervino_transito'])) {
                        $data[$field] = (bool)$input[$field];
                    } else {
                        $data[$field] = $input[$field];
                    }
                }
            }

            if (empty($data)) {
                Response::error('No hay datos para actualizar', 400);
            }

            $success = $this->siniestroModel->update($siniestroId, $data);

            if ($success) {
                $siniestro = $this->siniestroModel->getSiniestroConDetalles($siniestroId);
                Response::success($siniestro, 'Siniestro actualizado exitosamente');
            } else {
                Response::serverError('Error al actualizar siniestro');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al actualizar siniestro: ' . $e->getMessage());
        }
    }

    public function delete(string $id): void
    {
        try {
            $siniestroId = (int)$id;
            
            if ($siniestroId <= 0) {
                Response::error('ID de siniestro inválido', 400);
            }

            // Verificar que el siniestro existe
            $siniestro = $this->siniestroModel->find($siniestroId);
            if (!$siniestro) {
                Response::notFound('Siniestro no encontrado');
            }

            // Soft delete
            $success = $this->siniestroModel->softDelete($siniestroId);

            if ($success) {
                Response::success([], 'Siniestro eliminado exitosamente');
            } else {
                Response::serverError('Error al eliminar siniestro');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al eliminar siniestro: ' . $e->getMessage());
        }
    }

    public function abiertos(): void
    {
        try {
            $siniestros = $this->siniestroModel->getSiniestrosAbiertos();
            Response::success($siniestros, 'Siniestros abiertos obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener siniestros abiertos: ' . $e->getMessage());
        }
    }

    public function porTipo(): void
    {
        try {
            $siniestros = $this->siniestroModel->getSiniestrosPorTipo();
            Response::success($siniestros, 'Siniestros por tipo obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener siniestros por tipo: ' . $e->getMessage());
        }
    }

    public function estadisticas(): void
    {
        try {
            $estadisticas = $this->siniestroModel->getEstadisticasSiniestros();
            Response::success($estadisticas, 'Estadísticas de siniestros obtenidas exitosamente');

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

            $siniestros = $this->siniestroModel->getSiniestrosPorVehiculo($vehiculoIdInt);
            Response::success($siniestros, 'Siniestros del vehículo obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener siniestros del vehículo: ' . $e->getMessage());
        }
    }

    public function porPeriodo(): void
    {
        try {
            $fechaInicio = $_GET['fecha_inicio'] ?? date('Y-m-01');
            $fechaFin = $_GET['fecha_fin'] ?? date('Y-m-t');

            $siniestros = $this->siniestroModel->getSiniestrosPorPeriodo($fechaInicio, $fechaFin);
            Response::success($siniestros, 'Siniestros del período obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener siniestros del período: ' . $e->getMessage());
        }
    }

    public function conTransito(): void
    {
        try {
            $siniestros = $this->siniestroModel->getSiniestrosConTransito();
            Response::success($siniestros, 'Siniestros con tránsito obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener siniestros con tránsito: ' . $e->getMessage());
        }
    }

    public function conDenuncia(): void
    {
        try {
            $siniestros = $this->siniestroModel->getSiniestrosConDenuncia();
            Response::success($siniestros, 'Siniestros con denuncia obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener siniestros con denuncia: ' . $e->getMessage());
        }
    }

    public function cerrar(string $id): void
    {
        try {
            $siniestroId = (int)$id;
            
            if ($siniestroId <= 0) {
                Response::error('ID de siniestro inválido', 400);
            }

            $input = json_decode(file_get_contents('php://input'), true);

            $siniestro = $this->siniestroModel->find($siniestroId);
            if (!$siniestro) {
                Response::notFound('Siniestro no encontrado');
            }

            if ($siniestro['estado'] === 'cerrado') {
                Response::error('El siniestro ya está cerrado', 409);
            }

            $success = $this->siniestroModel->cerrarSiniestro(
                $siniestroId,
                $input['observaciones'] ?? null
            );

            if ($success) {
                $siniestro = $this->siniestroModel->getSiniestroConDetalles($siniestroId);
                Response::success($siniestro, 'Siniestro cerrado exitosamente');
            } else {
                Response::serverError('Error al cerrar siniestro');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al cerrar siniestro: ' . $e->getMessage());
        }
    }

    public function archivar(string $id): void
    {
        try {
            $siniestroId = (int)$id;
            
            if ($siniestroId <= 0) {
                Response::error('ID de siniestro inválido', 400);
            }

            $input = json_decode(file_get_contents('php://input'), true);

            $siniestro = $this->siniestroModel->find($siniestroId);
            if (!$siniestro) {
                Response::notFound('Siniestro no encontrado');
            }

            if ($siniestro['estado'] === 'archivado') {
                Response::error('El siniestro ya está archivado', 409);
            }

            $success = $this->siniestroModel->archivarSiniestro(
                $siniestroId,
                $input['motivo'] ?? null
            );

            if ($success) {
                $siniestro = $this->siniestroModel->getSiniestroConDetalles($siniestroId);
                Response::success($siniestro, 'Siniestro archivado exitosamente');
            } else {
                Response::serverError('Error al archivar siniestro');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al archivar siniestro: ' . $e->getMessage());
        }
    }

    public function porTaller(string $tallerId): void
    {
        try {
            $tallerIdInt = (int)$tallerId;
            
            if ($tallerIdInt <= 0) {
                Response::error('ID de taller inválido', 400);
            }

            $siniestros = $this->siniestroModel->getSiniestrosPorTaller($tallerIdInt);
            Response::success($siniestros, 'Siniestros del taller obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener siniestros del taller: ' . $e->getMessage());
        }
    }

    public function porMes(): void
    {
        try {
            $año = (int)($_GET['año'] ?? date('Y'));
            $mes = (int)($_GET['mes'] ?? date('n'));

            $siniestros = $this->siniestroModel->getSiniestrosPorMes($año, $mes);
            Response::success($siniestros, 'Siniestros del mes obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener siniestros del mes: ' . $e->getMessage());
        }
    }
}
