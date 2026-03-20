import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  createNotification,
  getNotificationById,
  listNotificationAttempts
} from '../models/notification.model';
import { enqueueNotificationJob } from '../services/queue.service';

const emailRequestSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  template: z.string().min(1),
  variables: z.record(z.any()).default({})
});

/**
 * POST /notify/email
 * Queue an email notification
 */
export async function postEmailNotify(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = emailRequestSchema.parse(req.body);

    // Create notification record
    const notification = await createNotification({
      channel: 'email',
      recipient: body.to,
      subject: body.subject,
      templateId: undefined, // Template name is in payload, not DB reference
      payload: {
        template: body.template,
        variables: body.variables
      },
      status: 'queued'
    });

    // Enqueue job for worker processing
    await enqueueNotificationJob({
      notificationId: notification.id,
      channel: 'email'
    });

    res.status(202).json({
      status: 'queued',
      jobId: notification.id
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /notify/sms
 * Queue an SMS notification (stub for future implementation)
 */
export async function postSmsNotify(
  _req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  res.status(501).json({ error: 'SMS notifications not implemented yet' });
}

/**
 * POST /notify/push
 * Queue a push notification (stub for future implementation)
 */
export async function postPushNotify(
  _req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  res.status(501).json({ error: 'Push notifications not implemented yet' });
}

/**
 * GET /notify/status/:jobId
 * Get notification status and attempt history
 */
export async function getNotificationStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const jobId = req.params.jobId;
    const notification = await getNotificationById(jobId);
    
    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    const attempts = await listNotificationAttempts(jobId);

    res.json({
      id: notification.id,
      channel: notification.channel,
      recipient: notification.recipient,
      subject: notification.subject,
      status: notification.status,
      retryCount: notification.retry_count,
      maxRetries: notification.max_retries,
      errorMessage: notification.error_message,
      createdAt: notification.created_at,
      scheduledAt: notification.scheduled_at,
      sentAt: notification.sent_at,
      attempts
    });
  } catch (err) {
    next(err);
  }
}
