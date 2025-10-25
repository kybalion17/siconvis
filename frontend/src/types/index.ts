// Tipos de usuario
export interface User {
  id: number
  nombre: string
  apellido: string
  cedula: string
  login: string
  perfil: number
  primer_ingreso: number
  status: number
  cuenta: number
  created_at: string
  updated_at: string
}

export interface Perfil {
  id: number
  nombre: string
  descripcion: string
  permisos: Record<string, any>
}

// Tipos de respuesta de API
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  code: number
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T = any> {
  success: boolean
  message: string
  data: T[]
  pagination: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

// Tipos de formularios
export interface LoginForm {
  login: string
  password: string
}

// Tipos de visitante
export interface Visitante {
  id: number
  nombre: string
  apellido: string
  cedula: string
  telefono_primario: string
  telefono_secundario: string
  foto: string
  solicitado: number
  eliminado: number
  created_at: string
  updated_at: string
}

// Tipos de departamento
export interface Departamento {
  id: number
  nombre: string
  responsable: string
  telefono_primario: string
  telefono_secundario: string
  status: number
  eliminado: number
  created_at: string
  updated_at: string
}

// Tipos de visita
export interface Visita {
  id: number
  visitante_id: number
  departamento_id: number
  motivo_visita: string
  fecha_entrada: string
  fecha_salida?: string
  estado: 'activa' | 'finalizada' | 'cancelada'
  observaciones?: string
  eliminado: number
  created_at: string
  updated_at: string
}

// Tipos de relación visitante-departamento
export interface VisitanteDepartamento {
  id: number
  visitantes_id: number
  departamentos_id: number
  motivo_visita: string
  created_at: string
  updated_at: string
}

// Tipos de documento de visitante
export interface DocumentoVisitante {
  id: number
  visitante_id: number
  tipo_documento: string
  numero_documento?: string
  fecha_emision?: string
  fecha_vencimiento?: string
  archivo_ruta?: string
  observaciones?: string
  estado: 'activo' | 'vencido' | 'inactivo'
  eliminado: number
  created_at: string
  updated_at: string
}

// Tipos de historial de visitas
export interface HistorialVisita {
  id: number
  visitante_id: number
  departamento_id: number
  motivo_visita: string
  fecha_entrada: string
  fecha_salida?: string
  duracion_minutos: number
  observaciones?: string
  estado_final: 'completada' | 'cancelada' | 'abandonada'
  created_at: string
}

// Tipos de configuración del sistema
export interface Configuracion {
  id: number
  clave: string
  valor: string
  descripcion?: string
  tipo: 'string' | 'number' | 'boolean' | 'json'
  activo: boolean
  created_at: string
  updated_at: string
}

// Tipos de dashboard
export interface DashboardStats {
  total_visitantes: number
  visitantes_solicitados: number
  visitantes_hoy: number
  visitantes_pendientes: number
  total_departamentos: number
  departamentos_activos: number
  departamentos_inactivos: number
  visitas_activas: number
  visitas_hoy: number
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }[]
}

// Tipos de formularios específicos
export interface VisitanteForm {
  nombre: string
  apellido: string
  cedula: string
  telefono_primario: string
  telefono_secundario: string
  foto?: string
  solicitado?: number
}

export interface DepartamentoForm {
  nombre: string
  responsable: string
  telefono_primario: string
  telefono_secundario: string
  status?: number
}

export interface VisitaForm {
  visitantes_id: number
  departamentos_id: number
  motivo_visita: string
}