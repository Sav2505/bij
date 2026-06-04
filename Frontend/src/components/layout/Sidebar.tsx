import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Avatar, Chip, alpha,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HotelIcon from '@mui/icons-material/Hotel';
import PeopleIcon from '@mui/icons-material/People';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LogoutIcon from '@mui/icons-material/Logout';
import type { RootState } from '../../redux/store';

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: 'לוח מחוונים', icon: <DashboardIcon fontSize="small" />, path: '/dashboard' },
  { label: 'מלונות',       icon: <HotelIcon     fontSize="small" />, path: '/hotels'    },
];

const adminItems = [
  { label: 'ניהול משתמשים', icon: <PeopleIcon     fontSize="small" />, path: '/admin/users'  },
  { label: 'ייבוא נתונים',  icon: <UploadFileIcon fontSize="small" />, path: '/admin/import' },
];

// Colors for the dark sidebar
const SIDEBAR_BG    = '#0D1F38';
const ACTIVE_BG     = 'rgba(59,130,246,0.18)';
const ACTIVE_COLOR  = '#60A5FA';
const TEXT_COLOR    = 'rgba(255,255,255,0.72)';
const TEXT_HOVER    = 'rgba(255,255,255,0.95)';
const DIVIDER_COLOR = 'rgba(255,255,255,0.08)';

function NavItem({ item, active, onClick }: { item: { label: string; icon: React.ReactNode; path: string }; active: boolean; onClick: () => void }) {
  return (
    <ListItemButton
      onClick={onClick}
      sx={{
        borderRadius: '10px',
        mb: 0.5,
        px: 2,
        py: 1.1,
        color: active ? ACTIVE_COLOR : TEXT_COLOR,
        backgroundColor: active ? ACTIVE_BG : 'transparent',
        borderRight: active ? '3px solid #3B82F6' : '3px solid transparent',
        '&:hover': {
          backgroundColor: active ? ACTIVE_BG : 'rgba(255,255,255,0.06)',
          color: TEXT_HOVER,
        },
        transition: 'all 0.2s ease',
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 34,
          color: active ? ACTIVE_COLOR : TEXT_COLOR,
          transition: 'color 0.2s',
        }}
      >
        {item.icon}
      </ListItemIcon>
      <ListItemText
        primary={item.label}
        slotProps={{ primary: { style: { fontSize: '0.92rem', fontWeight: active ? 700 : 500 } } }}
      />
    </ListItemButton>
  );
}

function SidebarContent({ drawerWidth }: { drawerWidth: number }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.auth.user);
  const isAdmin = user?.role === 'ADMIN';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box sx={{ width: drawerWidth, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: SIDEBAR_BG }}>

      {/* Logo */}
      <Box sx={{ px: 3, pt: 3.5, pb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Box
            sx={{
              width: 36, height: 36,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(59,130,246,0.45)',
              flexShrink: 0,
            }}
          >
            <HotelIcon sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography
              sx={{
                color: 'white',
                fontWeight: 800,
                fontSize: '1.15rem',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}
            >
              B-Zone
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', fontWeight: 400 }}>
              מערכת ניהול
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mx: 2, height: '1px', bgcolor: DIVIDER_COLOR, mb: 2 }} />

      {/* User info */}
      <Box sx={{ px: 2.5, pb: 2.5 }}>
        <Box
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            bgcolor: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            p: 1.5,
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <Avatar
            sx={{
              bgcolor: 'rgba(59,130,246,0.3)',
              color: '#60A5FA',
              width: 36, height: 36,
              fontSize: '0.95rem',
              fontWeight: 700,
              border: '1.5px solid rgba(96,165,250,0.4)',
            }}
          >
            {user?.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.92)', fontWeight: 600, fontSize: '0.88rem', lineHeight: 1.2 }} noWrap>
              {user?.username}
            </Typography>
            <Typography sx={{ color: isAdmin ? '#60A5FA' : 'rgba(255,255,255,0.45)', fontSize: '0.72rem', fontWeight: 500 }}>
              {isAdmin ? 'מנהל מערכת' : 'משתמש'}
            </Typography>
          </Box>
          {isAdmin && (
            <Chip
              label="מנהל"
              size="small"
              sx={{
                bgcolor: alpha('#3B82F6', 0.2),
                color: '#60A5FA',
                fontSize: '0.65rem',
                fontWeight: 700,
                height: 20,
                border: '1px solid rgba(96,165,250,0.3)',
                mr: 'auto',
              }}
            />
          )}
        </Box>
      </Box>

      {/* Nav */}
      <Box sx={{ px: 1.5, flexGrow: 1, overflowY: 'auto' }}>
        <Typography sx={{ px: 1.5, pb: 1, color: 'rgba(255,255,255,0.3)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          ראשי
        </Typography>
        <List disablePadding>
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              active={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/'))}
              onClick={() => navigate(item.path)}
            />
          ))}
        </List>

        {isAdmin && (
          <>
            <Box sx={{ mx: 1.5, my: 2, height: '1px', bgcolor: DIVIDER_COLOR }} />
            <Typography sx={{ px: 1.5, pb: 1, color: 'rgba(255,255,255,0.3)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ניהול
            </Typography>
            <List disablePadding>
              {adminItems.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  active={location.pathname.startsWith(item.path)}
                  onClick={() => navigate(item.path)}
                />
              ))}
            </List>
          </>
        )}

        <Box sx={{ mx: 1.5, my: 2, height: '1px', bgcolor: DIVIDER_COLOR }} />
        <Typography sx={{ px: 1.5, pb: 1, color: 'rgba(255,255,255,0.3)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          חשבון
        </Typography>
        <List disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: '10px',
              mb: 0.5,
              px: 2,
              py: 1.1,
              color: '#F87171',
              '&:hover': {
                backgroundColor: 'rgba(239,68,68,0.1)',
                color: '#EF4444',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ListItemIcon sx={{ minWidth: 34, color: 'inherit' }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="התנתק"
              slotProps={{ primary: { style: { fontSize: '0.92rem', fontWeight: 500 } } }}
            />
          </ListItemButton>
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ height: '1px', bgcolor: DIVIDER_COLOR, mb: 2 }} />
        <Typography sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', textAlign: 'center' }}>
          גרסה 1.0.0 • B-Zone
        </Typography>
      </Box>
    </Box>
  );
}

export default function Sidebar({ drawerWidth, mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: drawerWidth, bgcolor: SIDEBAR_BG },
        }}
      >
        <SidebarContent drawerWidth={drawerWidth} />
      </Drawer>

      {/* Desktop */}
      <Drawer
        variant="permanent"
        anchor="right"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            position: 'fixed',
            top: 0, right: 0,
            height: '100vh',
            bgcolor: SIDEBAR_BG,
          },
        }}
        open
      >
        <SidebarContent drawerWidth={drawerWidth} />
      </Drawer>
    </>
  );
}
