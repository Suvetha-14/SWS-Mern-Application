const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { upload } = require('../middleware/upload');

/**
 * @openapi
 * /api/documents/upload:
 *   post:
 *     summary: Upload a new document file (.txt, .md, .json)
 *     description: Accepts a document file, validates extension/size, extracts text content, and persists metadata.
 *     tags: [Documents]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Document file to upload (.txt, .md, .json)
 *     responses:
 *       201:
 *         description: Document successfully uploaded and indexed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: Invalid file format, missing file, or file too large
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/upload', upload.single('file'), documentController.upload);

/**
 * @openapi
 * /api/documents:
 *   get:
 *     summary: List all uploaded documents
 *     description: Returns all uploaded documents sorted with newest first.
 *     tags: [Documents]
 *     responses:
 *       200:
 *         description: List of documents
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DocumentListResponse'
 */
router.get('/', documentController.list);

/**
 * @openapi
 * /api/documents/{id}:
 *   get:
 *     summary: Get document details and extracted text
 *     description: Fetches complete document metadata along with extracted text preview.
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB Document ID
 *     responses:
 *       200:
 *         description: Document details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 document:
 *                   $ref: '#/components/schemas/DocumentDetail'
 *       400:
 *         description: Invalid Document ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', documentController.getById);

/**
 * @openapi
 * /api/documents/{id}/download:
 *   get:
 *     summary: Download an uploaded document
 *     description: Streams the original file as an attachment download.
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB Document ID
 *     responses:
 *       200:
 *         description: Binary file stream attachment
 *       400:
 *         description: Invalid Document ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Document or physical file not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id/download', documentController.download);

/**
 * @openapi
 * /api/documents/{id}:
 *   delete:
 *     summary: Delete a document and its file
 *     description: Removes document metadata from MongoDB and unlinks file from local storage.
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB Document ID
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Document and associated file deleted successfully.
 *                 id:
 *                   type: string
 *                   example: 65f1234567890abcdef12345
 *       400:
 *         description: Invalid Document ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', documentController.remove);

module.exports = router;
