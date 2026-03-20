import nodemailer, { Transporter } from 'nodemailer';
import { config } from './env.config';
import { logger } from './logger.config';

/**
 * Creates SMTP transport
 * - Development: Google SMTP (smtp.gmail.com) with authentication
 * - Production: Postfix (localhost:25) without authentication
 */
export function createSmtpTransport(): Transporter {
  const transportOptions: any = {
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure // true for 465 (SSL), false for 587 (TLS) or 25 (plain)
  };

  // Add authentication if credentials are provided (Google SMTP for development)
  if (config.smtpUser && config.smtpPass) {
    transportOptions.auth = {
      user: config.smtpUser,
      pass: config.smtpPass
    };
    logger.info('SMTP configured with authentication', { host: config.smtpHost });
  } else {
    logger.info('SMTP configured without authentication (Postfix)', { host: config.smtpHost });
  }

  return nodemailer.createTransport(transportOptions);
}
