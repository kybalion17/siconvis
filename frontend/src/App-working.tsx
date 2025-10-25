import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Visitantes from './pages/Visitantes'
import Departamentos from './pages/Departamentos'
import VisitasWorking from './pages/Visitas-working'
import ReportesWorking from './pages/Reportes-working'
import ConfiguracionWorking from './pages/Configuracion-working'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Login />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/visitantes" element={<Visitantes />} />
        <Route path="/departamentos" element={<Departamentos />} />
        <Route path="/visitas" element={<VisitasWorking />} />
        <Route path="/reportes" element={<ReportesWorking />} />
        <Route path="/configuracion" element={<ConfiguracionWorking />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
