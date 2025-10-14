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

// Tipos de vehículo
export interface Vehiculo {
  id: number
  placa: string
  clase_id: number
  marca_id: number
  modelo_id: number
  anio: number
  color_principal_id: number
  color_secundario_id?: number
  transmision_id: number
  numero_chasis?: string
  numero_motor?: string
  kilometraje: number
  peso?: number
  unidad_peso: 'kg' | 'ton'
  numero_asientos?: number
  combustible_id: number
  numero_puestos?: number
  observaciones?: string
  estado: 'activo' | 'inactivo' | 'mantenimiento' | 'siniestrado'
  created_at: string
  updated_at: string
  eliminado: number
}

export interface Marca {
  id: number
  nombre: string
  activa: boolean
}

export interface Modelo {
  id: number
  marca_id: number
  nombre: string
  activo: boolean
}

export interface ClaseVehiculo {
  id: number
  nombre: string
  descripcion: string
}

export interface Color {
  id: number
  nombre: string
  codigo_hex?: string
  activo: boolean
}

export interface TipoCombustible {
  id: number
  nombre: string
}

export interface TipoTransmision {
  id: number
  nombre: string
}

// Tipos de chofer
export interface Chofer {
  id: number
  cedula: string
  nombre: string
  apellido: string
  fecha_nacimiento?: string
  sexo?: 'M' | 'F'
  telefono?: string
  direccion?: string
  numero_licencia?: string
  fecha_vencimiento_licencia?: string
  numero_certificado?: string
  fecha_vencimiento_certificado?: string
  estado: 'activo' | 'inactivo' | 'suspendido'
  created_at: string
  updated_at: string
  eliminado: number
}

// Tipos de asignación
export interface Asignacion {
  id: number
  vehiculo_id: number
  chofer_id?: number
  solicitante: string
  cedula_solicitante: string
  departamento_id?: number
  direccion_id?: number
  fecha_asignacion: string
  fecha_devolucion?: string
  numero_inspeccion?: number
  municipio_id?: number
  parroquia_id?: number
  comuna?: string
  observaciones?: string
  documentos?: string
  estado: 'activa' | 'finalizada' | 'cancelada'
  created_at: string
  updated_at: string
  eliminado: number
}

// Tipos de mantenimiento
export interface Mantenimiento {
  id: number
  vehiculo_id: number
  tipo_mantenimiento_id: number
  taller_id?: number
  kilometraje_actual: number
  orden_trabajo?: string
  fecha_mantenimiento: string
  inspector_cedula?: string
  inspector_nombre?: string
  costo?: number
  descripcion_trabajo?: string
  estado: 'programado' | 'en_proceso' | 'completado' | 'cancelado'
  created_at: string
  updated_at: string
  eliminado: number
}

export interface TipoMantenimiento {
  id: number
  nombre: string
  descripcion?: string
  kilometraje_intervalo?: number
  dias_intervalo?: number
}

export interface Taller {
  id: number
  rif: string
  nombre: string
  telefono?: string
  direccion?: string
  contacto?: string
  email?: string
  especialidad?: string
  activo: boolean
}

// Tipos de seguro
export interface Seguro {
  id: number
  vehiculo_id: number
  aseguradora_id: number
  numero_poliza: string
  fecha_inicio: string
  fecha_vencimiento: string
  cobertura_amplia: number
  cobertura_rcv: number
  cobertura_defensa: number
  cobertura_exceso: number
  cobertura_accidente: number
  cobertura_asistencia: number
  suma_total: number
  prima?: number
  estado: 'activo' | 'vencido' | 'cancelado'
  created_at: string
  updated_at: string
  eliminado: number
}

export interface Aseguradora {
  id: number
  rif: string
  nombre: string
  telefono?: string
  direccion?: string
  contacto?: string
  email?: string
  activa: boolean
}

// Tipos de siniestro
export interface Siniestro {
  id: number
  vehiculo_id: number
  fecha_ocurrencia: string
  estado_id?: number
  municipio_id?: number
  parroquia_id?: number
  tipo_siniestro: 'colision' | 'volcamiento' | 'choque' | 'atropello' | 'otro'
  inspeccion_id?: number
  taller_id?: number
  fecha_tentativa_reparacion?: string
  vehiculo_rueda: boolean
  intervino_transito: boolean
  causa?: string
  danos?: string
  organismo_id?: number
  fecha_denuncia?: string
  numero_denuncia?: string
  costo_reparacion?: number
  estado: 'reportado' | 'en_investigacion' | 'cerrado' | 'archivado'
  created_at: string
  updated_at: string
  eliminado: number
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

export interface VehiculoForm {
  placa: string
  clase_id: number
  marca_id: number
  modelo_id: number
  anio: number
  color_principal_id: number
  color_secundario_id?: number
  transmision_id: number
  numero_chasis?: string
  numero_motor?: string
  kilometraje: number
  peso?: number
  unidad_peso: 'kg' | 'ton'
  numero_asientos?: number
  combustible_id: number
  numero_puestos?: number
  observaciones?: string
  estado: 'activo' | 'inactivo' | 'mantenimiento' | 'siniestrado'
}

export interface ChoferForm {
  cedula: string
  nombre: string
  apellido: string
  fecha_nacimiento?: string
  sexo?: 'M' | 'F'
  telefono?: string
  direccion?: string
  numero_licencia?: string
  fecha_vencimiento_licencia?: string
  numero_certificado?: string
  fecha_vencimiento_certificado?: string
  estado: 'activo' | 'inactivo' | 'suspendido'
}

// Tipos de dashboard
export interface DashboardStats {
  total_vehiculos: number
  vehiculos_activos: number
  vehiculos_mantenimiento: number
  vehiculos_siniestrados: number
  total_choferes: number
  choferes_activos: number
  asignaciones_activas: number
  mantenimientos_pendientes: number
  seguros_por_vencer: number
  siniestros_abiertos: number
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
