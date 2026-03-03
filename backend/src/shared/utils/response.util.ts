import { Response } from 'express';
import { STATUS_CODES } from '../constants/status';

// STANDARD_SUCCESS_RESPONSE 
export const sendSuccess = <T>(
  res: Response,
  options: {
    statusCode?: number;
    message?: string;
    data?: T;
    meta?: Record<string, unknown>;
  },
): void => {
  const {
    statusCode = STATUS_CODES.OK,
    message,
    data,
    meta,
  } = options;

  res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta !== undefined && { meta }),
  });
};

// STANDARD_ERROR_RESPONSE
export const sendError = (
  res: Response,
  options: {
    statusCode?: number;
    message: string;
  },
): void => {
  const {
    statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR,
    message,
  } = options;

  res.status(statusCode).json({
    success: false,
    message,
  });
};