const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const Document = require('../models/Document');

/**
 * Checks if a buffer represents a ZIP or DOCX file (PK\x03\x04 header)
 */
const isZipOrDocx = (buffer) => {
  if (!buffer || buffer.length < 4) return false;
  return buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04;
};

/**
 * Checks if a buffer represents a PDF file (%PDF- header)
 */
const isPdf = (buffer) => {
  if (!buffer || buffer.length < 4) return false;
  return buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
};

/**
 * Extracts plain text content from uploaded file based on format and magic bytes.
 * Handles .txt, .md, .json, .docx, .pdf, as well as Word/PDF files renamed to .txt!
 *
 * @param {string} filePath
 * @param {string} extension
 * @returns {Promise<string>}
 */
const extractTextFromFile = async (filePath, extension) => {
  const buffer = await fs.readFile(filePath);
  const ext = (extension || '').toLowerCase();

  // 1. Check for Word Document (.docx) or a ZIP/DOCX renamed as .txt
  if (ext === '.docx' || isZipOrDocx(buffer)) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      if (result && result.value && result.value.trim().length > 0) {
        return result.value.trim();
      }
    } catch (docxErr) {
      console.warn(`[DocumentService] Mammoth extraction failed for ${filePath}:`, docxErr.message);
    }
  }

  // 2. Check for PDF Document (.pdf) or a PDF renamed as .txt
  if (ext === '.pdf' || isPdf(buffer)) {
    try {
      const pdfParse = require('pdf-parse');
      const pdfData = await pdfParse(buffer);
      if (pdfData && pdfData.text && pdfData.text.trim().length > 0) {
        return pdfData.text.trim();
      }
    } catch (pdfErr) {
      console.warn(`[DocumentService] PDF extraction failed for ${filePath}:`, pdfErr.message);
    }
  }

  // 3. Check for JSON format
  if (ext === '.json') {
    try {
      const content = buffer.toString('utf8');
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed, null, 2);
    } catch (jsonErr) {
      // Fall through to plain text if JSON parsing fails
    }
  }

  // 4. Default: Plain text (.txt, .md, or other)
  // Sanitize non-printable binary characters to prevent corrupted diamond question marks
  const rawText = buffer.toString('utf8');
  const cleanText = rawText
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return cleanText || rawText;
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
