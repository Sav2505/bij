import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, MenuItem, CircularProgress, Divider, Typography,
} from '@mui/material';
import { useCreateHotelMutation, useUpdateHotelMutation, useGetFilterOptionsQuery } from '../../api/hotelsApi';
import type { Hotel } from '../../api/hotelsApi';
import { showSnackbar } from '../ui/snackbarSlice';

const schema = z.object({
  name: z.string().min(1, 'שם המלון נדרש'),
  networkName: z.string().optional(),
  location: z.string().optional(),
  contentProvider: z.string().optional(),
  viggoRegistrationCode: z.string().optional(),
  technicianCode: z.string().optional(),
  serviceSupport: z.string().optional(),
  deviceType: z.string().optional(),
  ipConnection: z.string().optional(),
  channelSource: z.string().optional(),
  switches: z.string().optional(),
  salesPerson: z.string().optional(),
  notes: z.string().optional(),
  siteContact: z.string().optional(),
  activeSpareLicenses: z.string().optional().transform(v => v ? parseInt(v) : undefined),
  hotLicenseCount: z.string().optional().transform(v => v ? parseInt(v) : undefined),
  hotLicenseNotes: z.string().optional(),
  roomCount: z.string().optional().transform(v => v ? parseInt(v) : undefined),
  remarks: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface HotelFormProps {
  open: boolean;
  onClose: () => void;
  hotel?: Hotel;
}

export default function HotelForm({ open, onClose, hotel }: HotelFormProps) {
  const dispatch = useDispatch();
  const isEdit = !!hotel;
  const { data: filterOptions } = useGetFilterOptionsQuery();
  const [createHotel, { isLoading: isCreating }] = useCreateHotelMutation();
  const [updateHotel, { isLoading: isUpdating }] = useUpdateHotelMutation();
  const isLoading = isCreating || isUpdating;

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {},
  });

  useEffect(() => {
    if (open) {
      reset(hotel ? {
        name: hotel.name,
        networkName: hotel.network?.name ?? '',
        location: hotel.location ?? '',
        contentProvider: hotel.contentProvider ?? '',
        viggoRegistrationCode: hotel.viggoRegistrationCode ?? '',
        technicianCode: hotel.technicianCode ?? '',
        serviceSupport: hotel.serviceSupport ?? '',
        deviceType: hotel.deviceType ?? '',
        ipConnection: hotel.ipConnection ?? '',
        channelSource: hotel.channelSource ?? '',
        switches: hotel.switches ?? '',
        salesPerson: hotel.salesPerson ?? '',
        notes: hotel.notes ?? '',
        siteContact: hotel.siteContact ?? '',
        activeSpareLicenses: hotel.activeSpareLicenses?.toString() ?? '',
        hotLicenseCount: hotel.hotLicenseCount?.toString() ?? '',
        hotLicenseNotes: hotel.hotLicenseNotes ?? '',
        roomCount: hotel.roomCount?.toString() ?? '',
        remarks: hotel.remarks ?? '',
      } : {});
    }
  }, [open, hotel, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEdit) {
        await updateHotel({ id: hotel!.id, body: data as any }).unwrap();
        dispatch(showSnackbar({ message: 'מלון עודכן בהצלחה', severity: 'success' }));
      } else {
        await createHotel(data as any).unwrap();
        dispatch(showSnackbar({ message: 'מלון נוסף בהצלחה', severity: 'success' }));
      }
      onClose();
    } catch (err: any) {
      dispatch(showSnackbar({ message: err?.data?.message ?? 'שגיאה בשמירת המלון', severity: 'error' }));
    }
  };

  const networks = filterOptions?.data?.networks ?? [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        {isEdit ? `עריכת מלון: ${hotel?.name}` : 'הוספת מלון חדש'}
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={2.5} component="form" id="hotel-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="primary" fontWeight={600} mb={1}>מידע כללי</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField {...register('name')} label="שם המלון *" fullWidth error={!!errors.name} helperText={errors.name?.message} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="networkName"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="רשת מלונות" fullWidth>
                  <MenuItem value="">ללא רשת</MenuItem>
                  {networks.map(n => <MenuItem key={n.id} value={n.name}>{n.name}</MenuItem>)}
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField {...register('location')} label="מיקום" fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField {...register('contentProvider')} label="ספק תוכן" fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField {...register('salesPerson')} label="איש מכירות" fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField {...register('siteContact')} label="איש קשר באתר" fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField {...register('roomCount')} label="מספר חדרים" fullWidth type="number" inputProps={{ min: 0 }} />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" color="primary" fontWeight={600} mb={1}>פרטים טכניים</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField {...register('viggoRegistrationCode')} label="קוד רישום VIGGO" fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField {...register('technicianCode')} label="קוד טכנאי" fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField {...register('serviceSupport')} label="שירות ותמיכה" fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField {...register('deviceType')} label="סוג מכשיר" fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField {...register('ipConnection')} label="חיבור IP" fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField {...register('channelSource')} label="מקור ערוצים" fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField {...register('switches')} label="מתגים" fullWidth />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" color="primary" fontWeight={600} mb={1}>רישוי</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField {...register('activeSpareLicenses')} label="רישוי פעיל + ספייר" fullWidth type="number" inputProps={{ min: 0 }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField {...register('hotLicenseCount')} label="רישוי HOT" fullWidth type="number" inputProps={{ min: 0 }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField {...register('hotLicenseNotes')} label="הערות רישוי HOT" fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField {...register('notes')} label="הערות" fullWidth multiline rows={2} />
          </Grid>
          <Grid item xs={12}>
            <TextField {...register('remarks')} label="הערות נוספות" fullWidth multiline rows={2} />
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={isLoading}>ביטול</Button>
        <Button type="submit" form="hotel-form" variant="contained" disabled={isLoading} size="large">
          {isLoading ? <CircularProgress size={22} color="inherit" /> : (isEdit ? 'שמור שינויים' : 'הוסף מלון')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
