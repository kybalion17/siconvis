<?php

namespace SAGAUT\Middleware;

use SAGAUT\Utils\JWT;

class AuthMiddleware
{
    public static function handle(): array
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;

        if (!$authHeader) {
            self::sendUnauthorized('Token de autorización requerido');
        }

        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            self::sendUnauthorized('Formato de token inválido');
        }

        $token = $matches[1];

        try {
            $payload = JWT::decode($token);
            
            // Verificar que el token no haya expirado
            if (isset($payload['exp']) && $payload['exp'] < time()) {
                self::sendUnauthorized('Token expirado');
            }

            return $payload;
            
        } catch (\Exception $e) {
            self::sendUnauthorized('Token inválido: ' . $e->getMessage());
        }
    }

    private static function sendUnauthorized(string $message): void
    {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => $message,
            'code' => 401
        ]);
        exit;
    }

    public static function optional(): ?array
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;

        if (!$authHeader) {
            return null;
        }

        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return null;
        }

        $token = $matches[1];

        try {
            return JWT::decode($token);
        } catch (\Exception $e) {
            return null;
        }
    }
}
