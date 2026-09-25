const Document = require('../models/Document');
const { retrieveRelevantDocuments } = require('../services/retrievalService');
const { generateAnswer } = require('../services/aiService');

/**
 * Handle AI-powered question answering across uploaded documents
 * POST /api/chat/ask
 */
const ask = async (req, res, next) => {
  try {
    const { question } = req.body;

    // Validate that question is present and non-empty
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({
        error: 'Question is required and cannot be empty.',
      });
    }

    const trimmedQuestion = question.trim();

    // Fetch all stored documents with their extracted text
    const allDocuments = await Document.find();

    if (allDocuments.length === 0) {
      return res.status(200).json({
        answer: 'No documents have been uploaded yet. Please upload at least one document (.txt, .md, or .json) so I can answer questions about it.',
        sources: [],
      });
    }

    // Step 1: Search and rank relevant documents, build context & sources
    const { rankedDocuments, context, sources } = retrieveRelevantDocuments(
      trimmedQuestion,
      allDocuments,
      3
    );

    // Step 2: Generate answer using AI provider or smart fallback synthesizer
    const result = await generateAnswer(trimmedQuestion, rankedDocuments, context, sources);

    // Step 3: Return response in the required exact format
    return res.status(200).json({
      answer: result.answer,
      sources: result.sources,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  ask,
};
