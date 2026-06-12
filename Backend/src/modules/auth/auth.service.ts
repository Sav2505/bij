import { prisma } from '../../config/database';
import { comparePassword, hashPassword } from '../../utils/password.util';
import { signToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.util';
import { AppError } from '../../middleware/error.middleware';
import { LoginDto, CreateUserDto } from './auth.dto';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const login = async (dto: LoginDto) => {
  const user = await prisma.user.findFirst({
    where: { username: dto.username, isActive: true },
  });

  if (!user) throw new AppError('שם משתמש או סיסמה שגויים', 401);

  const valid = await comparePassword(dto.password, user.passwordHash);
  if (!valid) throw new AppError('שם משתמש או סיסמה שגויים', 401);

  await prisma.auditLog.create({
    data: { userId: user.id, action: 'LOGIN', entityType: 'User', entityId: user.id },
  });

  const accessToken = signToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  // Verify JWT signature first
  let userId: string;
  try {
    const payload = verifyRefreshToken(refreshToken);
    userId = payload.userId;
  } catch {
    throw new AppError('טוקן רענון לא תקין – יש להתחבר מחדש', 401);
  }

  // Check DB: must exist, not revoked, not expired
  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
    throw new AppError('טוקן רענון פג תוקף – יש להתחבר מחדש', 401);
  }

  // Ensure user still active
  const user = await prisma.user.findUnique({
    where: { id: userId, isActive: true },
    select: { id: true, role: true },
  });
  if (!user) throw new AppError('משתמש לא נמצא או לא פעיל', 401);

  // Rotate: revoke old token, issue new one
  await prisma.refreshToken.update({ where: { token: refreshToken }, data: { isRevoked: true } });

  const newRefreshToken = signRefreshToken({ userId: user.id });
  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  const accessToken = signToken({ userId: user.id, role: user.role });
  return { accessToken, newRefreshToken };
};

export const revokeRefreshToken = async (refreshToken: string) => {
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken, isRevoked: false },
    data: { isRevoked: true },
  });
};

export const createUser = async (dto: CreateUserDto, requesterId?: string) => {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ username: dto.username }, { email: dto.email }] },
  });
  if (existing) throw new AppError('שם המשתמש או האימייל כבר קיימים במערכת', 409);

  const passwordHash = await hashPassword(dto.password);
  const user = await prisma.user.create({
    data: { username: dto.username, email: dto.email, passwordHash, role: dto.role },
    select: { id: true, username: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true },
  });

  if (requesterId) {
    await prisma.auditLog.create({
      data: {
        userId: requesterId,
        action: 'CREATE',
        entityType: 'User',
        entityId: user.id,
        newValue: { username: user.username, email: user.email, role: user.role },
      },
    });
  }

  return { ...user, createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString() };
};

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true },
  });
  if (!user) throw new AppError('משתמש לא נמצא', 404);
  return { ...user, createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString() };
};
