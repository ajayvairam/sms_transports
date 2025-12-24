import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Divider,
  Stack,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Assignment,
  Person,
  DirectionsCar,
  Receipt,
  Payment,
  CheckCircle,
  Schedule,
  LocalShipping,
  Cancel,
  Description,
} from '@mui/icons-material';
import { formatDateTime } from '../../utils/helpers';

const OrderTimeline = ({ timeline }) => {
  const theme = useTheme();

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'order_created':
        return <Assignment />;
      case 'order_assigned':
        return <Person />;
      case 'order_status_changed':
        return <CheckCircle />;
      case 'expense_added':
        return <Receipt />;
      case 'money_transferred':
        return <Payment />;
      case 'document_uploaded':
        return <Description />;
      case 'trip_started':
        return <LocalShipping />;
      case 'trip_completed':
        return <CheckCircle />;
      default:
        return <Assignment />;
    }
  };

  const getEventColor = (eventType) => {
    switch (eventType) {
      case 'order_created':
        return theme.palette.primary.main;
      case 'order_assigned':
        return theme.palette.info.main;
      case 'order_status_changed':
        return theme.palette.warning.main;
      case 'expense_added':
        return theme.palette.error.main;
      case 'money_transferred':
        return theme.palette.success.main;
      case 'document_uploaded':
        return theme.palette.secondary.main;
      case 'trip_started':
        return theme.palette.info.main;
      case 'trip_completed':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getEventTitle = (eventType, title) => {
    if (title) return title;
    
    switch (eventType) {
      case 'order_created':
        return 'Order Created';
      case 'order_assigned':
        return 'Order Assigned';
      case 'order_status_changed':
        return 'Status Changed';
      case 'expense_added':
        return 'Expense Added';
      case 'money_transferred':
        return 'Money Transferred';
      case 'document_uploaded':
        return 'Document Uploaded';
      case 'trip_started':
        return 'Trip Started';
      case 'trip_completed':
        return 'Trip Completed';
      default:
        return eventType.replace('_', ' ').toUpperCase();
    }
  };

  const getStatusChipColor = (eventType) => {
    switch (eventType) {
      case 'order_created':
        return 'primary';
      case 'order_assigned':
        return 'info';
      case 'order_status_changed':
        return 'warning';
      case 'expense_added':
        return 'error';
      case 'money_transferred':
        return 'success';
      case 'document_uploaded':
        return 'secondary';
      case 'trip_started':
        return 'info';
      case 'trip_completed':
        return 'success';
      default:
        return 'default';
    }
  };

  if (!timeline || timeline.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Description sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No timeline events yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Events will appear here as the order progresses
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
        Order Timeline
      </Typography>
      
      <Stack spacing={4}>
        {timeline.map((event, index) => (
          <Box key={event.id} sx={{ display: 'flex', alignItems: 'flex-start' }}>
            {/* Timeline line and dot */}
            <Box sx={{ position: 'relative', mr: 3, mt: 0.5 }}>
              {/* Timeline dot */}
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: getEventColor(event.event_type),
                  color: 'white',
                  border: `3px solid white`,
                  boxShadow: 3,
                  zIndex: 1,
                  position: 'relative',
                }}
              >
                {getEventIcon(event.event_type)}
              </Avatar>
              
              {/* Connector line (except for last item) */}
              {index < timeline.length - 1 && (
                <Divider
                  orientation="vertical"
                  sx={{
                    position: 'absolute',
                    left: '50%',
                    top: 60,
                    bottom: -40,
                    transform: 'translateX(-50%)',
                    borderColor: getEventColor(event.event_type),
                    borderWidth: 2,
                    opacity: 0.5,
                  }}
                />
              )}
            </Box>

            {/* Content area */}
            <Box sx={{ flex: 1 }}>
              {/* Date/time at top */}
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ display: 'block', mb: 0.5 }}
              >
                {formatDateTime(event.created_at)}
              </Typography>
              
              {/* Event card */}
              <Paper
                elevation={index === 0 ? 4 : 2}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  borderLeft: `6px solid ${getEventColor(event.event_type)}`,
                  backgroundColor: 
                    index === 0 
                      ? theme.palette.background.default
                      : 'background.paper',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateX(4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  mb: 2 
                }}>
                  <Typography variant="subtitle1" fontWeight="600">
                    {getEventTitle(event.event_type, event.title)}
                  </Typography>
                  
                  <Chip
                    label={event.event_type.replace('_', ' ')}
                    size="small"
                    color={getStatusChipColor(event.event_type)}
                    variant="outlined"
                    icon={getEventIcon(event.event_type)}
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {event.description}
                </Typography>
                
                {event.created_by_detail && (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mt: 2,
                    pt: 2,
                    borderTop: `1px solid ${theme.palette.divider}`
                  }}>
                    <Avatar
                      sx={{ 
                        width: 28, 
                        height: 28, 
                        mr: 1.5,
                        bgcolor: theme.palette.primary.light,
                        color: theme.palette.primary.contrastText
                      }}
                      alt={event.created_by_detail.first_name}
                    >
                      {event.created_by_detail.first_name?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="caption" fontWeight="500">
                        {event.created_by_detail.first_name} {event.created_by_detail.last_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Updated the order
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default OrderTimeline;