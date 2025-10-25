<?php

namespace SAGAUT\Controllers;

use SAGAUT\Models\Visitante;
use SAGAUT\Models\Departamento;
use SAGAUT\Utils\Response;
use SAGAUT\Utils\Database;

class DashboardController
{
    private Visitante $visitanteModel;
    private Departamento $departamentoModel;

    public function __construct()
    {
        $this->visitanteModel = new Visitante();
        $this->departamentoModel = new Departamento();
    }

    public function stats(): void
    {
        try {
            // Estadísticas generales
            $visitantesStats = $this->getVisitantesStats();
            $departamentosStats = $this->getDepartamentosStats();
            $visitasStats = $this->getVisitasStats();

            // Alertas y notificaciones
            $alertas = $this->getAlertas();

            $stats = [
                'total_visitantes' => $visitantesStats['total_visitantes'],
                'visitantes_solicitados' => $visitantesStats['visitantes_solicitados'],
                'visitantes_hoy' => $visitantesStats['visitantes_hoy'],
                'visitantes_pendientes' => $visitantesStats['visitantes_pendientes'],
                'total_departamentos' => $departamentosStats['total_departamentos'],
                'departamentos_activos' => $departamentosStats['departamentos_activos'],
                'departamentos_inactivos' => $departamentosStats['departamentos_inactivos'],
                'visitas_activas' => $visitasStats['visitas_activas'],
                'visitas_hoy' => $visitasStats['visitas_hoy'],
                'total_visitas' => $visitasStats['total_visitas'],
                'visitas_finalizadas' => $visitasStats['visitas_finalizadas'],
                'visitas_canceladas' => $visitasStats['visitas_canceladas'],
                'alertas' => $alertas
            ];

            Response::success($stats, 'Estadísticas del dashboard obtenidas exitosamente');

        } catch (\Exception $e) {
            Response::error('Error al obtener estadísticas: ' . $e->getMessage(), 500);
        }
    }

    public function reports(): void
    {
        try {
            $periodo = $_GET['periodo'] ?? '6m'; // 1m, 3m, 6m, 1y
            $fechaInicio = $this->getFechaInicio($periodo);
            $fechaFin = date('Y-m-d');

            $reports = [
                'visitas_por_departamento' => $this->getVisitasPorDepartamento($fechaInicio, $fechaFin),
                'visitas_por_mes' => $this->getVisitasPorMes($fechaInicio, $fechaFin),
                'visitantes_mas_frecuentes' => $this->getVisitantesMasFrecuentes($fechaInicio, $fechaFin),
                'departamentos_mas_visitados' => $this->getDepartamentosMasVisitados($fechaInicio, $fechaFin),
                'visitas_por_motivo' => $this->getVisitasPorMotivo($fechaInicio, $fechaFin),
                'tiempo_promedio_visita' => $this->getTiempoPromedioVisita($fechaInicio, $fechaFin),
                'horarios_pico' => $this->getHorariosPico($fechaInicio, $fechaFin),
                'tendencias_mensuales' => $this->getTendenciasMensuales($fechaInicio, $fechaFin)
            ];

            Response::success($reports, 'Reportes del dashboard obtenidos exitosamente');

        } catch (\Exception $e) {
            Response::error('Error al obtener reportes: ' . $e->getMessage(), 500);
        }
    }

    public function alertas(): void
    {
        try {
            $alertas = $this->getAlertas();
            Response::success($alertas, 'Alertas obtenidas exitosamente');

        } catch (\Exception $e) {
            Response::error('Error al obtener alertas: ' . $e->getMessage(), 500);
        }
    }

    private function getVisitantesStats(): array
    {
        $sql = "
            SELECT 
                COUNT(*) as total_visitantes,
                SUM(CASE WHEN solicitado = 1 THEN 1 ELSE 0 END) as visitantes_solicitados,
                SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as visitantes_hoy,
                SUM(CASE WHEN solicitado = 0 THEN 1 ELSE 0 END) as visitantes_pendientes
            FROM trmavisitantes 
            WHERE eliminado = 0
        ";
        
        $result = Database::fetchOne($sql);
        
        return [
            'total_visitantes' => (int)$result['total_visitantes'],
            'visitantes_solicitados' => (int)$result['visitantes_solicitados'],
            'visitantes_hoy' => (int)$result['visitantes_hoy'],
            'visitantes_pendientes' => (int)$result['visitantes_pendientes']
        ];
    }

