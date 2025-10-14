import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  Warning, 
  Error, 
  Info, 
  CheckCircle,
  ArrowForward
} from '@mui/icons-material';

interface Alert {
  tipo: 'warning' | 'error' | 'info' | 'success';
  titulo: string;
  mensaje: string;
  cantidad: number;
  accion: string;
}

interface AlertCardProps {
  alerts: Alert[];
  onActionClick?: (action: string) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alerts, onActionClick }) => {
  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case 'warning':
        return <Warning color="warning" />;
      case 'error':
        return <Error color="error" />;
      case 'info':
        return <Info color="info" />;
      case 'success':
        return <CheckCircle color="success" />;
      default:
        return <Info color="info" />;
    }
  };

  const getAlertColor = (tipo: string) => {
    switch (tipo) {
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'info':
        return 'info';
      case 'success':
        return 'success';
      default:
        return 'info';
    }
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center" py={4}>
            <CheckCircle color="success" sx={{ mr: 1 }} />
            <Typography variant="h6" color="success.main">
              ¡Todo en orden!
            </Typography>
          </Box>
          <Typography variant="body2" color="textSecondary" textAlign="center">
            No hay alertas pendientes
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" component="div">
            Alertas y Notificaciones
          </Typography>
          <Chip 
            label={alerts.length} 
            color="error" 
            size="small"
          />
        </Box>
        
        <List>
          {alerts.map((alert, index) => (
            <React.Fragment key={index}>
              <ListItem 
                sx={{ 
                  px: 0,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    borderRadius: 1
                  }
                }}
              >
                <ListItemIcon>
                  {getAlertIcon(alert.tipo)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="subtitle1" fontWeight="medium">
                        {alert.titulo}
                      </Typography>
                      <Chip 
                        label={alert.cantidad} 
                        color={getAlertColor(alert.tipo) as any}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="textSecondary" mb={1}>
                        {alert.mensaje}
                      </Typography>
                      <Button
                        size="small"
                        endIcon={<ArrowForward />}
                        onClick={() => onActionClick?.(alert.accion)}
                        sx={{ textTransform: 'none' }}
                      >
                        Ver detalles
                      </Button>
                    </Box>
                  }
                />
              </ListItem>
              {index < alerts.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default AlertCard;
