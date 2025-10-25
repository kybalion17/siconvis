import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Visitantes from './pages/Visitantes'
import Departamentos from './pages/Departamentos'
import Visitas from './pages/Visitas'
import Reportes from './pages/Reportes'
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
        <Route path="/visitas" element={<Visitas />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
