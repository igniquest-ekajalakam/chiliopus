import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.config';
import notifyRoutes from './routes/notify.routes';
import templateRoutes from './routes/template.routes';
import webhookRoutes from './routes/webhook.routes';
import { apiKeyAuth } from './middleware/auth.middleware';
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './config/logger.config';

/**
 * Create and configure Express application
 */
export function createApp() {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(requestLogger);

  // Swagger UI - accessible without authentication (public documentation)
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'ChiliopusNotify API Documentation'
  }));

  // Swagger JSON endpoint
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Protect all API routes with API key authentication
  app.use(apiKeyAuth);

  // Routes
  app.use('/notify', notifyRoutes);
  app.use('/templates', templateRoutes);
  app.use('/webhooks', webhookRoutes);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}
