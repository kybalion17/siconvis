<?php

namespace SAGAUT\Controllers;

use SAGAUT\Models\Documento;
use SAGAUT\Utils\Response;
use SAGAUT\Utils\Database;

class DocumentoController
{
    private Documento $documentoModel;
    private string $uploadPath;

    public function __construct()
    {
        $this->documentoModel = new Documento();
        $this->uploadPath = $_SERVER['DOCUMENT_ROOT'] . '/uploads/documentos/';
        
        // Crear directorio si no existe
        if (!is_dir($this->uploadPath)) {
            mkdir($this->uploadPath, 0755, true);
        }
    }

    public function index(): void
    {
        try {
            $page = (int)($_GET['page'] ?? 1);
            $perPage = (int)($_GET['per_page'] ?? 10);
            $filters = [
                'tipo_documento' => $_GET['tipo_documento'] ?? null,
                'entidad_tipo' => $_GET['entidad_tipo'] ?? null,
                'entidad_id' => $_GET['entidad_id'] ?? null,
                'categoria' => $_GET['categoria'] ?? null,
                'estado_vencimiento' => $_GET['estado_vencimiento'] ?? null,
                'busqueda' => $_GET['busqueda'] ?? null,
            ];

            // Limpiar filtros vacíos
            $filters = array_filter($filters, function($value) {
                return $value !== null && $value !== '';
            });

            $documentos = $this->documentoModel->getDocumentosConDetalles($filters, $page, $perPage);
            $total = $this->documentoModel->count($filters);

            Response::paginated($documentos, $total, $page, $perPage, 'Documentos obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener documentos: ' . $e->getMessage());
        }
    }

    public function show(string $id): void
    {
        try {
            $documentoId = (int)$id;
            
            if ($documentoId <= 0) {
                Response::error('ID de documento inválido', 400);
            }

            $documento = $this->documentoModel->getDocumentoConDetalles($documentoId);

            if (!$documento) {
                Response::notFound('Documento no encontrado');
            }

            Response::success($documento, 'Documento obtenido exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener documento: ' . $e->getMessage());
        }
    }

    public function store(): void
    {
        try {
            // Verificar si hay archivos subidos
            if (!isset($_FILES['archivo']) || $_FILES['archivo']['error'] !== UPLOAD_ERR_OK) {
                Response::error('No se ha subido ningún archivo', 400);
            }

            $archivo = $_FILES['archivo'];
            $input = $_POST; // Datos del formulario

            // Validar datos requeridos
            $required = ['tipo_documento', 'entidad_tipo'];
            $errors = [];

            foreach ($required as $field) {
                if (!isset($input[$field]) || empty($input[$field])) {
                    $errors[$field] = "El campo {$field} es requerido";
                }
            }

            if (!empty($errors)) {
                Response::validationError($errors);
            }

            // Validar archivo
            $maxSize = 10 * 1024 * 1024; // 10MB
            $allowedTypes = [
                'application/pdf',
                'image/jpeg',
                'image/png',
                'image/gif',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ];

            if ($archivo['size'] > $maxSize) {
                Response::error('El archivo es demasiado grande. Máximo 10MB', 400);
            }

            if (!in_array($archivo['type'], $allowedTypes)) {
                Response::error('Tipo de archivo no permitido', 400);
            }

            // Generar nombre único para el archivo
            $extension = pathinfo($archivo['name'], PATHINFO_EXTENSION);
            $nombreArchivo = uniqid() . '_' . time() . '.' . $extension;
            $rutaArchivo = $this->uploadPath . $nombreArchivo;

            // Mover archivo
            if (!move_uploaded_file($archivo['tmp_name'], $rutaArchivo)) {
                Response::serverError('Error al subir el archivo');
            }

            // Preparar datos para inserción
            $data = [
                'tipo_documento' => $input['tipo_documento'],
                'entidad_tipo' => $input['entidad_tipo'],
                'entidad_id' => isset($input['entidad_id']) ? (int)$input['entidad_id'] : null,
                'nombre_archivo' => $nombreArchivo,
                'nombre_original' => $archivo['name'],
                'ruta_archivo' => $rutaArchivo,
                'tipo_mime' => $archivo['type'],
                'tamano_archivo' => $archivo['size'],
                'descripcion' => $input['descripcion'] ?? null,
                'categoria' => $input['categoria'] ?? null,
                'etiquetas' => $input['etiquetas'] ?? null,
                'fecha_vencimiento' => $input['fecha_vencimiento'] ?? null,
                'estado' => $input['estado'] ?? 'activo'
            ];

            $documentoId = $this->documentoModel->create($data);

            if ($documentoId) {
                $documento = $this->documentoModel->getDocumentoConDetalles($documentoId);
                Response::success($documento, 'Documento subido exitosamente', 201);
            } else {
                // Eliminar archivo si falló la inserción
                unlink($rutaArchivo);
                Response::serverError('Error al guardar documento');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al subir documento: ' . $e->getMessage());
        }
    }

    public function update(string $id): void
    {
        try {
            $documentoId = (int)$id;
            
            if ($documentoId <= 0) {
                Response::error('ID de documento inválido', 400);
            }

            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input) {
                Response::error('Datos de entrada inválidos', 400);
            }

            // Verificar que el documento existe
            $existingDocumento = $this->documentoModel->find($documentoId);
            if (!$existingDocumento) {
                Response::notFound('Documento no encontrado');
            }

            // Preparar datos para actualización
            $data = [];
            $allowedFields = [
                'tipo_documento', 'entidad_tipo', 'entidad_id', 'descripcion',
                'categoria', 'etiquetas', 'fecha_vencimiento', 'estado'
            ];

            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    if ($field === 'entidad_id') {
                        $data[$field] = (int)$input[$field];
                    } else {
                        $data[$field] = $input[$field];
                    }
                }
            }

