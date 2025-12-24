import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Home,
  DriveEta,
  CalendarToday,
  Edit,
  Save,
  Cancel,
} from '@mui/icons-material';
import { Formik } from 'formik';
import { profileSchema, passwordChangeSchema } from '../../utils/validators';
import { usersService } from '../../services/users';
import { authService } from '../../services/auth';
import { formatDate } from '../../utils/helpers';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editPassword, setEditPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        const userData = await usersService.getUser(currentUser.id);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (values, { setSubmitting }) => {
    try {
      setError('');
      const updatedUser = await usersService.updateUser(user.id, values);
      setUser(updatedUser);
      authService.updateUser(updatedUser);
      setEditMode(false);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordChange = async (values, { setSubmitting, resetForm }) => {
    try {
      setError('');
      await usersService.changePassword(values);
      setEditPassword(false);
      resetForm();
      setSuccess('Password changed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Alert severity="error">
        User profile not found
      </Alert>
    );
  }

  const initialProfileValues = {
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    phone: user.phone || '',
    address: user.address || '',
  };

  const initialPasswordValues = {
    old_password: '',
    new_password: '',
    confirm_password: '',
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>

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
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                fontSize: 48,
                bgcolor: 'primary.main',
                mx: 'auto',
                mb: 2,
              }}
            >
              {user.first_name?.[0]}{user.last_name?.[0]}
            </Avatar>
            
            <Typography variant="h5" gutterBottom>
              {user.first_name} {user.last_name}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <Email fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
              {user.email}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <Phone fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
              {user.phone || 'Not provided'}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <Person fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
              {user.role === 'admin' ? 'Administrator' : 
               user.role === 'owner' ? 'Truck Owner' : 'Driver'}
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              <CalendarToday fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
              Joined: {formatDate(user.date_joined)}
            </Typography>

            {user.driving_license && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <DriveEta fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                <Typography variant="body2">
                  License: {user.driving_license}
                </Typography>
                {user.license_expiry && (
                  <Typography variant="caption" color="text.secondary">
                    Expires: {formatDate(user.license_expiry)}
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Personal Information</Typography>
              {!editMode ? (
                <Button
                  startIcon={<Edit />}
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <Box>
                  <Button
                    startIcon={<Cancel />}
                    onClick={() => setEditMode(false)}
                    sx={{ mr: 1 }}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>

            <Formik
              initialValues={initialProfileValues}
              validationSchema={profileSchema}
              onSubmit={handleProfileUpdate}
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
                  <Grid container spacing={2}>
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
                        disabled={!editMode || isSubmitting}
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
                        disabled={!editMode || isSubmitting}
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
                        disabled={!editMode || isSubmitting}
                      />
                    </Grid>
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
                        disabled={!editMode || isSubmitting}
                      />
                    </Grid>
                  </Grid>

                  {editMode && (
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<Save />}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </Box>
                  )}
                </form>
              )}
            </Formik>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Change Password</Typography>
              {!editPassword ? (
                <Button
                  startIcon={<Edit />}
                  onClick={() => setEditPassword(true)}
                >
                  Change Password
                </Button>
              ) : (
                <Box>
                  <Button
                    startIcon={<Cancel />}
                    onClick={() => setEditPassword(false)}
                    sx={{ mr: 1 }}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>

            {editPassword && (
              <Formik
                initialValues={initialPasswordValues}
                validationSchema={passwordChangeSchema}
                onSubmit={handlePasswordChange}
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
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          type="password"
                          label="Current Password"
                          name="old_password"
                          value={values.old_password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.old_password && Boolean(errors.old_password)}
                          helperText={touched.old_password && errors.old_password}
                          disabled={isSubmitting}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="password"
                          label="New Password"
                          name="new_password"
                          value={values.new_password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.new_password && Boolean(errors.new_password)}
                          helperText={touched.new_password && errors.new_password}
                          disabled={isSubmitting}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="password"
                          label="Confirm New Password"
                          name="confirm_password"
                          value={values.confirm_password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.confirm_password && Boolean(errors.confirm_password)}
                          helperText={touched.confirm_password && errors.confirm_password}
                          disabled={isSubmitting}
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<Save />}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Changing...' : 'Change Password'}
                      </Button>
                    </Box>
                  </form>
                )}
              </Formik>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserProfile;