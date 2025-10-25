import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CRow,
  CAlert,
  CButton,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CForm,
  CFormInput,
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

const Reportes: React.FC = () => {
  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
        <h1 className="h2 mb-0">Reportes</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <CButton color="primary">
            <CIcon icon="cil-print" className="me-2" />
            Generar Reporte
          </CButton>
        </div>
      </div>

      <CAlert color="success">
        <CIcon icon="cil-check-circle" className="me-2" />
        ¡Página de Reportes funcionando correctamente!
      </CAlert>

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
                placeholder="Seleccionar fecha inicio"
              />
            </CCol>
            <CCol md={3}>
              <CFormInput
                type="date"
                label="Fecha Fin"
                placeholder="Seleccionar fecha fin"
              />
            </CCol>
            <CCol md={3}>
              <CFormSelect label="Departamento">
                <option value="">Todos los departamentos</option>
                <option value="1">Recursos Humanos</option>
                <option value="2">Contabilidad</option>
                <option value="3">Ventas</option>
              </CFormSelect>
            </CCol>
            <CCol md={3}>
              <CFormSelect label="Tipo de Reporte">
                <option value="general">Reporte General</option>
                <option value="por_departamento">Por Departamento</option>
                <option value="por_visitante">Por Visitante</option>
                <option value="estadisticas">Estadísticas</option>
              </CFormSelect>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Estadísticas */}
      <CRow className="mb-4">
        <CCol md={3}>
          <CCard>
            <CCardBody className="text-center">
              <CIcon icon="cil-calendar" size="2xl" className="text-primary mb-2" />
              <h4>150</h4>
              <p className="text-muted mb-0">Visitas Totales</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={3}>
          <CCard>
            <CCardBody className="text-center">
              <CIcon icon="cil-user" size="2xl" className="text-success mb-2" />
              <h4>25</h4>
              <p className="text-muted mb-0">Visitas Activas</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={3}>
          <CCard>
            <CCardBody className="text-center">
              <CIcon icon="cil-building" size="2xl" className="text-info mb-2" />
              <h4>8</h4>
              <p className="text-muted mb-0">Departamentos</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={3}>
          <CCard>
            <CCardBody className="text-center">
              <CIcon icon="cil-chart" size="2xl" className="text-warning mb-2" />
              <h4>12</h4>
              <p className="text-muted mb-0">Visitas Hoy</p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Tabla de reportes */}
      <CCard>
        <CCardHeader>
          <CCardTitle>Reporte de Visitas por Departamento</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CTable responsive striped>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Departamento</CTableHeaderCell>
                <CTableHeaderCell>Total Visitas</CTableHeaderCell>
                <CTableHeaderCell>Visitas Activas</CTableHeaderCell>
                <CTableHeaderCell>Visitas Hoy</CTableHeaderCell>
                <CTableHeaderCell>Promedio Diario</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow>
                <CTableDataCell>Recursos Humanos</CTableDataCell>
                <CTableDataCell>45</CTableDataCell>
                <CTableDataCell>8</CTableDataCell>
                <CTableDataCell>3</CTableDataCell>
                <CTableDataCell>2.1</CTableDataCell>
              </CTableRow>
              <CTableRow>
                <CTableDataCell>Contabilidad</CTableDataCell>
                <CTableDataCell>32</CTableDataCell>
                <CTableDataCell>5</CTableDataCell>
                <CTableDataCell>2</CTableDataCell>
                <CTableDataCell>1.5</CTableDataCell>
              </CTableRow>
              <CTableRow>
                <CTableDataCell>Ventas</CTableDataCell>
                <CTableDataCell>28</CTableDataCell>
                <CTableDataCell>4</CTableDataCell>
                <CTableDataCell>1</CTableDataCell>
                <CTableDataCell>1.3</CTableDataCell>
              </CTableRow>
              <CTableRow>
                <CTableDataCell>Administración</CTableDataCell>
                <CTableDataCell>25</CTableDataCell>
                <CTableDataCell>3</CTableDataCell>
                <CTableDataCell>2</CTableDataCell>
                <CTableDataCell>1.2</CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default Reportes
