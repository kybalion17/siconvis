<?php

namespace SAGAUT\Controllers;

use SAGAUT\Models\Vehiculo;
use SAGAUT\Models\Chofer;
use SAGAUT\Models\Asignacion;
use SAGAUT\Models\Mantenimiento;
use SAGAUT\Models\Seguro;
use SAGAUT\Models\Siniestro;
use SAGAUT\Utils\Response;
use SAGAUT\Utils\Database;

class DashboardController
{
    private Vehiculo $vehiculoModel;
    private Chofer $choferModel;
    private Asignacion $asignacionModel;
    private Mantenimiento $mantenimientoModel;
    private Seguro $seguroModel;
    private Siniestro $siniestroModel;

    public function __construct()
    {
        $this->vehiculoModel = new Vehiculo();
        $this->choferModel = new Chofer();
        $this->asignacionModel = new Asignacion();
        $this->mantenimientoModel = new Mantenimiento();
        $this->seguroModel = new Seguro();
        $this->siniestroModel = new Siniestro();
    }


    public function stats(): void
    {
        try {
            // Estadísticas generales
            $vehiculosStats = $this->getVehiculosStats();
            $choferesStats = $this->getChoferesStats();
            $asignacionesStats = $this->getAsignacionesStats();
            $mantenimientosStats = $this->getMantenimientosStats();
            $segurosStats = $this->getSegurosStats();
            $siniestrosStats = $this->getSiniestrosStats();

            // Alertas y notificaciones
            $alertas = $this->getAlertas();

            $stats = [
                'vehiculos' => $vehiculosStats,
                'choferes' => $choferesStats,
                'asignaciones' => $asignacionesStats,
                'mantenimientos' => $mantenimientosStats,
                'seguros' => $segurosStats,
                'siniestros' => $siniestrosStats,
                'alertas' => $alertas
            ];

            Response::success($stats, 'Estadísticas del dashboard obtenidas exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener estadísticas: ' . $e->getMessage());
        }
    }

    public function reports(): void
    {
        try {
            $periodo = $_GET['periodo'] ?? '6m'; // 1m, 3m, 6m, 1y
            $fechaInicio = $this->getFechaInicio($periodo);
            $fechaFin = date('Y-m-d');

            $reports = [
                'vehiculos_por_clase' => $this->getVehiculosPorClase(),
                'asignaciones_por_mes' => $this->getAsignacionesPorMes($fechaInicio, $fechaFin),
                'mantenimientos_por_tipo' => $this->getMantenimientosPorTipo($fechaInicio, $fechaFin),
                'seguros_por_aseguradora' => $this->getSegurosPorAseguradora($fechaInicio, $fechaFin),
                'siniestros_por_tipo' => $this->getSiniestrosPorTipo($fechaInicio, $fechaFin),
                'costos_por_mes' => $this->getCostosPorMes($fechaInicio, $fechaFin),
                'utilizacion_vehiculos' => $this->getUtilizacionVehiculos($fechaInicio, $fechaFin),
                'rendimiento_choferes' => $this->getRendimientoChoferes($fechaInicio, $fechaFin)
            ];

            Response::success($reports, 'Reportes del dashboard obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener reportes: ' . $e->getMessage());
        }
    }

    public function alertas(): void
    {
        try {
            $alertas = $this->getAlertas();
            Response::success($alertas, 'Alertas obtenidas exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener alertas: ' . $e->getMessage());
        }
    }

    public function metricas(): void
    {
        try {
            $periodo = $_GET['periodo'] ?? '30d';
            $fechaInicio = $this->getFechaInicio($periodo);
            $fechaFin = date('Y-m-d');

            $metricas = [
                'kilometraje_total' => $this->getKilometrajeTotal($fechaInicio, $fechaFin),
                'costo_total_mantenimientos' => $this->getCostoTotalMantenimientos($fechaInicio, $fechaFin),
                'costo_total_seguros' => $this->getCostoTotalSeguros($fechaInicio, $fechaFin),
                'costo_total_siniestros' => $this->getCostoTotalSiniestros($fechaInicio, $fechaFin),
                'eficiencia_combustible' => $this->getEficienciaCombustible($fechaInicio, $fechaFin),
                'tiempo_promedio_asignacion' => $this->getTiempoPromedioAsignacion($fechaInicio, $fechaFin),
                'vehiculos_mas_utilizados' => $this->getVehiculosMasUtilizados($fechaInicio, $fechaFin),
                'choferes_mas_activos' => $this->getChoferesMasActivos($fechaInicio, $fechaFin)
            ];

            Response::success($metricas, 'Métricas obtenidas exitosamente');

        } catch (\Exception $e) {
            Response::serverError('Error al obtener métricas: ' . $e->getMessage());
        }
    }

