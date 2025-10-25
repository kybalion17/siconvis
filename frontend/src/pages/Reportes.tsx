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
import { useQuery } from 'react-query'
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

  // Formulario de filtros
  const [filtrosForm, setFiltrosForm] = useState({
    fecha_inicio: null as Date | null,
    fecha_fin: null as Date | null,
    departamento_id: '',
    tipo_reporte: 'general'
  })

  // Cargar datos de reportes (simulado por ahora)
  const { isLoading, isError, refetch } = useQuery(
    'reportes',
    () => {
      // Simular datos de reportes
      return Promise.resolve({
        success: true,
        data: [
          {
            id: 1,
            tipo: 'Visitas por Departamento',
            fecha_inicio: '2024-01-01',
            fecha_fin: '2024-01-31',
            total_registros: 45,
            estado: 'completado',
            created_at: '2024-01-15 10:30:00'
          },
          {
            id: 2,
            tipo: 'Visitantes Más Frecuentes',
            fecha_inicio: '2024-01-01',
            fecha_fin: '2024-01-31',
            total_registros: 23,
            estado: 'completado',
            created_at: '2024-01-15 11:15:00'
          },
          {
            id: 3,
            tipo: 'Reporte General',
            fecha_inicio: '2024-01-01',
            fecha_fin: '2024-01-31',
            total_registros: 156,
            estado: 'procesando',
            created_at: '2024-01-15 12:00:00'
          }
        ]
      })
    },
    {
      onSuccess: (data) => {
        if (data.success) {
          setReportes(data.data)
        }
      },
      retry: 1,
      retryDelay: 1000,
    }
  )

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

    // Simular generación de reporte
    setTimeout(() => {
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Reporte generado correctamente',
      })
      refetch()
    }, 2000)
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

  if (isLoading) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <CSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container-fluid">
        <CAlert color="danger">
          <strong>Error:</strong> No se pudieron cargar los reportes. 
          <CButton color="link" onClick={() => refetch()}>
            Intentar nuevamente
          </CButton>
        </CAlert>
      </div>
    )
  }

  return (
    <div className="container-fluid">
      <Toast ref={toast} />
      
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
        <h1 className="h2 mb-0">Reportes y Estadísticas</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <CButton color="primary" onClick={() => setVisible(true)}>
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
                  <h4 className="mb-0">156</h4>
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
                  <h4 className="mb-0">23</h4>
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
                  <h4 className="mb-0">8</h4>
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
                  <h4 className="mb-0">12</h4>
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
            loading={isLoading}
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
        header="Generar Nuevo Reporte"
        visible={visible}
        style={{ width: '50vw' }}
        onHide={() => setVisible(false)}
        modal
      >
        <div className="p-fluid">
          <div className="field">
            <label htmlFor="tipo_reporte">Tipo de Reporte *</label>
            <Dropdown
              id="tipo_reporte"
              value={filtrosForm.tipo_reporte}
              options={tipoReporteOptions}
              onChange={(e) => setFiltrosForm({ ...filtrosForm, tipo_reporte: e.value })}
              placeholder="Seleccione el tipo de reporte"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="fecha_inicio">Fecha Inicio *</label>
            <Calendar
              id="fecha_inicio"
              value={filtrosForm.fecha_inicio}
              onChange={(e) => setFiltrosForm({ ...filtrosForm, fecha_inicio: e.value as Date })}
              dateFormat="dd/mm/yy"
              placeholder="Seleccione fecha inicio"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="fecha_fin">Fecha Fin *</label>
            <Calendar
              id="fecha_fin"
              value={filtrosForm.fecha_fin}
              onChange={(e) => setFiltrosForm({ ...filtrosForm, fecha_fin: e.value as Date })}
              dateFormat="dd/mm/yy"
              placeholder="Seleccione fecha fin"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="departamento_id">Departamento (Opcional)</label>
            <Dropdown
              id="departamento_id"
              value={filtrosForm.departamento_id}
              options={departamentoOptions}
              onChange={(e) => setFiltrosForm({ ...filtrosForm, departamento_id: e.value })}
              placeholder="Seleccione departamento"
              showClear
            />
          </div>

          <div className="flex justify-content-end gap-2">
            <Button
              type="button"
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => setVisible(false)}
            />
            <Button
              type="button"
              label="Generar Reporte"
              icon="pi pi-chart"
              onClick={() => {
                handleGenerarReporte()
                setVisible(false)
              }}
            />
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default Reportes
