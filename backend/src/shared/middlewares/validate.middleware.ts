import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from '../utils/AppError';
import { STATUS_CODES } from '../constants/status';

export const validateRequest = (schema: Joi.ObjectSchema) => {
     return (req: Request, res: Response, next: NextFunction) => {
          const { error } = schema.validate(req.body, {
               abortEarly: false,
               stripUnknown: true,
          });

          if (error) {
               const message = error.details.map((detail) => detail.message).join(', ');
               return next(new AppError(message, STATUS_CODES.BAD_REQUEST));
          }

          next();
     };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
     return (req: Request, res: Response, next: NextFunction) => {
          const { error, value } = schema.validate(req.query, {
               abortEarly: false,
               stripUnknown: true,
          });

          if (error) {
               const message = error.details.map((detail) => detail.message).join(', ');
               return next(new AppError(message, STATUS_CODES.BAD_REQUEST));
          }

          (req as any).query = value;

          next();
     };
};