    private function getVehiculosStats(): array
    {
        $sql = "
            SELECT 
                COUNT(*) as total,
                COUNT(*) as activos,
                0 as inactivos,
                0 as en_mantenimiento,
                0 as en_reparacion
            FROM trmavehiculos 
            WHERE eliminado = 0
        ";
        
        $result = Database::fetchOne($sql);
        
        return [
            'total' => (int)$result['total'],
            'activos' => (int)$result['activos'],
            'inactivos' => (int)$result['inactivos'],
            'en_mantenimiento' => (int)$result['en_mantenimiento'],
            'en_reparacion' => (int)$result['en_reparacion']
        ];
    }

    private function getChoferesStats(): array
    {
        $sql = "
            SELECT 
                COUNT(*) as total,
                COUNT(*) as activos,
                0 as inactivos,
                SUM(CASE WHEN DATEDIFF(fecha_lic_ven, CURDATE()) <= 30 THEN 1 ELSE 0 END) as licencias_por_vencer,
                SUM(CASE WHEN DATEDIFF(fecha_cer_ven, CURDATE()) <= 30 THEN 1 ELSE 0 END) as certificados_por_vencer
            FROM trmachoferes 
            WHERE eliminado = 0
        ";
        
        $result = Database::fetchOne($sql);
        
        return [
            'total' => (int)$result['total'],
            'activos' => (int)$result['activos'],
            'inactivos' => (int)$result['inactivos'],
            'licencias_por_vencer' => (int)$result['licencias_por_vencer'],
            'certificados_por_vencer' => (int)$result['certificados_por_vencer']
        ];
    }

    private function getAsignacionesStats(): array
    {
        $sql = "
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN fecha_devolucion IS NULL THEN 1 ELSE 0 END) as activas,
                0 as por_vencer,
                0 as vencidas,
                SUM(CASE WHEN fecha_devolucion IS NOT NULL THEN 1 ELSE 0 END) as finalizadas
            FROM trdetasignar 
            WHERE eliminado = 0
        ";
        
        $result = Database::fetchOne($sql);
        
