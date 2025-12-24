import api from './api';

export const usersService = {
  getUsers: async () => {
    try {
      const response = await api.get('/api/users/');
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      return [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  getUser: async (id) => {
    try {
      const response = await api.get(`/api/users/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await api.post('/api/users/', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/api/users/${id}/`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/api/users/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  getDrivers: async () => {
    try {
      const response = await api.get('/api/users/drivers/');
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      return [];
    } catch (error) {
      console.error('Error fetching drivers:', error);
      return [];
    }
  },

  getOwners: async () => {
    try {
      const response = await api.get('/api/users/owners/');
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      return [];
    } catch (error) {
      console.error('Error fetching owners:', error);
      return [];
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await api.put('/api/users/update_profile/', userData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await api.post('/api/auth/change_password/', passwordData);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
};