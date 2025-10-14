import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Upload,
  Download,
  Visibility,
  Edit,
  Delete,
  Search,
  FilterList,
  Add,
  Description,
  Image,
  PictureAsPdf,
  InsertDriveFile
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

interface Documento {
  id: number;
  tipo_documento: string;
  entidad_tipo: string;
  entidad_id: number;
  entidad_nombre: string;
  nombre_archivo: string;
  nombre_original: string;
  tipo_mime: string;
  tamano_archivo: number;
  descripcion: string;
  categoria: string;
  etiquetas: string;
  fecha_vencimiento: string;
  estado: string;
  estado_vencimiento: string;
  dias_restantes: number;
  fecha_creacion: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`documentos-tabpanel-${index}`}
      aria-labelledby={`documentos-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Documentos: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [filtros, setFiltros] = useState({
    tipo_documento: '',
    entidad_tipo: '',
    categoria: '',
    estado_vencimiento: '',
    busqueda: ''
  });
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState({
    tipo_documento: '',
    entidad_tipo: '',
    entidad_id: '',
    descripcion: '',
    categoria: '',
    etiquetas: '',
    fecha_vencimiento: ''
  });

  useEffect(() => {
    loadDocumentos();
  }, [filtros]);

  const loadDocumentos = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/documentos?${params.toString()}`);
      setDocumentos(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFiltros(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append('archivo', selectedFile);
      Object.entries(uploadData).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      await api.post('/documentos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploadDialog(false);
      setSelectedFile(null);
      setUploadData({
        tipo_documento: '',
        entidad_tipo: '',
        entidad_id: '',
        descripcion: '',
        categoria: '',
        etiquetas: '',
        fecha_vencimiento: ''
      });
      loadDocumentos();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al subir documento');
    }
  };

  const handleDownload = async (documento: Documento) => {
    try {
      const response = await api.get(`/documentos/${documento.id}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', documento.nombre_original);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      setError('Error al descargar documento');
    }
  };

  const handleView = (documento: Documento) => {
    window.open(`/api/documentos/${documento.id}/view`, '_blank');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este documento?')) return;

    try {
      await api.delete(`/documentos/${id}`);
      loadDocumentos();
    } catch (err: any) {
      setError('Error al eliminar documento');
    }
  };

  const getFileIcon = (tipoMime: string) => {
    if (tipoMime.includes('pdf')) return <PictureAsPdf color="error" />;
    if (tipoMime.includes('image')) return <Image color="primary" />;
    return <InsertDriveFile color="action" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'vencido':
        return 'error';
      case 'por_vencer':
        return 'warning';
      case 'vigente':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestión de Documentos
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Administra y organiza todos los documentos de la flota vehicular
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs de navegación */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="documentos tabs">
          <Tab icon={<Description />} label="Todos los Documentos" />
          <Tab icon={<FilterList />} label="Filtros" />
          <Tab icon={<Search />} label="Búsqueda" />
        </Tabs>
      </Paper>

      {/* Tab Todos los Documentos */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Filtros rápidos */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Filtros Rápidos
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Tipo de Documento</InputLabel>
                      <Select
                        value={filtros.tipo_documento}
                        onChange={(e) => handleFilterChange('tipo_documento', e.target.value)}
                      >
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="licencia">Licencia</MenuItem>
                        <MenuItem value="seguro">Seguro</MenuItem>
                        <MenuItem value="mantenimiento">Mantenimiento</MenuItem>
                        <MenuItem value="siniestro">Siniestro</MenuItem>
                        <MenuItem value="otro">Otro</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Entidad</InputLabel>
                      <Select
                        value={filtros.entidad_tipo}
                        onChange={(e) => handleFilterChange('entidad_tipo', e.target.value)}
                      >
                        <MenuItem value="">Todas</MenuItem>
                        <MenuItem value="vehiculo">Vehículo</MenuItem>
                        <MenuItem value="chofer">Chofer</MenuItem>
                        <MenuItem value="asignacion">Asignación</MenuItem>
                        <MenuItem value="mantenimiento">Mantenimiento</MenuItem>
                        <MenuItem value="seguro">Seguro</MenuItem>
                        <MenuItem value="siniestro">Siniestro</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Estado de Vencimiento</InputLabel>
                      <Select
                        value={filtros.estado_vencimiento}
                        onChange={(e) => handleFilterChange('estado_vencimiento', e.target.value)}
                      >
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="vencido">Vencido</MenuItem>
                        <MenuItem value="por_vencer">Por Vencer</MenuItem>
                        <MenuItem value="vigente">Vigente</MenuItem>
                        <MenuItem value="sin_vencimiento">Sin Vencimiento</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="outlined"
                      startIcon={<FilterList />}
                      onClick={loadDocumentos}
                      fullWidth
                    >
                      Aplicar Filtros
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Lista de documentos */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Documentos ({documentos.length})
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Archivo</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Entidad</TableCell>
                        <TableCell>Tamaño</TableCell>
                        <TableCell>Vencimiento</TableCell>
                        <TableCell>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {documentos.map((documento) => (
                        <TableRow key={documento.id}>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              {getFileIcon(documento.tipo_mime)}
                              <Box ml={1}>
                                <Typography variant="body2" fontWeight="medium">
                                  {documento.nombre_original}
                                </Typography>
                                {documento.descripcion && (
                                  <Typography variant="caption" color="textSecondary">
                                    {documento.descripcion}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={documento.tipo_documento} 
                              size="small" 
                              color="primary" 
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {documento.entidad_nombre}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {documento.entidad_tipo}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatFileSize(documento.tamano_archivo)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {documento.fecha_vencimiento ? (
                              <Chip
                                label={documento.estado_vencimiento}
                                size="small"
                                color={getEstadoColor(documento.estado_vencimiento) as any}
                              />
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                Sin vencimiento
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <Tooltip title="Ver">
                                <IconButton
                                  size="small"
                                  onClick={() => handleView(documento)}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Descargar">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDownload(documento)}
                                >
                                  <Download />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Eliminar">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDelete(documento.id)}
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab Filtros */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Filtros Avanzados
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Utiliza los filtros para encontrar documentos específicos
            </Typography>
          </Grid>
          {/* Aquí se pueden agregar más filtros específicos */}
        </Grid>
      </TabPanel>

      {/* Tab Búsqueda */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Búsqueda de Documentos
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Busca documentos por nombre, descripción o etiquetas
            </Typography>
          </Grid>
          {/* Aquí se puede agregar la funcionalidad de búsqueda */}
        </Grid>
      </TabPanel>

      {/* Botón flotante para subir archivos */}
      <Fab
        color="primary"
        aria-label="subir documento"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => setUploadDialog(true)}
      >
        <Upload />
      </Fab>

      {/* Dialog para subir archivos */}
      <Dialog
        open={uploadDialog}
        onClose={() => setUploadDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Subir Nuevo Documento</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<Upload />}
                fullWidth
              >
                Seleccionar Archivo
                <input
                  type="file"
                  hidden
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
                />
              </Button>
              {selectedFile && (
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Archivo seleccionado: {selectedFile.name}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Documento</InputLabel>
                <Select
                  value={uploadData.tipo_documento}
                  onChange={(e) => setUploadData(prev => ({ ...prev, tipo_documento: e.target.value }))}
                >
                  <MenuItem value="licencia">Licencia</MenuItem>
                  <MenuItem value="seguro">Seguro</MenuItem>
                  <MenuItem value="mantenimiento">Mantenimiento</MenuItem>
                  <MenuItem value="siniestro">Siniestro</MenuItem>
                  <MenuItem value="otro">Otro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Entidad</InputLabel>
                <Select
                  value={uploadData.entidad_tipo}
                  onChange={(e) => setUploadData(prev => ({ ...prev, entidad_tipo: e.target.value }))}
                >
                  <MenuItem value="vehiculo">Vehículo</MenuItem>
                  <MenuItem value="chofer">Chofer</MenuItem>
                  <MenuItem value="asignacion">Asignación</MenuItem>
                  <MenuItem value="mantenimiento">Mantenimiento</MenuItem>
                  <MenuItem value="seguro">Seguro</MenuItem>
                  <MenuItem value="siniestro">Siniestro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={3}
                value={uploadData.descripcion}
                onChange={(e) => setUploadData(prev => ({ ...prev, descripcion: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Categoría"
                value={uploadData.categoria}
                onChange={(e) => setUploadData(prev => ({ ...prev, categoria: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Etiquetas (separadas por comas)"
                value={uploadData.etiquetas}
                onChange={(e) => setUploadData(prev => ({ ...prev, etiquetas: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Fecha de Vencimiento"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={uploadData.fecha_vencimiento}
                onChange={(e) => setUploadData(prev => ({ ...prev, fecha_vencimiento: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleUpload} 
            variant="contained"
            disabled={!selectedFile || !uploadData.tipo_documento || !uploadData.entidad_tipo}
          >
            Subir
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Documentos;
