const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as',
  'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'cannot',
  'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during',
  'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having',
  'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his',
  'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s',
  'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off',
  'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t',
  'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s',
  'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d',
  'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very',
  'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when',
  'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t',
  'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

/**
 * Tokenize string into lowercase alphanumeric words, filtering out common stopwords
 * @param {string} text
 * @returns {string[]}
 */
const tokenize = (text) => {
  if (!text) return [];
  const words = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
  return words;
};

/**
 * Score a document's extracted text against query tokens
 * @param {string} text - Document extracted text
 * @param {string[]} queryTokens - Tokenized query
 * @param {string} originalQuery - Raw query string
 * @param {string} documentName - Original file name
 * @returns {{ score: number, matchedSentences: string[], matchedTokens: string[] }}
 */
const scoreDocument = (text, queryTokens, originalQuery, documentName = '') => {
  if (!text || queryTokens.length === 0) {
    return { score: 0, matchedSentences: [], matchedTokens: [] };
  }

  const lowerText = text.toLowerCase();
  const lowerName = documentName.toLowerCase();
  const matchedTokens = new Set();
  let score = 0;

  // Exact whole query match bonus
  if (originalQuery && lowerText.includes(originalQuery.trim().toLowerCase())) {
    score += 50;
  }

  // Split text into sentences/paragraphs
  const sentences = text
    .split(/(?<=[.?!])\s+|\n{2,}/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  const scoredSentences = [];

  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    let sentenceScore = 0;

    for (const token of queryTokens) {
      if (lowerSentence.includes(token)) {
        matchedTokens.add(token);
        // Term frequency bonus within sentence
        const count = (lowerSentence.match(new RegExp(`\\b${token}`, 'gi')) || []).length;
        sentenceScore += count * 5;
      }
    }

    if (sentenceScore > 0) {
      scoredSentences.push({ sentence, score: sentenceScore });
    }
  }

  // Sort sentences by relevance
  scoredSentences.sort((a, b) => b.score - a.score);

  // Accumulate total score
  const sentenceTotal = scoredSentences.reduce((acc, curr) => acc + curr.score, 0);
  score += sentenceTotal;

  // Name match bonus
  for (const token of queryTokens) {
    if (lowerName.includes(token)) {
      score += 15;
    }
  }

  // Ratio of matched tokens bonus
  if (queryTokens.length > 0) {
    const coverageRatio = matchedTokens.size / queryTokens.length;
    score += Math.round(coverageRatio * 30);
  }

  return {
    score,
    matchedSentences: scoredSentences.slice(0, 5).map((s) => s.sentence),
    matchedTokens: Array.from(matchedTokens),
  };
};

/**
 * Searches stored documents, ranks them, and builds context for QA.
 * @param {string} question - User question
 * @param {Array<object>} documents - List of Document records
 * @param {number} topK - Max documents to include in context
 * @returns {{ rankedDocuments: Array<object>, context: string, sources: Array<object> }}
 */
const retrieveRelevantDocuments = (question, documents, topK = 3) => {
  if (!question || !documents || documents.length === 0) {
    return { rankedDocuments: [], context: '', sources: [] };
  }

  const queryTokens = tokenize(question);

  const scoredDocs = documents.map((doc) => {
    const { score, matchedSentences, matchedTokens } = scoreDocument(
      doc.extractedText || '',
      queryTokens,
      question,
      doc.originalName
    );

    return {
      document: doc,
      score,
      matchedSentences,
      matchedTokens,
    };
  });

  // Sort by score descending
  scoredDocs.sort((a, b) => b.score - a.score);

  // If top document has score > 0, filter only documents with non-zero relevance
  let candidates = scoredDocs.filter((item) => item.score > 0);

  // If no document has positive keyword match, fall back to the newest documents so context can still attempt answering
  if (candidates.length === 0) {
    candidates = scoredDocs.slice(0, topK);
  } else {
    candidates = candidates.slice(0, topK);
  }

  // Build sources array adhering strictly to requirement:
  // sources: [{ _id, originalName }]
  const sources = candidates
    .filter((item) => item.score > 0 || scoredDocs.length === 1)
    .map((item) => ({
      _id: item.document._id.toString(),
      originalName: item.document.originalName,
    }));

  // Build unified text context
  const contextParts = candidates.map((item, index) => {
    const docName = item.document.originalName;
    const body =
      item.matchedSentences.length > 0
        ? item.matchedSentences.join('\n')
        : (item.document.extractedText || '').slice(0, 1500);

    return `--- Document [${index + 1}]: ${docName} ---\n${body}`;
  });

  const context = contextParts.join('\n\n');

  return {
    rankedDocuments: candidates,
    context,
    sources,
  };
};

module.exports = {
  tokenize,
  scoreDocument,
  retrieveRelevantDocuments,
};
