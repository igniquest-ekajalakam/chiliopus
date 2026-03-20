import { query, queryOne } from '../db/database';

export type NotificationChannel = 'email' | 'sms' | 'whatsapp' | 'push' | 'in_app';
export type NotificationStatus = 'pending' | 'queued' | 'processing' | 'sent' | 'failed' | 'cancelled';

export interface Notification {
  id: string;
  channel: NotificationChannel;
  recipient: string;
  subject: string | null;
  template_id: string | null;
  payload: Record<string, unknown>;
  status: NotificationStatus;
  retry_count: number;
  max_retries: number;
  error_message: string | null;
  created_at: string;
  scheduled_at: string | null;
  sent_at: string | null;
}

export interface NotificationAttempt {
  id: number;
  notification_id: string;
  attempt_number: number;
  status: NotificationStatus;
  error_message: string | null;
  created_at: string;
}

export interface CreateNotificationInput {
  channel: NotificationChannel;
  recipient: string;
  subject?: string;
  templateId?: string;
  payload: Record<string, unknown>;
  status?: NotificationStatus;
  maxRetries?: number;
  scheduledAt?: Date | null;
}

/**
 * Create a new notification record
 */
export async function createNotification(input: CreateNotificationInput): Promise<Notification> {
  const rows = await query<Notification>(
    `INSERT INTO notifications
      (channel, recipient, subject, template_id, payload, status, max_retries, scheduled_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      input.channel,
      input.recipient,
      input.subject ?? null,
      input.templateId ?? null,
      input.payload,
      input.status ?? 'pending',
      input.maxRetries ?? 3,
      input.scheduledAt ?? null
    ]
  );
  return rows[0];
}

/**
 * Get notification by ID
 */
export async function getNotificationById(id: string): Promise<Notification | null> {
  return queryOne<Notification>('SELECT * FROM notifications WHERE id = $1', [id]);
}

/**
 * Update notification status and related fields
 */
export async function updateNotificationStatus(
  id: string,
  status: NotificationStatus,
  errorMessage?: string | null
): Promise<Notification | null> {
  const rows = await query<Notification>(
    `UPDATE notifications
     SET status = $2::notify.notification_status,
         error_message = $3,
         sent_at = CASE WHEN $2::text = 'sent' THEN NOW() ELSE sent_at END,
         retry_count = CASE WHEN $2::text = 'failed' THEN retry_count + 1 ELSE retry_count END
     WHERE id = $1
     RETURNING *`,
    [id, status, errorMessage ?? null]
  );
  return rows[0] ?? null;
}

/**
 * Record a notification attempt
 */
export async function recordNotificationAttempt(input: {
  notificationId: string;
  attemptNumber: number;
  status: NotificationStatus;
  errorMessage?: string | null;
}): Promise<NotificationAttempt> {
  const rows = await query<NotificationAttempt>(
    `INSERT INTO notification_attempts
      (notification_id, attempt_number, status, error_message)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [input.notificationId, input.attemptNumber, input.status, input.errorMessage ?? null]
  );
  return rows[0];
}

/**
 * List all attempts for a notification
 */
export async function listNotificationAttempts(notificationId: string): Promise<NotificationAttempt[]> {
  return query<NotificationAttempt>(
    'SELECT * FROM notification_attempts WHERE notification_id = $1 ORDER BY attempt_number ASC',
    [notificationId]
  );
}
