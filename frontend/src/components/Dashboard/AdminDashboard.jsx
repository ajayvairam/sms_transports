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
  IconButton,
  Chip,
} from '@mui/material';
import {
  DirectionsCar,
  Assignment,
  People,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  Visibility,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usersService } from '../../services/users';
import { trucksService } from '../../services/trucks';
import { ordersService } from '../../services/orders';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTrucks: 0,
    totalOrders: 0,
    activeOrders: 0,
    totalRevenue: 0,
    pendingAmount: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch users
      const usersData = await usersService.getUsers();
      
      // Fetch trucks
      const trucksData = await trucksService.getTrucks();
      
      // Fetch dashboard stats
      const dashboardRes = await ordersService.getDashboardStats();
      
      setStats({
        totalUsers: usersData.length,
        totalTrucks: trucksData.length,
        totalOrders: dashboardRes.total_orders || 0,
        activeOrders: dashboardRes.active_orders || 0,
        totalRevenue: dashboardRes.total_revenue || 0,
        pendingAmount: dashboardRes.pending_amount || 0,
      });
      
      setRecentOrders(dashboardRes.recent_orders || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Total Trucks',
      value: stats.totalTrucks,
      icon: <DirectionsCar sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: <Assignment sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
    },
    {
      title: 'Active Orders',
      value: stats.activeOrders,
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#0288d1',
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: <AttachMoney sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
    },
    {
      title: 'Pending Amount',
      value: `₹${stats.pendingAmount.toLocaleString()}`,
      icon: <TrendingDown sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'in_transit': return 'warning';
      case 'pending': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: card.color, mr: 2 }}>
                    {card.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" component="div">
                      {card.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Recent Orders</Typography>
              <IconButton onClick={() => navigate('/admin/orders')}>
                <Visibility />
              </IconButton>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order #</TableCell>
                    <TableCell>Load Type</TableCell>
                    <TableCell>Pickup Location</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>{order.order_number}</TableCell>
                      <TableCell>{order.load_type}</TableCell>
                      <TableCell>{order.pickup_location}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.status_display || order.status}
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>₹{order.total_amount}</TableCell>
                    </TableRow>
                  ))}
                  {recentOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
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
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Chip
                label="Create New Order"
                onClick={() => navigate('/admin/orders/new')}
                color="primary"
                variant="outlined"
                clickable
              />
              <Chip
                label="Add New Truck"
                onClick={() => navigate('/admin/trucks/new')}
                color="primary"
                variant="outlined"
                clickable
              />
              <Chip
                label="Create User"
                onClick={() => navigate('/admin/users/new')}
                color="primary"
                variant="outlined"
                clickable
              />
              <Chip
                label="View All Trucks"
                onClick={() => navigate('/admin/trucks')}
                color="secondary"
                variant="outlined"
                clickable
              />
              <Chip
                label="View Reports"
                onClick={() => navigate('/admin/reports')}
                color="secondary"
                variant="outlined"
                clickable
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;