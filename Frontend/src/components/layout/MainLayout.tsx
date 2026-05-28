import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import GlobalSnackbar from '../ui/GlobalSnackbar';

const DRAWER_WIDTH = 265;

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', direction: 'rtl' }}>
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          mr: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Header onMenuClick={() => setMobileOpen(true)} />
        <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, mt: { xs: '60px', md: '64px' } }}>
          <Outlet />
        </Box>
      </Box>
      <GlobalSnackbar />
    </Box>
  );
}
