import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CRow,
  CButton,
  CForm,
  CFormInput,
  CFormSelect,
  CAlert,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { ChartData } from '../types'

const Reportes: React.FC = () => {
  const [filters, setFilters] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    departamento_id: '',
    tipo_reporte: 'general'
  })

  // Obtener estadísticas generales
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['visitas-stats', filters],
    queryFn: () => api.getVisitasStats(filters),
    enabled: !!filters.fecha_inicio && !!filters.fecha_fin
  })

  // Obtener departamentos para filtros
  const { data: departamentosData } = useQuery({
    queryKey: ['departamentos-options'],
    queryFn: () => api.getDepartamentosActivos(),
    select: (data) => data.data || []
  })

  // Obtener reportes de dashboard
  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['dashboard-reports', filters],
    queryFn: () => api.get('/dashboard/reports', { params: filters }),
    enabled: !!filters.fecha_inicio && !!filters.fecha_fin
  })

  const handleFilterChange = (field: string, value: string) => {
    setFilters({ ...filters, [field]: value })
  }

  const handleGenerateReport = () => {
    // Los reportes se generan automáticamente cuando cambian los filtros
    // gracias a las queries de React Query
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES')
  }

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('es-ES')
  }

  const getTipoReporteOptions = () => {
    return [
      { value: 'general', label: 'Reporte General' },
      { value: 'por_departamento', label: 'Por Departamento' },
      { value: 'por_mes', label: 'Por Mes' },
      { value: 'visitantes_frecuentes', label: 'Visitantes Más Frecuentes' },
      { value: 'departamentos_mas_visitados', label: 'Departamentos Más Visitados' },
      { value: 'por_motivo', label: 'Por Motivo de Visita' },
      { value: 'tiempo_promedio', label: 'Tiempo Promedio de Visitas' },
      { value: 'horarios_pico', label: 'Horarios Pico' },
      { value: 'tendencias', label: 'Tendencias Mensuales' }
    ]
  }

  return (
    <div>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
        <h1 className="h2 mb-0">Reportes y Estadísticas</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <CButton color="primary" onClick={handleGenerateReport}>
            <CIcon icon="cil-chart" className="me-2" />
            Generar Reporte
          </CButton>
        </div>
      </div>

      {/* Filtros */}
      <CCard className="mb-4">
        <CCardHeader>
          <CCardTitle>Filtros de Reporte</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CRow className="g-3">
            <CCol md={3}>
              <CFormInput
                type="date"
                label="Fecha Inicio"
                value={filters.fecha_inicio}
                onChange={(e) => handleFilterChange('fecha_inicio', e.target.value)}
                required
              />
            </CCol>
            <CCol md={3}>
              <CFormInput
                type="date"
                label="Fecha Fin"
                value={filters.fecha_fin}
                onChange={(e) => handleFilterChange('fecha_fin', e.target.value)}
                required
              />
            </CCol>
            <CCol md={3}>
              <CFormSelect
                label="Departamento"
                value={filters.departamento_id}
                onChange={(e) => handleFilterChange('departamento_id', e.target.value)}
              >
                <option value="">Todos los departamentos</option>
                {departamentosData?.map((dept: any) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.nombre}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={3}>
              <CFormSelect
                label="Tipo de Reporte"
                value={filters.tipo_reporte}
                onChange={(e) => handleFilterChange('tipo_reporte', e.target.value)}
              >
                {getTipoReporteOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Estadísticas Generales */}
      {statsData && (
        <CRow className="mb-4">
          <CCol md={3}>
            <CCard className="text-white bg-primary">
              <CCardBody className="pb-0">
                <div className="d-flex justify-content-between">
                  <div>
                    <h4 className="mb-0">{statsData.data?.total || 0}</h4>
                    <p className="mb-0">Total Visitas</p>
                  </div>
                  <div className="align-self-center">
                    <CIcon icon="cil-calendar" size="2xl" />
                  </div>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={3}>
            <CCard className="text-white bg-success">
              <CCardBody className="pb-0">
                <div className="d-flex justify-content-between">
                  <div>
                    <h4 className="mb-0">{statsData.data?.activas || 0}</h4>
                    <p className="mb-0">Visitas Activas</p>
                  </div>
                  <div className="align-self-center">
                    <CIcon icon="cil-clock" size="2xl" />
                  </div>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={3}>
            <CCard className="text-white bg-info">
              <CCardBody className="pb-0">
                <div className="d-flex justify-content-between">
                  <div>
                    <h4 className="mb-0">{statsData.data?.finalizadas || 0}</h4>
                    <p className="mb-0">Visitas Finalizadas</p>
                  </div>
                  <div className="align-self-center">
                    <CIcon icon="cil-check" size="2xl" />
                  </div>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={3}>
            <CCard className="text-white bg-warning">
              <CCardBody className="pb-0">
                <div className="d-flex justify-content-between">
                  <div>
                    <h4 className="mb-0">{statsData.data?.canceladas || 0}</h4>
                    <p className="mb-0">Visitas Canceladas</p>
                  </div>
                  <div className="align-self-center">
                    <CIcon icon="cil-x" size="2xl" />
                  </div>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}

      {/* Reportes Específicos */}
      {reportsData && (
        <CRow>
          {/* Reporte por Departamento */}
          {reportsData.data?.visitas_por_departamento && (
            <CCol md={6} className="mb-4">
              <CCard>
                <CCardHeader>
                  <CCardTitle>Visitas por Departamento</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Departamento</CTableHeaderCell>
                        <CTableHeaderCell>Total Visitas</CTableHeaderCell>
                        <CTableHeaderCell>%</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {reportsData.data.visitas_por_departamento.map((item: any, index: number) => (
                        <CTableRow key={index}>
                          <CTableDataCell>{item.departamento}</CTableDataCell>
                          <CTableDataCell>{item.total}</CTableDataCell>
                          <CTableDataCell>{item.porcentaje}%</CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </CCardBody>
              </CCard>
            </CCol>
          )}

          {/* Reporte por Mes */}
          {reportsData.data?.visitas_por_mes && (
            <CCol md={6} className="mb-4">
              <CCard>
                <CCardHeader>
                  <CCardTitle>Visitas por Mes</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Mes</CTableHeaderCell>
                        <CTableHeaderCell>Total Visitas</CTableHeaderCell>
                        <CTableHeaderCell>Tendencia</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {reportsData.data.visitas_por_mes.map((item: any, index: number) => (
                        <CTableRow key={index}>
                          <CTableDataCell>{item.mes}</CTableDataCell>
                          <CTableDataCell>{item.total}</CTableDataCell>
                          <CTableDataCell>
                            <CIcon 
                              icon={item.tendencia === 'up' ? 'cil-arrow-top' : 
                                   item.tendencia === 'down' ? 'cil-arrow-bottom' : 'cil-minus'} 
                              className={item.tendencia === 'up' ? 'text-success' : 
                                        item.tendencia === 'down' ? 'text-danger' : 'text-muted'}
                            />
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </CCardBody>
              </CCard>
            </CCol>
          )}

          {/* Visitantes Más Frecuentes */}
          {reportsData.data?.visitantes_mas_frecuentes && (
            <CCol md={6} className="mb-4">
              <CCard>
                <CCardHeader>
                  <CCardTitle>Visitantes Más Frecuentes</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Visitante</CTableHeaderCell>
                        <CTableHeaderCell>Cédula</CTableHeaderCell>
                        <CTableHeaderCell>Total Visitas</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {reportsData.data.visitantes_mas_frecuentes.map((item: any, index: number) => (
                        <CTableRow key={index}>
                          <CTableDataCell>{item.nombre} {item.apellido}</CTableDataCell>
                          <CTableDataCell>{item.cedula}</CTableDataCell>
                          <CTableDataCell>{item.total_visitas}</CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </CCardBody>
              </CCard>
            </CCol>
          )}

          {/* Departamentos Más Visitados */}
          {reportsData.data?.departamentos_mas_visitados && (
            <CCol md={6} className="mb-4">
              <CCard>
                <CCardHeader>
                  <CCardTitle>Departamentos Más Visitados</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Departamento</CTableHeaderCell>
                        <CTableHeaderCell>Responsable</CTableHeaderCell>
                        <CTableHeaderCell>Total Visitas</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {reportsData.data.departamentos_mas_visitados.map((item: any, index: number) => (
                        <CTableRow key={index}>
                          <CTableDataCell>{item.nombre}</CTableDataCell>
                          <CTableDataCell>{item.responsable}</CTableDataCell>
                          <CTableDataCell>{item.total_visitas}</CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </CCardBody>
              </CCard>
            </CCol>
          )}

          {/* Visitas por Motivo */}
          {reportsData.data?.visitas_por_motivo && (
            <CCol md={6} className="mb-4">
              <CCard>
                <CCardHeader>
                  <CCardTitle>Visitas por Motivo</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Motivo</CTableHeaderCell>
                        <CTableHeaderCell>Total Visitas</CTableHeaderCell>
                        <CTableHeaderCell>%</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {reportsData.data.visitas_por_motivo.map((item: any, index: number) => (
                        <CTableRow key={index}>
                          <CTableDataCell>{item.motivo}</CTableDataCell>
                          <CTableDataCell>{item.total}</CTableDataCell>
                          <CTableDataCell>{item.porcentaje}%</CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </CCardBody>
              </CCard>
            </CCol>
          )}

          {/* Tiempo Promedio de Visitas */}
          {reportsData.data?.tiempo_promedio_visita && (
            <CCol md={6} className="mb-4">
              <CCard>
                <CCardHeader>
                  <CCardTitle>Tiempo Promedio de Visitas</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  <div className="text-center">
                    <h3 className="text-primary">{reportsData.data.tiempo_promedio_visita} minutos</h3>
                    <p className="text-muted">Duración promedio de las visitas</p>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          )}

          {/* Horarios Pico */}
          {reportsData.data?.horarios_pico && (
            <CCol md={12} className="mb-4">
              <CCard>
                <CCardHeader>
                  <CCardTitle>Horarios Pico de Visitas</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Hora</CTableHeaderCell>
                        <CTableHeaderCell>Total Visitas</CTableHeaderCell>
                        <CTableHeaderCell>Promedio por Día</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {reportsData.data.horarios_pico.map((item: any, index: number) => (
                        <CTableRow key={index}>
                          <CTableDataCell>{item.hora}:00</CTableDataCell>
                          <CTableDataCell>{item.total}</CTableDataCell>
                          <CTableDataCell>{item.promedio_diario}</CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </CCardBody>
              </CCard>
            </CCol>
          )}
        </CRow>
      )}

      {/* Mensaje cuando no hay datos */}
      {!filters.fecha_inicio || !filters.fecha_fin ? (
        <CAlert color="info">
          <CIcon icon="cil-info" className="me-2" />
          Selecciona un rango de fechas para generar los reportes.
        </CAlert>
      ) : (statsLoading || reportsLoading) ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <CSpinner size="lg" />
        </div>
      ) : (!statsData && !reportsData) ? (
        <CAlert color="warning">
          <CIcon icon="cil-warning" className="me-2" />
          No se encontraron datos para el rango de fechas seleccionado.
        </CAlert>
      ) : null}
    </div>
  )
}

export default Reportes
