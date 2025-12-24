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
  AttachMoney,
} from '@mui/icons-material';
import { Formik } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';
import { transferSchema } from '../../utils/validators';
import { transfersService } from '../../services/transfers';
import { ordersService } from '../../services/orders';
import { TRANSFER_TYPES } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';

const TransferForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [transfer, setTransfer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);

  useEffect(() => {
    fetchOrders();
    if (isEdit) {
      fetchTransfer();
    }
  }, [id]);

  const fetchTransfer = async () => {
    try {
      setLoading(true);
      const transferData = await transfersService.getTransfer(id);
      setTransfer(transferData);
    } catch (error) {
      console.error('Error fetching transfer:', error);
      setError('Failed to load transfer data');
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
      setReceiptFile(file);
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

      // Add receipt file if exists
      if (receiptFile) formData.receipt = receiptFile;

      if (isEdit) {
        await transfersService.updateTransfer(id, formData);
        setSuccess('Transfer updated successfully');
      } else {
        await transfersService.createTransfer(formData);
        setSuccess('Transfer created successfully');
      }

      setTimeout(() => {
        navigate('/admin/transfers');
      }, 1500);

    } catch (err) {
      const errorMsg = err.response?.data || 'An error occurred';
      setError(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = isEdit && transfer ? {
    transfer_type: transfer.transfer_type || '',
    amount: transfer.amount || '',
    description: transfer.description || '',
    order: transfer.order?.id || '',
    transaction_id: transfer.transaction_id || '',
    bank_name: transfer.bank_name || '',
    account_number: transfer.account_number || '',
    ifsc_code: transfer.ifsc_code || '',
    status: transfer.status || 'pending',
  } : {
    transfer_type: '',
    amount: '',
    description: '',
    order: '',
    transaction_id: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    status: 'pending',
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
          onClick={() => navigate('/admin/transfers')}
        >
          Back to Transfers
        </Button>
        <Typography variant="h4">
          <AttachMoney sx={{ verticalAlign: 'middle', mr: 1 }} />
          {isEdit ? 'Edit Transfer' : 'Create New Transfer'}
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
        validationSchema={transferSchema}
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
                    Transfer Details
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Transfer Type"
                        name="transfer_type"
                        value={values.transfer_type}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.transfer_type && Boolean(errors.transfer_type)}
                        helperText={touched.transfer_type && errors.transfer_type}
                        disabled={isSubmitting}
                      >
                        {TRANSFER_TYPES.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
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
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Status"
                        name="status"
                        value={values.status}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={isSubmitting}
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="failed">Failed</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle1" gutterBottom>
                        Transaction Details (Optional)
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Transaction ID"
                        name="transaction_id"
                        value={values.transaction_id}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={isSubmitting}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Bank Name"
                        name="bank_name"
                        value={values.bank_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={isSubmitting}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Account Number"
                        name="account_number"
                        value={values.account_number}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={isSubmitting}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="IFSC Code"
                        name="ifsc_code"
                        value={values.ifsc_code}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={isSubmitting}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle1" gutterBottom>
                        Receipt Upload (Optional)
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 1 }}>
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<Upload />}
                          disabled={isSubmitting}
                        >
                          Upload Receipt
                          <input
                            type="file"
                            hidden
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                          />
                        </Button>
                        {receiptFile && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {receiptFile.name}
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Upload receipt/confirmation document (PDF, JPG, PNG)
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      onClick={() => navigate('/admin/transfers')}
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
                      {isSubmitting ? 'Saving...' : (isEdit ? 'Update Transfer' : 'Create Transfer')}
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Transfer Guidelines
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      1. Select the correct transfer type based on the money flow direction.
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      2. Ensure the amount matches the actual transaction amount.
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      3. Provide a clear description for future reference.
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      4. Link the transfer to the relevant order for proper tracking.
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      5. Upload receipt/confirmation for audit purposes.
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

export default TransferForm;