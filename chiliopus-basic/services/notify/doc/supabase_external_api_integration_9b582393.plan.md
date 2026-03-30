---
name: Supabase External API Integration + Notification Service
overview: Create a comprehensive notification REST API service in Node.js with Postfix integration, plus integration methods for Supabase to invoke it. Includes email templates, queue system, retry logic, tracking, and webhooks.
todos:
  - id: create-notification-api
    content: Create Node.js Express/Fastify REST API service structure
    status: pending
  - id: postfix-integration
    content: Implement Postfix SMTP integration using nodemailer
    status: pending
  - id: email-templates
    content: Create email template system with variable substitution
    status: pending
  - id: queue-system
    content: Implement email queue system using Redis or PostgreSQL
    status: pending
  - id: retry-logic
    content: Implement retry logic with exponential backoff
    status: pending
  - id: tracking-system
    content: Create email tracking and delivery status system
    status: pending
  - id: webhook-support
    content: Implement webhook endpoints for delivery notifications
    status: pending
  - id: docker-setup
    content: Create Docker configuration for notification service
    status: pending
  - id: create-edge-function
    content: Create Edge Function example for calling notification API
    status: pending
  - id: enable-pgnet
    content: Create SQL migration to enable pg_net extension and create trigger functions
    status: pending
  - id: configure-auth-hooks
    content: Document auth hooks configuration in docker-compose.yml
    status: pending
  - id: setup-webhooks
    content: Create SQL migration for database webhooks setup
    status: pending
  - id: network-config
    content: Document network configuration options for same VPS setup
    status: pending
  - id: security-guide
    content: Create security best practices guide for API integration
    status: pending
  - id: integration-docs
    content: Create comprehensive integration documentation with examples
    status: pending
    dependencies:
      - create-notification-api
      - postfix-integration
      - email-templates
      - queue-system
      - create-edge-function
      - enable-pgnet
      - configure-auth-hooks
      - setup-webhooks
      - network-config
---

# Supabase External REST API Integration + Notification Service

This plan covers:

1. **Notification REST API Service** - Node.js service with Postfix integration for sending emails
2. **Supabase Integration Methods** - Multiple ways for Supabase to invoke your REST API

## Why Node.js for Notification API?

**Recommendation: Node.js (Express/Fastify)**

**Advantages:**

- ✅ Matches your existing Next.js/TypeScript codebase
- ✅ Shared TypeScript types and interfaces
- ✅ Better async/await support for email operations
- ✅ Rich ecosystem (nodemailer, bullmq, etc.)
- ✅ Easier to maintain single tech stack
- ✅ Better performance for I/O-heavy operations (email sending)

**Python Alternative:**

- FastAPI/Flask would work but requires separate Python environment
- Less code sharing with your Next.js app
- Additional deployment complexity

## Architecture Overview

```mermaid
graph TB
    subgraph Supabase["Supabase Docker Container"]
        DB[(PostgreSQL)]
        Auth[Auth Service]
        EdgeFunc[Edge Functions]
        Webhook[Webhook Extension]
    end
    
    subgraph VPS["Your VPS Server"]
        subgraph NotificationService["Notification API Service<br/>Node.js + Express"]
            API[REST API<br/>Port 3001]
            Queue[Email Queue<br/>Redis/PostgreSQL]
            Worker[Queue Worker]
            Templates[Template Engine]
        end
        
        Postfix[Postfix Mail Server<br/>Port 25/587]
        Redis[(Redis<br/>Optional)]
    end
    
    DB -->|"pg_net/http extension"| API
    Auth -->|"Auth Hooks"| API
    EdgeFunc -->|"HTTP fetch()"| API
    Webhook -->|"HTTP POST"| API
    
    API --> Queue
    Queue --> Worker
    Worker --> Templates
    Worker -->|"SMTP"| Postfix
    Postfix -->|"Email Delivery"| Internet[Internet]
    
    Queue -.->|"Optional"| Redis
    
    style Supabase fill:#4F46E5
    style VPS fill:#10B981
    style NotificationService fill:#F59E0B
    style Postfix fill:#EF4444
```

## Part 1: Notification REST API Service

### Service Structure

**Location:** `deploy/notification-service/`

**Technology Stack:**

