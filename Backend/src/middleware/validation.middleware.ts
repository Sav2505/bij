import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError, ZodRawShape } from 'zod';
import { sendError } from '../utils/response.util';

export const validate = (schema: ZodObject<ZodRawShape>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) (req as any).query = parsed.query;
      if (parsed.params !== undefined) req.params = parsed.params as Record<string, string>;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        error.issues.forEach((e) => {
          const key = e.path.slice(1).join('.');
          if (!errors[key]) errors[key] = [];
          errors[key].push(e.message);
        });
        sendError(res, 'שגיאת וולידציה', 400, errors);
        return;
      }
      next(error);
    }
  };
};
