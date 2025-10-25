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
import { Visitante as VisitanteType, VisitanteForm } from '../types'
import PhotoCapture, { PhotoCaptureRef } from '../components/PhotoCapture-working'

const Visitantes: React.FC = () => {
  const toast = useRef<Toast>(null)
  const photoCaptureRef = useRef<PhotoCaptureRef>(null)
  const [visitantes, setVisitantes] = useState<VisitanteType[]>([])
  const [visible, setVisible] = useState(false)
  const [selectedVisitante, setSelectedVisitante] = useState<VisitanteType | null>(null)
  const [filters, setFilters] = useState({
    global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
    nombre: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
    apellido: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
    cedula: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
  })

  // Formulario
  const [formData, setFormData] = useState<VisitanteForm>({
    nombre: '',
    apellido: '',
    cedula: '',
    telefono_primario: '',
    telefono_secundario: '',
    foto: '',
    solicitado: 0,
  })

  // Estados para validaciones
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Query client para invalidar queries
  const queryClient = useQueryClient()

  // Funciones de validación
  const validateName = (value: string): string => {
    if (!value.trim()) return 'Este campo es requerido'
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'Solo se permiten letras y espacios'
    if (value.trim().length < 2) return 'Debe tener al menos 2 caracteres'
    return ''
  }

  const validateCedula = (value: string): string => {
    if (!value.trim()) return 'Este campo es requerido'
    if (!/^\d+$/.test(value)) return 'Solo se permiten números'
    if (value.length < 5) return 'Debe tener al menos 5 dígitos'
    if (value.length > 8) return 'No puede tener más de 8 dígitos'
    return ''
  }

  const validatePhone = (value: string): string => {
    if (!value.trim()) return 'Este campo es requerido'
    if (!/^\d{4}-\d{3}-\d{2}-\d{2}$/.test(value)) return 'Formato inválido. Use: xxxx-xxx-xx-xx'
    return ''
  }

  const validateOptionalPhone = (value: string): string => {
    if (!value.trim()) return '' // Campo opcional
    if (!/^\d{4}-\d{3}-\d{2}-\d{2}$/.test(value)) return 'Formato inválido. Use: xxxx-xxx-xx-xx'
    return ''
  }

  // Función para aplicar máscara de teléfono
  const applyPhoneMask = (value: string): string => {
    if (!value) return ''
    
    // Remover todos los caracteres no numéricos
    const numbers = value.replace(/\D/g, '')
    
    // Si no hay números, retornar vacío
    if (numbers.length === 0) return ''
    
    // Aplicar máscara xxxx-xxx-xx-xx
    if (numbers.length <= 4) return numbers
    if (numbers.length <= 7) return `${numbers.slice(0, 4)}-${numbers.slice(4)}`
    if (numbers.length <= 9) return `${numbers.slice(0, 4)}-${numbers.slice(4, 7)}-${numbers.slice(7)}`
    return `${numbers.slice(0, 4)}-${numbers.slice(4, 7)}-${numbers.slice(7, 9)}-${numbers.slice(9, 11)}`
  }

  // Función para validar todo el formulario
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    errors.nombre = validateName(formData.nombre)
    errors.apellido = validateName(formData.apellido)
    errors.cedula = validateCedula(formData.cedula)
    errors.telefono_primario = validatePhone(formData.telefono_primario)
    errors.telefono_secundario = validateOptionalPhone(formData.telefono_secundario)
    
    setValidationErrors(errors)
    
    // Retornar true si no hay errores
    return Object.values(errors).every(error => error === '')
  }

  // Cargar datos
  const { isLoading, isError, refetch } = useQuery(
    ['visitantes', 'page'],
    () => api.getVisitantes(1, 100),
    {
      onSuccess: (data) => {
        console.log('Query ejecutada - Respuesta de visitantes:', data)
        if (data.success) {
          setVisitantes(data.data)
          console.log('Visitantes actualizados en estado:', data.data.length)
        } else {
          console.error('Error en respuesta de visitantes:', data.message)
        }
      },
      onError: (error: any) => {
        console.error('Error cargando visitantes:', error)
        console.error('Detalles del error:', error?.response?.data)
      },
      retry: 1,
      retryDelay: 1000,
      refetchOnWindowFocus: false,
      staleTime: 0,
    }
  )

  // Mutaciones
  const createMutation = useMutation((data: VisitanteForm) => api.createVisitante(data), {
    onSuccess: () => {
      // Detener cámara automáticamente
      if (photoCaptureRef.current?.stopCamera) {
        photoCaptureRef.current.stopCamera()
      }
      
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Visitante creado correctamente',
      })
      queryClient.invalidateQueries(['visitantes', 'page'])
      setVisible(false)
      resetForm()
    },
    onError: (error: any) => {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al crear visitante',
      })
    },
  })

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: VisitanteForm }) => api.updateVisitante(id, data),
    {
      onSuccess: () => {
        // Detener cámara automáticamente
        if (photoCaptureRef.current?.stopCamera) {
          photoCaptureRef.current.stopCamera()
        }
        
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Visitante actualizado correctamente',
        })
        queryClient.invalidateQueries(['visitantes', 'page'])
        setVisible(false)
        resetForm()
      },
      onError: (error: any) => {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: error.response?.data?.message || 'Error al actualizar visitante',
        })
      },
    }
  )

  const deleteMutation = useMutation((id: number) => api.deleteVisitante(id), {
    onSuccess: (response) => {
      console.log('Eliminación exitosa:', response)
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Visitante eliminado correctamente',
      })
      queryClient.invalidateQueries(['visitantes', 'page'])
      console.log('Query invalidada: visitantes-page')
    },
    onError: (error: any) => {
      console.log('Error al eliminar:', error)
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al eliminar visitante',
      })
    },
  })

  const marcarSolicitadoMutation = useMutation((id: number) => api.marcarVisitanteSolicitado(id), {
    onSuccess: (response) => {
      console.log('Marcar solicitado exitoso:', response)
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Visitante marcado como solicitado',
      })
      queryClient.invalidateQueries(['visitantes', 'page'])
    },
    onError: (error: any) => {
      console.log('Error al marcar como solicitado:', error)
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al marcar como solicitado',
      })
    },
  })

  const desmarcarSolicitadoMutation = useMutation((id: number) => api.desmarcarVisitanteSolicitado(id), {
    onSuccess: (response) => {
      console.log('Desmarcar solicitado exitoso:', response)
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Visitante desmarcado como solicitado',
      })
      queryClient.invalidateQueries(['visitantes', 'page'])
    },
    onError: (error: any) => {
      console.log('Error al desmarcar como solicitado:', error)
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al desmarcar como solicitado',
      })
    },
  })

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      cedula: '',
      telefono_primario: '',
      telefono_secundario: '',
      foto: '',
      solicitado: 0,
    })
    setSelectedVisitante(null)
    setValidationErrors({}) // Limpiar errores de validación
  }

  const handleCreate = () => {
    resetForm()
    setVisible(true)
  }

  const handleEdit = (visitante: VisitanteType) => {
    setSelectedVisitante(visitante)
    
    const formDataToSet: VisitanteForm = {
      nombre: visitante.nombre,
      apellido: visitante.apellido,
      cedula: visitante.cedula,
      telefono_primario: visitante.telefono_primario ? applyPhoneMask(visitante.telefono_primario) : '',
      telefono_secundario: visitante.telefono_secundario ? applyPhoneMask(visitante.telefono_secundario) : '',
      foto: visitante.foto,
      solicitado: visitante.solicitado,
    }
    
    setFormData(formDataToSet)
    setVisible(true)
  }

  const handleDelete = (visitante: VisitanteType) => {
    confirmDialog({
      message: (
        <div className="d-flex align-items-start">
          <i className="pi pi-exclamation-triangle me-3" style={{ color: '#dc3545', fontSize: '1.5rem' }}></i>
          <div>
            <p className="mb-2 fw-bold">¿Está seguro de eliminar este visitante?</p>
            <div className="bg-light p-3 rounded" style={{ border: '1px solid #dee2e6' }}>
              <p className="mb-1"><strong>Nombre:</strong> {visitante.nombre} {visitante.apellido}</p>
              <p className="mb-1"><strong>Cédula:</strong> {visitante.cedula}</p>
              <p className="mb-0"><strong>Teléfono:</strong> {visitante.telefono_primario}</p>
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
      accept: () => deleteMutation.mutate(visitante.id),
      style: { width: '500px' },
      contentStyle: { padding: '0' }
    })
  }

  const handleMarcarSolicitado = (visitante: VisitanteType) => {
    console.log('Estado actual del visitante:', visitante.solicitado)
    if (visitante.solicitado === 1) {
      console.log('Desmarcando visitante como solicitado')
      desmarcarSolicitadoMutation.mutate(visitante.id)
    } else {
      console.log('Marcando visitante como solicitado')
      marcarSolicitadoMutation.mutate(visitante.id)
    }
  }

  const handleSubmit = () => {
    // Validar formulario antes de enviar
    if (!validateForm()) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error de Validación',
        detail: 'Por favor corrija los errores en el formulario',
        life: 5000
      })
      return
    }

    // Preparar datos para envío (limpiar máscaras de teléfonos)
    const dataToSend = {
      ...formData,
      telefono_primario: formData.telefono_primario.replace(/\D/g, ''),
      telefono_secundario: formData.telefono_secundario.replace(/\D/g, '')
    }

    if (selectedVisitante) {
      updateMutation.mutate({ id: selectedVisitante.id, data: dataToSend })
    } else {
      createMutation.mutate(dataToSend)
    }
  }

  const handlePhotoCapture = (photoData: string) => {
    setFormData({ ...formData, foto: photoData })
  }

  const handlePhotoUpload = async (file: File, customName?: string) => {
    try {
      const response = await api.uploadVisitorPhoto(file, customName)
      if (response.success) {
        setFormData({ ...formData, foto: response.data.url })
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Foto subida correctamente',
        })
      } else {
        throw new Error(response.message || 'Error al subir la foto')
      }
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al subir la foto',
      })
    }
  }

  const solicitadoBodyTemplate = (rowData: VisitanteType) => {
    const getSeverity = (solicitado: number) => {
      return solicitado === 1 ? 'success' : 'warning'
    }

    const getLabel = (solicitado: number) => {
      return solicitado === 1 ? 'Solicitado' : 'Pendiente'
    }

    return <Tag value={getLabel(rowData.solicitado)} severity={getSeverity(rowData.solicitado)} />
  }

  const actionBodyTemplate = (rowData: VisitanteType) => {
    return (
      <div className="d-flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text p-button-sm"
          onClick={() => handleEdit(rowData)}
          tooltip="Editar"
        />
        <Button
          icon={rowData.solicitado === 1 ? "pi pi-times" : "pi pi-check"}
          className={`p-button-rounded p-button-text p-button-sm ${rowData.solicitado === 1 ? 'p-button-warning' : 'p-button-success'}`}
          onClick={() => handleMarcarSolicitado(rowData)}
          tooltip={rowData.solicitado === 1 ? "Desmarcar como solicitado" : "Marcar como solicitado"}
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
        <span className="ms-2">Cargando visitantes...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <CAlert color="danger" className="d-flex align-items-center">
        <strong>Error:</strong> No se pudieron cargar los visitantes
      </CAlert>
    )
  }

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Visitantes</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <CButton color="primary" onClick={handleCreate}>
            <i className="cil-plus me-2"></i>
            Nuevo Visitante
          </CButton>
        </div>
      </div>

      <CCard>
        <CCardHeader style={{ background: '#001a79', color: 'white' }}>
          <CCardTitle className="mb-0">Lista de Visitantes</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <div className="mb-3">
            <InputText
              value={filters.global.value || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, global: { value: e.target.value, matchMode: FilterMatchMode.CONTAINS } })}
              placeholder="Buscar por nombre, apellido o cédula..."
              className="w-100"
            />
          </div>
          <DataTable
            value={visitantes}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} visitantes"
            globalFilterFields={['nombre', 'apellido', 'cedula']}
            filters={filters}
            filterDisplay="row"
            emptyMessage="No se encontraron visitantes"
            loading={isLoading}
            className="datatable-responsive visitantes-table"
          >
            <Column
              field="nombre"
              header="Nombre"
              sortable
              filter
              filterPlaceholder="Buscar por nombre"
              style={{ minWidth: '120px' }}
            />
            <Column
              field="apellido"
              header="Apellido"
              sortable
              filter
              filterPlaceholder="Buscar por apellido"
              style={{ minWidth: '120px' }}
            />
            <Column
              field="cedula"
              header="Cédula"
              sortable
              filter
              filterPlaceholder="Buscar por cédula"
              style={{ minWidth: '120px' }}
            />
            <Column
              field="telefono_primario"
              header="Teléfono Principal"
              sortable
              style={{ minWidth: '150px' }}
            />
            {/* Columna de teléfono secundario oculta del DataGrid */}
            {/* <Column
              field="telefono_secundario"
              header="Teléfono Secundario"
              sortable
              style={{ minWidth: '150px' }}
            /> */}
            <Column
              field="solicitado"
              header="Estado"
              body={solicitadoBodyTemplate}
              style={{ minWidth: '120px' }}
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
            <i className="cil-user me-2" style={{ color: '#001a79' }}></i>
            <span style={{ color: '#001a79', fontWeight: 'bold' }}>
              {selectedVisitante ? 'Editar Visitante' : 'Nuevo Visitante'}
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
                  Nombre *
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
                  placeholder="Nombre del visitante"
                  className={`w-100 ${validationErrors.nombre ? 'p-invalid' : ''}`}
                  required
                />
                {validationErrors.nombre && (
                  <small className="p-error">{validationErrors.nombre}</small>
                )}
              </div>
            </div>
            <div className="col-6 md:col-6">
              <div className="field">
                <label htmlFor="apellido" className="font-semibold block mb-2">
                  Apellido *
                </label>
                <InputText
                  id="apellido"
                  value={formData.apellido}
                  onChange={(e) => {
                    const value = e.target.value
                    // Solo permitir letras y espacios
                    if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) {
                      setFormData({ ...formData, apellido: value })
                      // Limpiar error al escribir
                      if (validationErrors.apellido) {
                        setValidationErrors({ ...validationErrors, apellido: '' })
                      }
                    }
                  }}
                  placeholder="Apellido del visitante"
                  className={`w-100 ${validationErrors.apellido ? 'p-invalid' : ''}`}
                  required
                />
                {validationErrors.apellido && (
                  <small className="p-error">{validationErrors.apellido}</small>
                )}
              </div>
            </div>
            <div className="col-6 md:col-6">
              <div className="field">
                <label htmlFor="cedula" className="font-semibold block mb-2">
                  Cédula *
                </label>
                <InputText
                  id="cedula"
                  value={formData.cedula}
                  onChange={(e) => {
                    const value = e.target.value
                    // Solo permitir números
                    if (/^\d*$/.test(value)) {
                      setFormData({ ...formData, cedula: value })
                      // Limpiar error al escribir
                      if (validationErrors.cedula) {
                        setValidationErrors({ ...validationErrors, cedula: '' })
                      }
                    }
                  }}
                  placeholder="Número de cédula"
                  className={`w-100 ${validationErrors.cedula ? 'p-invalid' : ''}`}
                  maxLength={8}
                  disabled={!!selectedVisitante}
                  required
                />
                {validationErrors.cedula && (
                  <small className="p-error">{validationErrors.cedula}</small>
                )}
                {selectedVisitante && (
                  <small className="p-text-secondary">
                    <i className="pi pi-info-circle me-1"></i>
                    La cédula no se puede modificar porque está vinculada a la foto del visitante
                  </small>
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
            <div className="col-12 md:col-12">
              <div className="field">
                <label htmlFor="foto" className="font-semibold block mb-2">
                  Foto del Visitante
                </label>
                <PhotoCapture
                  ref={photoCaptureRef}
                  onPhotoCapture={handlePhotoCapture}
                  onPhotoUpload={handlePhotoUpload}
                  currentPhoto={formData.foto}
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                  cedula={formData.cedula}
                />
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="mt-4 pt-3" style={{ borderTop: '2px solid #f0f0f0' }}>
            <div className="flex justify-content-center gap-3">
              <Button
                label="Cancelar"
                icon="pi pi-times"
                onClick={() => setVisible(false)}
                className="p-button-outlined p-button-secondary"
                style={{
                  minWidth: '120px',
                  height: '42px',
                  borderRadius: '8px',
                  border: '2px solid #6c757d',
                  color: '#6c757d',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#6c757d'
                  e.currentTarget.style.color = 'white'
                  e.currentTarget.style.borderColor = '#6c757d'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#6c757d'
                  e.currentTarget.style.borderColor = '#6c757d'
                }}
              />
              <Button
                label={selectedVisitante ? 'Actualizar Visitante' : 'Crear Visitante'}
                icon={selectedVisitante ? 'pi pi-check' : 'pi pi-plus'}
                onClick={handleSubmit}
                loading={createMutation.isLoading || updateMutation.isLoading}
                className="p-button"
                style={{
                  minWidth: '180px',
                  height: '42px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                  border: 'none',
                  color: 'white',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #0056b3 0%, #004085 100%)'
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 123, 255, 0.4)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.3)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default Visitantes