- **Runtime:** Node.js 18+ (matches Next.js)
- **Framework:** Express.js or Fastify
- **Email:** Nodemailer (Postfix SMTP)
- **Queue:** BullMQ (Redis) or pg-boss (PostgreSQL)
- **Templates:** Handlebars or EJS
- **Database:** PostgreSQL (shared with Supabase or separate)
- **TypeScript:** Full TypeScript support

### Features

1. **Email Sending**

                                                                                                - Postfix SMTP integration
                                                                                                - HTML and plain text support
                                                                                                - Attachments support
                                                                                                - Multiple recipients (TO, CC, BCC)

2. **Template System**

                                                                                                - Template storage and management
                                                                                                - Variable substitution
                                                                                                - Conditional rendering
                                                                                                - Template versioning

3. **Queue System**

                                                                                                - Async email queuing
                                                                                                - Priority queues
                                                                                                - Scheduled sending
                                                                                                - Batch processing

4. **Retry Logic**

                                                                                                - Exponential backoff
                                                                                                - Configurable retry attempts
                                                                                                - Dead letter queue
                                                                                                - Failure notifications

5. **Tracking**

                                                                                                - Delivery status tracking
                                                                                                - Open tracking (pixel)
                                                                                                - Click tracking
                                                                                                - Bounce handling

6. **Webhooks**

                                                                                                - Delivery status webhooks
                                                                                                - Bounce webhooks
                                                                                                - Open/click webhooks

## Part 2: Supabase Integration Methods

1. **Edge Functions** - Best for: Manual calls, scheduled tasks, complex logic
2. **Database Triggers + pg_net** - Best for: Automatic calls on database events
3. **Auth Hooks** - Best for: Authentication event callbacks
4. **Database Webhooks** - Best for: Simple HTTP POST on database events

## Implementation Steps

### Part 1: Notification API Service Implementation

#### Step 1: Create Project Structure

**Directory Structure:**

```
deploy/notification-service/
├── src/
│   ├── server.ts                 # Express server setup
│   ├── routes/
│   │   ├── email.ts              # Email sending endpoints
│   │   ├── templates.ts          # Template management
│   │   ├── webhooks.ts           # Webhook endpoints
│   │   └── health.ts             # Health check
│   ├── services/
│   │   ├── email.service.ts      # Email sending logic
│   │   ├── template.service.ts  # Template rendering
│   │   ├── queue.service.ts      # Queue management
│   │   └── tracking.service.ts   # Email tracking
│   ├── workers/
│   │   └── email.worker.ts       # Queue worker
│   ├── models/
│   │   ├── email.model.ts        # Email data models
│   │   └── template.model.ts    # Template models
│   ├── config/
│   │   ├── postfix.config.ts     # Postfix configuration
│   │   └── queue.config.ts       # Queue configuration
│   └── utils/
│       ├── logger.ts             # Logging utility
│       └── errors.ts             # Error handling
├── templates/
│   ├── email/                    # Email templates
│   │   ├── welcome.hbs
│   │   ├── password-reset.hbs
│   │   └── notification.hbs
│   └── layouts/
│       └── default.hbs
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── package.json
├── tsconfig.json
└── .env.example
```

#### Step 2: Setup Dependencies

**package.json:**

```json
{
  "name": "notification-service",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "nodemailer": "^6.9.7",
    "bullmq": "^5.1.0",
    "ioredis": "^5.3.2",
    "handlebars": "^4.7.8",
    "zod": "^3.22.4",
    "winston": "^3.11.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/nodemailer": "^6.4.14",
    "@types/node": "^20.11.5",
    "typescript": "^5.3.3",
    "ts-node-dev": "^2.0.0"
  }
}
```

#### Step 3: Postfix Configuration

**Postfix SMTP Setup:**

- Port: 25 (SMTP) or 587 (Submission)
- Authentication: Usually not required for localhost
- TLS: Optional for localhost, required for external

**Environment Variables:**

```env
# Postfix Configuration
SMTP_HOST=localhost
SMTP_PORT=25
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@yourdomain.com
SMTP_FROM_NAME=TSF Club

# Queue Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# API Configuration
API_PORT=3001
API_KEY=your-secure-api-key
JWT_SECRET=your-jwt-secret

# Database (Optional - for tracking)
DATABASE_URL=postgresql://user:pass@localhost:5432/notifications
```

#### Step 4: Email Service Implementation

**src/services/email.service.ts:**

