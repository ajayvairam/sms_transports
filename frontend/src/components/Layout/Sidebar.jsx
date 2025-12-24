import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import {
  Dashboard,
  People,
  DirectionsCar,
  Assignment,
  Receipt,
  Payment,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth';

const drawerWidth = 240;

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();

  const adminMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
    { text: 'Users', icon: <People />, path: '/admin/users' },
    { text: 'Trucks', icon: <DirectionsCar />, path: '/admin/trucks' },
    { text: 'Orders', icon: <Assignment />, path: '/admin/orders' },
    { text: 'Expenses', icon: <Receipt />, path: '/admin/expenses' },
    { text: 'Transfers', icon: <Payment />, path: '/admin/transfers' },
  ];

  const ownerMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/owner/dashboard' },
    { text: 'Trucks', icon: <DirectionsCar />, path: '/owner/trucks' },
    { text: 'Orders', icon: <Assignment />, path: '/owner/orders' },
  ];

  const driverMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/driver/dashboard' },
    { text: 'Orders', icon: <Assignment />, path: '/driver/orders' },
    { text: 'Expenses', icon: <Receipt />, path: '/driver/expenses' },
    { text: 'Transfers', icon: <Payment />, path: '/driver/transfers' },
  ];

  const getMenuItems = () => {
    switch (user?.role) {
      case 'admin': return adminMenuItems;
      case 'owner': return ownerMenuItems;
      case 'driver': return driverMenuItems;
      default: return [];
    }
  };

  const drawer = (
    <Box>
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          SMS Transports
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user?.role === 'admin' ? 'Administration' : 
           user?.role === 'owner' ? 'Owner Portal' : 'Driver Portal'}
        </Typography>
      </Box>
      <Divider />
      <List>
        {getMenuItems().map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'white' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;