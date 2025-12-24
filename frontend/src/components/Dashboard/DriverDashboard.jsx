import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Assignment,
  Receipt,
  Payment,
  CheckCircle,
  Schedule,
  DirectionsCar,
  Warning,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ordersService } from '../../services/orders';

const DriverDashboard = () => {
  const [stats, setStats] = useState({
    assignedOrders: 0,
    completedOrders: 0,
    pendingExpenses: 0,
    totalEarnings: 0,
  });
  const [currentOrders, setCurrentOrders] = useState([]);
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch driver's orders
      const ordersData = await ordersService.getOrders();
      const assignedOrders = ordersData.filter(order => 
        order.status !== 'delivered' && order.status !== 'cancelled'
      );
      const completedOrders = ordersData.filter(order => order.status === 'delivered');
      
      // Calculate earnings from completed orders
      const totalEarnings = completedOrders.reduce((sum, order) => {
        // Assuming driver gets a percentage or fixed amount per order
        // This should be calculated based on your business logic
        return sum + (order.total_amount * 0.2); // Example: 20% of order value
      }, 0);

      setStats({
        assignedOrders: assignedOrders.length,
        completedOrders: completedOrders.length,
        pendingExpenses: 3, // This should come from API
        totalEarnings,
      });

      setCurrentOrders(assignedOrders.slice(0, 3));
      
      // Mock pending expenses (should come from API)
      setPendingExpenses([
        { id: 1, description: 'Fuel expense', amount: 2500, date: '2024-01-15' },
        { id: 2, description: 'Toll charges', amount: 1200, date: '2024-01-14' },
        { id: 3, description: 'Food & accommodation', amount: 800, date: '2024-01-13' },
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Assigned Orders',
      value: stats.assignedOrders,
      icon: <Assignment sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      action: () => navigate('/driver/orders'),
    },
    {
      title: 'Completed Orders',
      value: stats.completedOrders,
      icon: <CheckCircle sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      action: () => navigate('/driver/orders?status=delivered'),
    },
    {
      title: 'Pending Expenses',
      value: stats.pendingExpenses,
      icon: <Receipt sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      action: () => navigate('/driver/expenses'),
    },
    {
      title: 'Total Earnings',
      value: `₹${stats.totalEarnings.toLocaleString()}`,
      icon: <Payment sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      action: () => navigate('/driver/transfers'),
    },
  ];

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'in_transit': return 'warning';
      case 'assigned': return 'info';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  const getOrderStatusText = (status) => {
    switch (status) {
      case 'in_transit': return 'In Transit';
      case 'assigned': return 'Assigned';
      case 'pending': return 'Pending';
      default: return status;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Driver Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease',
                }
              }}
              onClick={card.action}
            >
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
                  Click to view details
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Current Orders</Typography>
              <Button
                size="small"
                onClick={() => navigate('/driver/orders')}
              >
                View All
              </Button>
            </Box>
            <List>
              {currentOrders.map((order) => (
                <React.Fragment key={order.id}>
                  <ListItem
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/driver/orders/${order.id}`)}
                  >
                    <ListItemIcon>
                      <Assignment color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body1">
                            {order.order_number}
                          </Typography>
                          <Chip
                            label={getOrderStatusText(order.status)}
                            color={getOrderStatusColor(order.status)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {order.load_type} • {order.weight} tons
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Pickup: {order.pickup_location} → Delivery: {order.delivery_location}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
              {currentOrders.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No current orders"
                    secondary="You don't have any assigned orders at the moment."
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Pending Expenses</Typography>
              <Button
                size="small"
                startIcon={<Receipt />}
                onClick={() => navigate('/driver/expenses/new')}
              >
                Add Expense
              </Button>
            </Box>
            <List>
              {pendingExpenses.map((expense) => (
                <React.Fragment key={expense.id}>
                  <ListItem>
                    <ListItemIcon>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body1">
                            {expense.description}
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            ₹{expense.amount}
                          </Typography>
                        </Box>
                      }
                      secondary={`Date: ${expense.date}`}
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
              {pendingExpenses.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No pending expenses"
                    secondary="All expenses have been submitted and approved."
                  />
                </ListItem>
              )}
            </List>

            <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Receipt />}
                    onClick={() => navigate('/driver/expenses/new')}
                  >
                    Add Expense
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Payment />}
                    onClick={() => navigate('/driver/transfers')}
                  >
                    View Payments
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<DirectionsCar />}
                    onClick={() => navigate('/driver/trips')}
                  >
                    Trip History
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Schedule />}
                    onClick={() => navigate('/driver/schedule')}
                  >
                    Schedule
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DriverDashboard;