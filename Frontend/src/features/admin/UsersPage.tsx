import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box, Card, Typography, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, MenuItem, Select, FormControl,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useGetUsersQuery, useUpdateUserMutation, useDeactivateUserMutation } from '../../api/usersApi';

import { showSnackbar } from '../ui/snackbarSlice';
import CreateUserDialog from './CreateUserDialog';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function UsersPage() {
  const dispatch = useDispatch();
  const { data } = useGetUsersQuery();
  const [updateUser] = useUpdateUserMutation();
  const [deactivateUser, { isLoading: isDeactivating }] = useDeactivateUserMutation();
  const [createOpen, setCreateOpen] = useState(false);
  const [disableTarget, setDisableTarget] = useState<{ id: string; username: string } | null>(null);

  const users = data?.data ?? [];

  const handleRoleChange = async (id: string, role: 'ADMIN' | 'USER') => {
    try {
      await updateUser({ id, body: { role } }).unwrap();
      dispatch(showSnackbar({ message: 'תפקיד המשתמש עודכן', severity: 'success' }));
    } catch {
      dispatch(showSnackbar({ message: 'שגיאה בעדכון תפקיד', severity: 'error' }));
    }
  };

  const handleDeactivate = async () => {
    if (!disableTarget) return;
    try {
      await deactivateUser(disableTarget.id).unwrap();
      dispatch(showSnackbar({ message: 'משתמש הושבת', severity: 'success' }));
    } catch {
      dispatch(showSnackbar({ message: 'שגיאה בהשבתת משתמש', severity: 'error' }));
    }
    setDisableTarget(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setCreateOpen(true)}>
          הוסף משתמש
        </Button>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <Typography variant="h5" fontWeight={700}>ניהול משתמשים</Typography>
          <Typography variant="body2" color="text.secondary">{users.length} משתמשים רשומים</Typography>
        </Box>
      </Box>

      <Card>
        <TableContainer component={Paper} elevation={0}>
          <Table dir="rtl">
            <TableHead>
              <TableRow>
                <TableCell align="left">שם משתמש</TableCell>
                <TableCell align="left">אימייל</TableCell>
                <TableCell align="left">תפקיד</TableCell>
                <TableCell align="left">סטטוס</TableCell>
                <TableCell align="left">נוצר בתאריך</TableCell>
                <TableCell align="left">פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell align="left"><Typography fontWeight={600}>{user.username}</Typography></TableCell>
                  <TableCell align="left">{user.email}</TableCell>
                  <TableCell align="left">
                    <FormControl size="small">
                      <Select
                        value={user.role}
                        onChange={e => handleRoleChange(user.id, e.target.value as 'ADMIN' | 'USER')}
                        disabled={!user.isActive}
                        sx={{ minWidth: 100 }}
                      >
                        <MenuItem value="USER">משתמש</MenuItem>
                        <MenuItem value="ADMIN">מנהל</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell align="left">
                    <Chip
                      label={user.isActive ? 'פעיל' : 'מושבת'}
                      color={user.isActive ? 'success' : 'default'}
                      size="small"
                      icon={user.isActive ? <CheckCircleIcon /> : <BlockIcon />}
                    />
                  </TableCell>
                  <TableCell align="left">
                    <Typography variant="body2">{new Date(user.createdAt).toLocaleDateString('he-IL')}</Typography>
                  </TableCell>
                  <TableCell align="left">
                    {user.isActive && (
                      <Tooltip title="השבת משתמש">
                        <IconButton size="small" color="error" onClick={() => setDisableTarget({ id: user.id, username: user.username })}>
                          <BlockIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <CreateUserDialog open={createOpen} onClose={() => setCreateOpen(false)} />

      <ConfirmDialog
        open={!!disableTarget}
        title="השבתת משתמש"
        message={`האם להשבית את המשתמש "${disableTarget?.username}"?`}
        confirmLabel="השבת"
        confirmColor="error"
        isLoading={isDeactivating}
        onConfirm={handleDeactivate}
        onCancel={() => setDisableTarget(null)}
      />
    </Box>
  );
}
