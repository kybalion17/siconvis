<?php

namespace SAGAUT\Controllers;

use SAGAUT\Models\Chofer;
use SAGAUT\Utils\Response;

class ChoferController
{
    private Chofer $choferModel;

    public function __construct()
    {
        $this->choferModel = new Chofer();
    }

    public function index(): void
    {
        try {
            $page = (int)($_GET['page'] ?? 1);
            $perPage = (int)($_GET['per_page'] ?? 10);
            $filters = [
                'estado' => $_GET['estado'] ?? null,
                'cedula' => $_GET['cedula'] ?? null,
                'nombre' => $_GET['nombre'] ?? null,
            ];

            // Limpiar filtros vacíos
            $filters = array_filter($filters, function($value) {
                return $value !== null && $value !== '';
            });

            $choferes = $this->choferModel->getChoferesConDetalles($filters, $page, $perPage);
            $total = $this->choferModel->count($filters);

            Response::paginated($choferes, $total, $page, $perPage, 'Choferes obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener choferes: ' . $e->getMessage());
        }
    }

    public function show(string $id): void
    {
        try {
            $choferId = (int)$id;
            
            if ($choferId <= 0) {
                Response::error('ID de chofer inválido', 400);
            }

            $chofer = $this->choferModel->getChoferConDetalles($choferId);

            if (!$chofer) {
                Response::notFound('Chofer no encontrado');
            }

            Response::success($chofer, 'Chofer obtenido exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener chofer: ' . $e->getMessage());
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
            $required = ['cedula', 'nombre', 'apellido'];
            $errors = [];

            foreach ($required as $field) {
                if (!isset($input[$field]) || empty($input[$field])) {
                    $errors[$field] = "El campo {$field} es requerido";
                }
            }

            if (!empty($errors)) {
                Response::validationError($errors);
            }

            // Validar que la cédula no exista
            $existingChofer = $this->choferModel->buscarPorCedula($input['cedula']);
            if ($existingChofer) {
                Response::error('Ya existe un chofer con esta cédula', 409);
            }

            // Validar formato de cédula (solo números)
            if (!preg_match('/^\d{7,8}$/', $input['cedula'])) {
                $errors['cedula'] = 'La cédula debe tener entre 7 y 8 dígitos numéricos';
            }

            // Validar fecha de nacimiento si se proporciona
            if (isset($input['fecha_nacimiento']) && !empty($input['fecha_nacimiento'])) {
                $fechaNacimiento = \DateTime::createFromFormat('Y-m-d', $input['fecha_nacimiento']);
                if (!$fechaNacimiento || $fechaNacimiento->format('Y-m-d') !== $input['fecha_nacimiento']) {
                    $errors['fecha_nacimiento'] = 'Formato de fecha inválido (YYYY-MM-DD)';
                }
            }

            // Validar fechas de vencimiento si se proporcionan
            if (isset($input['fecha_vencimiento_licencia']) && !empty($input['fecha_vencimiento_licencia'])) {
                $fechaLicencia = \DateTime::createFromFormat('Y-m-d', $input['fecha_vencimiento_licencia']);
                if (!$fechaLicencia || $fechaLicencia->format('Y-m-d') !== $input['fecha_vencimiento_licencia']) {
                    $errors['fecha_vencimiento_licencia'] = 'Formato de fecha inválido (YYYY-MM-DD)';
                }
            }

            if (isset($input['fecha_vencimiento_certificado']) && !empty($input['fecha_vencimiento_certificado'])) {
                $fechaCertificado = \DateTime::createFromFormat('Y-m-d', $input['fecha_vencimiento_certificado']);
                if (!$fechaCertificado || $fechaCertificado->format('Y-m-d') !== $input['fecha_vencimiento_certificado']) {
                    $errors['fecha_vencimiento_certificado'] = 'Formato de fecha inválido (YYYY-MM-DD)';
                }
            }

            if (!empty($errors)) {
                Response::validationError($errors);
            }

            // Preparar datos para inserción
            $data = [
                'cedula' => trim($input['cedula']),
                'nombre' => ucwords(strtolower(trim($input['nombre']))),
                'apellido' => ucwords(strtolower(trim($input['apellido']))),
                'fecha_nacimiento' => $input['fecha_nacimiento'] ?? null,
                'sexo' => $input['sexo'] ?? null,
                'telefono' => $input['telefono'] ?? null,
                'direccion' => $input['direccion'] ?? null,
                'numero_licencia' => $input['numero_licencia'] ?? null,
                'fecha_vencimiento_licencia' => $input['fecha_vencimiento_licencia'] ?? null,
                'numero_certificado' => $input['numero_certificado'] ?? null,
                'fecha_vencimiento_certificado' => $input['fecha_vencimiento_certificado'] ?? null,
                'estado' => $input['estado'] ?? 'activo'
            ];

            $choferId = $this->choferModel->create($data);

            if ($choferId) {
                $chofer = $this->choferModel->getChoferConDetalles($choferId);
                Response::success($chofer, 'Chofer creado exitosamente', 201);
            } else {
                Response::serverError('Error al crear chofer');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al crear chofer: ' . $e->getMessage());
        }
    }

    public function update(string $id): void
    {
        try {
            $choferId = (int)$id;
            
            if ($choferId <= 0) {
                Response::error('ID de chofer inválido', 400);
            }

            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input) {
                Response::error('Datos de entrada inválidos', 400);
            }

            // Verificar que el chofer existe
            $existingChofer = $this->choferModel->find($choferId);
            if (!$existingChofer) {
                Response::notFound('Chofer no encontrado');
            }

            // Si se está cambiando la cédula, verificar que no exista otra
            if (isset($input['cedula']) && $input['cedula'] !== $existingChofer['cedula']) {
                $cedulaExists = $this->choferModel->buscarPorCedula($input['cedula']);
                if ($cedulaExists && $cedulaExists['id'] != $choferId) {
                    Response::error('Ya existe otro chofer con esta cédula', 409);
                }
            }

            // Validar formato de cédula si se está actualizando
            if (isset($input['cedula']) && !preg_match('/^\d{7,8}$/', $input['cedula'])) {
                Response::error('La cédula debe tener entre 7 y 8 dígitos numéricos', 400);
            }

            // Preparar datos para actualización
            $data = [];
            $allowedFields = [
                'cedula', 'nombre', 'apellido', 'fecha_nacimiento', 'sexo',
                'telefono', 'direccion', 'numero_licencia', 'fecha_vencimiento_licencia',
                'numero_certificado', 'fecha_vencimiento_certificado', 'estado'
            ];

            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    if (in_array($field, ['nombre', 'apellido'])) {
                        $data[$field] = ucwords(strtolower(trim($input[$field])));
                    } elseif ($field === 'cedula') {
                        $data[$field] = trim($input[$field]);
                    } else {
                        $data[$field] = $input[$field];
                    }
                }
            }

