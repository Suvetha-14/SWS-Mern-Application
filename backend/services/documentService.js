const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const Document = require('../models/Document');

/**
 * Extracts plain text content from uploaded file based on format.
 * @param {string} filePath
 * @param {string} extension
 * @returns {Promise<string>}
 */
const extractTextFromFile = async (filePath, extension) => {
  const content = await fs.readFile(filePath, 'utf8');

  switch (extension.toLowerCase()) {
    case '.json': {
      try {
        const parsed = JSON.parse(content);
        // Convert JSON to formatted string representation for natural retrieval
        return JSON.stringify(parsed, null, 2);
      } catch (err) {
        // If not strictly valid JSON, return raw text content
        return content;
      }
    }
    case '.md':
    case '.txt':
    default:
      return content;
  }
};

/**
 * Computes word count and character count from text
 * @param {string} text
 * @returns {{ wordCount: number, characterCount: number }}
 */
const calculateMetrics = (text) => {
  if (!text || typeof text !== 'string') {
    return { wordCount: 0, characterCount: 0 };
  }
  const clean = text.trim();
  const characterCount = clean.length;
  const words = clean.split(/\s+/).filter(Boolean);
  return {
    wordCount: words.length,
    characterCount,
  };
};

/**
 * Process and save an uploaded file to the database.
 * @param {object} file - Multer file object
 * @returns {Promise<Document>}
 */
const saveDocument = async (file) => {
  const ext = path.extname(file.originalname).toLowerCase();
  let extractedText = '';

  try {
    extractedText = await extractTextFromFile(file.path, ext);
  } catch (extractError) {
    console.warn(`[DocumentService] Text extraction warning for ${file.originalname}:`, extractError.message);
    extractedText = '';
  }

  const { wordCount, characterCount } = calculateMetrics(extractedText);

  try {
    const document = await Document.create({
      originalName: file.originalname,
      fileName: file.filename,
      filePath: file.path,
      mimeType: file.mimetype || 'application/octet-stream',
      fileExtension: ext,
      size: file.size,
      extractedText,
      characterCount,
      wordCount,
    });

    return document;
  } catch (dbError) {
    // Clean up uploaded file if DB save fails
    if (fsSync.existsSync(file.path)) {
      await fs.unlink(file.path).catch(() => {});
    }
    throw dbError;
  }
};

/**
 * Delete a document from MongoDB and remove physical file from disk.
 * @param {string} documentId
 * @returns {Promise<Document>}
 */
const deleteDocument = async (documentId) => {
  const document = await Document.findById(documentId);
  if (!document) {
    return null;
  }

  // Remove physical file
  if (document.filePath && fsSync.existsSync(document.filePath)) {
    try {
      await fs.unlink(document.filePath);
    } catch (err) {
      console.warn(`[DocumentService] Could not remove physical file ${document.filePath}:`, err.message);
    }
  }

  await Document.findByIdAndDelete(documentId);
  return document;
};

module.exports = {
  extractTextFromFile,
  calculateMetrics,
  saveDocument,
  deleteDocument,
};
