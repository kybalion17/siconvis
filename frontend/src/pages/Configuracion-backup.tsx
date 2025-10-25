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
  CFormTextarea,
  CFormSwitch,
  CAlert,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { Configuracion as ConfiguracionType } from '../types'

const Configuracion: React.FC = () => {
  const [showModal, setShowModal] = useState(false)
  const [selectedConfig, setSelectedConfig] = useState<ConfiguracionType | null>(null)
  const [formData, setFormData] = useState({
    clave: '',
    valor: '',
    descripcion: '',
    tipo: 'string',
    activo: true
  })

  const queryClient = useQueryClient()

  // Obtener configuraciones
  const { data: configuracionesData, isLoading, error } = useQuery({
    queryKey: ['configuraciones'],
    queryFn: () => api.getConfiguraciones(),
    retry: 2,
    select: (data) => data.data || []
  })

  // Mutación para crear configuración
  const createConfigMutation = useMutation({
    mutationFn: (data: any) => api.createConfiguracion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuraciones'] })
      setShowModal(false)
      resetForm()
    }
  })

  // Mutación para actualizar configuración
  const updateConfigMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => api.updateConfiguracion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuraciones'] })
      setShowModal(false)
      resetForm()
    }
  })

  // Mutación para eliminar configuración
  const deleteConfigMutation = useMutation({
    mutationFn: (id: number) => api.deleteConfiguracion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuraciones'] })
    }
  })

  const resetForm = () => {
    setFormData({
      clave: '',
      valor: '',
      descripcion: '',
      tipo: 'string',
      activo: true
    })
    setSelectedConfig(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedConfig) {
      updateConfigMutation.mutate({
        id: selectedConfig.id,
        data: formData
      })
    } else {
      createConfigMutation.mutate(formData)
    }
  }

  const handleEdit = (config: ConfiguracionType) => {
    setSelectedConfig(config)
    setFormData({
      clave: config.clave,
      valor: config.valor,
      descripcion: config.descripcion || '',
      tipo: config.tipo,
      activo: config.activo
    })
    setShowModal(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta configuración?')) {
      deleteConfigMutation.mutate(id)
    }
  }

  const getTipoOptions = () => {
    return [
      { value: 'string', label: 'Texto' },
      { value: 'number', label: 'Número' },
      { value: 'boolean', label: 'Booleano' },
      { value: 'json', label: 'JSON' }
    ]
  }

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      'string': 'Texto',
      'number': 'Número',
      'boolean': 'Booleano',
      'json': 'JSON'
    }
    return tipos[tipo as keyof typeof tipos] || tipo
  }

  const formatValue = (valor: string, tipo: string) => {
    switch (tipo) {
      case 'boolean':
        return valor === 'true' ? 'Sí' : 'No'
      case 'number':
        return Number(valor).toLocaleString()
      case 'json':
        try {
          return JSON.stringify(JSON.parse(valor), null, 2)
        } catch {
          return valor
        }
      default:
        return valor
    }
  }

  const renderValueInput = () => {
    switch (formData.tipo) {
      case 'boolean':
        return (
          <CFormSelect
            label="Valor"
            required
            value={formData.valor}
            onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
          >
            <option value="true">Sí</option>
            <option value="false">No</option>
          </CFormSelect>
        )
      case 'number':
        return (
          <CFormInput
            type="number"
            label="Valor"
            required
            value={formData.valor}
            onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
          />
        )
      case 'json':
        return (
          <CFormTextarea
            label="Valor (JSON)"
            rows={4}
            required
            value={formData.valor}
            onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
            placeholder='{"key": "value"}'
          />
        )
      default:
        return (
          <CFormInput
            label="Valor"
            required
            value={formData.valor}
            onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
          />
        )
    }
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <CSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
        <h1 className="h2 mb-0">Configuración del Sistema</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <CButton color="primary" onClick={() => { resetForm(); setShowModal(true) }}>
            <CIcon icon="cil-plus" className="me-2" />
            Nueva Configuración
          </CButton>
        </div>
      </div>

      {/* Información del sistema */}
      <CCard className="mb-4">
        <CCardHeader>
          <CCardTitle>Información del Sistema</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CRow>
            <CCol md={4}>
              <div className="text-center">
                <CIcon icon="cil-building" size="3xl" className="text-primary mb-2" />
                <h5>SICONVIS</h5>
                <p className="text-muted">Sistema de Control de Visitantes</p>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="text-center">
                <CIcon icon="cil-shield" size="3xl" className="text-success mb-2" />
                <h5>Policía Municipal</h5>
                <p className="text-muted">Baruta, Venezuela</p>
              </div>
            </CCol>
            <CCol md={4}>
              <div className="text-center">
                <CIcon icon="cil-calendar" size="3xl" className="text-info mb-2" />
                <h5>Versión 1.0</h5>
                <p className="text-muted">Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
              </div>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Configuraciones */}
      <CCard>
        <CCardHeader>
          <CCardTitle>Configuraciones del Sistema</CCardTitle>
        </CCardHeader>
        <CCardBody>
          {error && (
            <CAlert color="danger">
              Error al cargar las configuraciones: {(error as Error).message}
            </CAlert>
          )}

          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Clave</CTableHeaderCell>
                <CTableHeaderCell>Valor</CTableHeaderCell>
                <CTableHeaderCell>Tipo</CTableHeaderCell>
                <CTableHeaderCell>Descripción</CTableHeaderCell>
                <CTableHeaderCell>Estado</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {configuracionesData?.map((config: ConfiguracionType) => (
                <CTableRow key={config.id}>
                  <CTableDataCell>
                    <strong>{config.clave}</strong>
                  </CTableDataCell>
                  <CTableDataCell>
                    <div style={{ maxWidth: '200px', wordBreak: 'break-word' }}>
                      {formData.tipo === 'json' ? (
                        <pre style={{ fontSize: '0.8rem', margin: 0 }}>
                          {formatValue(config.valor, config.tipo)}
                        </pre>
                      ) : (
                        formatValue(config.valor, config.tipo)
                      )}
                    </div>
                  </CTableDataCell>
                  <CTableDataCell>
                    <span className="badge bg-secondary">
                      {getTipoLabel(config.tipo)}
                    </span>
                  </CTableDataCell>
                  <CTableDataCell>
                    {config.descripcion || '-'}
                  </CTableDataCell>
                  <CTableDataCell>
                    <span className={`badge ${config.activo ? 'bg-success' : 'bg-danger'}`}>
                      {config.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </CTableDataCell>
                  <CTableDataCell>
                    <div className="btn-group" role="group">
                      <CButton
                        color="info"
                        size="sm"
                        onClick={() => handleEdit(config)}
                        title="Editar"
                      >
                        <CIcon icon="cil-pencil" />
                      </CButton>
                      <CButton
                        color="danger"
                        size="sm"
                        onClick={() => handleDelete(config.id)}
                        title="Eliminar"
                      >
                        <CIcon icon="cil-trash" />
                      </CButton>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>

          {!configuracionesData || configuracionesData.length === 0 ? (
            <CAlert color="info">
              <CIcon icon="cil-info" className="me-2" />
              No hay configuraciones registradas. Crea una nueva configuración para comenzar.
            </CAlert>
          ) : null}
        </CCardBody>
      </CCard>

      {/* Configuraciones por defecto */}
      <CCard className="mt-4">
        <CCardHeader>
          <CCardTitle>Configuraciones Sugeridas</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CRow>
            <CCol md={6}>
              <h6>Configuraciones Generales</h6>
              <ul className="list-unstyled">
                <li><CIcon icon="cil-check" className="text-success me-2" />Nombre de la institución</li>
                <li><CIcon icon="cil-check" className="text-success me-2" />Dirección física</li>
                <li><CIcon icon="cil-check" className="text-success me-2" />Teléfono de contacto</li>
                <li><CIcon icon="cil-check" className="text-success me-2" />Email de contacto</li>
                <li><CIcon icon="cil-check" className="text-success me-2" />Horario de atención</li>
              </ul>
            </CCol>
            <CCol md={6}>
              <h6>Configuraciones de Visitas</h6>
              <ul className="list-unstyled">
                <li><CIcon icon="cil-check" className="text-success me-2" />Tiempo máximo de visita (minutos)</li>
                <li><CIcon icon="cil-check" className="text-success me-2" />Motivos de visita predefinidos</li>
                <li><CIcon icon="cil-check" className="text-success me-2" />Notificaciones automáticas</li>
                <li><CIcon icon="cil-check" className="text-success me-2" />Backup automático de datos</li>
                <li><CIcon icon="cil-check" className="text-success me-2" />Límite de visitantes simultáneos</li>
              </ul>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Modal para crear/editar configuración */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>
            {selectedConfig ? 'Editar Configuración' : 'Nueva Configuración'}
          </CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit}>
          <CModalBody>
            <CRow className="g-3">
              <CCol md={6}>
                <CFormInput
                  label="Clave"
                  required
                  value={formData.clave}
                  onChange={(e) => setFormData({ ...formData, clave: e.target.value })}
                  placeholder="ej: nombre_institucion"
                />
              </CCol>
              <CCol md={6}>
                <CFormSelect
                  label="Tipo de Dato"
                  required
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                >
                  {getTipoOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={12}>
                {renderValueInput()}
              </CCol>
              <CCol md={12}>
                <CFormTextarea
                  label="Descripción"
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción de esta configuración..."
                />
              </CCol>
              <CCol md={12}>
                <CFormSwitch
                  label="Configuración Activa"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </CButton>
            <CButton 
              color="primary" 
              type="submit"
              disabled={createConfigMutation.isPending || updateConfigMutation.isPending}
            >
              {createConfigMutation.isPending || updateConfigMutation.isPending ? (
                <CSpinner size="sm" />
              ) : (
                selectedConfig ? 'Actualizar' : 'Crear'
              )}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </div>
  )
}

export default Configuracion
