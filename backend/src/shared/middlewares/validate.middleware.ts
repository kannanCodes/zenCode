import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { STATUS_CODES } from '../constants/status';

export const validateRequest = (schema: ZodSchema) => {
     return (req: Request, res: Response, next: NextFunction) => {
          const result = schema.safeParse(req.body);

          if (!result.success) {
               const message = result.error.issues.map((e: { message: string }) => e.message).join(', ');
               return next(new AppError(message, STATUS_CODES.BAD_REQUEST));
          }

          req.body = result.data;
          next();
     };
};

export const validateQuery = (schema: ZodSchema) => {
     return (req: Request, res: Response, next: NextFunction) => {
          const result = schema.safeParse(req.query);

          if (!result.success) {
               const message = result.error.issues.map((e: { message: string }) => e.message).join(', ');
               return next(new AppError(message, STATUS_CODES.BAD_REQUEST));
          }

          // Assign sanitized and defaulted query values to a separate field
          // so controllers/services can rely on them safely.
          (req as any).validatedQuery = result.data;
          next();
     };
};