    private function getDepartamentosStats(): array
    {
        $sql = "
            SELECT 
                COUNT(*) as total_departamentos,
                SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as departamentos_activos,
                SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as departamentos_inactivos
            FROM trmadepartamentos 
            WHERE eliminado = 0
        ";
        
        $result = Database::fetchOne($sql);
        
        return [
            'total_departamentos' => (int)$result['total_departamentos'],
            'departamentos_activos' => (int)$result['departamentos_activos'],
            'departamentos_inactivos' => (int)$result['departamentos_inactivos']
        ];
    }

    private function getVisitasStats(): array
    {
        $sql = "
            SELECT 
                COUNT(*) as total_visitas,
                SUM(CASE WHEN estado = 'activa' THEN 1 ELSE 0 END) as visitas_activas,
                SUM(CASE WHEN DATE(fecha_entrada) = CURDATE() THEN 1 ELSE 0 END) as visitas_hoy,
                SUM(CASE WHEN estado = 'finalizada' THEN 1 ELSE 0 END) as visitas_finalizadas,
                SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as visitas_canceladas
            FROM trdetvisitas 
            WHERE eliminado = 0
        ";
        
        $result = Database::fetchOne($sql);
        
        return [
            'visitas_activas' => (int)$result['visitas_activas'],
            'visitas_hoy' => (int)$result['visitas_hoy'],
            'total_visitas' => (int)$result['total_visitas'],
            'visitas_finalizadas' => (int)$result['visitas_finalizadas'],
            'visitas_canceladas' => (int)$result['visitas_canceladas']
        ];
    }

    private function getAlertas(): array
    {
        $alertas = [];
        
        try {
            // Visitantes sin foto
            $sql = "SELECT COUNT(*) as total FROM trmavisitantes 
                    WHERE (foto IS NULL OR foto = '') AND eliminado = 0";
            $result = Database::fetchOne($sql);
            $sinFoto = (int)$result['total'];
            
            if ($sinFoto > 0) {
                $alertas[] = [
                    'tipo' => 'warning',
                    'titulo' => 'Visitantes sin foto',
                    'mensaje' => $sinFoto . ' visitantes no tienen foto registrada',
                    'cantidad' => $sinFoto,
                    'accion' => 'visitantes/sin-foto'
                ];
            }

            // Visitas activas prolongadas (más de 4 horas)
            $sql = "SELECT COUNT(*) as total FROM trdetvisitas 
                    WHERE estado = 'activa' 
                    AND fecha_entrada <= DATE_SUB(NOW(), INTERVAL 4 HOUR)
                    AND eliminado = 0";
            $result = Database::fetchOne($sql);
            $visitasProlongadas = (int)$result['total'];
            
            if ($visitasProlongadas > 0) {
                $alertas[] = [
                    'tipo' => 'warning',
                    'titulo' => 'Visitas prolongadas',
                    'mensaje' => $visitasProlongadas . ' visitas activas por más de 4 horas',
                    'cantidad' => $visitasProlongadas,
                    'accion' => 'visitas/prolongadas'
                ];
            }
            
            // Visitas recientes (últimas 24 horas)
            $sql = "SELECT COUNT(*) as total FROM trdetvisitas 
                    WHERE fecha_entrada >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
                    AND eliminado = 0";
            $result = Database::fetchOne($sql);
            $visitasRecientes = (int)$result['total'];
            
            if ($visitasRecientes > 0) {
                $alertas[] = [
                    'tipo' => 'info',
                    'titulo' => 'Actividad reciente',
                    'mensaje' => $visitasRecientes . ' visitas registradas en las últimas 24 horas',
                    'cantidad' => $visitasRecientes,
                    'accion' => 'visitas/recientes'
                ];
            }

            // Departamentos inactivos
            $sql = "SELECT COUNT(*) as total FROM trmadepartamentos 
                    WHERE status = 0 AND eliminado = 0";
            $result = Database::fetchOne($sql);
            $departamentosInactivos = (int)$result['total'];
            
            if ($departamentosInactivos > 0) {
                $alertas[] = [
                    'tipo' => 'info',
                    'titulo' => 'Departamentos inactivos',
                    'mensaje' => $departamentosInactivos . ' departamentos están inactivos',
                    'cantidad' => $departamentosInactivos,
                    'accion' => 'departamentos/inactivos'
                ];
            }

            // Visitantes solicitados pendientes
            $sql = "SELECT COUNT(*) as total FROM trmavisitantes 
                    WHERE solicitado = 1 AND eliminado = 0";
            $result = Database::fetchOne($sql);
            $solicitadosPendientes = (int)$result['total'];
            
            if ($solicitadosPendientes > 0) {
                $alertas[] = [
                    'tipo' => 'success',
                    'titulo' => 'Visitantes solicitados',
                    'mensaje' => $solicitadosPendientes . ' visitantes han sido solicitados',
                    'cantidad' => $solicitadosPendientes,
                    'accion' => 'visitantes/solicitados'
                ];
            }

        } catch (\Exception $e) {
            // Si hay error en las alertas, continuar sin ellas
            error_log('Error en getAlertas: ' . $e->getMessage());
        }

        return $alertas;
    }

