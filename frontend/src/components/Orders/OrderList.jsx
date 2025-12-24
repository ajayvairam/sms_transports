import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  MenuItem,
  IconButton,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add,
  Search,
  Assignment,
  Visibility,
  Edit,
  MoreVert,
  Delete,
  LocalShipping,
  CheckCircle,
  Schedule,
  Cancel,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ordersService } from '../../services/orders';
import { formatDate, formatCurrency, getStatusColor, getStatusText } from '../../utils/helpers';
import Loading from '../Common/Loading';
import ErrorComponent from '../Common/Error';

const OrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, orderId: null });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ordersService.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event, orderId) => {
    setAnchorEl({ element: event.currentTarget, orderId });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = (orderId) => {
    setDeleteDialog({ open: true, orderId });
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    try {
      await ordersService.deleteOrder(deleteDialog.orderId);
      setOrders(orders.filter(order => order.id !== deleteDialog.orderId));
      setDeleteDialog({ open: false, orderId: null });
    } catch (error) {
      console.error('Error deleting order:', error);
      setError('Failed to delete order');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, orderId: null });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle fontSize="small" />;
      case 'in_transit': return <LocalShipping fontSize="small" />;
      case 'assigned': return <Assignment fontSize="small" />;
      case 'pending': return <Schedule fontSize="small" />;
      case 'cancelled': return <Cancel fontSize="small" />;
      default: return <Assignment fontSize="small" />;
    }
  };

  const filteredOrders = Array.isArray(orders) 
    ? orders.filter(order => {
        if (!order) return false;
        
        const matchesSearch = 
          (order.order_number || '').toLowerCase().includes(search.toLowerCase()) ||
          (order.load_type || '').toLowerCase().includes(search.toLowerCase()) ||
          (order.pickup_location || '').toLowerCase().includes(search.toLowerCase()) ||
          (order.delivery_location || '').toLowerCase().includes(search.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
    : [];

  if (loading) return <Loading message="Loading orders..." />;
  if (error) return <ErrorComponent message={error} onRetry={fetchOrders} />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          <Assignment sx={{ verticalAlign: 'middle', mr: 1 }} />
          Transportation Orders
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/admin/orders/new')}
        >
          New Order
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="assigned">Assigned</MenuItem>
            <MenuItem value="in_transit">In Transit</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order #</TableCell>
                <TableCell>Load Details</TableCell>
                <TableCell>Route</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell>Financials</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {order.order_number}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Created: {formatDate(order.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.load_type}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.weight} tons
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.pickup_location}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        → {order.delivery_location}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        Pickup: {formatDate(order.pickup_date)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(order.total_amount)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Advance: {formatCurrency(order.advance_amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(order.status)}
                        label={getStatusText(order.status)}
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {order.driver_detail ? (
                        <Typography variant="body2">
                          {order.driver_detail.first_name} {order.driver_detail.last_name}
                        </Typography>
                      ) : (
                        <Chip label="Not Assigned" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        title="View Details"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/orders/${order.id}/edit`)}
                        title="Edit"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, order.id)}
                        title="More Actions"
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Box sx={{ py: 4 }}>
                      <Assignment sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No orders found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {search || statusFilter !== 'all' 
                          ? 'Try changing your search filters' 
                          : 'Create your first order to get started'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this order? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderList;