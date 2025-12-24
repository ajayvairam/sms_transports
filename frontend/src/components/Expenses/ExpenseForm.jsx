import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Divider,
} from '@mui/material';
import {
  Save,
  ArrowBack,
  Upload,
  Receipt,
  Delete,
} from '@mui/icons-material';
import { Formik } from 'formik';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { expenseSchema } from '../../utils/validators';
import { expensesService } from '../../services/expenses';
import { ordersService } from '../../services/orders';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';

const ExpenseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [expense, setExpense] = useState(null);
  const [orders, setOrders] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [billFile, setBillFile] = useState(null);
  const [fileError, setFileError] = useState('');

  // Get order ID from query params
  const queryParams = new URLSearchParams(location.search);
  const orderIdFromQuery = queryParams.get('order');

  useEffect(() => {
    fetchOrders();
    if (isEdit) {
      fetchExpense();
    }
  }, [id]);

  const fetchExpense = async () => {
    try {
      setLoading(true);
      const expenseData = await expensesService.getExpense(id);
      setExpense(expenseData);
    } catch (error) {
      console.error('Error fetching expense:', error);
      setError('Failed to load expense data');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await ordersService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validation = expensesService.validateExpenseBill(file);
      if (validation.valid) {
        setBillFile(file);
        setFileError('');
      } else {
        setFileError(validation.message);
      }
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setSuccess('');

      const formData = {
        ...values,
        amount: parseFloat(values.amount),
        order: parseInt(values.order),
      };

      // Add bill file if exists
      if (billFile) formData.bill_photo = billFile;

      if (isEdit) {
        await expensesService.updateExpense(id, formData);
        setSuccess('Expense updated successfully');
      } else {
        await expensesService.createExpense(formData);
        setSuccess('Expense created successfully');
      }

      setTimeout(() => {
        navigate('/admin/expenses');
      }, 1500);

    } catch (err) {
      const errorMsg = err.response?.data || 'An error occurred';
      setError(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = isEdit && expense ? {
    category: expense.category || '',
    description: expense.description || '',
    amount: expense.amount || '',
    order: expense.order?.id || orderIdFromQuery || '',
  } : {
    category: '',
    description: '',
    amount: '',
    order: orderIdFromQuery || '',
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/expenses')}
        >
          Back to Expenses
        </Button>
        <Typography variant="h4">
          <Receipt sx={{ verticalAlign: 'middle', mr: 1 }} />
          {isEdit ? 'Edit Expense' : 'Add New Expense'}
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={expenseSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    Expense Details
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Category"
                        name="category"
                        value={values.category}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.category && Boolean(errors.category)}
                        helperText={touched.category && errors.category}
                        disabled={isSubmitting}
                      >
                        {EXPENSE_CATEGORIES.map((category) => (
                          <MenuItem key={category.value} value={category.value}>
                            {category.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Amount"
                        name="amount"
                        type="number"
                        value={values.amount}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.amount && Boolean(errors.amount)}
                        helperText={touched.amount && errors.amount}
                        disabled={isSubmitting}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        multiline
                        rows={3}
                        value={values.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.description && Boolean(errors.description)}
                        helperText={touched.description && errors.description}
                        disabled={isSubmitting}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth error={touched.order && Boolean(errors.order)}>
                        <InputLabel>Order</InputLabel>
                        <Select
                          name="order"
                          value={values.order}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={isSubmitting}
                          label="Order"
                        >
                          {orders.map((order) => (
                            <MenuItem key={order.id} value={order.id}>
                              {order.order_number} - {order.load_type} ({formatCurrency(order.total_amount)})
                            </MenuItem>
                          ))}
                        </Select>
                        {touched.order && errors.order && (
                          <FormHelperText>{errors.order}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle1" gutterBottom>
                        Bill Upload (Optional)
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 1 }}>
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<Upload />}
                          disabled={isSubmitting}
                        >
                          Upload Bill
                          <input
                            type="file"
                            hidden
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                          />
                        </Button>
                        {billFile && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">
                              {billFile.name}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => setBillFile(null)}
                              disabled={isSubmitting}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                      {fileError && (
                        <Typography variant="caption" color="error">
                          {fileError}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        Supported formats: PDF, JPG, JPEG, PNG (Max 5MB)
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      onClick={() => navigate('/admin/expenses')}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Save />}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : (isEdit ? 'Update Expense' : 'Create Expense')}
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Expense Guidelines
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      1. Select the appropriate category for proper tracking.
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      2. Provide a clear description for future reference.
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      3. Upload bill/receipt for verification and audit purposes.
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      4. Link the expense to the relevant order for proper accounting.
                    </Typography>

                    {values.order && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" gutterBottom>
                          Selected Order:
                        </Typography>
                        {(() => {
                          const selectedOrder = orders.find(o => o.id === parseInt(values.order));
                          return selectedOrder ? (
                            <Box>
                              <Typography variant="body2">
                                {selectedOrder.order_number}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {selectedOrder.load_type} • {selectedOrder.pickup_location} → {selectedOrder.delivery_location}
                              </Typography>
                            </Box>
                          ) : null;
                        })()}
                      </>
                    )}

                    {isEdit && expense && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" gutterBottom>
                          Expense Information:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Created: {expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Added By: {expense.added_by_detail?.first_name} {expense.added_by_detail?.last_name}
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default ExpenseForm;