import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, Alert, CircularProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import HotelIcon from '@mui/icons-material/Hotel';
import { useLoginMutation } from '../../api/authApi';
import { setCredentials } from './authSlice';

const schema = z.object({
  username: z.string().min(1, 'שם משתמש נדרש'),
  password: z.string().min(1, 'סיסמה נדרשת'),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setServerError('');
      const res = await login(data).unwrap();
      dispatch(setCredentials(res.data));
      navigate('/dashboard');
    } catch (err: any) {
      setServerError(err?.data?.message ?? 'שגיאה בהתחברות, נסה שנית');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #060E1E 0%, #0D2B4E 45%, #163D6E 100%)',
        direction: 'rtl',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: 500, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
          top: '-100px', right: '-100px',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.10) 0%, transparent 70%)',
          bottom: '-80px', left: '-80px',
        },
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
      >
        <Card
          elevation={0}
          sx={{
            borderRadius: '24px',
            overflow: 'visible',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #0D2B4E 0%, #163D6E 50%, #1E4D8C 100%)',
              color: 'white',
              textAlign: 'center',
              py: 4,
              px: 3,
              borderRadius: '24px 24px 0 0',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                width: 200, height: 200,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.04)',
                top: -60, right: -60,
              },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box
                sx={{
                  width: 72, height: 72,
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.9) 0%, rgba(29,78,216,0.9) 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(59,130,246,0.5)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <HotelIcon sx={{ fontSize: 38, color: 'white' }} />
              </Box>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>B-Zone</Typography>
            <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5, fontWeight: 400 }}>מערכת ניהול מלונות</Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, textAlign: 'center' }} color="text.primary">
              כניסה למערכת
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
              הזן את פרטי הכניסה שלך להמשך
            </Typography>

            {serverError && (
              <Alert severity="error" sx={{ mb: 2.5 }}>{serverError}</Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                {...register('username')}
                label="שם משתמש"
                fullWidth
                autoFocus
                autoComplete="username"
                error={!!errors.username}
                helperText={errors.username?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 2.5 }}
              />

              <TextField
                {...register('password')}
                label="סיסמה"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                autoComplete="current-password"
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(p => !p)} edge="end" size="small">
                        {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={isLoading}
                sx={{ py: 1.5, fontSize: '1rem', borderRadius: '12px' }}
              >
                {isLoading ? <CircularProgress size={22} color="inherit" /> : 'כניסה למערכת'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}
