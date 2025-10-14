import React from 'react'
import { Box, Typography, Paper } from '@mui/material'

const Mantenimientos: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestión de Mantenimientos
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Módulo de gestión de mantenimientos en desarrollo...
        </Typography>
      </Paper>
    </Box>
  )
}

export default Mantenimientos
