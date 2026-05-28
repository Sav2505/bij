import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../../Shared/interfaces/auth/auth.interface';
import { sendError } from '../utils/response.util';

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'לא מורשה', 401);
      return;
    }
    if (!roles.includes(req.user.role)) {
      sendError(res, 'אין הרשאה לבצע פעולה זו', 403);
      return;
    }
    next();
  };
};

export const requireAdmin = requireRole('ADMIN');
