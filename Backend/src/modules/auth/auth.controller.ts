import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { sendSuccess, sendError } from '../../utils/response.util';

const REFRESH_COOKIE_PATH = '/api/auth';
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: REFRESH_COOKIE_PATH,
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { accessToken, refreshToken, user } = await authService.login(req.body);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    sendSuccess(res, { token: accessToken, user }, 'התחברת בהצלחה');
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken: string | undefined = req.cookies?.refreshToken;
    if (!refreshToken) {
      sendError(res, 'טוקן רענון חסר – יש להתחבר מחדש', 401);
      return;
    }
    const { accessToken, newRefreshToken } = await authService.refreshAccessToken(refreshToken);
    res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);
    sendSuccess(res, { token: accessToken }, 'טוקן חודש בהצלחה');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken: string | undefined = req.cookies?.refreshToken;
    if (refreshToken) {
      await authService.revokeRefreshToken(refreshToken);
    }
    res.clearCookie('refreshToken', { path: REFRESH_COOKIE_PATH });
    sendSuccess(res, null, 'התנתקת בהצלחה');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await authService.getMe(req.user!.id);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await authService.createUser(req.body, req.user?.id);
    sendSuccess(res, user, 'משתמש נוצר בהצלחה', 201);
  } catch (error) {
    next(error);
  }
};
