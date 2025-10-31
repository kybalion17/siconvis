import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { User } from '../types'
import api from '../services/api'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (login: string, password: string) => Promise<boolean>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar localStorage inmediatamente
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      }
    }
    
    // Terminar loading inmediatamente
    setLoading(false)
  }, [])

  const login = async (login: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      console.log('Intentando conectar con:', import.meta.env.VITE_API_URL)
      console.log('Credenciales:', { login, password: '***' })
      
      const response = await api.login(login, password)
      console.log('Respuesta del servidor:', response)

      if (response.success) {
        const { user: userData, token } = response.data
        
        // Almacenar token y usuario
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        
        setUser(userData)
        toast.success('Inicio de sesión exitoso')
        return true
      } else {
        console.error('Error del servidor:', response.message)
        toast.error(response.message || 'Error al iniciar sesión')
        return false
      }
    } catch (error: any) {
      console.error('Error completo en login:', error)
      console.error('Error response:', error.response)
      console.error('Error message:', error.message)
      console.error('Error code:', error.code)
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        const apiUrl = import.meta.env.VITE_API_URL || 'API_URL_NO_CONFIGURADO'
        toast.error(`No se puede conectar con el servidor (${apiUrl}). Verifique que el backend esté en ejecución y la variable VITE_API_URL esté configurada.`)
      } else if (error.response?.status === 404) {
        toast.error('Endpoint no encontrado. Verifique la configuración del backend.')
      } else if (error.response?.status === 500) {
        toast.error('Error interno del servidor. Verifique los logs del backend.')
      } else {
        toast.error(`Error de conexión: ${error.message || 'Intente nuevamente.'}`)
      }
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    // Limpiar almacenamiento local
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Limpiar estado
    setUser(null)
    
    // Llamar al endpoint de logout (opcional)
    api.logout().catch(() => {
      // Ignorar errores en logout
    })
    
    toast.success('Sesión cerrada')
  }

  const refreshUser = async () => {
    try {
      const response = await api.getCurrentUser()
      if (response.success) {
        setUser(response.data)
        localStorage.setItem('user', JSON.stringify(response.data))
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default useAuth
