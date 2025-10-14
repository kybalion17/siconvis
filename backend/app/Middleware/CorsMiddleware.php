<?php

namespace SAGAUT\Middleware;

class CorsMiddleware
{
    public static function handle(): void
    {
        $config = require __DIR__ . '/../../config/app.php';
        $corsConfig = $config['cors'];

        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        
        if (in_array($origin, $corsConfig['allowed_origins']) || in_array('*', $corsConfig['allowed_origins'])) {
            header("Access-Control-Allow-Origin: $origin");
        }

        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: ' . implode(', ', $corsConfig['allowed_methods']));
        header('Access-Control-Allow-Headers: ' . implode(', ', $corsConfig['allowed_headers']));
        header('Access-Control-Max-Age: 86400');

        // Manejar preflight requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
}
