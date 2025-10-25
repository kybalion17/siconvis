<?php

namespace SAGAUT\Utils;

class FileUpload
{
    private static array $allowedTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp'
    ];

    private static array $allowedExtensions = [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'webp'
    ];

    /**
     * Subir archivo de imagen con nombre personalizado
     */
    public static function uploadImageWithName(array $file, string $subfolder = 'visitantes', string $customName = ''): array
    {
        try {
            // Validar que el archivo fue subido correctamente
            if (!isset($file['error']) || $file['error'] !== UPLOAD_ERR_OK) {
                return [
                    'success' => false,
                    'message' => self::getUploadErrorMessage($file['error'] ?? UPLOAD_ERR_NO_FILE)
                ];
            }

            // Validar tipo de archivo
            $fileType = $file['type'] ?? '';
            if (!in_array($fileType, self::$allowedTypes)) {
                return [
                    'success' => false,
                    'message' => 'Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, GIF, WEBP)'
                ];
            }

            // Validar extensión
            $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            if (!in_array($fileExtension, self::$allowedExtensions)) {
                return [
                    'success' => false,
                    'message' => 'Extensión de archivo no permitida'
                ];
            }

            // Validar tamaño
            $maxSize = self::getMaxFileSize();
            if ($file['size'] > $maxSize) {
                return [
                    'success' => false,
                    'message' => 'El archivo es demasiado grande. Máximo ' . self::formatBytes($maxSize)
                ];
            }

            // Validar que es realmente una imagen
            $imageInfo = getimagesize($file['tmp_name']);
            if ($imageInfo === false) {
                return [
                    'success' => false,
                    'message' => 'El archivo no es una imagen válida'
                ];
            }

            // Crear directorio si no existe
            $uploadPath = self::getUploadPath($subfolder);
            if (!is_dir($uploadPath)) {
                if (!mkdir($uploadPath, 0755, true)) {
                    return [
                        'success' => false,
                        'message' => 'No se pudo crear el directorio de uploads'
                    ];
                }
            }

            // Usar nombre personalizado si se proporciona, sino generar uno único
            if (!empty($customName)) {
                // Limpiar el nombre personalizado
                $customName = preg_replace('/[^a-zA-Z0-9._-]/', '', $customName);
                $fileName = $customName . '.' . $fileExtension;
            } else {
                $fileName = self::generateUniqueFileName($fileExtension);
            }
            
            $filePath = $uploadPath . '/' . $fileName;

            // Mover archivo
            if (!move_uploaded_file($file['tmp_name'], $filePath)) {
                return [
                    'success' => false,
                    'message' => 'No se pudo guardar el archivo'
                ];
            }

            // Procesar imagen (redimensionar si es necesario)
            $processedPath = self::processImage($filePath, $fileName, $subfolder);
            if (!$processedPath) {
                // Si falla el procesamiento, usar el archivo original
                $processedPath = $filePath;
            }

            // Generar URL pública
            $publicUrl = self::getPublicUrl($subfolder . '/' . basename($processedPath));

            return [
                'success' => true,
                'message' => 'Archivo subido exitosamente',
                'filename' => basename($processedPath),
                'path' => $processedPath,
                'url' => $publicUrl,
                'size' => filesize($processedPath),
                'type' => $fileType
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al procesar el archivo: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Subir archivo de imagen
     */
    public static function uploadImage(array $file, string $subfolder = 'visitantes'): array
    {
        try {
            // Validar que el archivo fue subido correctamente
            if (!isset($file['error']) || $file['error'] !== UPLOAD_ERR_OK) {
                return [
                    'success' => false,
                    'message' => self::getUploadErrorMessage($file['error'] ?? UPLOAD_ERR_NO_FILE)
                ];
            }

            // Validar tipo de archivo
            $fileType = $file['type'] ?? '';
            if (!in_array($fileType, self::$allowedTypes)) {
                return [
                    'success' => false,
                    'message' => 'Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, GIF, WEBP)'
                ];
            }

            // Validar extensión
            $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            if (!in_array($fileExtension, self::$allowedExtensions)) {
                return [
                    'success' => false,
                    'message' => 'Extensión de archivo no permitida'
                ];
            }

            // Validar tamaño
            $maxSize = self::getMaxFileSize();
            if ($file['size'] > $maxSize) {
                return [
                    'success' => false,
                    'message' => 'El archivo es demasiado grande. Máximo ' . self::formatBytes($maxSize)
                ];
            }

            // Validar que es realmente una imagen
            $imageInfo = getimagesize($file['tmp_name']);
            if ($imageInfo === false) {
                return [
                    'success' => false,
                    'message' => 'El archivo no es una imagen válida'
                ];
            }

            // Crear directorio si no existe
            $uploadPath = self::getUploadPath($subfolder);
            if (!is_dir($uploadPath)) {
                if (!mkdir($uploadPath, 0755, true)) {
                    return [
                        'success' => false,
                        'message' => 'No se pudo crear el directorio de uploads'
                    ];
                }
            }

            // Generar nombre único para el archivo
            $fileName = self::generateUniqueFileName($fileExtension);
            $filePath = $uploadPath . '/' . $fileName;

            // Mover archivo
            if (!move_uploaded_file($file['tmp_name'], $filePath)) {
                return [
                    'success' => false,
                    'message' => 'No se pudo guardar el archivo'
                ];
            }

            // Procesar imagen (redimensionar si es necesario)
            $processedPath = self::processImage($filePath, $fileName, $subfolder);
            if (!$processedPath) {
                // Si falla el procesamiento, usar el archivo original
                $processedPath = $filePath;
            }

            // Generar URL pública
            $publicUrl = self::getPublicUrl($subfolder . '/' . basename($processedPath));

            return [
                'success' => true,
                'message' => 'Archivo subido exitosamente',
                'filename' => basename($processedPath),
                'path' => $processedPath,
                'url' => $publicUrl,
                'size' => filesize($processedPath),
                'type' => $fileType
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al procesar el archivo: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Procesar imagen (redimensionar y optimizar)
     */
    private static function processImage(string $filePath, string $fileName, string $subfolder): ?string
    {
        try {
            $imageInfo = getimagesize($filePath);
            if (!$imageInfo) {
                return null;
            }

            $originalWidth = $imageInfo[0];
            $originalHeight = $imageInfo[1];
            $mimeType = $imageInfo['mime'];

            // Definir tamaños máximos
            $maxWidth = 800;
            $maxHeight = 600;

            // Si la imagen es más pequeña que los máximos, no redimensionar
            if ($originalWidth <= $maxWidth && $originalHeight <= $maxHeight) {
                return $filePath;
            }

            // Calcular nuevas dimensiones manteniendo proporción
            $ratio = min($maxWidth / $originalWidth, $maxHeight / $originalHeight);
            $newWidth = (int)($originalWidth * $ratio);
            $newHeight = (int)($originalHeight * $ratio);

            // Crear imagen desde archivo original
            $sourceImage = null;
            switch ($mimeType) {
                case 'image/jpeg':
                    $sourceImage = imagecreatefromjpeg($filePath);
                    break;
                case 'image/png':
                    $sourceImage = imagecreatefrompng($filePath);
                    break;
                case 'image/gif':
                    $sourceImage = imagecreatefromgif($filePath);
                    break;
                case 'image/webp':
                    $sourceImage = imagecreatefromwebp($filePath);
                    break;
                default:
                    return null;
            }

            if (!$sourceImage) {
                return null;
            }

            // Crear nueva imagen redimensionada
            $resizedImage = imagecreatetruecolor($newWidth, $newHeight);

            // Preservar transparencia para PNG y GIF
            if ($mimeType === 'image/png' || $mimeType === 'image/gif') {
                imagealphablending($resizedImage, false);
                imagesavealpha($resizedImage, true);
                $transparent = imagecolorallocatealpha($resizedImage, 255, 255, 255, 127);
                imagefilledrectangle($resizedImage, 0, 0, $newWidth, $newHeight, $transparent);
            }

            // Redimensionar
            imagecopyresampled(
                $resizedImage, $sourceImage,
                0, 0, 0, 0,
                $newWidth, $newHeight,
                $originalWidth, $originalHeight
            );

            // Generar nombre para archivo procesado
            $processedFileName = 'processed_' . $fileName;
            $processedPath = self::getUploadPath($subfolder) . '/' . $processedFileName;

            // Guardar imagen procesada
            $saved = false;
            switch ($mimeType) {
                case 'image/jpeg':
                    $saved = imagejpeg($resizedImage, $processedPath, 85);
                    break;
                case 'image/png':
                    $saved = imagepng($resizedImage, $processedPath, 8);
                    break;
                case 'image/gif':
                    $saved = imagegif($resizedImage, $processedPath);
                    break;
                case 'image/webp':
                    $saved = imagewebp($resizedImage, $processedPath, 85);
                    break;
            }

            // Limpiar memoria
            imagedestroy($sourceImage);
            imagedestroy($resizedImage);

            if ($saved) {
                // Eliminar archivo original si el procesado se guardó correctamente
                unlink($filePath);
                return $processedPath;
            }

            return null;

        } catch (\Exception $e) {
            error_log('Error processing image: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Obtener ruta de upload
     */
    private static function getUploadPath(string $subfolder = ''): string
    {
        $config = require __DIR__ . '/../../config/app.php';
        $basePath = $config['upload']['path'] ?? 'uploads/';
        $basePath = rtrim($basePath, '/') . '/';
        
        if ($subfolder) {
            $basePath .= trim($subfolder, '/') . '/';
        }
        
        return $basePath;
    }

    /**
     * Obtener URL pública del archivo
     */
    private static function getPublicUrl(string $relativePath): string
    {
        $config = require __DIR__ . '/../../config/app.php';
        $baseUrl = $config['url'] ?? 'http://localhost:8000';
        $baseUrl = rtrim($baseUrl, '/');
        
        // Usar el método alternativo que funciona con el servidor PHP integrado
        return $baseUrl . '/serve-image.php?file=' . urlencode($relativePath);
    }

    /**
     * Generar nombre único para archivo
     */
    private static function generateUniqueFileName(string $extension): string
    {
        $timestamp = time();
        $random = bin2hex(random_bytes(8));
        return $timestamp . '_' . $random . '.' . $extension;
    }

    /**
     * Obtener tamaño máximo de archivo
     */
    private static function getMaxFileSize(): int
    {
        $config = require __DIR__ . '/../../config/app.php';
        return $config['upload']['max_size'] ?? 10485760; // 10MB por defecto
    }

    /**
     * Formatear bytes a formato legible
     */
    private static function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, 2) . ' ' . $units[$pow];
    }

    /**
     * Obtener mensaje de error de upload
     */
    private static function getUploadErrorMessage(int $errorCode): string
    {
        $messages = [
            UPLOAD_ERR_INI_SIZE => 'El archivo excede el tamaño máximo permitido por el servidor',
            UPLOAD_ERR_FORM_SIZE => 'El archivo excede el tamaño máximo permitido por el formulario',
            UPLOAD_ERR_PARTIAL => 'El archivo fue subido parcialmente',
            UPLOAD_ERR_NO_FILE => 'No se seleccionó ningún archivo',
            UPLOAD_ERR_NO_TMP_DIR => 'No se encontró directorio temporal',
            UPLOAD_ERR_CANT_WRITE => 'No se pudo escribir el archivo al disco',
            UPLOAD_ERR_EXTENSION => 'La subida del archivo fue detenida por una extensión'
        ];

        return $messages[$errorCode] ?? 'Error desconocido al subir el archivo';
    }

    /**
     * Eliminar archivo
     */
    public static function deleteFile(string $filePath): bool
    {
        try {
            if (file_exists($filePath)) {
                return unlink($filePath);
            }
            return true; // Si no existe, considerarlo como eliminado
        } catch (\Exception $e) {
            error_log('Error deleting file: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Validar archivo de imagen
     */
    public static function validateImage(array $file): array
    {
        $errors = [];

        if (!isset($file['error']) || $file['error'] !== UPLOAD_ERR_OK) {
            $errors[] = self::getUploadErrorMessage($file['error'] ?? UPLOAD_ERR_NO_FILE);
            return $errors;
        }

        $fileType = $file['type'] ?? '';
        if (!in_array($fileType, self::$allowedTypes)) {
            $errors[] = 'Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, GIF, WEBP)';
        }

        $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($fileExtension, self::$allowedExtensions)) {
            $errors[] = 'Extensión de archivo no permitida';
        }

        $maxSize = self::getMaxFileSize();
        if ($file['size'] > $maxSize) {
            $errors[] = 'El archivo es demasiado grande. Máximo ' . self::formatBytes($maxSize);
        }

        $imageInfo = getimagesize($file['tmp_name']);
        if ($imageInfo === false) {
            $errors[] = 'El archivo no es una imagen válida';
        }

        return $errors;
    }
}
