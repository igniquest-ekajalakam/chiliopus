import { Router } from 'express';
import { receiveWebhookEvent } from '../controllers/webhook.controller';

const router = Router();

// Base path: /webhooks

/**
 * @swagger
 * /webhooks/events:
 *   post:
 *     summary: Receive webhook event
 *     description: Receive and store external webhook events for notification tracking
 *     tags: [Webhooks]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventType
 *             properties:
 *               eventType:
 *                 type: string
 *                 example: custom.event
 *                 description: Type of webhook event
 *               notificationId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *                 description: Optional notification ID if event is related to a notification
 *               payload:
 *                 type: object
 *                 additionalProperties: true
 *                 default: {}
 *                 example:
 *                   key1: value1
 *                   key2: value2
 *                 description: Additional event data as key-value pairs
 *     responses:
 *       200:
 *         description: Event received and stored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: received
 *       400:
 *         description: Validation error - invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid request body
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 */
router.post('/events', receiveWebhookEvent);

export default router;
