# ChiliopusNotify

ChiliopusNotify is a centralized notification microservice for the Chiliopus platform (CRM, LMS, POS).  
It exposes a REST API to queue notifications and uses Redis (BullMQ) workers plus PostgreSQL storage and Postfix SMTP for delivery.

## Features

- **Channels**: Email (ready), SMS / WhatsApp / Push / In-app (extensible)
- **Async Processing**: BullMQ queue (`notification_queue`) with retries and exponential backoff
- **Storage**: PostgreSQL for notifications, attempts, events, webhooks, preferences
- **Email**: Nodemailer + Handlebars templates
- **Security**: API key authentication (`Authorization: Bearer API_KEY`)
- **Logging**: Winston for structured logs
- **Deployment**: Docker + docker-compose (API, worker, Redis, Postgres)

## Architecture

```
Applications (CRM / LMS / POS)
        ↓
ChiliopusNotify REST API
        ↓
Redis Queue (BullMQ)
        ↓
Worker Service
        ↓
SMTP (Postfix running on VPS)
        ↓
Internet Email Delivery
```

## Requirements

- Node.js 18+
- Docker & docker-compose (recommended)
- **Development**: Google SMTP (Gmail) - no additional setup needed
- **Production**: Postfix SMTP running on the host (`localhost:25`, no auth)

## Setup

### Using Docker (Recommended)

1. Clone the repository and enter the project directory:

   ```bash
   cd chiliopus-notify
   ```

2. Copy environment file:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   - `API_KEY` (required)
   - **For Development**: Set `SMTP_USER` and `SMTP_PASS` for Gmail SMTP
   - **For Production**: Leave `SMTP_USER` and `SMTP_PASS` empty to use Postfix

3. Start all services:

   ```bash
   cd docker
   docker-compose up --build
   ```

   This will start:
   - API server on `http://localhost:3000`
   - Worker service (background)
   - Redis on port `6379`
   - PostgreSQL on port `5432`
   - Database is automatically initialized with `schema.sql`

4. **SMTP Configuration**:
   - **Development**: Configure Gmail SMTP in `.env` (see Environment Variables section below)
   - **Production**: Ensure Postfix is running on your host machine at `localhost:25`.  
     The Docker containers use `host.docker.internal` to access the host's Postfix service.

### Local Development (Without Docker)

1. Ensure PostgreSQL and Redis are running locally

2. Copy environment file:

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your local database and Redis connection strings.

3. Initialize database:

   ```bash
   psql -U postgres -d chiliopus_notify -f src/db/schema.sql
   ```

4. Install dependencies:

   ```bash
   npm install
   ```

5. Run API server:

   ```bash
   npm run dev
   ```

6. Run worker (in a separate terminal):

   ```bash
   npm run dev:worker
   ```

## API Documentation

Base path: `/notify`

All endpoints require API key authentication via header:
```
Authorization: Bearer YOUR_API_KEY
```

### Queue Email Notification

**POST** `/notify/email`

Request body:

```json
{
  "to": "user@example.com",
  "subject": "Welcome",
  "template": "welcome",
  "variables": {
    "name": "John"
  }
}
```

Response:

```json
{
  "status": "queued",
  "jobId": "uuid"
}
```

### Get Notification Status

**GET** `/notify/status/:jobId`

Response:

```json
{
  "id": "uuid",
  "channel": "email",
  "recipient": "user@example.com",
  "subject": "Welcome",
  "status": "sent",
  "retryCount": 0,
  "maxRetries": 3,
  "errorMessage": null,
  "createdAt": "2024-01-01T00:00:00Z",
  "scheduledAt": null,
  "sentAt": "2024-01-01T00:00:01Z",
  "attempts": [
    {
      "id": 1,
      "notification_id": "uuid",
      "attempt_number": 1,
      "status": "sent",
      "error_message": null,
      "created_at": "2024-01-01T00:00:01Z"
    }
  ]
}
```

### List Templates

**GET** `/templates`

Returns list of all notification templates.

### Get Template

**GET** `/templates/:templateId`

Returns template metadata by ID.

### Webhook Events

**POST** `/webhooks/events`

Receive and store external webhook events.

Request body:

```json
{
  "eventType": "custom.event",
  "notificationId": "uuid",
  "payload": {}
}
```

## Example Usage

### Send Welcome Email

