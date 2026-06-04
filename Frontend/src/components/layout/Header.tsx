import { useSelector } from 'react-redux';
import { AppBar, Toolbar, IconButton, Typography, Box, Avatar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import type { RootState } from '../../redux/store';

interface HeaderProps { onMenuClick: () => void; }

export default function Header({ onMenuClick }: HeaderProps) {
  const user = useSelector((s: RootState) => s.auth.user);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        justifyContent: 'center',
        color: 'text.primary',
        borderBottom: "1px solid rgba(0, 0, 0, 0.09)",
        zIndex: (theme) => theme.zIndex.drawer - 1,
        right: { md: '260px' },
        left: 0,
        width: { md: 'calc(100% - 260px)' },
        height: { xs: 60, md: 70 },
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

        {/* User section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 36, height: 36,
                bgcolor: '#0D2B4E',
                fontSize: '1rem',
                fontWeight: 700,
              }}
            >
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: 'right' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.2, fontSize: '0.96rem' }} noWrap>
                {user?.username}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {user?.role === 'ADMIN' ? 'מנהל מערכת' : 'משתמש'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Title */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 3.5,
              height: 42,
              borderRadius: '6px',
              background: 'linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%)',
              boxShadow: '0 2px 8px rgba(59,130,246,0.5)',
              flexShrink: 0,
            }}
          />
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: 'right' }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontSize: '1.4rem',
                lineHeight: 1.6,
                letterSpacing: '0.02em',
                background: 'linear-gradient(135deg, #0D2B4E 0%, #1D4ED8 60%, #3B82F6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 1px 2px rgba(29,78,216,0.18))',
                
              }}
            >
              IPTV מערכת ניהול תיקי אתר
            </Typography>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: '0.93rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#3B82F6',
                lineHeight: 1.1,
                textShadow: '0 0 12px rgba(59,130,246,0.4)',
              }}
            >
              B-Zone
            </Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
