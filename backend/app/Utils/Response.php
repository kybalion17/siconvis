<?php

namespace SAGAUT\Utils;

class Response
{
    public static function success($data = null, string $message = 'Operación exitosa', int $code = 200): void
    {
        http_response_code($code);
        header('Content-Type: application/json');
        
        $response = [
            'success' => true,
            'message' => $message,
            'code' => $code
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function error(string $message = 'Error en la operación', int $code = 400, $errors = null): void
    {
        http_response_code($code);
        header('Content-Type: application/json');
        
        $response = [
            'success' => false,
            'message' => $message,
            'code' => $code
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function validationError(array $errors, string $message = 'Errores de validación'): void
    {
        self::error($message, 422, $errors);
    }

    public static function notFound(string $message = 'Recurso no encontrado'): void
    {
        self::error($message, 404);
    }

    public static function unauthorized(string $message = 'No autorizado'): void
    {
        self::error($message, 401);
    }

    public static function forbidden(string $message = 'Acceso denegado'): void
    {
        self::error($message, 403);
    }

    public static function serverError(string $message = 'Error interno del servidor'): void
    {
        self::error($message, 500);
    }

    public static function paginated(array $data, int $total, int $page, int $perPage, string $message = 'Datos obtenidos'): void
    {
        $totalPages = ceil($total / $perPage);
        
        $response = [
            'success' => true,
            'message' => $message,
            'data' => $data,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => $totalPages,
                'has_next' => $page < $totalPages,
                'has_prev' => $page > 1
            ]
        ];

        http_response_code(200);
        header('Content-Type: application/json');
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }
}
