import { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, CircularProgress, Divider, Typography,
  Tabs, Tab, Box, IconButton, Paper,
} from '@mui/material';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useCreateHotelMutation, useUpdateHotelMutation, useGetFilterOptionsQuery } from '../../api/hotelsApi';
import type { Hotel } from '../../api/hotelsApi';
import { showSnackbar } from '../ui/snackbarSlice';

const CONTACT_CATEGORIES = [
  { value: 'MANAGEMENT', label: 'ניהול' },
  { value: 'IT', label: 'מחשוב' },
  { value: 'MAINTENANCE', label: 'תחזוקה' },
  { value: 'PROCUREMENT', label: 'רכש' },
] as const;

const contactSchema = z.object({
  category: z.enum(['MANAGEMENT', 'IT', 'MAINTENANCE', 'PROCUREMENT']),
  name: z.string().optional(),
  role: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
});

const schema = z.object({
  // פרטי מלון
  name: z.string().min(1, 'שם המלון נדרש'),
  networkName: z.string().optional(),
  location: z.string().optional(),
  contentProvider: z.string().optional(),
  salesPerson: z.string().optional(),
  siteContact: z.string().optional(),
  deviceType: z.string().optional(),
  ipConnection: z.string().optional(),
  channelSource: z.string().optional(),
  switches: z.string().optional(),
  viggoRegistrationCode: z.string().optional(),
  technicianCode: z.string().optional(),
  serviceSupport: z.string().optional(),
  roomCount: z.string().optional().transform(v => v ? parseInt(v) : undefined),
  notes: z.string().optional(),
  remarks: z.string().optional(),
  // אנשי קשר
  contacts: z.array(contactSchema).default([]),
  // רישיונות
  activeSpareLicenses: z.string().optional().transform(v => v ? parseInt(v) : undefined),
  hotLicenseCount: z.string().optional().transform(v => v ? parseInt(v) : undefined),
  hotLicenseNotes: z.string().optional(),
});

type FormValues = z.input<typeof schema>;

interface HotelFormProps {
  open: boolean;
  onClose: () => void;
  hotel?: Hotel;
}

