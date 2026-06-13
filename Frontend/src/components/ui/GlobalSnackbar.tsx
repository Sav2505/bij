import { Snackbar, Alert } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { hideSnackbar } from '../../features/ui/snackbarSlice';
import type { RootState } from '../../redux/store';

const SEVERITY_COLORS: Record<string, string> = {
  success: '#1e8c4e',
  error:   '#c0392b',
  warning: '#d68910',
  info:    '#1a6fa8',
};

export default function GlobalSnackbar() {
  const dispatch = useDispatch();
  const { open, message, severity } = useSelector((s: RootState) => s.snackbar);

  const bg = SEVERITY_COLORS[severity ?? 'info'];

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={() => dispatch(hideSnackbar())}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={() => dispatch(hideSnackbar())}
        severity={severity}
        variant="filled"
        iconMapping={{ success: <span /> }}
        sx={{
          minWidth: 340,
          fontSize: '1rem',
          fontWeight: 600,
          letterSpacing: 0.2,
          borderRadius: '12px',
          backgroundColor: bg,
          color: '#fff',
          padding: '14px 20px',
          alignItems: 'center',
          gap: 1.5,
          boxShadow: '0 8px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.14)',
          // X button on the left (RTL-friendly flip)
          '& .MuiAlert-action': {
            marginRight: 'auto',
            marginLeft: -1,
            paddingTop: 0,
          },
          '& .MuiAlert-icon': {
            marginLeft: 0,
            fontSize: '1.3rem',
            opacity: 0.92,
          },
          '& .MuiAlert-message': {
            flex: 1,
            textAlign: 'right',
            padding: 0,
          },
          '& .MuiIconButton-root': {
            color: 'rgba(255,255,255,0.85)',
            '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.15)' },
          },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
