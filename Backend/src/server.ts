import './config/env'; // validate env first (also loads dotenv)
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logger } from './config/logger';
import { errorMiddleware } from './middleware/error.middleware';
import authRoutes from './modules/auth/auth.routes';
import hotelsRoutes from './modules/hotels/hotels.routes';
import usersRoutes from './modules/users/users.routes';
import importRoutes from './modules/import/import.routes';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, message: 'יותר מדי בקשות, נסה שוב מאוחר יותר' });
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

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

// Error handler (must be last)
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
});