export default function HotelForm({ open, onClose, hotel }: HotelFormProps) {
  const dispatch = useDispatch();
  const isEdit = !!hotel;
  const [activeTab, setActiveTab] = useState(0);

  const { data: filterOptions } = useGetFilterOptionsQuery();
  const [createHotel, { isLoading: isCreating }] = useCreateHotelMutation();
  const [updateHotel, { isLoading: isUpdating }] = useUpdateHotelMutation();
  const isLoading = isCreating || isUpdating;

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { contacts: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'contacts' });

  useEffect(() => {
    if (open) {
      setActiveTab(0);
      reset(hotel ? {
        name: hotel.name,
        networkName: hotel.network?.name ?? '',
        location: hotel.location ?? '',
        contentProvider: hotel.contentProvider ?? '',
        salesPerson: hotel.salesPerson ?? '',
        siteContact: hotel.siteContact ?? '',
        deviceType: hotel.deviceType ?? '',
        ipConnection: hotel.ipConnection ?? '',
        channelSource: hotel.channelSource ?? '',
        switches: hotel.switches ?? '',
        viggoRegistrationCode: hotel.viggoRegistrationCode ?? '',
        technicianCode: hotel.technicianCode ?? '',
        serviceSupport: hotel.serviceSupport ?? '',
        roomCount: hotel.roomCount?.toString() ?? '',
        notes: hotel.notes ?? '',
        remarks: hotel.remarks ?? '',
        contacts: (hotel.contacts ?? []).map(c => ({
          category: c.category,
          name: c.name ?? '',
          role: c.role ?? '',
          phone: c.phone ?? '',
          email: c.email ?? '',
        })),
        activeSpareLicenses: hotel.activeSpareLicenses?.toString() ?? '',
        hotLicenseCount: hotel.hotLicenseCount?.toString() ?? '',
        hotLicenseNotes: hotel.hotLicenseNotes ?? '',
      } : { contacts: [] });
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
      <DialogTitle dir="rtl" sx={{ fontWeight: 700, pb: 1 }}>
        {isEdit ? `עריכת מלון: ${hotel?.name}` : 'הוספת מלון חדש'}
      </DialogTitle>

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        dir="rtl"
        sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="פרטי מלון" />
        <Tab label={`אנשי קשר${fields.length ? ` (${fields.length})` : ''}`} />
        <Tab label="רישיונות" />
      </Tabs>

      <DialogContent sx={{ pt: 3, overflowY: 'auto' }}>
        <Box component="form" id="hotel-form" onSubmit={handleSubmit(onSubmit)} noValidate dir="rtl">

          {/* ── טאב 1: פרטי מלון ── */}
          <Box hidden={activeTab !== 0}>
            <Typography variant="subtitle2" color="primary" sx={{ marginBottom: 1.6, fontWeight: 600 }}>מידע כללי</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
              <TextField
                {...register('name')}
                label="שם המלון *"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
              />
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
              <TextField {...register('location')} label="מיקום" fullWidth />
              <TextField {...register('contentProvider')} label="ספק תוכן" fullWidth />
            </Box>

            <Divider sx={{ my: 2.5 }} />
            <Typography variant="subtitle2" color="primary" sx={{ marginBottom: 1.6, fontWeight: 600 }}>פרטים טכניים</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
              <TextField {...register('viggoRegistrationCode')} label="קוד רישום VIGGO" fullWidth />
              <TextField {...register('technicianCode')} label="קוד טכנאי" fullWidth />
              <TextField {...register('serviceSupport')} label="שירות ותמיכה" fullWidth />
              <TextField {...register('deviceType')} label="סוג מכשיר" fullWidth />
              <TextField {...register('ipConnection')} label="חיבור IP" fullWidth />
              <TextField {...register('channelSource')} label="מקור ערוצים" fullWidth />
              <TextField {...register('roomCount')} label="מספר חדרים" fullWidth type="number" inputProps={{ min: 0 }} />
              <TextField {...register('switches')} label="מתגים" fullWidth />
            </Box>

            <Divider sx={{ my: 2.5 }} />
            <Typography variant="subtitle2" color="primary" sx={{ marginBottom: 1.6, fontWeight: 600 }}>הערות</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField {...register('notes')} label="הערות" fullWidth multiline rows={2} />
              <TextField {...register('remarks')} label="הערות נוספות" fullWidth multiline rows={2} />
            </Box>
          </Box>

          {/* ── טאב 2: אנשי קשר ── */}
          <Box hidden={activeTab !== 1}>
            <Typography variant="subtitle2" color="primary" sx={{ marginBottom: 1.6, fontWeight: 600 }}>פרטי קשר כלליים</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5, mb: 3 }}>
              <TextField {...register('salesPerson')} label="איש מכירות" fullWidth />
              <TextField {...register('siteContact')} label="איש קשר באתר" fullWidth />
            </Box>

            <Divider sx={{ mb: 2.5 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Button
                size="small"
                variant="outlined"
                endIcon={<AddCircleOutlinedIcon />}
                onClick={() => append({ category: 'MANAGEMENT', name: '', role: '', phone: '', email: '' })}
                sx={{ gap: 1, padding: 1, paddingLeft: 2 }}
              >
                הוסף איש קשר
              </Button>
              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                {fields.length > 0 ? `${fields.length} אנשי קשר` : 'אין אנשי קשר'}
              </Typography>
            </Box>

            {fields.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 7, color: 'text.disabled' }}>
                <Typography variant="body2">לחץ על "הוסף איש קשר" כדי להוסיף איש קשר ראשון</Typography>
              </Box>
            )}

            {fields.map((field, index) => (
              <Paper key={field.id} variant="outlined" dir="rtl" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                    איש קשר {index + 1}
                  </Typography>
                  <IconButton size="small" color="error" onClick={() => remove(index)} aria-label="מחק">
                    <DeleteOutlinedIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Controller
                    name={`contacts.${index}.category`}
                    control={control}
                    render={({ field: f }) => (
                      <TextField {...f} select label="קטגוריה" fullWidth size="small">
                        {CONTACT_CATEGORIES.map(c => (
                          <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                  <TextField {...register(`contacts.${index}.name`)} label="שם מלא" fullWidth size="small" />
                  <TextField {...register(`contacts.${index}.role`)} label="תפקיד" fullWidth size="small" />
                  <TextField {...register(`contacts.${index}.phone`)} label="טלפון" fullWidth size="small" />
                  <TextField {...register(`contacts.${index}.email`)} label="אימייל" fullWidth size="small" sx={{ gridColumn: '1 / -1' }} />
                </Box>
              </Paper>
            ))}
          </Box>

          {/* ── טאב 3: רישיונות ── */}
          <Box hidden={activeTab !== 2}>
            <Typography variant="subtitle2" color="primary" sx={{ marginBottom: 1.6, fontWeight: 600 }}>פרטי רישוי</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
              <TextField
                {...register('activeSpareLicenses')}
                label="רישוי פעיל + ספייר"
                fullWidth
                type="number"
                inputProps={{ min: 0 }}
              />
              <TextField
                {...register('hotLicenseCount')}
                label="רישוי HOT"
                fullWidth
                type="number"
                inputProps={{ min: 0 }}
              />
              <TextField
                {...register('hotLicenseNotes')}
                label="הערות רישוי HOT"
                fullWidth
                multiline
                rows={3}
                sx={{ gridColumn: '1 / -1' }}
              />
            </Box>
          </Box>

        </Box>
      </DialogContent>

      <Divider />
      <DialogActions dir="rtl" sx={{ p: 2, gap: 1 }}>
        <Button type="submit" form="hotel-form" variant="contained" disabled={isLoading} size="large">
          {isLoading
            ? <CircularProgress size={22} color="inherit" />
            : (isEdit ? 'שמור שינויים' : 'הוסף מלון')}
        </Button>
        <Button onClick={onClose} disabled={isLoading}>ביטול</Button>
      </DialogActions>
    </Dialog>
  );
}
