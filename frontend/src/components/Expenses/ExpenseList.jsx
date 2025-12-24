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
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Receipt,
  Visibility,
  Edit,
  Delete,
  Download,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { expensesService } from '../../services/expenses';
import { formatDate, formatCurrency, getStatusColor } from '../../utils/helpers';
import Loading from '../Common/Loading';
import ErrorComponent from '../Common/Error';

const ExpenseList = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [orderFilter, setOrderFilter] = useState('all');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await expensesService.getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setError('Failed to load expenses');
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

  const calculateTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
  };

  const calculateExpensesByCategory = () => {
    const categories = {};
    expenses.forEach(expense => {
      const category = expense.category_display || expense.category;
      categories[category] = (categories[category] || 0) + parseFloat(expense.amount || 0);
    });
    return categories;
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = 
      expense.description?.toLowerCase().includes(search.toLowerCase()) ||
      expense.order?.order_number?.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    const matchesOrder = orderFilter === 'all' || expense.order?.id === parseInt(orderFilter);

    return matchesSearch && matchesCategory && matchesOrder;
  });

  const categories = [...new Set(expenses.map(e => e.category_display || e.category))];
  const orders = [...new Set(expenses.map(e => e.order))].filter(Boolean);

  if (loading) return <Loading message="Loading expenses..." />;
  if (error) return <ErrorComponent message={error} onRetry={fetchExpenses} />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          <Receipt sx={{ verticalAlign: 'middle', mr: 1 }} />
          Expenses
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/admin/expenses/new')}
        >
          Add Expense
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                {formatCurrency(calculateTotalExpenses())}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Expenses
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                {expenses.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Entries
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                {categories.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Categories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                {orders.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Orders
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Search expenses..."
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
            label="Filter by Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            label="Filter by Order"
            value={orderFilter}
            onChange={(e) => setOrderFilter(e.target.value)}
          >
            <MenuItem value="all">All Orders</MenuItem>
            {orders.map((order) => (
              <MenuItem key={order.id} value={order.id}>
                {order.order_number}
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
                <TableCell>Date</TableCell>
                <TableCell>Order #</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Added By</TableCell>
                <TableCell>Bill</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredExpenses
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((expense) => (
                  <TableRow key={expense.id} hover>
                    <TableCell>
                      {formatDate(expense.date)}
                    </TableCell>
                    <TableCell>
                      {expense.order?.order_number || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={expense.category_display || expense.category}
                        color={getStatusColor(expense.category)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {expense.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {formatCurrency(expense.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {expense.added_by_detail ? (
                        <Typography variant="body2">
                          {expense.added_by_detail.first_name} {expense.added_by_detail.last_name}
                        </Typography>
                      ) : 'N/A'}
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
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/expenses/${expense.id}`)}
                        title="View Details"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/expenses/${expense.id}/edit`)}
                        title="Edit"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredExpenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Box sx={{ py: 4 }}>
                      <Receipt sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No expenses found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {search || categoryFilter !== 'all' || orderFilter !== 'all' 
                          ? 'Try changing your search filters' 
                          : 'Add your first expense to get started'}
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
          count={filteredExpenses.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Category Summary */}
      {Object.keys(calculateExpensesByCategory()).length > 0 && (
        <Paper sx={{ mt: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Expenses by Category
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(calculateExpensesByCategory()).map(([category, total]) => (
              <Grid item xs={12} sm={6} md={3} key={category}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2">{category}</Typography>
                    <Typography variant="h6">{formatCurrency(total)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default ExpenseList;