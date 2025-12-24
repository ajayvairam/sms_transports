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
  Menu,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Assignment,
  LocationOn,
  CalendarToday,
  AttachMoney,
  Person,
  DirectionsCar,
  Receipt,
  Payment,
  Timeline,
  CheckCircle,
  Schedule,
  LocalShipping,
  Cancel,
  MoreVert,
  Add,
  Download,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { ordersService } from '../../services/orders';
import { expensesService } from '../../services/expenses';
import { transfersService } from '../../services/transfers';
import { formatDate, formatCurrency, formatDateTime, getStatusColor, getStatusText, calculateOrderProgress } from '../../utils/helpers';
import Loading from '../Common/Loading';
import ErrorComponent from '../Common/Error';
import OrderTimeline from './OrderTimeline';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const orderData = await ordersService.getOrder(id);
      setOrder(orderData);
      
      // Fetch related data
      const [expensesData, transfersData, timelineData] = await Promise.all([
        expensesService.getExpensesByOrder(id),
        transfersService.getTransfersByOrder(id),
        ordersService.getOrderTimeline(id)
      ]);
      
      setExpenses(expensesData);
      setTransfers(transfersData);
      setTimeline(timelineData);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteOrder = async () => {
    try {
      await ordersService.deleteOrder(id);
      navigate('/admin/orders');
    } catch (error) {
      console.error('Error deleting order:', error);
      setError('Failed to delete order');
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      await ordersService.updateOrderStatus(id, status);
      fetchOrderDetails(); // Refresh order data
      handleMenuClose();
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle />;
      case 'in_transit': return <LocalShipping />;
      case 'assigned': return <Assignment />;
      case 'pending': return <Schedule />;
      case 'cancelled': return <Cancel />;
      default: return <Assignment />;
    }
  };

  const calculateTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
  };

  const calculateNetProfit = () => {
    const totalRevenue = parseFloat(order?.total_amount || 0);
    const totalExpenses = calculateTotalExpenses();
    return totalRevenue - totalExpenses;
  };

  if (loading) return <Loading message="Loading order details..." />;
  if (error) return <ErrorComponent message={error} onRetry={fetchOrderDetails} />;
  if (!order) return <ErrorComponent message="Order not found" />;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/orders')}
        >
          Back to Orders
        </Button>
        <Typography variant="h4">
          <Assignment sx={{ verticalAlign: 'middle', mr: 1 }} />
          Order #{order.order_number}
        </Typography>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Button
          startIcon={<Edit />}
          onClick={() => navigate(`/admin/orders/${id}/edit`)}
          variant="outlined"
        >
          Edit
        </Button>
        <IconButton onClick={handleMenuClick}>
          <MoreVert />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Order Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <Assignment />
                </Avatar>
                <Box>
                  <Typography variant="h6">#{order.order_number}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.load_type}
                  </Typography>
                </Box>
              </Box>

              <Chip
                icon={getStatusIcon(order.status)}
                label={getStatusText(order.status)}
                color={getStatusColor(order.status)}
                sx={{ mb: 2 }}
              />

              {/* Progress Bar */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Order Progress
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {calculateOrderProgress(order.status)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={calculateOrderProgress(order.status)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Pickup Date" 
                    secondary={formatDateTime(order.pickup_date)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Est. Delivery" 
                    secondary={formatDateTime(order.estimated_delivery_date)}
                  />
                </ListItem>
                {order.actual_delivery_date && (
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Actual Delivery" 
                      secondary={formatDateTime(order.actual_delivery_date)}
                    />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemIcon>
                    <LocationOn fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Route" 
                    secondary={
                      <>
                        <div>From: {order.pickup_location}</div>
                        <div>To: {order.delivery_location}</div>
                      </>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AttachMoney fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Financials" 
                    secondary={
                      <>
                        <div>Total: {formatCurrency(order.total_amount)}</div>
                        <div>Advance: {formatCurrency(order.advance_amount)}</div>
                        <div>Balance: {formatCurrency(order.balance_amount)}</div>
                      </>
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Assignments Card */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Person sx={{ verticalAlign: 'middle', mr: 1 }} />
                Assignments
              </Typography>
              
              {order.owner_detail && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Owner</Typography>
                  <Typography variant="body2">
                    {order.owner_detail.first_name} {order.owner_detail.last_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {order.owner_detail.email}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Driver</Typography>
                {order.driver_detail ? (
                  <>
                    <Typography variant="body2">
                      {order.driver_detail.first_name} {order.driver_detail.last_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      License: {order.driver_detail.driving_license}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No driver assigned
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="subtitle2">Truck</Typography>
                {order.truck ? (
                  <>
                    <Typography variant="body2">
                      {order.truck.truck_number} - {order.truck.model}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Capacity: {order.truck.capacity} tons • {order.truck.fuel_type}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No truck assigned
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content Area */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab icon={<Timeline />} label="Timeline" />
              <Tab icon={<Receipt />} label="Expenses" />
              <Tab icon={<Payment />} label="Transfers" />
              <Tab icon={<AttachMoney />} label="Financial Summary" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {tabValue === 0 && (
                <OrderTimeline timeline={timeline} />
              )}

              {tabValue === 1 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">Expenses</Typography>
                    <Button
                      startIcon={<Add />}
                      variant="contained"
                      onClick={() => navigate(`/admin/expenses/new?order=${id}`)}
                    >
                      Add Expense
                    </Button>
                  </Box>
                  
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Added By</TableCell>
                          <TableCell>Bill</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {expenses.map((expense) => (
                          <TableRow key={expense.id} hover>
                            <TableCell>{formatDate(expense.date)}</TableCell>
                            <TableCell>
                              <Chip label={expense.category_display || expense.category} size="small" />
                            </TableCell>
                            <TableCell>{expense.description}</TableCell>
                            <TableCell>{formatCurrency(expense.amount)}</TableCell>
                            <TableCell>
                              {expense.added_by_detail?.first_name} {expense.added_by_detail?.last_name}
                            </TableCell>
                            <TableCell>
                              {expense.bill_photo && (
                                <IconButton
                                  size="small"
                                  href={expense.bill_photo}
                                  target="_blank"
                                  title="View Bill"
                                >
                                  <Download fontSize="small" />
                                </IconButton>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {expenses.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              <Typography color="text.secondary">
                                No expenses recorded
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {expenses.length > 0 && (
                    <Card sx={{ mt: 3 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Expense Summary
                        </Typography>
                        <Typography variant="body1">
                          Total Expenses: {formatCurrency(calculateTotalExpenses())}
                        </Typography>
                      </CardContent>
                    </Card>
                  )}
                </Box>
              )}

              {tabValue === 2 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">Money Transfers</Typography>
                    <Button
                      startIcon={<Add />}
                      variant="contained"
                      onClick={() => navigate(`/admin/transfers/new?order=${id}`)}
                    >
                      Add Transfer
                    </Button>
                  </Box>
                  
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Transaction ID</TableCell>
                          <TableCell>Receipt</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {transfers.map((transfer) => (
                          <TableRow key={transfer.id} hover>
                            <TableCell>{formatDate(transfer.created_at)}</TableCell>
                            <TableCell>
                              <Chip 
                                label={transfer.transfer_type_display || transfer.transfer_type} 
                                size="small"
                                color={
                                  transfer.transfer_type === 'to_driver' || transfer.transfer_type === 'to_owner' 
                                    ? 'error' 
                                    : 'success'
                                }
                              />
                            </TableCell>
                            <TableCell>{transfer.description}</TableCell>
                            <TableCell>
                              <Typography 
                                color={
                                  transfer.transfer_type === 'to_driver' || transfer.transfer_type === 'to_owner' 
                                    ? 'error.main' 
                                    : 'success.main'
                                }
                              >
                                {transfer.transfer_type === 'to_driver' || transfer.transfer_type === 'to_owner' 
                                  ? `-${formatCurrency(transfer.amount)}`
                                  : `+${formatCurrency(transfer.amount)}`
                                }
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={transfer.status_display || transfer.status}
                                color={getStatusColor(transfer.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{transfer.transaction_id || 'N/A'}</TableCell>
                            <TableCell>
                              {transfer.receipt && (
                                <IconButton
                                  size="small"
                                  href={transfer.receipt}
                                  target="_blank"
                                  title="View Receipt"
                                >
                                  <Download fontSize="small" />
                                </IconButton>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {transfers.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} align="center">
                              <Typography color="text.secondary">
                                No transfers recorded
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {tabValue === 3 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Revenue
                        </Typography>
                        <Typography variant="h4" color="primary">
                          {formatCurrency(order.total_amount)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Order Value
                        </Typography>
                        
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            Advance: {formatCurrency(order.advance_amount)}
                          </Typography>
                          <Typography variant="body2">
                            Balance: {formatCurrency(order.balance_amount)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Expenses
                        </Typography>
                        <Typography variant="h4" color="error">
                          {formatCurrency(calculateTotalExpenses())}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Expenses
                        </Typography>
                        
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            Number of Expenses: {expenses.length}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Profit & Loss
                        </Typography>
                        <Typography 
                          variant="h3" 
                          color={calculateNetProfit() >= 0 ? 'success.main' : 'error.main'}
                        >
                          {formatCurrency(calculateNetProfit())}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Net Profit/Loss
                        </Typography>
                        
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            Profit Margin: {order.total_amount > 0 
                              ? ((calculateNetProfit() / order.total_amount) * 100).toFixed(2) 
                              : '0'}%
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/admin/orders/${id}/edit`);
          handleMenuClose();
        }}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit Order
        </MenuItem>
        <MenuItem onClick={() => {
          handleStatusUpdate('in_transit');
        }}>
          <LocalShipping fontSize="small" sx={{ mr: 1 }} />
          Mark as In Transit
        </MenuItem>
        <MenuItem onClick={() => {
          handleStatusUpdate('delivered');
        }}>
          <CheckCircle fontSize="small" sx={{ mr: 1 }} />
          Mark as Delivered
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/admin/expenses/new?order=${id}`);
          handleMenuClose();
        }}>
          <Receipt fontSize="small" sx={{ mr: 1 }} />
          Add Expense
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/admin/transfers/new?order=${id}`);
          handleMenuClose();
        }}>
          <Payment fontSize="small" sx={{ mr: 1 }} />
          Add Transfer
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          setDeleteDialog(true);
          handleMenuClose();
        }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete Order
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Order</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete order #{order.order_number}?
            This action will also delete all associated expenses and transfers.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteOrder} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderDetails;