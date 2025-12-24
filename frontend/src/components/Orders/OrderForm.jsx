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
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Divider,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Save,
  ArrowBack,
  LocalShipping,
  AttachMoney,
  CalendarToday,
  LocationOn,
  Person,
} from '@mui/icons-material';
import { Formik } from 'formik';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { orderSchema } from '../../utils/validators';
import { ordersService } from '../../services/orders';
import { usersService } from '../../services/users';
import { trucksService } from '../../services/trucks';
import { LOAD_TYPES } from '../../utils/constants';
import { formatDate, formatCurrency } from '../../utils/helpers';

const OrderForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [owners, setOwners] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Basic Details', 'Load Information', 'Financials', 'Assignments'];

  useEffect(() => {
    fetchOwners();
    fetchDrivers();
    fetchTrucks();
    if (isEdit) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const orderData = await ordersService.getOrder(id);
      setOrder(orderData);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order data');
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      const data = await usersService.getOwners();
      setOwners(data);
    } catch (error) {
      console.error('Error fetching owners:', error);
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

  const fetchTrucks = async () => {
    try {
      const data = await trucksService.getTrucks();
      setTrucks(data);
    } catch (error) {
      console.error('Error fetching trucks:', error);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setSuccess('');

      const formData = {
        ...values,
        weight: parseFloat(values.weight),
        volume: values.volume ? parseFloat(values.volume) : null,
        total_amount: parseFloat(values.total_amount),
        advance_amount: parseFloat(values.advance_amount || 0),
        owner: parseInt(values.owner),
        driver: values.driver ? parseInt(values.driver) : null,
        truck: values.truck ? parseInt(values.truck) : null,
      };

      if (isEdit) {
        await ordersService.updateOrder(id, formData);
        setSuccess('Order updated successfully');
      } else {
        await ordersService.createOrder(formData);
        setSuccess('Order created successfully');
      }

      setTimeout(() => {
        navigate('/admin/orders');
      }, 1500);

    } catch (err) {
      const errorMsg = err.response?.data || 'An error occurred';
      setError(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const getTrucksByOwner = (ownerId) => {
    return trucks.filter(truck => truck.owner === parseInt(ownerId));
  };

  const initialValues = isEdit && order ? {
    description: order.description || '',
    pickup_location: order.pickup_location || '',
    pickup_contact: order.pickup_contact || '',
    pickup_phone: order.pickup_phone || '',
    delivery_location: order.delivery_location || '',
    delivery_contact: order.delivery_contact || '',
    delivery_phone: order.delivery_phone || '',
    pickup_date: order.pickup_date ? formatDate(order.pickup_date, { year: 'numeric', month: '2-digit', day: '2-digit' }) : '',
    estimated_delivery_date: order.estimated_delivery_date ? formatDate(order.estimated_delivery_date, { year: 'numeric', month: '2-digit', day: '2-digit' }) : '',
    load_type: order.load_type || '',
    weight: order.weight || '',
    volume: order.volume || '',
    total_amount: order.total_amount || '',
    advance_amount: order.advance_amount || 0,
    owner: order.owner?.id || '',
    driver: order.driver?.id || '',
    truck: order.truck?.id || '',
    status: order.status || 'pending',
  } : {
    description: '',
    pickup_location: '',
    pickup_contact: '',
    pickup_phone: '',
    delivery_location: '',
    delivery_contact: '',
    delivery_phone: '',
    pickup_date: '',
    estimated_delivery_date: '',
    load_type: '',
    weight: '',
    volume: '',
    total_amount: '',
    advance_amount: 0,
    owner: '',
    driver: '',
    truck: '',
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
          onClick={() => navigate('/admin/orders')}
        >
          Back to Orders
        </Button>
        <Typography variant="h4">
          <LocalShipping sx={{ verticalAlign: 'middle', mr: 1 }} />
          {isEdit ? 'Edit Order' : 'Create New Order'}
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

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Formik
        initialValues={initialValues}
        validationSchema={orderSchema}
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
          validateForm,
        }) => {
          const validateStep = async () => {
            const errors = await validateForm();
            const stepFields = {
              0: ['description', 'pickup_location', 'pickup_contact', 'pickup_phone', 'delivery_location', 'delivery_contact', 'delivery_phone'],
              1: ['pickup_date', 'estimated_delivery_date', 'load_type', 'weight'],
              2: ['total_amount', 'advance_amount', 'owner'],
              3: [],
            };
            
            const stepErrors = Object.keys(errors).filter(key => 
              stepFields[activeStep]?.includes(key)
            );
            
            return stepErrors.length === 0;
          };

          const handleNextStep = async () => {
            const isValid = await validateStep();
            if (isValid && activeStep < steps.length - 1) {
              handleNext();
            }
          };

          return (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3 }}>
                    {activeStep === 0 && (
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                          <LocationOn sx={{ verticalAlign: 'middle', mr: 1 }} />
                          Basic Details
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              multiline
                              rows={3}
                              label="Order Description"
                              name="description"
                              value={values.description}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={touched.description && Boolean(errors.description)}
                              helperText={touched.description && errors.description}
                              disabled={isSubmitting}
                            />
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              Pickup Information
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Pickup Location"
                              name="pickup_location"
                              value={values.pickup_location}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={touched.pickup_location && Boolean(errors.pickup_location)}
                              helperText={touched.pickup_location && errors.pickup_location}
                              disabled={isSubmitting}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Pickup Contact Person"
                              name="pickup_contact"
                              value={values.pickup_contact}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={touched.pickup_contact && Boolean(errors.pickup_contact)}
                              helperText={touched.pickup_contact && errors.pickup_contact}
                              disabled={isSubmitting}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Pickup Phone"
                              name="pickup_phone"
                              value={values.pickup_phone}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={touched.pickup_phone && Boolean(errors.pickup_phone)}
                              helperText={touched.pickup_phone && errors.pickup_phone}
                              disabled={isSubmitting}
                            />
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                              Delivery Information
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Delivery Location"
                              name="delivery_location"
                              value={values.delivery_location}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={touched.delivery_location && Boolean(errors.delivery_location)}
                              helperText={touched.delivery_location && errors.delivery_location}
                              disabled={isSubmitting}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Delivery Contact Person"
                              name="delivery_contact"
                              value={values.delivery_contact}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={touched.delivery_contact && Boolean(errors.delivery_contact)}
                              helperText={touched.delivery_contact && errors.delivery_contact}
                              disabled={isSubmitting}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Delivery Phone"
                              name="delivery_phone"
                              value={values.delivery_phone}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={touched.delivery_phone && Boolean(errors.delivery_phone)}
                              helperText={touched.delivery_phone && errors.delivery_phone}
                              disabled={isSubmitting}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    )}

                    {activeStep === 1 && (
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                          <CalendarToday sx={{ verticalAlign: 'middle', mr: 1 }} />
                          Load Information & Dates
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              type="datetime-local"
                              label="Pickup Date & Time"
                              name="pickup_date"
                              value={values.pickup_date}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={touched.pickup_date && Boolean(errors.pickup_date)}
                              helperText={touched.pickup_date && errors.pickup_date}
                              disabled={isSubmitting}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              type="datetime-local"
                              label="Estimated Delivery Date & Time"
                              name="estimated_delivery_date"
                              value={values.estimated_delivery_date}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={touched.estimated_delivery_date && Boolean(errors.estimated_delivery_date)}
                              helperText={touched.estimated_delivery_date && errors.estimated_delivery_date}
                              disabled={isSubmitting}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <TextField
                              select
                              fullWidth
                              label="Load Type"
                              name="load_type"
                              value={values.load_type}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={touched.load_type && Boolean(errors.load_type)}
                              helperText={touched.load_type && errors.load_type}
                              disabled={isSubmitting}
                            >
                              {LOAD_TYPES.map((type) => (
                                <MenuItem key={type} value={type}>
                                  {type}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Weight (tons)"
                              name="weight"
                              type="number"
                              value={values.weight}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={touched.weight && Boolean(errors.weight)}
                              helperText={touched.weight && errors.weight}
                              disabled={isSubmitting}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">tons</InputAdornment>,
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Volume (m³)"
                              name="volume"
                              type="number"
                              value={values.volume}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              disabled={isSubmitting}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">m³</InputAdornment>,
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    )}

                    {activeStep === 2 && (
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                          <AttachMoney sx={{ verticalAlign: 'middle', mr: 1 }} />
                          Financial Details
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Total Amount"
                              name="total_amount"
                              type="number"
                              value={values.total_amount}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={touched.total_amount && Boolean(errors.total_amount)}
                              helperText={touched.total_amount && errors.total_amount}
                              disabled={isSubmitting}
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Advance Amount"
                              name="advance_amount"
                              type="number"
                              value={values.advance_amount}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={touched.advance_amount && Boolean(errors.advance_amount)}
                              helperText={touched.advance_amount && errors.advance_amount}
                              disabled={isSubmitting}
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                              }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              Balance Amount: {formatCurrency(values.total_amount - values.advance_amount)}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <FormControl fullWidth error={touched.owner && Boolean(errors.owner)}>
                              <InputLabel>Owner</InputLabel>
                              <Select
                                name="owner"
                                value={values.owner}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={isSubmitting}
                                label="Owner"
                              >
                                {owners.map((owner) => (
                                  <MenuItem key={owner.id} value={owner.id}>
                                    {owner.first_name} {owner.last_name} ({owner.email})
                                  </MenuItem>
                                ))}
                              </Select>
                              {touched.owner && errors.owner && (
                                <FormHelperText>{errors.owner}</FormHelperText>
                              )}
                            </FormControl>
                          </Grid>
                        </Grid>
                      </Box>
                    )}

                    {activeStep === 3 && (
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                          <Person sx={{ verticalAlign: 'middle', mr: 1 }} />
                          Assignments
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                              <InputLabel>Driver (Optional)</InputLabel>
                              <Select
                                name="driver"
                                value={values.driver}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={isSubmitting}
                                label="Driver (Optional)"
                              >
                                <MenuItem value="">
                                  <em>No driver assigned</em>
                                </MenuItem>
                                {drivers.map((driver) => (
                                  <MenuItem key={driver.id} value={driver.id}>
                                    {driver.first_name} {driver.last_name} ({driver.driving_license})
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                              <InputLabel>Truck (Optional)</InputLabel>
                              <Select
                                name="truck"
                                value={values.truck}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={isSubmitting}
                                label="Truck (Optional)"
                              >
                                <MenuItem value="">
                                  <em>No truck assigned</em>
                                </MenuItem>
                                {getTrucksByOwner(values.owner).map((truck) => (
                                  <MenuItem key={truck.id} value={truck.id}>
                                    {truck.truck_number} - {truck.model} ({truck.capacity} tons)
                                  </MenuItem>
                                ))}
                              </Select>
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
                              <MenuItem value="assigned">Assigned</MenuItem>
                              <MenuItem value="in_transit">In Transit</MenuItem>
                              <MenuItem value="delivered">Delivered</MenuItem>
                              <MenuItem value="cancelled">Cancelled</MenuItem>
                            </TextField>
                          </Grid>
                        </Grid>
                      </Box>
                    )}

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        onClick={handleBack}
                        disabled={activeStep === 0 || isSubmitting}
                      >
                        Back
                      </Button>
                      
                      {activeStep === steps.length - 1 ? (
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<Save />}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Saving...' : (isEdit ? 'Update Order' : 'Create Order')}
                        </Button>
                      ) : (
                        <Button
                          onClick={handleNextStep}
                          variant="contained"
                        >
                          Next
                        </Button>
                      )}
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Order Summary
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Route
                        </Typography>
                        <Typography variant="body2">
                          {values.pickup_location || 'Pickup location'} → {values.delivery_location || 'Delivery location'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Load Details
                        </Typography>
                        <Typography variant="body2">
                          {values.load_type || 'Load type'} • {values.weight || '0'} tons
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Financial Summary
                        </Typography>
                        <Typography variant="body2">
                          Total: {formatCurrency(values.total_amount || 0)}
                        </Typography>
                        <Typography variant="body2">
                          Advance: {formatCurrency(values.advance_amount || 0)}
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          Balance: {formatCurrency((values.total_amount || 0) - (values.advance_amount || 0))}
                        </Typography>
                      </Box>
                      
                      {values.owner && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Owner
                          </Typography>
                          {(() => {
                            const owner = owners.find(o => o.id === parseInt(values.owner));
                            return owner ? (
                              <Typography variant="body2">
                                {owner.first_name} {owner.last_name}
                              </Typography>
                            ) : null;
                          })()}
                        </Box>
                      )}

                      {isEdit && order && (
                        <>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="subtitle2" gutterBottom>
                            Order Information:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Order #: {order.order_number}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Created: {formatDate(order.created_at)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Last Updated: {formatDate(order.updated_at)}
                          </Typography>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </form>
          );
        }}
      </Formik>
    </Box>
  );
};

export default OrderForm;