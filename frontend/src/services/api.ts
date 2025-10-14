import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { ApiResponse, PaginatedResponse } from '../types'

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Interceptor para agregar token de autenticación
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        console.log('API Request:', {
          url: config.url,
          method: config.method,
          token: token ? 'Presente' : 'Ausente',
          tokenValue: token ? token.substring(0, 20) + '...' : null
        })
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Interceptor para manejar respuestas
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log('API Response:', {
          url: response.config.url,
          status: response.status,
          data: response.data
        })
        return response
      },
      (error) => {
        console.log('API Error:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        })
        if (error.response?.status === 401) {
          // Token expirado o inválido
          console.log('Token expirado o inválido, redirigiendo al login')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Métodos genéricos
  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.api.get(url, { params })
    return response.data
  }

  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.api.post(url, data)
    return response.data
  }

  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.api.put(url, data)
    return response.data
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    const response = await this.api.delete(url)
    return response.data
  }

  // Métodos paginados
  async getPaginated<T = any>(
    url: string,
    page: number = 1,
    perPage: number = 10,
    params?: any
  ): Promise<PaginatedResponse<T>> {
    const response = await this.api.get(url, {
      params: {
        page,
        per_page: perPage,
        ...params,
      },
    })
    return response.data
  }

  // Métodos específicos de autenticación
  async login(login: string, password: string) {
    return this.post('/auth/login', { login, password })
  }

  async logout() {
    return this.post('/auth/logout')
  }

  async getCurrentUser() {
    return this.get('/auth/me')
  }

  async refreshToken() {
    return this.post('/auth/refresh')
  }

  // Métodos de vehículos
  async getVehiculos(page: number = 1, perPage: number = 10, filters?: any) {
    return this.getPaginated('/vehiculos', page, perPage, filters)
  }

  async getVehiculo(id: number) {
    return this.get(`/vehiculos/${id}`)
  }

  async createVehiculo(data: any) {
    return this.post('/vehiculos', data)
  }

  async updateVehiculo(id: number, data: any) {
    return this.put(`/vehiculos/${id}`, data)
  }

  async deleteVehiculo(id: number) {
    return this.delete(`/vehiculos/${id}`)
  }

  // Métodos de choferes
  async getChoferes(page: number = 1, perPage: number = 10, filters?: any) {
    return this.getPaginated('/choferes', page, perPage, filters)
  }

  async getChofer(id: number) {
    return this.get(`/choferes/${id}`)
  }

  async createChofer(data: any) {
    return this.post('/choferes', data)
  }

  async updateChofer(id: number, data: any) {
    return this.put(`/choferes/${id}`, data)
  }

  async deleteChofer(id: number) {
    return this.delete(`/choferes/${id}`)
  }

  // Métodos de asignaciones
  async getAsignaciones(page: number = 1, perPage: number = 10, filters?: any) {
    return this.getPaginated('/asignaciones', page, perPage, filters)
  }

  async getAsignacion(id: number) {
    return this.get(`/asignaciones/${id}`)
  }

  async createAsignacion(data: any) {
    return this.post('/asignaciones', data)
  }

  async updateAsignacion(id: number, data: any) {
    return this.put(`/asignaciones/${id}`, data)
  }

  async deleteAsignacion(id: number) {
    return this.delete(`/asignaciones/${id}`)
  }

  // Métodos de mantenimientos
  async getMantenimientos(page: number = 1, perPage: number = 10, filters?: any) {
    return this.getPaginated('/mantenimientos', page, perPage, filters)
  }

  async getMantenimiento(id: number) {
    return this.get(`/mantenimientos/${id}`)
  }

  async createMantenimiento(data: any) {
    return this.post('/mantenimientos', data)
  }

  async updateMantenimiento(id: number, data: any) {
    return this.put(`/mantenimientos/${id}`, data)
  }

  async deleteMantenimiento(id: number) {
    return this.delete(`/mantenimientos/${id}`)
  }

  // Métodos de seguros
  async getSeguros(page: number = 1, perPage: number = 10, filters?: any) {
    return this.getPaginated('/seguros', page, perPage, filters)
  }

  async getSeguro(id: number) {
    return this.get(`/seguros/${id}`)
  }

  async createSeguro(data: any) {
    return this.post('/seguros', data)
  }

  async updateSeguro(id: number, data: any) {
    return this.put(`/seguros/${id}`, data)
  }

  async deleteSeguro(id: number) {
    return this.delete(`/seguros/${id}`)
  }

  // Métodos de siniestros
  async getSiniestros(page: number = 1, perPage: number = 10, filters?: any) {
    return this.getPaginated('/siniestros', page, perPage, filters)
  }

  async getSiniestro(id: number) {
    return this.get(`/siniestros/${id}`)
  }

  async createSiniestro(data: any) {
    return this.post('/siniestros', data)
  }

  async updateSiniestro(id: number, data: any) {
    return this.put(`/siniestros/${id}`, data)
  }

  async deleteSiniestro(id: number) {
    return this.delete(`/siniestros/${id}`)
  }

  // Métodos de dashboard
  async getDashboardStats() {
    return this.get('/dashboard/stats')
  }

  async getDashboardReports() {
    return this.get('/dashboard/reports')
  }

  // Métodos de maestros
  async getClases() {
    return this.get('/maestros/clases')
  }

  async getMarcas() {
    return this.get('/maestros/marcas')
  }

  async getModelos(marcaId?: number) {
    return this.get('/maestros/modelos', { marca_id: marcaId })
  }

  async getColores() {
    return this.get('/maestros/colores')
  }

  async getCombustibles() {
    return this.get('/maestros/combustibles')
  }

  async getTransmisiones() {
    return this.get('/maestros/transmisiones')
  }

  async getAsientos() {
    return this.get('/maestros/asientos')
  }

  async getUnidadesPeso() {
    return this.get('/maestros/unidadesPeso')
  }

  async getOrganismos() {
    return this.get('/maestros/organismos')
  }

  async getTalleres() {
    return this.get('/maestros/talleres')
  }

  async getAseguradoras() {
    return this.get('/maestros/aseguradoras')
  }

  async getTiposMantenimiento() {
    return this.get('/maestros/tiposMantenimiento')
  }

  async getSexos() {
    return this.get('/maestros/sexos')
  }

  async getLicencias() {
    return this.get('/maestros/licencias')
  }

  async getPerfiles() {
    return this.get('/maestros/perfiles')
  }

  // Métodos de documentos
  async getDocumentos(page: number = 1, perPage: number = 10, filters?: any) {
    return this.getPaginated('/documentos', page, perPage, filters)
  }

  async getDocumento(id: number) {
    return this.get(`/documentos/${id}`)
  }

  async createDocumento(data: any) {
    const form = new FormData()
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        form.append(key, data[key])
      }
    })
    // Nota: axios establecerá 'multipart/form-data' automáticamente con FormData
    const response = await this.api.post('/documentos', form)
    return response.data
  }

  async updateDocumento(id: number, data: any) {
    return this.put(`/documentos/${id}`, data)
  }

  async deleteDocumento(id: number) {
    return this.delete(`/documentos/${id}`)
  }

  async downloadDocumento(id: number) {
    const response = await this.api.get(`/documentos/${id}/download`, { responseType: 'blob' })
    return response.data
  }

  async viewDocumento(id: number) {
    const response = await this.api.get(`/documentos/${id}/view`, { responseType: 'blob' })
    return response.data
  }

  async getDocumentosPorEntidad(entidadTipo: string, entidadId: number) {
    return this.get(`/documentos/entidad/${entidadTipo}/${entidadId}`)
  }

  async getDocumentosPorVencer(dias: number = 30) {
    return this.get('/documentos/por-vencer', { dias })
  }

  async getDocumentosVencidos() {
    return this.get('/documentos/vencidos')
  }

  async buscarDocumentos(q: string) {
    return this.get('/documentos/buscar', { q })
  }

  async getDocumentosPorCategoria(categoria: string) {
    return this.get(`/documentos/categoria/${categoria}`)
  }

  async getDocumentosRecientes(limit: number = 10) {
    return this.get('/documentos/recientes', { limit })
  }

  async getDocumentosInfo() {
    return this.get('/documentos/info')
  }

  // Métodos CRUD para tablas maestras
  async getMaestroItems(table: string, page: number = 1, perPage: number = 10, filters?: any) {
    return this.getPaginated(`/maestro/${table}`, page, perPage, filters)
  }

  async getMaestroItem(table: string, id: number) {
    return this.get(`/maestro/${table}/${id}`)
  }

  async createMaestroItem(table: string, data: any) {
    return this.post(`/maestro/${table}`, data)
  }

  async updateMaestroItem(table: string, id: number, data: any) {
    return this.put(`/maestro/${table}/${id}`, data)
  }

  async deleteMaestroItem(table: string, id: number) {
    return this.delete(`/maestro/${table}/${id}`)
  }

  async getMaestroOptions(table: string) {
    return this.get(`/maestro/${table}/options`)
  }

  async getMaestroStats(table: string) {
    return this.get(`/maestro/${table}/stats`)
  }
}

export default new ApiService()
