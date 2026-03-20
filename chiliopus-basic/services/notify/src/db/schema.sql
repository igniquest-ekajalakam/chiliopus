-- Create schema for notify service
CREATE SCHEMA IF NOT EXISTS notify;

-- Set search path to notify schema for this session
SET search_path TO notify;

-- Enums (in notify schema)
CREATE TYPE notify.notification_channel AS ENUM ('email', 'sms', 'whatsapp', 'push', 'in_app');
CREATE TYPE notify.notification_status AS ENUM ('pending', 'queued', 'processing', 'sent', 'failed', 'cancelled');

-- Templates
CREATE TABLE IF NOT EXISTS notify.notify_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel notify.notification_channel NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notify.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel notify.notification_channel NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT,
  template_id UUID REFERENCES notify.notify_templates(id),
  payload JSONB NOT NULL,
  status notify.notification_status NOT NULL DEFAULT 'pending',
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ
);

-- Notification attempts
CREATE TABLE IF NOT EXISTS notify.notification_attempts (
  id BIGSERIAL PRIMARY KEY,
  notification_id UUID NOT NULL REFERENCES notify.notifications(id),
  attempt_number INTEGER NOT NULL,
  status notify.notification_status NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification events
CREATE TABLE IF NOT EXISTS notify.notification_events (
  id BIGSERIAL PRIMARY KEY,
  notification_id UUID REFERENCES notify.notifications(id),
  event_type TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Webhook configs
CREATE TABLE IF NOT EXISTS notify.notify_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_url TEXT NOT NULL,
  secret TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  event_types TEXT[] NOT NULL, -- e.g. ['notification.sent', 'notification.failed']
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Webhook deliveries
CREATE TABLE IF NOT EXISTS notify.webhook_deliveries (
  id BIGSERIAL PRIMARY KEY,
  webhook_id UUID NOT NULL REFERENCES notify.notify_webhooks(id),
  notification_id UUID REFERENCES notify.notifications(id),
  status TEXT NOT NULL, -- 'pending', 'delivered', 'failed'
  response_code INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notify.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient TEXT NOT NULL,
  channel notify.notification_channel NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (recipient, channel)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notify.notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notify.notifications(recipient);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notify.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notification_attempts_notification_id ON notify.notification_attempts(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_events_notification_id ON notify.notification_events(notification_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON notify.webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_recipient ON notify.notification_preferences(recipient);
