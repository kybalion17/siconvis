<?php

namespace SAGAUT\Controllers;

use SAGAUT\Utils\FileUpload;
use SAGAUT\Utils\Response;

class UploadController
{
    /**
     * Subir imagen de visitante
     */
    public function uploadVisitorPhoto(): void
    {
        try {
            // Verificar que se envió un archivo
            if (!isset($_FILES['photo']) || $_FILES['photo']['error'] === UPLOAD_ERR_NO_FILE) {
                Response::error('No se seleccionó ningún archivo', 400);
            }

            $file = $_FILES['photo'];
            $customName = $_POST['custom_name'] ?? '';

            // Validar archivo
            $errors = FileUpload::validateImage($file);
            if (!empty($errors)) {
                Response::error('Archivo inválido', 422, ['errors' => $errors]);
            }

            // Subir archivo con nombre personalizado
            $result = FileUpload::uploadImageWithName($file, 'visitantes', $customName);

            if (!$result['success']) {
                Response::error($result['message'], 500);
            }

            Response::success([
                'filename' => $result['filename'],
                'url' => $result['url'],
                'size' => $result['size'],
                'type' => $result['type']
            ], $result['message']);

        } catch (\Exception $e) {
            Response::error('Error al subir archivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Subir imagen genérica
     */
    public function uploadImage(): void
    {
        try {
            // Verificar que se envió un archivo
            if (!isset($_FILES['image']) || $_FILES['image']['error'] === UPLOAD_ERR_NO_FILE) {
                Response::error('No se seleccionó ningún archivo', 400);
            }

            $file = $_FILES['image'];
            $subfolder = $_POST['subfolder'] ?? 'general';

            // Validar archivo
            $errors = FileUpload::validateImage($file);
            if (!empty($errors)) {
                Response::error('Archivo inválido', 422, ['errors' => $errors]);
            }

            // Subir archivo
            $result = FileUpload::uploadImage($file, $subfolder);

            if (!$result['success']) {
                Response::error($result['message'], 500);
            }

            Response::success([
                'filename' => $result['filename'],
                'url' => $result['url'],
                'size' => $result['size'],
                'type' => $result['type']
            ], $result['message']);

        } catch (\Exception $e) {
            Response::error('Error al subir archivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar archivo
     */
    public function deleteFile(): void
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['filename'])) {
                Response::error('Nombre de archivo requerido', 400);
            }

            $filename = $input['filename'];
            $subfolder = $input['subfolder'] ?? 'general';

            // Construir ruta del archivo
            $uploadPath = $_ENV['UPLOAD_PATH'] ?? '../uploads/';
            $uploadPath = rtrim($uploadPath, '/') . '/' . trim($subfolder, '/') . '/' . $filename;

            // Eliminar archivo
            $deleted = FileUpload::deleteFile($uploadPath);

            if (!$deleted) {
                Response::error('No se pudo eliminar el archivo', 500);
            }

            Response::success([], 'Archivo eliminado exitosamente');

        } catch (\Exception $e) {
            Response::error('Error al eliminar archivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener información de archivo
     */
    public function getFileInfo(): void
    {
        try {
            $filename = $_GET['filename'] ?? '';
            $subfolder = $_GET['subfolder'] ?? 'general';

            if (empty($filename)) {
                Response::error('Nombre de archivo requerido', 400);
            }

            // Construir ruta del archivo
            $config = require __DIR__ . '/../../config/app.php';
            $uploadPath = $config['upload']['path'] ?? 'uploads/';
            $filePath = rtrim($uploadPath, '/') . '/' . trim($subfolder, '/') . '/' . $filename;

            if (!file_exists($filePath)) {
                Response::error('Archivo no encontrado', 404);
            }

            $fileInfo = [
                'filename' => $filename,
                'size' => filesize($filePath),
                'type' => mime_content_type($filePath),
                'created' => date('Y-m-d H:i:s', filectime($filePath)),
                'modified' => date('Y-m-d H:i:s', filemtime($filePath)),
                'url' => FileUpload::getPublicUrl($subfolder . '/' . $filename)
            ];

            Response::success($fileInfo, 'Información del archivo obtenida exitosamente');

        } catch (\Exception $e) {
            Response::error('Error al obtener información del archivo: ' . $e->getMessage(), 500);
        }
    }
}