            if (empty($data)) {
                Response::error('No hay datos para actualizar', 400);
            }

            $success = $this->documentoModel->update($documentoId, $data);

            if ($success) {
                $documento = $this->documentoModel->getDocumentoConDetalles($documentoId);
                Response::success($documento, 'Documento actualizado exitosamente');
            } else {
                Response::serverError('Error al actualizar documento');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al actualizar documento: ' . $e->getMessage());
        }
    }

    public function delete(string $id): void
    {
        try {
            $documentoId = (int)$id;
            
            if ($documentoId <= 0) {
                Response::error('ID de documento inválido', 400);
            }

            // Verificar que el documento existe
            $documento = $this->documentoModel->find($documentoId);
            if (!$documento) {
                Response::notFound('Documento no encontrado');
            }

            // Eliminar archivo físico
            if (file_exists($documento['ruta_archivo'])) {
                unlink($documento['ruta_archivo']);
            }

            // Soft delete
            $success = $this->documentoModel->softDelete($documentoId);

            if ($success) {
                Response::success([], 'Documento eliminado exitosamente');
            } else {
                Response::serverError('Error al eliminar documento');
            }

        } catch (\Exception $e) {
            Response::serverError('Error al eliminar documento: ' . $e->getMessage());
        }
    }

    public function download(string $id): void
    {
        try {
            $documentoId = (int)$id;
            
            if ($documentoId <= 0) {
                Response::error('ID de documento inválido', 400);
            }

            $documento = $this->documentoModel->find($documentoId);
            if (!$documento) {
                Response::notFound('Documento no encontrado');
            }

            $rutaArchivo = $documento['ruta_archivo'];
            
            if (!file_exists($rutaArchivo)) {
                Response::error('Archivo no encontrado en el servidor', 404);
            }

            // Configurar headers para descarga
            header('Content-Type: ' . $documento['tipo_mime']);
            header('Content-Disposition: attachment; filename="' . $documento['nombre_original'] . '"');
            header('Content-Length: ' . filesize($rutaArchivo));
            header('Cache-Control: no-cache, must-revalidate');
            header('Pragma: no-cache');

            // Enviar archivo
            readfile($rutaArchivo);
            exit;

        } catch (\Exception $e) {
            Response::serverError('Error al descargar documento: ' . $e->getMessage());
        }
    }

    public function view(string $id): void
    {
        try {
            $documentoId = (int)$id;
            
            if ($documentoId <= 0) {
                Response::error('ID de documento inválido', 400);
            }

            $documento = $this->documentoModel->find($documentoId);
            if (!$documento) {
                Response::notFound('Documento no encontrado');
            }

            $rutaArchivo = $documento['ruta_archivo'];
            
            if (!file_exists($rutaArchivo)) {
                Response::error('Archivo no encontrado en el servidor', 404);
            }

            // Configurar headers para visualización
            header('Content-Type: ' . $documento['tipo_mime']);
            header('Content-Disposition: inline; filename="' . $documento['nombre_original'] . '"');
            header('Content-Length: ' . filesize($rutaArchivo));
            header('Cache-Control: no-cache, must-revalidate');
            header('Pragma: no-cache');

            // Enviar archivo
            readfile($rutaArchivo);
            exit;

        } catch (\Exception $e) {
            Response::serverError('Error al visualizar documento: ' . $e->getMessage());
        }
    }

    public function porEntidad(string $entidadTipo, string $entidadId): void
    {
        try {
            $entidadIdInt = (int)$entidadId;
            
            if ($entidadIdInt <= 0) {
                Response::error('ID de entidad inválido', 400);
            }

            $documentos = $this->documentoModel->getDocumentosPorEntidad($entidadTipo, $entidadIdInt);
            Response::success($documentos, 'Documentos de la entidad obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener documentos de la entidad: ' . $e->getMessage());
        }
    }

    public function porVencer(): void
    {
        try {
            $dias = (int)($_GET['dias'] ?? 30);
            $documentos = $this->documentoModel->getDocumentosPorVencer($dias);
            Response::success($documentos, 'Documentos por vencer obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener documentos por vencer: ' . $e->getMessage());
        }
    }

    public function vencidos(): void
    {
        try {
            $documentos = $this->documentoModel->getDocumentosVencidos();
            Response::success($documentos, 'Documentos vencidos obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener documentos vencidos: ' . $e->getMessage());
        }
    }

    public function estadisticas(): void
    {
        try {
            $estadisticas = $this->documentoModel->getEstadisticasDocumentos();
            Response::success($estadisticas, 'Estadísticas de documentos obtenidas exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener estadísticas: ' . $e->getMessage());
        }
    }

    public function buscar(): void
    {
        try {
            $termino = $_GET['q'] ?? '';
            
            if (empty($termino)) {
                Response::error('Término de búsqueda requerido', 400);
            }

            $documentos = $this->documentoModel->buscarDocumentos($termino);
            Response::success($documentos, 'Búsqueda de documentos completada');

        } catch (\Exception $e) {
            Response::serverError('Error al buscar documentos: ' . $e->getMessage());
        }
    }

    public function porCategoria(string $categoria): void
    {
        try {
            $documentos = $this->documentoModel->getDocumentosPorCategoria($categoria);
            Response::success($documentos, 'Documentos de la categoría obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener documentos de la categoría: ' . $e->getMessage());
        }
    }

    public function recientes(): void
    {
        try {
            $limit = (int)($_GET['limit'] ?? 10);
            $documentos = $this->documentoModel->getDocumentosRecientes($limit);
            Response::success($documentos, 'Documentos recientes obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener documentos recientes: ' . $e->getMessage());
        }
    }

    public function info(): void
    {
        try {
            $tamanoTotal = $this->documentoModel->getTamanoTotalArchivos();
            $totalDocumentos = $this->documentoModel->count();
            
            $info = [
                'total_documentos' => $totalDocumentos,
                'tamano_total' => $tamanoTotal,
                'tamano_total_mb' => round($tamanoTotal / (1024 * 1024), 2),
                'directorio_upload' => $this->uploadPath
            ];

            Response::success($info, 'Información de documentos obtenida exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener información: ' . $e->getMessage());
        }
    }
}
