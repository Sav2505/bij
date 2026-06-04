import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Box, Card, CardContent, Typography, TextField, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, InputAdornment, IconButton, Tooltip,
  MenuItem, Grid, Collapse, Paper, Skeleton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useGetHotelsQuery, useDeleteHotelMutation, useGetFilterOptionsQuery } from '../../api/hotelsApi';
import type { HotelFilters } from '../../api/hotelsApi';
import type { RootState } from '../../redux/store';
import { showSnackbar } from '../ui/snackbarSlice';
import HotelForm from './HotelForm';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import useDebounce from '../../hooks/useDebounce';

const PAGE_SIZES = [10, 20, 50];

export default function HotelsListPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAdmin = useSelector((s: RootState) => s.auth.user?.role === 'ADMIN');

  const [filters, setFilters] = useState<HotelFilters>({ page: 1, pageSize: 20, sortBy: 'name', sortOrder: 'asc' });
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const debouncedSearch = useDebounce(searchInput, 400);
  const queryFilters = { ...filters, search: debouncedSearch || undefined };

  const { data, isLoading, isFetching } = useGetHotelsQuery(queryFilters);
  const { data: filterOptions } = useGetFilterOptionsQuery();
  const [deleteHotel, { isLoading: isDeleting }] = useDeleteHotelMutation();

  const hotels = data?.data?.data ?? [];
  const total = data?.data?.total ?? 0;
  const options = filterOptions?.data;

  const handleFilterChange = useCallback((key: keyof HotelFilters, value: string) => {
    setFilters(f => ({ ...f, [key]: value || undefined, page: 1 }));
  }, []);

  const clearFilters = () => {
    setFilters({ page: 1, pageSize: filters.pageSize, sortBy: 'name', sortOrder: 'asc' });
    setSearchInput('');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteHotel(deleteTarget.id).unwrap();
      dispatch(showSnackbar({ message: 'מלון נמחק בהצלחה', severity: 'success' }));
    } catch {
      dispatch(showSnackbar({ message: 'שגיאה במחיקת המלון', severity: 'error' }));
    }
    setDeleteTarget(null);
  };

  const activeFiltersCount = [filters.networkId, filters.location, filters.contentProvider, filters.deviceType, filters.salesPerson].filter(Boolean).length;

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          {isAdmin && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)} size="large">
              הוסף מלון
            </Button>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>מלונות</Typography>
            <Typography variant="body2" color="text.secondary" dir="rtl">
              סה''כ מלונות: {total.toLocaleString('he-IL')}
            </Typography>
          </Box>
        </Box>
      </motion.div>

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
            {(activeFiltersCount > 0 || searchInput) && (
              <Button variant="text" color="error" startIcon={<ClearIcon />} onClick={clearFilters}>
                נקה
              </Button>
            )}
            <Button
              variant={showFilters ? 'contained' : 'outlined'}
              color={activeFiltersCount > 0 ? 'secondary' : 'primary'}
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(p => !p)}
            >
              סינון {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
            <TextField
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="חפש לפי שם, רשת, עיר, ספק תוכן..."
              size="small"
              dir="rtl"
              sx={{ flexGrow: 1, minWidth: 200 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
                endAdornment: searchInput ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchInput('')}><ClearIcon fontSize="small" /></IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Box>

          <Collapse in={showFilters} timeout={250}>
            <Grid dir="rtl" container spacing={2} sx={{ mt: 1.5 }}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select label="רשת מלונות" size="small" fullWidth sx={{ minWidth: 160 }}
                  value={filters.networkId ?? ''}
                  onChange={e => handleFilterChange('networkId', e.target.value)}
                >
                  <MenuItem value="">הכל</MenuItem>
                  {options?.networks.map(n => <MenuItem key={n.id} value={n.id}>{n.name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select label="מיקום" size="small" fullWidth sx={{ minWidth: 160 }}
                  value={filters.location ?? ''}
                  onChange={e => handleFilterChange('location', e.target.value)}
                >
                  <MenuItem value="">הכל</MenuItem>
                  {options?.locations.map(l => <MenuItem key={l} value={l!}>{l}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select label="ספק תוכן" size="small" fullWidth sx={{ minWidth: 160 }}
                  value={filters.contentProvider ?? ''}
                  onChange={e => handleFilterChange('contentProvider', e.target.value)}
                >
                  <MenuItem value="">הכל</MenuItem>
                  {options?.contentProviders.map(c => <MenuItem key={c} value={c!}>{c}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select label="סוג מכשיר" size="small" fullWidth sx={{ minWidth: 160 }}
                  value={filters.deviceType ?? ''}
                  onChange={e => handleFilterChange('deviceType', e.target.value)}
                >
                  <MenuItem value="">הכל</MenuItem>
                  {options?.deviceTypes.map(d => <MenuItem key={d} value={d!}>{d}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer component={Paper} elevation={0}>
          <Table dir="rtl">
            <TableHead>
              <TableRow>
                <TableCell align="left">שם המלון</TableCell>
                <TableCell align="left">רשת</TableCell>
                <TableCell align="left">מיקום</TableCell>
                <TableCell align="left">ספק תוכן</TableCell>
                <TableCell align="left">מכשיר</TableCell>
                <TableCell align="left">רישוי</TableCell>
                <TableCell align="left">פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(isLoading || isFetching) ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : hotels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">לא נמצאו מלונות</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                hotels.map(hotel => (
                  <TableRow key={hotel.id} onClick={() => navigate(`/hotels/${hotel.id}`)}>
                    <TableCell align="left">
                      <Typography sx={{ fontWeight: 600 }}>{hotel.name}</Typography>
                    </TableCell>
                    <TableCell align="left">{hotel.network?.name ?? '—'}</TableCell>
                    <TableCell align="left">{hotel.location ?? '—'}</TableCell>
                    <TableCell align="left">
                      {hotel.contentProvider ? <Chip label={hotel.contentProvider} size="small" variant="outlined" /> : '—'}
                    </TableCell>
                    <TableCell align="left">
                      {hotel.deviceType ? <Chip label={hotel.deviceType} size="small" color="secondary" variant="outlined" /> : '—'}
                    </TableCell>
                    <TableCell align="left">{hotel.activeSpareLicenses ?? '—'}</TableCell>
                    <TableCell align="left" onClick={e => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-start' }}>
                        <Tooltip title="צפה">
                          <IconButton size="small" onClick={() => navigate(`/hotels/${hotel.id}`)}><VisibilityIcon fontSize="small" /></IconButton>
                        </Tooltip>
                        {isAdmin && (
                          <>
                            <Tooltip title="ערוך">
                              <IconButton size="small" color="primary"><EditIcon fontSize="small" /></IconButton>
                            </Tooltip>
                            <Tooltip title="מחק">
                              <IconButton size="small" color="error" onClick={() => setDeleteTarget({ id: hotel.id, name: hotel.name })}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={(filters.page ?? 1) - 1}
          rowsPerPage={filters.pageSize ?? 20}
          rowsPerPageOptions={PAGE_SIZES}
          onPageChange={(_, p) => setFilters(f => ({ ...f, page: p + 1 }))}
          onRowsPerPageChange={e => setFilters(f => ({ ...f, pageSize: parseInt(e.target.value), page: 1 }))}
          labelRowsPerPage="שורות לדף:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} מתוך ${count}`}
          sx={{ direction: 'rtl' }}
        />
      </Card>

      <HotelForm open={formOpen} onClose={() => setFormOpen(false)} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="מחיקת מלון"
        message={`האם למחוק את המלון "${deleteTarget?.name}"? פעולה זו לא ניתנת לביטול.`}
        confirmLabel="מחק"
        confirmColor="error"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
