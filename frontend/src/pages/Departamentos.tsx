import React, { useState, useEffect, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
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
import { Departamento as DepartamentoType, DepartamentoForm } from '../types'

const Departamentos: React.FC = () => {
  const toast = useRef<Toast>(null)
  const [departamentos, setDepartamentos] = useState<DepartamentoType[]>([])
  const [visible, setVisible] = useState(false)
  const [selectedDepartamento, setSelectedDepartamento] = useState<DepartamentoType | null>(null)
  const [filters, setFilters] = useState({
    global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
    nombre: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
    responsable: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
  })

  // Formulario
  const [formData, setFormData] = useState<DepartamentoForm>({
    nombre: '',
    responsable: '',
    telefono_primario: '',
    telefono_secundario: '',
    status: 1,
  })

  // Estados para validaciones
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Query client para invalidar queries
  const queryClient = useQueryClient()

  // Cargar datos
  const { isLoading, isError, refetch } = useQuery(
    'departamentos',
    () => api.getDepartamentos(1, 100),
    {
      onSuccess: (data) => {
        console.log('Respuesta de departamentos:', data)
        if (data.success) {
          setDepartamentos(data.data)
        } else {
          console.error('Error en respuesta de departamentos:', data.message)
        }
      },
      onError: (error: any) => {
        console.error('Error cargando departamentos:', error)
        console.error('Detalles del error:', error?.response?.data)
      },
      retry: 1,
      retryDelay: 1000,
    }
  )

  // Mutaciones
  const createMutation = useMutation((data: DepartamentoForm) => api.createDepartamento(data), {
    onSuccess: () => {
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Departamento creado correctamente',
      })
      queryClient.invalidateQueries('departamentos')
      setVisible(false)
      resetForm()
    },
    onError: (error: any) => {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al crear departamento',
      })
    },
  })

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: DepartamentoForm }) => api.updateDepartamento(id, data),
    {
      onSuccess: () => {
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Departamento actualizado correctamente',
        })
        queryClient.invalidateQueries('departamentos')
        setVisible(false)
        resetForm()
      },
      onError: (error: any) => {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: error.response?.data?.message || 'Error al actualizar departamento',
        })
      },
    }
  )

  const deleteMutation = useMutation((id: number) => api.deleteDepartamento(id), {
    onSuccess: () => {
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Departamento eliminado correctamente',
      })
      queryClient.invalidateQueries('departamentos')
    },
    onError: (error: any) => {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al eliminar departamento',
      })
    },
  })

  const activarMutation = useMutation((id: number) => api.activarDepartamento(id), {
    onSuccess: () => {
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Departamento activado correctamente',
      })
      queryClient.invalidateQueries('departamentos')
    },
    onError: (error: any) => {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al activar departamento',
      })
    },
  })

  const desactivarMutation = useMutation((id: number) => api.desactivarDepartamento(id), {
    onSuccess: () => {
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Departamento desactivado correctamente',
      })
      queryClient.invalidateQueries('departamentos')
    },
    onError: (error: any) => {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al desactivar departamento',
      })
    },
  })

  // Funciones de validación
  const validateName = (value: string): string => {
    if (!value.trim()) return 'Este campo es requerido'
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'Solo se permiten letras y espacios'
    if (value.length < 2) return 'Debe tener al menos 2 caracteres'
    if (value.length > 50) return 'No puede tener más de 50 caracteres'
    return ''
  }

  const validatePhone = (value: string): string => {
    if (!value.trim()) return 'Este campo es requerido'
    const cleanValue = value.replace(/\D/g, '')
    if (cleanValue.length !== 11) return 'Debe tener exactamente 11 dígitos'
    return ''
  }

  const validateOptionalPhone = (value: string): string => {
    if (!value.trim()) return '' // Campo opcional
    const cleanValue = value.replace(/\D/g, '')
    if (cleanValue.length !== 11) return 'Debe tener exactamente 11 dígitos'
    return ''
  }

  const applyPhoneMask = (value: string): string => {
    // Remover todos los caracteres no numéricos
    const cleanValue = value.replace(/\D/g, '')
    
    // Aplicar máscara xxxx-xxx-xx-xx
    if (cleanValue.length <= 4) {
      return cleanValue
    } else if (cleanValue.length <= 7) {
      return `${cleanValue.slice(0, 4)}-${cleanValue.slice(4)}`
    } else if (cleanValue.length <= 9) {
      return `${cleanValue.slice(0, 4)}-${cleanValue.slice(4, 7)}-${cleanValue.slice(7)}`
    } else {
      return `${cleanValue.slice(0, 4)}-${cleanValue.slice(4, 7)}-${cleanValue.slice(7, 9)}-${cleanValue.slice(9, 11)}`
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    errors.nombre = validateName(formData.nombre)
    errors.responsable = validateName(formData.responsable)
    errors.telefono_primario = validatePhone(formData.telefono_primario)
    errors.telefono_secundario = validateOptionalPhone(formData.telefono_secundario)
    
    setValidationErrors(errors)
    
    // Retornar true si no hay errores
    return Object.values(errors).every(error => error === '')
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      responsable: '',
      telefono_primario: '',
      telefono_secundario: '',
      status: 1,
    })
    setSelectedDepartamento(null)
    setValidationErrors({}) // Limpiar errores de validación
  }

  const handleCreate = () => {
    resetForm()
    setVisible(true)
  }

  const handleEdit = (departamento: DepartamentoType) => {
    setSelectedDepartamento(departamento)
    
    const formDataToSet: DepartamentoForm = {
      nombre: departamento.nombre,
      responsable: departamento.responsable,
      telefono_primario: departamento.telefono_primario ? applyPhoneMask(departamento.telefono_primario) : '',
      telefono_secundario: departamento.telefono_secundario ? applyPhoneMask(departamento.telefono_secundario) : '',
      status: departamento.status,
    }
    
    setFormData(formDataToSet)
    setVisible(true)
  }

  const handleDelete = (departamento: DepartamentoType) => {
    confirmDialog({
      message: (
        <div className="d-flex align-items-start">
          <i className="pi pi-exclamation-triangle me-3" style={{ color: '#dc3545', fontSize: '1.5rem' }}></i>
          <div>
            <p className="mb-2 fw-bold">¿Está seguro de eliminar este departamento?</p>
            <div className="bg-light p-3 rounded" style={{ border: '1px solid #dee2e6' }}>
              <p className="mb-1"><strong>Nombre:</strong> {departamento.nombre}</p>
              <p className="mb-1"><strong>Responsable:</strong> {departamento.responsable}</p>
              <p className="mb-0"><strong>Teléfono:</strong> {departamento.telefono_primario}</p>
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
      accept: () => deleteMutation.mutate(departamento.id),
      style: { width: '500px' },
      contentStyle: { padding: '0' }
    })
  }

  const handleToggleStatus = (departamento: DepartamentoType) => {
    if (departamento.status === 1) {
      desactivarMutation.mutate(departamento.id)
    } else {
      activarMutation.mutate(departamento.id)
    }
  }

  const handleSubmit = () => {
    // Validar formulario antes de enviar
    if (!validateForm()) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor corrija los errores en el formulario',
      })
      return
    }

    // Limpiar máscaras antes de enviar
    const dataToSend = {
      ...formData,
      telefono_primario: formData.telefono_primario.replace(/\D/g, ''),
      telefono_secundario: formData.telefono_secundario.replace(/\D/g, '')
    }

    if (selectedDepartamento) {
      updateMutation.mutate({ id: selectedDepartamento.id, data: dataToSend })
    } else {
      createMutation.mutate(dataToSend)
    }
  }

  const statusBodyTemplate = (rowData: DepartamentoType) => {
    const getSeverity = (status: number) => {
      return status === 1 ? 'success' : 'danger'
    }

    const getLabel = (status: number) => {
      return status === 1 ? 'Activo' : 'Inactivo'
    }

    return <Tag value={getLabel(rowData.status)} severity={getSeverity(rowData.status)} />
  }

  const actionBodyTemplate = (rowData: DepartamentoType) => {
    return (
      <div className="d-flex gap-2" style={{ minHeight: '40px', alignItems: 'center' }}>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text p-button-sm"
          onClick={() => handleEdit(rowData)}
          tooltip="Editar"
        />
        <Button
          icon={rowData.status === 1 ? "pi pi-times" : "pi pi-check"}
          className={`p-button-rounded p-button-text p-button-sm ${rowData.status === 1 ? 'p-button-warning' : 'p-button-success'}`}
          onClick={() => handleToggleStatus(rowData)}
          tooltip={rowData.status === 1 ? "Desactivar" : "Activar"}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-sm p-button-danger"
          onClick={() => handleDelete(rowData)}
          tooltip="Eliminar"
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <CSpinner size="sm" />
        <span className="ms-2">Cargando departamentos...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <CAlert color="danger" className="d-flex align-items-center">
        <strong>Error:</strong> No se pudieron cargar los departamentos
      </CAlert>
    )
  }

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Departamentos</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <CButton color="primary" onClick={handleCreate}>
            <i className="cil-plus me-2"></i>
            Nuevo Departamento
          </CButton>
        </div>
      </div>

      <CCard>
        <CCardHeader style={{ background: '#001a79', color: 'white' }}>
          <CCardTitle className="mb-0">Lista de Departamentos</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <div className="mb-3">
            <InputText
              value={filters.global.value || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, global: { value: e.target.value, matchMode: FilterMatchMode.CONTAINS } })}
              placeholder="Buscar por nombre o responsable..."
              className="w-100"
            />
          </div>
          <DataTable
            value={departamentos}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} departamentos"
            globalFilterFields={['nombre', 'responsable']}
            filters={filters}
            filterDisplay="row"
            emptyMessage="No se encontraron departamentos"
            loading={isLoading}
            className="datatable-responsive departamentos-table"
          >
            <Column
              field="nombre"
              header="Nombre"
              sortable
              filter
              filterPlaceholder="Buscar por nombre"
              style={{ minWidth: '150px' }}
            />
            <Column
              field="responsable"
              header="Responsable"
              sortable
              filter
              filterPlaceholder="Buscar por responsable"
              style={{ minWidth: '150px' }}
            />
            <Column
              field="telefono_primario"
              header="Teléfono Principal"
              sortable
              style={{ minWidth: '150px' }}
            />
            <Column
              field="telefono_secundario"
              header="Teléfono Secundario"
              sortable
              style={{ minWidth: '150px' }}
            />
            <Column
              field="status"
              header="Estado"
              body={statusBodyTemplate}
              style={{ minWidth: '100px' }}
            />
            <Column
              body={actionBodyTemplate}
              header="Acciones"
              style={{ minWidth: '180px' }}
            />
          </DataTable>
        </CCardBody>
      </CCard>

      <Dialog
        visible={visible}
        style={{ width: '70vw', maxWidth: '800px' }}
        header={
          <div className="d-flex align-items-center">
            <i className="cil-building me-2" style={{ color: '#001a79' }}></i>
            <span style={{ color: '#001a79', fontWeight: 'bold' }}>
              {selectedDepartamento ? 'Editar Departamento' : 'Nuevo Departamento'}
            </span>
          </div>
        }
        modal
        className="p-fluid"
        onHide={() => setVisible(false)}
      >
        <div className="p-4">
          <div className="grid">
            <div className="col-6 md:col-6">
              <div className="field">
                <label htmlFor="nombre" className="font-semibold block mb-2">
                  Nombre del Departamento *
                </label>
                <InputText
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => {
                    const value = e.target.value
                    // Solo permitir letras y espacios
                    if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) {
                      setFormData({ ...formData, nombre: value })
                      // Limpiar error al escribir
                      if (validationErrors.nombre) {
                        setValidationErrors({ ...validationErrors, nombre: '' })
                      }
                    }
                  }}
                  placeholder="Nombre del departamento"
                  className={`w-100 ${validationErrors.nombre ? 'p-invalid' : ''}`}
                  maxLength={50}
                  required
                />
                {validationErrors.nombre && (
                  <small className="p-error">{validationErrors.nombre}</small>
                )}
              </div>
            </div>
            <div className="col-6 md:col-6">
              <div className="field">
                <label htmlFor="responsable" className="font-semibold block mb-2">
                  Responsable *
                </label>
                <InputText
                  id="responsable"
                  value={formData.responsable}
                  onChange={(e) => {
                    const value = e.target.value
                    // Solo permitir letras y espacios
                    if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) {
                      setFormData({ ...formData, responsable: value })
                      // Limpiar error al escribir
                      if (validationErrors.responsable) {
                        setValidationErrors({ ...validationErrors, responsable: '' })
                      }
                    }
                  }}
                  placeholder="Nombre del responsable"
                  className={`w-100 ${validationErrors.responsable ? 'p-invalid' : ''}`}
                  maxLength={50}
                  required
                />
                {validationErrors.responsable && (
                  <small className="p-error">{validationErrors.responsable}</small>
                )}
              </div>
            </div>
            <div className="col-6 md:col-6">
              <div className="field">
                <label htmlFor="telefono_primario" className="font-semibold block mb-2">
                  Teléfono Principal *
                </label>
                <InputText
                  id="telefono_primario"
                  value={formData.telefono_primario}
                  onChange={(e) => {
                    const maskedValue = applyPhoneMask(e.target.value)
                    setFormData({ ...formData, telefono_primario: maskedValue })
                    // Limpiar error al escribir
                    if (validationErrors.telefono_primario) {
                      setValidationErrors({ ...validationErrors, telefono_primario: '' })
                    }
                  }}
                  placeholder="xxxx-xxx-xx-xx"
                  className={`w-100 ${validationErrors.telefono_primario ? 'p-invalid' : ''}`}
                  maxLength={14}
                  required
                />
                {validationErrors.telefono_primario && (
                  <small className="p-error">{validationErrors.telefono_primario}</small>
                )}
              </div>
            </div>
            <div className="col-6 md:col-6">
              <div className="field">
                <label htmlFor="telefono_secundario" className="font-semibold block mb-2">
                  Teléfono Secundario
                </label>
                <InputText
                  id="telefono_secundario"
                  value={formData.telefono_secundario}
                  onChange={(e) => {
                    const maskedValue = applyPhoneMask(e.target.value)
                    setFormData({ ...formData, telefono_secundario: maskedValue })
                    // Limpiar error al escribir
                    if (validationErrors.telefono_secundario) {
                      setValidationErrors({ ...validationErrors, telefono_secundario: '' })
                    }
                  }}
                  placeholder="xxxx-xxx-xx-xx (opcional)"
                  className={`w-100 ${validationErrors.telefono_secundario ? 'p-invalid' : ''}`}
                  maxLength={14}
                />
                {validationErrors.telefono_secundario && (
                  <small className="p-error">{validationErrors.telefono_secundario}</small>
                )}
              </div>
            </div>
            <div className="col-6 md:col-6">
              <div className="field">
                <label htmlFor="status" className="font-semibold block mb-2">
                  Estado
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
                  className="form-select w-100"
                >
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="mt-4 pt-3" style={{ borderTop: '2px solid #f0f0f0' }}>
            <div className="grid">
              <div className="col-3 md:col-3 offset-md-3">
                <Button
                  label="Cancelar"
                  icon="pi pi-times"
                  onClick={() => setVisible(false)}
                  className="w-100"
                />
              </div>
              <div className="col-3 md:col-3">
                <Button
                  label={selectedDepartamento ? 'Actualizar Departamento' : 'Crear Departamento'}
                  icon="pi pi-check"
                  onClick={handleSubmit}
                  loading={createMutation.isLoading || updateMutation.isLoading}
                  className="w-100"
                />
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default Departamentos
