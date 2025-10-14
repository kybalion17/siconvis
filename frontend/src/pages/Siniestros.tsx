import React from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import { Select, MenuItem, InputLabel, FormControl } from '@mui/material'
import { useEffect } from 'react'
import { useQuery } from 'react-query'
import api from '../services/api'

interface Siniestro {
  id: number
  vehiculo: number
  fecha_siniestro: string
  tipo_siniestro: string
  taller?: number
  monto?: number
  estado: string
}

const Siniestros: React.FC = () => {
  const page = 1
  const perPage = 10

  const { data, isLoading, error } = useQuery(
    ['siniestros', page, perPage],
    () => api.getSiniestros(page, perPage),
    { keepPreviousData: true }
  )

  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Siniestro | null>(null)
  const [form, setForm] = React.useState({
    vehiculo: '',
    fecha_siniestro: '',
    tipo_siniestro: '',
    taller: '',
    monto: '',
    estado: 'reportado'
  })

  const [vehiculosOpt, setVehiculosOpt] = React.useState<Array<{ id: number; placa: string }>>([])
  const [talleresOpt, setTalleresOpt] = React.useState<Array<{ id: number; nombre: string }>>([])

  useEffect(() => {
    const loadOpts = async () => {
      try {
        const veh = await api.getPaginated('/vehiculos', 1, 100)
        setVehiculosOpt((veh as any).data || [])
      } catch {}
      try {
        const tal = await api.getTalleres()
        setTalleresOpt((tal as any).data || [])
      } catch {}
    }
    if (open) loadOpts()
  }, [open])

  const reload = () => window.location.reload()

  const handleOpenNew = () => {
    setEditing(null)
    setForm({ vehiculo: '', fecha_siniestro: '', tipo_siniestro: '', taller: '', monto: '', estado: 'reportado' })
    setOpen(true)
  }

  const handleEdit = (s: Siniestro) => {
    setEditing(s)
    setForm({
      vehiculo: String(s.vehiculo || ''),
      fecha_siniestro: s.fecha_siniestro || '',
      tipo_siniestro: s.tipo_siniestro || '',
      taller: s.taller ? String(s.taller) : '',
      monto: s.monto != null ? String(s.monto) : '',
      estado: s.estado || 'reportado'
    })
    setOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar siniestro?')) return
    await api.deleteSiniestro(id)
    reload()
  }

  const handleSubmit = async () => {
    const payload = {
      vehiculo: Number(form.vehiculo),
      fecha_siniestro: form.fecha_siniestro,
      tipo_siniestro: form.tipo_siniestro,
      taller: form.taller ? Number(form.taller) : undefined,
      monto: form.monto ? Number(form.monto) : undefined,
      estado: form.estado
    }
    if (editing) {
      await api.updateSiniestro(editing.id, payload)
    } else {
      await api.createSiniestro(payload)
    }
    setOpen(false)
    reload()
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    const e: any = error
    return (
      <Box p={3}>
        <Alert severity="error">Error al cargar los siniestros: {e.message}</Alert>
      </Box>
    )
  }

  const siniestros: Siniestro[] = data?.data || []

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestión de Siniestros
      </Typography>

      <Box display="flex" justifyContent="flex-end" mb={1}>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenNew}>Nuevo Siniestro</Button>
      </Box>

      <Paper sx={{ mt: 1 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vehículo</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Taller</TableCell>
                <TableCell>Monto</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {siniestros.map((s: Siniestro) => (
                <TableRow key={s.id}>
                  <TableCell>#{s.vehiculo}</TableCell>
                  <TableCell>{s.fecha_siniestro}</TableCell>
                  <TableCell>{s.tipo_siniestro}</TableCell>
                  <TableCell>{s.taller ? `#${s.taller}` : '-'}</TableCell>
                  <TableCell>{s.monto ?? '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={s.estado}
                      color={s.estado === 'reportado' ? 'warning' : s.estado === 'cerrado' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEdit(s)}><Edit /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(s.id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Editar Siniestro' : 'Nuevo Siniestro'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Vehículo</InputLabel>
                <Select
                  label="Vehículo"
                  value={form.vehiculo}
                  onChange={(e) => setForm({ ...form, vehiculo: String(e.target.value) })}
                >
                  {vehiculosOpt.map(v => (
                    <MenuItem key={v.id} value={v.id}>{v.placa} (#{v.id})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="date" InputLabelProps={{ shrink: true }} label="Fecha" value={form.fecha_siniestro} onChange={(e) => setForm({ ...form, fecha_siniestro: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Tipo" value={form.tipo_siniestro} onChange={(e) => setForm({ ...form, tipo_siniestro: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Taller</InputLabel>
                <Select
                  label="Taller"
                  value={form.taller}
                  onChange={(e) => setForm({ ...form, taller: String(e.target.value) })}
                >
                  {talleresOpt.map(t => (
                    <MenuItem key={t.id} value={t.id}>{t.nombre} (#{t.id})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Monto" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Estado" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>{editing ? 'Actualizar' : 'Crear'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Siniestros
