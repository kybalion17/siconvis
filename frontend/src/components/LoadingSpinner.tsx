import React from 'react'
import { CSpinner, CContainer, CRow, CCol } from '@coreui/react'
import CIcon from '@coreui/icons-react'

interface LoadingSpinnerProps {
  message?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Cargando...' 
}) => {
  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: '#f8f9fa',
      }}
    >
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={4} className="text-center">
            <div className="mb-4">
              <CIcon
                icon="cil-car"
                size="3xl"
                style={{ 
                  fontSize: '4rem',
                  color: '#001a79',
                  marginBottom: '1rem'
                }}
              />
            </div>
            <CSpinner 
              color="primary" 
              size="sm" 
              className="mb-3"
              style={{ width: '3rem', height: '3rem' }}
            />
            <h4 className="text-dark mb-0">{message}</h4>
            <p className="text-muted mt-2">
              Sistema de Control de Flota Vehicular
            </p>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default LoadingSpinner