```typescript
import nodemailer from 'nodemailer';
import { EmailOptions, EmailResult } from '../models/email.model';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '25'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      } : undefined,
      tls: {
        rejectUnauthorized: false // For localhost Postfix
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      const mailOptions = {
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM}>`,
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
        headers: {
          'X-Tracking-ID': options.trackingId
        }
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: info.messageId,
        trackingId: options.trackingId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        trackingId: options.trackingId
      };
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }
}
```

#### Step 5: Template Service

**src/services/template.service.ts:**

```typescript
import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';

export class TemplateService {
  private templateCache: Map<string, Handlebars.TemplateDelegate> = new Map();

  async renderTemplate(
    templateName: string,
    variables: Record<string, any>
  ): Promise<string> {
    let template = this.templateCache.get(templateName);
    
    if (!template) {
      const templatePath = path.join(
        __dirname,
        '../../templates/email',
        `${templateName}.hbs`
      );
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      template = Handlebars.compile(templateContent);
      this.templateCache.set(templateName, template);
    }

    return template(variables);
  }

  async renderWithLayout(
    templateName: string,
    variables: Record<string, any>
  ): Promise<{ html: string; text: string }> {
    const content = await this.renderTemplate(templateName, variables);
    const layout = await fs.readFile(
      path.join(__dirname, '../../templates/layouts/default.hbs'),
      'utf-8'
    );
    const layoutTemplate = Handlebars.compile(layout);
    
    return {
      html: layoutTemplate({ ...variables, content }),
      text: this.htmlToText(content)
    };
  }

  private htmlToText(html: string): string {
    // Simple HTML to text conversion
    return html.replace(/<[^>]*>/g, '').trim();
  }
}
```

#### Step 6: Queue System

**src/services/queue.service.ts:**

```typescript
import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { EmailService } from './email.service';
import { TemplateService } from './template.service';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD
});

export const emailQueue = new Queue('email', { connection: redis });

export class QueueService {
  private emailService: EmailService;
  private templateService: TemplateService;

  constructor() {
    this.emailService = new EmailService();
    this.templateService = new TemplateService();
  }

