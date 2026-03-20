import { query, queryOne } from '../db/database';
import { NotificationChannel } from './notification.model';

export interface NotifyTemplate {
  id: string;
  channel: NotificationChannel;
  name: string;
  description: string | null;
  file_path: string;
  created_at: string;
  updated_at: string;
}

/**
 * List all templates
 */
export async function listTemplates(): Promise<NotifyTemplate[]> {
  return query<NotifyTemplate>('SELECT * FROM notify_templates ORDER BY created_at DESC');
}

/**
 * Get template by ID
 */
export async function getTemplateById(id: string): Promise<NotifyTemplate | null> {
  return queryOne<NotifyTemplate>('SELECT * FROM notify_templates WHERE id = $1', [id]);
}

/**
 * Get template by name and channel
 */
export async function getTemplateByNameAndChannel(
  name: string,
  channel: NotificationChannel
): Promise<NotifyTemplate | null> {
  return queryOne<NotifyTemplate>(
    'SELECT * FROM notify_templates WHERE name = $1 AND channel = $2',
    [name, channel]
  );
}
