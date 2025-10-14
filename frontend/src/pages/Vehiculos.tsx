import React, { useState, useEffect, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputNumber } from 'primereact/inputnumber'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { Accordion, AccordionTab } from 'primereact/accordion'
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

interface Vehiculo {
  id: number
  placa: string
  clase: number
  marca: number
  modelo: number
  anio: number
  colorp: number
  colors?: number
  transmision: number
  scarroceria?: string
  smotor?: string
  km: number
  peso?: number
  unidadpeso: number
  asientos: number
  combustible: number
  npuestos: number
  observacion?: string
  estado: 'ACTIVO' | 'INACTIVO' | 'MANTENIMIENTO' | 'SINIESTRADO'
  fecha_registro: string
  created_at: string
  updated_at: string
  eliminado: number
  // Campos adicionales con nombres
  clase_nombre?: string
  marca_nombre?: string
  modelo_nombre?: string
  color_principal_nombre?: string
  color_secundario_nombre?: string
  combustible_nombre?: string
  transmision_nombre?: string
}

interface MaestroOption {
  id: number
  nombre: string
}

const Vehiculos: React.FC = () => {
  const toast = useRef<Toast>(null)
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [visible, setVisible] = useState(false)
  const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(null)
  const [filters, setFilters] = useState({
    global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
    placa: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
    scarroceria: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
    smotor: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
    estado: { value: null as string | null, matchMode: FilterMatchMode.EQUALS },
  })

  // Opciones para dropdowns
  const [marcas, setMarcas] = useState<MaestroOption[]>([])
  const [clases, setClases] = useState<MaestroOption[]>([])
  const [modelos, setModelos] = useState<MaestroOption[]>([])
  const [colores, setColores] = useState<MaestroOption[]>([])
  const [transmisiones, setTransmisiones] = useState<MaestroOption[]>([])
  const [combustibles, setCombustibles] = useState<MaestroOption[]>([])
  const [asientos, setAsientos] = useState<MaestroOption[]>([])
  const [unidadesPeso, setUnidadesPeso] = useState<MaestroOption[]>([])

  // Formulario
  const [formData, setFormData] = useState({
    placa: '',
    clase: 0,
    marca: 0,
    modelo: 0,
    anio: new Date().getFullYear(),
    colorp: 0,
    colors: 0,
    transmision: 0,
    scarroceria: '',
    smotor: '',
    km: 0,
    peso: 0,
    unidadpeso: 0,
    asientos: 0,
    combustible: 0,
    npuestos: 0,
    observacion: '',
    estado: 'ACTIVO' as 'ACTIVO' | 'INACTIVO' | 'MANTENIMIENTO' | 'SINIESTRADO',
  })

  // Query client para invalidar queries
  const queryClient = useQueryClient()

  // Cargar datos
  const { isLoading, isError, refetch } = useQuery(
    'vehiculos',
    () => api.getVehiculos(1, 100),
    {
      onSuccess: (data) => {
        console.log('Respuesta de vehículos:', data)
        if (data.success) {
          setVehiculos(data.data)
        } else {
          console.error('Error en respuesta de vehículos:', data.message)
        }
      },
      onError: (error: any) => {
        console.error('Error cargando vehículos:', error)
        console.error('Detalles del error:', error?.response?.data)
      },
      retry: 1,
      retryDelay: 1000,
    }
  )

  // Cargar opciones de maestros
  useEffect(() => {
    const loadOptions = async () => {
      try {
        console.log('Cargando opciones de maestros...')
        console.log('Token de autenticación:', localStorage.getItem('token'))
        
        // Verificar si el usuario está autenticado
        const token = localStorage.getItem('token')
        if (!token) {
          console.error('No hay token de autenticación')
          return
        }
        
        const [
          clasesRes, 
          marcasRes, 
          coloresRes, 
          transmisionesRes, 
          combustiblesRes, 
          asientosRes, 
          unidadesPesoRes
        ] = await Promise.all([
          api.getClases(),
          api.getMarcas(),
          api.getColores(),
          api.getTransmisiones(),
          api.getCombustibles(),
          api.getAsientos(),
          api.getUnidadesPeso(),
        ])

        console.log('Respuestas de API:', {
          clases: clasesRes,
          marcas: marcasRes,
          colores: coloresRes,
          transmisiones: transmisionesRes,
          combustibles: combustiblesRes,
          asientos: asientosRes,
          unidadesPeso: unidadesPesoRes
        })

        if (clasesRes.success) {
          console.log('Clases cargadas:', clasesRes.data)
          setClases(clasesRes.data)
          console.log('Estado clases actualizado:', clasesRes.data)
        } else {
          console.error('Error cargando clases:', clasesRes.message)
        }
        
        if (marcasRes.success) {
          console.log('Marcas cargadas:', marcasRes.data)
          setMarcas(marcasRes.data)
        } else {
          console.error('Error cargando marcas:', marcasRes.message)
        }
        
        if (coloresRes.success) {
          console.log('Colores cargados:', coloresRes.data)
          setColores(coloresRes.data)
        } else {
          console.error('Error cargando colores:', coloresRes.message)
        }
        
        if (transmisionesRes.success) {
          console.log('Transmisiones cargadas:', transmisionesRes.data)
          setTransmisiones(transmisionesRes.data)
        } else {
          console.error('Error cargando transmisiones:', transmisionesRes.message)
        }
        
        if (combustiblesRes.success) {
          console.log('Combustibles cargados:', combustiblesRes.data)
          setCombustibles(combustiblesRes.data)
        } else {
          console.error('Error cargando combustibles:', combustiblesRes.message)
        }
        
        if (asientosRes.success) {
          console.log('Asientos cargados:', asientosRes.data)
          setAsientos(asientosRes.data)
        } else {
          console.error('Error cargando asientos:', asientosRes.message)
        }
        
        if (unidadesPesoRes.success) {
          console.log('Unidades de peso cargadas:', unidadesPesoRes.data)
          setUnidadesPeso(unidadesPesoRes.data)
        } else {
          console.error('Error cargando unidades de peso:', unidadesPesoRes.message)
        }
      } catch (error: any) {
        console.error('Error cargando opciones:', error)
        console.error('Detalles del error:', error?.response?.data)
      }
    }

    loadOptions()
  }, [])

  // Monitorear cambios en los estados de maestros
  useEffect(() => {
    console.log('Estados de maestros actualizados:', {
      clases: clases.length,
      marcas: marcas.length,
      colores: colores.length,
      transmisiones: transmisiones.length,
      combustibles: combustibles.length,
      asientos: asientos.length,
      unidadesPeso: unidadesPeso.length
    })
  }, [clases, marcas, colores, transmisiones, combustibles, asientos, unidadesPeso])

  // Cargar modelos cuando cambia la marca
  useEffect(() => {
    const loadModelos = async () => {
      if (formData.marca > 0) {
        try {
          const modelosRes = await api.getModelos(formData.marca)
          if (modelosRes.success) {
            setModelos(modelosRes.data)
          }
        } catch (error: any) {
          console.error('Error cargando modelos:', error)
        }
      } else {
        setModelos([])
      }
    }

    loadModelos()
  }, [formData.marca])

  // Cargar modelos cuando se abre el modal de edición
  useEffect(() => {
    if (visible && selectedVehiculo && selectedVehiculo.marca > 0) {
      const loadModelosForEdit = async () => {
        try {
          const modelosRes = await api.getModelos(selectedVehiculo.marca)
          if (modelosRes.success) {
            setModelos(modelosRes.data)
          }
        } catch (error: any) {
          console.error('Error cargando modelos para edición:', error)
        }
      }
      loadModelosForEdit()
    }
  }, [visible, selectedVehiculo])

  // Mutaciones
  const createMutation = useMutation((data: any) => api.createVehiculo(data), {
    onSuccess: () => {
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Vehículo creado correctamente',
      })
      queryClient.invalidateQueries('vehiculos')
      setVisible(false)
      resetForm()
    },
    onError: (error: any) => {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al crear vehículo',
      })
    },
  })

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: any }) => api.updateVehiculo(id, data),
    {
      onSuccess: () => {
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Vehículo actualizado correctamente',
        })
        queryClient.invalidateQueries('vehiculos')
        setVisible(false)
        resetForm()
      },
      onError: (error: any) => {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: error.response?.data?.message || 'Error al actualizar vehículo',
        })
      },
    }
  )

  const deleteMutation = useMutation((id: number) => api.deleteVehiculo(id), {
    onSuccess: () => {
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Vehículo eliminado correctamente',
      })
      queryClient.invalidateQueries('vehiculos')
    },
    onError: (error: any) => {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al eliminar vehículo',
      })
    },
  })

  const resetForm = () => {
    setFormData({
      placa: '',
      clase: 0,
      marca: 0,
      modelo: 0,
      anio: new Date().getFullYear(),
      colorp: 0,
      colors: 0,
      transmision: 0,
      scarroceria: '',
      smotor: '',
      km: 0,
      peso: 0,
      unidadpeso: 0,
      asientos: 0,
      combustible: 0,
      npuestos: 0,
      observacion: '',
      estado: 'ACTIVO' as 'ACTIVO' | 'INACTIVO' | 'MANTENIMIENTO' | 'SINIESTRADO',
    })
    setSelectedVehiculo(null)
  }

  const handleCreate = () => {
    resetForm()
    setVisible(true)
  }

  const handleEdit = (vehiculo: Vehiculo) => {
    setSelectedVehiculo(vehiculo)
    
    // Debug log
    console.log('Datos del vehículo para editar:', vehiculo)
    
    const formDataToSet = {
      placa: vehiculo.placa,
      clase: vehiculo.clase,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      anio: vehiculo.anio,
      colorp: vehiculo.colorp,
      colors: vehiculo.colors || 0,
      transmision: vehiculo.transmision,
      scarroceria: vehiculo.scarroceria || '',
      smotor: vehiculo.smotor || '',
      km: vehiculo.km,
      peso: vehiculo.peso || 0,
      unidadpeso: vehiculo.unidadpeso,
      asientos: vehiculo.asientos,
      combustible: vehiculo.combustible,
      npuestos: vehiculo.npuestos,
      observacion: vehiculo.observacion || '',
      estado: vehiculo.estado,
    }
    
    console.log('FormData configurado:', formDataToSet)
    setFormData(formDataToSet)
    setVisible(true)
  }

  const handleDelete = (vehiculo: Vehiculo) => {
    confirmDialog({
      message: (
        <div className="d-flex align-items-start">
          <i className="pi pi-exclamation-triangle me-3" style={{ color: '#dc3545', fontSize: '1.5rem' }}></i>
          <div>
            <p className="mb-2 fw-bold">¿Está seguro de eliminar este vehículo?</p>
            <div className="bg-light p-3 rounded" style={{ border: '1px solid #dee2e6' }}>
              <p className="mb-1"><strong>Placa:</strong> {vehiculo.placa}</p>
              <p className="mb-1"><strong>Marca:</strong> {vehiculo.marca_nombre}</p>
              <p className="mb-1"><strong>Modelo:</strong> {vehiculo.modelo_nombre}</p>
              <p className="mb-0"><strong>Año:</strong> {vehiculo.anio}</p>
            </div>
            <p className="mt-3 mb-0 text-danger fw-semibold">
              ⚠️ Esta acción no se puede deshacer
            </p>
          </div>
        </div>
      ),
      header: (
        <div className="d-flex align-items-center">
          <i className="pi pi-trash me-2"></i>
          <span>Confirmar Eliminación</span>
        </div>
      ),
      icon: null,
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-confirm-dialog-accept',
      rejectClassName: 'p-confirm-dialog-reject',
      accept: () => deleteMutation.mutate(vehiculo.id),
      style: { width: '500px' },
      contentStyle: { padding: '0' }
    })
  }

  const handleSubmit = () => {
    if (selectedVehiculo) {
      updateMutation.mutate({ id: selectedVehiculo.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const estadoBodyTemplate = (rowData: Vehiculo) => {
    const getSeverity = (estado: string) => {
      switch (estado) {
        case 'ACTIVO':
          return 'success'
        case 'MANTENIMIENTO':
          return 'warning'
        case 'SINIESTRADO':
          return 'danger'
        case 'INACTIVO':
          return 'secondary'
        default:
          return 'info'
      }
    }

    const getEstadoLabel = (estado: string) => {
      switch (estado) {
        case 'ACTIVO':
          return 'Activo'
        case 'MANTENIMIENTO':
          return 'Mantenimiento'
        case 'SINIESTRADO':
          return 'Siniestrado'
        case 'INACTIVO':
          return 'Inactivo'
        default:
          return estado
      }
    }

    return <Tag value={getEstadoLabel(rowData.estado)} severity={getSeverity(rowData.estado)} />
  }

  const actionBodyTemplate = (rowData: Vehiculo) => {
    return (
      <div className="d-flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text p-button-sm"
          onClick={() => handleEdit(rowData)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-sm p-button-danger"
          onClick={() => handleDelete(rowData)}
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <CSpinner size="sm" />
        <span className="ms-2">Cargando vehículos...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <CAlert color="danger" className="d-flex align-items-center">
        <strong>Error:</strong> No se pudieron cargar los vehículos
      </CAlert>
    )
  }

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Vehículos</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <CButton color="primary" onClick={handleCreate}>
            <i className="cil-plus me-2"></i>
            Nuevo Vehículo
          </CButton>
        </div>
      </div>

      <CCard>
        <CCardHeader style={{ background: '#001a79', color: 'white' }}>
          <CCardTitle className="mb-0">Lista de Vehículos</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <div className="mb-3">
            <InputText
              value={filters.global.value || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, global: { value: e.target.value, matchMode: FilterMatchMode.CONTAINS } })}
              placeholder="Buscar por placa, serial carrocería, serial motor o estado..."
              className="w-100"
            />
          </div>
          <DataTable
            value={vehiculos}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} vehículos"
            globalFilterFields={['placa', 'scarroceria', 'smotor', 'estado']}
            filters={filters}
            filterDisplay="row"
            emptyMessage="No se encontraron vehículos"
            loading={isLoading}
            className="datatable-responsive vehiculos-table"
          >
            <Column
              field="placa"
              header="Placa"
              sortable
              filter
              filterPlaceholder="Buscar por placa"
              style={{ minWidth: '100px' }}
            />
            <Column
              field="estado"
              header="Estado"
              body={estadoBodyTemplate}
              filter
              filterElement={
                <select
                  value={filters.estado.value || ''}
                  onChange={(e) => {
                    let _filters = { ...filters }
                    _filters['estado'].value = e.target.value === '' ? null : e.target.value
                    setFilters(_filters)
                  }}
                  className="form-select"
                >
                  <option value="">Todos los estados</option>
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                  <option value="MANTENIMIENTO">Mantenimiento</option>
                  <option value="SINIESTRADO">Siniestrado</option>
                </select>
              }
              style={{ minWidth: '120px' }}
            />
            <Column
              field="anio"
              header="Año"
              sortable
              style={{ minWidth: '80px' }}
            />
            <Column
              field="km"
              header="Kilometraje"
              sortable
              style={{ minWidth: '120px' }}
            />
            <Column
              field="scarroceria"
              header="Serial Carrocería"
              sortable
              filter
              filterPlaceholder="Buscar por serial carrocería"
              style={{ minWidth: '150px' }}
            />
            <Column
              field="smotor"
              header="Serial Motor"
              sortable
              filter
              filterPlaceholder="Buscar por serial motor"
              style={{ minWidth: '150px' }}
            />
            <Column
              body={actionBodyTemplate}
              header="Acciones"
              style={{ minWidth: '120px' }}
            />
          </DataTable>
        </CCardBody>
      </CCard>

      <Dialog
        visible={visible}
        style={{ width: '85vw', maxWidth: '1200px', height: '80vh' }}
        header={
          <div className="d-flex align-items-center">
            <i className="cil-car me-2" style={{ color: '#001a79' }}></i>
            <span style={{ color: '#001a79', fontWeight: 'bold' }}>
              {selectedVehiculo ? 'Editar Vehículo' : 'Nuevo Vehículo'}
            </span>
          </div>
        }
        modal
        className="p-fluid"
        onHide={() => setVisible(false)}
        contentStyle={{ height: 'calc(80vh - 120px)', overflow: 'hidden' }}
      >
        <div className="p-4" style={{ height: '100%', overflow: 'auto' }}>
          <Accordion multiple activeIndex={[0, 1, 2]} className="w-100">
          {/* Información Básica */}
          <AccordionTab 
            header={
              <div className="d-flex align-items-center">
                <span>Información Básica</span>
              </div>
            }
            headerStyle={{ 
              backgroundColor: '#001a79', 
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            <div className="grid">
              <div className="col-4 md:col-4">
                <div className="field">
                  <label htmlFor="placa" className="font-semibold block mb-2">
                    Placa *
                  </label>
                  <InputText
                    id="placa"
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                    placeholder="Ej: ABC123"
                    className="w-100"
                    style={{ textAlign: 'left' }}
                    required
                  />
                </div>
              </div>
              <div className="col-4 md:col-4">
                <div className="field">
                  <label htmlFor="anio" className="font-semibold block mb-2">
                    Año *
                  </label>
                  <InputNumber
                    id="anio"
                    value={formData.anio}
                    onValueChange={(e) => setFormData({ ...formData, anio: e.value || 0 })}
                    min={1900}
                    max={new Date().getFullYear() + 1}
                    className="w-100"
                    style={{ textAlign: 'left' }}
                    placeholder="2024"
                  />
                </div>
              </div>
              <div className="col-4 md:col-4">
                <div className="field">
                  <label htmlFor="estado" className="font-semibold block mb-2">
                    Estado *
                  </label>
                  <Dropdown
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.value })}
                    options={[
                      { label: 'Activo', value: 'ACTIVO' },
                      { label: 'Inactivo', value: 'INACTIVO' },
                      { label: 'Mantenimiento', value: 'MANTENIMIENTO' },
                      { label: 'Siniestrado', value: 'SINIESTRADO' }
                    ]}
                    className="w-100"
                    style={{ textAlign: 'left' }}
                  />
                </div>
              </div>
              <div className="col-4 md:col-4">
                <div className="field">
                  <label htmlFor="scarroceria" className="font-semibold block mb-2">
                    Serial Carrocería
                  </label>
                  <InputText
                    id="scarroceria"
                    value={formData.scarroceria}
                    onChange={(e) => setFormData({ ...formData, scarroceria: e.target.value.toUpperCase() })}
                    placeholder="CH001234567890"
                    className="w-100"
                    style={{ textAlign: 'left' }}
                  />
                </div>
              </div>
              <div className="col-4 md:col-4">
                <div className="field">
                  <label htmlFor="smotor" className="font-semibold block mb-2">
                    Serial Motor
                  </label>
                  <InputText
                    id="smotor"
                    value={formData.smotor}
                    onChange={(e) => setFormData({ ...formData, smotor: e.target.value.toUpperCase() })}
                    placeholder="MOT1234567890"
                    className="w-100"
                    style={{ textAlign: 'left' }}
                  />
                </div>
              </div>
            </div>
          </AccordionTab>

          {/* Clasificación del Vehículo */}
          <AccordionTab 
            header={
              <div className="d-flex align-items-center">
              
                <span>Clasificación del Vehículo</span>
              </div>
            }
            headerStyle={{ 
              backgroundColor: '#001a79', 
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            <div className="grid">
              <div className="col-4 md:col-4">
                <div className="field">
                  <label htmlFor="clase" className="font-semibold block mb-2">
                    Clase *
                  </label>
                  <Dropdown
                    id="clase"
                    value={formData.clase}
                    onChange={(e) => setFormData({ ...formData, clase: e.value })}
                    options={[
                      { label: 'Seleccionar clase', value: 0 },
                      ...clases.map(clase => ({ label: clase.nombre, value: clase.id }))
                    ]}
                    className="w-100"
                    style={{ textAlign: 'center' }}
                  />
                </div>
              </div>
              <div className="col-4 md:col-4">
                <div className="field">
                  <label htmlFor="marca" className="font-semibold block mb-2">
                    Marca *
                  </label>
                  <Dropdown
                    id="marca"
                    value={formData.marca}
                    onChange={(e) => {
                      setFormData({ ...formData, marca: e.value, modelo: 0 })
                    }}
                    options={[
                      { label: 'Seleccionar marca', value: 0 },
                      ...marcas.map(marca => ({ label: marca.nombre, value: marca.id }))
                    ]}
                    className="w-100"
                    style={{ textAlign: 'center' }}
                  />
                </div>
              </div>
              <div className="col-4 md:col-4">
                <div className="field">
                  <label htmlFor="modelo" className="font-semibold block mb-2">
                    Modelo *
                  </label>
                  <Dropdown
                    id="modelo"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.value })}
                    options={[
                      { 
                        label: formData.marca === 0 ? 'Seleccione una marca primero' : 'Seleccionar modelo', 
                        value: 0 
                      },
                      ...modelos.map(modelo => ({ label: modelo.nombre, value: modelo.id }))
                    ]}
                    className="w-100"
                    style={{ textAlign: 'center' }}
                    disabled={formData.marca === 0}
                  />
                </div>
              </div>
              
              <div className="col-4 md:col-4">
                <div className="field">
                  <label htmlFor="transmision" className="font-semibold block mb-2">
                    Transmisión *
                  </label>
                  <Dropdown
                    id="transmision"
                    value={formData.transmision}
                    onChange={(e) => setFormData({ ...formData, transmision: e.value })}
                    options={[
                      { label: 'Seleccionar transmisión', value: 0 },
                      ...transmisiones.map(transmision => ({ label: transmision.nombre, value: transmision.id }))
                    ]}
                    className="w-100"
                    style={{ textAlign: 'center' }}
                  />
                </div>
              </div>
            </div>
          </AccordionTab>

          {/* Características Técnicas */}
          <AccordionTab 
            header={
              <div className="d-flex align-items-center">
              
                <span>Características Técnicas</span>
              </div>
            }
            headerStyle={{ 
              backgroundColor: '#001a79', 
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            <div className="grid">
              <div className="col-3 md:col-3">
                <div className="field">
                  <label htmlFor="km" className="font-semibold block mb-2">
                    Kilometraje *
                  </label>
                  <InputNumber
                    id="km"
                    value={formData.km}
                    onValueChange={(e) => setFormData({ ...formData, km: e.value || 0 })}
                    min={0}
                    className="w-100"
                    style={{ textAlign: 'center' }}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="col-4 md:col-3">
                <div className="field">
                  <label htmlFor="peso" className="font-semibold block mb-2">
                    Peso
                  </label>
                  <InputNumber
                    id="peso"
                    value={formData.peso}
                    onValueChange={(e) => setFormData({ ...formData, peso: e.value || 0 })}
                    min={0}
                    className="w-100"
                    style={{ textAlign: 'center' }}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="col-3 md:col-3">
                <div className="field">
                  <label htmlFor="unidadpeso" className="font-semibold block mb-2">
                    Unidad Peso
                  </label>
                  <Dropdown
                    value={formData.unidadpeso}
                    onChange={(e) => setFormData({ ...formData, unidadpeso: e.value })}
                    options={[
                      { label: 'Seleccionar', value: 0 },
                      ...unidadesPeso.map(unidad => ({ label: unidad.nombre, value: unidad.id }))
                    ]}
                    className="w-100"
                    style={{ textAlign: 'center' }}
                  />
                </div>
              </div>
              <div className="col-4 md:col-4">
                <div className="field">
                  <label htmlFor="asientos" className="font-semibold block mb-2">
                    Tipo de Asientos *
                  </label>
                  <Dropdown
                    id="asientos"
                    value={formData.asientos}
                    onChange={(e) => setFormData({ ...formData, asientos: e.value })}
                    options={[
                      { label: 'Seleccionar asientos', value: 0 },
                      ...asientos.map(asiento => ({ label: asiento.nombre, value: asiento.id }))
                    ]}
                    className="w-100"
                    style={{ textAlign: 'center' }}
                  />
                </div>
              </div>
              <div className="col-2 md:col-2">
                <div className="field">
                  <label htmlFor="npuestos" className="font-semibold block mb-2">
                    Número de Puestos
                  </label>
                  <InputNumber
                    id="npuestos"
                    value={formData.npuestos}
                    onValueChange={(e) => setFormData({ ...formData, npuestos: e.value || 0 })}
                    min={0}
                    className="w-100"
                    style={{ textAlign: 'center' }}
                    placeholder="0"
                  />
                </div>
              </div>
              
            </div>
          </AccordionTab>

          {/* Colores y Especificaciones */}
          <AccordionTab 
            header={
              <div className="d-flex align-items-center">
              
                <span>Colores y Especificaciones</span>
              </div>
            }
            headerStyle={{ 
              backgroundColor: '#001a79', 
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            <div className="grid">
            <div className="col-4 md:col-4">
                <div className="field">
                  <label htmlFor="colorp" className="font-semibold block mb-2">
                    Color Principal *
                  </label>
                  <Dropdown
                    id="colorp"
                    value={formData.colorp}
                    onChange={(e) => setFormData({ ...formData, colorp: e.value })}
                    options={[
                      { label: 'Seleccionar color', value: 0 },
                      ...colores.map(color => ({ label: color.nombre, value: color.id }))
                    ]}
                    className="w-100"
                    style={{ textAlign: 'center' }}
                  />
                </div>
              </div>
              <div className="col-4 md:col-4">
                <div className="field">
                  <label htmlFor="colors" className="font-semibold block mb-2">
                    Color Secundario
                  </label>
                  <Dropdown
                    id="colors"
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.value })}
                    options={[
                      { label: 'Sin color secundario', value: 0 },
                      ...colores.map(color => ({ label: color.nombre, value: color.id }))
                    ]}
                    className="w-100"
                    style={{ textAlign: 'center' }}
                  />
                </div>
              </div>
              <div className="col-4 md:col-4">
                <div className="field">
                  <label htmlFor="combustible" className="font-semibold block mb-2">
                    Tipo de Combustible *
                  </label>
                  <Dropdown
                    id="combustible"
                    value={formData.combustible}
                    onChange={(e) => setFormData({ ...formData, combustible: e.value })}
                    options={[
                      { label: 'Seleccionar combustible', value: 0 },
                      ...combustibles.map(combustible => ({ label: combustible.nombre, value: combustible.id }))
                    ]}
                    className="w-100"
                    style={{ textAlign: 'center' }}
                  />
                </div>
              </div>
              
              <div className="col-12 md:col-4">
                <div className="field">
                  <label htmlFor="observacion" className="font-semibold block mb-2">
                    Observaciones
                  </label>
                  <InputText
                    id="observacion"
                    value={formData.observacion}
                    onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
                    placeholder="Observaciones adicionales..."
                    className="w-100"
                    style={{ textAlign: 'center' }}
                  />
                </div>
              </div>
            </div>
          </AccordionTab>

          </Accordion>

          {/* Botones de Acción */}
          <div className="mt-4 pt-3" style={{ borderTop: '2px solid #f0f0f0' }}>
            <div className="grid">
              <div className="col-3 md:col-3 offset-md-3">
                <Button
                  label="Cancelar"
                  icon="pi pi-times"
                  onClick={() => setVisible(false)}
                  className="vehiculos-cancel-btn w-100"
                />
              </div>
              <div className="col-3 md:col-3">
                <Button
                  label={selectedVehiculo ? 'Actualizar Vehículo' : 'Crear Vehículo'}
                  icon="pi pi-check"
                  onClick={handleSubmit}
                  loading={createMutation.isLoading || updateMutation.isLoading}
                  className="vehiculos-save-btn w-100"
                />
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default Vehiculos