```bash
curl -X POST http://localhost:3000/notify/email \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Welcome to Chiliopus",
    "template": "welcome",
    "variables": {
      "name": "John Doe"
    }
  }'
```

### Check Notification Status

```bash
curl -X GET http://localhost:3000/notify/status/JOB_ID \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Queue Configuration

- **Queue Name**: `notification_queue`
- **Default Attempts**: 3
- **Backoff Strategy**: Exponential (5s base delay)
- **Retry Logic**: Automatic via BullMQ

## Worker Process

The worker service:
1. Consumes jobs from `notification_queue`
2. Loads notification record from database
3. Renders Handlebars template with variables
4. Sends email via SMTP (Google SMTP for dev, Postfix for production)
5. Updates notification status
6. Records delivery attempts
7. Triggers webhook events if configured

## Templates

Email templates are stored in `templates/email/` as Handlebars (`.hbs`) files.

Available templates:
- `welcome.hbs` - Welcome email
- `password-reset.hbs` - Password reset email
- `meeting-scheduled.hbs` - Meeting notification

Template variables are passed via the API request `variables` field.

## Database Schema

The service uses PostgreSQL with the following main tables:
- `notifications` - Notification records
- `notification_attempts` - Delivery attempt history
- `notification_events` - Event log
- `notify_templates` - Template metadata
- `notify_webhooks` - Webhook configurations
- `webhook_deliveries` - Webhook delivery history
- `notification_preferences` - User preferences

See `src/db/schema.sql` for full schema.

## Extending Channels

To add new channels (SMS, WhatsApp, Push, In-app):

1. Extend worker logic in `src/workers/email.worker.ts` (or create channel-specific workers)
2. Add appropriate templates and delivery services
3. Wire API endpoints to create notifications with those channels
4. Update `NotificationChannel` type in `src/models/notification.model.ts`

## Environment Variables

See `.env.example` for all required environment variables:

- `PORT` - API server port (default: 3000)
- `API_KEY` - API authentication key (required)
- `SMTP_HOST` - SMTP server host
  - **Development**: `smtp.gmail.com` (Google SMTP)
  - **Production**: `localhost` (Postfix)
- `SMTP_PORT` - SMTP server port
  - **Development**: `587` (Gmail TLS) or `465` (Gmail SSL)
  - **Production**: `25` (Postfix)
- `SMTP_SECURE` - Use TLS/SSL (`true` for SSL port 465, `false` for TLS/plain)
  - **Development**: `false` for port 587, `true` for port 465
  - **Production**: `false` for port 25
- `SMTP_USER` - SMTP username (optional)
  - **Development**: Your Gmail address (e.g., `your-email@gmail.com`)
  - **Production**: Leave empty (Postfix doesn't require auth)
- `SMTP_PASS` - SMTP password (optional)
  - **Development**: Gmail App Password (16-character password from Google)
  - **Production**: Leave empty (Postfix doesn't require auth)
- `SMTP_FROM` - From email address (optional)
  - **Development**: Your Gmail address or leave empty (uses `SMTP_USER`)
  - **Production**: Your domain email (e.g., `no-reply@yourdomain.com`)
- `REDIS_HOST` - Redis host (default: localhost)
- `REDIS_PORT` - Redis port (default: 6379)
- `DATABASE_URL` - PostgreSQL connection string (required)

### Gmail App Password Setup (Development)

1. Enable 2-Step Verification: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
   - Select App: Mail
   - Select Device: Other → "ChiliopusNotify Dev"
   - Copy the 16-character password
3. Use in `.env`:
   ```
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx
   ```

## Development

### Build

```bash
npm run build
```

### Run Production

```bash
npm start          # API server
npm run start:worker  # Worker service
```

### Linting

```bash
npm run lint
```

## Notes

- **SMTP Configuration**:
  - **Development**: Uses Google SMTP (Gmail) with authentication - no local setup needed
  - **Production**: Uses Postfix on the host (`localhost:25`) - not containerized
  - For Docker deployments, use `host.docker.internal` as `SMTP_HOST` to access host Postfix
- Queue jobs are automatically retried on failure (3 attempts with exponential backoff)
- Webhook events are triggered for `notification.sent` and `notification.failed` events
- All logs are structured JSON via Winston
- The system automatically detects SMTP configuration: if `SMTP_USER` and `SMTP_PASS` are provided, it uses authentication (Gmail); otherwise, it uses Postfix without auth

## License

Proprietary - Chiliopus Platform
