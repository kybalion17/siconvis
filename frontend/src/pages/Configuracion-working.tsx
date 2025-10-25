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
  CFormTextarea,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

const Configuracion: React.FC = () => {
  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
        <h1 className="h2 mb-0">Configuración del Sistema</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <CButton color="primary">
            <CIcon icon="cil-plus" className="me-2" />
            Nueva Configuración
          </CButton>
        </div>
      </div>

      <CAlert color="success">
        <CIcon icon="cil-check-circle" className="me-2" />
        ¡Página de Configuración funcionando correctamente!
      </CAlert>

      {/* Configuraciones del Sistema */}
      <CRow className="mb-4">
        <CCol md={6}>
          <CCard>
            <CCardHeader>
              <CCardTitle>Configuración General</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <CForm>
                <div className="mb-3">
                  <CFormInput
                    label="Nombre de la Empresa"
                    defaultValue="SICONVIS"
                    placeholder="Ingrese el nombre de la empresa"
                  />
                </div>
                <div className="mb-3">
                  <CFormInput
                    label="Dirección"
                    defaultValue="Av. Principal 123"
                    placeholder="Ingrese la dirección"
                  />
                </div>
                <div className="mb-3">
                  <CFormInput
                    label="Teléfono"
                    defaultValue="+58 212 123-4567"
                    placeholder="Ingrese el teléfono"
                  />
                </div>
                <div className="mb-3">
                  <CFormInput
                    label="Email"
                    defaultValue="info@siconvis.com"
                    placeholder="Ingrese el email"
                  />
                </div>
                <CButton color="success" type="submit">
                  <CIcon icon="cil-save" className="me-2" />
                  Guardar Configuración
                </CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={6}>
          <CCard>
            <CCardHeader>
              <CCardTitle>Configuración de Visitas</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <CForm>
                <div className="mb-3">
                  <CFormInput
                    type="number"
                    label="Tiempo Máximo de Visita (minutos)"
                    defaultValue="480"
                    placeholder="Tiempo máximo en minutos"
                  />
                </div>
                <div className="mb-3">
                  <CFormSelect label="Notificaciones">
                    <option value="1">Activar todas las notificaciones</option>
                    <option value="2">Solo notificaciones importantes</option>
                    <option value="3">Desactivar notificaciones</option>
                  </CFormSelect>
                </div>
                <div className="mb-3">
                  <CFormSelect label="Auto-finalizar visitas">
                    <option value="1">Sí, después del tiempo máximo</option>
                    <option value="0">No, manualmente</option>
                  </CFormSelect>
                </div>
                <div className="mb-3">
                  <CFormTextarea
                    label="Mensaje de Bienvenida"
                    rows={3}
                    defaultValue="Bienvenido a nuestras instalaciones. Por favor, registre su visita en el sistema."
                    placeholder="Mensaje que se mostrará a los visitantes"
                  />
                </div>
                <CButton color="success" type="submit">
                  <CIcon icon="cil-save" className="me-2" />
                  Guardar Configuración
                </CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Tabla de configuraciones */}
      <CCard>
        <CCardHeader>
          <CCardTitle>Configuraciones del Sistema</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CTable responsive striped>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Clave</CTableHeaderCell>
                <CTableHeaderCell>Valor</CTableHeaderCell>
                <CTableHeaderCell>Descripción</CTableHeaderCell>
                <CTableHeaderCell>Tipo</CTableHeaderCell>
                <CTableHeaderCell>Estado</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow>
                <CTableDataCell>app_name</CTableDataCell>
                <CTableDataCell>SICONVIS</CTableDataCell>
                <CTableDataCell>Nombre de la aplicación</CTableDataCell>
                <CTableDataCell><CBadge color="info">string</CBadge></CTableDataCell>
                <CTableDataCell><CBadge color="success">Activo</CBadge></CTableDataCell>
                <CTableDataCell>
                  <CButton color="primary" size="sm" className="me-1">
                    <CIcon icon="cil-pencil" />
                  </CButton>
                  <CButton color="danger" size="sm">
                    <CIcon icon="cil-trash" />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
              <CTableRow>
                <CTableDataCell>max_visit_time</CTableDataCell>
                <CTableDataCell>480</CTableDataCell>
                <CTableDataCell>Tiempo máximo de visita en minutos</CTableDataCell>
                <CTableDataCell><CBadge color="warning">number</CBadge></CTableDataCell>
                <CTableDataCell><CBadge color="success">Activo</CBadge></CTableDataCell>
                <CTableDataCell>
                  <CButton color="primary" size="sm" className="me-1">
                    <CIcon icon="cil-pencil" />
                  </CButton>
                  <CButton color="danger" size="sm">
                    <CIcon icon="cil-trash" />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
              <CTableRow>
                <CTableDataCell>notifications_enabled</CTableDataCell>
                <CTableDataCell>true</CTableDataCell>
                <CTableDataCell>Habilitar notificaciones</CTableDataCell>
                <CTableDataCell><CBadge color="success">boolean</CBadge></CTableDataCell>
                <CTableDataCell><CBadge color="success">Activo</CBadge></CTableDataCell>
                <CTableDataCell>
                  <CButton color="primary" size="sm" className="me-1">
                    <CIcon icon="cil-pencil" />
                  </CButton>
                  <CButton color="danger" size="sm">
                    <CIcon icon="cil-trash" />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
              <CTableRow>
                <CTableDataCell>welcome_message</CTableDataCell>
                <CTableDataCell>Bienvenido a nuestras instalaciones...</CTableDataCell>
                <CTableDataCell>Mensaje de bienvenida para visitantes</CTableDataCell>
                <CTableDataCell><CBadge color="info">string</CBadge></CTableDataCell>
                <CTableDataCell><CBadge color="success">Activo</CBadge></CTableDataCell>
                <CTableDataCell>
                  <CButton color="primary" size="sm" className="me-1">
                    <CIcon icon="cil-pencil" />
                  </CButton>
                  <CButton color="danger" size="sm">
                    <CIcon icon="cil-trash" />
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

export default Configuracion
