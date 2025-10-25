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
  const [selectedVisita, setSelectedVisita] = useState<VisitaType | null>(null)
  const [formData, setFormData] = useState({
    visitante_id: '',
    departamento_id: '',
    motivo_visita: '',
    observaciones: ''
  })
  const [filters, setFilters] = useState({
    search: '',
    estado: '',
    departamento_id: '',
    fecha_inicio: '',
    fecha_fin: ''
  })
  const [currentPage, setCurrentPage] = useState(1)

  const queryClient = useQueryClient()

  // Obtener visitas con manejo de errores mejorado
  const { data: visitasData, isLoading, error, refetch } = useQuery({
    queryKey: ['visitas', currentPage, filters],
    queryFn: async () => {
      try {
        return await api.getVisitas(currentPage, 10, filters)
      } catch (err) {
        console.error('Error fetching visitas:', err)
        throw err
      }
    },
    retry: 2,
    retryDelay: 1000
  })

  // Obtener visitantes con manejo de errores
  const { data: visitantesData, error: visitantesError } = useQuery({
    queryKey: ['visitantes-options'],
    queryFn: async () => {
      try {
        return await api.getVisitantes(1, 1000)
      } catch (err) {
        console.error('Error fetching visitantes:', err)
        throw err
      }
    },
    retry: 2
  })

  // Obtener departamentos con manejo de errores
  const { data: departamentosData, error: departamentosError } = useQuery({
    queryKey: ['departamentos-options'],
    queryFn: async () => {
      try {
        return await api.getDepartamentosActivos()
      } catch (err) {
        console.error('Error fetching departamentos:', err)
        throw err
      }
    },
    retry: 2
  })

  // Mutación para crear visita
  const createVisitaMutation = useMutation({
    mutationFn: (data: any) => api.createVisita(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitas'] })
      setShowModal(false)
      resetForm()
    },
    onError: (error) => {
      console.error('Error creating visita:', error)
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
    createVisitaMutation.mutate(formData)
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

  // Manejo de estados de carga y error
  if (isLoading) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <CSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-fluid">
        <CAlert color="danger">
          <CIcon icon="cil-warning" className="me-2" />
          Error al cargar las visitas: {error.message}
          <br />
          <CButton color="primary" size="sm" className="mt-2" onClick={() => refetch()}>
            Reintentar
          </CButton>
        </CAlert>
      </div>
    )
  }

  return (
    <div className="container-fluid">
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
                {departamentosData?.data?.map((dept: DepartamentoType) => (
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
              <CButton color="secondary" onClick={() => setFilters({
                search: '',
                estado: '',
                departamento_id: '',
                fecha_inicio: '',
                fecha_fin: ''
              })}>
                Limpiar
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
          {visitasData?.data?.length === 0 ? (
            <CAlert color="info">
              <CIcon icon="cil-info" className="me-2" />
              No hay visitas registradas.
            </CAlert>
          ) : (
            <CTable responsive striped>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Visitante</CTableHeaderCell>
                  <CTableHeaderCell>Departamento</CTableHeaderCell>
                  <CTableHeaderCell>Motivo</CTableHeaderCell>
                  <CTableHeaderCell>Fecha Entrada</CTableHeaderCell>
                  <CTableHeaderCell>Fecha Salida</CTableHeaderCell>
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
                      <small className="text-muted">Cédula: {visita.visitante_cedula}</small>
                    </CTableDataCell>
                    <CTableDataCell>{visita.departamento_nombre}</CTableDataCell>
                    <CTableDataCell>{visita.motivo_visita}</CTableDataCell>
                    <CTableDataCell>{formatDateTime(visita.fecha_entrada)}</CTableDataCell>
                    <CTableDataCell>
                      {visita.fecha_salida ? formatDateTime(visita.fecha_salida) : '-'}
                    </CTableDataCell>
                    <CTableDataCell>{getEstadoBadge(visita.estado)}</CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        color="primary"
                        size="sm"
                        className="me-1"
                        onClick={() => setSelectedVisita(visita)}
                      >
                        <CIcon icon="cil-eye" />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      {/* Modal para nueva visita */}
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
                  {visitantesData?.data?.map((visitante: VisitanteType) => (
                    <option key={visitante.id} value={visitante.id}>
                      {visitante.nombre} {visitante.apellido} - {visitante.cedula}
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
                  {departamentosData?.data?.map((dept: DepartamentoType) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.nombre}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={12}>
                <CFormInput
                  label="Motivo de la visita"
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
              disabled={createVisitaMutation.isPending}
            >
              {createVisitaMutation.isPending ? (
                <>
                  <CSpinner size="sm" className="me-2" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </div>
  )
}

export default Visitas
