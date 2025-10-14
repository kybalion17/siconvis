import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Vehiculos from './pages/Vehiculos'
import Choferes from './pages/Choferes'
import Asignaciones from './pages/Asignaciones'
import Mantenimientos from './pages/Mantenimientos'
import Seguros from './pages/Seguros'
import Siniestros from './pages/Siniestros'
import Documentos from './pages/Documentos'
import Maestros from './pages/Maestros'
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
        <Route path="/vehiculos" element={<Vehiculos />} />
        <Route path="/choferes" element={<Choferes />} />
        <Route path="/asignaciones" element={<Asignaciones />} />
        <Route path="/mantenimientos" element={<Mantenimientos />} />
        <Route path="/seguros" element={<Seguros />} />
        <Route path="/siniestros" element={<Siniestros />} />
        <Route path="/documentos" element={<Documentos />} />
        <Route path="/maestros" element={<Maestros />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
