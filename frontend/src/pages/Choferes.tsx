import React from 'react'
import { Box, Typography, Paper } from '@mui/material'

const Choferes: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestión de Choferes
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Módulo de gestión de choferes en desarrollo...
        </Typography>
      </Paper>
    </Box>
  )
}

export default Choferes
