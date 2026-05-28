import { prisma } from '../../config/database';
import { comparePassword, hashPassword } from '../../utils/password.util';
import { signToken } from '../../utils/jwt.util';
import { AppError } from '../../middleware/error.middleware';
import { LoginDto, CreateUserDto } from './auth.dto';

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

  const token = signToken({ userId: user.id, role: user.role });

  return {
    token,
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
