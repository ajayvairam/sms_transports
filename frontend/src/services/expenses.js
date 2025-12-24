import api from './api';

export const expensesService = {
  getExpenses: async (params = {}) => {
    const response = await api.get('/api/transport/expenses/', { params });
    return response.data;
  },

  getExpense: async (id) => {
    const response = await api.get(`/api/transport/expenses/${id}/`);
    return response.data;
  },

  createExpense: async (expenseData) => {
    const formData = new FormData();
    
    Object.keys(expenseData).forEach(key => {
      if (expenseData[key] !== null && expenseData[key] !== undefined) {
        if (expenseData[key] instanceof File) {
          formData.append(key, expenseData[key]);
        } else {
          formData.append(key, expenseData[key]);
        }
      }
    });

    const response = await api.post('/api/transport/expenses/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateExpense: async (id, expenseData) => {
    const formData = new FormData();
    
    Object.keys(expenseData).forEach(key => {
      if (expenseData[key] !== null && expenseData[key] !== undefined) {
        if (expenseData[key] instanceof File) {
          formData.append(key, expenseData[key]);
        } else {
          formData.append(key, expenseData[key]);
        }
      }
    });

    const response = await api.put(`/api/transport/expenses/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteExpense: async (id) => {
    const response = await api.delete(`/api/transport/expenses/${id}/`);
    return response.data;
  },

  getExpensesByOrder: async (orderId) => {
    const response = await api.get('/api/transport/expenses/', { 
      params: { order: orderId } 
    });
    return response.data;
  }
};