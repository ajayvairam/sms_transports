import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  LinearProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  DirectionsCar,
  Person,
  CalendarToday,
  AttachMoney,
  LocalShipping,
  Speed,
  OilBarrel,
  Warning,
  CheckCircle,
  Error,
  Assignment,
  History,
  DocumentScanner,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { trucksService } from '../../services/trucks';
import { usersService } from '../../services/users';
import { ordersService } from '../../services/orders';
import { formatDate, formatCurrency, getStatusColor, getStatusText } from '../../utils/helpers';
import Loading from '../Common/Loading';
import ErrorComponent from '../Common/Error';

const TruckDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [truck, setTruck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [orders, setOrders] = useState([]);
  const [assignDriverDialog, setAssignDriverDialog] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    fetchTruckDetails();
    fetchDrivers();
  }, [id]);

  const fetchTruckDetails = async () => {
    try {
      setLoading(true);
      const truckData = await trucksService.getTruck(id);
      setTruck(truckData);
      
      // Fetch orders for this truck
      const ordersData = await ordersService.getOrders({ truck: id });
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching truck details:', error);
      setError('Failed to load truck details');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const data = await usersService.getDrivers();
      setDrivers(data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAssignDriver = async () => {
    try {
      await trucksService.assignDriver(id, selectedDriver);
      fetchTruckDetails();
      setAssignDriverDialog(false);
      setSelectedDriver('');
    } catch (error) {
      console.error('Error assigning driver:', error);
      setError('Failed to assign driver');
    }
  };

  const handleDeleteTruck = async () => {
    try {
      await trucksService.deleteTruck(id);
      navigate('/admin/trucks');
    } catch (error) {
      console.error('Error deleting truck:', error);
      setError('Failed to delete truck');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return <CheckCircle />;
      case 'on_trip': return <Warning />;
      case 'maintenance': return <Error />;
      default: return <Error />;
    }
  };

  const calculateUtilization = () => {
    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    return totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
  };

  const calculateTotalRevenue = () => {
    return orders.reduce((total, order) => total + parseFloat(order.total_amount || 0), 0);
  };

  if (loading) return <Loading message="Loading truck details..." />;
  if (error) return <ErrorComponent message={error} onRetry={fetchTruckDetails} />;
  if (!truck) return <ErrorComponent message="Truck not found" />;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/trucks')}
        >
          Back to Trucks
        </Button>
        <Typography variant="h4">
          <DirectionsCar sx={{ verticalAlign: 'middle', mr: 1 }} />
          {truck.truck_number} - {truck.model}
        </Typography>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Button
          startIcon={<Edit />}
          onClick={() => navigate(`/admin/trucks/${id}/edit`)}
          variant="outlined"
        >
          Edit
        </Button>
        <Button
          startIcon={<Delete />}
          onClick={() => setDeleteDialog(true)}
          variant="outlined"
          color="error"
        >
          Delete
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Truck Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <DirectionsCar />
                </Avatar>
                <Box>
                  <Typography variant="h6">{truck.truck_number}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {truck.model} • {truck.make}
                  </Typography>
                </Box>
              </Box>

              <Chip
                icon={getStatusIcon(truck.status)}
                label={getStatusText(truck.status)}
                color={getStatusColor(truck.status)}
                sx={{ mb: 2 }}
              />

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Year" 
                    secondary={truck.year}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocalShipping fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Axle Count" 
                    secondary={truck.axle_count}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Speed fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Capacity" 
                    secondary={`${truck.capacity} tons`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <OilBarrel fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Fuel Type" 
                    secondary={truck.fuel_type}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Speed fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Mileage" 
                    secondary={`${truck.current_mileage} km`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Owner & Driver Info */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Person sx={{ verticalAlign: 'middle', mr: 1 }} />
                Ownership
              </Typography>
              
              {truck.owner_detail && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Owner</Typography>
                  <Typography variant="body2">
                    {truck.owner_detail.first_name} {truck.owner_detail.last_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {truck.owner_detail.email}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2">Assigned Driver</Typography>
                  {truck.assigned_driver_detail ? (
                    <>
                      <Typography variant="body2">
                        {truck.assigned_driver_detail.first_name} {truck.assigned_driver_detail.last_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        License: {truck.assigned_driver_detail.driving_license}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No driver assigned
                    </Typography>
                  )}
                </Box>
                <Button
                  size="small"
                  onClick={() => setAssignDriverDialog(true)}
                >
                  {truck.assigned_driver_detail ? 'Change' : 'Assign'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content Area */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab icon={<DocumentScanner />} label="Documents" />
              <Tab icon={<Assignment />} label="Orders" />
              <Tab icon={<History />} label="History" />
              <Tab icon={<AttachMoney />} label="Performance" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {tabValue === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          Registration Certificate (RC)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Expiry: {formatDate(truck.rc_expiry)}
                        </Typography>
                        {truck.rc_document && (
                          <Button
                            size="small"
                            href={truck.rc_document}
                            target="_blank"
                            sx={{ mt: 1 }}
                          >
                            View Document
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          Insurance
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Expiry: {formatDate(truck.insurance_expiry)}
                        </Typography>
                        {truck.insurance_document && (
                          <Button
                            size="small"
                            href={truck.insurance_document}
                            target="_blank"
                            sx={{ mt: 1 }}
                          >
                            View Document
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          Pollution Certificate
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Expiry: {formatDate(truck.pollution_expiry)}
                        </Typography>
                        {truck.pollution_certificate && (
                          <Button
                            size="small"
                            href={truck.pollution_certificate}
                            target="_blank"
                            sx={{ mt: 1 }}
                          >
                            View Document
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {tabValue === 1 && (
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
                      {orders.map((order) => (
                        <TableRow 
                          key={order.id} 
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                        >
                          <TableCell>{order.order_number}</TableCell>
                          <TableCell>{order.load_type}</TableCell>
                          <TableCell>{order.pickup_location}</TableCell>
                          <TableCell>{order.delivery_location}</TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusText(order.status)}
                              color={getStatusColor(order.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(order.total_amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {orders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Typography color="text.secondary">
                              No orders found for this truck
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {tabValue === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Truck History
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Truck Added"
                        secondary={`Added on ${formatDate(truck.created_at)}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Last Updated"
                        secondary={`Updated on ${formatDate(truck.updated_at)}`}
                      />
                    </ListItem>
                    {truck.assigned_driver_detail && (
                      <ListItem>
                        <ListItemText
                          primary="Driver Assigned"
                          secondary={`${truck.assigned_driver_detail.first_name} assigned on ${formatDate(truck.updated_at)}`}
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>
              )}

              {tabValue === 3 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Utilization Rate
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={calculateUtilization()} 
                              sx={{ height: 10, borderRadius: 5 }}
                            />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="text.secondary">
                              {Math.round(calculateUtilization())}%
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {orders.filter(o => o.status === 'delivered').length} of {orders.length} orders completed
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Total Revenue
                        </Typography>
                        <Typography variant="h4" color="primary">
                          {formatCurrency(calculateTotalRevenue())}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          From {orders.length} orders
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Recent Activity
                        </Typography>
                        <List dense>
                          {orders.slice(0, 5).map((order) => (
                            <ListItem key={order.id}>
                              <ListItemText
                                primary={`Order ${order.order_number}`}
                                secondary={`${order.load_type} • ${formatDate(order.created_at)} • ${formatCurrency(order.total_amount)}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Assign Driver Dialog */}
      <Dialog open={assignDriverDialog} onClose={() => setAssignDriverDialog(false)}>
        <DialogTitle>Assign Driver</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Select Driver"
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            sx={{ mt: 2 }}
          >
            <MenuItem value="">
              <em>No driver</em>
            </MenuItem>
            {drivers.map((driver) => (
              <MenuItem key={driver.id} value={driver.id}>
                {driver.first_name} {driver.last_name} ({driver.driving_license})
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDriverDialog(false)}>Cancel</Button>
          <Button onClick={handleAssignDriver} variant="contained">
            Assign Driver
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Truck</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete truck {truck.truck_number}?
            This action will also delete all associated documents and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteTruck} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TruckDetails;