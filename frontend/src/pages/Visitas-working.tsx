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
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

const Visitas: React.FC = () => {
  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
        <h1 className="h2 mb-0">Registro de Visitas</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <CButton color="primary">
            <CIcon icon="cil-plus" className="me-2" />
            Nueva Visita
          </CButton>
        </div>
      </div>

      <CAlert color="success">
        <CIcon icon="cil-check-circle" className="me-2" />
        ¡Página de Registro de Visitas funcionando correctamente!
      </CAlert>

      <CCard>
        <CCardHeader>
          <CCardTitle>Lista de Visitas</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CTable responsive striped>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Visitante</CTableHeaderCell>
                <CTableHeaderCell>Departamento</CTableHeaderCell>
                <CTableHeaderCell>Motivo</CTableHeaderCell>
                <CTableHeaderCell>Fecha Entrada</CTableHeaderCell>
                <CTableHeaderCell>Estado</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow>
                <CTableDataCell>Juan Pérez</CTableDataCell>
                <CTableDataCell>Recursos Humanos</CTableDataCell>
                <CTableDataCell>Entrevista de trabajo</CTableDataCell>
                <CTableDataCell>2024-01-15 09:00</CTableDataCell>
                <CTableDataCell><CBadge color="success">Activa</CBadge></CTableDataCell>
                <CTableDataCell>
                  <CButton color="primary" size="sm" className="me-1">
                    <CIcon icon="cil-eye" />
                  </CButton>
                  <CButton color="success" size="sm" className="me-1">
                    <CIcon icon="cil-check" />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
              <CTableRow>
                <CTableDataCell>María García</CTableDataCell>
                <CTableDataCell>Contabilidad</CTableDataCell>
                <CTableDataCell>Reunión de trabajo</CTableDataCell>
                <CTableDataCell>2024-01-15 10:30</CTableDataCell>
                <CTableDataCell><CBadge color="primary">Finalizada</CBadge></CTableDataCell>
                <CTableDataCell>
                  <CButton color="primary" size="sm" className="me-1">
                    <CIcon icon="cil-eye" />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default Visitas
