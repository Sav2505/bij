import { motion } from 'framer-motion';
import { Grid, Card, CardContent, Typography, Box, Skeleton, Chip, Divider } from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import UpdateIcon from '@mui/icons-material/Update';
import { useGetDashboardStatsQuery } from '../../api/hotelsApi';
import { useNavigate } from 'react-router-dom';

// ─── Banner ───────────────────────────────────────────────────────────────────
function DashboardBanner() {
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Box
        sx={{
          mb: 4, p: 3, borderRadius: '20px',
          background: 'linear-gradient(135deg, #0D2B4E 0%, #163D6E 50%, #1a4a82 100%)',
          color: 'white', position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
        }}
      >
        <Typography variant="h5" sx={{ position: 'relative', zIndex: 1 }}>
          לוח מחוונים
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5, position: 'relative', zIndex: 1 }}>
          סקירה כללית של מערכת המלונות
        </Typography>
      </Box>
    </motion.div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

function StatCard({ title, value, icon, color, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: 'easeOut' }}
    >
      <Card
        sx={{
          height: '100%', position: 'relative', overflow: 'hidden',
          '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' },
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box
              sx={{
                background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
                borderRadius: '14px', p: 1.5, display: 'flex',
                color: 'white', boxShadow: `0 4px 14px ${color}55`, flexShrink: 0,
              }}
            >
              {icon}
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", minWidth: 0 }}>
              <Typography variant="body2" sx={{ mb: 1, fontSize: '0.94rem', }}>
                {title}
              </Typography>
              <Typography variant="h4">
                {typeof value === 'number' ? value.toLocaleString('he-IL') : value}
              </Typography>
            </Box>
            {/* Icon – LEFT */}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Recent Update Row ────────────────────────────────────────────────────────
interface RecentUpdateRowProps {
  hotel: {
    id: string;
    name: string;
    network?: { name: string } | null;
    location?: string | null;
    deviceType?: string | null;
    updatedAt: string;
  };
  isLast: boolean;
  onNavigate: (id: string) => void;
}

function RecentUpdateRow({ hotel, isLast, onNavigate }: RecentUpdateRowProps) {
  return (
    <Box
      onClick={() => onNavigate(hotel.id)}
      sx={{
        px: 3, py: 1.5,
        display: 'flex', flexDirection: 'row',
        alignItems: 'center', justifyContent: 'space-between',
        borderBottom: !isLast ? '1px solid' : 'none',
        borderColor: 'divider',
        cursor: 'pointer', transition: 'background 0.15s',
        '&:hover': { bgcolor: 'action.hover' },
        gap: 2,
        width: "100%",
      }}
    >
      {/* ── Meta (LEFT – first child) – fixed width so all rows align ── */}
      <Box
        sx={{
          display: 'flex', flexDirection: 'row',
          alignItems: 'center', gap: 1,
          width: "80%",
          direction: "rtl",
        }}
      >
        {hotel.deviceType && (
          <Chip
            label={hotel.deviceType}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.75rem', height: 20, borderRadius: '6px' }}
          />
        )}
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}
        >
          {new Date(hotel.updatedAt).toLocaleDateString('he-IL')}
        </Typography>
      </Box>

      {/* ── Hotel info (RIGHT – last child) ── */}
      <Box sx={{ minWidth: 0, flex: 1, direction: 'rtl', textAlign: "left" }}>
        <Typography
          variant="body2"
          noWrap
          sx={{ color: 'text.primary', lineHeight: 1.6, fontWeight: 700, fontSize: '1.15rem', }}
        >
          {hotel.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
          {[hotel.network?.name, hotel.location].filter(Boolean).join(' · ') || '—'}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Recent Updates Card ──────────────────────────────────────────────────────
interface RecentUpdatesCardProps {
  isLoading: boolean;
  updates: RecentUpdateRowProps['hotel'][];
  onNavigate: (id: string) => void;
}

function RecentUpdatesCard({ isLoading, updates, onNavigate }: RecentUpdatesCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.4 }}>
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 1.5 }}>
            <UpdateIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: "700", fontSize: "1.2rem" }}>עדכונים אחרונים</Typography>
          </Box>
          <Divider />

          {isLoading ? (
            <Box sx={{ p: 3 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} height={52} sx={{ mb: 1 }} />
              ))}
            </Box>
          ) : updates.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">אין נתונים להצגה</Typography>
            </Box>
          ) : (
            <Box>
              {updates.map((hotel, i) => (
                <RecentUpdateRow
                  key={hotel.id}
                  hotel={hotel}
                  isLast={i === updates.length - 1}
                  onNavigate={onNavigate}
                />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data, isLoading } = useGetDashboardStatsQuery();
  const navigate = useNavigate();
  const stats = data?.data;

  return (
    <Box>
      <DashboardBanner />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
            </Grid>
          ))
        ) : (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <StatCard title="סה״כ מלונות" value={stats?.totalHotels ?? 0} icon={<HotelIcon />} color="#1A3A5C" delay={0.1} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <StatCard title="רשתות מלונות" value={stats?.totalNetworks ?? 0} icon={<AccountTreeIcon />} color="#2E7D9F" delay={0.2} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <StatCard title="סה״כ רשיונות" value={stats?.totalLicenses ?? 0} icon={<VpnKeyIcon />} color="#2E7D32" delay={0.3} />
            </Grid>
          </>
        )}
      </Grid>

      <RecentUpdatesCard
        isLoading={isLoading}
        updates={stats?.recentUpdates ?? []}
        onNavigate={(id) => navigate(`/hotels/${id}`)}
      />
    </Box>
  );
}