            if (empty($data)) {
                Response::error('No hay datos para actualizar', 400);
            }

            $success = $this->choferModel->update($choferId, $data);

            if ($success) {
                $chofer = $this->choferModel->getChoferConDetalles($choferId);
                Response::success($chofer, 'Chofer actualizado exitosamente');
            } else {
                Response::serverError('Error al actualizar chofer');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al actualizar chofer: ' . $e->getMessage());
        }
    }

    public function delete(string $id): void
    {
        try {
            $choferId = (int)$id;
            
            if ($choferId <= 0) {
                Response::error('ID de chofer inválido', 400);
            }

            // Verificar que el chofer existe
            $chofer = $this->choferModel->find($choferId);
            if (!$chofer) {
                Response::notFound('Chofer no encontrado');
            }

            // Verificar si tiene asignaciones activas
            $asignacionActual = $this->choferModel->getAsignacionActual($choferId);
            if ($asignacionActual) {
                Response::error('No se puede eliminar el chofer porque tiene una asignación activa', 409);
            }

            // Soft delete
            $success = $this->choferModel->softDelete($choferId);

            if ($success) {
                Response::success([], 'Chofer eliminado exitosamente');
            } else {
                Response::serverError('Error al eliminar chofer');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al eliminar chofer: ' . $e->getMessage());
        }
    }

    public function disponibles(): void
    {
        try {
            $choferes = $this->choferModel->getChoferesDisponibles();
            Response::success($choferes, 'Choferes disponibles obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener choferes disponibles: ' . $e->getMessage());
        }
    }

    public function estadisticas(): void
    {
        try {
            $estadisticas = $this->choferModel->getEstadisticasChoferes();
            Response::success($estadisticas, 'Estadísticas de choferes obtenidas exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener estadísticas: ' . $e->getMessage());
        }
    }

    public function licenciasPorVencer(): void
    {
        try {
            $dias = (int)($_GET['dias'] ?? 30);
            $choferes = $this->choferModel->getChoferesConLicenciasPorVencer($dias);
            Response::success($choferes, 'Choferes con licencias por vencer obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener choferes con licencias por vencer: ' . $e->getMessage());
        }
    }

    public function certificadosPorVencer(): void
    {
        try {
            $dias = (int)($_GET['dias'] ?? 30);
            $choferes = $this->choferModel->getChoferesConCertificadosPorVencer($dias);
            Response::success($choferes, 'Choferes con certificados por vencer obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener choferes con certificados por vencer: ' . $e->getMessage());
        }
    }

    public function asignaciones(string $id): void
    {
        try {
            $choferId = (int)$id;
            
            if ($choferId <= 0) {
                Response::error('ID de chofer inválido', 400);
            }

            $asignaciones = $this->choferModel->getHistorialAsignaciones($choferId);
            Response::success($asignaciones, 'Historial de asignaciones obtenido exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener historial de asignaciones: ' . $e->getMessage());
        }
    }

    public function asignacionActual(string $id): void
    {
        try {
            $choferId = (int)$id;
            
            if ($choferId <= 0) {
                Response::error('ID de chofer inválido', 400);
            }

            $asignacion = $this->choferModel->getAsignacionActual($choferId);
            
            if (!$asignacion) {
                Response::success(null, 'El chofer no tiene asignación activa');
            } else {
                Response::success($asignacion, 'Asignación actual obtenida exitosamente');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al obtener asignación actual: ' . $e->getMessage());
        }
    }

    public function validarLicencia(string $id): void
    {
        try {
            $choferId = (int)$id;
            
            if ($choferId <= 0) {
                Response::error('ID de chofer inválido', 400);
            }

            $validacion = $this->choferModel->validarLicencia($choferId);
            Response::success($validacion, 'Validación de licencia completada');

        } catch (\Exception $e) {
            Response::serverError('Error al validar licencia: ' . $e->getMessage());
        }
    }
}