        return [
            'total' => (int)$result['total'],
            'activas' => (int)$result['activas'],
            'por_vencer' => (int)$result['por_vencer'],
            'vencidas' => (int)$result['vencidas'],
            'finalizadas' => (int)$result['finalizadas']
        ];
    }

    private function getMantenimientosStats(): array
    {
        $sql = "
            SELECT 
                COUNT(*) as total,
                0 as programados,
                0 as en_proceso,
                COUNT(*) as completados,
                0 as cancelados,
                0 as costo_promedio,
                0 as costo_total
            FROM trdetmantenimiento 
            WHERE eliminado = 0
        ";
        
        $result = Database::fetchOne($sql);
        
        return [
            'total' => (int)$result['total'],
            'programados' => (int)$result['programados'],
            'en_proceso' => (int)$result['en_proceso'],
            'completados' => (int)$result['completados'],
            'cancelados' => (int)$result['cancelados'],
            'costo_promedio' => (float)($result['costo_promedio'] ?? 0),
            'costo_total' => (float)($result['costo_total'] ?? 0)
        ];
    }

    private function getSegurosStats(): array
    {
        $sql = "
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN fecha_vencimiento >= CURDATE() THEN 1 ELSE 0 END) as activos,
                SUM(CASE WHEN fecha_vencimiento < CURDATE() THEN 1 ELSE 0 END) as vencidos,
                SUM(CASE WHEN fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND fecha_vencimiento >= CURDATE() THEN 1 ELSE 0 END) as por_vencer,
                AVG(monto) as prima_promedio,
                SUM(monto) as prima_total
            FROM trdetpoliza 
            WHERE eliminado = 0
        ";
        
        $result = Database::fetchOne($sql);
        
        return [
            'total' => (int)$result['total'],
            'activos' => (int)$result['activos'],
            'vencidos' => (int)$result['vencidos'],
            'por_vencer' => (int)$result['por_vencer'],
            'prima_promedio' => (float)($result['prima_promedio'] ?? 0),
            'prima_total' => (float)($result['prima_total'] ?? 0)
        ];
    }

    private function getSiniestrosStats(): array
    {
        $sql = "
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'reportado' THEN 1 ELSE 0 END) as reportados,
                SUM(CASE WHEN estado = 'en_proceso' THEN 1 ELSE 0 END) as en_investigacion,
                SUM(CASE WHEN estado = 'cerrado' THEN 1 ELSE 0 END) as cerrados,
                0 as archivados,
                AVG(daños_estimados) as costo_promedio,
                SUM(daños_estimados) as costo_total
            FROM trdetsiniestro 
            WHERE eliminado = 0
        ";
        
        $result = Database::fetchOne($sql);
        
        return [
            'total' => (int)$result['total'],
            'reportados' => (int)$result['reportados'],
            'en_investigacion' => (int)$result['en_investigacion'],
            'cerrados' => (int)$result['cerrados'],
            'archivados' => (int)$result['archivados'],
            'costo_promedio' => (float)($result['costo_promedio'] ?? 0),
            'costo_total' => (float)($result['costo_total'] ?? 0)
        ];
    }

    private function getAlertas(): array
    {
        $alertas = [];
        
        try {
            // Licencias por vencer
            $sql = "SELECT COUNT(*) as total FROM trmachoferes 
                    WHERE fecha_lic_ven <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) 
                    AND fecha_lic_ven > CURDATE() AND eliminado = 0";
            $result = Database::fetchOne($sql);
            $licenciasPorVencer = (int)$result['total'];
            
            if ($licenciasPorVencer > 0) {
                $alertas[] = [
                    'tipo' => 'warning',
                    'titulo' => 'Licencias por vencer',
                    'mensaje' => $licenciasPorVencer . ' choferes tienen licencias próximas a vencer',
                    'cantidad' => $licenciasPorVencer,
                    'accion' => 'choferes/licencias-por-vencer'
                ];
            }

            // Mantenimientos por vencer
            $sql = "SELECT COUNT(*) as total FROM trdetmantenimiento 
                    WHERE fecha_programada <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) 
                    AND fecha_programada > CURDATE() AND eliminado = 0";
            $result = Database::fetchOne($sql);
            $mantenimientosPorVencer = (int)$result['total'];
            
            if ($mantenimientosPorVencer > 0) {
                $alertas[] = [
                    'tipo' => 'warning',
                    'titulo' => 'Mantenimientos por vencer',
                    'mensaje' => $mantenimientosPorVencer . ' mantenimientos próximos a vencer',
                    'cantidad' => $mantenimientosPorVencer,
                    'accion' => 'mantenimientos/por-vencer'
                ];
            }

            // Seguros por vencer
            $sql = "SELECT COUNT(*) as total FROM trdetpoliza 
                    WHERE fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) 
                    AND fecha_vencimiento > CURDATE() AND eliminado = 0";
            $result = Database::fetchOne($sql);
            $segurosPorVencer = (int)$result['total'];
            
            if ($segurosPorVencer > 0) {
                $alertas[] = [
                    'tipo' => 'warning',
                    'titulo' => 'Seguros por vencer',
                    'mensaje' => $segurosPorVencer . ' seguros próximos a vencer',
                    'cantidad' => $segurosPorVencer,
                    'accion' => 'seguros/por-vencer'
                ];
            }

            // Asignaciones vencidas
            $sql = "SELECT COUNT(*) as total FROM trdetasignar 
                    WHERE fecha_devolucion < CURDATE() AND eliminado = 0";
            $result = Database::fetchOne($sql);
            $asignacionesVencidas = (int)$result['total'];
            
            if ($asignacionesVencidas > 0) {
                $alertas[] = [
                    'tipo' => 'error',
                    'titulo' => 'Asignaciones vencidas',
                    'mensaje' => $asignacionesVencidas . ' asignaciones han vencido',
                    'cantidad' => $asignacionesVencidas,
                    'accion' => 'asignaciones/vencidas'
                ];
            }
        } catch (\Exception $e) {
            // Si hay error en las alertas, continuar sin ellas
            error_log('Error en getAlertas: ' . $e->getMessage());
        }

        return $alertas;
    }

    private function getResumenGeneral(): array
    {
        $sql = "
            SELECT 
                (SELECT COUNT(*) FROM trmavehiculos WHERE eliminado = 0) as total_vehiculos,
                (SELECT COUNT(*) FROM trmachoferes WHERE eliminado = 0) as total_choferes,
                (SELECT COUNT(*) FROM trdetasignar WHERE fecha_devolucion IS NULL AND eliminado = 0) as asignaciones_activas,
                (SELECT COUNT(*) FROM trdetmantenimiento WHERE eliminado = 0) as mantenimientos_en_proceso,
                (SELECT COUNT(*) FROM trdetpoliza WHERE fecha_vencimiento >= CURDATE() AND eliminado = 0) as seguros_activos,
                (SELECT COUNT(*) FROM trdetsiniestro WHERE estado IN ('reportado', 'en_proceso') AND eliminado = 0) as siniestros_abiertos
        ";
        
        $result = Database::fetchOne($sql);
        
        return [
            'total_vehiculos' => (int)$result['total_vehiculos'],
            'total_choferes' => (int)$result['total_choferes'],
            'asignaciones_activas' => (int)$result['asignaciones_activas'],
            'mantenimientos_en_proceso' => (int)$result['mantenimientos_en_proceso'],
            'seguros_activos' => (int)$result['seguros_activos'],
            'siniestros_abiertos' => (int)$result['siniestros_abiertos']
        ];
    }

    private function getVehiculosPorClase(): array
    {
        $sql = "
            SELECT 
                cv.nombre as clase,
                COUNT(*) as cantidad
            FROM trmavehiculos v
            LEFT JOIN trmaclase cv ON v.clase = cv.id
            WHERE v.eliminado = 0
            GROUP BY v.clase, cv.nombre
            ORDER BY cantidad DESC
        ";
        
        return Database::fetchAll($sql);
    }

    private function getAsignacionesPorMes(string $fechaInicio, string $fechaFin): array
    {
        $sql = "
            SELECT 
                DATE_FORMAT(fecha_asignacion, '%Y-%m') as mes,
                COUNT(*) as total,
                SUM(CASE WHEN fecha_devolucion IS NULL THEN 1 ELSE 0 END) as activas,
                SUM(CASE WHEN fecha_devolucion IS NOT NULL THEN 1 ELSE 0 END) as finalizadas
            FROM trdetasignar
            WHERE eliminado = 0
            AND fecha_asignacion BETWEEN ? AND ?
            GROUP BY DATE_FORMAT(fecha_asignacion, '%Y-%m')
            ORDER BY mes ASC
        ";
        
        return Database::fetchAll($sql, [$fechaInicio, $fechaFin]);
    }

    private function getMantenimientosPorTipo(string $fechaInicio, string $fechaFin): array
    {
        $sql = "
            SELECT 
                tm.nombre as tipo,
                COUNT(*) as total,
                0 as costo_promedio
            FROM trdetmantenimiento m
            LEFT JOIN trmatipo_mantenimiento tm ON m.tipo_mantenimiento = tm.id
            WHERE m.eliminado = 0
            AND m.fecha_mantenimiento BETWEEN ? AND ?
            GROUP BY m.tipo_mantenimiento, tm.nombre
            ORDER BY total DESC
        ";
        
        return Database::fetchAll($sql, [$fechaInicio, $fechaFin]);
    }

    private function getSegurosPorAseguradora(string $fechaInicio, string $fechaFin): array
    {
        $sql = "
            SELECT 
                a.nombre as aseguradora,
                COUNT(*) as total,
                AVG(s.monto) as prima_promedio
            FROM trdetpoliza s
            LEFT JOIN trmaaseguradoras a ON s.aseguradora = a.id
            WHERE s.eliminado = 0
            AND s.fecha_inicio BETWEEN ? AND ?
            GROUP BY s.aseguradora, a.nombre
            ORDER BY total DESC
        ";
        
        return Database::fetchAll($sql, [$fechaInicio, $fechaFin]);
    }

    private function getSiniestrosPorTipo(string $fechaInicio, string $fechaFin): array
    {
        $sql = "
            SELECT 
                'Accidente' as tipo,
                COUNT(*) as total,
                AVG(daños_estimados) as costo_promedio
            FROM trdetsiniestro
            WHERE eliminado = 0
            AND fecha_siniestro BETWEEN ? AND ?
            GROUP BY 'Accidente'
            ORDER BY total DESC
        ";
        
        return Database::fetchAll($sql, [$fechaInicio, $fechaFin]);
    }

    private function getCostosPorMes(string $fechaInicio, string $fechaFin): array
    {
        $sql = "
            SELECT 
                DATE_FORMAT(fecha, '%Y-%m') as mes,
                SUM(costo_mantenimientos) as mantenimientos,
                SUM(costo_seguros) as seguros,
                SUM(costo_siniestros) as siniestros,
                (SUM(costo_mantenimientos) + SUM(costo_seguros) + SUM(costo_siniestros)) as total
            FROM (
                SELECT 
                    fecha_mantenimiento as fecha,
                    0 as costo_mantenimientos,
                    0 as costo_seguros,
                    0 as costo_siniestros
                FROM trdetmantenimiento
                WHERE eliminado = 0
                UNION ALL
                SELECT 
                    fecha_inicio as fecha,
                    0 as costo_mantenimientos,
                    monto as costo_seguros,
                    0 as costo_siniestros
                FROM trdetpoliza
                WHERE eliminado = 0 AND monto IS NOT NULL
                UNION ALL
                SELECT 
                    fecha_siniestro as fecha,
                    0 as costo_mantenimientos,
                    0 as costo_seguros,
                    daños_estimados as costo_siniestros
                FROM trdetsiniestro
                WHERE eliminado = 0 AND daños_estimados IS NOT NULL
            ) as costos
            WHERE fecha BETWEEN ? AND ?
            GROUP BY DATE_FORMAT(fecha, '%Y-%m')
            ORDER BY mes ASC
        ";
        
        return Database::fetchAll($sql, [$fechaInicio, $fechaFin]);
    }

    private function getUtilizacionVehiculos(string $fechaInicio, string $fechaFin): array
    {
        $sql = "
            SELECT 
                v.placa,
                cv.nombre as clase,
                COUNT(a.id) as asignaciones,
                SUM(DATEDIFF(COALESCE(a.fecha_devolucion, CURDATE()), a.fecha_asignacion)) as dias_utilizacion
            FROM trmavehiculos v
            LEFT JOIN trmaclase cv ON v.clase = cv.id
            LEFT JOIN trdetasignar a ON v.id = a.id_vehiculo 
                AND a.eliminado = 0 
                AND a.fecha_asignacion BETWEEN ? AND ?
            WHERE v.eliminado = 0
            GROUP BY v.id, v.placa, cv.nombre
            ORDER BY dias_utilizacion DESC
            LIMIT 10
        ";
        
        return Database::fetchAll($sql, [$fechaInicio, $fechaFin]);
    }

    private function getRendimientoChoferes(string $fechaInicio, string $fechaFin): array
    {
        $sql = "
            SELECT 
                c.cedula,
                c.nombre,
                c.apellido,
                COUNT(a.id) as asignaciones,
                SUM(DATEDIFF(COALESCE(a.fecha_devolucion, CURDATE()), a.fecha_asignacion)) as dias_trabajados
            FROM trmachoferes c
            LEFT JOIN trdetasignar a ON c.id = a.chofer 
                AND a.eliminado = 0 
                AND a.fecha_asignacion BETWEEN ? AND ?
            WHERE c.eliminado = 0
            GROUP BY c.id, c.cedula, c.nombre, c.apellido
            ORDER BY dias_trabajados DESC
            LIMIT 10
        ";
        
        return Database::fetchAll($sql, [$fechaInicio, $fechaFin]);
    }

    private function getKilometrajeTotal(string $fechaInicio, string $fechaFin): float
    {
        $sql = "
            SELECT SUM(km) as total
            FROM trmavehiculos
            WHERE eliminado = 0
        ";
        
        $result = Database::fetchOne($sql);
        return (float)($result['total'] ?? 0);
    }

    private function getCostoTotalMantenimientos(string $fechaInicio, string $fechaFin): float
    {
        $sql = "
            SELECT 0 as total
            FROM trdetmantenimiento
            WHERE eliminado = 0 
            AND fecha_mantenimiento BETWEEN ? AND ?
        ";
        
        $result = Database::fetchOne($sql, [$fechaInicio, $fechaFin]);
        return (float)($result['total'] ?? 0);
    }

    private function getCostoTotalSeguros(string $fechaInicio, string $fechaFin): float
    {
        $sql = "
            SELECT SUM(monto) as total
            FROM trdetpoliza
            WHERE eliminado = 0 
            AND monto IS NOT NULL
            AND fecha_inicio BETWEEN ? AND ?
        ";
        
        $result = Database::fetchOne($sql, [$fechaInicio, $fechaFin]);
        return (float)($result['total'] ?? 0);
    }

    private function getCostoTotalSiniestros(string $fechaInicio, string $fechaFin): float
    {
        $sql = "
            SELECT SUM(daños_estimados) as total
            FROM trdetsiniestro
            WHERE eliminado = 0 
            AND daños_estimados IS NOT NULL
            AND fecha_siniestro BETWEEN ? AND ?
        ";
        
        $result = Database::fetchOne($sql, [$fechaInicio, $fechaFin]);
        return (float)($result['total'] ?? 0);
    }

    private function getEficienciaCombustible(string $fechaInicio, string $fechaFin): array
    {
        // Esta métrica requeriría una tabla de consumo de combustible
        // Por ahora retornamos datos simulados
        return [
            'promedio_km_litro' => 12.5,
            'vehiculo_mas_eficiente' => 'ABC-123',
            'vehiculo_menos_eficiente' => 'XYZ-789'
        ];
    }

    private function getTiempoPromedioAsignacion(string $fechaInicio, string $fechaFin): float
    {
        $sql = "
            SELECT AVG(DATEDIFF(COALESCE(fecha_devolucion, CURDATE()), fecha_asignacion)) as promedio
            FROM trdetasignar
            WHERE eliminado = 0
            AND fecha_asignacion BETWEEN ? AND ?
        ";
        
        $result = Database::fetchOne($sql, [$fechaInicio, $fechaFin]);
        return (float)($result['promedio'] ?? 0);
    }

    private function getVehiculosMasUtilizados(string $fechaInicio, string $fechaFin): array
    {
        $sql = "
            SELECT 
                v.placa,
                cv.nombre as clase,
                COUNT(a.id) as asignaciones
            FROM trmavehiculos v
            LEFT JOIN trmaclase cv ON v.clase = cv.id
            LEFT JOIN trdetasignar a ON v.id = a.id_vehiculo 
                AND a.eliminado = 0 
                AND a.fecha_asignacion BETWEEN ? AND ?
            WHERE v.eliminado = 0
            GROUP BY v.id, v.placa, cv.nombre
            ORDER BY asignaciones DESC
            LIMIT 5
        ";
        
        return Database::fetchAll($sql, [$fechaInicio, $fechaFin]);
    }

    private function getChoferesMasActivos(string $fechaInicio, string $fechaFin): array
    {
        $sql = "
            SELECT 
                c.cedula,
                c.nombre,
                c.apellido,
                COUNT(a.id) as asignaciones
            FROM trmachoferes c
            LEFT JOIN trdetasignar a ON c.id = a.chofer 
                AND a.eliminado = 0 
                AND a.fecha_asignacion BETWEEN ? AND ?
            WHERE c.eliminado = 0
            GROUP BY c.id, c.cedula, c.nombre, c.apellido
            ORDER BY asignaciones DESC
            LIMIT 5
        ";
        
        return Database::fetchAll($sql, [$fechaInicio, $fechaFin]);
    }

    private function getFechaInicio(string $periodo): string
    {
        switch ($periodo) {
            case '1m':
                return date('Y-m-d', strtotime('-1 month'));
            case '3m':
                return date('Y-m-d', strtotime('-3 months'));
            case '6m':
                return date('Y-m-d', strtotime('-6 months'));
            case '1y':
                return date('Y-m-d', strtotime('-1 year'));
            default:
                return date('Y-m-d', strtotime('-6 months'));
        }
    }
}