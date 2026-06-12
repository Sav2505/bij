import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box, Card, CardContent, Typography, Grid, Chip, Button,
  Skeleton, Avatar, Tab, Tabs, IconButton,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import ComputerIcon from '@mui/icons-material/Computer';
import BuildIcon from '@mui/icons-material/Build';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useGetHotelByIdQuery } from '../../api/hotelsApi';
import type { Contact } from '../../api/hotelsApi';
import type { RootState } from '../../redux/store';
import HotelForm from './HotelForm';

const categoryLabel: Record<string, string> = {
  MANAGEMENT: 'הנהלה',
  IT: 'מחשוב',
  MAINTENANCE: 'אחזקה',
  PROCUREMENT: 'רכש',
};

const categoryIcon: Record<string, React.ReactNode> = {
  MANAGEMENT: <PersonIcon />,
  IT: <ComputerIcon />,
  MAINTENANCE: <BuildIcon />,
  PROCUREMENT: <ShoppingCartIcon />,
};

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <Box sx={{ display: 'flex', gap: 1, py: 0.75, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { border: 0 } }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160, flexShrink: 0 }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>{value}</Typography>
    </Box>
  );
}

function ContactCard({ contact }: { contact: Contact }) {
  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
          {categoryIcon[contact.category]}
        </Avatar>
        <Box>
          <Typography sx={{ fontWeight: 600 }}>{contact.name || '—'}</Typography>
          <Chip label={categoryLabel[contact.category]} size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: '0.7rem' }} />
        </Box>
      </Box>
      {contact.role && <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{contact.role}</Typography>}
      {contact.phone && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 0.5 }}>
          {contact.phone.split(',').map((p, i) => (
            <Typography key={i} variant="body2">
              📞{' '}
              <a href={`tel:${p.trim().replace(/\s/g, '')}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 500 }}>
                {p.trim()}
              </a>
            </Typography>
          ))}
        </Box>
      )}
      {contact.email && (
        <Typography variant="body2">
          ✉️{' '}
          <a href={`mailto:${contact.email}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 500 }}>
            {contact.email}
          </a>
        </Typography>
      )}
    </Card>
  );
}

export default function HotelDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAdmin = useSelector((s: RootState) => s.auth.user?.role === 'ADMIN');
  const [tab, setTab] = useState(0);
  const [editOpen, setEditOpen] = useState(false);

  const { data, isLoading } = useGetHotelByIdQuery(id!);
  const hotel = data?.data;

  if (isLoading) {
    return (
      <Box dir="rtl">
        <Skeleton height={48} width={200} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}><Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} /></Grid>
          <Grid size={{ xs: 12, md: 4 }}><Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} /></Grid>
        </Grid>
      </Box>
    );
  }

  if (!hotel) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} dir="rtl">
      {/* Top bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => navigate('/hotels')} size="small">
            <ArrowForwardIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{hotel.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {hotel.network?.name ?? ''} {hotel.location ? `· ${hotel.location}` : ''}
            </Typography>
          </Box>
        </Box>
        {isAdmin && (
          <Button dir="ltr" variant="outlined" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
            עריכה
          </Button>
        )}
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }} textColor="primary" indicatorColor="primary">
        <Tab label="פרטי המלון" />
        <Tab label={`אנשי קשר (${hotel.contacts.length})`} />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 600 }} color="primary">מידע כללי</Typography>
                <InfoRow label="שם המלון" value={hotel.name} />
                <InfoRow label="רשת מלונות" value={hotel.network?.name} />
                <InfoRow label="מיקום" value={hotel.location} />
                <InfoRow label="ספק תוכן" value={hotel.contentProvider} />
                <InfoRow label="איש מכירות" value={hotel.salesPerson} />
                <InfoRow label="איש קשר באתר" value={hotel.siteContact} />
                <InfoRow label="מספר חדרים" value={hotel.roomCount} />
                {hotel.remarks && (
                  <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>הערות</Typography>
                    <Typography variant="body2">{hotel.remarks}</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }} color="primary">פרטים טכניים</Typography>
                <InfoRow label="קוד רישום VIGGO" value={hotel.viggoRegistrationCode} />
                <InfoRow label="קוד טכנאי" value={hotel.technicianCode} />
                <InfoRow label="שירות ותמיכה" value={hotel.serviceSupport} />
                <InfoRow label="סוג מכשיר" value={hotel.deviceType} />
                <InfoRow label="חיבור IP" value={hotel.ipConnection} />
                <InfoRow label="מקור ערוצים" value={hotel.channelSource} />
                <InfoRow label="מתגים" value={hotel.switches} />
              </CardContent>
            </Card>

            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }} color="primary">רישוי</Typography>
                <InfoRow label="רישוי פעיל + ספייר" value={hotel.activeSpareLicenses} />
                <InfoRow label="רישוי HOT" value={hotel.hotLicenseCount} />
                {hotel.hotLicenseNotes && <InfoRow label="הערות רישוי HOT" value={hotel.hotLicenseNotes} />}
                {hotel.notes && (
                  <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>הערות</Typography>
                    <Typography variant="body2">{hotel.notes}</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Grid container spacing={2}>
          {hotel.contacts.length === 0 ? (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography color="text.secondary">אין אנשי קשר רשומים עבור מלון זה</Typography>
              </Box>
            </Grid>
          ) : (
            hotel.contacts.map(contact => (
              <Grid key={contact.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <ContactCard contact={contact} />
              </Grid>
            ))
          )}
        </Grid>
      )}

      <HotelForm open={editOpen} onClose={() => setEditOpen(false)} hotel={hotel} />
    </motion.div>
  );
}
