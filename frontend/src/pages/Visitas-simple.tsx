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

const Visitas: React.FC = () => {
  return (
    <div className="container-fluid">
      <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardHeader>
              <CCardTitle className="mb-0">
                <CIcon icon="cil-calendar" className="me-2" />
                Registro de Visitas
              </CCardTitle>
            </CCardHeader>
            <CCardBody>
              <CAlert color="info">
                <CIcon icon="cil-info" className="me-2" />
                Página de Registro de Visitas funcionando correctamente.
                <br />
                Esta es una versión simplificada para verificar que la navegación funciona.
              </CAlert>
              <p>
                Aquí se implementará el sistema completo de registro de visitas,
                incluyendo la asociación de visitantes con departamentos.
              </p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default Visitas
