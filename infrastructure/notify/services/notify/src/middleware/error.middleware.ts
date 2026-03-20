import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger.config';

/**
 * Centralized error handling middleware
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation error', details: err.flatten() });
    return;
  }

  const status = (err as any)?.statusCode ?? 500;
  const message = (err as Error).message ?? 'Internal server error';

  if (status >= 500) {
    logger.error('Unhandled error', { error: message, stack: (err as Error).stack });
  }

  res.status(status).json({ error: message });
}
