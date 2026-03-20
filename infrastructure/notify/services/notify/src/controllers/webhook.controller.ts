import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { query } from '../db/database';

const webhookEventSchema = z.object({
  eventType: z.string().min(1),
  notificationId: z.string().uuid().optional(),
  payload: z.record(z.any()).default({})
});

/**
 * POST /webhooks/events
 * Receive and store external webhook events
 */
export async function receiveWebhookEvent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = webhookEventSchema.parse(req.body);

    await query(
      `INSERT INTO notification_events (notification_id, event_type, payload)
       VALUES ($1, $2, $3)`,
      [body.notificationId ?? null, body.eventType, body.payload]
    );

    res.status(200).json({ status: 'received' });
  } catch (err) {
    next(err);
  }
}
