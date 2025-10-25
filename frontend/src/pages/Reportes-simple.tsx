import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CRow,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

const Reportes: React.FC = () => {
  return (
    <div className="container-fluid">
      <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardHeader>
              <CCardTitle className="mb-0">
                <CIcon icon="cil-chart" className="me-2" />
                Reportes
              </CCardTitle>
            </CCardHeader>
            <CCardBody>
              <CAlert color="info">
                <CIcon icon="cil-info" className="me-2" />
                Página de Reportes funcionando correctamente.
                <br />
                Esta es una versión simplificada para verificar que la navegación funciona.
              </CAlert>
              <p>
                Aquí se implementarán los reportes del sistema de control de visitantes,
                incluyendo estadísticas, gráficos y análisis de datos.
              </p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default Reportes
