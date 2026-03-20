import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.config';

/**
 * API Key authentication middleware
 * Expects Authorization header: Bearer <API_KEY>
 */
export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.header('Authorization');
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = header.substring('Bearer '.length).trim();
  if (token !== config.apiKey) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
}
