import { query } from '../db/database';
import { logger } from '../config/logger.config';

export interface NotifyWebhook {
  id: string;
  target_url: string;
  secret: string | null;
  is_active: boolean;
  event_types: string[];
  created_at: string;
  updated_at: string;
}

/**
 * List active webhooks that subscribe to a specific event type
 */
export async function listActiveWebhooksForEvent(eventType: string): Promise<NotifyWebhook[]> {
  return query<NotifyWebhook>(
    `SELECT * FROM notify_webhooks
     WHERE is_active = TRUE
       AND $1 = ANY(event_types)`,
    [eventType]
  );
}

/**
 * Record a webhook delivery attempt
 */
export async function recordWebhookDelivery(input: {
  webhookId: string;
  notificationId?: string | null;
  status: 'pending' | 'delivered' | 'failed';
  responseCode?: number | null;
  errorMessage?: string | null;
}): Promise<void> {
  await query(
    `INSERT INTO webhook_deliveries
      (webhook_id, notification_id, status, response_code, error_message, delivered_at)
     VALUES ($1, $2, $3, $4, $5,
       CASE WHEN $3 = 'delivered' THEN NOW() ELSE NULL END)`,
    [
      input.webhookId,
      input.notificationId ?? null,
      input.status,
      input.responseCode ?? null,
      input.errorMessage ?? null
    ]
  );
}

/**
 * Trigger outbound webhooks for notification events
 * This is called by the worker after processing notifications
 */
export async function triggerNotificationEvent(input: {
  notificationId: string;
  eventType: string;
  payload: Record<string, unknown>;
}): Promise<void> {
  const webhooks = await listActiveWebhooksForEvent(input.eventType);

  if (webhooks.length === 0) {
    logger.debug('No active webhooks for event type', { eventType: input.eventType });
    return;
  }

  for (const webhook of webhooks) {
    // Record initial pending delivery
    await recordWebhookDelivery({
      webhookId: webhook.id,
      notificationId: input.notificationId,
      status: 'pending'
    });

    try {
      const res = await fetch(webhook.target_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(webhook.secret ? { 'X-Webhook-Secret': webhook.secret } : {})
        },
        body: JSON.stringify({
          notificationId: input.notificationId,
          eventType: input.eventType,
          payload: input.payload
        })
      });

      const status = res.ok ? 'delivered' : 'failed';
      await recordWebhookDelivery({
        webhookId: webhook.id,
        notificationId: input.notificationId,
        status,
        responseCode: res.status,
        errorMessage: res.ok ? null : `HTTP ${res.status}`
      });

      logger.info('Webhook delivered', {
        webhookId: webhook.id,
        notificationId: input.notificationId,
        status,
        responseCode: res.status
      });
    } catch (err) {
      logger.error('Webhook dispatch error', {
        webhookId: webhook.id,
        notificationId: input.notificationId,
        error: (err as Error).message
      });
      await recordWebhookDelivery({
        webhookId: webhook.id,
        notificationId: input.notificationId,
        status: 'failed',
        responseCode: null,
        errorMessage: (err as Error).message
      });
    }
  }
}
