<?php

// Cargar variables de entorno
if (file_exists(__DIR__ . '/../.env')) {
    $lines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}

// Cargar autoloader de Composer
require_once __DIR__ . '/../vendor/autoload.php';

// Configurar manejo de errores
error_reporting(E_ALL);
ini_set('display_errors', $_ENV['APP_DEBUG'] ?? '0');

// Aplicar middleware CORS
use SAGAUT\Middleware\CorsMiddleware;
use SAGAUT\Middleware\AuthMiddleware;
CorsMiddleware::handle();

// Obtener la ruta solicitada
$requestUri = $_SERVER['REQUEST_URI'];
$scriptName = $_SERVER['SCRIPT_NAME'];

// Remover el directorio base del script
$basePath = dirname($scriptName);
if ($basePath !== '/') {
    $requestUri = substr($requestUri, strlen($basePath));
}

// Remover query string
$requestUri = strtok($requestUri, '?');

// Remover barras iniciales y finales
$requestUri = trim($requestUri, '/');

// Dividir la ruta en segmentos
$segments = $requestUri ? explode('/', $requestUri) : [];

// Determinar el controlador y método
$controller = $segments[0] ?? 'welcome';
$method = $segments[1] ?? 'index';
$id = $segments[2] ?? null;

// Manejo especial para métodos HTTP
$httpMethod = $_SERVER['REQUEST_METHOD'];

// Verificar si hay un método específico en la URL
// Un método específico es cualquier segmento que no sea numérico y no sea vacío
$hasSpecificMethod = false;
$specificMethodIndex = null;

// Buscar el primer segmento no numérico después del controlador
for ($i = 1; $i < count($segments); $i++) {
    if (!is_numeric($segments[$i]) && !empty($segments[$i])) {
        $hasSpecificMethod = true;
        $specificMethodIndex = $i;
        break;
    }
}

// Si hay un método específico, usarlo
if ($hasSpecificMethod) {
    $method = $segments[$specificMethodIndex];
    // Si hay segmentos antes del método específico, son IDs
    if ($specificMethodIndex > 1) {
        $id = $segments[$specificMethodIndex - 1];
    }
} else {
    // Si no hay método específico, usar el método HTTP para determinar la acción
    switch ($httpMethod) {
        case 'GET':
            $method = $id ? 'show' : 'index';
            break;
        case 'POST':
            $method = 'store';
            break;
        case 'PUT':
        case 'PATCH':
            $method = 'update';
            break;
        case 'DELETE':
            $method = 'delete';
            break;
    }
    
    // Si hay un ID en el segundo segmento y no hay método específico, usarlo
    if (!$hasSpecificMethod && isset($segments[1]) && is_numeric($segments[1])) {
        $id = $segments[1];
    }
}

// Manejo especial para rutas de maestros dinámicas
if ($controller === 'maestro' && isset($segments[1])) {
    $table = $segments[1];
    
    // Si hay un método específico después de la tabla, usarlo
    if ($hasSpecificMethod && $specificMethodIndex > 1) {
        $method = $segments[$specificMethodIndex];
        // Si hay segmentos antes del método específico, son IDs
        if ($specificMethodIndex > 2) {
            $id = $segments[$specificMethodIndex - 1];
        }
    } else {
        // Si no hay método específico, usar el método HTTP para determinar la acción
        switch ($httpMethod) {
            case 'GET':
                $method = $id ? 'show' : 'index';
                break;
            case 'POST':
                $method = 'store';
                break;
            case 'PUT':
            case 'PATCH':
                $method = 'update';
                break;
            case 'DELETE':
                $method = 'destroy';
                break;
        }
    }
    
    // Agregar la tabla como parámetro
    $_GET['table'] = $table;
}

