import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, Warning, CheckCircle } from '@mui/icons-material';

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  icon?: React.ReactNode;
  alert?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  color = 'primary',
  icon,
  alert = false
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp color="success" />;
      case 'down':
        return <TrendingDown color="error" />;
      default:
        return null;
    }
  };

  const getColor = () => {
    if (alert) return 'error';
    return color;
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        border: alert ? '2px solid' : '1px solid',
        borderColor: alert ? 'error.main' : 'divider',
        position: 'relative',
        overflow: 'visible'
      }}
    >
      {alert && (
        <Chip
          icon={<Warning />}
          label="Alerta"
          color="error"
          size="small"
          sx={{
            position: 'absolute',
            top: -8,
            right: 16,
            zIndex: 1
          }}
        />
      )}
      
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {title}
          </Typography>
          {icon && (
            <Box color={`${getColor()}.main`}>
              {icon}
            </Box>
          )}
        </Box>
        
        <Typography 
          variant="h4" 
          component="div" 
          color={`${getColor()}.main`}
          fontWeight="bold"
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>
        
        {subtitle && (
          <Typography variant="body2" color="textSecondary" mt={1}>
            {subtitle}
          </Typography>
        )}
        
        {trend && trendValue && (
          <Box display="flex" alignItems="center" mt={1}>
            {getTrendIcon()}
            <Typography 
              variant="body2" 
              color={trend === 'up' ? 'success.main' : 'error.main'}
              ml={0.5}
            >
              {trendValue}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
