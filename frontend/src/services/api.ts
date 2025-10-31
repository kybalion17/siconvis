import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { ApiResponse, PaginatedResponse } from '../types'

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: (import.meta as any).env?.VITE_API_URL,
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

  // Métodos de visitantes
  async getVisitantes(page: number = 1, perPage: number = 10, filters?: any) {
    return this.getPaginated('/visitantes', page, perPage, filters)
  }

  async getVisitante(id: number) {
    return this.get(`/visitantes/${id}`)
  }

  async createVisitante(data: any) {
    return this.post('/visitantes', data)
  }

  async updateVisitante(id: number, data: any) {
    return this.put(`/visitantes/${id}`, data)
  }

  async deleteVisitante(id: number) {
    return this.delete(`/visitantes/${id}`)
  }

  async getVisitanteByCedula(cedula: string) {
    return this.get('/visitantes/cedula', { cedula })
  }

  async getVisitantesSolicitados() {
    return this.get('/visitantes/solicitados')
  }

  async marcarVisitanteSolicitado(id: number) {
    return this.post(`/visitantes/${id}/marcarSolicitadoConGuion`)
  }

  async desmarcarVisitanteSolicitado(id: number) {
    return this.post(`/visitantes/${id}/desmarcarSolicitadoConGuion`)
  }

  async getVisitantesStats() {
    return this.get('/visitantes/stats')
  }

  // Métodos de departamentos
  async getDepartamentos(page: number = 1, perPage: number = 10, filters?: any) {
    return this.getPaginated('/departamentos', page, perPage, filters)
  }

  async getDepartamento(id: number) {
    return this.get(`/departamentos/${id}`)
  }

  async createDepartamento(data: any) {
    return this.post('/departamentos', data)
  }

  async updateDepartamento(id: number, data: any) {
    return this.put(`/departamentos/${id}`, data)
  }

  async deleteDepartamento(id: number) {
    return this.delete(`/departamentos/${id}`)
  }

  async getDepartamentosActivos() {
    return this.get('/departamentos/activos')
  }

  async activarDepartamento(id: number) {
    return this.post(`/departamentos/${id}/activar`)
  }

  async desactivarDepartamento(id: number) {
    return this.post(`/departamentos/${id}/desactivar`)
  }

  async getDepartamentosStats() {
    return this.get('/departamentos/stats')
  }

  async getDepartamentosMasVisitados(limit: number = 5) {
    return this.get('/departamentos/mas-visitados', { limit })
  }

        // Métodos de visitas
        async getVisitas(page: number = 1, perPage: number = 10, filters?: any) {
          return this.getPaginated('/visitas', page, perPage, filters)
        }

        async getVisita(id: number) {
          return this.get(`/visitas/${id}`)
        }

        async createVisita(data: any) {
          return this.post('/visitas', data)
        }

        async updateVisita(id: number, data: any) {
          return this.put(`/visitas/${id}`, data)
        }

        async deleteVisita(id: number) {
          return this.delete(`/visitas/${id}`)
        }

        async finalizarVisita(id: number, observaciones?: string) {
          return this.post(`/visitas/finalizar/${id}`, { observaciones })
        }

        async cancelarVisita(id: number, observaciones?: string) {
          return this.post(`/visitas/cancelar?id=${id}`, { observaciones })
        }

        // Reportes
        async generarReporte(data: {
          fecha_inicio: string
          fecha_fin: string
          tipo_reporte: string
          departamento_id?: number
        }) {
          return this.post('/reportes/generar', data)
        }

        async getVisitasActivas() {
          return this.get('/visitas/activas')
        }

        async getVisitasHoy() {
          return this.get('/visitas/hoy')
        }

        async getVisitasStats(filters?: any) {
          return this.get('/visitas/stats', { params: filters })
        }

        // Métodos de configuración
        async getConfiguraciones() {
          return this.get('/configuracion')
        }

        async getConfiguracion(id: number) {
          return this.get(`/configuracion/${id}`)
        }

        async createConfiguracion(data: any) {
          return this.post('/configuracion', data)
        }

        async updateConfiguracion(id: number, data: any) {
          return this.put(`/configuracion/${id}`, data)
        }

        async deleteConfiguracion(id: number) {
          return this.delete(`/configuracion/${id}`)
        }

        // Métodos de dashboard
        async getDashboardStats() {
          return this.get('/dashboard/stats')
        }

        async getDashboardReports(filters?: any) {
          return this.get('/dashboard/reports', { params: filters })
        }

  // Métodos de maestros (solo los necesarios para el sistema de visitas)
  async getPerfiles() {
    return this.get('/maestros/perfiles')
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

  // Métodos de upload de archivos
    async uploadVisitorPhoto(file: File, customName?: string) {
        const formData = new FormData()
        formData.append('photo', file)
        if (customName) {
            formData.append('custom_name', customName)
        }
        
        const response = await this.api.post('/upload/uploadVisitorPhoto', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    }

  async uploadImage(file: File, subfolder: string = 'general') {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('subfolder', subfolder)
    
    const response = await this.api.post('/upload/uploadImage', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async deleteFile(filename: string, subfolder: string = 'general') {
    return this.post('/upload/deleteFile', { filename, subfolder })
  }

  async getFileInfo(filename: string, subfolder: string = 'general') {
    return this.get('/upload/getFileInfo', { filename, subfolder })
  }
}

export default new ApiService()