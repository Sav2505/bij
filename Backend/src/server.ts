import './config/env'; // validate env first (also loads dotenv)
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { logger } from './config/logger';
import { prisma } from './config/database';
import { errorMiddleware } from './middleware/error.middleware';
import { apiKeyMiddleware } from './middleware/api-key.middleware';
import authRoutes from './modules/auth/auth.routes';
import hotelsRoutes from './modules/hotels/hotels.routes';
import usersRoutes from './modules/users/users.routes';
import importRoutes from './modules/import/import.routes';

const app = express();

// Security
app.use(helmet());

const isProd = process.env.IS_PROD === 'true';
const ALLOWED_ORIGINS = [
  ...(process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : []),
  ...(!isProd ? ['http://localhost:5173'] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, server-to-server)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true,
}));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, message: 'יותר מדי בקשות, נסה שוב מאוחר יותר' });
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// API key protection — must come before all routes
app.use(apiKeyMiddleware);

// Request logging
app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/import', importRoutes);

// Health check
app.get('/health', (_req, res) => { res.json({ status: 'ok', timestamp: new Date().toISOString() }); });

// Serve built frontend in production + SPA catch-all
if (isProd) {
  const distPath = path.resolve(__dirname, '../../Frontend/dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Error handler (must be last)
app.use(errorMiddleware);

// Keep-alive: מונע שינה של Supabase ו-Render כל 10 דקות
const PING_INTERVAL_MS = 10 * 60 * 1000;
setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.debug('[keep-alive] DB ping OK');
  } catch (err) {
    logger.warn('[keep-alive] DB ping failed:', err);
  }
}, PING_INTERVAL_MS);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
});
