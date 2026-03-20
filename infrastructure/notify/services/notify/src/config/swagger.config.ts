import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { config } from './env.config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'ChiliopusNotify API',
      version: '1.0.0',
      description: 'Notification Service API for the Chiliopus Platform (CRM, LMS, POS)',
      contact: {
        name: 'Chiliopus Platform',
        email: 'support@chiliopus.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Local development server'
      },
      {
        url: 'https://api.chiliopus.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'API Key authentication. Format: Bearer YOUR_API_KEY'
        }
      }
    },
    security: [
      {
        ApiKeyAuth: []
      }
    ],
    tags: [
      {
        name: 'Notifications',
        description: 'Notification endpoints for email, SMS, and push notifications'
      },
      {
        name: 'Templates',
        description: 'Email template management'
      },
      {
        name: 'Webhooks',
        description: 'Webhook event handling'
      }
    ]
  },
  apis: [
    // In Docker, __dirname points to dist/config, so we need to go up to dist, then to src
    // For development: src/routes/*.ts
    // For production Docker: src/routes/*.ts (copied from builder stage)
    path.join(__dirname, '../../src/routes/*.ts'),
    path.join(__dirname, '../../src/controllers/*.ts'),
    // Fallback for local development (if running from src)
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../controllers/*.ts')
  ] // Paths to files containing OpenAPI definitions
};

export const swaggerSpec = swaggerJsdoc(options);
