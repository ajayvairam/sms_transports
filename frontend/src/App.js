import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './themes/theme';
import { AuthProvider } from './context/AuthContext';

// Components
import Login from './components/Auth/Login';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';

// Dashboards
import AdminDashboard from './components/Dashboard/AdminDashboard';
import OwnerDashboard from './components/Dashboard/OwnerDashboard';
import DriverDashboard from './components/Dashboard/DriverDashboard';

// Pages
import UserList from './components/Users/UserList';
import UserForm from './components/Users/UserForm';
import TruckList from './components/Trucks/TruckList';
import TruckForm from './components/Trucks/TruckForm';
import TruckDetails from './components/Trucks/TruckDetails';
import OrderList from './components/Orders/OrderList';
import OrderForm from './components/Orders/OrderForm';
import OrderDetails from './components/Orders/OrderDetails';
import ExpenseList from './components/Expenses/ExpenseList';
import ExpenseForm from './components/Expenses/ExpenseForm';
import TransferList from './components/Transfers/TransferList';
import TransferForm from './components/Transfers/TransferForm';

// Driver specific
import DriverExpenses from './components/Driver/DriverExpenses';
import DriverTransfers from './components/Driver/DriverTransfers';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserList />} />
              <Route path="users/new" element={<UserForm />} />
              <Route path="users/:id/edit" element={<UserForm />} />
              <Route path="trucks" element={<TruckList />} />
              <Route path="trucks/new" element={<TruckForm />} />
              <Route path="trucks/:id" element={<TruckDetails />} />
              <Route path="trucks/:id/edit" element={<TruckForm />} />
              <Route path="orders" element={<OrderList />} />
              <Route path="orders/new" element={<OrderForm />} />
              <Route path="orders/:id" element={<OrderDetails />} />
              <Route path="orders/:id/edit" element={<OrderForm />} />
              <Route path="expenses" element={<ExpenseList />} />
              <Route path="expenses/new" element={<ExpenseForm />} />
              <Route path="expenses/:id/edit" element={<ExpenseForm />} />
              <Route path="transfers" element={<TransferList />} />
              <Route path="transfers/new" element={<TransferForm />} />
              <Route path="transfers/:id/edit" element={<TransferForm />} />
            </Route>
            
            {/* Owner Routes */}
            <Route path="/owner" element={
              <ProtectedRoute allowedRoles={['owner']}>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<OwnerDashboard />} />
              <Route path="trucks" element={<TruckList />} />
              <Route path="trucks/:id" element={<TruckDetails />} />
              <Route path="orders" element={<OrderList />} />
              <Route path="orders/:id" element={<OrderDetails />} />
            </Route>
            
            {/* Driver Routes */}
            <Route path="/driver" element={
              <ProtectedRoute allowedRoles={['driver']}>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DriverDashboard />} />
              <Route path="orders" element={<OrderList />} />
              <Route path="orders/:id" element={<OrderDetails />} />
              <Route path="expenses" element={<DriverExpenses />} />
              <Route path="expenses/new" element={<ExpenseForm />} />
              <Route path="transfers" element={<DriverTransfers />} />
            </Route>
            
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;