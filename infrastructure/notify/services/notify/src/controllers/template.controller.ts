import { Request, Response, NextFunction } from 'express';
import { listTemplates, getTemplateById } from '../models/template.model';

/**
 * GET /templates
 * List all notification templates
 */
export async function listAllTemplates(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const templates = await listTemplates();
    res.json(templates);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /templates/:templateId
 * Get a specific template by ID
 */
export async function getTemplate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const template = await getTemplateById(req.params.templateId);
    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }
    res.json(template);
  } catch (err) {
    next(err);
  }
}
