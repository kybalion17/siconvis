import React, { useState, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { Calendar } from 'primereact/calendar'
import { Toast } from 'primereact/toast'
import { FilterMatchMode } from 'primereact/api'
import { useQuery, useMutation } from 'react-query'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import api from '../services/api'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CButton,
  CAlert,
  CSpinner,
  CCol,
  CRow,
  CForm,
  CFormInput,
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

interface ReporteData {
  id: number
  tipo: string
  fecha_inicio: string
  fecha_fin: string
  departamento_id?: number
  visitante_id?: number
  total_registros: number
  estado: string
  created_at: string
}

const Reportes: React.FC = () => {
  const toast = useRef<Toast>(null)
  const [reportes, setReportes] = useState<ReporteData[]>([])
  const [visible, setVisible] = useState(false)
  const [filters, setFilters] = useState({
    global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
    tipo: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
  })

  // Obtener estadísticas dinámicas usando el endpoint del dashboard
  const { data: estadisticas, isLoading: isLoadingStats } = useQuery(
    'estadisticas-reportes',
    () => api.getDashboardStats(),
    {
      select: (response) => response.data,
      onError: (error: any) => {
        console.error('Error al obtener estadísticas:', error)
      }
    }
  )

  // Formulario de filtros
  const [filtrosForm, setFiltrosForm] = useState({
    fecha_inicio: null as Date | null,
    fecha_fin: null as Date | null,
    departamento_id: '',
    tipo_reporte: 'general'
  })


  // Cargar departamentos para filtros
  const { data: departamentosData } = useQuery(
    'departamentos-reportes',
    () => api.getDepartamentosActivos(),
    {
      onSuccess: (data) => {
        if (data.success) {
          // Los departamentos se cargan para los filtros
        }
      },
    }
  )

  // Mutation para generar reporte
  const generarReporteMutation = useMutation(
    (data: {
      fecha_inicio: string
      fecha_fin: string
      tipo_reporte: string
      departamento_id?: number
    }) => api.generarReporte(data),
    {
      onSuccess: (response) => {
        if (response.success === true) {
          toast.current?.show({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Reporte generado correctamente',
          })
          
          // Crear registro del reporte para el datagrid
          const nuevoReporte: ReporteData = {
            id: Date.now(), // ID temporal
            tipo: getTipoReporteLabel(filtrosForm.tipo_reporte),
            fecha_inicio: filtrosForm.fecha_inicio?.toISOString().split('T')[0] || '',
            fecha_fin: filtrosForm.fecha_fin?.toISOString().split('T')[0] || '',
            departamento_id: filtrosForm.departamento_id || undefined,
            total_registros: response.data.length,
            estado: 'completado',
            created_at: new Date().toISOString()
          }
          
          // Agregar al datagrid
          setReportes(prev => [nuevoReporte, ...prev])
          
          // Exportar automáticamente
          exportarDatos(response.data, filtrosForm.tipo_reporte)
        }
      },
      onError: (error: any) => {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: error.response?.data?.message || 'Error al generar reporte',
        })
      },
    }
  )

  // Función para obtener la etiqueta del tipo de reporte
  const getTipoReporteLabel = (tipo: string): string => {
    const labels: { [key: string]: string } = {
      'general': 'Reporte General',
      'visitas_por_departamento': 'Visitas por Departamento',
      'visitantes_frecuentes': 'Visitantes Más Frecuentes',
      'visitas_por_fecha': 'Visitas por Fecha'
    }
    return labels[tipo] || tipo
  }

  // Funciones auxiliares
  const handleGenerarReporte = () => {
    if (!filtrosForm.fecha_inicio || !filtrosForm.fecha_fin) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor seleccione un rango de fechas',
      })
      return
    }

    toast.current?.show({
      severity: 'info',
      summary: 'Generando Reporte',
      detail: 'El reporte se está generando, por favor espere...',
    })

    // Formatear fechas para el backend
    const fechaInicio = filtrosForm.fecha_inicio.toISOString().split('T')[0]
    const fechaFin = filtrosForm.fecha_fin.toISOString().split('T')[0]

    generarReporteMutation.mutate({
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      tipo_reporte: filtrosForm.tipo_reporte,
      departamento_id: filtrosForm.departamento_id || undefined
    })
  }

  // Función para exportar datos a XLSX
  const exportarDatos = (datos: any[], tipoReporte: string) => {
    if (!datos || datos.length === 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay datos para exportar',
      })
      return
    }

    // Preparar datos para exportación
    const datosExportar = prepararDatosParaExportacion(datos, tipoReporte)
    
    // Crear workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(datosExportar)
    
    // Agregar hoja al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte')
    
    // Generar nombre de archivo
    const fechaActual = new Date().toISOString().split('T')[0]
    const nombreArchivo = `reporte_${tipoReporte}_${fechaActual}.xlsx`
    
    // Exportar archivo
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, nombreArchivo)

    toast.current?.show({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Reporte exportado correctamente',
    })
  }

  // Función para preparar datos según el tipo de reporte
  const prepararDatosParaExportacion = (datos: any[], tipoReporte: string) => {
    switch (tipoReporte) {
      case 'general':
        return datos.map(item => ({
          'ID Visita': item.id,
          'Nombre Visitante': item.visitante_nombre,
          'Apellido Visitante': item.visitante_apellido,
          'Cédula': item.visitante_cedula,
          'Teléfono': item.visitante_telefono,
          'Departamento': item.departamento_nombre,
          'Motivo Visita': item.motivo_visita,
          'Fecha Entrada': item.fecha_entrada,
          'Fecha Salida': item.fecha_salida || 'N/A',
          'Estado': item.estado,
          'Observaciones': item.observaciones || 'N/A'
        }))
      
      case 'visitas_por_departamento':
        return datos.map(item => ({
          'Departamento': item.departamento,
          'Total Visitas': item.total_visitas,
          'Visitas Activas': item.visitas_activas,
          'Visitas Finalizadas': item.visitas_finalizadas,
          'Visitas Canceladas': item.visitas_canceladas
        }))
      
      case 'visitantes_frecuentes':
        return datos.map(item => ({
          'Nombre': item.nombre,
          'Apellido': item.apellido,
          'Cédula': item.cedula,
          'Total Visitas': item.total_visitas,
          'Última Visita': item.ultima_visita
        }))
      
      case 'visitas_por_fecha':
        return datos.map(item => ({
          'Fecha': item.fecha,
          'Total Visitas': item.total_visitas,
          'Visitas Activas': item.visitas_activas,
          'Visitas Finalizadas': item.visitas_finalizadas,
          'Visitas Canceladas': item.visitas_canceladas
        }))
      
      default:
        return datos
    }
  }

  const handleExportar = (reporte: ReporteData) => {
    toast.current?.show({
      severity: 'info',
      summary: 'Exportando',
      detail: `Exportando reporte: ${reporte.tipo}`,
    })
  }

  const handleEliminar = (id: number) => {
    toast.current?.show({
      severity: 'info',
      summary: 'Eliminando',
      detail: 'Reporte eliminado correctamente',
    })
    // Simular eliminación
    setReportes(reportes.filter(r => r.id !== id))
  }

  // Templates para las columnas
  const tipoTemplate = (rowData: ReporteData) => {
    return (
      <div className="d-flex align-items-center">
        <CIcon 
          icon={rowData.tipo.includes('Departamento') ? 'cil-building' : 
                rowData.tipo.includes('Frecuentes') ? 'cil-user' : 'cil-chart'} 
          className="me-2 text-primary" 
        />
        <span>{rowData.tipo}</span>
      </div>
    )
  }

  const fechaTemplate = (rowData: ReporteData) => {
    return `${rowData.fecha_inicio} - ${rowData.fecha_fin}`
  }

  const estadoTemplate = (rowData: ReporteData) => {
    const color = rowData.estado === 'completado' ? 'success' : 
                  rowData.estado === 'procesando' ? 'warning' : 'danger'
    return (
      <span className={`badge bg-${color}`}>
        {rowData.estado === 'completado' ? 'Completado' :
         rowData.estado === 'procesando' ? 'Procesando' : 'Error'}
      </span>
    )
  }

  const fechaCreacionTemplate = (rowData: ReporteData) => {
    return new Date(rowData.created_at).toLocaleString('es-ES')
  }

  const accionesTemplate = (rowData: ReporteData) => {
    return (
      <div className="d-flex gap-2">
        <Button
          icon="pi pi-download"
          className="p-button-rounded p-button-text p-button-sm"
          onClick={() => handleExportar(rowData)}
          tooltip="Exportar"
          disabled={rowData.estado !== 'completado'}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger p-button-sm"
          onClick={() => handleEliminar(rowData.id)}
          tooltip="Eliminar"
        />
      </div>
    )
  }

  // Opciones para el dropdown de tipo de reporte
  const tipoReporteOptions = [
    { label: 'Reporte General', value: 'general' },
    { label: 'Visitas por Departamento', value: 'por_departamento' },
    { label: 'Visitantes Más Frecuentes', value: 'visitantes_frecuentes' },
    { label: 'Estadísticas Mensuales', value: 'estadisticas_mensuales' },
    { label: 'Tendencias de Visitas', value: 'tendencias' }
  ]

  const departamentoOptions = departamentosData?.data?.map((d: any) => ({
    label: d.nombre,
    value: d.id
  })) || []

  // Eliminamos las verificaciones de loading e error ya que no usamos useQuery

  return (
    <div className="container-fluid">
      <Toast ref={toast} />
      
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
        <h1 className="h2 mb-0">Reportes y Estadísticas</h1>
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
                value={filtrosForm.fecha_inicio?.toISOString().split('T')[0] || ''}
                onChange={(e) => setFiltrosForm({ ...filtrosForm, fecha_inicio: e.target.value ? new Date(e.target.value) : null })}
              />
            </CCol>
            <CCol md={3}>
              <CFormInput
                type="date"
                label="Fecha Fin"
                value={filtrosForm.fecha_fin?.toISOString().split('T')[0] || ''}
                onChange={(e) => setFiltrosForm({ ...filtrosForm, fecha_fin: e.target.value ? new Date(e.target.value) : null })}
              />
            </CCol>
            <CCol md={3}>
              <CFormSelect 
                label="Departamento"
                value={filtrosForm.departamento_id}
                onChange={(e) => setFiltrosForm({ ...filtrosForm, departamento_id: e.target.value })}
              >
                <option value="">Todos los departamentos</option>
                {departamentoOptions.map((dept: any) => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={3}>
              <CFormSelect 
                label="Tipo de Reporte"
                value={filtrosForm.tipo_reporte}
                onChange={(e) => setFiltrosForm({ ...filtrosForm, tipo_reporte: e.target.value })}
              >
                {tipoReporteOptions.map((tipo: any) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
          </CRow>
          <div className="mt-3">
            <CButton color="success" onClick={handleGenerarReporte}>
              <CIcon icon="cil-chart" className="me-2" />
              Generar Reporte
            </CButton>
          </div>
        </CCardBody>
      </CCard>

      {/* Estadísticas */}
      <CRow className="mb-4">
        <CCol md={3}>
          <CCard className="text-white bg-primary">
            <CCardBody className="pb-0">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">
                    {isLoadingStats ? (
                      <CSpinner size="sm" />
                    ) : (
                      estadisticas?.total_visitas || 0
                    )}
                  </h4>
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
                  <h4 className="mb-0">
                    {isLoadingStats ? (
                      <CSpinner size="sm" />
                    ) : (
                      estadisticas?.visitas_activas || 0
                    )}
                  </h4>
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
                  <h4 className="mb-0">
                    {isLoadingStats ? (
                      <CSpinner size="sm" />
                    ) : (
                      estadisticas?.departamentos_activos || 0
                    )}
                  </h4>
                  <p className="mb-0">Departamentos</p>
                </div>
                <div className="align-self-center">
                  <CIcon icon="cil-building" size="2xl" />
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
                  <h4 className="mb-0">
                    {isLoadingStats ? (
                      <CSpinner size="sm" />
                    ) : (
                      estadisticas?.visitas_hoy || 0
                    )}
                  </h4>
                  <p className="mb-0">Visitas Hoy</p>
                </div>
                <div className="align-self-center">
                  <CIcon icon="cil-chart" size="2xl" />
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Tabla de reportes */}
      <CCard>
        <CCardHeader>
          <CCardTitle>Reportes Generados</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <DataTable
            value={reportes}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} reportes"
            filters={filters}
            filterDisplay="menu"
            globalFilterFields={['tipo']}
            emptyMessage="No se encontraron reportes"
            loading={generarReporteMutation.isLoading}
            responsiveLayout="scroll"
          >
            <Column
              field="tipo"
              header="Tipo de Reporte"
              body={tipoTemplate}
              filterField="tipo"
              sortable
            />
            <Column
              field="fecha_inicio"
              header="Período"
              body={fechaTemplate}
              sortable
            />
            <Column
              field="total_registros"
              header="Registros"
              sortable
            />
            <Column
              field="estado"
              header="Estado"
              body={estadoTemplate}
              sortable
            />
            <Column
              field="created_at"
              header="Fecha Generación"
              body={fechaCreacionTemplate}
              sortable
            />
            <Column
              header="Acciones"
              body={accionesTemplate}
              style={{ width: '120px' }}
            />
          </DataTable>
        </CCardBody>
      </CCard>

      {/* Modal para generar nuevo reporte */}
      <Dialog
        header={
          <div className="d-flex align-items-center">
            <i className="pi pi-chart-line me-2" style={{ color: '#001a79' }}></i>
            <span>Generar Nuevo Reporte</span>
          </div>
        }
        visible={visible}
        style={{ width: '50vw' }}
        onHide={() => setVisible(false)}
        modal
        className="p-fluid"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleGenerarReporte(); setVisible(false); }}>
          <div className="p-4">
            <div className="grid">
              <div className="col-12 md:col-12">
                <div className="field">
                  <label htmlFor="tipo_reporte" className="font-semibold block mb-2">
                    Tipo de Reporte *
                  </label>
                  <Dropdown
                    id="tipo_reporte"
                    value={filtrosForm.tipo_reporte}
                    options={tipoReporteOptions}
                    onChange={(e) => setFiltrosForm({ ...filtrosForm, tipo_reporte: e.value })}
                    placeholder="Seleccione el tipo de reporte"
                    className="w-100"
                    required
                  />
                </div>
              </div>

              <div className="col-6 md:col-6">
                <div className="field">
                  <label htmlFor="fecha_inicio" className="font-semibold block mb-2">
                    Fecha Inicio *
                  </label>
                  <Calendar
                    id="fecha_inicio"
                    value={filtrosForm.fecha_inicio}
                    onChange={(e) => setFiltrosForm({ ...filtrosForm, fecha_inicio: e.value as Date })}
                    dateFormat="dd/mm/yy"
                    placeholder="Seleccione fecha inicio"
                    className="w-100"
                    required
                  />
                </div>
              </div>

              <div className="col-6 md:col-6">
                <div className="field">
                  <label htmlFor="fecha_fin" className="font-semibold block mb-2">
                    Fecha Fin *
                  </label>
                  <Calendar
                    id="fecha_fin"
                    value={filtrosForm.fecha_fin}
                    onChange={(e) => setFiltrosForm({ ...filtrosForm, fecha_fin: e.value as Date })}
                    dateFormat="dd/mm/yy"
                    placeholder="Seleccione fecha fin"
                    className="w-100"
                    required
                  />
                </div>
              </div>

              <div className="col-12 md:col-12">
                <div className="field">
                  <label htmlFor="departamento_id" className="font-semibold block mb-2">
                    Departamento (Opcional)
                  </label>
                  <Dropdown
                    id="departamento_id"
                    value={filtrosForm.departamento_id}
                    options={departamentoOptions}
                    onChange={(e) => setFiltrosForm({ ...filtrosForm, departamento_id: e.value })}
                    placeholder="Seleccione departamento"
                    showClear
                    className="w-100"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3" style={{ borderTop: '2px solid #f0f0f0' }}>
              <div className="grid">
                <div className="col-3 md:col-3 offset-md-3">
                  <Button
                    type="button"
                    label="Cancelar"
                    icon="pi pi-times"
                    className="p-button-text w-100"
                    onClick={() => setVisible(false)}
                  />
                </div>
                <div className="col-3 md:col-3">
                  <Button
                    type="submit"
                    label="Generar Reporte"
                    icon="pi pi-chart-line"
                    className="w-100"
                    loading={generarReporteMutation.isLoading}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </Dialog>
    </div>
  )
}

export default Reportes
