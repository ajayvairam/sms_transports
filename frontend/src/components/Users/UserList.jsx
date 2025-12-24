import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Avatar, // Added missing Avatar import
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Person,
  Visibility,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usersService } from '../../services/users';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, userId: null });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersService.getUsers();
      // FIX: Ensure data is always an array
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]); // Ensure users is always an array even on error
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

  const handleDeleteClick = (userId) => {
    setDeleteDialog({ open: true, userId });
  };

  const handleDeleteConfirm = async () => {
    try {
      await usersService.deleteUser(deleteDialog.userId);
      // FIX: Add array check before filtering
      if (Array.isArray(users)) {
        setUsers(users.filter(user => user.id !== deleteDialog.userId));
      }
      setDeleteDialog({ open: false, userId: null });
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, userId: null });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'owner': return 'primary';
      case 'driver': return 'warning';
      default: return 'default';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'error';
  };

  // FIX: Ensure filteredUsers always returns an array
  const filteredUsers = Array.isArray(users) 
    ? users.filter(user => {
        // Add null checks for user properties
        if (!user) return false;
        
        const email = user.email || '';
        const firstName = user.first_name || '';
        const lastName = user.last_name || '';
        
        return (
          email.toLowerCase().includes(search.toLowerCase()) ||
          firstName.toLowerCase().includes(search.toLowerCase()) ||
          lastName.toLowerCase().includes(search.toLowerCase())
        );
      })
    : [];

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Loading users...</Typography>
      </Box>
    );
  }

  // Check if users is valid before rendering
  if (!Array.isArray(users)) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          Error: Invalid users data format. Please try again.
        </Typography>
        <Button onClick={fetchUsers} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">User Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/admin/users/new')}
        >
          Add New User
        </Button>
      </Box>

      <Paper sx={{ mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search users by name or email..."
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
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                          {(user.first_name?.[0] || '') + (user.last_name?.[0] || '') || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {user.first_name || ''} {user.last_name || ''}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email || 'No email'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.phone || 'N/A'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.username || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role || 'unknown'}
                        color={getRoleColor(user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_active ? 'Active' : 'Inactive'}
                        color={getStatusColor(user.is_active)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {user.date_joined 
                        ? new Date(user.date_joined).toLocaleDateString() 
                        : 'N/A'}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                        title="View Details"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                        title="Edit"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(user.id)}
                        title="Delete"
                        disabled={user.role === 'admin'} // Prevent deleting admin users
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box sx={{ py: 3 }}>
                      <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                      <Typography color="text.secondary">
                        {search ? 'No users match your search' : 'No users found'}
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
          count={filteredUsers.length}
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
            Are you sure you want to delete this user? This action cannot be undone.
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

export default UserList;