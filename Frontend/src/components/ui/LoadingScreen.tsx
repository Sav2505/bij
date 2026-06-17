import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { motion } from 'framer-motion';

const bounce = keyframes`
  0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
  30% { transform: translateY(-10px); opacity: 1; }
`;

const shimmer = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.0), 0 8px 32px rgba(13,43,78,0.18); }
  50% { box-shadow: 0 0 0 8px rgba(59,130,246,0.12), 0 8px 40px rgba(59,130,246,0.28); }
`;

export default function LoadingScreen() {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '70vh',
        gap: 3,
        userSelect: 'none',
      }}
    >
      {/* Brand icon */}
      <Box
        sx={{
          width: 70,
          height: 70,
          borderRadius: '20px',
          background: 'linear-gradient(145deg, #0D2B4E 0%, #3B82F6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: `${shimmer} 2s ease-in-out infinite`,
          mb: 0.5,
        }}
      >
        <img src="/favicon.svg" alt="" aria-hidden="true" style={{ width: 40, height: 40 }} />
      </Box>

      {/* Bouncing dots */}
      <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', height: 24 }}>
        {[0, 1, 2].map(i => (
          <Box
            key={i}
            sx={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0D2B4E, #3B82F6)',
              animation: `${bounce} 1.3s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </Box>

      {/* Label */}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ letterSpacing: '0.06em', fontSize: '0.78rem', fontWeight: 500 }}
      >
        טוען נתונים...
      </Typography>
    </Box>
  );
}

