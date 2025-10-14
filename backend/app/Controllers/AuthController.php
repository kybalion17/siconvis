<?php

namespace SAGAUT\Controllers;

use SAGAUT\Models\User;
use SAGAUT\Utils\JWT;
use SAGAUT\Utils\Response;

class AuthController
{
    private User $userModel;

    public function __construct()
    {
        $this->userModel = new User();
    }

    public function login(): void
    {
        // Leer cuerpo crudo y tratar de decodificar JSON con tolerancia
        $rawBody = file_get_contents('php://input');
        $rawBody = is_string($rawBody) ? trim($rawBody) : '';

        $input = [];
        if ($rawBody !== '') {
            // Remover BOM si existe
            $rawBodyNoBom = preg_replace('/^\xEF\xBB\xBF/', '', $rawBody);
            $input = json_decode($rawBodyNoBom, true);

            if (!is_array($input) || json_last_error() !== JSON_ERROR_NONE) {
                // Intentar convertir a UTF-8 con mb_convert_encoding si está disponible
                if (function_exists('mb_convert_encoding')) {
                    $converted = mb_convert_encoding($rawBodyNoBom, 'UTF-8', 'UTF-8, ISO-8859-1, ISO-8859-15, Windows-1252');
                    $input = json_decode($converted, true);
                }
            }
        }

        // Fallback: si no es JSON válido, intentar como form-urlencoded
        if (!is_array($input) || (!isset($input['login']) && !isset($input['password']))) {
            if (!empty($_POST)) {
                $input = array_merge((array)$input, $_POST);
            } elseif ($rawBody !== '') {
                // Intentar parsear como query string del cuerpo
                $formData = [];
                parse_str($rawBody, $formData);
                if (!empty($formData)) {
                    $input = array_merge((array)$input, $formData);
                }
            }
        }

        if (!$input || !isset($input['login']) || !isset($input['password'])) {
            Response::error('Credenciales requeridas', 400);
        }

        $login = trim((string)$input['login']);
        $password = (string)$input['password'];

        // Validar datos
        if (empty($login) || empty($password)) {
            Response::error('Login y contraseña son requeridos', 400);
        }

        // Autenticar usuario
        $user = $this->userModel->authenticate($login, $password);

        if (!$user) {
            Response::error('Credenciales inválidas', 401);
        }

            // Generar token JWT
            $payload = [
                'user_id' => $user['id'],
                'login' => $user['login'],
                'nombre' => $user['nombre'],
                'apellido' => $user['apellido'],
                'perfil' => $user['perfil']
            ];

        $token = JWT::encode($payload);

        // Actualizar último login
        $this->userModel->updateLastLogin($user['id']);

        Response::success([
            'user' => $user,
            'token' => $token,
            'expires_in' => 86400 // 24 horas
        ], 'Login exitoso');
    }

    public function logout(): void
    {
        // En un sistema JWT stateless, el logout se maneja en el frontend
        // eliminando el token del almacenamiento local
        Response::success([], 'Logout exitoso');
    }

    public function me(): void
    {
        // Este método debe ser llamado con el middleware de autenticación
        $user = $this->userModel->find($_SESSION['user_id'] ?? 0);
        
        if (!$user) {
            Response::error('Usuario no encontrado', 404);
        }

        Response::success($this->userModel->hideFields($user), 'Usuario obtenido');
    }

    public function refresh(): void
    {
        // Obtener el token actual del header
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;

        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            Response::error('Token requerido', 401);
        }

        $token = $matches[1];

        try {
            $payload = JWT::decode($token);
            
            // Verificar que el usuario aún existe
            $user = $this->userModel->find($payload['user_id']);
            if (!$user) {
                Response::error('Usuario no encontrado', 404);
            }

            // Generar nuevo token
            $newPayload = [
                'user_id' => $user['id'],
                'login' => $user['login'],
                'nombre' => $user['nombre'],
                'apellido' => $user['apellido'],
                'perfil' => $user['perfil']
            ];

            $newToken = JWT::encode($newPayload);

            Response::success([
                'token' => $newToken,
                'expires_in' => 86400
            ], 'Token renovado');

        } catch (\Exception $e) {
            Response::error('Token inválido', 401);
        }
    }
}
