import api from './api';

export const ordersService = {
  getOrders: async (params = {}) => {
    try {
      const response = await api.get('/api/transport/orders/', { params });
      // Handle both array and object responses
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      } else if (response.data && typeof response.data === 'object') {
        // Convert object to array if needed
        return Object.values(response.data);
      }
      return [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  getOrder: async (id) => {
    try {
      const response = await api.get(`/api/transport/orders/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  createOrder: async (orderData) => {
    try {
      const response = await api.post('/api/transport/orders/', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  updateOrder: async (id, orderData) => {
    try {
      const response = await api.put(`/api/transport/orders/${id}/`, orderData);
      return response.data;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  deleteOrder: async (id) => {
    try {
      const response = await api.delete(`/api/transport/orders/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  },

  getOrderTimeline: async (id) => {
    try {
      const response = await api.get(`/api/transport/orders/${id}/timeline/`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching timeline:', error);
      return [];
    }
  },

  getOrderExpenses: async (id) => {
    try {
      const response = await api.get(`/api/transport/orders/${id}/expenses/`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return [];
    }
  },

  getOrderTransfers: async (id) => {
    try {
      const response = await api.get(`/api/transport/orders/${id}/transfers/`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching transfers:', error);
      return [];
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      const response = await api.post(`/api/transport/orders/${id}/update_status/`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  },

  getDashboardStats: async () => {
    try {
      const response = await api.get('/api/transport/dashboard/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        total_orders: 0,
        active_orders: 0,
        total_revenue: 0,
        pending_amount: 0,
        total_expenses: 0,
        total_profit: 0,
        recent_orders: [],
        upcoming_deliveries: [],
        recent_expenses: []
      };
    }
  }
};