import React, { useState, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { InputTextarea } from 'primereact/inputtextarea'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { FilterMatchMode } from 'primereact/api'
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
  CCol,
  CRow,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { Configuracion as ConfiguracionType } from '../types'

interface ConfiguracionForm {
  clave: string
  valor: string
  descripcion: string
  tipo: string
  activo: boolean
}

const Configuracion: React.FC = () => {
  const toast = useRef<Toast>(null)
  const [configuraciones, setConfiguraciones] = useState<ConfiguracionType[]>([])
  const [visible, setVisible] = useState(false)
  const [selectedConfiguracion, setSelectedConfiguracion] = useState<ConfiguracionType | null>(null)
  const [filters, setFilters] = useState({
    global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
    clave: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
    tipo: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
  })

  // Formulario
  const [formData, setFormData] = useState<ConfiguracionForm>({
    clave: '',
    valor: '',
    descripcion: '',
    tipo: 'string',
    activo: true,
  })

  // Query client para invalidar queries
  const queryClient = useQueryClient()

  // Cargar datos (simulado por ahora)
  const { isLoading, isError, refetch } = useQuery(
    'configuraciones',
    () => {
      // Simular datos de configuración
      return Promise.resolve({
        success: true,
        data: [
          {
            id: 1,
            clave: 'empresa_nombre',
            valor: 'SICONVIS',
            descripcion: 'Nombre de la empresa',
            tipo: 'string',
            activo: true,
            created_at: '2024-01-15 10:30:00',
            updated_at: '2024-01-15 10:30:00'
          },
          {
            id: 2,
            clave: 'tiempo_max_visita_minutos',
            valor: '480',
            descripcion: 'Tiempo máximo permitido para una visita en minutos',
            tipo: 'number',
            activo: true,
            created_at: '2024-01-15 10:30:00',
            updated_at: '2024-01-15 10:30:00'
          },
          {
            id: 3,
            clave: 'notificaciones_activas',
            valor: 'true',
            descripcion: 'Habilitar o deshabilitar notificaciones del sistema',
            tipo: 'boolean',
            activo: true,
            created_at: '2024-01-15 10:30:00',
            updated_at: '2024-01-15 10:30:00'
          },
          {
            id: 4,
            clave: 'motivos_visita_predeterminados',
            valor: '["Reunión", "Entrevista", "Entrega", "Mantenimiento", "Otro"]',
            descripcion: 'Lista de motivos de visita predefinidos',
            tipo: 'json',
            activo: true,
            created_at: '2024-01-15 10:30:00',
            updated_at: '2024-01-15 10:30:00'
          },
          {
            id: 5,
            clave: 'configuracion_deshabilitada',
            valor: 'valor_test',
            descripcion: 'Configuración de prueba deshabilitada',
            tipo: 'string',
            activo: false,
            created_at: '2024-01-15 10:30:00',
            updated_at: '2024-01-15 10:30:00'
          }
        ]
      })
    },
    {
      onSuccess: (data) => {
        if (data.success) {
          setConfiguraciones(data.data)
        }
      },
      retry: 1,
      retryDelay: 1000,
    }
  )

  // Mutaciones
  const createMutation = useMutation((data: ConfiguracionForm) => {
    // Simular creación
    return Promise.resolve({ success: true })
  }, {
    onSuccess: () => {
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Configuración creada correctamente',
      })
      queryClient.invalidateQueries('configuraciones')
      setVisible(false)
      resetForm()
    },
    onError: (error: any) => {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al crear configuración',
      })
    },
  })

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: ConfiguracionForm }) => {
      // Simular actualización
      return Promise.resolve({ success: true })
    },
    {
      onSuccess: () => {
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Configuración actualizada correctamente',
        })
        queryClient.invalidateQueries('configuraciones')
        setVisible(false)
        resetForm()
      },
      onError: (error: any) => {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: error.response?.data?.message || 'Error al actualizar configuración',
        })
      },
    }
  )

  const deleteMutation = useMutation((id: number) => {
    // Simular eliminación
    return Promise.resolve({ success: true })
  }, {
    onSuccess: () => {
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Configuración eliminada correctamente',
      })
      queryClient.invalidateQueries('configuraciones')
    },
    onError: (error: any) => {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al eliminar configuración',
      })
    },
  })

  // Funciones auxiliares
  const resetForm = () => {
    setFormData({
      clave: '',
      valor: '',
      descripcion: '',
      tipo: 'string',
      activo: true,
    })
    setSelectedConfiguracion(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.clave.trim() || !formData.valor.trim() || !formData.descripcion.trim()) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor complete todos los campos requeridos',
      })
      return
    }

    if (selectedConfiguracion) {
      updateMutation.mutate({ id: selectedConfiguracion.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (configuracion: ConfiguracionType) => {
    setSelectedConfiguracion(configuracion)
    setFormData({
      clave: configuracion.clave,
      valor: configuracion.valor,
      descripcion: configuracion.descripcion,
      tipo: configuracion.tipo,
      activo: configuracion.activo,
    })
    setVisible(true)
  }

  const handleDelete = (id: number) => {
    confirmDialog({
      message: '¿Está seguro de que desea eliminar esta configuración?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => deleteMutation.mutate(id),
    })
  }

  const handleNew = () => {
    resetForm()
    setVisible(true)
  }

  const handleToggleActivo = (configuracion: ConfiguracionType) => {
    const newData = {
      ...formData,
      activo: !configuracion.activo
    }
    updateMutation.mutate({ id: configuracion.id, data: newData })
  }

  // Templates para las columnas
  const claveTemplate = (rowData: ConfiguracionType) => {
    return (
      <div className="d-flex align-items-center">
        <CIcon 
          icon={rowData.tipo === 'string' ? 'cil-text' : 
                rowData.tipo === 'number' ? 'cil-calculator' :
                rowData.tipo === 'boolean' ? 'cil-check' : 'cil-code'} 
          className="me-2 text-primary" 
        />
        <code className="bg-light px-2 py-1 rounded">{rowData.clave}</code>
      </div>
    )
  }

  const valorTemplate = (rowData: ConfiguracionType) => {
    if (rowData.tipo === 'json') {
      try {
        const parsed = JSON.parse(rowData.valor)
        return (
          <div>
            <code className="bg-light px-2 py-1 rounded">{JSON.stringify(parsed, null, 2)}</code>
          </div>
        )
      } catch {
        return <code className="bg-light px-2 py-1 rounded">{rowData.valor}</code>
      }
    }
    return <code className="bg-light px-2 py-1 rounded">{rowData.valor}</code>
  }

  const tipoTemplate = (rowData: ConfiguracionType) => {
    const color = rowData.tipo === 'string' ? 'primary' : 
                  rowData.tipo === 'number' ? 'success' :
                  rowData.tipo === 'boolean' ? 'warning' : 'info'
    return (
      <CBadge color={color}>
        {rowData.tipo.toUpperCase()}
      </CBadge>
    )
  }

  const activoTemplate = (rowData: ConfiguracionType) => {
    return (
      <CBadge color={rowData.activo ? 'success' : 'secondary'}>
        {rowData.activo ? 'Activo' : 'Inactivo'}
      </CBadge>
    )
  }

  const fechaTemplate = (rowData: ConfiguracionType) => {
    return new Date(rowData.updated_at).toLocaleString('es-ES')
  }

  const accionesTemplate = (rowData: ConfiguracionType) => {
    return (
      <div className="d-flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text p-button-sm"
          onClick={() => handleEdit(rowData)}
          tooltip="Editar"
        />
        <Button
          icon={rowData.activo ? "pi pi-eye-slash" : "pi pi-eye"}
          className={`p-button-rounded p-button-text p-button-sm ${rowData.activo ? 'p-button-warning' : 'p-button-success'}`}
          onClick={() => handleToggleActivo(rowData)}
          tooltip={rowData.activo ? "Desactivar" : "Activar"}
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

  // Opciones para el dropdown de tipo
  const tipoOptions = [
    { label: 'Texto (String)', value: 'string' },
    { label: 'Número (Number)', value: 'number' },
    { label: 'Booleano (Boolean)', value: 'boolean' },
    { label: 'JSON', value: 'json' }
  ]

  if (isLoading) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <CSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container-fluid">
        <CAlert color="danger">
          <strong>Error:</strong> No se pudieron cargar las configuraciones. 
          <CButton color="link" onClick={() => refetch()}>
            Intentar nuevamente
          </CButton>
        </CAlert>
      </div>
    )
  }

  return (
    <div className="container-fluid">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
        <h1 className="h2 mb-0">Configuración del Sistema</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <CButton color="primary" onClick={handleNew}>
            <CIcon icon="cil-plus" className="me-2" />
            Nueva Configuración
          </CButton>
        </div>
      </div>

      {/* Estadísticas */}
      <CRow className="mb-4">
        <CCol md={3}>
          <CCard className="text-white bg-primary">
            <CCardBody className="pb-0">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{configuraciones.length}</h4>
                  <p className="mb-0">Total Configuraciones</p>
                </div>
                <div className="align-self-center">
                  <CIcon icon="cil-settings" size="2xl" />
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={3}>
          <CCard className="text-white bg-success">
            <CCardBody className="pb-0">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{configuraciones.filter(c => c.activo).length}</h4>
                  <p className="mb-0">Configuraciones Activas</p>
                </div>
                <div className="align-self-center">
                  <CIcon icon="cil-check-circle" size="2xl" />
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={3}>
          <CCard className="text-white bg-warning">
            <CCardBody className="pb-0">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{configuraciones.filter(c => !c.activo).length}</h4>
                  <p className="mb-0">Configuraciones Inactivas</p>
                </div>
                <div className="align-self-center">
                  <CIcon icon="cil-x-circle" size="2xl" />
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={3}>
          <CCard className="text-white bg-info">
            <CCardBody className="pb-0">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{new Set(configuraciones.map(c => c.tipo)).size}</h4>
                  <p className="mb-0">Tipos Diferentes</p>
                </div>
                <div className="align-self-center">
                  <CIcon icon="cil-tags" size="2xl" />
                </div>
              </div>
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
          <DataTable
            value={configuraciones}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} configuraciones"
            filters={filters}
            filterDisplay="menu"
            globalFilterFields={['clave', 'descripcion']}
            emptyMessage="No se encontraron configuraciones"
            loading={isLoading}
            responsiveLayout="scroll"
          >
            <Column
              field="clave"
              header="Clave"
              body={claveTemplate}
              filterField="clave"
              sortable
            />
            <Column
              field="valor"
              header="Valor"
              body={valorTemplate}
              sortable
            />
            <Column
              field="descripcion"
              header="Descripción"
              filterField="descripcion"
              sortable
            />
            <Column
              field="tipo"
              header="Tipo"
              body={tipoTemplate}
              filterField="tipo"
              sortable
            />
            <Column
              field="activo"
              header="Estado"
              body={activoTemplate}
              sortable
            />
            <Column
              field="updated_at"
              header="Última Modificación"
              body={fechaTemplate}
              sortable
            />
            <Column
              header="Acciones"
              body={accionesTemplate}
              style={{ width: '150px' }}
            />
          </DataTable>
        </CCardBody>
      </CCard>

      {/* Modal para crear/editar configuración */}
      <Dialog
        header={selectedConfiguracion ? 'Editar Configuración' : 'Nueva Configuración'}
        visible={visible}
        style={{ width: '60vw' }}
        onHide={() => setVisible(false)}
        modal
      >
        <form onSubmit={handleSubmit} className="p-fluid">
          <div className="field">
            <label htmlFor="clave">Clave *</label>
            <InputText
              id="clave"
              value={formData.clave}
              onChange={(e) => setFormData({ ...formData, clave: e.target.value })}
              placeholder="ej: empresa_nombre"
              required
              disabled={!!selectedConfiguracion}
            />
            <small className="text-muted">La clave debe ser única y no puede modificarse</small>
          </div>

          <div className="field">
            <label htmlFor="tipo">Tipo de Dato *</label>
            <Dropdown
              id="tipo"
              value={formData.tipo}
              options={tipoOptions}
              onChange={(e) => setFormData({ ...formData, tipo: e.value })}
              placeholder="Seleccione el tipo de dato"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="valor">Valor *</label>
            {formData.tipo === 'json' ? (
              <InputTextarea
                id="valor"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                placeholder='{"key": "value"}'
                rows={4}
                required
              />
            ) : (
              <InputText
                id="valor"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                placeholder="Ingrese el valor"
                required
              />
            )}
            <small className="text-muted">
              {formData.tipo === 'boolean' ? 'Use "true" o "false"' :
               formData.tipo === 'number' ? 'Solo números' :
               formData.tipo === 'json' ? 'Formato JSON válido' : 'Texto libre'}
            </small>
          </div>

          <div className="field">
            <label htmlFor="descripcion">Descripción *</label>
            <InputTextarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción de la configuración"
              rows={3}
              required
            />
          </div>

          <div className="field-checkbox">
            <div className="flex align-items-center">
              <input
                type="checkbox"
                id="activo"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="me-2"
              />
              <label htmlFor="activo" className="cursor-pointer">
                Configuración activa
              </label>
            </div>
          </div>

          <div className="flex justify-content-end gap-2">
            <Button
              type="button"
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => setVisible(false)}
            />
            <Button
              type="submit"
              label={selectedConfiguracion ? 'Actualizar' : 'Crear'}
              icon={selectedConfiguracion ? 'pi pi-check' : 'pi pi-plus'}
              loading={createMutation.isLoading || updateMutation.isLoading}
            />
          </div>
        </form>
      </Dialog>
    </div>
  )
}

export default Configuracion