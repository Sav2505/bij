import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { authenticate } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/role.middleware';
import { sendSuccess } from '../../utils/response.util';
import { AppError } from '../../middleware/error.middleware';
import { z } from 'zod';
import { validate } from '../../middleware/validation.middleware';

const router = Router();
router.use(authenticate, requireAdmin);

const updateUserSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    isActive: z.boolean().optional(),
    role: z.enum(['ADMIN', 'USER']).optional(),
  }),
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, users.map(u => ({ ...u, createdAt: u.createdAt.toISOString(), updatedAt: u.updatedAt.toISOString() })));
  } catch (error) { next(error); }
});

router.patch('/:id', validate(updateUserSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (id === req.user!.id) throw new AppError('לא ניתן לערוך את המשתמש שלך עצמך', 400);

    const user = await prisma.user.update({
      where: { id },
      data: req.body,
      select: { id: true, username: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true },
    });
    sendSuccess(res, { ...user, createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString() });
  } catch (error) { next(error); }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (id === req.user!.id) throw new AppError('לא ניתן למחוק את עצמך', 400);
    await prisma.user.update({ where: { id }, data: { isActive: false } });
    sendSuccess(res, null, 'משתמש הושבת בהצלחה');
  } catch (error) { next(error); }
});

export default router;
