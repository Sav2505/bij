import { Router } from 'express';
import { login, getMe, createUser } from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validation.middleware';
import { loginSchema, createUserSchema } from './auth.dto';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, getMe);
router.post('/users', authenticate, requireAdmin, validate(createUserSchema), createUser);

export default router;
