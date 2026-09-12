import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response';

export function validateBody(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req.body);
      req.body = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        }));
        return sendError(res, 'Validation error', 400, errors);
      }
      next(error);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req.query);
      // Mutate properties without reassigning the getter
      for (const key of Object.keys(req.query)) {
        delete (req.query as any)[key];
      }
      Object.assign(req.query, parsed);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        }));
        return sendError(res, 'Invalid query parameters', 400, errors);
      }
      next(error);
    }
  };
}
