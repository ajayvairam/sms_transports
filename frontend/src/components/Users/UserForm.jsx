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
  FormControlLabel,
  Switch,
  Card,
  CardContent,
} from '@mui/material';
import {
  Save,
  ArrowBack,
  PersonAdd,
  Person,
} from '@mui/icons-material';
import { Formik } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';
import { userSchema } from '../../utils/validators';
import { usersService } from '../../services/users';
import { formatDate } from '../../utils/helpers';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const userData = await usersService.getUser(id);
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setSuccess('');

      if (isEdit) {
        await usersService.updateUser(id, values);
        setSuccess('User updated successfully');
      } else {
        await usersService.createUser(values);
        setSuccess('User created successfully');
      }

      setTimeout(() => {
        navigate('/admin/users');
      }, 1500);

    } catch (err) {
      const errorMsg = err.response?.data || 'An error occurred';
      setError(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = isEdit && user ? {
    email: user.email || '',
    username: user.username || '',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    phone: user.phone || '',
    role: user.role || 'driver',
    address: user.address || '',
    driving_license: user.driving_license || '',
    license_expiry: user.license_expiry || '',
    is_active: user.is_active ?? true,
    isEdit: true,
  } : {
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'driver',
    address: '',
    driving_license: '',
    license_expiry: '',
    password: '',
    confirmPassword: '',
    is_active: true,
    isEdit: false,
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
          onClick={() => navigate('/admin/users')}
        >
          Back to Users
        </Button>
        <Typography variant="h4">
          {isEdit ? 'Edit User' : 'Create New User'}
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

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Formik
              initialValues={initialValues}
              validationSchema={userSchema}
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
                setFieldValue,
              }) => (
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
                        disabled={isSubmitting || isEdit}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Username"
                        name="username"
                        value={values.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.username && Boolean(errors.username)}
                        helperText={touched.username && errors.username}
                        disabled={isSubmitting || isEdit}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="first_name"
                        value={values.first_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.first_name && Boolean(errors.first_name)}
                        helperText={touched.first_name && errors.first_name}
                        disabled={isSubmitting}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="last_name"
                        value={values.last_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.last_name && Boolean(errors.last_name)}
                        helperText={touched.last_name && errors.last_name}
                        disabled={isSubmitting}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        value={values.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.phone && Boolean(errors.phone)}
                        helperText={touched.phone && errors.phone}
                        disabled={isSubmitting}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Role"
                        name="role"
                        value={values.role}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.role && Boolean(errors.role)}
                        helperText={touched.role && errors.role}
                        disabled={isSubmitting}
                      >
                        <MenuItem value="admin">Administrator</MenuItem>
                        <MenuItem value="owner">Truck Owner</MenuItem>
                        <MenuItem value="driver">Driver</MenuItem>
                      </TextField>
                    </Grid>

                    {!isEdit && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="password"
                            label="Password"
                            name="password"
                            value={values.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.password && Boolean(errors.password)}
                            helperText={touched.password && errors.password}
                            disabled={isSubmitting}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="password"
                            label="Confirm Password"
                            name="confirmPassword"
                            value={values.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                            helperText={touched.confirmPassword && errors.confirmPassword}
                            disabled={isSubmitting}
                          />
                        </Grid>
                      </>
                    )}

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Address"
                        name="address"
                        value={values.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.address && Boolean(errors.address)}
                        helperText={touched.address && errors.address}
                        disabled={isSubmitting}
                      />
                    </Grid>

                    {values.role === 'driver' && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Driving License Number"
                            name="driving_license"
                            value={values.driving_license}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.driving_license && Boolean(errors.driving_license)}
                            helperText={touched.driving_license && errors.driving_license}
                            disabled={isSubmitting}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="date"
                            label="License Expiry Date"
                            name="license_expiry"
                            value={values.license_expiry}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.license_expiry && Boolean(errors.license_expiry)}
                            helperText={touched.license_expiry && errors.license_expiry}
                            disabled={isSubmitting}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                      </>
                    )}

                    {isEdit && (
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={values.is_active}
                              onChange={(e) => setFieldValue('is_active', e.target.checked)}
                              name="is_active"
                              disabled={isSubmitting}
                            />
                          }
                          label="Active User"
                        />
                      </Grid>
                    )}
                  </Grid>

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      onClick={() => navigate('/admin/users')}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={isEdit ? <Save /> : <PersonAdd />}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : (isEdit ? 'Update User' : 'Create User')}
                    </Button>
                  </Box>
                </form>
              )}
            </Formik>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Person sx={{ verticalAlign: 'middle', mr: 1 }} />
                User Information
              </Typography>
              
              {isEdit && user && (
                <>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    User ID: {user.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Created: {formatDate(user.date_joined)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Last Login: {user.last_login ? formatDate(user.last_login) : 'Never'}
                  </Typography>
                  
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Current Status:
                    </Typography>
                    <Typography variant="body2" color={user.is_active ? 'success.main' : 'error.main'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Typography>
                  </Box>
                </>
              )}
              
              {!isEdit && (
                <Typography variant="body2" color="text.secondary">
                  Fill in all required fields to create a new user. The user will receive login credentials via email.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserForm;