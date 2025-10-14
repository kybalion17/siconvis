import React, { useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { Dialog } from 'primereact/dialog'
import { Toast } from 'primereact/toast'
import { ConfirmDialog } from 'primereact/confirmdialog'
import { FilterMatchMode } from 'primereact/api'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { CCard, CCardHeader, CCardTitle, CCardBody, CContainer, CRow, CCol } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import api from '../services/api'

interface MaestroItem {
  id: number
  nombre: string
  [key: string]: any
}

const Maestros: React.FC = () => {
  const queryClient = useQueryClient()
  const [selectedTable, setSelectedTable] = useState('trmaclase')
  const [visible, setVisible] = useState(false)
  const [visibleConfirmDialog, setVisibleConfirmDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MaestroItem | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  })

  const tableOptions = [
    { label: 'Clases de Vehículos', value: 'trmaclase' },
    { label: 'Marcas', value: 'trmamarca' },
    { label: 'Colores', value: 'trmacolor' },
    { label: 'Combustibles', value: 'trmacombustible' },
    { label: 'Transmisiones', value: 'trmatransmision' },
    { label: 'Tipos de Asientos', value: 'trmaasientos' },
    { label: 'Unidades de Peso', value: 'trmaunidad_peso' },
    { label: 'Organismos', value: 'trmaorganismos' },
    { label: 'Talleres', value: 'trmatalleres' },
    { label: 'Aseguradoras', value: 'trmaaseguradoras' },
    { label: 'Tipos de Mantenimiento', value: 'trmatipomantenimiento' },
    { label: 'Sexos', value: 'trmasexo' },
    { label: 'Tipos de Licencia', value: 'trmalicencia' },
    { label: 'Perfiles de Usuario', value: 'trmaperfil' },
    { label: 'Tipos de Documentos', value: 'trmadocumentos' },
    { label: 'Items de Mantenimiento', value: 'trmaitems_mantenimiento' },
    { label: 'Items de Verificación', value: 'trmaitems_verificacion' },
    { label: 'Letras de RIF', value: 'trmaletra_rif' },
    { label: 'Departamentos', value: 'trmadepartamentos' },
    { label: 'Direcciones', value: 'trmadirecciones' }
  ]

  const { data, isLoading, isError, refetch } = useQuery(
    ['maestros', selectedTable],
    () => {
      console.log('Fetching maestros for table:', selectedTable)
      // Obtener todos los elementos (1000 elementos por página)
      return api.getMaestroItems(selectedTable, 1, 1000)
    },
    {
      keepPreviousData: true,
      onSuccess: (data) => {
        console.log('Maestros data received:', data)
      },
      onError: (error) => {
        console.error('Error fetching maestros:', error)
      }
    }
  )

  const createMutation = useMutation(
    (data: any) => api.createMaestroItem(selectedTable, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['maestros', selectedTable])
        setVisible(false)
        resetForm()
        // Mostrar notificación de éxito
        const toast = document.createElement('div')
        toast.innerHTML = `
          <div class="p-toast p-toast-top-right">
            <div class="p-toast-message p-toast-message-success">
              <div class="p-toast-message-content">
                <i class="pi pi-check-circle"></i>
                <span>Elemento creado exitosamente</span>
              </div>
            </div>
          </div>
        `
        document.body.appendChild(toast)
        setTimeout(() => toast.remove(), 3000)
      },
      onError: (err: any) => {
        console.error('Error al crear elemento:', err)
        // Mostrar notificación de error
        const toast = document.createElement('div')
        toast.innerHTML = `
          <div class="p-toast p-toast-top-right">
            <div class="p-toast-message p-toast-message-error">
              <div class="p-toast-message-content">
                <i class="pi pi-times-circle"></i>
                <span>Error al crear elemento: ${err.response?.data?.message || 'Error desconocido'}</span>
              </div>
            </div>
          </div>
        `
        document.body.appendChild(toast)
        setTimeout(() => toast.remove(), 5000)
      },
    }
  )

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: any }) => api.updateMaestroItem(selectedTable, id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['maestros', selectedTable])
        setVisible(false)
        resetForm()
        // Mostrar notificación de éxito
        const toast = document.createElement('div')
        toast.innerHTML = `
          <div class="p-toast p-toast-top-right">
            <div class="p-toast-message p-toast-message-success">
              <div class="p-toast-message-content">
                <i class="pi pi-check-circle"></i>
                <span>Elemento actualizado exitosamente</span>
              </div>
            </div>
          </div>
        `
        document.body.appendChild(toast)
        setTimeout(() => toast.remove(), 3000)
      },
      onError: (err: any) => {
        console.error('Error al actualizar elemento:', err)
        // Mostrar notificación de error
        const toast = document.createElement('div')
        toast.innerHTML = `
          <div class="p-toast p-toast-top-right">
            <div class="p-toast-message p-toast-message-error">
              <div class="p-toast-message-content">
                <i class="pi pi-times-circle"></i>
                <span>Error al actualizar elemento: ${err.response?.data?.message || 'Error desconocido'}</span>
              </div>
            </div>
          </div>
        `
        document.body.appendChild(toast)
        setTimeout(() => toast.remove(), 5000)
      },
    }
  )

  const deleteMutation = useMutation(
    (id: number) => api.deleteMaestroItem(selectedTable, id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['maestros', selectedTable])
        // Mostrar notificación de éxito
        const toast = document.createElement('div')
        toast.innerHTML = `
          <div class="p-toast p-toast-top-right">
            <div class="p-toast-message p-toast-message-success">
              <div class="p-toast-message-content">
                <i class="pi pi-check-circle"></i>
                <span>Elemento eliminado exitosamente</span>
              </div>
            </div>
          </div>
        `
        document.body.appendChild(toast)
        setTimeout(() => toast.remove(), 3000)
      },
      onError: (err: any) => {
        console.error('Error al eliminar elemento:', err)
        // Mostrar notificación de error
        const toast = document.createElement('div')
        toast.innerHTML = `
          <div class="p-toast p-toast-top-right">
            <div class="p-toast-message p-toast-message-error">
              <div class="p-toast-message-content">
                <i class="pi pi-times-circle"></i>
                <span>Error al eliminar elemento: ${err.response?.data?.message || 'Error desconocido'}</span>
              </div>
            </div>
          </div>
        `
        document.body.appendChild(toast)
        setTimeout(() => toast.remove(), 5000)
      },
    }
  )

  const resetForm = () => {
    setFormData({})
    setSelectedItem(null)
  }

  const handleCreate = () => {
    resetForm()
    setVisible(true)
  }

  const handleEdit = (item: MaestroItem) => {
    setSelectedItem(item)
    setFormData({ ...item })
    setVisible(true)
  }

  const handleDelete = (item: MaestroItem) => {
    setSelectedItem(item)
    setVisibleConfirmDialog(true)
  }

  const handleSubmit = () => {
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
    }

  const getTableLabel = (table: string) => {
    const option = tableOptions.find(opt => opt.value === table)
    return option?.label || table
  }

  const actionBodyTemplate = (rowData: MaestroItem) => {
    return (
      <div className="d-flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text p-button-plain"
          onClick={() => handleEdit(rowData)}
          tooltip="Editar"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger"
          onClick={() => handleDelete(rowData)}
          tooltip="Eliminar"
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <CContainer fluid className="py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <CIcon icon="cil-reload" size="3xl" className="mb-3" />
            <h5>Cargando datos de maestros...</h5>
            <p>Tabla: {getTableLabel(selectedTable)}</p>
          </div>
        </div>
      </CContainer>
    )
  }

  if (isError) {
    return (
      <CContainer fluid className="py-4">
        <CCard>
          <CCardBody className="text-center">
            <CIcon icon="cil-warning" size="3xl" className="text-danger mb-3" />
            <h5 className="text-danger">Error al cargar los datos</h5>
            <p>Ha ocurrido un error al cargar la información de maestros.</p>
            <Button 
              label="Reintentar" 
              icon="pi pi-refresh" 
              onClick={() => refetch()} 
              className="p-button-outlined"
            />
          </CCardBody>
        </CCard>
      </CContainer>
    )
  }

  const items = data?.data?.data || data?.data || []
  console.log('Items to display:', items)
  console.log('Raw data:', data)
  console.log('Total items count:', items.length)

  return (
    <CContainer fluid className="py-4">
      <Toast />
      <ConfirmDialog />
      
      {/* Header */}
      <CRow className="mb-4">
        <CCol xs={12}>
          <CCard>
            <CCardHeader 
              style={{
                background: 'linear-gradient(90deg, #001a79 0%, #001a79 100%)',
                color: 'white',
                borderBottom: '2px solid #001a79'
              }}
            >
              <CCardTitle className="h4 mb-0 d-flex align-items-center">
                <CIcon icon="cil-settings" className="me-2" />
        Gestión de Tablas Maestras
              </CCardTitle>
            </CCardHeader>
            <CCardBody>
              <CRow className="align-items-end">
                <CCol md={6}>
                  <div className="field">
                    <label htmlFor="table-select" className="font-semibold block mb-2">
                  Seleccionar Tabla Maestra
                    </label>
                    <Dropdown
                      id="table-select"
                    value={selectedTable}
                      onChange={(e) => setSelectedTable(e.value)}
                      options={tableOptions}
                      className="w-100"
                      placeholder="Seleccionar tabla..."
                    />
                  </div>
                </CCol>
                <CCol md={6} className="text-end">
                  <Button
                    label="Nuevo Elemento"
                    icon="pi pi-plus"
                    onClick={handleCreate}
                    className="p-button-success"
                  />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* DataTable */}
      <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardHeader 
              style={{
                background: 'linear-gradient(90deg, #001a79 0%, #001a79 100%)',
                color: 'white',
                borderBottom: '2px solid #001a79'
              }}
            >
              <CCardTitle className="h5 mb-0">
                {getTableLabel(selectedTable)} ({items.length} elementos)
              </CCardTitle>
            </CCardHeader>
            <CCardBody>
              {/* Filtro global */}
              <div className="mb-3">
                <div className="p-input-icon-left w-100">
                  <i className="pi pi-search" />
                  <InputText
                    value={filters.global.value || ''}
                    onChange={(e) => {
                      let _filters = { ...filters }
                      _filters['global'].value = e.target.value
                      setFilters(_filters)
                    }}
                    placeholder="Buscar por nombre o ID..."
                    className="w-100"
                  />
                </div>
              </div>

              <DataTable
                value={items}
                paginator
                rows={25}
                rowsPerPageOptions={[10, 25, 50, 100]}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} elementos"
                globalFilterFields={['id', 'nombre']}
                filters={filters}
                className="maestros-table"
                emptyMessage={`No se encontraron elementos en ${getTableLabel(selectedTable)}`}
                loading={isLoading}
              >
                <Column
                  field="id"
                  header="ID"
                  sortable
                  style={{ minWidth: '80px' }}
                />
                <Column
                  field="nombre"
                  header="Nombre"
                  sortable
                  style={{ minWidth: '200px' }}
                />
                <Column
                  body={actionBodyTemplate}
                  header="Acciones"
                  style={{ minWidth: '120px' }}
                />
              </DataTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Dialog para crear/editar */}
      <Dialog
        visible={visible}
        style={{ width: '60vw', maxWidth: '800px' }}
        header={
          <div className="d-flex align-items-center">
            <CIcon icon="cil-settings" className="me-2" style={{ color: '#001a79' }} />
            <span style={{ color: '#001a79', fontWeight: 'bold' }}>
              {selectedItem ? 'Editar Elemento' : 'Nuevo Elemento'}
            </span>
          </div>
        }
        modal
        className="p-fluid"
        onHide={() => setVisible(false)}
        footer={
          <div className="d-flex justify-content-end gap-2">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              onClick={() => setVisible(false)}
              className="vehiculos-cancel-btn"
            />
          <Button
              label={selectedItem ? 'Actualizar Elemento' : 'Crear Elemento'}
              icon="pi pi-check"
            onClick={handleSubmit}
              loading={createMutation.isLoading || updateMutation.isLoading}
              className="vehiculos-save-btn"
            />
          </div>
        }
      >
        <div className="p-4">
          <div className="grid">
            <div className="col-12">
              <div className="field">
                <label htmlFor="nombre" className="font-semibold block mb-2">
                  Nombre *
                </label>
                <InputText
                  id="nombre"
                  value={formData.nombre || ''}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ingrese el nombre del elemento"
                  className="w-100"
                  style={{ textAlign: 'center' }}
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <ConfirmDialog
        visible={visibleConfirmDialog}
        onHide={() => setVisibleConfirmDialog(false)}
        message={
          <div>
            <div className="mb-3">
              <i className="pi pi-exclamation-triangle text-warning" style={{ fontSize: '2rem' }}></i>
            </div>
            <div className="mb-3">
              ¿Está seguro de que desea eliminar el elemento <strong>"{selectedItem?.nombre}"</strong>?
            </div>
            <div className="mb-3">
              <strong>ID:</strong> {selectedItem?.id}<br />
              <strong>Tabla:</strong> {getTableLabel(selectedTable)}
            </div>
            <div className="text-danger">
              <i className="pi pi-warning"></i>
              Esta acción no se puede deshacer.
            </div>
          </div>
        }
        header="Confirmar Eliminación"
        icon="pi pi-exclamation-triangle"
        accept={() => {
          if (selectedItem) {
            deleteMutation.mutate(selectedItem.id)
          }
          setVisibleConfirmDialog(false)
        }}
        reject={() => setVisibleConfirmDialog(false)}
        acceptLabel="Eliminar"
        rejectLabel="Cancelar"
        acceptClassName="p-button-danger"
        rejectClassName="p-button-outlined"
      />
    </CContainer>
  )
};

export default Maestros;
