import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.util';

export const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Allow health check without API key (for Render's uptime checks)
  if (req.path === '/health') return next();

  const clientKey = req.headers['x-api-key'];
  const serverKey = process.env.API_KEY;

  if (!serverKey) {
    // API_KEY not configured — fail closed (deny all)
    sendError(res, 'Server misconfiguration', 500);
    return;
  }

  if (!clientKey || clientKey !== serverKey) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  next();
};
