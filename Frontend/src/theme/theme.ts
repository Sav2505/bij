import { createTheme, alpha } from '@mui/material/styles';

const PRIMARY   = '#0D2B4E';   // Deep navy
const PRIMARY_L = '#163D6E';   // Lighter navy for hover
const ACCENT    = '#3B82F6';   // Bright blue accent
const SECONDARY = '#0EA5E9';   // Sky blue
const SUCCESS   = '#10B981';
const WARNING   = '#F59E0B';
const ERROR_C   = '#EF4444';
const BG        = '#F1F5FA';
const PAPER     = '#FFFFFF';
const SIDEBAR_BG = '#0D1F38';  // Very dark navy for sidebar

const theme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'light',
    primary:    { main: PRIMARY,   light: PRIMARY_L, contrastText: '#fff' },
    secondary:  { main: SECONDARY, contrastText: '#fff' },
    success:    { main: SUCCESS },
    warning:    { main: WARNING },
    error:      { main: ERROR_C },
    background: { default: BG, paper: PAPER },
    text:       { primary: '#0F172A', secondary: '#64748B' },
  },
  typography: {
    fontFamily: '"Heebo", "Assistant", "Arial", sans-serif',
    h4: { fontWeight: 800, fontSize: '1.8rem',  letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, fontSize: '1.4rem',  letterSpacing: '-0.01em' },
    h6: { fontWeight: 700, fontSize: '1.1rem',  letterSpacing: '-0.01em' },
    body1: { fontSize: '0.9375rem', lineHeight: 1.65 },
    body2: { fontSize: '0.875rem',  lineHeight: 1.6  },
    button: { fontWeight: 600, fontSize: '0.9375rem', letterSpacing: 0 },
    caption: { fontSize: '0.78rem' },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    '0 2px 8px rgba(0,0,0,0.07)',
    '0 4px 16px rgba(0,0,0,0.09)',
    '0 8px 30px rgba(0,0,0,0.11)',
    '0 12px 40px rgba(0,0,0,0.13)',
    ...Array(19).fill('0 12px 40px rgba(0,0,0,0.13)'),
  ] as any,
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        html, body {
          direction: rtl;
          text-align: start;
          font-family: 'Heebo', 'Arial', sans-serif;
        }
        * { box-sizing: border-box; }
        input, button, textarea, select {
          font-family: 'Heebo', 'Arial', sans-serif;
        }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          padding: '9px 22px',
          minHeight: 42,
          fontWeight: 600,
          transition: 'all 0.2s ease',
        },
        // In RTL, startIcon lands on the right → marginLeft becomes marginRight (auto-flipped)
        // Increase the gap (8→12) and reduce the negative outer edge (-4→-2)
        startIcon: {
          marginLeft: 8,
          marginRight: -2,
          '& > *:nth-of-type(1)': { fontSize: '1.1rem' },
        },
        endIcon: {
          marginRight: 8,
          marginLeft: -2,
          '& > *:nth-of-type(1)': { fontSize: '1.1rem' },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_L} 100%)`,
          boxShadow: `0 2px 10px ${alpha(PRIMARY, 0.35)}`,
          '&:hover': {
            background: `linear-gradient(135deg, ${PRIMARY_L} 0%, #1E4D8C 100%)`,
            boxShadow: `0 4px 16px ${alpha(PRIMARY, 0.45)}`,
            transform: 'translateY(-1px)',
          },
        },
        containedSecondary: {
          boxShadow: `0 2px 10px ${alpha(SECONDARY, 0.35)}`,
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': { borderWidth: '1.5px' },
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'medium', variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#FAFCFF',
            transition: 'box-shadow 0.2s',
            '&:hover fieldset': { borderColor: ACCENT },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha(ACCENT, 0.15)}`,
              '& fieldset': { borderColor: ACCENT, borderWidth: '1.5px' },
            },
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { fontWeight: 500 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid rgba(226,232,240,0.8)',
          transition: 'box-shadow 0.25s ease',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 16 },
        elevation1: { boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.06)' },
        elevation2: { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
        elevation3: { boxShadow: '0 4px 20px rgba(0,0,0,0.10)' },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_L} 100%)`,
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.875rem',
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': { backgroundColor: 'rgba(241,245,250,0.6)' },
          '&:hover': { backgroundColor: `${alpha(ACCENT, 0.05)}`, cursor: 'pointer' },
          transition: 'background-color 0.15s',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: 'rgba(226,232,240,0.7)', padding: '12px 16px' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.8rem',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 20, boxShadow: '0 25px 60px rgba(0,0,0,0.18)' },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: SIDEBAR_BG,
          borderLeft: 'none',
          borderRight: 'none',
          boxShadow: '4px 0 24px rgba(0,0,0,0.25)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(226,232,240,0.6)' },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          transition: 'all 0.2s ease',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { borderRadius: 8, fontSize: '0.82rem', fontFamily: '"Heebo", sans-serif' },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
  },
});

export default theme;
