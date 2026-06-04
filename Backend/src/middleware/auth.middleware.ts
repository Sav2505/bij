import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../utils/jwt.util';
import { prisma } from '../config/database';
import { sendError } from '../utils/response.util';

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    sendError(res, 'לא מורשה – נדרשת התחברות', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  let payload: ReturnType<typeof verifyToken>;
  try {
    payload = verifyToken(token);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      sendError(res, 'הטוקן פג תוקף – יש להתחבר מחדש', 401);
    } else {
      sendError(res, 'טוקן לא תקין', 401);
    }
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId, isActive: true },
      select: { id: true, username: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true },
    });

    if (!user) {
      sendError(res, 'משתמש לא נמצא או לא פעיל', 401);
      return;
    }

    req.user = {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    next();
  } catch (err) {
    next(err); // DB error → global error handler
  }
};
