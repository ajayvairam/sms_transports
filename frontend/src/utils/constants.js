export const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const USER_ROLES = {
  ADMIN: 'admin',
  OWNER: 'owner',
  DRIVER: 'driver',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED:  'cancelled',
};

export const TRUCK_STATUS = {
  AVAILABLE: 'available',
  ON_TRIP: 'on_trip',
  MAINTENANCE: 'maintenance',
  OUT_OF_SERVICE: 'out_of_service',
};

export const EXPENSE_CATEGORIES = [
  { value: 'fuel', label: 'Fuel' },
  { value: 'toll', label: 'Toll' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'food', label: 'Food' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'other', label: 'Other' },
];

export const TRANSFER_TYPES = [
  { value: 'to_driver', label: 'To Driver' },
  { value: 'from_driver', label: 'From Driver' },
  { value:  'to_owner', label:  'To Owner' },
  { value: 'from_owner', label: 'From Owner' },
];

export const FUEL_TYPES = ['Diesel', 'Petrol', 'CNG', 'Electric', 'Hybrid'];

export const LOAD_TYPES = [
  'General Goods',
  'Perishable Goods',
  'Hazardous Materials',
  'Heavy Machinery',
  'Vehicles',
  'Construction Materials',
  'Agricultural Products',
  'Other',
];