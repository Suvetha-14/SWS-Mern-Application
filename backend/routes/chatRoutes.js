const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

/**
 * @openapi
 * /api/chat/ask:
 *   post:
 *     summary: Ask a question about uploaded documents
 *     description: Retrieves the most relevant documents using keyword matching, creates context, and generates an AI answer with cited sources.
 *     tags: [AI Assistant]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatRequest'
 *     responses:
 *       200:
 *         description: AI-generated answer with source document citations
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatResponse'
 *       400:
 *         description: Empty or missing question in request body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/ask', chatController.ask);

module.exports = router;
