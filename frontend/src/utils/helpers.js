export const formatCurrency = (amount, currency = 'INR') => {
  if (! amount && amount !== 0) return '₹0. 00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits:  2,
    maximumFractionDigits: 2,
  }).format(parseFloat(amount));
};

export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ... options,
  };
  
  try {
    return new Date(dateString).toLocaleDateString('en-IN', defaultOptions);
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text. substring(0, maxLength) + '...';
};

export const getInitials = (firstName = '', lastName = '') => {
  const first = firstName ?  firstName[0] : '';
  const last = lastName ? lastName[0] :  '';
  return (first + last).toUpperCase();
};

export const getFileExtension = (filename) => {
  if (!filename) return '';
  return filename.split('.').pop().toLowerCase();
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  if (! bytes) return 'N/A';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math. log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getStatusColor = (status) => {
  const statusMap = {
    'active': 'success',
    'available': 'success',
    'delivered': 'success',
    'completed': 'success',
    'pending': 'warning',
    'assigned': 'warning',
    'in_transit': 'info',
    'inactive': 'error',
    'maintenance': 'error',
    'out_of_service': 'error',
    'cancelled': 'error',
    'failed': 'error',
  };
  
  return statusMap[status] || 'default';
};

export const getStatusText = (status) => {
  const statusMap = {
    'pending': 'Pending',
    'assigned': 'Assigned',
    'in_transit': 'In Transit',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
    'available': 'Available',
    'on_trip': 'On Trip',
    'maintenance': 'Maintenance',
    'out_of_service': 'Out of Service',
    'completed': 'Completed',
    'failed': 'Failed',
    'active': 'Active',
    'inactive': 'Inactive',
    'to_driver': 'To Driver',
    'from_driver': 'From Driver',
    'to_owner': 'To Owner',
    'from_owner': 'From Owner',
  };
  
  return statusMap[status] || (status ?  status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown');
};

export const calculateOrderProgress = (status) => {
  const progressMap = {
    'pending': 0,
    'assigned': 25,
    'in_transit':  75,
    'delivered': 100,
    'cancelled': 0,
  };
  return progressMap[status] || 0;
};

export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidPhone = (phone) => {
  const regex = /^[6-9]\d{9}$/;
  return regex.test((phone || '').replace(/\D/g, ''));
};

export const isValidTruckNumber = (truckNumber) => {
  const regex = /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/;
  return regex. test(truckNumber);
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math. sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const generateOrderNumber = () => {
  const prefix = 'TRANS';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

export const formatAddress = (address) => {
  if (!address) return 'N/A';
  return address.replace(/,/g, ', ');
};

export const getRandomColor = () => {
  const colors = [
    '#1976d2', '#2e7d32', '#ed6c02', '#9c27b0',
    '#d32f2f', '#0288d1', '#388e3c', '#f57c00',
  ];
  return colors[Math. floor(Math.random() * colors.length)];
};

export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

export const getDaysDifference = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((new Date(date1) - new Date(date2)) / oneDay));
};

export const isDateExpired = (expiryDate) => {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
};

export const isDateExpiringSoon = (expiryDate, daysThreshold = 30) => {
  if (!expiryDate) return false;
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = getDaysDifference(today, expiry);
  return daysUntilExpiry <= daysThreshold && daysUntilExpiry > 0;
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const replaceUnderscores = (str) => {
  if (!str) return '';
  return str.replace(/_/g, ' ');
};

export const removeLeadingZeros = (str) => {
  if (!str) return '';
  return str.replace(/^0+/, '') || '0';
};

export const sleep = (ms = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

export const sortBy = (array, key, ascending = true) => {
  return [... array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return ascending ? -1 : 1;
    if (aVal > bVal) return ascending ? 1 : -1;
    return 0;
  });
};