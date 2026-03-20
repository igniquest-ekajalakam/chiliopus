import { Router } from 'express';
import { listAllTemplates, getTemplate } from '../controllers/template.controller';

const router = Router();

// Base path: /templates

/**
 * @swagger
 * /templates:
 *   get:
 *     summary: List all notification templates
 *     description: Retrieve a list of all available notification templates stored in the database
 *     tags: [Templates]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: List of templates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                     example: 123e4567-e89b-12d3-a456-426614174000
 *                   channel:
 *                     type: string
 *                     enum: [email, sms, whatsapp, push, in_app]
 *                     example: email
 *                   name:
 *                     type: string
 *                     example: welcome
 *                     description: Template name/identifier
 *                   description:
 *                     type: string
 *                     example: Welcome email template
 *                     description: Template description
 *                   file_path:
 *                     type: string
 *                     example: templates/email/welcome.hbs
 *                     description: Path to template file
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     example: 2024-01-01T00:00:00Z
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *                     example: 2024-01-01T00:00:00Z
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
router.get('/', listAllTemplates);

/**
 * @swagger
 * /templates/{templateId}:
 *   get:
 *     summary: Get template by ID
 *     description: Retrieve template details by template ID
 *     tags: [Templates]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Template UUID
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: Template details retrieved successfully
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
 *                 name:
 *                   type: string
 *                   example: welcome
 *                 description:
 *                   type: string
 *                   example: Welcome email template
 *                 file_path:
 *                   type: string
 *                   example: templates/email/welcome.hbs
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-01T00:00:00Z
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-01T00:00:00Z
 *       404:
 *         description: Template not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Template not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:templateId', getTemplate);

export default router;
