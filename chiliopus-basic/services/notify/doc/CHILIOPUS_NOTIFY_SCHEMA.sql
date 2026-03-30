-- =====================================================
-- CHILIOPUS NOTIFY DATABASE SCHEMA
-- PostgreSQL
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE notification_channel AS ENUM (
    'email',
    'sms',
    'whatsapp',
    'push',
    'in_app'
);

CREATE TYPE notification_status AS ENUM (
    'queued',
    'processing',
    'sent',
    'delivered',
    'failed',
    'retrying'
);

CREATE TYPE template_type AS ENUM (
    'email',
    'sms',
    'whatsapp',
    'push'
);

-- =====================================================
-- NOTIFICATION TEMPLATES
-- =====================================================

CREATE TABLE notify_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    channel template_type NOT NULL,
    subject VARCHAR(255),
    body TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notify_templates_name
ON notify_templates(name);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel notification_channel NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    template_id UUID REFERENCES notify_templates(id),
    payload JSONB,
    status notification_status DEFAULT 'queued',
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP
);

CREATE INDEX idx_notifications_status
ON notifications(status);

CREATE INDEX idx_notifications_channel
ON notifications(channel);

CREATE INDEX idx_notifications_created_at
ON notifications(created_at);

-- =====================================================
-- NOTIFICATION EVENTS
-- =====================================================

CREATE TABLE notification_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    event_type VARCHAR(50),
    event_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_events_notification
ON notification_events(notification_id);

-- =====================================================
-- DELIVERY ATTEMPTS
-- =====================================================

CREATE TABLE notification_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL,
    status notification_status,
    response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_attempts_notification
ON notification_attempts(notification_id);

-- =====================================================
-- WEBHOOK SUBSCRIPTIONS
-- =====================================================

CREATE TABLE notify_webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL,
    secret VARCHAR(255),
    event_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- WEBHOOK DELIVERY LOG
-- =====================================================

CREATE TABLE webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id UUID REFERENCES notify_webhooks(id) ON DELETE CASCADE,
    notification_id UUID REFERENCES notifications(id),
    payload JSONB,
    status VARCHAR(50),
    response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- USER NOTIFICATION PREFERENCES
-- =====================================================

CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    whatsapp_enabled BOOLEAN DEFAULT FALSE,
    push_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_preferences_user
ON notification_preferences(user_id);