  async addEmailJob(data: {
    to: string;
    template: string;
    variables: Record<string, any>;
    subject: string;
    priority?: number;
    delay?: number;
  }): Promise<string> {
    const job = await emailQueue.add(
      'send-email',
      data,
      {
        priority: data.priority || 0,
        delay: data.delay || 0,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    );
    return job.id!;
  }

  createWorker(): Worker {
    return new Worker(
      'email',
      async (job: Job) => {
        const { to, template, variables, subject } = job.data;
        
        // Render template
        const { html, text } = await this.templateService.renderWithLayout(
          template,
          variables
        );

        // Send email
        const result = await this.emailService.sendEmail({
          to,
          subject,
          html,
          text,
          trackingId: job.id
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        return result;
      },
      { connection: redis }
    );
  }
}
```

#### Step 7: REST API Endpoints

**src/routes/email.ts:**

```typescript
import { Router } from 'express';
import { QueueService } from '../services/queue.service';
import { z } from 'zod';

const router = Router();
const queueService = new QueueService();

const sendEmailSchema = z.object({
  to: z.string().email(),
  cc: z.string().email().optional(),
  bcc: z.string().email().optional(),
  template: z.string(),
  variables: z.record(z.any()),
  subject: z.string(),
  priority: z.number().min(0).max(10).optional(),
  delay: z.number().min(0).optional()
});

router.post('/send', async (req, res) => {
  try {
    const data = sendEmailSchema.parse(req.body);
    const jobId = await queueService.addEmailJob(data);
    
    res.json({
      success: true,
      jobId,
      message: 'Email queued successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/status/:jobId', async (req, res) => {
  // Get job status from queue
  // Implementation here
});

export default router;
```

#### Step 8: Docker Configuration

**docker/Dockerfile:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/server.js"]
```

**docker/docker-compose.yml:**

```yaml
version: '3.8'

services:
  notification-api:
    build: .
    container_name: notification-service
    ports:
                                                                                 - "3001:3001"
    environment:
                                                                                 - SMTP_HOST=host.docker.internal
                                                                                 - SMTP_PORT=25
                                                                                 - REDIS_HOST=redis
                                                                                 - API_PORT=3001
    depends_on:
                                                                                 - redis
    networks:
                                                                                 - notification-network

  redis:
    image: redis:7-alpine
    container_name: notification-redis
    ports:
                                                                                 - "6379:6379"
    networks:
                                                                                 - notification-network

networks:
  notification-network:
    driver: bridge
```

### Part 2: Supabase Integration Methods

#### Method 1: Edge Functions (Recommended for Manual/Scheduled Calls)

**Location:** `deploy/opt/supabase/volumes/functions/`

**Steps:**

1. Create Edge Function directory structure
2. Write Deno function to call your REST API
3. Deploy function to Supabase
4. Configure function authentication (JWT verification)
5. Test function invocation

**Example Function for Notification API:**

```typescript
// deploy/opt/supabase/volumes/functions/send-notification/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const { to, template, variables, subject } = await req.json()
    
    // Call notification API
    const response = await fetch('http://host.docker.internal:3001/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('NOTIFICATION_API_KEY')}`
      },
      body: JSON.stringify({
        to,
        template,
        variables,
        subject,
        priority: 5
      })
    })
    
    const result = await response.json()
    
    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
```

**Network Configuration:**

- If same VPS: Use `host.docker.internal` or Docker network IP
- If different server: Use full URL `http://your-server-ip:port`

### Method 2: Database Triggers + pg_net Extension

**Location:** SQL migration files in `sql/` directory

**Steps:**

1. Enable pg_net extension in PostgreSQL
2. Create PostgreSQL function that calls your API
3. Create trigger on target table
4. Test trigger execution

**Example SQL for Notification API:**

```sql
-- Enable pg_net extension
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function to send notification email
CREATE OR REPLACE FUNCTION send_notification_email()
RETURNS TRIGGER AS $$
DECLARE
  api_url TEXT := 'http://host.docker.internal:3001/api/email/send';
  api_key TEXT := current_setting('app.notification_api_key', true);
  payload JSONB;
BEGIN
  -- Build notification payload
  payload := jsonb_build_object(
    'to', NEW.email,
    'template', 'club-membership-approved',
    'variables', jsonb_build_object(
      'fullName', NEW.full_name,
      'clubName', (SELECT name FROM clubs WHERE id = NEW.club_id)
    ),
    'subject', 'Club Membership Approved'
  );
  
  -- Make HTTP request (async, non-blocking)
  PERFORM net.http_post(
    url := api_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || api_key
    ),
    body := payload::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for club membership approval
CREATE TRIGGER on_club_membership_approved
  AFTER UPDATE ON club_memberships
  FOR EACH ROW
  WHEN (OLD.status = 'pending' AND NEW.status = 'approved')
  EXECUTE FUNCTION send_notification_email();
```

### Use Case: Meeting Scheduled Notification

**Specific Implementation for Meeting Scheduled Emails**

When a meeting is created in the `meeting` table, send email notifications to all active club members.

**SQL Migration: `sql/XXX_meeting-scheduled-notification.sql`**

```sql
-- Enable pg_net extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to send meeting scheduled notification to club members
CREATE OR REPLACE FUNCTION notify_meeting_scheduled()
RETURNS TRIGGER AS $$
DECLARE
  api_url TEXT := 'http://host.docker.internal:3001/api/email/send';
  api_key TEXT := current_setting('app.notification_api_key', true);
  club_name TEXT;
  club_code TEXT;
  meeting_date TEXT;
  meeting_time TEXT;
  member_record RECORD;
  payload JSONB;
  member_count INTEGER := 0;
BEGIN
  -- Get club information
  SELECT name, club_code INTO club_name, club_code
  FROM public.club
  WHERE club_id = NEW.club_id;
  
  -- Format meeting date and time
  meeting_date := TO_CHAR(NEW.scheduled_datetime, 'Month DD, YYYY');
  meeting_time := TO_CHAR(NEW.scheduled_datetime, 'HH24:MI');
  
  -- Get all active club members
  FOR member_record IN
    SELECT DISTINCT p.id, p.email, p.full_name
    FROM public.membership m
    INNER JOIN public.profiles p ON m.appuser_id = p.id
    WHERE m.club_id = NEW.club_id
      AND m.status = 'Active'
      AND p.email IS NOT NULL
      AND p.email != ''
  LOOP
    -- Build notification payload for each member
    payload := jsonb_build_object(
      'to', member_record.email,
      'template', 'meeting-scheduled',
      'variables', jsonb_build_object(
        'fullName', COALESCE(member_record.full_name, 'Member'),
        'clubName', COALESCE(club_name, 'Club'),
        'clubCode', COALESCE(club_code, ''),
        'meetingDate', meeting_date,
        'meetingTime', meeting_time,
        'meetingDateTime', TO_CHAR(NEW.scheduled_datetime, 'YYYY-MM-DD HH24:MI:SS'),
        'venue', COALESCE(NEW.venue, 'TBD'),
        'agenda', COALESCE(NEW.agenda, ''),
        'meetingNumber', NEW.meeting_number,
        'meetingId', NEW.meeting_id
      ),
      'subject', format('Meeting Scheduled: %s - %s', COALESCE(club_name, 'Club'), meeting_date),
      'priority', 5
    );
    
    -- Send notification (async, non-blocking)
    PERFORM net.http_post(
      url := api_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || api_key
      ),
      body := payload::text
    );
    
    member_count := member_count + 1;
  END LOOP;
  
  -- Log notification (optional)
  RAISE NOTICE 'Meeting scheduled notification sent to % members for meeting %', member_count, NEW.meeting_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on meeting table INSERT
DROP TRIGGER IF EXISTS on_meeting_scheduled ON public.meeting;

CREATE TRIGGER on_meeting_scheduled
  AFTER INSERT ON public.meeting
  FOR EACH ROW
  WHEN (NEW.status = 'Scheduled')
  EXECUTE FUNCTION notify_meeting_scheduled();

-- Optional: Also notify on meeting reschedule (UPDATE)
CREATE OR REPLACE FUNCTION notify_meeting_rescheduled()
RETURNS TRIGGER AS $$
DECLARE
  api_url TEXT := 'http://host.docker.internal:3001/api/email/send';
  api_key TEXT := current_setting('app.notification_api_key', true);
  club_name TEXT;
  meeting_date TEXT;
  meeting_time TEXT;
  member_record RECORD;
  payload JSONB;
BEGIN
  -- Only notify if meeting datetime changed
  IF OLD.scheduled_datetime IS DISTINCT FROM NEW.scheduled_datetime THEN
    -- Get club information
    SELECT name INTO club_name
    FROM public.club
    WHERE club_id = NEW.club_id;
    
    -- Format meeting date and time
    meeting_date := TO_CHAR(NEW.scheduled_datetime, 'Month DD, YYYY');
    meeting_time := TO_CHAR(NEW.scheduled_datetime, 'HH24:MI');
    
    -- Get all active club members
    FOR member_record IN
      SELECT DISTINCT p.id, p.email, p.full_name
      FROM public.membership m
      INNER JOIN public.profiles p ON m.appuser_id = p.id
      WHERE m.club_id = NEW.club_id
        AND m.status = 'Active'
        AND p.email IS NOT NULL
        AND p.email != ''
    LOOP
      payload := jsonb_build_object(
        'to', member_record.email,
        'template', 'meeting-rescheduled',
        'variables', jsonb_build_object(
          'fullName', COALESCE(member_record.full_name, 'Member'),
          'clubName', COALESCE(club_name, 'Club'),
          'meetingDate', meeting_date,
          'meetingTime', meeting_time,
          'oldDateTime', TO_CHAR(OLD.scheduled_datetime, 'Month DD, YYYY HH24:MI'),
          'newDateTime', TO_CHAR(NEW.scheduled_datetime, 'Month DD, YYYY HH24:MI'),
          'venue', COALESCE(NEW.venue, 'TBD'),
          'meetingNumber', NEW.meeting_number
        ),
        'subject', format('Meeting Rescheduled: %s - %s', COALESCE(club_name, 'Club'), meeting_date),
        'priority', 6
      );
      
      PERFORM net.http_post(
        url := api_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || api_key
        ),
        body := payload::text
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_meeting_rescheduled
  AFTER UPDATE ON public.meeting
  FOR EACH ROW
  WHEN (NEW.status = 'Scheduled' AND OLD.scheduled_datetime IS DISTINCT FROM NEW.scheduled_datetime)
  EXECUTE FUNCTION notify_meeting_rescheduled();
```

**Email Template: `deploy/notification-service/templates/email/meeting-scheduled.hbs`**

```handlebars
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meeting Scheduled</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
    <h1 style="margin: 0;">Meeting Scheduled</h1>
  </div>
  
  <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px;">
    <p>Dear {{fullName}},</p>
    
    <p>A new meeting has been scheduled for <strong>{{clubName}}</strong>{{#if clubCode}} ({{clubCode}}){{/if}}.</p>
    
    <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4F46E5;">
      <h2 style="margin-top: 0; color: #4F46E5;">Meeting Details</h2>
      <p><strong>Date:</strong> {{meetingDate}}</p>
      <p><strong>Time:</strong> {{meetingTime}}</p>
      {{#if venue}}
      <p><strong>Venue:</strong> {{venue}}</p>
      {{/if}}
      {{#if meetingNumber}}
      <p><strong>Meeting Number:</strong> #{{meetingNumber}}</p>
      {{/if}}
    </div>
    
    {{#if agenda}}
    <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0;">Agenda</h3>
      <p style="white-space: pre-wrap;">{{agenda}}</p>
    </div>
    {{/if}}
    
    <p>Please mark your calendar and make sure to attend this important meeting.</p>
    
    <p style="margin-top: 30px;">
      Best regards,<br>
      <strong>TSF Club Management</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
    <p>This is an automated notification. Please do not reply to this email.</p>
  </div>
</body>
</html>
```

**Email Template: `deploy/notification-service/templates/email/meeting-rescheduled.hbs`**

```handlebars
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meeting Rescheduled</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #F59E0B; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
    <h1 style="margin: 0;">Meeting Rescheduled</h1>
  </div>
  
  <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px;">
    <p>Dear {{fullName}},</p>
    
    <p>The meeting for <strong>{{clubName}}</strong> has been rescheduled.</p>
    
    <div style="background-color: #FEF3C7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #F59E0B;">
      <p style="margin: 5px 0;"><strong>Previous Date/Time:</strong> {{oldDateTime}}</p>
      <p style="margin: 5px 0;"><strong>New Date/Time:</strong> {{newDateTime}}</p>
    </div>
    
    <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4F46E5;">
      <h2 style="margin-top: 0; color: #4F46E5;">Updated Meeting Details</h2>
      <p><strong>Date:</strong> {{meetingDate}}</p>
      <p><strong>Time:</strong> {{meetingTime}}</p>
      {{#if venue}}
      <p><strong>Venue:</strong> {{venue}}</p>
      {{/if}}
      {{#if meetingNumber}}
      <p><strong>Meeting Number:</strong> #{{meetingNumber}}</p>
      {{/if}}
    </div>
    
    <p>Please update your calendar with the new date and time.</p>
    
    <p style="margin-top: 30px;">
      Best regards,<br>
      <strong>TSF Club Management</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
    <p>This is an automated notification. Please do not reply to this email.</p>
  </div>
</body>
</html>
```

**Configuration: Set API Key in PostgreSQL**

```sql
-- Set notification API key (store securely, consider using Supabase secrets)
ALTER DATABASE postgres SET app.notification_api_key = 'your-secure-api-key-here';

-- Or set per session (less secure, for testing)
SET app.notification_api_key = 'your-secure-api-key-here';
```

**Testing the Trigger:**

```sql
-- Test by creating a meeting
INSERT INTO public.meeting (
  club_id,
  scheduled_datetime,
  venue,
  agenda,
  created_by,
  status
) VALUES (
  'your-club-id-here',
  '2024-03-15 18:00:00+00',
  'Main Hall',
  '1. Welcome\n2. Guest Speaker\n3. Q&A',
  'your-user-id-here',
  'Scheduled'
);

-- Check notification API logs to verify emails were sent
```

### Method 3: Auth Hooks (For Authentication Events)

**Location:** `deploy/opt/supabase/docker-compose.yml` (Auth service configuration)

**Steps:**

1. Create Edge Function or PostgreSQL function to handle auth events
2. Configure auth hook in docker-compose.yml
3. Restart Supabase containers
4. Test auth event triggers

**Example Configuration for Notification API:**

```yaml
# In docker-compose.yml auth service
GOTRUE_HOOK_SEND_EMAIL_ENABLED: "true"
GOTRUE_HOOK_SEND_EMAIL_URI: "http://host.docker.internal:3001/api/auth/send-email"
GOTRUE_HOOK_SEND_EMAIL_SECRETS: "your-secret-key"
```

**Notification API Endpoint for Auth Hooks:**

```typescript
// src/routes/webhooks.ts
router.post('/auth/send-email', async (req, res) => {
  // Handle Supabase auth email hook
  const { email, template, variables } = req.body;
  
  await queueService.addEmailJob({
    to: email,
    template: template || 'auth-email',
    variables,
    subject: 'TSF Club - ' + (variables.subject || 'Notification')
  });
  
  res.json({ success: true });
});
```

### Method 4: Database Webhooks (Supabase Webhooks Extension)

**Location:** SQL migration files

**Steps:**

1. Enable webhooks extension (already included in Supabase Docker)
2. Create webhook configuration
3. Test webhook delivery

**Example SQL for Notification API:**

```sql
-- Create webhook for sending notifications
SELECT webhooks.create(
  name := 'club_membership_notification',
  url := 'http://host.docker.internal:3001/api/webhooks/club-membership',
  events := ARRAY['INSERT', 'UPDATE'],
  table_schema := 'public',
  table_name := 'club_memberships',
  headers := jsonb_build_object(
    'Authorization', 'Bearer your-api-key',
    'Content-Type', 'application/json'
  )
);
```

**Notification API Webhook Handler:**

```typescript
// src/routes/webhooks.ts
router.post('/club-membership', async (req, res) => {
  const { event, table, data } = req.body;
  
  if (event === 'UPDATE' && data.status === 'approved') {
    await queueService.addEmailJob({
      to: data.email,
      template: 'club-membership-approved',
      variables: {
        fullName: data.full_name,
        clubName: data.club_name
      },
      subject: 'Club Membership Approved'
    });
  }
  
  res.json({ success: true });
});
```

## Network Configuration

### Same VPS Server Setup

**Option A: Use host.docker.internal**

- Works on Linux with Docker 20.10+
- Add to docker-compose.yml: `extra_hosts: ["host.docker.internal:host-gateway"]`

**Option B: Use Docker Network**

- Create shared Docker network
- Connect both Supabase and your API containers
- Use container name as hostname

**Option C: Use VPS IP Address**

- Use `http://<VPS-IP>:<port>` from Supabase container
- Ensure firewall allows internal connections

## Security Considerations

1. **API Authentication:**

                                                                                                - Store API keys in Supabase secrets/environment variables
                                                                                                - Use JWT tokens for authentication
                                                                                                - Implement rate limiting on your API

2. **Network Security:**

                                                                                                - Use HTTPS if possible (even internally)
                                                                                                - Restrict API access to specific IPs
                                                                                                - Use firewall rules to limit access

3. **Error Handling:**

                                                                                                - Implement retry logic for failed requests
                                                                                                - Log all API calls for debugging
                                                                                                - Set up monitoring/alerting

## Files to Create/Modify

### Notification Service Files

1. **Service Structure:**

                                                                                                - `deploy/notification-service/src/server.ts`
                                                                                                - `deploy/notification-service/src/routes/email.ts`
                                                                                                - `deploy/notification-service/src/services/email.service.ts`
                                                                                                - `deploy/notification-service/src/services/template.service.ts`
                                                                                                - `deploy/notification-service/src/services/queue.service.ts`
                                                                                                - `deploy/notification-service/src/workers/email.worker.ts`

2. **Templates:**

                                                                                                - `deploy/notification-service/templates/email/welcome.hbs`
                                                                                                - `deploy/notification-service/templates/email/password-reset.hbs`
                                                                                                - `deploy/notification-service/templates/email/club-membership-approved.hbs`
                                                                                                - `deploy/notification-service/templates/email/meeting-scheduled.hbs`
                                                                                                - `deploy/notification-service/templates/email/meeting-rescheduled.hbs`

3. **Docker:**

                                                                                                - `deploy/notification-service/docker/Dockerfile`
                                                                                                - `deploy/notification-service/docker/docker-compose.yml`

4. **Configuration:**

                                                                                                - `deploy/notification-service/.env.example`
                                                                                                - `deploy/notification-service/package.json`
                                                                                                - `deploy/notification-service/tsconfig.json`

### Supabase Integration Files

1. **Edge Function:** `deploy/opt/supabase/volumes/functions/send-notification/index.ts`
2. **SQL Migrations:**

            - `sql/XXX_enable-pgnet-and-notification-webhooks.sql` (general setup)
            - `sql/XXX_meeting-scheduled-notification.sql` (meeting notifications)

3. **Documentation:** `doc/NOTIFICATION_SERVICE_INTEGRATION.md`
4. **Example Config:** `.env.example` additions for API keys

## Testing Strategy

### Notification Service Testing

1. **Unit Tests:**

                                                - Email service connection test
                                                - Template rendering tests
                                                - Queue job creation tests

2. **Integration Tests:**

                                                - Send test email via API endpoint
                                                - Verify email delivery through Postfix
                                                - Test queue processing
                                                - Test retry logic

3. **End-to-End Tests:**

                                                - Trigger from Supabase Edge Function
                                                - Trigger from database trigger
                                                - Verify email received

### Supabase Integration Testing

1. Test Edge Function via Supabase Studio or direct HTTP call
2. Test database triggers by inserting test records
3. Test auth hooks by performing auth actions
4. Monitor logs: 

                                                - Notification service: `docker compose logs -f notification-service`
                                                - Supabase: `docker compose logs -f functions db`
                                                - Postfix: `tail -f /var/log/mail.log`

## Postfix Configuration Notes

Since you're using Postfix on your VPS:

1. **Localhost Connection:**

                                                - Notification service connects to `localhost:25`
                                                - No authentication needed for localhost
                                                - Ensure Postfix accepts local connections

2. **Docker Network:**

                                                - If notification service is in Docker, use `host.docker.internal:25`
                                                - Or connect to VPS IP address
                                                - May need to configure Postfix to accept connections from Docker network

3. **Postfix Configuration:**
   ```bash
   # /etc/postfix/main.cf
   inet_interfaces = localhost, 127.0.0.1
   myhostname = yourdomain.com
   mydomain = yourdomain.com
   myorigin = $mydomain
   ```

4. **Testing Postfix:**
   ```bash
   # Test SMTP connection
   telnet localhost 25
   
   # Send test email
   echo "Test email" | mail -s "Test" your@email.com
   ```


## Implementation Priority

### Phase 1: Notification Service (Week 1)

1. ✅ Create Node.js project structure
2. ✅ Setup Postfix SMTP integration
3. ✅ Implement basic email sending
4. ✅ Create template system
5. ✅ Setup Docker configuration

### Phase 2: Queue & Advanced Features (Week 2)

1. ✅ Implement Redis queue system
2. ✅ Add retry logic
3. ✅ Create tracking system
4. ✅ Add webhook endpoints
5. ✅ Setup monitoring and logging

### Phase 3: Supabase Integration (Week 3)

1. ✅ Create Edge Function for notifications
2. ✅ Setup database triggers with pg_net
3. ✅ **Implement meeting scheduled notification trigger**
4. ✅ Configure auth hooks
5. ✅ Setup database webhooks
6. ✅ Test all integration methods
7. ✅ Test meeting notification flow end-to-end

### Phase 4: Production Readiness (Week 4)

1. ✅ Security hardening
2. ✅ Performance optimization
3. ✅ Error handling and alerting
4. ✅ Documentation
5. ✅ Deployment and monitoring

## Next Steps

1. **Start with Notification Service:**

                                                - Create project structure
                                                - Setup Postfix connection
                                                - Implement basic email sending
                                                - Create meeting-scheduled email template

2. **Then Integrate with Supabase:**

                                                - Enable pg_net extension
                                                - Create meeting scheduled notification trigger
                                                - Set up network connectivity
                                                - Test meeting notification flow

3. **Add Advanced Features:**

                                                - Queue system for reliability
                                                - Retry logic for failures
                                                - Tracking for monitoring
                                                - Meeting rescheduled notifications

4. **Production Deployment:**

                                                - Security review (API keys, database settings)
                                                - Performance testing (bulk notifications)
                                                - Monitoring setup
                                                - Documentation

## Meeting Notification Quick Start

**Priority Implementation Steps:**

1. **Create notification API service** (from Part 1)
2. **Create meeting-scheduled.hbs template**
3. **Run SQL migration** to enable pg_net and create trigger
4. **Set notification API key** in PostgreSQL
5. **Test** by creating a meeting in Supabase Studio
6. **Verify** emails are sent to all club members

**Key Points:**

- Trigger fires automatically on INSERT to `meeting` table
- Sends to all active club members (from `membership` table)
- Uses async HTTP calls (non-blocking)
- Includes meeting details: date, time, venue, agenda
- Supports meeting rescheduling notifications