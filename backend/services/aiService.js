const https = require('https');

/**
 * Intelligent Mock/Fallback generator that constructs natural, accurate answers
 * based on question intent and matched document passages.
 *
 * @param {string} question
 * @param {Array<object>} rankedDocs
 * @param {string} context
 * @returns {string}
 */
const generateFallbackAnswer = (question, rankedDocs, context) => {
  if (!rankedDocs || rankedDocs.length === 0 || !context || context.trim() === '') {
    return "I couldn't find any relevant documents to answer your question. Please upload relevant documents first.";
  }

  // Filter documents that had positive relevance score
  const matchedDocs = rankedDocs.filter((d) => d.score > 0);

  if (matchedDocs.length === 0) {
    return `Based on the uploaded documents (${rankedDocs.map((d) => d.document.originalName).join(', ')}), I couldn't find specific information directly addressing "${question}". Try refining your question with keywords present in your files.`;
  }

  // Collect top matched sentences across the best documents
  const allMatchedSentences = [];
  for (const doc of matchedDocs) {
    if (doc.matchedSentences && doc.matchedSentences.length > 0) {
      for (const sentence of doc.matchedSentences) {
        if (!allMatchedSentences.includes(sentence)) {
          allMatchedSentences.push(sentence);
        }
      }
    }
  }

  if (allMatchedSentences.length > 0) {
    // Pick the most salient 1-3 sentences
    const primaryPassage = allMatchedSentences.slice(0, 3).join(' ');
    const sourceNames = matchedDocs.map((d) => d.document.originalName).join(', ');

    return `Based on ${sourceNames}:\n\n${primaryPassage}`;
  }

  // If no individual sentences matched, grab the first paragraph of top document
  const topText = matchedDocs[0].document.extractedText || '';
  const firstParagraph = topText.split('\n\n')[0] || topText.slice(0, 300);

  return `According to ${matchedDocs[0].document.originalName}:\n\n${firstParagraph}`;
};

/**
 * Optional Gemini API Call if GEMINI_API_KEY is configured
 */
const callGeminiAPI = async (apiKey, question, context) => {
  const prompt = `You are a helpful document assistant. Answer the user's question accurately using ONLY the context provided below. If the answer cannot be found in the context, say "I could not find information about that in the provided documents."\n\nContext:\n${context}\n\nQuestion:\n${question}\n\nAnswer:`;

  const payload = JSON.stringify({
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  });

  return new Promise((resolve, reject) => {
    const url = new URL(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
    );

    const req = https.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 10000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            const answer = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (answer) {
              resolve(answer.trim());
            } else {
              reject(new Error(parsed?.error?.message || 'Empty response from Gemini'));
            }
          } catch (e) {
            reject(e);
          }
        });
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Gemini API request timed out'));
    });

    req.write(payload);
    req.end();
  });
};

/**
 * Generates an answer to the question using the retrieved context.
 *
 * @param {string} question
 * @param {Array<object>} rankedDocs
 * @param {string} context
 * @param {Array<object>} sources
 * @returns {Promise<{ answer: string, sources: Array<{ _id: string, originalName: string }> }>}
 */
const generateAnswer = async (question, rankedDocs, context, sources) => {
  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey && geminiKey.trim() !== '') {
    try {
      const llmAnswer = await callGeminiAPI(geminiKey.trim(), question, context);
      return {
        answer: llmAnswer,
        sources,
      };
    } catch (llmError) {
      console.warn('[AIService] Gemini API error, falling back to local synthesizer:', llmError.message);
    }
  }

  // Fallback / Mock AI engine (fully functional without external credentials)
  const fallbackAnswer = generateFallbackAnswer(question, rankedDocs, context);

  return {
    answer: fallbackAnswer,
    sources,
  };
};

module.exports = {
  generateFallbackAnswer,
  generateAnswer,
};
