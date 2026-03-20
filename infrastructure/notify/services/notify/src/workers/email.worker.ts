import { Worker, Job, ConnectionOptions } from 'bullmq';
import { redisOptions } from '../config/redis.config';
import { NOTIFICATION_QUEUE_NAME, NotificationJobData } from '../services/queue.service';
import {
  getNotificationById,
  updateNotificationStatus,
  recordNotificationAttempt
} from '../models/notification.model';
import { renderTemplate } from '../services/template.service';
import { sendEmailViaSmtp } from '../services/email.service';
import { triggerNotificationEvent } from '../services/webhook.service';
import { logger } from '../config/logger.config';

const connection: ConnectionOptions = redisOptions;

/**
 * Process a notification job from the queue
 */
async function processJob(job: Job<NotificationJobData>): Promise<void> {
  const { notificationId, channel } = job.data;

  logger.info('Processing notification job', {
    jobId: job.id,
    notificationId,
    channel
  });

  // Load notification record from database
  const notification = await getNotificationById(notificationId);
  if (!notification) {
    logger.error('Notification not found for job', { notificationId });
    throw new Error(`Notification not found: ${notificationId}`);
  }

  // Update status to processing
  await updateNotificationStatus(notificationId, 'processing');

  // Currently only email is supported
  if (channel !== 'email') {
    logger.warn('Unsupported channel for worker', { channel });
    await updateNotificationStatus(notificationId, 'failed', `Unsupported channel: ${channel}`);
    return;
  }

  const payload = notification.payload as {
    template?: string;
    variables?: Record<string, unknown>;
  };

  const templateName = payload.template;
  if (!templateName) {
    const error = 'Notification payload missing template name';
    logger.error(error, { notificationId });
    await updateNotificationStatus(notificationId, 'failed', error);
    throw new Error(error);
  }

  const variables = payload.variables ?? {};

  try {
    // Render template with variables
    const html = await renderTemplate('email', templateName, variables);

    // Send email via SMTP
    await sendEmailViaSmtp({
      to: notification.recipient,
      subject: notification.subject ?? 'Notification',
      html
    });

    // Update status to sent
    await updateNotificationStatus(notificationId, 'sent', null);
    
    // Record successful attempt
    await recordNotificationAttempt({
      notificationId,
      attemptNumber: notification.retry_count + 1,
      status: 'sent'
    });

    // Trigger webhook events
    await triggerNotificationEvent({
      notificationId,
      eventType: 'notification.sent',
      payload: { channel: notification.channel, recipient: notification.recipient }
    });

    logger.info('Notification sent successfully', { notificationId });
  } catch (err) {
    const errorMessage = (err as Error).message;

    // Update status to failed
    await updateNotificationStatus(notificationId, 'failed', errorMessage);
    
    // Record failed attempt
    await recordNotificationAttempt({
      notificationId,
      attemptNumber: notification.retry_count + 1,
      status: 'failed',
      errorMessage
    });

    // Trigger webhook event for failure
    await triggerNotificationEvent({
      notificationId,
      eventType: 'notification.failed',
      payload: { channel: notification.channel, error: errorMessage }
    });

    logger.error('Notification send failed', { notificationId, error: errorMessage });
    
    // Re-throw to let BullMQ handle retries
    throw err;
  }
}

// Create and start BullMQ worker
const worker = new Worker<NotificationJobData>(
  NOTIFICATION_QUEUE_NAME,
  async (job) => processJob(job),
  { connection }
);

worker.on('completed', (job) => {
  logger.info('Job completed successfully', { jobId: job.id });
});

worker.on('failed', (job, err) => {
  logger.error('Job failed', { jobId: job?.id, error: err.message });
});

logger.info('Email worker started', { queueName: NOTIFICATION_QUEUE_NAME });
