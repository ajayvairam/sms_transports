import * as yup from 'yup';

// User validation schema
export const userSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  username: yup
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .required('Username is required'),
  first_name: yup
    .string()
    .required('First name is required'),
  last_name: yup
    .string()
    .required('Last name is required'),
  phone: yup
    .string()
    .matches(/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number')
    .required('Phone number is required'),
  role: yup
    .string()
    .oneOf(['admin', 'owner', 'driver'], 'Please select a valid role')
    .required('Role is required'),
  password: yup
    .string()
    .when('isEdit', {
      is: false,
      then: schema => schema
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
      otherwise: schema => schema.notRequired(),
    }),
  confirmPassword: yup
    .string()
    .when('password', {
      is: (password) => password && password.length > 0,
      then: schema => schema
        .oneOf([yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
      otherwise: schema => schema.notRequired(),
    }),
  address: yup.string(),
  driving_license: yup
    .string()
    .when('role', {
      is: 'driver',
      then: schema => schema.required('Driving license is required for drivers'),
      otherwise: schema => schema,
    }),
  license_expiry: yup
    .date()
    .when('driving_license', {
      is: (license) => license && license.length > 0,
      then: schema => schema
        .min(new Date(), 'License must not be expired')
        .required('License expiry date is required'),
      otherwise: schema => schema,
    }),
});

// Truck validation schema
export const truckSchema = yup.object().shape({
  truck_number: yup
    .string()
    .matches(/^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/, 'Please enter a valid truck number (e.g., MH01AB1234)')
    .required('Truck number is required'),
  model: yup
    .string()
    .required('Model is required'),
  make: yup
    .string()
    .required('Make is required'),
  year: yup
    .number()
    .min(2000, 'Year must be 2000 or later')
    .max(new Date().getFullYear(), 'Year cannot be in the future')
    .required('Year is required'),
  axle_count: yup
    .number()
    .min(2, 'Minimum 2 axles required')
    .max(12, 'Maximum 12 axles allowed')
    .required('Axle count is required'),
  capacity: yup
    .number()
    .min(1, 'Capacity must be at least 1 ton')
    .max(100, 'Capacity cannot exceed 100 tons')
    .required('Capacity is required'),
  fuel_type: yup
    .string()
    .required('Fuel type is required'),
  rc_expiry: yup
    .date()
    .min(new Date(), 'RC must not be expired')
    .required('RC expiry date is required'),
  insurance_expiry: yup
    .date()
    .min(new Date(), 'Insurance must not be expired')
    .required('Insurance expiry date is required'),
  pollution_expiry: yup
    .date()
    .min(new Date(), 'Pollution certificate must not be expired')
    .required('Pollution certificate expiry date is required'),
  owner: yup
    .number()
    .required('Owner is required'),
});

// Order validation schema
export const orderSchema = yup.object().shape({
  description: yup
    .string()
    .required('Description is required'),
  pickup_location: yup
    .string()
    .required('Pickup location is required'),
  pickup_contact: yup
    .string()
    .required('Pickup contact is required'),
  pickup_phone: yup
    .string()
    .matches(/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number')
    .required('Pickup phone is required'),
  delivery_location: yup
    .string()
    .required('Delivery location is required'),
  delivery_contact: yup
    .string()
    .required('Delivery contact is required'),
  delivery_phone: yup
    .string()
    .matches(/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number')
    .required('Delivery phone is required'),
  pickup_date: yup
    .date()
    .min(new Date(), 'Pickup date cannot be in the past')
    .required('Pickup date is required'),
  estimated_delivery_date: yup
    .date()
    .min(yup.ref('pickup_date'), 'Delivery date must be after pickup date')
    .required('Estimated delivery date is required'),
  load_type: yup
    .string()
    .required('Load type is required'),
  weight: yup
    .number()
    .min(0.1, 'Weight must be at least 0.1 tons')
    .max(100, 'Weight cannot exceed 100 tons')
    .required('Weight is required'),
  total_amount: yup
    .number()
    .min(100, 'Total amount must be at least ₹100')
    .required('Total amount is required'),
  advance_amount: yup
    .number()
    .min(0, 'Advance amount cannot be negative')
    .max(yup.ref('total_amount'), 'Advance amount cannot exceed total amount'),
  owner: yup
    .number()
    .required('Owner is required'),
});

// Expense validation schema
export const expenseSchema = yup.object().shape({
  category: yup
    .string()
    .required('Category is required'),
  description: yup
    .string()
    .required('Description is required'),
  amount: yup
    .number()
    .min(1, 'Amount must be at least ₹1')
    .required('Amount is required'),
  order: yup
    .number()
    .required('Order is required'),
});

// Transfer validation schema
export const transferSchema = yup.object().shape({
  transfer_type: yup
    .string()
    .required('Transfer type is required'),
  amount: yup
    .number()
    .min(1, 'Amount must be at least ₹1')
    .required('Amount is required'),
  description: yup
    .string()
    .required('Description is required'),
  order: yup
    .number()
    .required('Order is required'),
  transaction_id: yup.string(),
  bank_name: yup.string(),
  account_number: yup.string(),
  ifsc_code: yup.string(),
});

// Login validation schema
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required'),
});

// Profile validation schema
export const profileSchema = yup.object().shape({
  first_name: yup
    .string()
    .required('First name is required'),
  last_name: yup
    .string()
    .required('Last name is required'),
  phone: yup
    .string()
    .matches(/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number')
    .required('Phone number is required'),
  address: yup.string(),
});

// Password change validation schema
export const passwordChangeSchema = yup.object().shape({
  old_password: yup
    .string()
    .required('Old password is required'),
  new_password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('New password is required'),
  confirm_password: yup
    .string()
    .oneOf([yup.ref('new_password')], 'Passwords must match')
    .required('Please confirm your password'),
});