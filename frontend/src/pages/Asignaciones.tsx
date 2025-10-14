import React from 'react'
import { Box, Typography, Paper } from '@mui/material'

const Asignaciones: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestión de Asignaciones
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Módulo de gestión de asignaciones en desarrollo...
        </Typography>
      </Paper>
    </Box>
  )
}

export default Asignaciones
