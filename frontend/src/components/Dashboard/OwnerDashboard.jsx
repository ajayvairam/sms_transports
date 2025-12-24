import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  DirectionsCar,
  Assignment,
  AttachMoney,
  TrendingUp,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { ordersService } from '../../services/orders';
import { trucksService } from '../../services/trucks';

const OwnerDashboard = () => {
  const [stats, setStats] = useState({
    totalTrucks: 0,
    availableTrucks: 0,
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [truckStatus, setTruckStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch trucks
      const trucksData = await trucksService.getTrucks();
      const availableTrucks = trucksData.filter(truck => truck.status === 'available').length;
      
      // Fetch dashboard stats
      const dashboardRes = await ordersService.getDashboardStats();
      
      setStats({
        totalTrucks: trucksData.length,
        availableTrucks,
        totalOrders: dashboardRes.total_orders || 0,
        activeOrders: dashboardRes.active_orders || 0,
        completedOrders: (dashboardRes.total_orders || 0) - (dashboardRes.active_orders || 0),
        totalRevenue: dashboardRes.total_revenue || 0,
      });
      
      setRecentOrders(dashboardRes.recent_orders || []);
      
      // Calculate truck status distribution
      const statusCount = trucksData.reduce((acc, truck) => {
        acc[truck.status] = (acc[truck.status] || 0) + 1;
        return acc;
      }, {});
      setTruckStatus(Object.entries(statusCount));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Trucks',
      value: stats.totalTrucks,
      icon: <DirectionsCar sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      subtitle: `${stats.availableTrucks} available`,
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: <Assignment sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      subtitle: `${stats.activeOrders} active`,
    },
    {
      title: 'Completed Orders',
      value: stats.completedOrders,
      icon: <CheckCircle sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      subtitle: `${stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}% rate`,
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: <AttachMoney sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      subtitle: 'Lifetime earnings',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'on_trip': return 'warning';
      case 'maintenance': return 'error';
      case 'out_of_service': return 'default';
      default: return 'default';
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'available': return 'Available';
      case 'on_trip': return 'On Trip';
      case 'maintenance': return 'Maintenance';
      case 'out_of_service': return 'Out of Service';
      default: return status;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Owner Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: card.color, mr: 2 }}>
                    {card.icon}
                  </Box>
                  <Box>
                    <Typography variant="h5" component="div">
                      {card.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.title}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {card.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Orders
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order #</TableCell>
                    <TableCell>Load Type</TableCell>
                    <TableCell>Pickup</TableCell>
                    <TableCell>Delivery</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>{order.order_number}</TableCell>
                      <TableCell>{order.load_type}</TableCell>
                      <TableCell>{order.pickup_location}</TableCell>
                      <TableCell>{order.delivery_location}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.status_display || order.status}
                          color={
                            order.status === 'delivered' ? 'success' :
                            order.status === 'in_transit' ? 'warning' :
                            order.status === 'pending' ? 'default' : 'error'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">₹{order.total_amount}</TableCell>
                    </TableRow>
                  ))}
                  {recentOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No orders found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Truck Status
            </Typography>
            <Box sx={{ mt: 2 }}>
              {truckStatus.map(([status, count]) => (
                <Box key={status} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      {getStatusDisplay(status)}
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {count} trucks
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(count / stats.totalTrucks) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getStatusColor(status) === 'success' ? '#2e7d32' :
                                        getStatusColor(status) === 'warning' ? '#ed6c02' :
                                        getStatusColor(status) === 'error' ? '#d32f2f' : '#757575',
                      },
                    }}
                  />
                </Box>
              ))}
              {truckStatus.length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center">
                  No trucks registered
                </Typography>
              )}
            </Box>
            
            <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom>
                Upcoming Deliveries
              </Typography>
              {recentOrders
                .filter(order => order.status === 'in_transit')
                .slice(0, 3)
                .map((order) => (
                  <Box key={order.id} sx={{ mb: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {order.order_number}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Delivery: {order.delivery_location}
                    </Typography>
                  </Box>
                ))}
              {recentOrders.filter(order => order.status === 'in_transit').length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center">
                  No upcoming deliveries
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OwnerDashboard;