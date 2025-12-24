import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  MenuItem,
  IconButton,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Payment,
  Download,
  Visibility,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { transfersService } from '../../services/transfers';
import { formatDate, formatCurrency, getStatusColor, getStatusText } from '../../utils/helpers';
import Loading from '../Common/Loading';
import ErrorComponent from '../Common/Error';

const TransferList = () => {
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const data = await transfersService.getTransfers();
      setTransfers(data);
    } catch (error) {
      console.error('Error fetching transfers:', error);
      setError('Failed to load transfers');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getTransferTypeIcon = (type) => {
    switch (type) {
      case 'to_driver':
      case 'to_owner':
        return <TrendingDown color="success" />;
      case 'from_driver':
      case 'from_owner':
        return <TrendingUp color="error" />;
      default:
        return <Payment />;
    }
  };

  const getTransferTypeText = (type) => {
    switch (type) {
      case 'to_driver': return 'To Driver';
      case 'from_driver': return 'From Driver';
      case 'to_owner': return 'To Owner';
      case 'from_owner': return 'From Owner';
      default: return type;
    }
  };

  const calculateTotals = () => {
    const totals = {
      to_driver: 0,
      from_driver: 0,
      to_owner: 0,
      from_owner: 0,
      totalIn: 0,
      totalOut: 0,
    };

    transfers.forEach(transfer => {
      const amount = parseFloat(transfer.amount);
      switch (transfer.transfer_type) {
        case 'to_driver':
          totals.to_driver += amount;
          totals.totalOut += amount;
          break;
        case 'from_driver':
          totals.from_driver += amount;
          totals.totalIn += amount;
          break;
        case 'to_owner':
          totals.to_owner += amount;
          totals.totalOut += amount;
          break;
        case 'from_owner':
          totals.from_owner += amount;
          totals.totalIn += amount;
          break;
      }
    });

    return totals;
  };

  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = 
      transfer.description?.toLowerCase().includes(search.toLowerCase()) ||
      transfer.transaction_id?.toLowerCase().includes(search.toLowerCase()) ||
      transfer.order?.order_number?.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter === 'all' || transfer.transfer_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totals = calculateTotals();

  if (loading) return <Loading message="Loading transfers..." />;
  if (error) return <ErrorComponent message={error} onRetry={fetchTransfers} />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          <Payment sx={{ verticalAlign: 'middle', mr: 1 }} />
          Money Transfers
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/admin/transfers/new')}
        >
          New Transfer
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                {formatCurrency(totals.totalIn)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Money In
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="error.main">
                {formatCurrency(totals.totalOut)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Money Out
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                {formatCurrency(totals.to_driver)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                To Drivers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                {formatCurrency(totals.to_owner)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                To Owners
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Search transfers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            label="Filter by Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="to_driver">To Driver</MenuItem>
            <MenuItem value="from_driver">From Driver</MenuItem>
            <MenuItem value="to_owner">To Owner</MenuItem>
            <MenuItem value="from_owner">From Owner</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Order #</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransfers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((transfer) => (
                  <TableRow key={transfer.id} hover>
                    <TableCell>
                      {formatDate(transfer.created_at, { month: 'short', day: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTransferTypeIcon(transfer.transfer_type)}
                        <Typography variant="body2">
                          {getTransferTypeText(transfer.transfer_type)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {transfer.order?.order_number || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {transfer.description}
                      </Typography>
                      {transfer.bank_name && (
                        <Typography variant="caption" color="text.secondary">
                          {transfer.bank_name}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body1" 
                        fontWeight="medium"
                        color={
                          transfer.transfer_type === 'to_driver' || transfer.transfer_type === 'to_owner' 
                            ? 'error.main' 
                            : 'success.main'
                        }
                      >
                        {transfer.transfer_type === 'to_driver' || transfer.transfer_type === 'to_owner' 
                          ? `-${formatCurrency(transfer.amount)}`
                          : `+${formatCurrency(transfer.amount)}`
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(transfer.status)}
                        color={getStatusColor(transfer.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {transfer.transaction_id || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/transfers/${transfer.id}`)}
                        title="View Details"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      {transfer.receipt && (
                        <IconButton
                          size="small"
                          href={transfer.receipt}
                          target="_blank"
                          title="Download Receipt"
                        >
                          <Download fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              {filteredTransfers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Box sx={{ py: 4 }}>
                      <Payment sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No transfers found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {search || typeFilter !== 'all' || statusFilter !== 'all' 
                          ? 'Try changing your search filters' 
                          : 'Create your first transfer to get started'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTransfers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default TransferList;