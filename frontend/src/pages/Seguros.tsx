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

interface Seguro {
  id: number
  numero_poliza: string
  vehiculo: number
  aseguradora: number
  fecha_inicio: string
  fecha_vencimiento: string
  prima?: number
  estado: string
}

const Seguros: React.FC = () => {
  const page = 1
  const perPage = 10

  const { data, isLoading, error } = useQuery(
    ['seguros', page, perPage],
    () => api.getSeguros(page, perPage),
    { keepPreviousData: true }
  )

  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Seguro | null>(null)
  const [form, setForm] = React.useState({
    numero_poliza: '',
    vehiculo: '',
    aseguradora: '',
    fecha_inicio: '',
    fecha_vencimiento: '',
    prima: '',
    estado: 'activo'
  })

  const [vehiculosOpt, setVehiculosOpt] = React.useState<Array<{ id: number; placa: string }>>([])
  const [aseguradorasOpt, setAseguradorasOpt] = React.useState<Array<{ id: number; nombre: string }>>([])

  useEffect(() => {
    const loadOpts = async () => {
      try {
        const veh = await api.getPaginated('/vehiculos', 1, 100)
        setVehiculosOpt((veh as any).data || [])
      } catch {}
      try {
        const ase = await api.getAseguradoras()
        setAseguradorasOpt((ase as any).data || [])
      } catch {}
    }
    if (open) loadOpts()
  }, [open])

  const reload = () => {
    // Fuerza refetch con invalidate by key; react-query simple trick:
    // Aquí, por simplicidad, recargamos la página
    window.location.reload()
  }

  const handleOpenNew = () => {
    setEditing(null)
    setForm({ numero_poliza: '', vehiculo: '', aseguradora: '', fecha_inicio: '', fecha_vencimiento: '', prima: '', estado: 'activo' })
    setOpen(true)
  }

  const handleEdit = (s: Seguro) => {
    setEditing(s)
    setForm({
      numero_poliza: s.numero_poliza || '',
      vehiculo: String(s.vehiculo || ''),
      aseguradora: String(s.aseguradora || ''),
      fecha_inicio: s.fecha_inicio || '',
      fecha_vencimiento: s.fecha_vencimiento || '',
      prima: s.prima != null ? String(s.prima) : '',
      estado: s.estado || 'activo'
    })
    setOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar seguro?')) return
    await api.deleteSeguro(id)
    reload()
  }

  const handleSubmit = async () => {
    const payload = {
      numero_poliza: form.numero_poliza,
      vehiculo: Number(form.vehiculo),
      aseguradora: Number(form.aseguradora),
      fecha_inicio: form.fecha_inicio,
      fecha_vencimiento: form.fecha_vencimiento,
      prima: form.prima ? Number(form.prima) : undefined,
      estado: form.estado
    }
    if (editing) {
      await api.updateSeguro(editing.id, payload)
    } else {
      await api.createSeguro(payload)
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
        <Alert severity="error">Error al cargar los seguros: {e.message}</Alert>
      </Box>
    )
  }

  const seguros: Seguro[] = data?.data || []

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestión de Seguros
      </Typography>

      <Box display="flex" justifyContent="flex-end" mb={1}>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenNew}>Nuevo Seguro</Button>
      </Box>

      <Paper sx={{ mt: 1 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>N° Póliza</TableCell>
                <TableCell>Vehículo</TableCell>
                <TableCell>Aseguradora</TableCell>
                <TableCell>Fecha Inicio</TableCell>
                <TableCell>Fecha Venc.</TableCell>
                <TableCell>Prima</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {seguros.map((s: Seguro) => (
                <TableRow key={s.id}>
                  <TableCell>{s.numero_poliza}</TableCell>
                  <TableCell>#{s.vehiculo}</TableCell>
                  <TableCell>#{s.aseguradora}</TableCell>
                  <TableCell>{s.fecha_inicio}</TableCell>
                  <TableCell>{s.fecha_vencimiento}</TableCell>
                  <TableCell>{s.prima ?? '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={s.estado}
                      color={s.estado === 'activo' ? 'success' : s.estado === 'vencido' ? 'error' : 'default'}
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
        <DialogTitle>{editing ? 'Editar Seguro' : 'Nuevo Seguro'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="N° Póliza" value={form.numero_poliza} onChange={(e) => setForm({ ...form, numero_poliza: e.target.value })} />
            </Grid>
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
              <FormControl fullWidth>
                <InputLabel>Aseguradora</InputLabel>
                <Select
                  label="Aseguradora"
                  value={form.aseguradora}
                  onChange={(e) => setForm({ ...form, aseguradora: String(e.target.value) })}
                >
                  {aseguradorasOpt.map(a => (
                    <MenuItem key={a.id} value={a.id}>{a.nombre} (#{a.id})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="date" InputLabelProps={{ shrink: true }} label="Fecha Inicio" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="date" InputLabelProps={{ shrink: true }} label="Fecha Vencimiento" value={form.fecha_vencimiento} onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Prima" value={form.prima} onChange={(e) => setForm({ ...form, prima: e.target.value })} />
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

export default Seguros
