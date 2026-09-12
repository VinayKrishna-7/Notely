import { Response } from 'express';

export function sendSuccess<T = any>(
  res: Response,
  data: T,
  statusCode: number = 200,
  message?: string,
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  }
) {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    ...(pagination && { pagination }),
  });
}

export function sendError(
  res: Response,
  message: string = 'An unexpected error occurred',
  statusCode: number = 500,
  errors: any[] = []
) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}
