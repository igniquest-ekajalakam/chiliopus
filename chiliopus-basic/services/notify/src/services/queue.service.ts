import { Queue, JobsOptions, ConnectionOptions } from 'bullmq';
import { redisOptions } from '../config/redis.config';
import { logger } from '../config/logger.config';
import { NotificationChannel } from '../models/notification.model';

export const NOTIFICATION_QUEUE_NAME = 'notification_queue';

const connection: ConnectionOptions = redisOptions;

export interface NotificationJobData {
  notificationId: string;
  channel: NotificationChannel;
}

const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000
  }
};

const queue = new Queue<NotificationJobData>(NOTIFICATION_QUEUE_NAME, {
  connection,
  defaultJobOptions
});

/**
 * Enqueue a notification job to BullMQ
 * @param data Job data containing notificationId and channel
 * @param opts Optional job options (e.g., delay for scheduled notifications)
 * @returns Job ID as string
 */
export async function enqueueNotificationJob(
  data: NotificationJobData,
  opts?: JobsOptions
): Promise<string> {
  const job = await queue.add('send-notification', data, opts);
  logger.info('Enqueued notification job', {
    jobId: job.id,
    notificationId: data.notificationId,
    channel: data.channel
  });
  return String(job.id);
}
