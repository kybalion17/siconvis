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

// Si el segundo segmento es un ID numérico, ajustar la lógica
if (isset($segments[1]) && is_numeric($segments[1])) {
    $id = $segments[1];
    $method = 'index'; // Resetear método para usar la lógica HTTP
}

if (!isset($segments[1]) || $segments[1] === null || is_numeric($segments[1])) {
    // Si no hay método específico en la URL o es un ID, usar el método HTTP para determinar la acción
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
}

// Manejo especial para rutas de maestros dinámicas
if ($controller === 'maestro' && isset($segments[1])) {
    $table = $segments[1];
    
    // Si el segundo segmento es un ID numérico, ajustar la lógica
    if (isset($segments[2]) && is_numeric($segments[2])) {
        $id = $segments[2];
        $method = 'index'; // Resetear método para usar la lógica HTTP
    } else {
        $method = $segments[2] ?? 'index';
        $id = $segments[3] ?? null;
    }
    
    // Agregar la tabla como parámetro
    $_GET['table'] = $table;
    
    // Si no hay método específico en la URL o es un ID, usar el método HTTP para determinar la acción
    if (!isset($segments[2]) || $segments[2] === null || is_numeric($segments[2])) {
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
    'vehiculos' => [
        'controller' => 'VehiculoController',
        'methods' => [
            'index' => 'GET',
            'show' => 'GET',
            'store' => 'POST',
            'update' => 'PUT',
            'delete' => 'DELETE',
            'disponibles' => 'GET',
            'estadisticas' => 'GET',
            'mantenimientos' => 'GET',
            'asignaciones' => 'GET'
        ]
    ],
    'choferes' => [
        'controller' => 'ChoferController',
        'methods' => [
            'index' => 'GET',
            'show' => 'GET',
            'store' => 'POST',
            'update' => 'PUT',
            'delete' => 'DELETE',
            'disponibles' => 'GET',
            'estadisticas' => 'GET',
            'licenciasPorVencer' => 'GET',
            'certificadosPorVencer' => 'GET',
            'asignaciones' => 'GET',
            'asignacionActual' => 'GET',
            'validarLicencia' => 'GET'
        ]
    ],
    'asignaciones' => [
        'controller' => 'AsignacionController',
        'methods' => [
            'index' => 'GET',
            'show' => 'GET',
            'store' => 'POST',
            'update' => 'PUT',
            'delete' => 'DELETE',
            'finalizar' => 'POST',
            'cancelar' => 'POST',
            'activas' => 'GET',
            'porVencer' => 'GET',
            'vencidas' => 'GET',
            'estadisticas' => 'GET'
        ]
    ],
    'mantenimientos' => [
        'controller' => 'MantenimientoController',
        'methods' => [
            'index' => 'GET',
            'show' => 'GET',
            'store' => 'POST',
            'update' => 'PUT',
            'delete' => 'DELETE',
            'iniciar' => 'POST',
            'completar' => 'POST',
            'cancelar' => 'POST',
            'pendientes' => 'GET',
            'porVencer' => 'GET',
            'vencidos' => 'GET',
            'estadisticas' => 'GET',
            'porVehiculo' => 'GET',
            'proximos' => 'GET',
            'programar' => 'POST'
        ]
    ],
    'seguros' => [
        'controller' => 'SeguroController',
        'methods' => [
            'index' => 'GET',
            'show' => 'GET',
            'store' => 'POST',
            'update' => 'PUT',
            'delete' => 'DELETE',
            'porVencer' => 'GET',
            'vencidos' => 'GET',
            'estadisticas' => 'GET',
            'porVehiculo' => 'GET',
            'activo' => 'GET',
            'renovar' => 'POST',
            'alertas' => 'GET'
        ]
    ],
    'siniestros' => [
        'controller' => 'SiniestroController',
        'methods' => [
            'index' => 'GET',
            'show' => 'GET',
            'store' => 'POST',
            'update' => 'PUT',
            'delete' => 'DELETE',
            'abiertos' => 'GET',
            'porTipo' => 'GET',
            'estadisticas' => 'GET',
            'porVehiculo' => 'GET',
            'porPeriodo' => 'GET',
            'conTransito' => 'GET',
            'conDenuncia' => 'GET',
            'cerrar' => 'POST',
            'archivar' => 'POST',
            'porTaller' => 'GET',
            'porMes' => 'GET'
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
    'documentos' => [
        'controller' => 'DocumentoController',
        'methods' => [
            'index' => 'GET',
            'show' => 'GET',
            'store' => 'POST',
            'update' => 'PUT',
            'delete' => 'DELETE',
            'download' => 'GET',
            'view' => 'GET',
            'porEntidad' => 'GET',
            'porVencer' => 'GET',
            'vencidos' => 'GET',
            'estadisticas' => 'GET',
            'buscar' => 'GET',
            'porCategoria' => 'GET',
            'recientes' => 'GET',
            'info' => 'GET'
        ]
    ],
    'maestros' => [
        'controller' => 'MaestroController',
        'methods' => [
            'clases' => 'GET',
            'marcas' => 'GET',
            'modelos' => 'GET',
            'colores' => 'GET',
            'combustibles' => 'GET',
            'transmisiones' => 'GET',
            'asientos' => 'GET',
            'unidadesPeso' => 'GET',
            'choferes' => 'GET',
            'organismos' => 'GET',
            'talleres' => 'GET',
            'aseguradoras' => 'GET',
            'tiposMantenimiento' => 'GET',
            'sexos' => 'GET',
            'licencias' => 'GET',
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
$protectedRoutes = ['vehiculos', 'choferes', 'asignaciones', 'mantenimientos', 'seguros', 'siniestros', 'dashboard', 'maestros', 'maestro'];
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
