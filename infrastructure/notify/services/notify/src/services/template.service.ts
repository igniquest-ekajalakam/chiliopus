import fs from 'fs/promises';
import path from 'path';
import Handlebars from 'handlebars';
import { logger } from '../config/logger.config';
import { NotificationChannel } from '../models/notification.model';
import { getTemplateByNameAndChannel } from '../models/template.model';

type TemplateCacheKey = `${NotificationChannel}:${string}`;

const templateCache = new Map<TemplateCacheKey, Handlebars.TemplateDelegate>();

/**
 * Resolve template file path on disk
 */
function resolveTemplateFilePath(channel: NotificationChannel, name: string): string {
  // Currently we only support email templates on disk under templates/email
  if (channel === 'email') {
    return path.join(__dirname, '..', '..', 'templates', 'email', `${name}.hbs`);
  }
  // Future channels can be added here
  return path.join(__dirname, '..', '..', 'templates', channel, `${name}.hbs`);
}

/**
 * Render a Handlebars template with variables
 * Templates are cached in memory for performance
 */
export async function renderTemplate(
  channel: NotificationChannel,
  name: string,
  variables: Record<string, unknown>
): Promise<string> {
  const key: TemplateCacheKey = `${channel}:${name}`;
  let compiled = templateCache.get(key);

  if (!compiled) {
    // Try DB metadata first (for future extensibility)
    const dbTemplate = await getTemplateByNameAndChannel(name, channel);
    const filePath = dbTemplate?.file_path ?? resolveTemplateFilePath(channel, name);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      compiled = Handlebars.compile(content);
      templateCache.set(key, compiled);
      logger.info('Template loaded and cached', { channel, name, filePath });
    } catch (err) {
      logger.error('Failed to load template', { channel, name, error: (err as Error).message });
      throw new Error(`Template not found: ${channel}/${name}`);
    }
  }

  return compiled(variables);
}
