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
  AddPhotoAlternate,
  Delete,
  Upload,
} from '@mui/icons-material';
import { Formik } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';
import { truckSchema } from '../../utils/validators';
import { trucksService } from '../../services/trucks';
import { usersService } from '../../services/users';
import { FUEL_TYPES } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';

const TruckForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [truck, setTruck] = useState(null);
  const [owners, setOwners] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [rcFile, setRcFile] = useState(null);
  const [insuranceFile, setInsuranceFile] = useState(null);
  const [pollutionFile, setPollutionFile] = useState(null);

  useEffect(() => {
    fetchOwners();
    fetchDrivers();
    if (isEdit) {
      fetchTruck();
    }
  }, [id]);

  const fetchTruck = async () => {
    try {
      setLoading(true);
      const truckData = await trucksService.getTruck(id);
      setTruck(truckData);
    } catch (error) {
      console.error('Error fetching truck:', error);
      setError('Failed to load truck data');
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

  const handleFileChange = (event, setFileFunction) => {
    const file = event.target.files[0];
    if (file) {
      setFileFunction(file);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setSuccess('');

      const formData = {
        ...values,
        year: parseInt(values.year),
        axle_count: parseInt(values.axle_count),
        capacity: parseFloat(values.capacity),
        current_mileage: parseFloat(values.current_mileage || 0),
      };

      // Add files if they exist
      if (rcFile) formData.rc_document = rcFile;
      if (insuranceFile) formData.insurance_document = insuranceFile;
      if (pollutionFile) formData.pollution_certificate = pollutionFile;

      if (isEdit) {
        await trucksService.updateTruck(id, formData);
        setSuccess('Truck updated successfully');
      } else {
        await trucksService.createTruck(formData);
        setSuccess('Truck created successfully');
      }

      setTimeout(() => {
        navigate('/admin/trucks');
      }, 1500);

    } catch (err) {
      const errorMsg = err.response?.data || 'An error occurred';
      setError(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = isEdit && truck ? {
    truck_number: truck.truck_number || '',
    model: truck.model || '',
    make: truck.make || '',
    year: truck.year || new Date().getFullYear(),
    axle_count: truck.axle_count || 2,
    capacity: truck.capacity || '',
    fuel_type: truck.fuel_type || 'Diesel',
    current_mileage: truck.current_mileage || 0,
    rc_expiry: truck.rc_expiry ? formatDate(truck.rc_expiry, { year: 'numeric', month: '2-digit', day: '2-digit' }) : '',
    insurance_expiry: truck.insurance_expiry ? formatDate(truck.insurance_expiry, { year: 'numeric', month: '2-digit', day: '2-digit' }) : '',
    pollution_expiry: truck.pollution_expiry ? formatDate(truck.pollution_expiry, { year: 'numeric', month: '2-digit', day: '2-digit' }) : '',
    status: truck.status || 'available',
    owner: truck.owner || '',
    assigned_driver: truck.assigned_driver || '',
  } : {
    truck_number: '',
    model: '',
    make: '',
    year: new Date().getFullYear(),
    axle_count: 2,
    capacity: '',
    fuel_type: 'Diesel',
    current_mileage: 0,
    rc_expiry: '',
    insurance_expiry: '',
    pollution_expiry: '',
    status: 'available',
    owner: '',
    assigned_driver: '',
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
          onClick={() => navigate('/admin/trucks')}
        >
          Back to Trucks
        </Button>
        <Typography variant="h4">
          {isEdit ? 'Edit Truck' : 'Add New Truck'}
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
        validationSchema={truckSchema}
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
                    Truck Details
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Truck Number"
                        name="truck_number"
                        placeholder="e.g., MH01AB1234"
                        value={values.truck_number}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.truck_number && Boolean(errors.truck_number)}
                        helperText={touched.truck_number && errors.truck_number}
                        disabled={isSubmitting}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Model"
                        name="model"
                        value={values.model}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.model && Boolean(errors.model)}
                        helperText={touched.model && errors.model}
                        disabled={isSubmitting}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Make"
                        name="make"
                        value={values.make}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.make && Boolean(errors.make)}
                        helperText={touched.make && errors.make}
                        disabled={isSubmitting}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Year"
                        name="year"
                        type="number"
                        value={values.year}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.year && Boolean(errors.year)}
                        helperText={touched.year && errors.year}
                        disabled={isSubmitting}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Axle Count"
                        name="axle_count"
                        type="number"
                        value={values.axle_count}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.axle_count && Boolean(errors.axle_count)}
                        helperText={touched.axle_count && errors.axle_count}
                        disabled={isSubmitting}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Capacity (tons)"
                        name="capacity"
                        type="number"
                        value={values.capacity}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.capacity && Boolean(errors.capacity)}
                        helperText={touched.capacity && errors.capacity}
                        disabled={isSubmitting}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">tons</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Fuel Type"
                        name="fuel_type"
                        value={values.fuel_type}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.fuel_type && Boolean(errors.fuel_type)}
                        helperText={touched.fuel_type && errors.fuel_type}
                        disabled={isSubmitting}
                      >
                        {FUEL_TYPES.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Current Mileage (km)"
                        name="current_mileage"
                        type="number"
                        value={values.current_mileage}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={isSubmitting}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">km</InputAdornment>,
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    Document Details
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="date"
                        label="RC Expiry Date"
                        name="rc_expiry"
                        value={values.rc_expiry}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.rc_expiry && Boolean(errors.rc_expiry)}
                        helperText={touched.rc_expiry && errors.rc_expiry}
                        disabled={isSubmitting}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<Upload />}
                          disabled={isSubmitting}
                          fullWidth
                        >
                          Upload RC Document
                          <input
                            type="file"
                            hidden
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, setRcFile)}
                          />
                        </Button>
                        {rcFile && (
                          <Typography variant="caption">
                            {rcFile.name}
                          </Typography>
                        )}
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Insurance Expiry Date"
                        name="insurance_expiry"
                        value={values.insurance_expiry}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.insurance_expiry && Boolean(errors.insurance_expiry)}
                        helperText={touched.insurance_expiry && errors.insurance_expiry}
                        disabled={isSubmitting}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<Upload />}
                          disabled={isSubmitting}
                          fullWidth
                        >
                          Upload Insurance Document
                          <input
                            type="file"
                            hidden
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, setInsuranceFile)}
                          />
                        </Button>
                        {insuranceFile && (
                          <Typography variant="caption">
                            {insuranceFile.name}
                          </Typography>
                        )}
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Pollution Certificate Expiry"
                        name="pollution_expiry"
                        value={values.pollution_expiry}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.pollution_expiry && Boolean(errors.pollution_expiry)}
                        helperText={touched.pollution_expiry && errors.pollution_expiry}
                        disabled={isSubmitting}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<Upload />}
                          disabled={isSubmitting}
                          fullWidth
                        >
                          Upload Pollution Certificate
                          <input
                            type="file"
                            hidden
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, setPollutionFile)}
                          />
                        </Button>
                        {pollutionFile && (
                          <Typography variant="caption">
                            {pollutionFile.name}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    Ownership & Assignment
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
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
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Assigned Driver (Optional)</InputLabel>
                        <Select
                          name="assigned_driver"
                          value={values.assigned_driver}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={isSubmitting}
                          label="Assigned Driver (Optional)"
                        >
                          <MenuItem value="">
                            <em>No driver assigned</em>
                          </MenuItem>
                          {drivers.map((driver) => (
                            <MenuItem key={driver.id} value={driver.id}>
                              {driver.first_name} {driver.last_name}
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
                        <MenuItem value="available">Available</MenuItem>
                        <MenuItem value="on_trip">On Trip</MenuItem>
                        <MenuItem value="maintenance">Maintenance</MenuItem>
                        <MenuItem value="out_of_service">Out of Service</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      onClick={() => navigate('/admin/trucks')}
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
                      {isSubmitting ? 'Saving...' : (isEdit ? 'Update Truck' : 'Create Truck')}
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Important Notes
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      1. Truck number must be in the format: State Code + Number (e.g., MH01AB1234)
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      2. All documents must be valid and not expired. Upload clear scanned copies.
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      3. Capacity should be in metric tons.
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      4. Mileage should be the current reading from the odometer.
                    </Typography>

                    {isEdit && truck && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" gutterBottom>
                          Current Information:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Created: {formatDate(truck.created_at)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Last Updated: {formatDate(truck.updated_at)}
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

export default TruckForm;