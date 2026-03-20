import { createSmtpTransport } from '../config/smtp.config';
import { config } from '../config/env.config';
import { logger } from '../config/logger.config';

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email via SMTP
 * - Development: Google SMTP (Gmail)
 * - Production: Postfix SMTP
 */
export async function sendEmailViaSmtp(input: SendEmailInput): Promise<void> {
  const transport = createSmtpTransport();
  try {
    const info = await transport.sendMail({
      from: config.smtpFrom,
      to: input.to,
      subject: input.subject,
      html: input.html
    });
    logger.info('Email sent successfully', { messageId: info.messageId, to: input.to });
  } catch (err) {
    logger.error('Failed to send email', { error: (err as Error).message, to: input.to });
    throw err;
  } finally {
    transport.close();
  }
}
