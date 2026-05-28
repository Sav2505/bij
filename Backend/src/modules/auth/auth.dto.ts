import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(1, 'שם משתמש נדרש'),
    password: z.string().min(1, 'סיסמה נדרשת'),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    username: z.string().min(2, 'שם משתמש חייב להכיל לפחות 2 תווים'),
    email: z.string().email('כתובת אימייל לא תקינה'),
    password: z.string().min(6, 'סיסמה חייבת להכיל לפחות 6 תווים'),
    role: z.enum(['ADMIN', 'USER']).default('USER'),
  }),
});

export type LoginDto = z.infer<typeof loginSchema>['body'];
export type CreateUserDto = z.infer<typeof createUserSchema>['body'];
