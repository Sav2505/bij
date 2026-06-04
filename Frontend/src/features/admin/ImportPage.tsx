import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Box, Card, CardContent, Typography, LinearProgress,
  Alert, List, ListItem, ListItemText, Chip, Paper, Grid,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { showSnackbar } from '../ui/snackbarSlice';
import { baseApi } from '../../api/baseApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';

interface ImportResult {
  totalRows: number;
  successRows: number;
  errorRows: number;
  errors: Array<{ index: number; error: string }>;
}

export default function ImportPage() {
  const dispatch = useDispatch();
  const token = useSelector((s: RootState) => s.auth.token);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      dispatch(showSnackbar({ message: 'יש להעלות קובץ Excel בלבד (.xlsx)', severity: 'error' }));
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    setResult(null);

    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'שגיאת שרת');
      setResult(json.data);
      dispatch(showSnackbar({ message: json.message ?? 'ייבוא הושלם', severity: 'success' }));
      dispatch(baseApi.util.invalidateTags(['Hotel', 'Dashboard']));
    } catch (err: any) {
      dispatch(showSnackbar({ message: err.message ?? 'שגיאה בייבוא', severity: 'error' }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end', py: 4 }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mb: 3 }}>
          <Typography dir="rtl" variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>ייבוא נתונים מ-Excel</Typography>
          <Typography dir="rtl" variant="body2" color="text.secondary">
            ייבא נתוני תיקי אתר מקובץ Excel
          </Typography>
        </Box>
      </motion.div>

      <Grid container spacing={3} component="div">
        <Box sx={{ width: '100%', maxWidth: 680 }}>
          {/* Drop zone */}
          <Paper
            elevation={0}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInput.current?.click()}
            sx={{
              border: '2px dashed',
              borderColor: isDragging ? 'primary.main' : 'divider',
              borderRadius: 3,
              p: 6,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragging ? 'rgba(26,58,92,0.04)' : 'background.default',
              transition: 'all 0.2s',
              '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(26,58,92,0.03)' },
              mb: 3,
            }}
          >
            <UploadFileIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2, opacity: 0.6 }} />
            <Typography dir="rtl" variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              גרור ושחרר קובץ Excel כאן
            </Typography>
            <Typography dir="rtl" variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              או לחץ לבחירת קובץ
            </Typography>
            <Typography dir="rtl" variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
              פורמטים נתמכים: .xlsx | גודל מקסימלי: 10MB
            </Typography>
            <input
              ref={fileInput}
              type="file"
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ''; }}
            />
          </Paper>

          {isUploading && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography dir="rtl" variant="body1" sx={{ fontWeight: 500, mb: 1.5, textAlign: 'right' }}>מעבד קובץ...</Typography>
                <LinearProgress />
              </CardContent>
            </Card>
          )}

          {result && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent>
                  <Typography dir="rtl" variant="h6" sx={{ fontWeight: 600, mb: 2, textAlign: 'right' }}>תוצאות הייבוא</Typography>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <Chip label={`סה״כ שורות: ${result.totalRows}`} variant="outlined" />
                    <Chip icon={<CheckCircleIcon />} label={`הצליח: ${result.successRows}`} color="success" />
                    {result.errorRows > 0 && (
                      <Chip icon={<WarningIcon />} label={`שגיאות: ${result.errorRows}`} color="error" />
                    )}
                  </Box>

                  {result.errorRows === 0 ? (
                    <Alert severity="success" sx={{ borderRadius: 2 }}>
                      כל הנתונים יובאו בהצלחה!
                    </Alert>
                  ) : (
                    <>
                      <Alert severity="warning" sx={{ borderRadius: 2, mb: 1.5 }}>
                        {result.errorRows} שורות לא יובאו בשל שגיאות
                      </Alert>
                      <List dense>
                        {result.errors.slice(0, 10).map((e, i) => (
                          <ListItem key={i} divider>
                            <ListItemText
                              primary={`שורה ${e.index}`}
                              secondary={e.error}
                              slotProps={{
                                primary: { style: { fontWeight: 500, textAlign: 'right' } },
                                secondary: { style: { textAlign: 'right' } },
                              }}
                            />
                          </ListItem>
                        ))}
                        {result.errors.length > 10 && (
                          <ListItem>
                            <ListItemText secondary={`... ועוד ${result.errors.length - 10} שגיאות`} slotProps={{ secondary: { style: { textAlign: 'right' } } }} />
                          </ListItem>
                        )}
                      </List>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </Box>
      </Grid>
    </Box>
  );
}
