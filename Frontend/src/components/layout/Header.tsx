import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Typography, Box, Button, Tooltip, Avatar, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { logout } from '../../features/auth/authSlice';
import type { RootState } from '../../redux/store';

interface HeaderProps { onMenuClick: () => void; }

export default function Header({ onMenuClick }: HeaderProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(226,232,240,0.8)',
        color: 'text.primary',
        zIndex: (theme) => theme.zIndex.drawer - 1,
        right: { md: '260px' },
        left: 0,
        width: { md: 'calc(100% - 260px)' },
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 60, md: 64 }, px: { xs: 2, md: 3 } }}>
        {/* Mobile menu button */}
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{ display: { md: 'none' }, color: 'text.secondary' }}
        >
          <MenuIcon />
        </IconButton>

        {/* Title */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            color="primary.main"
          >
            מערכת ניהול מלונות VIGGO
          </Typography>
        </Box>

        {/* User section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" fontWeight={600} color="text.primary" lineHeight={1.2}>
                {user?.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role === 'ADMIN' ? 'מנהל מערכת' : 'משתמש'}
              </Typography>
            </Box>
            <Avatar
              sx={{
                width: 36, height: 36,
                bgcolor: '#0D2B4E',
                fontSize: '0.9rem',
                fontWeight: 700,
              }}
            >
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />
          </Box>

          <Tooltip title="יציאה מהמערכת">
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<LogoutIcon fontSize="small" />}
              onClick={handleLogout}
              sx={{
                borderRadius: '10px',
                borderWidth: '1.5px',
                py: 0.7,
                px: 1.5,
                fontSize: '0.82rem',
                '&:hover': { borderWidth: '1.5px', bgcolor: 'rgba(239,68,68,0.05)' },
              }}
            >
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>יציאה</Box>
            </Button>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
