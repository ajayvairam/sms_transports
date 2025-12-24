import api from './api';

export const transfersService = {
  getTransfers: async (params = {}) => {
    try {
      const response = await api.get('/api/transport/transfers/', { params });
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      return [];
    } catch (error) {
      console.error('Error fetching transfers:', error);
      return [];
    }
  },

  getTransfer: async (id) => {
    try {
      const response = await api.get(`/api/transport/transfers/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transfer:', error);
      throw error;
    }
  },

  createTransfer: async (transferData) => {
    try {
      const formData = new FormData();
      
      Object.keys(transferData).forEach(key => {
        if (transferData[key] !== null && transferData[key] !== undefined) {
          if (transferData[key] instanceof File) {
            formData.append(key, transferData[key]);
          } else {
            formData.append(key, transferData[key]);
          }
        }
      });

      const response = await api.post('/api/transport/transfers/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating transfer:', error);
      throw error;
    }
  },

  updateTransfer: async (id, transferData) => {
    try {
      const formData = new FormData();
      
      Object.keys(transferData).forEach(key => {
        if (transferData[key] !== null && transferData[key] !== undefined) {
          if (transferData[key] instanceof File) {
            formData.append(key, transferData[key]);
          } else {
            formData.append(key, transferData[key]);
          }
        }
      });

      const response = await api.put(`/api/transport/transfers/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating transfer:', error);
      throw error;
    }
  },

  deleteTransfer: async (id) => {
    try {
      const response = await api.delete(`/api/transport/transfers/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting transfer:', error);
      throw error;
    }
  },

  getTransfersByOrder: async (orderId) => {
    try {
      const response = await api.get('/api/transport/transfers/', { 
        params: { order: orderId } 
      });
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      return [];
    } catch (error) {
      console.error('Error fetching transfers by order:', error);
      return [];
    }
  }
};