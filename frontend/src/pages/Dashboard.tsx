import React, { useState, useEffect } from 'react'
import { 
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CRow,
  CAlert,
  CSpinner,
  CButton,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'

interface DashboardStats {
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

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const response = await api.getDashboardStats()
      if (response.success) {
        setStats(response.data)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('Error al cargar los datos del dashboard')
      console.error('Error loading dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <CSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <CAlert color="danger" className="d-flex align-items-center">
        <strong>Error:</strong> {error}
      </CAlert>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="mb-4">
        <img
          src="/logo_header.jpg"
          alt="SICONFLOT"
          style={{
            width: '100%',
            maxHeight: '220px',
            objectFit: 'cover',
            borderRadius: '8px',
            border: '1px solid var(--police-blue-light)'
          }}
        />
      </div>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
        <h1 className="h2 mb-0">Dashboard</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <CButton color="primary" onClick={loadDashboardData}>
            <CIcon icon="cil-reload" className="me-2" />
            Actualizar
          </CButton>
        </div>
      </div>

          {/* Estadísticas principales */}
      <CRow className="mb-4">
        <CCol sm={6} lg={3}>
          <CCard className="text-white bg-primary dashboard-card">
            <CCardBody className="pb-0">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{stats?.total_vehiculos || 0}</h4>
                  <p className="mb-0">Total Vehículos</p>
                </div>
                <div className="align-self-center">
                  <CIcon icon="cil-car" size="2xl" style={{ color: 'var(--police-yellow)' }} />
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="text-white bg-success dashboard-card">
            <CCardBody className="pb-0">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{stats?.vehiculos_activos || 0}</h4>
                  <p className="mb-0">Vehículos Activos</p>
                </div>
                <div className="align-self-center">
                  <CIcon icon="cil-speedometer" size="2xl" style={{ color: 'var(--police-yellow)' }} />
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="text-dark bg-warning dashboard-card">
            <CCardBody className="pb-0">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{stats?.mantenimientos_pendientes || 0}</h4>
                  <p className="mb-0">Mantenimientos Pendientes</p>
                </div>
                <div className="align-self-center">
                  <CIcon icon="cil-wrench" size="2xl" style={{ color: 'var(--police-blue)' }} />
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="text-white bg-danger dashboard-card">
            <CCardBody className="pb-0">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{stats?.siniestros_abiertos || 0}</h4>
                  <p className="mb-0">Siniestros Abiertos</p>
                </div>
                <div className="align-self-center">
                  <CIcon icon="cil-warning" size="2xl" style={{ color: 'var(--police-yellow)' }} />
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Estadísticas secundarias */}
      <CRow className="mb-4">
        <CCol sm={6} lg={3}>
          <CCard className="text-white bg-info dashboard-card">
            <CCardBody className="pb-0">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{stats?.total_choferes || 0}</h4>
                  <p className="mb-0">Total Choferes</p>
                </div>
                <div className="align-self-center">
                  <CIcon icon="cil-user" size="2xl" style={{ color: 'var(--police-yellow)' }} />
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="text-white bg-secondary dashboard-card">
            <CCardBody className="pb-0">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{stats?.asignaciones_activas || 0}</h4>
                  <p className="mb-0">Asignaciones Activas</p>
                </div>
                <div className="align-self-center">
                  <CIcon icon="cil-assignment" size="2xl" style={{ color: 'var(--police-yellow)' }} />
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="text-white bg-dark dashboard-card">
            <CCardBody className="pb-0">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{stats?.seguros_por_vencer || 0}</h4>
                  <p className="mb-0">Seguros por Vencer</p>
                </div>
                <div className="align-self-center">
                  <CIcon icon="cil-shield" size="2xl" style={{ color: 'var(--police-yellow)' }} />
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="text-dark bg-light dashboard-card">
            <CCardBody className="pb-0">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{stats?.vehiculos_mantenimiento || 0}</h4>
                  <p className="mb-0">En Mantenimiento</p>
                </div>
                <div className="align-self-center">
                  <CIcon icon="cil-wrench" size="2xl" style={{ color: 'var(--police-blue)' }} />
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Información del usuario */}
      <CRow>
        <CCol>
          <CCard className="border-0 shadow-sm" style={{ 
            background: 'linear-gradient(135deg, var(--police-light) 0%, #ffffff 100%)',
            borderLeft: '4px solid var(--police-blue)'
          }}>
            <CCardHeader style={{ 
              background: 'linear-gradient(90deg, var(--police-blue) 0%, var(--police-blue-light) 100%)',
              color: 'var(--police-white)',
            borderBottom: '2px solid #001a79'
            }}>
              <CCardTitle className="mb-0 d-flex align-items-center">
                <CIcon icon="cil-shield" className="me-2" style={{ color: 'var(--police-blue)' }} />
                Bienvenido al Sistema SICONFLOT
              </CCardTitle>
            </CCardHeader>
            <CCardBody>
              <p className="mb-3">
                Hola <strong style={{ color: 'var(--police-blue)' }}>{user?.nombre} {user?.apellido}</strong>, bienvenido al Sistema de Control de Flota Vehicular SICONFLOT.
              </p>
              <p className="mb-0" style={{ color: 'var(--police-gray-dark)' }}>
                Desde aquí puedes gestionar todos los aspectos de la flota vehicular de la <strong>Policía Municipal de Baruta</strong>.
              </p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default Dashboard