// Mapeo de rutas
$routes = [
    'welcome' => [
        'controller' => 'WelcomeController',
        'methods' => [
            'index' => 'GET'
        ]
    ],
    'auth' => [
        'controller' => 'AuthController',
        'methods' => [
            'login' => 'POST',
            'logout' => 'POST', 
            'me' => 'GET',
            'refresh' => 'POST'
        ]
    ],
    'visitantes' => [
        'controller' => 'VisitanteController',
        'methods' => [
            'index' => 'GET',
            'show' => 'GET',
            'store' => 'POST',
            'update' => 'PUT',
            'delete' => 'DELETE',
            'cedula' => 'GET',
            'solicitados' => 'GET',
            'marcarSolicitadoConGuion' => 'POST',
            'desmarcarSolicitadoConGuion' => 'POST',
            'stats' => 'GET'
        ]
    ],
    'departamentos' => [
        'controller' => 'DepartamentoController',
        'methods' => [
            'index' => 'GET',
            'show' => 'GET',
            'store' => 'POST',
            'update' => 'PUT',
            'delete' => 'DELETE',
            'activos' => 'GET',
            'activar' => 'POST',
            'desactivar' => 'POST',
            'stats' => 'GET',
            'mas-visitados' => 'GET'
        ]
    ],
    'visitas' => [
        'controller' => 'VisitaController',
        'methods' => [
            'index' => 'GET',
            'show' => 'GET',
            'store' => 'POST',
            'update' => 'PUT',
            'delete' => 'DELETE',
            'finalizar' => 'POST',
            'cancelar' => 'POST',
            'activas' => 'GET',
            'hoy' => 'GET',
            'stats' => 'GET'
        ]
    ],
    'configuracion' => [
        'controller' => 'ConfiguracionController',
        'methods' => [
            'index' => 'GET',
            'show' => 'GET',
            'store' => 'POST',
            'update' => 'PUT',
            'delete' => 'DELETE'
        ]
    ],
    'dashboard' => [
        'controller' => 'DashboardController',
        'methods' => [
            'stats' => 'GET',
            'reports' => 'GET',
            'alertas' => 'GET',
            'metricas' => 'GET'
        ]
    ],
    'maestros' => [
        'controller' => 'MaestroController',
        'methods' => [
            'perfiles' => 'GET'
        ]
    ],
    'maestro' => [
        'controller' => 'MaestroController',
        'methods' => [
            'index' => 'GET',
            'show' => 'GET',
            'store' => 'POST',
            'update' => 'PUT',
            'destroy' => 'DELETE',
            'options' => 'GET',
            'stats' => 'GET'
        ]
    ],
    'upload' => [
        'controller' => 'UploadController',
        'methods' => [
            'uploadVisitorPhoto' => 'POST',
            'uploadImage' => 'POST',
            'deleteFile' => 'POST',
            'getFileInfo' => 'GET'
        ]
    ]
];

// Verificar si la ruta existe
if (!isset($routes[$controller])) {
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Ruta no encontrada',
        'code' => 404
    ]);
    exit;
}

$route = $routes[$controller];

// Verificar método HTTP
if (!isset($route['methods'][$method]) || $route['methods'][$method] !== $httpMethod) {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido',
        'code' => 405
    ]);
    exit;
}

// Cargar el controlador
$controllerClass = "SAGAUT\\Controllers\\{$route['controller']}";

if (!class_exists($controllerClass)) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Controlador no encontrado',
        'code' => 500
    ]);
    exit;
}

// Crear instancia del controlador
$controllerInstance = new $controllerClass();

// Verificar si el método existe
if (!method_exists($controllerInstance, $method)) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Método no encontrado',
        'code' => 500
    ]);
    exit;
}

// Aplicar middleware de autenticación para rutas protegidas
$protectedRoutes = ['visitantes', 'departamentos', 'dashboard', 'maestros', 'maestro', 'visitas'];
if (in_array($controller, $protectedRoutes)) {
    $authData = AuthMiddleware::handle();
    $_SESSION['user_id'] = $authData['user_id'];
    $_SESSION['user_data'] = $authData;
}

// Llamar al método del controlador
try {
    if ($controller === 'maestro' && isset($_GET['table'])) {
        // Para rutas dinámicas de maestros
        $table = $_GET['table'];
        if ($id) {
            $controllerInstance->$method($table, $id);
        } else {
            $controllerInstance->$method($table);
        }
    } else {
        // Para rutas normales
        if ($id) {
            $controllerInstance->$method($id);
        } else {
            $controllerInstance->$method();
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Error interno: ' . $e->getMessage(),
        'code' => 500
    ]);
    exit;
}