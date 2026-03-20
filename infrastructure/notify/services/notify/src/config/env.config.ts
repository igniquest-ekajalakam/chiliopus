import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z.object({
  PORT: z.string().default('3000'),
  API_KEY: z.string().min(1, 'API_KEY is required'),
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.string().default('25'),
  SMTP_SECURE: z.string().default('false'), // 'true' for TLS/SSL (Gmail uses this)
  SMTP_USER: z.string().optional(), // Gmail email (for development)
  SMTP_PASS: z.string().optional(), // Gmail app password (for development)
  SMTP_FROM: z.string().optional(), // From email address
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL')
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast on invalid configuration
  console.error('Invalid environment configuration', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const config = {
  port: Number(env.PORT),
  apiKey: env.API_KEY,
  smtpHost: env.SMTP_HOST,
  smtpPort: Number(env.SMTP_PORT),
  smtpSecure: env.SMTP_SECURE === 'true',
  smtpUser: env.SMTP_USER,
  smtpPass: env.SMTP_PASS,
  smtpFrom: env.SMTP_FROM || env.SMTP_USER || 'no-reply@chiliopus.local',
  redisHost: env.REDIS_HOST,
  redisPort: Number(env.REDIS_PORT),
  databaseUrl: env.DATABASE_URL
};
