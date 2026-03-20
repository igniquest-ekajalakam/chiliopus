import { Router } from 'express';
import {
  postEmailNotify,
  postSmsNotify,
  postPushNotify,
  getNotificationStatus
} from '../controllers/notify.controller';

const router = Router();

// Base path: /notify

/**
 * @swagger
 * /notify/email:
 *   post:
 *     summary: Queue an email notification
 *     description: Queues an email notification for asynchronous delivery via worker
 *     tags: [Notifications]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - subject
 *               - template
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *                 description: Recipient email address
 *               subject:
 *                 type: string
 *                 example: Welcome to Chiliopus
 *                 description: Email subject line
 *               template:
 *                 type: string
 *                 example: welcome
 *                 description: Template name (e.g., welcome, password-reset, meeting-scheduled)
 *               variables:
 *                 type: object
 *                 additionalProperties: true
 *                 example:
 *                   name: John Doe
 *                   resetLink: https://app.chiliopus.com/reset?token=abc123
 *                 description: Template variables for dynamic content
 *     responses:
 *       202:
 *         description: Notification queued successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: queued
 *                 jobId:
 *                   type: string
 *                   format: uuid
 *                   example: 123e4567-e89b-12d3-a456-426614174000
 *       400:
 *         description: Validation error - invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid email address
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 */
router.post('/email', postEmailNotify);

/**
 * @swagger
 * /notify/sms:
 *   post:
 *     summary: Queue an SMS notification
 *     description: Queues an SMS notification (not yet implemented)
 *     tags: [Notifications]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - message
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+919876543210"
 *                 description: Recipient phone number in E.164 format
 *               message:
 *                 type: string
 *                 example: Your verification code is 123456
 *                 description: SMS message content
 *     responses:
 *       501:
 *         description: Not implemented
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: SMS notifications not implemented yet
 *       401:
 *         description: Unauthorized
 */
router.post('/sms', postSmsNotify);

/**
 * @swagger
 * /notify/push:
 *   post:
 *     summary: Queue a push notification
 *     description: Queues a push notification (not yet implemented)
 *     tags: [Notifications]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceToken
 *               - title
 *               - message
 *             properties:
 *               deviceToken:
 *                 type: string
 *                 example: device-token-here
 *                 description: Device push notification token
 *               title:
 *                 type: string
 *                 example: New Notification
 *                 description: Push notification title
 *               message:
 *                 type: string
 *                 example: You have a new message
 *                 description: Push notification message body
 *               data:
 *                 type: object
 *                 additionalProperties: true
 *                 description: Additional data payload
 *     responses:
 *       501:
 *         description: Not implemented
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Push notifications not implemented yet
 *       401:
 *         description: Unauthorized
 */
router.post('/push', postPushNotify);

/**
 * @swagger
 * /notify/status/{jobId}:
 *   get:
 *     summary: Get notification status
 *     description: Retrieve notification status and delivery attempt history
 *     tags: [Notifications]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Notification job ID returned from queue operation
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: Notification status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: 123e4567-e89b-12d3-a456-426614174000
 *                 channel:
 *                   type: string
 *                   enum: [email, sms, whatsapp, push, in_app]
 *                   example: email
 *                 recipient:
 *                   type: string
 *                   example: user@example.com
 *                 subject:
 *                   type: string
 *                   example: Welcome to Chiliopus
 *                 status:
 *                   type: string
 *                   enum: [pending, queued, processing, sent, failed, cancelled]
 *                   example: sent
 *                 retryCount:
 *                   type: integer
 *                   example: 0
 *                 maxRetries:
 *                   type: integer
 *                   example: 3
 *                 errorMessage:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-01T00:00:00Z
 *                 scheduledAt:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 sentAt:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                   example: 2024-01-01T00:00:01Z
 *                 attempts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       notification_id:
 *                         type: string
 *                         format: uuid
 *                       attempt_number:
 *                         type: integer
 *                       status:
 *                         type: string
 *                       error_message:
 *                         type: string
 *                         nullable: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: Notification not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Notification not found
 *       401:
 *         description: Unauthorized
 */
router.get('/status/:jobId', getNotificationStatus);

export default router;
