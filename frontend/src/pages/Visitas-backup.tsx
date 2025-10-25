import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CRow,
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
  CAlert,
  CSpinner,
  CBadge,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { Visita as VisitaType, Visitante as VisitanteType, Departamento as DepartamentoType } from '../types'

const Visitas: React.FC = () => {
  const [showModal, setShowModal] = useState(false)
  const [showFinalizarModal, setShowFinalizarModal] = useState(false)
  const [showCancelarModal, setShowCancelarModal] = useState(false)
  const [selectedVisita, setSelectedVisita] = useState<VisitaType | null>(null)
  const [formData, setFormData] = useState({
    visitante_id: '',
    departamento_id: '',
    motivo_visita: '',
    observaciones: ''
  })
  const [finalizarObservaciones, setFinalizarObservaciones] = useState('')
  const [cancelarObservaciones, setCancelarObservaciones] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    estado: '',
    departamento_id: '',
    fecha_inicio: '',
    fecha_fin: ''
  })
  const [currentPage, setCurrentPage] = useState(1)

  const queryClient = useQueryClient()

  // Obtener visitas
  const { data: visitasData, isLoading, error } = useQuery({
    queryKey: ['visitas', currentPage, filters],
    queryFn: () => api.getVisitas(currentPage, 10, filters),
    keepPreviousData: true
  })

  // Obtener visitantes para el select
  const { data: visitantesData } = useQuery({
    queryKey: ['visitantes-options'],
    queryFn: () => api.getVisitantes(1, 1000), // Obtener todos los visitantes
    select: (data) => data.data || []
  })

  // Obtener departamentos para el select
  const { data: departamentosData } = useQuery({
    queryKey: ['departamentos-options'],
    queryFn: () => api.getDepartamentosActivos(),
    select: (data) => data.data || []
  })

  // Mutación para crear visita
  const createVisitaMutation = useMutation({
    mutationFn: (data: any) => api.createVisita(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitas'] })
      setShowModal(false)
      resetForm()
    }
  })

  // Mutación para actualizar visita
  const updateVisitaMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => api.updateVisita(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitas'] })
      setShowModal(false)
      resetForm()
    }
  })

  // Mutación para finalizar visita
  const finalizarVisitaMutation = useMutation({
    mutationFn: ({ id, observaciones }: { id: number, observaciones: string }) => 
      api.finalizarVisita(id, observaciones),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitas'] })
      setShowFinalizarModal(false)
      setFinalizarObservaciones('')
    }
  })

  // Mutación para cancelar visita
  const cancelarVisitaMutation = useMutation({
    mutationFn: ({ id, observaciones }: { id: number, observaciones: string }) => 
      api.cancelarVisita(id, observaciones),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitas'] })
      setShowCancelarModal(false)
      setCancelarObservaciones('')
    }
  })

  // Mutación para eliminar visita
  const deleteVisitaMutation = useMutation({
    mutationFn: (id: number) => api.deleteVisita(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitas'] })
    }
  })

  const resetForm = () => {
    setFormData({
      visitante_id: '',
      departamento_id: '',
      motivo_visita: '',
      observaciones: ''
    })
    setSelectedVisita(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedVisita) {
      updateVisitaMutation.mutate({
        id: selectedVisita.id,
        data: formData
      })
    } else {
      createVisitaMutation.mutate(formData)
    }
  }

  const handleEdit = (visita: VisitaType) => {
    setSelectedVisita(visita)
    setFormData({
      visitante_id: visita.visitante_id.toString(),
      departamento_id: visita.departamento_id.toString(),
      motivo_visita: visita.motivo_visita,
      observaciones: visita.observaciones || ''
    })
    setShowModal(true)
  }

  const handleFinalizar = (visita: VisitaType) => {
    setSelectedVisita(visita)
    setShowFinalizarModal(true)
  }

  const handleCancelar = (visita: VisitaType) => {
    setSelectedVisita(visita)
    setShowCancelarModal(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta visita?')) {
      deleteVisitaMutation.mutate(id)
    }
  }

  const getEstadoBadge = (estado: string) => {
    const badges = {
      'activa': { color: 'success', text: 'Activa' },
      'finalizada': { color: 'primary', text: 'Finalizada' },
      'cancelada': { color: 'danger', text: 'Cancelada' }
    }
    
    const badge = badges[estado as keyof typeof badges] || { color: 'secondary', text: estado }
    return <CBadge color={badge.color}>{badge.text}</CBadge>
  }

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('es-ES')
  }

  const calcularDuracion = (fechaEntrada: string, fechaSalida?: string) => {
    if (!fechaSalida) return 'En curso'
    
    const entrada = new Date(fechaEntrada)
    const salida = new Date(fechaSalida)
    const diffMs = salida.getTime() - entrada.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 60) {
      return `${diffMins} min`
    } else {
      const hours = Math.floor(diffMins / 60)
      const mins = diffMins % 60
      return `${hours}h ${mins}min`
    }
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <CSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-fluid">
        <CAlert color="danger">
          <CIcon icon="cil-warning" className="me-2" />
          Error al cargar las visitas: {error.message}
        </CAlert>
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
        <h1 className="h2 mb-0">Registro de Visitas</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <CButton color="primary" onClick={() => { resetForm(); setShowModal(true) }}>
            <CIcon icon="cil-plus" className="me-2" />
            Nueva Visita
          </CButton>
        </div>
      </div>

      {/* Filtros */}
      <CCard className="mb-4">
        <CCardHeader>
          <CCardTitle>Filtros</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CRow className="g-3">
            <CCol md={3}>
              <CFormInput
                placeholder="Buscar..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </CCol>
            <CCol md={2}>
              <CFormSelect
                value={filters.estado}
                onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
              >
                <option value="">Todos los estados</option>
                <option value="activa">Activa</option>
                <option value="finalizada">Finalizada</option>
                <option value="cancelada">Cancelada</option>
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CFormSelect
                value={filters.departamento_id}
                onChange={(e) => setFilters({ ...filters, departamento_id: e.target.value })}
              >
                <option value="">Todos los departamentos</option>
                {departamentosData?.map((dept: DepartamentoType) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.nombre}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CFormInput
                type="date"
                placeholder="Fecha inicio"
                value={filters.fecha_inicio}
                onChange={(e) => setFilters({ ...filters, fecha_inicio: e.target.value })}
              />
            </CCol>
            <CCol md={2}>
              <CFormInput
                type="date"
                placeholder="Fecha fin"
                value={filters.fecha_fin}
                onChange={(e) => setFilters({ ...filters, fecha_fin: e.target.value })}
              />
            </CCol>
            <CCol md={1}>
              <CButton 
                color="secondary" 
                variant="outline"
                onClick={() => setFilters({
                  search: '',
                  estado: '',
                  departamento_id: '',
                  fecha_inicio: '',
                  fecha_fin: ''
                })}
              >
                <CIcon icon="cil-x" />
              </CButton>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Tabla de visitas */}
      <CCard>
        <CCardHeader>
          <CCardTitle>Lista de Visitas</CCardTitle>
        </CCardHeader>
        <CCardBody>
          {error && (
            <CAlert color="danger">
              Error al cargar las visitas: {(error as Error).message}
            </CAlert>
          )}

          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Visitante</CTableHeaderCell>
                <CTableHeaderCell>Departamento</CTableHeaderCell>
                <CTableHeaderCell>Motivo</CTableHeaderCell>
                <CTableHeaderCell>Fecha Entrada</CTableHeaderCell>
                <CTableHeaderCell>Fecha Salida</CTableHeaderCell>
                <CTableHeaderCell>Duración</CTableHeaderCell>
                <CTableHeaderCell>Estado</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {visitasData?.data?.map((visita: VisitaType) => (
                <CTableRow key={visita.id}>
                  <CTableDataCell>
                    {visita.visitante_nombre} {visita.visitante_apellido}
                    <br />
                    <small className="text-muted">C.I. {visita.visitante_cedula}</small>
                  </CTableDataCell>
                  <CTableDataCell>
                    {visita.departamento_nombre}
                    <br />
                    <small className="text-muted">{visita.departamento_responsable}</small>
                  </CTableDataCell>
                  <CTableDataCell>{visita.motivo_visita}</CTableDataCell>
                  <CTableDataCell>{formatDateTime(visita.fecha_entrada)}</CTableDataCell>
                  <CTableDataCell>
                    {visita.fecha_salida ? formatDateTime(visita.fecha_salida) : '-'}
                  </CTableDataCell>
                  <CTableDataCell>
                    {calcularDuracion(visita.fecha_entrada, visita.fecha_salida)}
                  </CTableDataCell>
                  <CTableDataCell>{getEstadoBadge(visita.estado)}</CTableDataCell>
                  <CTableDataCell>
                    <div className="btn-group" role="group">
                      <CButton
                        color="info"
                        size="sm"
                        onClick={() => handleEdit(visita)}
                        title="Editar"
                      >
                        <CIcon icon="cil-pencil" />
                      </CButton>
                      {visita.estado === 'activa' && (
                        <>
                          <CButton
                            color="success"
                            size="sm"
                            onClick={() => handleFinalizar(visita)}
                            title="Finalizar"
                          >
                            <CIcon icon="cil-check" />
                          </CButton>
                          <CButton
                            color="warning"
                            size="sm"
                            onClick={() => handleCancelar(visita)}
                            title="Cancelar"
                          >
                            <CIcon icon="cil-x" />
                          </CButton>
                        </>
                      )}
                      <CButton
                        color="danger"
                        size="sm"
                        onClick={() => handleDelete(visita.id)}
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

          {/* Paginación */}
          {visitasData?.pagination && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>
                Mostrando {((visitasData.pagination.current_page - 1) * visitasData.pagination.per_page) + 1} a{' '}
                {Math.min(visitasData.pagination.current_page * visitasData.pagination.per_page, visitasData.pagination.total)} de{' '}
                {visitasData.pagination.total} registros
              </div>
              <div>
                <CButton
                  color="secondary"
                  size="sm"
                  disabled={!visitasData.pagination.has_prev}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Anterior
                </CButton>
                <span className="mx-2">
                  Página {visitasData.pagination.current_page} de {visitasData.pagination.total_pages}
                </span>
                <CButton
                  color="secondary"
                  size="sm"
                  disabled={!visitasData.pagination.has_next}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Siguiente
                </CButton>
              </div>
            </div>
          )}
        </CCardBody>
      </CCard>

      {/* Modal para crear/editar visita */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>
            {selectedVisita ? 'Editar Visita' : 'Nueva Visita'}
          </CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit}>
          <CModalBody>
            <CRow className="g-3">
              <CCol md={6}>
                <CFormSelect
                  label="Visitante"
                  required
                  value={formData.visitante_id}
                  onChange={(e) => setFormData({ ...formData, visitante_id: e.target.value })}
                >
                  <option value="">Seleccionar visitante</option>
                  {visitantesData?.map((visitante: VisitanteType) => (
                    <option key={visitante.id} value={visitante.id}>
                      {visitante.nombre} {visitante.apellido} - C.I. {visitante.cedula}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormSelect
                  label="Departamento"
                  required
                  value={formData.departamento_id}
                  onChange={(e) => setFormData({ ...formData, departamento_id: e.target.value })}
                >
                  <option value="">Seleccionar departamento</option>
                  {departamentosData?.map((departamento: DepartamentoType) => (
                    <option key={departamento.id} value={departamento.id}>
                      {departamento.nombre}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={12}>
                <CFormInput
                  label="Motivo de la Visita"
                  required
                  value={formData.motivo_visita}
                  onChange={(e) => setFormData({ ...formData, motivo_visita: e.target.value })}
                />
              </CCol>
              <CCol md={12}>
                <CFormTextarea
                  label="Observaciones"
                  rows={3}
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
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
              disabled={createVisitaMutation.isPending || updateVisitaMutation.isPending}
            >
              {createVisitaMutation.isPending || updateVisitaMutation.isPending ? (
                <CSpinner size="sm" />
              ) : (
                selectedVisita ? 'Actualizar' : 'Registrar'
              )}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* Modal para finalizar visita */}
      <CModal visible={showFinalizarModal} onClose={() => setShowFinalizarModal(false)}>
        <CModalHeader>
          <CModalTitle>Finalizar Visita</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>¿Estás seguro de que quieres finalizar esta visita?</p>
          <CFormTextarea
            label="Observaciones de salida"
            rows={3}
            value={finalizarObservaciones}
            onChange={(e) => setFinalizarObservaciones(e.target.value)}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowFinalizarModal(false)}>
            Cancelar
          </CButton>
          <CButton 
            color="success" 
            onClick={() => {
              if (selectedVisita) {
                finalizarVisitaMutation.mutate({
                  id: selectedVisita.id,
                  observaciones: finalizarObservaciones
                })
              }
            }}
            disabled={finalizarVisitaMutation.isPending}
          >
            {finalizarVisitaMutation.isPending ? <CSpinner size="sm" /> : 'Finalizar'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal para cancelar visita */}
      <CModal visible={showCancelarModal} onClose={() => setShowCancelarModal(false)}>
        <CModalHeader>
          <CModalTitle>Cancelar Visita</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>¿Estás seguro de que quieres cancelar esta visita?</p>
          <CFormTextarea
            label="Motivo de cancelación"
            rows={3}
            value={cancelarObservaciones}
            onChange={(e) => setCancelarObservaciones(e.target.value)}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowCancelarModal(false)}>
            Cancelar
          </CButton>
          <CButton 
            color="warning" 
            onClick={() => {
              if (selectedVisita) {
                cancelarVisitaMutation.mutate({
                  id: selectedVisita.id,
                  observaciones: cancelarObservaciones
                })
              }
            }}
            disabled={cancelarVisitaMutation.isPending}
          >
            {cancelarVisitaMutation.isPending ? <CSpinner size="sm" /> : 'Cancelar'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default Visitas
