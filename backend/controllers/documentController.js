const mongoose = require('mongoose');
const fs = require('fs');
const Document = require('../models/Document');
const { saveDocument, deleteDocument } = require('../services/documentService');

/**
 * Upload a new document file (.txt, .md, .json)
 * POST /api/documents/upload
 */
const upload = async (req, res, next) => {
  try {
    if (req.fileValidationError) {
      return res.status(400).json({
        error: req.fileValidationError,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided. Please attach a document file (.txt, .md, .json).',
      });
    }

    const document = await saveDocument(req.file);

    return res.status(201).json({
      message: 'Document uploaded and indexed successfully.',
      document: {
        _id: document._id,
        originalName: document.originalName,
        fileName: document.fileName,
        mimeType: document.mimeType,
        fileExtension: document.fileExtension,
        size: document.size,
        wordCount: document.wordCount,
        characterCount: document.characterCount,
        createdAt: document.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all documents, newest first
 * GET /api/documents
 */
const list = async (req, res, next) => {
  try {
    const documents = await Document.find()
      .sort({ createdAt: -1 })
      .select('-extractedText'); // Exclude large raw text for list performance

    return res.status(200).json({
      count: documents.length,
      documents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get document details including full extracted text
 * GET /api/documents/:id
 */
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: `Invalid document ID format: '${id}'`,
      });
    }

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        error: `Document with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({ document });
  } catch (error) {
    next(error);
  }
};

/**
 * Download original document file
 * GET /api/documents/:id/download
 */
const download = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: `Invalid document ID format: '${id}'`,
      });
    }

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        error: `Document with ID '${id}' not found.`,
      });
    }

    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        error: 'The requested document file could not be found on the storage disk.',
      });
    }

    // Set headers and send file as download attachment
    return res.download(document.filePath, document.originalName, (err) => {
      if (err && !res.headersSent) {
        return next(err);
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a document and its file
 * DELETE /api/documents/:id
 */
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: `Invalid document ID format: '${id}'`,
      });
    }

    const deleted = await deleteDocument(id);

    if (!deleted) {
      return res.status(404).json({
        error: `Document with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({
      message: 'Document and associated file deleted successfully.',
      id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upload,
  list,
  getById,
  download,
  remove,
};
