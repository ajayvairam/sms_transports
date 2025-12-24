import api from './api';

export const trucksService = {
  getTrucks: async (params = {}) => {
    try {
      const response = await api.get('/api/transport/trucks/', { params });
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      return [];
    } catch (error) {
      console.error('Error fetching trucks:', error);
      return [];
    }
  },

  getTruck: async (id) => {
    try {
      const response = await api.get(`/api/transport/trucks/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching truck:', error);
      throw error;
    }
  },

  createTruck: async (truckData) => {
    try {
      const formData = new FormData();
      
      Object.keys(truckData).forEach(key => {
        if (truckData[key] !== null && truckData[key] !== undefined) {
          if (truckData[key] instanceof File) {
            formData.append(key, truckData[key]);
          } else {
            formData.append(key, truckData[key]);
          }
        }
      });

      const response = await api.post('/api/transport/trucks/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating truck:', error);
      throw error;
    }
  },

  updateTruck: async (id, truckData) => {
    try {
      const formData = new FormData();
      
      Object.keys(truckData).forEach(key => {
        if (truckData[key] !== null && truckData[key] !== undefined) {
          if (truckData[key] instanceof File) {
            formData.append(key, truckData[key]);
          } else {
            formData.append(key, truckData[key]);
          }
        }
      });

      const response = await api.put(`/api/transport/trucks/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating truck:', error);
      throw error;
    }
  },

  deleteTruck: async (id) => {
    try {
      const response = await api.delete(`/api/transport/trucks/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting truck:', error);
      throw error;
    }
  },

  assignDriver: async (truckId, driverId) => {
    try {
      const response = await api.post(
        `/api/transport/trucks/${truckId}/assign_driver/`,
        { driver_id: driverId }
      );
      return response.data;
    } catch (error) {
      console.error('Error assigning driver:', error);
      throw error;
    }
  },

  getAvailableTrucks: async () => {
    try {
      const response = await api.get('/api/transport/trucks/', {
        params: { status: 'available' },
      });
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      return [];
    } catch (error) {
      console.error('Error fetching available trucks:', error);
      return [];
    }
  }
};