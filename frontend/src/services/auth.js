import api from './api';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/api/auth/login/', { email, password });
      
      if (response.data) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        
        // Store user data from response
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } else {
          // If no user in response, create minimal user object
          const minimalUser = {
            email: email,
            role: response.data.role || 'user'
          };
          localStorage.setItem('user', JSON.stringify(minimalUser));
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/api/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (error) {
      console.error('Error parsing user:', error);
    }
    return null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token');
      }
      
      const response = await api.post('/api/auth/token/refresh/', {
        refresh: refreshToken
      });
      
      if (response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        return response.data.access;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      authService.logout();
      throw error;
    }
  },

  getAuthHeader: () => {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};