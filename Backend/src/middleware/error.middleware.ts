import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { sendError } from '../utils/response.util';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorMiddleware = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  logger.error(`${err.name}: ${err.message}`, { stack: err.stack, path: req.path, method: req.method });

  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.errors);
    return;
  }

  if (err.name === 'ZodError') {
    sendError(res, 'שגיאת וולידציה', 400);
    return;
  }

  sendError(res, 'שגיאת שרת פנימית', 500);
};