    private function getVisitasPorDepartamento(string $fechaInicio, string $fechaFin): array
    {
        $sql = "
            SELECT 
                d.nombre as departamento,
                COUNT(v.id) as total_visitas,
                COUNT(DISTINCT v.visitante_id) as visitantes_unicos,
                SUM(CASE WHEN v.estado = 'activa' THEN 1 ELSE 0 END) as visitas_activas,
                SUM(CASE WHEN v.estado = 'finalizada' THEN 1 ELSE 0 END) as visitas_finalizadas
            FROM trdetvisitas v
            LEFT JOIN trmadepartamentos d ON v.departamento_id = d.id
            WHERE v.fecha_entrada BETWEEN ? AND ?
            AND v.eliminado = 0
            GROUP BY v.departamento_id, d.nombre
            ORDER BY total_visitas DESC
        ";
        
        return Database::fetchAll($sql, [$fechaInicio, $fechaFin]);
    }

    private function getVisitasPorMes(string $fechaInicio, string $fechaFin): array
    {
        $sql = "
            SELECT 
                DATE_FORMAT(fecha_entrada, '%Y-%m') as mes,
                COUNT(*) as total_visitas,
                COUNT(DISTINCT visitante_id) as visitantes_unicos,
                SUM(CASE WHEN estado = 'activa' THEN 1 ELSE 0 END) as visitas_activas,
                SUM(CASE WHEN estado = 'finalizada' THEN 1 ELSE 0 END) as visitas_finalizadas
            FROM trdetvisitas
            WHERE fecha_entrada BETWEEN ? AND ?
            AND eliminado = 0
            GROUP BY DATE_FORMAT(fecha_entrada, '%Y-%m')
            ORDER BY mes ASC
        ";
        
        return Database::fetchAll($sql, [$fechaInicio, $fechaFin]);
    }

    private function getVisitantesMasFrecuentes(string $fechaInicio, string $fechaFin): array
    {
        $sql = "
            SELECT 
                vi.nombre,
                vi.apellido,
                vi.cedula,
                COUNT(v.id) as total_visitas,
                MAX(v.fecha_entrada) as ultima_visita,
                SUM(CASE WHEN v.estado = 'activa' THEN 1 ELSE 0 END) as visitas_activas
            FROM trdetvisitas v
            LEFT JOIN trmavisitantes vi ON v.visitante_id = vi.id
            WHERE v.fecha_entrada BETWEEN ? AND ?
            AND v.eliminado = 0
            GROUP BY v.visitante_id, vi.nombre, vi.apellido, vi.cedula
            ORDER BY total_visitas DESC
            LIMIT 10
        ";
        
        return Database::fetchAll($sql, [$fechaInicio, $fechaFin]);
    }

