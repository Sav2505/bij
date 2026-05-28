import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, MenuItem, CircularProgress, Divider,
} from '@mui/material';
import { useCreateUserMutation } from '../../api/authApi';
import { showSnackbar } from '../ui/snackbarSlice';

const schema = z.object({
  username: z.string().min(2, 'לפחות 2 תווים'),
  email: z.string().email('אימייל לא תקין'),
  password: z.string().min(6, 'לפחות 6 תווים'),
  role: z.enum(['ADMIN', 'USER']),
});
type FormValues = z.infer<typeof schema>;

export default function CreateUserDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dispatch = useDispatch();
  const [createUser, { isLoading }] = useCreateUserMutation();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'USER' },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await createUser(data).unwrap();
      dispatch(showSnackbar({ message: 'משתמש נוצר בהצלחה', severity: 'success' }));
      reset();
      onClose();
    } catch (err: any) {
      dispatch(showSnackbar({ message: err?.data?.message ?? 'שגיאה ביצירת משתמש', severity: 'error' }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>הוספת משתמש חדש</DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={2} component="form" id="create-user-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid item xs={12} sm={6}>
            <TextField {...register('username')} label="שם משתמש *" fullWidth error={!!errors.username} helperText={errors.username?.message} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField {...register('email')} label="אימייל *" fullWidth type="email" error={!!errors.email} helperText={errors.email?.message} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField {...register('password')} label="סיסמה *" fullWidth type="password" error={!!errors.password} helperText={errors.password?.message} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField {...register('role')} select label="תפקיד" fullWidth defaultValue="USER">
              <MenuItem value="USER">משתמש</MenuItem>
              <MenuItem value="ADMIN">מנהל</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isLoading}>ביטול</Button>
        <Button type="submit" form="create-user-form" variant="contained" disabled={isLoading}>
          {isLoading ? <CircularProgress size={22} color="inherit" /> : 'צור משתמש'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
