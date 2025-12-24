import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

const ErrorComponent = ({ message = 'An error occurred', onRetry, retryText = 'Retry' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
        gap: 2,
        p: 3,
      }}
    >
      <ErrorOutline sx={{ fontSize: 60, color: 'error.main' }} />
      <Typography variant="h6" color="text.secondary" align="center">
        {message}
      </Typography>
      {onRetry && (
        <Button variant="contained" onClick={onRetry}>
          {retryText}
        </Button>
      )}
    </Box>
  );
};

export default ErrorComponent;