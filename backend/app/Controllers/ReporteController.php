<?php

namespace SAGAUT\Controllers;

use SAGAUT\Models\Visita;
use SAGAUT\Models\Visitante;
use SAGAUT\Models\Departamento;
use SAGAUT\Utils\Response;

class ReporteController
{
    private $visitaModel;
    private $visitanteModel;
    private $departamentoModel;

    public function __construct()
    {
        $this->visitaModel = new Visita();
        $this->visitanteModel = new Visitante();
        $this->departamentoModel = new Departamento();
    }

    /**
     * Generar reporte de visitas
     */
    public function generar(): void
    {
        try {
            error_log('🔍 ReporteController::generar iniciado');
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            $fechaInicio = $input['fecha_inicio'] ?? null;
            $fechaFin = $input['fecha_fin'] ?? null;
            $tipoReporte = $input['tipo_reporte'] ?? 'general';
            $departamentoId = $input['departamento_id'] ?? null;

            error_log('🔍 Parámetros: fecha_inicio=' . $fechaInicio . ', fecha_fin=' . $fechaFin . ', tipo=' . $tipoReporte . ', dept=' . $departamentoId);

            if (!$fechaInicio || !$fechaFin) {
                error_log('🔍 Error: Fechas faltantes');
                Response::error('Fechas de inicio y fin son requeridas', 400);
            }

            // Validar formato de fechas
            $fechaInicioObj = \DateTime::createFromFormat('Y-m-d', $fechaInicio);
            $fechaFinObj = \DateTime::createFromFormat('Y-m-d', $fechaFin);
            
            if (!$fechaInicioObj || !$fechaFinObj) {
                error_log('🔍 Error: Formato de fecha inválido');
                Response::error('Formato de fecha inválido. Use YYYY-MM-DD', 400);
            }

            error_log('🔍 Obteniendo datos del reporte...');
            // Obtener datos según el tipo de reporte
            $datos = $this->obtenerDatosReporte($tipoReporte, $fechaInicio, $fechaFin, $departamentoId);
            error_log('🔍 Datos obtenidos: ' . count($datos) . ' registros');
            
            Response::success($datos, 'Reporte generado exitosamente');
        } catch (\Exception $e) {
            error_log('🔍 ERROR en generarReporte: ' . $e->getMessage());
            error_log('🔍 Stack trace: ' . $e->getTraceAsString());
            Response::error('Error al generar reporte: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener datos del reporte según el tipo
     */
    private function obtenerDatosReporte(string $tipoReporte, string $fechaInicio, string $fechaFin, ?int $departamentoId): array
    {
        switch ($tipoReporte) {
            case 'visitas_por_departamento':
                return $this->getVisitasPorDepartamento($fechaInicio, $fechaFin, $departamentoId);
            case 'visitantes_frecuentes':
                return $this->getVisitantesFrecuentes($fechaInicio, $fechaFin);
            case 'visitas_por_fecha':
                return $this->getVisitasPorFecha($fechaInicio, $fechaFin, $departamentoId);
            case 'general':
            default:
                return $this->getReporteGeneral($fechaInicio, $fechaFin, $departamentoId);
        }
    }

    /**
     * Reporte general de visitas
     */
    private function getReporteGeneral(string $fechaInicio, string $fechaFin, ?int $departamentoId): array
    {
        $sql = "
            SELECT 
                v.id,
                vt.nombre as visitante_nombre,
                vt.apellido as visitante_apellido,
                vt.cedula as visitante_cedula,
                vt.telefono_primario as visitante_telefono,
                d.nombre as departamento_nombre,
                v.motivo_visita,
                v.fecha_entrada,
                v.fecha_salida,
                v.estado,
                v.observaciones
            FROM trdetvisitas v
            INNER JOIN trmavisitantes vt ON v.visitante_id = vt.id
            INNER JOIN trmadepartamentos d ON v.departamento_id = d.id
            WHERE DATE(v.fecha_entrada) BETWEEN ? AND ?
            AND v.eliminado = 0
        ";
        
        $params = [$fechaInicio, $fechaFin];
        
        if ($departamentoId) {
            $sql .= " AND v.departamento_id = ?";
            $params[] = $departamentoId;
        }
        
        $sql .= " ORDER BY v.fecha_entrada DESC";
        
        return \SAGAUT\Utils\Database::query($sql, $params)->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Visitas por departamento
     */
    private function getVisitasPorDepartamento(string $fechaInicio, string $fechaFin, ?int $departamentoId): array
    {
        $sql = "
            SELECT 
                d.nombre as departamento,
                COUNT(v.id) as total_visitas,
                SUM(CASE WHEN v.estado = 'activa' THEN 1 ELSE 0 END) as visitas_activas,
                SUM(CASE WHEN v.estado = 'finalizada' THEN 1 ELSE 0 END) as visitas_finalizadas,
                SUM(CASE WHEN v.estado = 'cancelada' THEN 1 ELSE 0 END) as visitas_canceladas
            FROM trdetvisitas v
            INNER JOIN trmadepartamentos d ON v.departamento_id = d.id
            WHERE DATE(v.fecha_entrada) BETWEEN ? AND ?
            AND v.eliminado = 0
        ";
        
        $params = [$fechaInicio, $fechaFin];
        
        if ($departamentoId) {
            $sql .= " AND v.departamento_id = ?";
            $params[] = $departamentoId;
        }
        
        $sql .= " GROUP BY d.id, d.nombre ORDER BY total_visitas DESC";
        
        return \SAGAUT\Utils\Database::query($sql, $params)->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Visitantes más frecuentes
     */
    private function getVisitantesFrecuentes(string $fechaInicio, string $fechaFin): array
    {
        $sql = "
            SELECT 
                vt.nombre,
                vt.apellido,
                vt.cedula,
                COUNT(v.id) as total_visitas,
                MAX(v.fecha_entrada) as ultima_visita
            FROM trdetvisitas v
            INNER JOIN trmavisitantes vt ON v.visitante_id = vt.id
            WHERE DATE(v.fecha_entrada) BETWEEN ? AND ?
            AND v.eliminado = 0
            GROUP BY vt.id, vt.nombre, vt.apellido, vt.cedula
            ORDER BY total_visitas DESC
            LIMIT 50
        ";
        
        return \SAGAUT\Utils\Database::query($sql, [$fechaInicio, $fechaFin])->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Visitas por fecha
     */
    private function getVisitasPorFecha(string $fechaInicio, string $fechaFin, ?int $departamentoId): array
    {
        $sql = "
            SELECT 
                DATE(v.fecha_entrada) as fecha,
                COUNT(v.id) as total_visitas,
                SUM(CASE WHEN v.estado = 'activa' THEN 1 ELSE 0 END) as visitas_activas,
                SUM(CASE WHEN v.estado = 'finalizada' THEN 1 ELSE 0 END) as visitas_finalizadas,
                SUM(CASE WHEN v.estado = 'cancelada' THEN 1 ELSE 0 END) as visitas_canceladas
            FROM trdetvisitas v
            WHERE DATE(v.fecha_entrada) BETWEEN ? AND ?
            AND v.eliminado = 0
        ";
        
        $params = [$fechaInicio, $fechaFin];
        
        if ($departamentoId) {
            $sql .= " AND v.departamento_id = ?";
            $params[] = $departamentoId;
        }
        
        $sql .= " GROUP BY DATE(v.fecha_entrada) ORDER BY fecha DESC";
        
        return \SAGAUT\Utils\Database::query($sql, $params)->fetchAll(\PDO::FETCH_ASSOC);
    }
}
