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
  IconButton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Edit,
  Delete,
  Visibility,
  DirectionsCar,
  CheckCircle,
  Warning,
  Error,
  MoreVert,
  Assignment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { trucksService } from '../../services/trucks';
import { usersService } from '../../services/users';
import { formatDate, getStatusColor, getStatusText } from '../../utils/helpers';
import Loading from '../Common/Loading';
import ErrorComponent from '../Common/Error';

const TruckList = () => {
  const navigate = useNavigate();
  const [trucks, setTrucks] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, truckId: null });

  useEffect(() => {
    fetchTrucks();
    fetchOwners();
  }, []);

  const fetchTrucks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trucksService.getTrucks();
      // FIX: Ensure data is always an array
      setTrucks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching trucks:', error);
      setError('Failed to load trucks');
      setTrucks([]); // Ensure trucks is always an array even on error
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      const data = await usersService.getOwners();
      // FIX: Ensure owners is always an array
      setOwners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching owners:', error);
      setOwners([]); // Set empty array on error
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event, truckId) => {
    setAnchorEl({ element: event.currentTarget, truckId });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = (truckId) => {
    setDeleteDialog({ open: true, truckId });
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    try {
      await trucksService.deleteTruck(deleteDialog.truckId);
      // FIX: Add array check before filtering
      if (Array.isArray(trucks)) {
        setTrucks(trucks.filter(truck => truck.id !== deleteDialog.truckId));
      }
      setDeleteDialog({ open: false, truckId: null });
    } catch (error) {
      console.error('Error deleting truck:', error);
      setError('Failed to delete truck');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, truckId: null });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return <CheckCircle fontSize="small" />;
      case 'on_trip': return <Warning fontSize="small" />;
      case 'maintenance': return <Error fontSize="small" />;
      default: return <Error fontSize="small" />;
    }
  };

  // FIX: Ensure filteredTrucks always returns an array
  const filteredTrucks = Array.isArray(trucks) 
    ? trucks.filter(truck => {
        // Add null checks for truck properties
        if (!truck) return false;
        
        const matchesSearch = 
          (truck.truck_number || '').toLowerCase().includes(search.toLowerCase()) ||
          (truck.model || '').toLowerCase().includes(search.toLowerCase()) ||
          (truck.make || '').toLowerCase().includes(search.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || truck.status === statusFilter;
        const matchesOwner = ownerFilter === 'all' || truck.owner === parseInt(ownerFilter);

        return matchesSearch && matchesStatus && matchesOwner;
      })
    : [];

  if (loading) return <Loading message="Loading trucks..." />;
  if (error) return <ErrorComponent message={error} onRetry={fetchTrucks} />;

  // FIX: Check if trucks is valid before rendering
  if (!Array.isArray(trucks)) {
    return (
      <ErrorComponent 
        message="Invalid trucks data format" 
        onRetry={fetchTrucks} 
      />
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          <DirectionsCar sx={{ verticalAlign: 'middle', mr: 1 }} />
          Truck Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/admin/trucks/new')}
        >
          Add New Truck
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Search trucks..."
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
        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="available">Available</MenuItem>
            <MenuItem value="on_trip">On Trip</MenuItem>
            <MenuItem value="maintenance">Maintenance</MenuItem>
            <MenuItem value="out_of_service">Out of Service</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            label="Filter by Owner"
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
          >
            <MenuItem value="all">All Owners</MenuItem>
            {Array.isArray(owners) && owners.map((owner) => (
              <MenuItem key={owner.id} value={owner.id}>
                {owner.first_name} {owner.last_name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Truck Number</TableCell>
                <TableCell>Model & Make</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Driver</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Documents</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTrucks
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((truck) => (
                  <TableRow key={truck.id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {truck.truck_number}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Year: {truck.year}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {truck.model} ({truck.make})
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Axles: {truck.axle_count}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {truck.owner_detail && (
                        <Typography variant="body2">
                          {truck.owner_detail.first_name} {truck.owner_detail.last_name}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {truck.assigned_driver_detail ? (
                        <Typography variant="body2">
                          {truck.assigned_driver_detail.first_name} {truck.assigned_driver_detail.last_name}
                        </Typography>
                      ) : (
                        <Chip label="Not Assigned" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(truck.status)}
                        label={getStatusText(truck.status)}
                        color={getStatusColor(truck.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {truck.capacity} tons
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {truck.fuel_type}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption">
                          RC: {formatDate(truck.rc_expiry)}
                        </Typography>
                        <Typography variant="caption">
                          Insurance: {formatDate(truck.insurance_expiry)}
                        </Typography>
                        <Typography variant="caption">
                          Pollution: {formatDate(truck.pollution_expiry)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/trucks/${truck.id}`)}
                        title="View Details"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/trucks/${truck.id}/edit`)}
                        title="Edit"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, truck.id)}
                        title="More Actions"
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredTrucks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Box sx={{ py: 4 }}>
                      <DirectionsCar sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No trucks found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {search || statusFilter !== 'all' || ownerFilter !== 'all' 
                          ? 'Try changing your search filters' 
                          : 'Add your first truck to get started'}
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
          count={filteredTrucks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl?.element}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/admin/trucks/${anchorEl?.truckId}`);
          handleMenuClose();
        }}>
          <Visibility fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/admin/trucks/${anchorEl?.truckId}/edit`);
          handleMenuClose();
        }}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit Truck
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/admin/orders/new?truck=${anchorEl?.truckId}`);
          handleMenuClose();
        }}>
          <Assignment fontSize="small" sx={{ mr: 1 }} />
          Assign Order
        </MenuItem>
        <MenuItem onClick={() => handleDeleteClick(anchorEl?.truckId)}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete Truck
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this truck? This action cannot be undone.
            All associated documents will also be deleted.
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

export default TruckList;