    private function getDepartamentosMasVisitados(string $fechaInicio, string $fechaFin): array
    {
        $sql = "
            SELECT 
                d.nombre as departamento,
                d.responsable,
                COUNT(v.id) as total_visitas,
                COUNT(DISTINCT v.visitante_id) as visitantes_unicos,
                SUM(CASE WHEN v.estado = 'activa' THEN 1 ELSE 0 END) as visitas_activas
            FROM trdetvisitas v
            LEFT JOIN trmadepartamentos d ON v.departamento_id = d.id
            WHERE v.fecha_entrada BETWEEN ? AND ?
            AND v.eliminado = 0
            GROUP BY v.departamento_id, d.nombre, d.responsable
            ORDER BY total_visitas DESC
            LIMIT 10
        ";
        
        return Database::fetchAll($sql, [$fechaInicio, $fechaFin]);
    }

    private function getVisitasPorMotivo(string $fechaInicio, string $fechaFin): array
    {
        $sql = "
            SELECT 
                motivo_visita,
                COUNT(*) as total_visitas,
                COUNT(DISTINCT visitante_id) as visitantes_unicos,
                SUM(CASE WHEN estado = 'activa' THEN 1 ELSE 0 END) as visitas_activas
            FROM trdetvisitas
            WHERE fecha_entrada BETWEEN ? AND ?
            AND eliminado = 0
            GROUP BY motivo_visita
            ORDER BY total_visitas DESC
        ";
        
        return Database::fetchAll($sql, [$fechaInicio, $fechaFin]);
    }

    private function getTiempoPromedioVisita(string $fechaInicio, string $fechaFin): float
    {
        $sql = "
            SELECT 
                AVG(TIMESTAMPDIFF(MINUTE, fecha_entrada, fecha_salida)) as tiempo_promedio_minutos
            FROM trdetvisitas
            WHERE fecha_entrada BETWEEN ? AND ?
            AND fecha_salida IS NOT NULL
            AND estado = 'finalizada'
            AND eliminado = 0
        ";
        
        $result = Database::fetchOne($sql, [$fechaInicio, $fechaFin]);
        return (float)($result['tiempo_promedio_minutos'] ?? 0.0);
    }

    private function getHorariosPico(string $fechaInicio, string $fechaFin): array
    {
        $sql = "
            SELECT 
                HOUR(fecha_entrada) as hora,
                COUNT(*) as total_visitas,
                SUM(CASE WHEN estado = 'activa' THEN 1 ELSE 0 END) as visitas_activas
            FROM trdetvisitas
            WHERE fecha_entrada BETWEEN ? AND ?
            AND eliminado = 0
            GROUP BY HOUR(fecha_entrada)
            ORDER BY total_visitas DESC
            LIMIT 5
        ";
        
        return Database::fetchAll($sql, [$fechaInicio, $fechaFin]);
    }

    private function getTendenciasMensuales(string $fechaInicio, string $fechaFin): array
    {
        $sql = "
            SELECT 
                DATE_FORMAT(fecha_entrada, '%Y-%m') as mes,
                COUNT(*) as total_visitas,
                COUNT(DISTINCT visitante_id) as visitantes_unicos,
                SUM(CASE WHEN estado = 'activa' THEN 1 ELSE 0 END) as visitas_activas,
                SUM(CASE WHEN estado = 'finalizada' THEN 1 ELSE 0 END) as visitas_finalizadas,
                AVG(CASE WHEN fecha_salida IS NOT NULL AND estado = 'finalizada' 
                    THEN TIMESTAMPDIFF(MINUTE, fecha_entrada, fecha_salida) 
                    ELSE NULL END) as tiempo_promedio_minutos
            FROM trdetvisitas
            WHERE fecha_entrada BETWEEN ? AND ?
            AND eliminado = 0
            GROUP BY DATE_FORMAT(fecha_entrada, '%Y-%m')
            ORDER BY mes ASC
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