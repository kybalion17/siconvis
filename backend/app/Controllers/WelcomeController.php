<?php

namespace SAGAUT\Controllers;

use SAGAUT\Utils\Response;

class WelcomeController
{
    public function index(): void
    {
        Response::success([
            'message' => 'Bienvenido a SICONFLOT - Sistema Control de Flota',
            'version' => '1.0.0',
            'status' => 'API funcionando correctamente',
            'endpoints' => [
                'auth' => '/auth/login',
                'dashboard' => '/dashboard/stats',
                'vehiculos' => '/vehiculos',
                'choferes' => '/choferes',
                'asignaciones' => '/asignaciones',
                'mantenimientos' => '/mantenimientos',
                'seguros' => '/seguros',
                'siniestros' => '/siniestros',
                'documentos' => '/documentos'
            ],
            'documentation' => 'Consulte el README.md para más información'
        ], 'API SICONFLOT iniciada exitosamente');
    }
}
