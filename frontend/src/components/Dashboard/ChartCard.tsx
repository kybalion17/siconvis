import React from 'react';
import { Card, CardContent, Typography, Box, IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert, Refresh } from '@mui/icons-material';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  onRefresh?: () => void;
  loading?: boolean;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  actions,
  onRefresh,
  loading = false
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
    handleClose();
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box>
            <Typography variant="h6" component="div" gutterBottom>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          
          <Box display="flex" alignItems="center">
            {actions}
            
            {onRefresh && (
              <IconButton
                size="small"
                onClick={handleClick}
                disabled={loading}
              >
                <MoreVert />
              </IconButton>
            )}
          </Box>
        </Box>
        
        <Box sx={{ position: 'relative', minHeight: 300 }}>
          {loading ? (
            <Box 
              display="flex" 
              alignItems="center" 
              justifyContent="center" 
              height={300}
            >
              <Typography color="textSecondary">Cargando...</Typography>
            </Box>
          ) : (
            children
          )}
        </Box>
      </CardContent>
      
      {onRefresh && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleRefresh}>
            <Refresh sx={{ mr: 1 }} />
            Actualizar
          </MenuItem>
        </Menu>
      )}
    </Card>
  );
};

export default ChartCard;
