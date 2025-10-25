<?php
// Archivo de prueba directo para servir imágenes

// Configurar headers de seguridad
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Obtener el archivo solicitado desde GET
$filePath = $_GET['file'] ?? '';

if (empty($filePath)) {
    http_response_code(400);
    exit('No se especificó archivo');
}

// Validar que la ruta no contenga caracteres peligrosos
if (strpos($filePath, '..') !== false) {
    http_response_code(400);
    exit('Ruta de archivo inválida');
}

// Construir la ruta completa del archivo
$config = require __DIR__ . '/../config/app.php';
$uploadPath = $config['upload']['path'] ?? 'uploads/';
$fullPath = rtrim($uploadPath, '/') . '/' . $filePath;

// Verificar que el archivo existe
if (!file_exists($fullPath)) {
    http_response_code(404);
    exit('Archivo no encontrado: ' . $fullPath);
}

// Verificar que es un archivo (no un directorio)
if (!is_file($fullPath)) {
    http_response_code(400);
    exit('No es un archivo válido');
}

// Obtener información del archivo
$fileInfo = pathinfo($fullPath);
$extension = strtolower($fileInfo['extension'] ?? '');

// Validar extensiones permitidas
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
if (!in_array($extension, $allowedExtensions)) {
    http_response_code(400);
    exit('Tipo de archivo no permitido');
}

// Determinar el tipo MIME
$mimeTypes = [
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png' => 'image/png',
    'gif' => 'image/gif',
    'webp' => 'image/webp'
];

$mimeType = $mimeTypes[$extension] ?? 'application/octet-stream';

// Configurar headers para el archivo
header('Content-Type: ' . $mimeType);
header('Content-Length: ' . filesize($fullPath));
header('Cache-Control: public, max-age=31536000'); // Cache por 1 año
header('Last-Modified: ' . gmdate('D, d M Y H:i:s', filemtime($fullPath)) . ' GMT');

// Servir el archivo
readfile($fullPath);
?>
