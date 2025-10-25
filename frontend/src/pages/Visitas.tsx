import React, { useState, useEffect, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { FilterMatchMode } from 'primereact/api'
import { Tag } from 'primereact/tag'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../services/api'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CButton,
  CAlert,
  CSpinner,
} from '@coreui/react'
import { Visita as VisitaType, Visitante as VisitanteType, Departamento as DepartamentoType } from '../types'

interface VisitaForm {
  visitante_id: number
  departamento_id: number
  motivo_visita: string
}

const Visitas: React.FC = () => {
  const toast = useRef<Toast>(null)
  const [visitas, setVisitas] = useState<VisitaType[]>([])
  const [visitantes, setVisitantes] = useState<VisitanteType[]>([])
  const [departamentos, setDepartamentos] = useState<DepartamentoType[]>([])
  const [visible, setVisible] = useState(false)
  const [selectedVisita, setSelectedVisita] = useState<VisitaType | null>(null)
  const [filters, setFilters] = useState({
    global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
    motivo_visita: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
  })

  // Formulario
  const [formData, setFormData] = useState<VisitaForm>({
    visitante_id: 0,
    departamento_id: 0,
    motivo_visita: '',
  })

  // Query client para invalidar queries
  const queryClient = useQueryClient()

  // Limpiar cache al montar el componente
  useEffect(() => {
    // Limpiar cache específico de visitas al entrar a la página
    queryClient.removeQueries('visitas-page')
    queryClient.removeQueries('visitas-visitantes-dropdown')
    queryClient.removeQueries('visitas-departamentos-dropdown')
  }, [])

  // Cargar datos
  const { isLoading, isError, refetch } = useQuery(
    'visitas-page',
    () => api.getVisitas(1, 100),
    {
      onSuccess: (data) => {
        console.log('Respuesta de visitas:', data)
        if (data.success) {
          setVisitas(data.data)
        } else {
          console.error('Error en respuesta de visitas:', data.message)
        }
      },
      onError: (error: any) => {
        console.error('Error cargando visitas:', error)
        console.error('Detalles del error:', error?.response?.data)
      },
      retry: 1,
      retryDelay: 1000,
      staleTime: 0, // Siempre refetch
      cacheTime: 0, // No cachear
    }
  )

  // Cargar visitantes para el dropdown
  const { data: visitantesData } = useQuery(
    'visitas-visitantes-dropdown',
    () => api.getVisitantes(1, 1000),
    {
      onSuccess: (data) => {
        if (data.success) {
          setVisitantes(data.data)
        }
      },
      staleTime: 0, // Siempre refetch
      cacheTime: 0, // No cachear
    }
  )

  // Cargar departamentos para el dropdown
  const { data: departamentosData } = useQuery(
    'visitas-departamentos-dropdown',
    () => api.getDepartamentosActivos(),
    {
      onSuccess: (data) => {
        if (data.success) {
          setDepartamentos(data.data)
        }
      },
      staleTime: 0, // Siempre refetch
      cacheTime: 0, // No cachear
    }
  )

  // Mutaciones
  const createMutation = useMutation((data: VisitaForm) => api.createVisita(data), {
    onSuccess: () => {
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Visita registrada correctamente',
      })
      queryClient.invalidateQueries('visitas-page')
      setVisible(false)
      resetForm()
    },
    onError: (error: any) => {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al registrar visita',
      })
    },
  })

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: VisitaForm }) => api.updateVisita(id, data),
    {
      onSuccess: () => {
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Visita actualizada correctamente',
        })
        queryClient.invalidateQueries('visitas-page')
        setVisible(false)
        resetForm()
      },
      onError: (error: any) => {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: error.response?.data?.message || 'Error al actualizar visita',
        })
      },
    }
  )

  const deleteMutation = useMutation((id: number) => api.deleteVisita(id), {
    onSuccess: () => {
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Visita eliminada correctamente',
      })
      queryClient.invalidateQueries('visitas-page')
    },
    onError: (error: any) => {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al eliminar visita',
      })
    },
  })

  // Funciones auxiliares
  const resetForm = () => {
    setFormData({
      visitante_id: 0,
      departamento_id: 0,
      motivo_visita: '',
    })
    setSelectedVisita(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.visitante_id || !formData.departamento_id || !formData.motivo_visita.trim()) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor complete todos los campos requeridos',
      })
      return
    }

    if (selectedVisita) {
      updateMutation.mutate({ id: selectedVisita.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (visita: VisitaType) => {
    setSelectedVisita(visita)
    setFormData({
      visitante_id: visita.visitante_id,
      departamento_id: visita.departamento_id,
      motivo_visita: visita.motivo_visita,
    })
    setVisible(true)
  }

  const handleDelete = (id: number) => {
    confirmDialog({
      message: '¿Está seguro de que desea eliminar esta visita?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => deleteMutation.mutate(id),
    })
  }

  const handleNew = () => {
    resetForm()
    setVisible(true)
  }

  // Templates para las columnas
  const visitanteTemplate = (rowData: VisitaType) => {
    // Si los datos de visitantes aún no están cargados, mostrar loading
    if (visitantes.length === 0) {
      return <span className="text-muted">Cargando...</span>
    }
    
    const visitante = visitantes.find(v => v.id === rowData.visitante_id)
    return visitante ? `${visitante.nombre} ${visitante.apellido}` : 'N/A'
  }

  const departamentoTemplate = (rowData: VisitaType) => {
    // Si los datos de departamentos aún no están cargados, mostrar loading
    if (departamentos.length === 0) {
      return <span className="text-muted">Cargando...</span>
    }
    
    const departamento = departamentos.find(d => d.id === rowData.departamento_id)
    return departamento ? departamento.nombre : 'N/A'
  }

  const fechaTemplate = (rowData: VisitaType) => {
    return new Date(rowData.created_at).toLocaleString('es-ES')
  }

  const accionesTemplate = (rowData: VisitaType) => {
    return (
      <div className="d-flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text p-button-sm"
          onClick={() => handleEdit(rowData)}
          tooltip="Editar"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger p-button-sm"
          onClick={() => handleDelete(rowData.id)}
          tooltip="Eliminar"
        />
      </div>
    )
  }

  // Opciones para los dropdowns
  const visitanteOptions = visitantes.map(v => ({
    label: `${v.nombre} ${v.apellido} (${v.cedula})`,
    value: v.id
  }))

  const departamentoOptions = departamentos.map(d => ({
    label: d.nombre,
    value: d.id
  }))

  if (isLoading || visitantes.length === 0 || departamentos.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <CSpinner size="sm" />
        <span className="ms-2">
          {isLoading ? 'Cargando visitas...' : 
           visitantes.length === 0 ? 'Cargando visitantes...' : 
           'Cargando departamentos...'}
        </span>
      </div>
    )
  }

  if (isError) {
    return (
      <CAlert color="danger" className="d-flex align-items-center">
        <strong>Error:</strong> No se pudieron cargar las visitas
      </CAlert>
    )
  }

  return (
    <div className="container-fluid">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Registro de Visitas</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <CButton 
            color="secondary" 
            className="me-2" 
            onClick={() => {
              queryClient.removeQueries('visitas-page')
              queryClient.removeQueries('visitas-visitantes-dropdown')
              queryClient.removeQueries('visitas-departamentos-dropdown')
              refetch()
            }}
          >
            <i className="pi pi-refresh me-2"></i>
            Refrescar
          </CButton>
          <CButton color="primary" onClick={handleNew}>
            <i className="cil-plus me-2"></i>
            Nueva Visita
          </CButton>
        </div>
      </div>

      <CCard>
        <CCardHeader style={{ background: '#001a79', color: 'white' }}>
          <CCardTitle className="mb-0">Lista de Visitas</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <div className="mb-3">
            <InputText
              value={filters.global.value || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, global: { value: e.target.value, matchMode: FilterMatchMode.CONTAINS } })}
              placeholder="Buscar por motivo de visita..."
              className="w-100"
            />
          </div>
          <DataTable
            value={visitas}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} visitas"
            globalFilterFields={['motivo_visita']}
            filters={filters}
            filterDisplay="row"
            emptyMessage="No se encontraron visitas"
            loading={isLoading}
            className="datatable-responsive visitas-table"
          >
                  <Column
                    field="visitante_id"
                    header="Visitante"
                    body={visitanteTemplate}
                    sortable
                    filter
                    filterPlaceholder="Buscar por visitante"
                    style={{ minWidth: '150px' }}
                  />
                  <Column
                    field="departamento_id"
                    header="Departamento"
                    body={departamentoTemplate}
                    sortable
                    filter
                    filterPlaceholder="Buscar por departamento"
                    style={{ minWidth: '150px' }}
                  />
            <Column
              field="motivo_visita"
              header="Motivo"
              sortable
              filter
              filterPlaceholder="Buscar por motivo"
              style={{ minWidth: '200px' }}
            />
            <Column
              field="created_at"
              header="Fecha Registro"
              body={fechaTemplate}
              sortable
              style={{ minWidth: '150px' }}
            />
            <Column
              header="Acciones"
              body={accionesTemplate}
              style={{ minWidth: '180px' }}
            />
          </DataTable>
        </CCardBody>
      </CCard>

      {/* Modal para crear/editar visita */}
      <Dialog
        header={
          <div className="d-flex align-items-center">
            <i className="pi pi-calendar-plus me-2" style={{ color: '#001a79' }}></i>
            <span>
              {selectedVisita ? 'Editar Visita' : 'Nueva Visita'}
            </span>
          </div>
        }
        visible={visible}
        style={{ width: '50vw' }}
        onHide={() => setVisible(false)}
        modal
        className="p-fluid"
      >
        <form onSubmit={handleSubmit}>
          <div className="p-4">
            <div className="grid">
              <div className="col-6 md:col-6">
                <div className="field">
                  <label htmlFor="visitante_id" className="font-semibold block mb-2">
                    Visitante *
                  </label>
                  <Dropdown
                    id="visitante_id"
                    value={formData.visitante_id}
                    options={visitanteOptions}
                    onChange={(e) => setFormData({ ...formData, visitante_id: e.value })}
                    placeholder="Seleccione un visitante"
                    filter
                    filterBy="label"
                    showClear
                    className="w-100"
                    required
                  />
                </div>
              </div>

              <div className="col-6 md:col-6">
                <div className="field">
                  <label htmlFor="departamento_id" className="font-semibold block mb-2">
                    Departamento *
                  </label>
                  <Dropdown
                    id="departamento_id"
                    value={formData.departamento_id}
                    options={departamentoOptions}
                    onChange={(e) => setFormData({ ...formData, departamento_id: e.value })}
                    placeholder="Seleccione un departamento"
                    filter
                    filterBy="label"
                    showClear
                    className="w-100"
                    required
                  />
                </div>
              </div>

              <div className="col-12 md:col-12">
                <div className="field">
                  <label htmlFor="motivo_visita" className="font-semibold block mb-2">
                    Motivo de la Visita *
                  </label>
                  <InputText
                    id="motivo_visita"
                    value={formData.motivo_visita}
                    onChange={(e) => setFormData({ ...formData, motivo_visita: e.target.value })}
                    placeholder="Ingrese el motivo de la visita"
                    className="w-100"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3" style={{ borderTop: '2px solid #f0f0f0' }}>
              <div className="grid">
                <div className="col-3 md:col-3 offset-md-3">
                  <Button
                    type="button"
                    label="Cancelar"
                    icon="pi pi-times"
                    className="p-button-text w-100"
                    onClick={() => setVisible(false)}
                  />
                </div>
                <div className="col-3 md:col-3">
                  <Button
                    type="submit"
                    label={selectedVisita ? 'Actualizar' : 'Crear'}
                    icon={selectedVisita ? 'pi pi-check' : 'pi pi-plus'}
                    className="w-100"
                    loading={createMutation.isLoading || updateMutation.isLoading}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </Dialog>
    </div>
  )
}

export default Visitas
