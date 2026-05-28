import { Snackbar, Alert } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { hideSnackbar } from '../../features/ui/snackbarSlice';
import type { RootState } from '../../redux/store';

export default function GlobalSnackbar() {
  const dispatch = useDispatch();
  const { open, message, severity } = useSelector((s: RootState) => s.snackbar);

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={() => dispatch(hideSnackbar())}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={() => dispatch(hideSnackbar())}
        severity={severity}
        variant="filled"
        sx={{ minWidth: 300, borderRadius: 2 }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
